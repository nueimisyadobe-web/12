import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Card({ children, className = '', glow = false }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`bg-[#12121a] border border-white/5 rounded-2xl p-6 card-glow shimmer-bg ${glow ? 'shadow-lg shadow-amber-500/5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const [tapped, setTapped] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTapped(true);
    setTimeout(() => setTapped(false), 150);
    onClick?.();
  };

  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25',
    secondary: 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${tapped ? 'animate-tap' : ''} ${className}`}
    >
      {loading && <GamingSpinner size={16} />}
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'amber',
  sublabel,
  animate = false,
}: {
  label: string;
  value: string | number;
  icon: typeof import('lucide-react').Wallet;
  color?: 'amber' | 'blue' | 'emerald' | 'red';
  sublabel?: string;
  animate?: boolean;
}) {
  const colors = {
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  };

  const iconColors = {
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 card-glow`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconColors[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {animate ? <AnimatedNumber value={value} /> : value}
      </p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  );
}

export function CountdownTimer({ targetDate, label }: { targetDate: string; label?: string }) {
  const days = Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">{label || 'يفتح بعد'}</span>
      <span className="text-sm font-bold text-amber-400">{days} يوم</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon: typeof import('lucide-react').Inbox; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-400 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm">{description}</p>
    </div>
  );
}

/* ===== Animated Number (Counter) ===== */
function AnimatedNumber({ value }: { value: string | number }) {
  const [display, setDisplay] = useState('0');
  const targetRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const numStr = typeof value === 'string' ? value.replace(/[$,]/g, '') : String(value);
    const target = parseFloat(numStr) || 0;
    targetRef.current = target;

    const duration = 1200;
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setDisplay('$' + current.toFixed(2));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <>{display}</>;
}

/* ===== Gaming Spinner ===== */
export function GamingSpinner({ size = 40 }: { size?: number }) {
  return (
    <svg className="gaming-spinner" width={size} height={size} viewBox="0 0 50 50">
      <circle
        cx="25" cy="25" r="20"
        fill="none"
        stroke="url(#spinnerGrad)"
        strokeWidth="4"
      />
      <defs>
        <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#d4a017" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ===== Page Loading ===== */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <GamingSpinner size={48} />
    </div>
  );
}

/* ===== Particle Background ===== */
export function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="particle-1 absolute w-64 h-64 rounded-full bg-amber-500/5 blur-3xl" style={{ top: '10%', right: '15%' }} />
      <div className="particle-2 absolute w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" style={{ top: '50%', left: '10%' }} />
      <div className="particle-3 absolute w-56 h-56 rounded-full bg-amber-500/4 blur-3xl" style={{ bottom: '20%', right: '30%' }} />
      <div className="particle-1 absolute w-32 h-32 rounded-full bg-blue-500/4 blur-2xl" style={{ top: '70%', right: '60%', animationDelay: '-4s' }} />
      <div className="particle-2 absolute w-40 h-40 rounded-full bg-amber-500/3 blur-2xl" style={{ top: '30%', left: '50%', animationDelay: '-7s' }} />
    </div>
  );
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return '$' + num.toFixed(2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
