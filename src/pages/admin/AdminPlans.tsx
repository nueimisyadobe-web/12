import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { VipPlan } from '../../lib/types';
import { Card, Button, PageLoading } from '../../components/ui/Shared';
import { Crown, Save } from 'lucide-react';

export default function AdminPlans() {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, Partial<VipPlan>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase.from('vip_plans').select('*').order('sort_order');
    if (data) setPlans(data);
    setLoading(false);
  };

  const handleEdit = (planId: string, field: string, value: any) => {
    setEditing(prev => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  const handleSave = async (planId: string) => {
    setSaving(planId);
    const changes = editing[planId];
    if (!changes || Object.keys(changes).length === 0) {
      setSaving(null);
      return;
    }

    await supabase.from('vip_plans').update(changes).eq('id', planId);

    // Log audit
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_audit_log').insert({
      admin_id: user?.id,
      action: 'update_plan',
      target_type: 'vip_plan',
      target_id: planId,
      details: changes as any,
    });

    setEditing(prev => {
      const next = { ...prev };
      delete next[planId];
      return next;
    });
    setSaving(null);
    fetchPlans();
  };

  const toggleActive = async (planId: string, isActive: boolean) => {
    await supabase.from('vip_plans').update({ is_active: !isActive }).eq('id', planId);
    fetchPlans();
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إدارة خطط VIP</h1>
        <p className="text-sm text-gray-400">إعداد خطط عضوية VIP وإعدادات المكافآت</p>
      </div>

      <div className="space-y-4">
        {plans.map(plan => {
          const edits = editing[plan.id] || {};
          const currentPrice = edits.price !== undefined ? edits.price : plan.price;
          const currentDailyAttempts = edits.daily_attempts !== undefined ? edits.daily_attempts : plan.daily_attempts;
          const currentDailyCap = edits.daily_reward_cap !== undefined ? edits.daily_reward_cap : plan.daily_reward_cap;
          const currentRewardPerGame = edits.reward_per_game !== undefined ? edits.reward_per_game : plan.reward_per_game;
          const currentLockDays = edits.lock_duration_days !== undefined ? edits.lock_duration_days : plan.lock_duration_days;

          return (
            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-gray-500">ترتيب الفرز: {plan.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(plan.id, plan.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      plan.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {plan.is_active ? 'نشط' : 'غير نشط'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">السعر ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={currentPrice}
                    onChange={e => handleEdit(plan.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">المحاولات اليومية</label>
                  <input
                    type="number"
                    value={currentDailyAttempts}
                    onChange={e => handleEdit(plan.id, 'daily_attempts', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحد اليومي للمكافآت ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentDailyCap}
                    onChange={e => handleEdit(plan.id, 'daily_reward_cap', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">المكافأة لكل لعبة ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRewardPerGame}
                    onChange={e => handleEdit(plan.id, 'reward_per_game', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">مدة القفل (أيام)</label>
                  <input
                    type="number"
                    value={currentLockDays}
                    onChange={e => handleEdit(plan.id, 'lock_duration_days', parseInt(e.target.value) || 30)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {editing[plan.id] && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={saving === plan.id}
                    onClick={() => handleSave(plan.id)}
                  >
                    <Save className="w-3.5 h-3.5" /> حفظ التغييرات
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
