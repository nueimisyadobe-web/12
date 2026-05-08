import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Reward } from '../../lib/types';
import { Card, formatCurrency, formatDateTime, EmptyState, PageLoading } from '../../components/ui/Shared';
import { Gift, Gamepad2, Eye, Users, Star } from 'lucide-react';

export default function RewardsHistory() {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchRewards = async () => {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setRewards(data as Reward[]);
      setLoading(false);
    };
    fetchRewards();
  }, [profile]);

  if (loading) {
    return <PageLoading />;
  }

  const filtered = filter === 'all' ? rewards : rewards.filter(r => r.reward_type === filter);
  const totalEarned = rewards.reduce((sum, r) => sum + Number(r.amount), 0);

  const iconMap: Record<string, typeof Gift> = { game: Gamepad2, ad: Eye, referral: Users, bonus: Star };
  const colorMap: Record<string, string> = { game: 'text-amber-400 bg-amber-500/10', ad: 'text-blue-400 bg-blue-500/10', referral: 'text-purple-400 bg-purple-500/10', bonus: 'text-emerald-400 bg-emerald-500/10' };

  const filterLabels: Record<string, string> = {
    all: 'الكل',
    game: 'لعبة',
    ad: 'إعلان',
    referral: 'إحالة',
    bonus: 'مكافأة',
  };

  const rewardTypeLabels: Record<string, string> = {
    game: 'لعبة',
    ad: 'إعلان',
    referral: 'إحالة',
    bonus: 'مكافأة',
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">سجل المكافآت</h1>
        <p className="text-sm text-gray-400">تتبع جميع المكافآت التي حصلت عليها</p>
      </div>

      <Card className="text-center">
        <p className="text-xs text-gray-500 mb-1">إجمالي المكافآت المكتسبة</p>
        <p className="text-3xl font-bold text-amber-400">{formatCurrency(totalEarned)}</p>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'game', 'ad', 'referral', 'bonus'].map(type => (
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
        <EmptyState icon={Gift} title="لا توجد مكافآت" description="العب ألعاباً وشاهد إعلانات لتحصل على مكافآت" />
      ) : (
        <div className="space-y-2">
          {filtered.map(reward => {
            const Icon = iconMap[reward.reward_type] || Gift;
            const color = colorMap[reward.reward_type] || 'text-gray-400 bg-gray-500/10';
            return (
              <div key={reward.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 bg-[#12121a] rounded-xl px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">مكافأة {rewardTypeLabels[reward.reward_type] || reward.reward_type}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(reward.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-400">+{formatCurrency(reward.amount)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
