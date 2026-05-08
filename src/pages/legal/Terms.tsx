import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Crown } from 'lucide-react';

export default function Terms() {
  const [termsText, setTermsText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      const { data } = await supabase.from('admin_settings').select('value').eq('key', 'terms_text').maybeSingle();
      if (data) setTermsText(data.value);
      setLoading(false);
    };
    fetchTerms();
  }, []);

  const defaultTerms = `
1. قبول الشروط
بمجرد الوصول إلى VIP Game Investment Rewards ("المنصة") واستخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام.

2. وصف المنصة
VIP Game Investment Rewards هي منصة عضويات ألعاب ومكافآت. يشتري المستخدمون عضويات VIP والتي تمنحهم الوصول إلى الألعاب اليومية والمكافآت المحتملة بناءً على النشاط ومشاهدة الإعلانات.

3. العضوية وفترة القفل
- رسوم العضوية تكون مقفلة لمدة 30 يوماً من تاريخ التفعيل.
- خلال فترة القفل، لا يمكن سحب مبلغ العضوية.
- بعد انتهاء فترة القفل، يصبح مبلغ العضوية متاحاً للسحب وفقاً لشروط المنصة.
- يمكن للمستخدم امتلاك عضوية واحدة نشطة فقط في كل مرة.

4. نظام المكافآت
- المكافآت غير مضمونة وتعتمد على نشاط المستخدم وتوفر الإعلانات وإيرادات المنصة.
- لا يوجد معدل عائد ثابت أو ربح مضمون.
- تنطبق حدود يومية للمكافآت بناءً على مستوى VIP.
- تُكتسب المكافآت من خلال لعب الألعاب ومشاهدة الإعلانات.
- المنصة لا تستخدم إيداعات المستخدمين الجدد لدفع مكافآت المستخدمين الحاليين.

5. الإيداعات والسحوبات
- تتطلب جميع الإيداعات موافقة الإدارة قبل تفعيل العضوية.
- الحد الأدنى للسحب هو $5.
- تتطلب جميع السحوبات موافقة الإدارة.
- قد تختلف أوقات المعالجة.
- يجب على المستخدمين تقديم تفاصيل دفع صالحة للسحوبات.

6. مسؤوليات المستخدم
- يجب على المستخدمين تقديم معلومات تسجيل دقيقة.
- لا يُسمح بامتلاك حسابات متعددة.
- يجب على المستخدمين عدم محاولة التلاعب بنظام المكافآت.
- يجب على المستخدمين عدم استخدام أدوات آلية أو بوتات.

7. تعليق الحساب
- تحتفظ المنصة بالحق في تعليق الحسابات التي تنتهك هذه الشروط.
- قد تُفقد الحسابات المعلقة مكافآتها ولكن الأرصدة المقفلة تظل خاضعة لفترة القفل البالغة 30 يوماً.

8. حدود المسؤولية
المنصة غير مسؤولة عن أي خسائر تتجاوز مبلغ العضوية المقفل للمستخدم. المكافآت غير مضمونة وتعتمد على أداء المنصة.

9. تعديل الشروط
تحتفظ المنصة بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بالتغييرات الجوهرية.

10. التواصل
لأي استفسارات حول هذه الشروط، يرجى التواصل مع إدارة المنصة.
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
        <h1 className="text-3xl font-bold mb-8">الشروط والأحكام</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Arabic Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6" lang="ar">
              <p className="text-sm text-gray-300 leading-relaxed">
                {termsText || 'هذه منصة عضويات ألعاب ومكافآت. المكافآت غير مضمونة وتعتمد على نشاط المستخدم وتوفر الإعلانات وإيرادات المنصة. مبلغ العضوية يكون مقفولًا لمدة 30 يومًا وقابلًا للاسترداد بعد انتهاء المدة حسب الشروط.'}
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              {defaultTerms.split('\n').map((line, i) => (
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
