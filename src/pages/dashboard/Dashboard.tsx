import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Wallet, Membership, VipPlan } from '../../lib/types';
import { StatCard, Card, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { Wallet as WalletIcon, Lock, Gift, TrendingUp, Gamepad2, ArrowDownCircle, ArrowUpCircle, Crown, Clock, History } from 'lucide-react';

const txTypeLabels: Record<string, string> = {
  deposit: 'إيداع',
  withdrawal: 'سحب',
  reward: 'مكافأة',
  referral: 'إحالة',
  unlock: 'فتح رصيد',
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [plan, setPlan] = useState<VipPlan | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      const [walletRes, membershipRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.from('memberships').select('*, plan:vip_plans(*)').eq('user_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);

      if (walletRes.data) setWallet(walletRes.data);
      if (membershipRes.data) {
        setMembership(membershipRes.data);
        if (membershipRes.data.plan) setPlan(membershipRes.data.plan as unknown as VipPlan);
      }
      if (txRes.data) setRecentTransactions(txRes.data);
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  if (loading) {
    return <PageLoading />;
  }

  const daysRemaining = membership
    ? Math.max(0, Math.ceil((new Date(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const todayRewards = membership?.daily_rewards_earned ?? 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      {/* Header */}
      <div className="animate-page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">مرحباً، {profile?.username}</h1>
            <p className="text-sm text-gray-400">إليك نظرة عامة على حسابك</p>
          </div>
          {membership && plan && (
            <Badge variant="warning">
              <Crown className="w-3 h-3 mr-1" />
              {plan.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="الرصيد المقفل"
          value={formatCurrency(wallet?.locked_balance ?? 0)}
          icon={Lock}
          color="amber"
          sublabel={membership ? `يفتح بعد ${daysRemaining} يوم` : 'لا توجد عضوية نشطة'}
          animate
        />
        <StatCard
          label="رصيد المكافآت"
          value={formatCurrency(wallet?.rewards_balance ?? 0)}
          icon={Gift}
          color="emerald"
          sublabel="متاح للسحب"
          animate
        />
        <StatCard
          label="الرصيد المتاح"
          value={formatCurrency(wallet?.available_balance ?? 0)}
          icon={WalletIcon}
          color="blue"
          sublabel="أموال غير مقفلة"
          animate
        />
      </div>

      {/* Membership Status */}
      {membership && plan ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">عضوية نشطة</h2>
            <Badge variant="success">نشط</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">مستوى VIP</p>
              <p className="text-sm font-semibold text-amber-400">{plan.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">الأيام المتبقية</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-sm font-semibold">{daysRemaining} يوم</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">مكافآت اليوم</p>
              <p className="text-sm font-semibold text-emerald-400">{formatCurrency(todayRewards)} / {formatCurrency(plan.daily_reward_cap)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">المحاولات المستخدمة</p>
              <p className="text-sm font-semibold">{membership.daily_attempts_used} / {plan.daily_attempts}</p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>المكافآت اليومية</span>
                <span>{Math.min(100, (todayRewards / Number(plan.daily_reward_cap)) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (todayRewards / Number(plan.daily_reward_cap)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>المحاولات اليومية</span>
                <span>{Math.min(100, (membership.daily_attempts_used / plan.daily_attempts) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (membership.daily_attempts_used / plan.daily_attempts) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-400 mb-1">لا توجد عضوية نشطة</h3>
            <p className="text-sm text-gray-600 mb-4">اختر خطة VIP لبدء اللعب والكسب</p>
            <Link to="/vip-plans" className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25">
              <Crown className="w-4 h-4" /> عرض خطط VIP
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/game" className="flex flex-col items-center gap-2 p-4 bg-[#12121a] border border-white/5 rounded-xl hover:border-amber-500/20 transition-all group card-glow">
          <Gamepad2 className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-300">العب الآن</span>
        </Link>
        <Link to="/deposit" className="flex flex-col items-center gap-2 p-4 bg-[#12121a] border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all group card-glow">
          <ArrowDownCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-300">إيداع</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center gap-2 p-4 bg-[#12121a] border border-white/5 rounded-xl hover:border-blue-500/20 transition-all group card-glow">
          <ArrowUpCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-300">سحب</span>
        </Link>
        <Link to="/referral" className="flex flex-col items-center gap-2 p-4 bg-[#12121a] border border-white/5 rounded-xl hover:border-amber-500/20 transition-all group card-glow">
          <TrendingUp className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-300">إحالة</span>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">آخر المعاملات</h2>
          <Link to="/transactions" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
            عرض الكل <History className="w-3 h-3" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">لا توجد معاملات بعد</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-400' :
                    tx.type === 'reward' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownCircle className="w-4 h-4" /> :
                     tx.type === 'withdrawal' ? <ArrowUpCircle className="w-4 h-4" /> :
                     <Gift className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txTypeLabels[tx.type] || tx.type}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(tx.created_at)}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${
                  ['deposit', 'reward', 'referral', 'unlock'].includes(tx.type) ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {['deposit', 'reward', 'referral', 'unlock'].includes(tx.type) ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
