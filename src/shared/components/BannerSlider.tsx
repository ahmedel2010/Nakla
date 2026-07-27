import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles } from "lucide-react";

interface BannerSliderProps {
  lang: "ar" | "en";
  onCtaClick?: (id: number) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ lang, onCtaClick }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = useMemo(() => lang === "ar" ? [
    {
      id: 1,
      tag: "",
      title: "أعد صياغة مستقبلك المهني بدقة عالمية",
      desc: "نظام تدقيق السير الذاتية الأول الذي يستخدم معايير الشركات الكبرى (Fortune 500) لضمان عبور نظام الـ ATS بنجاح.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "ابدأ الفحص المجاني"
    },
    {
      id: 2,
      tag: "",
      title: "حوّل رهبة المقابلات إلى فرص حقيقية",
      desc: "بيئة تدريبية تفاعلية تحاكي مقابلات العمل الحقيقية مع تحليل فوري لأدائك بمساعدة خبراء التوظيف.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "ابدأ التدريب الآن"
    },
    {
      id: 3,
      tag: "",
      title: "رسائل تقديم تخطف الأنظار في ثوانٍ",
      desc: "نظامنا يبني خطاب تقديم مخصص لكل وظيفة يبرز نقاط قوتك الفريدة ويقنع مسؤولي التوظيف.",
      image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "أنشئ خطابك الآن"
    },
    {
      id: 4,
      tag: "",
      title: "ملاءمة سيرتك الذاتية لاجتياز الفرز",
      desc: "نظامنا الذكي يقوم بضبط وتخصيص سيرتك الذاتية لتتطابق تمامًا مع متمتطلبات الوظيفة التي تتقدم إليها، مما يضاعف فرص قبولك بنجاح.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "ابدأ الملاءمة الآن"
    }
  ] : [
    {
      id: 1,
      tag: "PROFESSIONAL AUDIT",
      title: "Reengineer Your Career with Global Precision",
      desc: "The world's leading CV auditing engine using Fortune 500 standards to ensure your profile bypasses complex ATS filters seamlessly.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "Start Free Audit"
    },
    {
      id: 2,
      tag: "SMART SIMULATION",
      title: "Turn Interview Anxiety into Real Opportunities",
      desc: "Dynamic training environments that mirror real-world recruitment cycles with instant feedback from industry hiring experts.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "Interview Coaching"
    },
    {
      id: 3,
      tag: "STRATEGIC TAILORING",
      title: "Narratives That Capture Interest in Seconds",
      desc: "Stop sending generic messages. Our engine builds hyper-tailored cover letters that align your skills to the job's core requirements.",
      image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "Generate Letter"
    },
    {
      id: 4,
      tag: "JOB MATCHING",
      title: "Tailor Your CV to Every Job",
      desc: "Our smart engine precisely adjusts and tailors your CV to perfectly match the requirements of the job you're applying for, multiplying your chances of success.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70&fm=webp",
      cta: "Start Tailoring Now"
    }
  ], [lang]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[580px] mb-4 group select-none overflow-hidden rounded-2xl bg-slate-900 shadow-3xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0 w-full h-full"
        >

          <div className="absolute inset-0">
            <img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover filter brightness-[0.38] scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 sm:px-16 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {slides[current].tag && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2.5"
              >
                <Sparkles size={14} className="text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
                  {slides[current].tag}
                </span>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-[1.15] tracking-tight"
            >
              {slides[current].title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base sm:text-xl lg:text-2xl text-slate-200/80 font-medium leading-relaxed max-w-4xl"
            >
              {slides[current].desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <button
                onClick={() => onCtaClick && onCtaClick(slides[current].id)}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-base sm:text-lg transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
              >
                {slides[current].cta}
                <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => paginate(-1)}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 transition-transform hover:scale-125 active:scale-90"
      >
        <ChevronLeft size={80} strokeWidth={1.5} className="text-blue-500 transition-colors drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 transition-transform hover:scale-125 active:scale-90"
      >
        <ChevronRight size={80} strokeWidth={1.5} className="text-blue-500 transition-colors drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <div className="text-white/60 font-mono text-sm tracking-widest font-bold bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
          <span className="text-blue-400">{current + 1}</span> / {slides.length}
        </div>
      </div>
    </div>
  );
};
