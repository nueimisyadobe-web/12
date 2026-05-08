import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { AdminSetting } from '../../lib/types';
import { Card, Button, PageLoading } from '../../components/ui/Shared';
import { Save } from 'lucide-react';

const hiddenKeys = ['platform_wallet_trc20', 'platform_wallet_bep20', 'paypal_email'];

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('admin_settings').select('*').order('key');
    if (data) setSettings(data.filter(s => !hiddenKeys.includes(s.key)));
    setLoading(false);
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    const newValue = editing[key];
    if (newValue === undefined) {
      setSaving(null);
      return;
    }

    await supabase.from('admin_settings').update({ value: newValue }).eq('key', key);

    setEditing(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaving(null);
    fetchSettings();
  };

  const labelMap: Record<string, string> = {
    sham_cash_number: 'رقم Sham Cash (للايداعات)',
    min_withdrawal: 'الحد الأدنى للسحب ($)',
    referral_reward: 'مكافأة الإحالة ($)',
    lock_duration_days: 'مدة القفل (أيام)',
    ad_duration_seconds: 'مدة الإعلان (ثوانٍ)',
    maintenance_mode: 'وضع الصيانة',
    terms_text: 'الشروط والأحكام',
    privacy_text: 'سياسة الخصوصية',
  };

  const sectionOrder = [
    'sham_cash_number',
    'min_withdrawal',
    'referral_reward',
    'lock_duration_days',
    'ad_duration_seconds',
    'maintenance_mode',
    'terms_text',
    'privacy_text',
  ];

  const sortedSettings = [...settings].sort((a, b) => {
    const aIdx = sectionOrder.indexOf(a.key);
    const bIdx = sectionOrder.indexOf(b.key);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">إعدادات المنصة</h1>
        <p className="text-sm text-gray-400">إعداد إعدادات المنصة وتفاصيل الدفع</p>
      </div>

      <div className="space-y-4">
        {sortedSettings.map(setting => {
          const label = labelMap[setting.key] || setting.key;
          const isLongText = setting.key.endsWith('_text');
          const isBoolean = setting.key === 'maintenance_mode';
          const isShamCash = setting.key === 'sham_cash_number';
          const currentValue = editing[setting.key] !== undefined ? editing[setting.key] : setting.value;

          return (
            <Card key={setting.id} className={isShamCash ? 'border-amber-500/30' : ''}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                    {isShamCash && <span className="text-amber-400 text-xs mr-2">(مهم - يظهر في صفحة الإيداع)</span>}
                  </label>
                  {isBoolean ? (
                    <button
                      onClick={() => setEditing(prev => ({ ...prev, [setting.key]: currentValue === 'true' ? 'false' : 'true' }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentValue === 'true' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {currentValue === 'true' ? 'الصيانة مفعلة' : 'الصيانة معطلة'}
                    </button>
                  ) : isLongText ? (
                    <textarea
                      value={currentValue}
                      onChange={e => setEditing(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-y"
                      dir="rtl"
                      lang="ar"
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={e => setEditing(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 ${
                        isShamCash ? 'font-mono text-amber-400 text-lg' : 'font-mono'
                      }`}
                      dir={isShamCash ? 'ltr' : undefined}
                    />
                  )}
                </div>

                {editing[setting.key] !== undefined && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={saving === setting.key}
                    onClick={() => handleSave(setting.key)}
                    className="mt-7"
                  >
                    <Save className="w-3.5 h-3.5" /> حفظ
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
