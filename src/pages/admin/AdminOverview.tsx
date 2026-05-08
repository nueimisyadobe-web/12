import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, StatCard, formatCurrency, PageLoading } from '../../components/ui/Shared';
import { Users, ArrowDownCircle, ArrowUpCircle, Gift, Gamepad2, Wallet, TrendingUp, Shield } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMemberships: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalRewards: 0,
    totalLocked: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, memRes, depRes, withRes, rewardsRes, pendDepRes, pendWithRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('memberships').select('id, locked_amount').eq('status', 'active'),
        supabase.from('deposits').select('amount').eq('status', 'approved'),
        supabase.from('withdrawals').select('amount').eq('status', 'paid'),
        supabase.from('rewards').select('amount'),
        supabase.from('deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        activeMemberships: memRes.data?.length ?? 0,
        pendingDeposits: pendDepRes.count ?? 0,
        pendingWithdrawals: pendWithRes.count ?? 0,
        totalDeposits: depRes.data?.reduce((s, d) => s + Number(d.amount), 0) ?? 0,
        totalWithdrawals: withRes.data?.reduce((s, w) => s + Number(w.amount), 0) ?? 0,
        totalRewards: rewardsRes.data?.reduce((s, r) => s + Number(r.amount), 0) ?? 0,
        totalLocked: memRes.data?.reduce((s, m) => s + Number(m.locked_amount), 0) ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">لوحة تحكم الإدارة</h1>
        <p className="text-sm text-gray-400">نظرة عامة على المنصة وإحصائياتها</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard label="العضويات النشطة" value={stats.activeMemberships} icon={Shield} color="amber" />
        <StatCard label="إيداعات معلقة" value={stats.pendingDeposits} icon={ArrowDownCircle} color="emerald" />
        <StatCard label="سحوبات معلقة" value={stats.pendingWithdrawals} icon={ArrowUpCircle} color="red" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي الإيداعات" value={formatCurrency(stats.totalDeposits)} icon={Wallet} color="emerald" />
        <StatCard label="إجمالي السحوبات" value={formatCurrency(stats.totalWithdrawals)} icon={TrendingUp} color="red" />
        <StatCard label="إجمالي المكافآت" value={formatCurrency(stats.totalRewards)} icon={Gift} color="amber" />
        <StatCard label="إجمالي المقفل" value={formatCurrency(stats.totalLocked)} icon={Gamepad2} color="blue" />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-bold mb-4">إجراءات معلقة</h2>
        <div className="space-y-3">
          {stats.pendingDeposits > 0 && (
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">{stats.pendingDeposits} إيداع بانتظار الموافقة</span>
              </div>
              <a href="/admin/deposits" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">مراجعة</a>
            </div>
          )}
          {stats.pendingWithdrawals > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <ArrowUpCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm">{stats.pendingWithdrawals} سحب بانتظار الموافقة</span>
              </div>
              <a href="/admin/withdrawals" className="text-xs text-red-400 hover:text-red-300 font-medium">مراجعة</a>
            </div>
          )}
          {stats.pendingDeposits === 0 && stats.pendingWithdrawals === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">لا توجد إجراءات معلقة</p>
          )}
        </div>
      </Card>
    </div>
  );
}
