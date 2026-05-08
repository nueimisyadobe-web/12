import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import type { VipPlan, Deposit as DepositType } from '../../lib/types';
import { Card, Button, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { Copy, Check, Send } from 'lucide-react';

export default function Deposit() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get('plan');

  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(preselectedPlan || '');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deposits, setDeposits] = useState<DepositType[]>([]);
  const [shamCashNumber, setShamCashNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [plansRes, depositsRes, settingsRes] = await Promise.all([
        supabase.from('vip_plans').select('*').eq('is_active', true).order('sort_order'),
        profile ? supabase.from('deposits').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
        supabase.from('admin_settings').select('key, value').eq('key', 'sham_cash_number'),
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (depositsRes.data) setDeposits(depositsRes.data as DepositType[]);
      if (settingsRes.data && settingsRes.data.length > 0) {
        setShamCashNumber(settingsRes.data[0].value);
      }
      setFetchLoading(false);
    };
    fetchData();
  }, [profile]);

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shamCashNumber);
    setCopied(true);
    showToast('success', 'تم نسخ رقم Sham Cash');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramVerify = () => {
    if (!profile) return;
    const username = profile.username;
    const telegramUrl = `https://t.me/nueimisy?text=${encodeURIComponent(`السلام عليكم ورحمة الله وبركاته My Website Username is: ${username}. Here is my payment screenshot:`)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanData || !profile) return;

    setLoading(true);

    const { error } = await supabase.from('deposits').insert({
      user_id: profile.id,
      amount: selectedPlanData.price,
      payment_method: 'sham_cash',
      wallet_address: null,
      proof_image_url: null,
      plan_id: selectedPlanData.id,
      status: 'pending',
    });

    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', 'تم إرسال طلب الإيداع! تحقق عبر تيليغرام وانتظر موافقة الإدارة.');
      const { data } = await supabase.from('deposits').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      if (data) setDeposits(data as DepositType[]);
    }

    setLoading(false);
  };

  if (fetchLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إيداع</h1>
        <p className="text-sm text-gray-400">اختر خطة VIP وقم بإيداعك عبر Sham Cash</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
        <Card>
          <h2 className="text-lg font-bold mb-4">1. اختر خطة VIP</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map(plan => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-xl border text-right transition-all duration-300 card-glow ${
                  selectedPlan === plan.id
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <p className="font-bold text-amber-400">{plan.name}</p>
                <p className="text-2xl font-extrabold mt-1">{formatCurrency(plan.price)}</p>
                <p className="text-xs text-gray-500 mt-1">{plan.daily_attempts} محاولات/يوم | حتى {formatCurrency(plan.daily_reward_cap)}/يوم</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Sham Cash Payment Details */}
        <Card>
          <h2 className="text-lg font-bold mb-4">2. تفاصيل الدفع عبر Sham Cash</h2>
          <div className="p-5 bg-white/[0.02] border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">S</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sham Cash</p>
                <p className="text-xs text-gray-500">طريقة الدفع الوحيدة المتاحة</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                أرسل <span className="text-amber-400 font-bold">{selectedPlanData ? formatCurrency(selectedPlanData.price) : '$0'}</span> إلى رقم Sham Cash التالي:
              </p>

              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-amber-500/10">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">رقم Sham Cash</p>
                  <code className="text-lg text-amber-400 font-mono" dir="ltr">
                    {shamCashNumber || '+963XXXXXXXXX'}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                يرجى تحويل المبلغ المحدد بالضبط إلى رقم Sham Cash أعلاه، ثم اضغط على زر التحقق عبر تيليغرام أدناه.
              </p>
            </div>
          </div>
        </Card>

        {/* Telegram Verification */}
        <Card>
          <h2 className="text-lg font-bold mb-4">3. تحقق من الإيداع عبر تيليغرام</h2>
          <p className="text-sm text-gray-400 mb-4">
            بعد إتمام التحويل عبر Sham Cash، اضغط على الزر أدناه لإرسال تأكيد الإيداع إلى الإدارة عبر تيليغرام. أرفق لقطة شاشة للتحويل في الرسالة.
          </p>
          <button
            type="button"
            onClick={handleTelegramVerify}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#2AABEE]/20 border border-[#2AABEE]/40 text-[#2AABEE] font-semibold hover:bg-[#2AABEE]/30 transition-all duration-200 animate-pulse-glow active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            تحقق من الإيداع عبر تيليغرام
          </button>
          <p className="text-xs text-gray-600 mt-3 text-center">
            سيفتح هذا تيليغرام ويملاً رسالة باسم المستخدم الخاص بك
          </p>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!selectedPlan}
          className="w-full"
          onClick={handleSubmit as any}
        >
          إرسال طلب الإيداع
        </Button>
      </form>

      {/* Deposit History */}
      <Card>
        <h2 className="text-lg font-bold mb-4">سجل الإيداعات</h2>
        {deposits.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">لا توجد إيداعات بعد</p>
        ) : (
          <div className="space-y-3">
            {deposits.map(dep => (
              <div key={dep.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{formatCurrency(dep.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(dep.created_at)}</p>
                  <p className="text-xs text-gray-600">Sham Cash</p>
                </div>
                <div className="text-left">
                  <Badge variant={dep.status === 'approved' ? 'success' : dep.status === 'rejected' ? 'danger' : 'warning'}>
                    {dep.status === 'approved' ? 'مقبول' : dep.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </Badge>
                  {dep.admin_note && <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{dep.admin_note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
