import { useState } from "react";
import { translations } from "../../shared/lib/translations";
import { MessageCircle, HelpCircle, ArrowLeftRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SupportProps {
  lang: "ar" | "en";
}

export const Support = ({ lang }: SupportProps) => {
  const t = translations[lang];
  const whatsappNumber = "01025563979";
  const whatsappUrl = `https://wa.me/2${whatsappNumber}`;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
    { q: t.faqQ5, a: t.faqA5 },
    { q: t.faqQ6, a: t.faqA6 },
    { q: t.faqQ7, a: t.faqA7 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-4 tracking-tight">{t.supportTitle}</h2>
          <p className="text-indigo-100 text-lg leading-relaxed font-medium">
            {t.supportSubtitle}
          </p>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HelpCircle size={20} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.faqTitle}</h3>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-2xl transition-all duration-300 ${
                openFaq === index
                  ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-start gap-4"
              >
                <span className={`text-lg font-bold ${openFaq === index ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                  {faq.q}
                </span>
                <div className={`shrink-0 transition-transform duration-300 ${openFaq === index ? "rotate-0" : "rotate-0"}`}>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-indigo-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.supportHelpTitle}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {t.supportHelpText}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded shadow-sm flex items-center justify-center text-indigo-500">
                <ArrowLeftRight size={16} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {lang === "ar" ? "حل مشاكل فنية وتقنية" : "Technical troubleshooting"}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded shadow-sm flex items-center justify-center text-emerald-500">
                <MessageCircle size={16} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {lang === "ar" ? "تقديم اقتراحات لتطوير المنصه" : "Submit platform improvement suggestions"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group transition-transform hover:scale-110 duration-300">
            <MessageCircle size={40} className="fill-emerald-100 dark:fill-emerald-900/30" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {lang === "ar" ? "تواصل مباشر" : "Direct Pulse Contact"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            {lang === "ar" ? "اضغط على الزر أدناه لبدء المحادثة فوراً مع فريق الدعم." : "Click the button below to start an instant conversation with our team."}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98]"
          >
            <MessageCircle size={24} />
            {t.supportWhatsAppBtn}
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3.5 items-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {lang === "ar" ? "نحن متاحون 24/7 لخدمتكم" : "We are available 24/7 to serve you"}
        </p>
      </div>
    </motion.div>
  );
};
