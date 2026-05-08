import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import type { Wallet, Withdrawal } from '../../lib/types';
import { Card, Button, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { AlertCircle } from 'lucide-react';

const paymentMethods = [
  { id: 'usdt_trc20' as const, label: 'USDT TRC20', desc: 'شبكة Tron' },
  { id: 'usdt_bep20' as const, label: 'USDT BEP20', desc: 'شبكة BSC' },
  { id: 'paypal' as const, label: 'PayPal', desc: 'تحويل PayPal' },
  { id: 'bank_transfer' as const, label: 'Bank Transfer', desc: 'تحويل بنكي' },
];

export default function Withdraw() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balanceType, setBalanceType] = useState<'rewards' | 'available'>('rewards');
  const [paymentMethod, setPaymentMethod] = useState<'usdt_trc20' | 'usdt_bep20' | 'paypal' | 'bank_transfer'>('usdt_trc20');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [minWithdrawal, setMinWithdrawal] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      const [walletRes, withdrawalsRes, settingsRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.from('withdrawals').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('admin_settings').select('value').eq('key', 'min_withdrawal').maybeSingle(),
      ]);

      if (walletRes.data) setWallet(walletRes.data);
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data as Withdrawal[]);
      if (settingsRes.data) setMinWithdrawal(parseFloat(settingsRes.data.value));
      setFetchLoading(false);
    };
    fetchData();
  }, [profile]);

  const availableAmount = balanceType === 'rewards'
    ? Number(wallet?.rewards_balance ?? 0)
    : Number(wallet?.available_balance ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !wallet) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minWithdrawal) {
      showToast('error', `الحد الأدنى للسحب هو ${formatCurrency(minWithdrawal)}`);
      return;
    }
    if (numAmount > availableAmount) {
      showToast('error', 'رصيد غير كافٍ');
      return;
    }
    if (!paymentDetails.trim()) {
      showToast('error', 'يرجى إدخال بيانات الدفع');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('withdrawals').insert({
      user_id: profile.id,
      amount: numAmount,
      balance_type: balanceType,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      status: 'pending',
    });

    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', 'تم إرسال طلب السحب! بانتظار موافقة الإدارة.');
      setAmount('');
      setPaymentDetails('');
      const { data } = await supabase.from('withdrawals').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      if (data) setWithdrawals(data as Withdrawal[]);
    }

    setLoading(false);
  };

  if (fetchLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">سحب</h1>
        <p className="text-sm text-gray-400">اسحب أرباحك إلى طريقة الدفع المفضلة لديك</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setBalanceType('rewards')}
          className={`p-4 rounded-xl border text-left transition-all ${
            balanceType === 'rewards' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 bg-white/[0.02]'
          }`}
        >
          <p className="text-xs text-gray-400 mb-1">رصيد المكافآت</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(wallet?.rewards_balance ?? 0)}</p>
        </button>
        <button
          onClick={() => setBalanceType('available')}
          className={`p-4 rounded-xl border text-left transition-all ${
            balanceType === 'available' ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-white/[0.02]'
          }`}
        >
          <p className="text-xs text-gray-400 mb-1">الرصيد المتاح</p>
          <p className="text-xl font-bold text-blue-400">{formatCurrency(wallet?.available_balance ?? 0)}</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-bold mb-4">تفاصيل السحب</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">المبلغ (الحد الأدنى {formatCurrency(minWithdrawal)})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min={minWithdrawal}
                  max={availableAmount}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-20 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => setAmount(availableAmount.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  الحد الأقصى
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">متاح: {formatCurrency(availableAmount)}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">طريقة الدفع</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === method.id
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <p className="text-xs font-medium">{method.label}</p>
                    <p className="text-[10px] text-gray-600">{method.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {paymentMethod.startsWith('usdt') ? 'عنوان المحفظة' : paymentMethod === 'paypal' ? 'بريد PayPal' : 'بيانات الحساب البنكي'}
              </label>
              <input
                type="text"
                value={paymentDetails}
                onChange={e => setPaymentDetails(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder={
                  paymentMethod.startsWith('usdt') ? 'أدخل عنوان محفظتك' :
                  paymentMethod === 'paypal' ? 'أدخل بريد PayPal' :
                  'أدخل بيانات الحساب البنكي'
                }
              />
            </div>
          </div>
        </Card>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">جميع عمليات السحب تتطلب موافقة الإدارة. قد يختلف وقت المعالجة. الرصيد المقفل لا يمكن سحبه قبل انتهاء فترة 30 يوماً.</p>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full active:scale-[0.98]">
          إرسال طلب السحب
        </Button>
      </form>

      {/* Withdrawal History */}
      <Card>
        <h2 className="text-lg font-bold mb-4">سجل السحوبات</h2>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">لا توجد سحوبات بعد</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{formatCurrency(w.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(w.created_at)}</p>
                  <p className="text-xs text-gray-600 capitalize">{w.payment_method.replace('_', ' ')} | {w.balance_type === 'rewards' ? 'مكافآت' : 'متاح'}</p>
                </div>
                <Badge variant={w.status === 'paid' ? 'success' : w.status === 'rejected' ? 'danger' : 'warning'}>
                  {w.status === 'pending' ? 'قيد المراجعة' : w.status === 'paid' ? 'مدفوع' : 'مرفوض'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
