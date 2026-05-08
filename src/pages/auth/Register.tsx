import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Crown, Mail, Lock, User, Eye, EyeOff, Users } from 'lucide-react';

export default function Register() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState(referralCode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('error', 'كلمات المرور غير متطابقة');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    if (!agreeTerms) {
      showToast('error', 'يجب الموافقة على الشروط والأحكام');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username, refCode || undefined);
    setLoading(false);

    if (error) {
      showToast('error', error);
    } else {
      showToast('success', 'تم إنشاء الحساب بنجاح!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-page-enter">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">إنشاء حساب</h1>
          <p className="text-sm text-gray-400">انضم إلى VIP Game Investment Rewards</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#12121a] border border-white/5 rounded-2xl p-6 space-y-5 shimmer-bg">
          <div className="float-label">
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="اسم المستخدم"
            />
            <label htmlFor="reg-username">اسم المستخدم</label>
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="float-label">
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="البريد الإلكتروني"
              dir="ltr"
            />
            <label htmlFor="reg-email">البريد الإلكتروني</label>
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="float-label">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-10 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="كلمة المرور"
            />
            <label htmlFor="reg-password">كلمة المرور</label>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="float-label">
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="تأكيد كلمة المرور"
            />
            <label htmlFor="reg-confirm">تأكيد كلمة المرور</label>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="float-label">
            <input
              id="reg-ref"
              type="text"
              value={refCode}
              onChange={e => setRefCode(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="كود الإحالة"
            />
            <label htmlFor="reg-ref">كود الإحالة (اختياري)</label>
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/20"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              أوافق على{' '}
              <Link to="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">الشروط والأحكام</Link>
              {' '}و{' '}
              <Link to="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">سياسة الخصوصية</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
