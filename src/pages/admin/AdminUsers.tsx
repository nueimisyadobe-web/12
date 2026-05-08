import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile, Wallet } from '../../lib/types';
import { Card, Badge, formatCurrency, formatDateTime, PageLoading } from '../../components/ui/Shared';
import { Search, Shield, Ban, Check, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<(Profile & { wallet?: Wallet })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) {
      const userIds = data.map(u => u.id);
      const { data: wallets } = await supabase.from('wallets').select('*').in('user_id', userIds);
      const walletMap = new Map(wallets?.map(w => [w.user_id, w]));
      setUsers(data.map(u => ({ ...u, wallet: walletMap.get(u.id) })) as any[]);
    }
    setLoading(false);
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !isBanned })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u));
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !isActive })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إدارة المستخدمين</h1>
        <p className="text-sm text-gray-400">إدارة مستخدمي المنصة وحساباتهم</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
          placeholder="البحث باسم المستخدم أو البريد..."
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filtered.map(user => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  user.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400'
                }`}>
                  {user.role === 'admin' ? <Shield className="w-5 h-5" /> : user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    {user.role === 'admin' && <Badge variant="warning">مدير</Badge>}
                    {user.is_banned && <Badge variant="danger">محظور</Badge>}
                    {!user.is_active && <Badge variant="danger">غير نشط</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-600">انضم: {formatDateTime(user.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user.wallet && (
                  <div className="text-right mr-4 hidden md:block">
                    <p className="text-xs text-gray-500">مقفل: {formatCurrency(user.wallet.locked_balance)}</p>
                    <p className="text-xs text-gray-500">مكافآت: {formatCurrency(user.wallet.rewards_balance)}</p>
                    <p className="text-xs text-gray-500">متاح: {formatCurrency(user.wallet.available_balance)}</p>
                  </div>
                )}

                <button
                  onClick={() => toggleBan(user.id, user.is_banned)}
                  className={`p-2 rounded-lg transition-colors ${
                    user.is_banned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                  title={user.is_banned ? 'إلغاء الحظر' : 'حظر'}
                >
                  {user.is_banned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => toggleActive(user.id, user.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    user.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={user.is_active ? 'تعطيل' : 'تفعيل'}
                >
                  {user.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">لم يتم العثور على مستخدمين</div>
      )}
    </div>
  );
}
