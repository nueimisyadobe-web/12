import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Crown } from 'lucide-react';

export default function Privacy() {
  const [privacyText, setPrivacyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      const { data } = await supabase.from('admin_settings').select('value').eq('key', 'privacy_text').maybeSingle();
      if (data) setPrivacyText(data.value);
      setLoading(false);
    };
    fetchPrivacy();
  }, []);

  const defaultPrivacy = `
1. المعلومات التي نجمعها
- معلومات الحساب: البريد الإلكتروني واسم المستخدم ورقم الهاتف (اختياري).
- المعلومات المالية: تفاصيل الإيداع والسحب وعناوين المحافظ الإلكترونية.
- معلومات الجهاز: عنوان IP ونوع المتصفح ومعرفات الجهاز لأغراض أمنية.
- بيانات النشاط: جلسات اللعب ومشاهدات الإعلانات وسجل المعاملات.

2. كيف نستخدم معلوماتك
- لتقديم خدماتنا وتحسينها.
- لمعالجة الإيداعات والسحوبات.
- لمنع الاحتيال والوصول غير المصرح به.
- للتواصل بشأن تحديثات المنصة المهمة.

3. تخزين البيانات والأمان
- يتم تخزين جميع البيانات بشكل آمن باستخدام تشفير معياري في المجال.
- يتم تشفير كلمات المرور ولا يتم تخزينها أبداً بنص صريح.
- المعاملات المالية تتطلب موافقة الإدارة لأمان إضافي.

4. مشاركة البيانات
- لا نبيع بياناتك الشخصية لأطراف ثالثة.
- قد يتم مشاركة البيانات مع معالجات الدفع عند الضرورة لإتمام المعاملات.
- قد نكشف عن البيانات إذا اقتضى القانون ذلك أو لحماية أمن المنصة.

5. ملفات تعريف الارتباط
- نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على جلستك.
- قد يتم استخدام ملفات تعريف الارتباط التحليلية لتحسين أداء المنصة.

6. حقوقك
- يمكنك طلب الوصول إلى بياناتك الشخصية.
- يمكنك طلب حذف حسابك والبيانات المرتبطة به.
- يمكنك تحديث معلومات ملفك الشخصي في أي وقت.

7. الاحتفاظ بالبيانات
- يتم الاحتفاظ ببيانات الحساب النشط طوال مدة وجود الحساب.
- يتم الاحتفاظ بسجلات المعاملات لأغراض الامتثال.
- يتم حذف بيانات الحساب المحذوف خلال 30 يوماً، إلا حيثما يقتضي القانون غير ذلك.

8. التواصل
لأي استفسارات تتعلق بالخصوصية، يرجى التواصل مع إدارة المنصة.
  `.trim();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-amber-400">VIP Game</span>
        </Link>
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">العودة للرئيسية</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">سياسة الخصوصية</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Arabic Privacy Notice */}
            {privacyText && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6" lang="ar">
                <p className="text-sm text-gray-300 leading-relaxed">{privacyText}</p>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              {defaultPrivacy.split('\n').map((line, i) => (
                <p key={i} className={`text-sm leading-relaxed text-gray-400 ${line.match(/^\d+\./) ? 'font-semibold text-gray-200 mt-4' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-12">آخر تحديث: مايو 2026</p>
      </div>
    </div>
  );
}
