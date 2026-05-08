import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Wallet, Transaction, Membership } from '../../lib/types';
import { Card, formatCurrency, formatDateTime, CountdownTimer, EmptyState, PageLoading } from '../../components/ui/Shared';
import { Wallet as WalletIcon, Lock, Gift, ArrowDownCircle, ArrowUpCircle, TrendingUp, History } from 'lucide-react';

const txTypeLabels: Record<string, string> = {
  all: 'الكل',
  deposit: 'إيداع',
  withdrawal: 'سحب',
  reward: 'مكافأة',
  referral: 'إحالة',
  unlock: 'فتح رصيد',
};

export default function WalletPage() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const [walletRes, membershipRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.from('memberships').select('*').eq('user_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      if (membershipRes.data) setMembership(membershipRes.data);
      if (txRes.data) setTransactions(txRes.data as Transaction[]);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return <PageLoading />;
  }

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === filter);

  const txTypes = ['all', 'deposit', 'withdrawal', 'reward', 'referral', 'unlock'];

  const txTypeArabicLabels: Record<string, string> = {
    deposit: 'إيداع',
    withdrawal: 'سحب',
    reward: 'مكافأة',
    referral: 'إحالة',
    unlock: 'فتح رصيد',
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">المحفظة</h1>
        <p className="text-sm text-gray-400">نظرة عامة على رصيدك وسجل المعاملات</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">الرصيد المقفل</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(wallet?.locked_balance ?? 0)}</p>
          {membership && (
            <CountdownTimer targetDate={membership.end_date} label="يفتح بعد" />
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">رصيد المكافآت</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Gift className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(wallet?.rewards_balance ?? 0)}</p>
          <p className="text-xs text-gray-500">متاح للسحب</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">الرصيد المتاح</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <WalletIcon className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(wallet?.available_balance ?? 0)}</p>
          <p className="text-xs text-gray-500">أموال غير مقفلة</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-xs text-gray-500 mb-1">إجمالي الإيداعات</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(wallet?.total_deposited ?? 0)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-gray-500 mb-1">إجمالي السحوبات</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(wallet?.total_withdrawn ?? 0)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-gray-500 mb-1">إجمالي المكافآت</p>
          <p className="text-lg font-bold text-amber-400">{formatCurrency(wallet?.total_rewards_earned ?? 0)}</p>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">سجل المعاملات</h2>
          <Link to="/transactions" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 card-glow">
            عرض الكل <History className="w-3 h-3" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {txTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === type ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {txTypeLabels[type] || type}
            </button>
          ))}
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState icon={History} title="لا توجد معاملات" description="سيظهر سجل معاملاتك هنا" />
        ) : (
          <div className="space-y-2">
            {filteredTransactions.slice(0, 20).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'deposit' || tx.type === 'unlock' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-400' :
                    tx.type === 'reward' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownCircle className="w-4 h-4" /> :
                     tx.type === 'withdrawal' ? <ArrowUpCircle className="w-4 h-4" /> :
                     tx.type === 'reward' ? <Gift className="w-4 h-4" /> :
                     <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txTypeArabicLabels[tx.type] || tx.type}</p>
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
