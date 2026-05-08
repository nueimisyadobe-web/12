import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Withdrawal, Profile } from '../../lib/types';
import { Card, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { Check, X } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<(Withdrawal & { profile?: Profile })[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    let query = supabase.from('withdrawals').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    if (data) {
      const userIds = [...new Set(data.map(w => w.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      setWithdrawals(data.map(w => ({ ...w, profile: profileMap.get(w.user_id) })) as any[]);
    }
    setLoading(false);
  };

  const handleWithdrawal = async (withdrawalId: string, action: 'paid' | 'rejected', note?: string) => {
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return;

    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    // Update withdrawal status
    const { error } = await supabase.from('withdrawals').update({
      status: action,
      admin_note: note || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', withdrawalId);

    if (error) return;

    if (action === 'paid') {
      // Deduct from wallet
      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', withdrawal.user_id).maybeSingle();
      if (wallet) {
        const updateData: any = { total_withdrawn: Number(wallet.total_withdrawn) + Number(withdrawal.amount) };
        if (withdrawal.balance_type === 'rewards') {
          updateData.rewards_balance = Math.max(0, Number(wallet.rewards_balance) - Number(withdrawal.amount));
        } else {
          updateData.available_balance = Math.max(0, Number(wallet.available_balance) - Number(withdrawal.amount));
        }
        await supabase.from('wallets').update(updateData).eq('id', wallet.id);
      }

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: withdrawal.user_id,
        type: 'withdrawal',
        amount: withdrawal.amount,
        status: 'completed',
        reference_id: withdrawalId,
        reference_type: 'withdrawal',
        description: `Withdrawal via ${withdrawal.payment_method}`,
      });
    } else if (action === 'rejected') {
      // No balance change needed for rejection - funds stay in wallet
    }

    // Log audit
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action: `withdrawal_${action}`,
      target_type: 'withdrawal',
      target_id: withdrawalId,
      details: { amount: withdrawal.amount, user_id: withdrawal.user_id, balance_type: withdrawal.balance_type, note },
    });

    fetchWithdrawals();
  };

  const filterLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    paid: 'مدفوع',
    rejected: 'مرفوض',
    all: 'الكل',
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إدارة السحوبات</h1>
        <p className="text-sm text-gray-400">مراجعة ومعالجة طلبات السحب</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'paid', 'rejected', 'all'].map(f => (
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
        {withdrawals.map(w => (
          <Card key={w.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{w.profile?.username || 'Unknown'}</p>
                  <Badge variant={w.status === 'paid' ? 'success' : w.status === 'rejected' ? 'danger' : 'warning'}>
                    {w.status}
                  </Badge>
                  <Badge variant="info">{w.balance_type}</Badge>
                </div>
                <p className="text-xs text-gray-500">{w.profile?.email}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>المبلغ: <strong className="text-white">{formatCurrency(w.amount)}</strong></span>
                  <span>الطريقة: <strong className="text-white capitalize">{w.payment_method.replace('_', ' ')}</strong></span>
                  <span>التاريخ: {formatDateTime(w.created_at)}</span>
                </div>
                {w.payment_details && (
                  <p className="text-xs text-gray-500 mt-1">الدفع: <span className="text-gray-300 font-mono">{w.payment_details}</span></p>
                )}
                {w.admin_note && (
                  <p className="text-xs text-gray-500 mt-1">ملاحظة: {w.admin_note}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {w.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleWithdrawal(w.id, 'paid')}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="تحديد كمدفوع"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('سبب الرفض (اختياري):');
                        handleWithdrawal(w.id, 'rejected', note || undefined);
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

      {withdrawals.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">لم يتم العثور على سحوبات</div>
      )}
    </div>
  );
}
