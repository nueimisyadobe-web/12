import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Crown, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      showToast('error', error);
    } else {
      showToast('success', 'مرحباً بعودتك!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-page-enter">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 animate-pulse-glow">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">مرحباً بعودتك</h1>
          <p className="text-sm text-gray-400">سجل الدخول إلى حسابك في VIP Game</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#12121a] border border-white/5 rounded-2xl p-6 space-y-5 shimmer-bg">
          <div className="float-label">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="البريد الإلكتروني"
              dir="ltr"
            />
            <label htmlFor="login-email">البريد الإلكتروني</label>
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="float-label">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-10 py-3 text-sm text-white placeholder-transparent focus-gold transition-all"
              placeholder="كلمة المرور"
            />
            <label htmlFor="login-password">كلمة المرور</label>
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">أنشئ واحداً</Link>
        </p>
      </div>
    </div>
  );
}
