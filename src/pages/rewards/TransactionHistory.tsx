import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Transaction } from '../../lib/types';
import { Badge, formatCurrency, formatDateTime, EmptyState, PageLoading } from '../../components/ui/Shared';
import { ArrowDownCircle, ArrowUpCircle, Gift, TrendingUp, Lock, Settings, History } from 'lucide-react';

export default function TransactionHistory() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setTransactions(data as Transaction[]);
      setLoading(false);
    };
    fetchTransactions();
  }, [profile]);

  if (loading) {
    return <PageLoading />;
  }

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const iconMap: Record<string, typeof History> = {
    deposit: ArrowDownCircle,
    withdrawal: ArrowUpCircle,
    reward: Gift,
    referral: TrendingUp,
    unlock: Lock,
    adjustment: Settings,
  };

  const colorMap: Record<string, string> = {
    deposit: 'text-emerald-400 bg-emerald-500/10',
    withdrawal: 'text-red-400 bg-red-500/10',
    reward: 'text-amber-400 bg-amber-500/10',
    referral: 'text-purple-400 bg-purple-500/10',
    unlock: 'text-blue-400 bg-blue-500/10',
    adjustment: 'text-gray-400 bg-gray-500/10',
  };

  const filterLabels: Record<string, string> = {
    all: 'الكل',
    deposit: 'إيداع',
    withdrawal: 'سحب',
    reward: 'مكافأة',
    referral: 'إحالة',
    unlock: 'فتح رصيد',
  };

  const typeLabels: Record<string, string> = {
    deposit: 'إيداع',
    withdrawal: 'سحب',
    reward: 'مكافأة',
    referral: 'إحالة',
    unlock: 'فتح رصيد',
    adjustment: 'تعديل',
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">سجل المعاملات</h1>
        <p className="text-sm text-gray-400">سجل كامل لجميع معاملاتك</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'deposit', 'withdrawal', 'reward', 'referral', 'unlock'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === type ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {filterLabels[type] || type}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="لا توجد معاملات" description="سيظهر سجل معاملاتك هنا" />
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => {
            const Icon = iconMap[tx.type] || History;
            const color = colorMap[tx.type] || 'text-gray-400 bg-gray-500/10';
            const isPositive = ['deposit', 'reward', 'referral', 'unlock'].includes(tx.type);
            return (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 bg-[#12121a] rounded-xl px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{typeLabels[tx.type] || tx.type}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(tx.created_at)}</p>
                    {tx.description && <p className="text-xs text-gray-600 mt-0.5">{tx.description}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
