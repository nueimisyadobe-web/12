import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Deposit, Profile, VipPlan } from '../../lib/types';
import { Card, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { Check, X, Image } from 'lucide-react';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<(Deposit & { profile?: Profile, plan?: VipPlan })[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, [filter]);

  const fetchDeposits = async () => {
    setLoading(true);
    let query = supabase.from('deposits').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    if (data) {
      const userIds = [...new Set(data.map(d => d.user_id))];
      const planIds = [...new Set(data.map(d => d.plan_id).filter(Boolean))] as string[];

      const [profilesRes, plansRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', userIds),
        supabase.from('vip_plans').select('*').in('id', planIds),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]));
      const planMap = new Map(plansRes.data?.map(p => [p.id, p]));

      setDeposits(data.map(d => ({
        ...d,
        profile: profileMap.get(d.user_id),
        plan: d.plan_id ? planMap.get(d.plan_id) : undefined,
      })) as any[]);
    }
    setLoading(false);
  };

  const handleDeposit = async (depositId: string, action: 'approved' | 'rejected', note?: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return;

    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    // Update deposit status
    const { error } = await supabase.from('deposits').update({
      status: action,
      admin_note: note || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    }).eq('id', depositId);

    if (error) return;

    if (action === 'approved' && deposit.plan_id) {
      // Create membership
      const plan = deposit.plan;
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.lock_duration_days);

        await supabase.from('memberships').insert({
          user_id: deposit.user_id,
          plan_id: deposit.plan_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          locked_amount: deposit.amount,
          status: 'active',
        });

        // Update wallet - add to locked balance
        const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', deposit.user_id).maybeSingle();
        if (wallet) {
          await supabase.from('wallets').update({
            locked_balance: Number(wallet.locked_balance) + Number(deposit.amount),
            total_deposited: Number(wallet.total_deposited) + Number(deposit.amount),
          }).eq('id', wallet.id);
        }

        // Record transaction
        await supabase.from('transactions').insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount: deposit.amount,
          status: 'completed',
          reference_id: depositId,
          reference_type: 'deposit',
          description: `${plan.name} membership deposit`,
        });

        // Check referral reward
        const { data: profile } = await supabase.from('profiles').select('referred_by').eq('id', deposit.user_id).maybeSingle();
        if (profile?.referred_by) {
          const { data: refSettings } = await supabase.from('admin_settings').select('value').eq('key', 'referral_reward').maybeSingle();
          const rewardAmount = refSettings ? parseFloat(refSettings.value) : 5;

          // Update referral
          const { data: referral } = await supabase.from('referrals').select('*')
            .eq('referrer_id', profile.referred_by)
            .eq('referred_id', deposit.user_id)
            .maybeSingle();

          if (referral && !referral.is_paid) {
            await supabase.from('referrals').update({
              reward_amount: rewardAmount,
              is_paid: true,
              paid_at: new Date().toISOString(),
            }).eq('id', referral.id);

            // Add reward to referrer's wallet
            const { data: refWallet } = await supabase.from('wallets').select('*').eq('user_id', profile.referred_by).maybeSingle();
            if (refWallet) {
              await supabase.from('wallets').update({
                rewards_balance: Number(refWallet.rewards_balance) + rewardAmount,
                total_rewards_earned: Number(refWallet.total_rewards_earned) + rewardAmount,
              }).eq('id', refWallet.id);
            }

            // Record referral reward
            await supabase.from('rewards').insert({
              user_id: profile.referred_by,
              amount: rewardAmount,
              reward_type: 'referral',
            });

            await supabase.from('transactions').insert({
              user_id: profile.referred_by,
              type: 'referral',
              amount: rewardAmount,
              status: 'completed',
              reference_id: referral.id,
              reference_type: 'referral',
              description: 'Referral reward',
            });
          }
        }
      }
    }

    // Log audit
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action: `deposit_${action}`,
      target_type: 'deposit',
      target_id: depositId,
      details: { amount: deposit.amount, user_id: deposit.user_id, note },
    });

    fetchDeposits();
  };

  const filterLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    approved: 'مقبول',
    rejected: 'مرفوض',
    all: 'الكل',
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إدارة الإيداعات</h1>
        <p className="text-sm text-gray-400">مراجعة والموافقة على طلبات الإيداع</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {filterLabels[f] || f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {deposits.map(dep => (
          <Card key={dep.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{dep.profile?.username || 'Unknown'}</p>
                  <Badge variant={dep.status === 'approved' ? 'success' : dep.status === 'rejected' ? 'danger' : 'warning'}>
                    {dep.status}
                  </Badge>
                  {dep.plan && <Badge variant="info">{dep.plan.name}</Badge>}
                </div>
                <p className="text-xs text-gray-500">{dep.profile?.email}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>المبلغ: <strong className="text-white">{formatCurrency(dep.amount)}</strong></span>
                  <span>الطريقة: <strong className="text-white capitalize">{dep.payment_method === 'sham_cash' ? 'Sham Cash' : dep.payment_method.replace('_', ' ')}</strong></span>
                  <span>التاريخ: {formatDateTime(dep.created_at)}</span>
                </div>
                {dep.admin_note && (
                  <p className="text-xs text-gray-500 mt-1">ملاحظة: {dep.admin_note}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {dep.proof_image_url && (
                  <button
                    onClick={() => setViewingProof(dep.proof_image_url)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="عرض الإثبات"
                  >
                    <Image className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {dep.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleDeposit(dep.id, 'approved')}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="قبول"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('سبب الرفض (اختياري):');
                        handleDeposit(dep.id, 'rejected', note || undefined);
                      }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="رفض"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {deposits.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">لم يتم العثور على إيداعات</div>
      )}

      {/* Proof Image Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
          <div className="max-w-lg max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <img src={viewingProof} alt="Proof of payment" className="rounded-xl max-w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
