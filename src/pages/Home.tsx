import { Link } from 'react-router-dom';
import { Crown, Shield, Gamepad2, Wallet, ArrowRight, Star, Users, TrendingUp, Lock, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  { q: 'كيف يعمل قفل الـ 30 يوماً؟', a: 'عند شراء عضوية VIP، يتم قفل مبلغ العضوية لمدة 30 يوماً. خلال هذه الفترة，يمكنك لعب الألعاب اليومية وكسب المكافآت. بعد 30 يوماً، يصبح رصيدك المقفل متاحاً للسحب.' },
  { q: 'هل المكافآت مضمونة؟', a: 'لا. تعتمد المكافآت على نشاطك، مشاهدة الإعلانات، وإيرادات المنصة. لا يوجد معدل عائد ثابت. كلما لعبت وشاهدت إعلانات أكثر، كلما كسبت أكثر حتى الحد اليومي.' },
  { q: 'كيف أسحب أرباحي؟', a: 'يمكنك سحب رصيد المكافآت والرصيد المتاح بمجرد بلوغ الحد الأدنى للسحب وهو $5. جميع عمليات السحب تتطلب موافقة الإدارة.' },
  { q: 'ما طرق الدفع المدعومة؟', a: 'ندعم Sham Cash كطريقة الدفع الوحيدة للإيداعات. يمكنك التحقق من الإيداع بسهولة عبر تيليغرام بعد التحويل.' },
  { q: 'هل يمكنني استرجاع رسوم العضوية؟', a: 'نعم. بعد انتهاء فترة القفل البالغة 30 يوماً، يصبح مبلغ عضويتك متاحاً في رصيدك المتاح ويمكن سحبه وفقاً للشروط والأحكام.' },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white animate-page-enter" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/3 rounded-full blur-3xl" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              VIP Game
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25">
              ابدأ الآن
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-8">
            <Star className="w-3.5 h-3.5" />
            يثق بنا أكثر من 10,000 عضو حول العالم
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              الععب. اكسب.
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              احصل على مكافآت.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            انضم إلى VIP Game Investment Rewards — العب ألعاباً يومية، شاهد الإعلانات، واكسب مكافآت حقيقية. عضويتك مؤمنة بقفل لمدة 30 يوماً وقابلة للاسترداد بالكامل.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-2xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/30 flex items-center gap-2">
              ابدأ الكسب الآن <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <Link to="/vip-plans" className="px-8 py-4 text-base font-semibold text-gray-300 border border-white/10 rounded-2xl hover:bg-white/5 transition-all">
              عرض خطط VIP
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 -mt-16 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, value: '10K+', label: 'أعضاء نشطون' },
            { icon: TrendingUp, value: '$2M+', label: 'مكافآت موزعة' },
            { icon: Gamepad2, value: '500K+', label: 'ألعاب ملعوبة' },
            { icon: Shield, value: '99.9%', label: 'وقت التشغيل' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#12121a] border border-white/5 rounded-2xl p-5 text-center">
              <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف يعمل النظام</h2>
          <p className="text-gray-400 max-w-lg mx-auto">أربع خطوات بسيطة لبدء كسب المكافآت على منصتنا</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: Users, title: 'تسجيل حساب', desc: 'أنشئ حسابك المجاني في ثوانٍ واحصل على رابط إحالتك الفريد.' },
            { step: '2', icon: Crown, title: 'اختر عضوية VIP', desc: 'اختر خطة VIP تناسب ميزانيتك — $100 أو $500 أو $1000' },
            { step: '3', icon: Gamepad2, title: 'العب يومياً', desc: 'العب ألعاباً وشاهد إعلانات كل يوم لتحصل على مكافآت تصل إلى الحد اليومي.' },
            { step: '4', icon: Wallet, title: 'اسحب أرباحك', desc: 'بعد 30 يوماً، يتم فتح رصيدك المقفل. اسحب المكافآت في أي وقت فوق $5.' },
          ].map((item, i) => (
            <div key={i} className="relative bg-[#12121a] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all group">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-amber-500/30">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VIP Plans Preview */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">خطط عضوية VIP</h2>
          <p className="text-gray-400 max-w-lg mx-auto">اختر الخطة التي تناسب طموحك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'VIP 1', price: '$100', attempts: '20/يوم', cap: 'حتى $3/يوم', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20' },
            { name: 'VIP 2', price: '$500', attempts: '70/يوم', cap: 'حتى $15/يوم', color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20', popular: true },
            { name: 'VIP 3', price: '$1,000', attempts: '150/يوم', cap: 'حتى $30/يوم', color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20' },
          ].map((plan, i) => (
            <div key={i} className={`relative bg-gradient-to-br ${plan.color} border rounded-2xl p-8 hover:scale-[1.02] transition-transform`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                  الأكثر شعبية
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-4xl font-extrabold mb-6">{plan.price}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>{plan.attempts} محاولات لعب</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>{plan.cap} مكافآت</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>فترة قفل 30 يوماً</span>
                </div>
              </div>
              <Link to="/register" className="block w-full py-3 text-center font-semibold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                ابدأ الآن
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار VIP Game؟</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: 'فترة قفل آمنة', desc: 'مبلغ عضويتك مقفل بأمان لمدة 30 يوماً وقابل للاسترداد بالكامل بعد انتهاء المدة.' },
            { icon: Shield, title: 'نظام شفاف', desc: 'جميع المعاملات مسجلة. لا رسوم مخفية. موافقة الإدارة مطلوبة لجميع العمليات المالية.' },
            { icon: Gamepad2, title: 'مكافآت ألعاب يومية', desc: 'العب ألعاباً وشاهد إعلانات يومياً لتحصل على مكافآت. كلما كنت أكثر نشاطاً، كلما كسبت أكثر.' },
          ].map((feat, i) => (
            <div key={i} className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <feat.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
          <Shield className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto" dir="rtl" lang="ar">
            هذه منصة عضويات ألعاب ومكافآت. المكافآت غير مضمونة وتعتمد على نشاط المستخدم وتوفر الإعلانات وإيرادات المنصة. مبلغ العضوية يكون مقفولًا لمدة 30 يومًا وقابلًا للاسترداد بعد انتهاء المدة حسب الشروط.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#12121a] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-right"
              >
                <span className="text-sm font-medium text-gray-200">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-amber-500/10 to-blue-500/5 border border-amber-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">مستعد لبدء الكسب؟</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">انضم إلى آلاف الأعضاء الذين يلعبون ويكسبون بالفعل على VIP Game Investment Rewards.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-2xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/30">
            إنشاء حساب مجاني <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-400">VIP Game مكافآت الاستثمار</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-gray-300 transition-colors">الشروط والأحكام</Link>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">سياسة الخصوصية</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
