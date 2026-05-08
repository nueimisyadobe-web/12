import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import type { Referral, Profile } from '../../lib/types';
import { Card, Button, Badge, formatCurrency, formatDateTime, EmptyState, PageLoading } from '../../components/ui/Shared';
import { Users, Copy, Check, Share2, UserPlus, Gift } from 'lucide-react';

export default function Referral() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [referrals, setReferrals] = useState<(Referral & { referred?: Profile })[]>([]);
  const [referralReward, setReferralReward] = useState(5);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const referralLink = profile ? `${window.location.origin}/register?ref=${profile.referral_code}` : '';

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const [refRes, settingsRes] = await Promise.all([
        supabase.from('referrals').select('*').eq('referrer_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('admin_settings').select('value').eq('key', 'referral_reward').maybeSingle(),
      ]);
      if (refRes.data) setReferrals(refRes.data as any[]);
      if (settingsRes.data) setReferralReward(parseFloat(settingsRes.data.value));
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('success', 'تم نسخ رابط الإحالة!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'VIP Game Investment Rewards',
        text: 'Join VIP Game and start earning rewards! Use my referral code:',
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  const totalEarned = referrals.filter(r => r.is_paid).reduce((sum, r) => sum + Number(r.reward_amount), 0);
  const totalReferrals = referrals.length;

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">برنامج الإحالة</h1>
        <p className="text-sm text-gray-400">ادعُ أصدقاءك واكسب مكافآت</p>
      </div>

      {/* Referral Code & Link */}
      <Card>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold mb-1">كود الإحالة الخاص بك</h2>
          <p className="text-3xl font-extrabold text-amber-400 tracking-widest">{profile?.referral_code}</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-2">رابط الإحالة الخاص بك</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-gray-300 bg-black/30 px-3 py-2 rounded-lg break-all">
              {referralLink}
            </code>
            <button onClick={copyLink} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" onClick={copyLink} className="flex-1">
            <Copy className="w-4 h-4" /> نسخ الرابط
          </Button>
          <Button variant="secondary" onClick={shareLink} className="flex-1">
            <Share2 className="w-4 h-4" /> مشاركة
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{totalReferrals}</p>
          <p className="text-xs text-gray-500">إحالات</p>
        </Card>
        <Card className="text-center">
          <Gift className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalEarned)}</p>
          <p className="text-xs text-gray-500">مكتسب</p>
        </Card>
        <Card className="text-center">
          <UserPlus className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{formatCurrency(referralReward)}</p>
          <p className="text-xs text-gray-500">لكل إحالة</p>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <h2 className="text-lg font-bold mb-4">كيف يعمل نظام الإحالة</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-400">1</span>
            </div>
            <p className="text-sm text-gray-400">شارك رابط الإحالة أو الكود مع أصدقائك</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-400">2</span>
            </div>
            <p className="text-sm text-gray-400">يسجلون باستخدام رابطك ويفعلون عضوية VIP</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-400">3</span>
            </div>
            <p className="text-sm text-gray-400">تحصل على مكافأة {formatCurrency(referralReward)} لمرة واحدة لكل إحالة</p>
          </div>
        </div>
        <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-gray-400">هذا نظام إحالة أحادي المستوى. لا توجد عمولات متعددة المستويات. المكافآت تُدفع مرة واحدة عند تفعيل العضوية.</p>
        </div>
      </Card>

      {/* Referral List */}
      <Card>
        <h2 className="text-lg font-bold mb-4">إحالاتك</h2>
        {referrals.length === 0 ? (
          <EmptyState icon={Users} title="لا توجد إحالات بعد" description="شارك رابطك لبدء كسب مكافآت الإحالة" />
        ) : (
          <div className="space-y-3">
            {referrals.map(ref => (
              <div key={ref.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{formatDateTime(ref.created_at)}</p>
                  <p className="text-xs text-gray-500">مكافأة: {formatCurrency(ref.reward_amount)}</p>
                </div>
                <Badge variant={ref.is_paid ? 'success' : 'warning'}>
                  {ref.is_paid ? 'مدفوع' : 'قيد الانتظار'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
