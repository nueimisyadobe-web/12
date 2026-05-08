import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { VipPlan, Membership } from '../../lib/types';
import { Card, formatCurrency, PageLoading } from '../../components/ui/Shared';
import { Crown, Gamepad2, TrendingUp, Lock, Check, Shield } from 'lucide-react';

export default function VipPlans() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      const [plansRes, membershipRes] = await Promise.all([
        supabase.from('vip_plans').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('memberships').select('*').eq('user_id', profile.id).eq('status', 'active').maybeSingle(),
      ]);
      if (plansRes.data) setPlans(plansRes.data);
      if (membershipRes.data) setActiveMembership(membershipRes.data);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return <PageLoading />;
  }

  const planColors = [
    { gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', accent: 'text-blue-400', glow: 'shadow-blue-500/10' },
    { gradient: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', accent: 'text-amber-400', glow: 'shadow-amber-500/10' },
    { gradient: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', accent: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">خطط عضوية VIP</h1>
        <p className="text-sm text-gray-400">اختر خطة وابدأ بكسب مكافآت يومية</p>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 leading-relaxed" dir="rtl" lang="ar">
          هذه منصة عضويات ألعاب ومكافآت. المكافآت غير مضمونة وتعتمد على نشاط المستخدم وتوفر الإعلانات وإيرادات المنصة. مبلغ العضوية يكون مقفولًا لمدة 30 يومًا وقابلًا للاسترداد بعد انتهاء المدة حسب الشروط.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const isActive = activeMembership?.plan_id === plan.id;
          const color = planColors[i % planColors.length];

          return (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${color.gradient} border ${color.border} rounded-2xl p-6 hover:scale-[1.02] transition-all shadow-lg ${color.glow} card-glow ${
                i === 1 ? 'ring-1 ring-amber-500/30' : ''
              }`}
            >
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                  الأكثر شعبية
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center border ${color.border}`}>
                  <Crown className={`w-6 h-6 ${color.accent}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-xs text-gray-500">عضوية 30 يوماً</p>
                </div>
              </div>

              <p className="text-4xl font-extrabold mb-6">{formatCurrency(plan.price)}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Gamepad2 className={`w-4 h-4 ${color.accent}`} />
                  <span>{plan.daily_attempts} محاولات لعب يومية</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <TrendingUp className={`w-4 h-4 ${color.accent}`} />
                  <span>حتى {formatCurrency(plan.daily_reward_cap)} مكافآت يومية</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Lock className={`w-4 h-4 ${color.accent}`} />
                  <span>{plan.lock_duration_days} يوم فترة قفل</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className={`w-4 h-4 ${color.accent}`} />
                  <span>{formatCurrency(plan.reward_per_game)} لكل لعبة</span>
                </div>
              </div>

              {isActive ? (
                <div className="w-full py-3 text-center font-semibold rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  نشطة حالياً
                </div>
              ) : (
                <Link
                  to={`/deposit?plan=${plan.id}`}
                  className="block w-full py-3 text-center font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                >
                  اشترك في {plan.name}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <h2 className="text-lg font-bold mb-4">مقارنة الخطط</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right py-3 text-gray-400 font-medium">الميزة</th>
                {plans.map(p => (
                  <th key={p.id} className="text-center py-3 text-gray-300 font-semibold">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-white/5">
                <td className="py-3">السعر</td>
                {plans.map(p => <td key={p.id} className="text-center py-3 text-white font-semibold">{formatCurrency(p.price)}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3">المحاولات اليومية</td>
                {plans.map(p => <td key={p.id} className="text-center py-3">{p.daily_attempts}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3">الحد اليومي للمكافآت</td>
                {plans.map(p => <td key={p.id} className="text-center py-3 text-emerald-400">{formatCurrency(p.daily_reward_cap)}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3">المكافأة لكل لعبة</td>
                {plans.map(p => <td key={p.id} className="text-center py-3">{formatCurrency(p.reward_per_game)}</td>)}
              </tr>
              <tr>
                <td className="py-3">فترة القفل</td>
                {plans.map(p => <td key={p.id} className="text-center py-3">{p.lock_duration_days} يوم</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
