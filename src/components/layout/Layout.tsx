import { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ParticleBackground } from '../../components/ui/Shared';
import {
  Home, Gamepad2, Wallet, ArrowDownCircle, ArrowUpCircle,
  Gift, History, Users, Settings, Shield, LogOut, Menu, X, Crown,
  ChevronLeft, FileText, Lock
} from 'lucide-react';

const userNavItems = [
  { to: '/dashboard', icon: Home, label: 'لوحة التحكم' },
  { to: '/vip-plans', icon: Crown, label: 'خطط VIP' },
  { to: '/game', icon: Gamepad2, label: 'مركز الألعاب' },
  { to: '/wallet', icon: Wallet, label: 'المحفظة' },
  { to: '/deposit', icon: ArrowDownCircle, label: 'إيداع' },
  { to: '/withdraw', icon: ArrowUpCircle, label: 'سحب' },
  { to: '/rewards', icon: Gift, label: 'المكافآت' },
  { to: '/transactions', icon: History, label: 'المعاملات' },
  { to: '/referral', icon: Users, label: 'الإحالة' },
];

const adminNavItems = [
  { to: '/admin', icon: Shield, label: 'نظرة عامة' },
  { to: '/admin/users', icon: Users, label: 'المستخدمون' },
  { to: '/admin/deposits', icon: ArrowDownCircle, label: 'الإيداعات' },
  { to: '/admin/withdrawals', icon: ArrowUpCircle, label: 'السحوبات' },
  { to: '/admin/plans', icon: Crown, label: 'خطط VIP' },
  { to: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  { to: '/admin/logs', icon: FileText, label: 'سجل المراجعة' },
];

export default function Layout() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile) return <Navigate to="/login" replace />;

  const isAdmin = profile.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-l from-amber-500/20 to-blue-500/10 text-amber-400 border border-amber-500/30'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      <ChevronLeft className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex" dir="rtl">
      <ParticleBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d14]/95 backdrop-blur-sm border-l border-white/5 p-4 fixed h-full z-40 right-0">
        <div className="flex items-center gap-3 px-4 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-l from-amber-400 to-amber-200 bg-clip-text text-transparent">
              VIP Game
            </h1>
            <p className="text-[10px] text-gray-500">مكافآت الاستثمار</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {!isAdmin && (
          <NavLink
            to="/vip-plans"
            className="flex items-center gap-2 px-4 py-3 mt-4 rounded-xl bg-gradient-to-l from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-amber-400 hover:border-amber-500/40 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span className="text-xs font-semibold">ترقية VIP</span>
          </NavLink>
        )}

        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-gray-300 truncate">{profile.username}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-[#0d0d14]/95 backdrop-blur-sm border-l border-white/5 p-4 z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-l from-amber-400 to-amber-200 bg-clip-text text-transparent">
              VIP Game
            </h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-amber-400">VIP Game</span>
          </div>
          <div className="w-6" />
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d0d14]/95 backdrop-blur-md border-t border-white/5 px-2 py-1">
        <div className="flex items-center justify-around">
          {userNavItems.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-amber-400' : 'text-gray-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
