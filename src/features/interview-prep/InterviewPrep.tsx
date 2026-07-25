import React, { useState } from "react";
import { FileUploader } from "../../shared/components/FileUploader";
import {
  MessageSquare, RefreshCw, Sparkles, HelpCircle, AlertTriangle, BookOpen,
  UserCheck, Star, Award, PenTool, CheckCircle2, AlertCircle,
  Upload, Type,
  Brain, Compass, Target, Terminal, GraduationCap, Briefcase, TrendingUp, Layers
} from "lucide-react";
import { InterviewQuestion, FileData } from "../../shared/lib/types";
import { translations } from "../../shared/lib/translations";

const DEFAULT_PREP_QUESTIONS: InterviewQuestion[] = [
  {
    id: "preloaded-1",
    category: "behavioral",
    question: "حدثني عن موقف واجهت فيه مشكلة تقنية معقدة في مشروعك وعاق تسيير العمل، وكيف تغلبت عليها بالتفصيل؟",
    whyAsked: "اختبار مهارات التفكير المنهجي، وحل المشكلات، والتعامل مع ضغوط العمل وتتبع الأخطاء تحت ظروف تشغيل واقعية.",
    answerStrategy: "استخدم منهجية STAR: صف لمحة عامة عن الموقف (Situation) والمهمة الصعبة (Task)، ثم الإجراء الموجه الذي اتخذته (Action)، والنتائج الناجحة التي حققتها (Result) بالأرقام والمؤشرات الحقيقية إن أمكن.",
    modelAnswer: "في مشروعي الأخير لإنشاء منصة تجارة إلكترونية متكاملة، لاحظنا بطء واجهة الـ API وتأخر الاستجابة ليصل إلى 6 ثوانٍ عند محاكاة ضغط الزيارات والتحميل الكثيف لإتمام الدفع. قمت بالبحث والمراقبة واكتشفت استعلامات N+1 تكرارية في جلب بيانات الباقات والعروض النشطة من قاعدة البيانات.\n\nالإجراء: قمت بإعادة كتابة الاستعلامات باستخدام تقنية التحميل المسبق للعلاقات (Eager Loading)، وتفعيل طبقة تخزين مؤقت باستخدام Redis للبيانات الاستراتيجية غير المتغيرة.\n\nالنتيجة: انخفض وقت الاستجابة بنسبة 95% ليصل إلى 250 مللي ثانية فقط، وتضاعفت الطاقة الاستيعابية لمعالجة الطلبات المتزامنة بمعدل 4 مرات دون الحاجة لترقية السيرفرات السحابية المكلفة."
  },
  {
    id: "preloaded-2",
    category: "job-spec-tech",
    question: "ما هي استراتيجياتك العملية لتحسين أداء تطبيق ويب يعاني من بطء شديد في التحميل الأولي (First Meaningful Paint)؟",
    whyAsked: "قياس الفهم المعمق لتجربة المستخدم، ومؤشرات الأداء الحيوية للويب (Core Web Vitals)، وطريقة تحسين ترتيب الظهور في محركات البحث SEO.",
    answerStrategy: "قسّم إجابتك بمثالية إلى تحسين طبقة الشبكة (Network)، وترشيد كود البناء (Frontend Core)، واستراتيجيات التخزين وتحميل الصور الذكية.",
    modelAnswer: "لحل مشاكل الأداء الأولي، أقوم أولاً بتحليل الأداء عن طريق Lighthouse وتحديد النقاط الحرجة. خطتي تشمل:\n1. تطبيق تقسيم الكود البرمجي (Code Splitting) واستخدام التحميل الكسول (Lazy Loading) للموجهات والمكونات غير الأساسية.\n2. تحسين أحجام وصيغ الصور وتحويلها إلى نسق WebP حديثة مع توفير كتل صور متجاوبة (Responsive Srcset).\n3. تفعيل الضغط الذكي (Gzip/Brotli) للملفات عبر خادم الويب واستضافة الأصول على شبكة توصيل محتوى (CDN).\n4. مراجعة وتقليص حجم الـ Bundle size وإزالة الأكواد والمكتبات غير المستخدمة (Tree Shaking).\n5. تأجيل تحميل نصوص البرمجة غير الأساسية (مثل أدوات التتبع والتحليل) باستخدام وسم defer أو async."
  },
  {
    id: "preloaded-3",
    category: "situational",
    question: "لو طلب منك أحد مسؤولي الإدارة العليا إضافة ميزة ضخمة وجديدة فوراً قبل إطلاق التطبيق بـ 24 ساعة فقط، فكيف تتصرف بحرفية؟",
    whyAsked: "يتحقق المقابل من مدى التوازن لديك بين تلبية متطلبات بيئة العمل السريعة وحماية جودة واستقرار الكود البرمجي البرودكشن.",
    answerStrategy: "أظهر مرونة عالية وتفهّماً لحاجة العمل مع الحفاظ على المنطق الفني السليم ودبلوماسية التخفيف من المخاطر وتقديم الحلول البديلة الحكيمة.",
    modelAnswer: "1. أولاً، أستمع باهتمام للمسؤول لفهم الاحتياج التجاري الحقيقي والمستعجل للميزة وأثرها الفوري على العملاء.\n2. ثانياً، أقوم بإجراء تقييم سريع للمخاطر وتوضيحها بفهم ناضج: فإضافة كود جديد وضخم قبل الإطلاق بـ 24 ساعة دون وقت كافٍ للاختبار التراجعي يعرض كامل المنصة لخطر الانهيار التام.\n3. ثالثاً، أطرح الحلول البديلة: إمكانية دمج الميزة الجديدة وتصميمها ولكن إخفائها خلف مفتاح ميزة (Feature Flag) مخصص لنقوم باختبارها بحرية وتفعيلها تلقائياً بعد استتباب الإطلاق الفعلي بيوم أو يومين، أو إطلاق مسار مبسط (MVP) منها لتجربة التفاعل مع ترحيل الباقي للتحديث القادم. هذا التواصل يعزز ثقة الإدارة ويحمي استقرار الخدمة."
  },
  {
    id: "preloaded-4",
    category: "cv-projects",
    question: "عند بناء تطبيقات React واسعة النطاق، كيف تدير الحالة (State Management) بشكل يضمن عدم حدوث إعادة رندرة غير ضرورية (Unnecessary Re-renders)؟",
    whyAsked: "اختبار الوعي المعمق بآليات تشغيل محرك React تحت قشرة الواجهات وتحسين أداء سرعة الواجهات أمام متطلبات الذاكرة العالية.",
    answerStrategy: "اشرح بوضوح كيف تمنع React كسر دقة المقارنة المرجعية (Referential Equality) واستخدام منتقيات الريدكس الدقيقة أو تفكيك مسارات السياق (Context Split).",
    modelAnswer: "لمجابهة مشاكل إعادة الرندرة الشاملة، أتبع القنوات الفنية التالية:\n1. استخدام الدوال المنتقية للدقة (Selector Functions) مثل useSelector في Redux لضمان عدم استيقاظ المكون إلا عند تغير الجزء المخصص الذي يستخدمه تحديداً.\n2. عند الاعتماد على React Context، أقوم بتقسيم السياق إلى سياق للبيانات وسياق الآخر للعمليات المحدثة حتى لا تضطر الأزرار والمشاهد لإعادة البناء عند تغير البيانات.\n3. تغليف المكونات الفرعية البعيدة والمكلفة باستخدام `React.memo` لعرقلة إعادة الريندر التلقائي والمدفوع بتغيرات المكون الأب.\n4. استغلال خطافات `useMemo` و `useCallback` لتثبيت مراجع الحسابات والمصفوفات وتوقيعات الدوال الممررة كخصائص (Props) تفادياً لكسر المساواة السطحية."
  },
  {
    id: "preloaded-5",
    category: "behavioral",
    question: "لماذا نختارك أنت بالتحديد للانضمام لفريقنا المهني من بين جميع المتقدمين المميزين؟",
    whyAsked: "قياس مستوى الثقة المدروسة بالذات، ودرجة المواءمة الشخصية لثقافة المؤسسة، ومعرفة القيمة المضافة التي ستحملها للفريق.",
    answerStrategy: "ابتعد عن العبارات النمطية، واقرن شغفك التقني المتقدم بمهارات تذليل تحديات ونمو أعمال الشركة الفعلية مع التركيز على الكفاءة والتناغم.",
    modelAnswer: "بناءً على فهمي العميق لمتطلبات دوركم الوظيفي، أرى أنكم لا تبحثون عن مجرد مطور يكتب الكود بشكل آلي، بل عن شريك تقني يمتلك عين تجارية تسعى لتحسين كفاءة المنتج ورفع معدلات التحويل وتطوير تجارب مستخدم مثمرة.\n\nفي دوري السابق، بفضل دمجي للشغف الفني مع مهارات قياس الأثر التجاري والتحكم الذاتي، تمكنت من رفع مستوى التحويل بنسبة 18% وتحسين سرعة الأداء للفريق. أنا جاهز لنقل هذه المنهجية وحب الاستكشاف والتلاؤم لفريقكم لتسريع وتيرة تحقيق أهدافكم المشتركة."
  }
];

const DEFAULT_PREP_QUESTIONS_EN: InterviewQuestion[] = [
  {
    id: "preloaded-1",
    category: "behavioral",
    question: "Tell me about a complex technical problem you encountered in a project, how it impacted the workflow, and how you resolved it?",
    whyAsked: "Tests systemic thinking, root-cause troubleshooting, performance under duress, and architectural debugging skills.",
    answerStrategy: "Use the STAR methodology: Situation/Task context, explicit Action troubleshooting, and high-impact Result quantified with real metrics.",
    modelAnswer: "In my last e-commerce app project, API response lag soared to 6 seconds during concurrent simulated checkouts. I traced it to repeated database N+1 queries fetching duplicate subscription package details.\n\nAction: I refactored query logic to employ eager loading and activated Redis caching for strategic, static data items.\n\nResult: API response times plummeted by 95% to 250ms, boosting concurrent checkout capacity fourfold without needing expensive server upgrades."
  },
  {
    id: "preloaded-2",
    category: "job-spec-tech",
    question: "What are your practical techniques for boosting frontend web application performance and improving First Meaningful Paint speeds?",
    whyAsked: "Measures advanced depth in user experience, Core Web Vitals optimization, and modern search engine alignment.",
    answerStrategy: "Structure recommendations across modern caching layers, asset bundle size reduction, lazy component routing, and network response efficiency.",
    modelAnswer: "To optimize critical paint timelines, I employ these channels:\n1. Strategic bundler code-splitting to lazy-load non-critical dashboard files and peripheral routes on demand.\n2. Compressing assets to modern WebP structures using automated gulp/webpack processors with responsive image source markers.\n3. Serving static bundle elements via geographically close Content Delivery Networks (CDNs) compressed in Brotli format.\n4. Removing unused dead libraries and utilizing dynamic imports for analytics plugins (utilizing async/defer hooks)."
  },
  {
    id: "preloaded-3",
    category: "situational",
    question: "If an executive stakeholder demands a large, unverified feature be deployed 24 hours before a major product production release, how do you respond?",
    whyAsked: "Examines your balance between keeping commercial agility high and maintaining release stability guidelines.",
    answerStrategy: "Acknowledge the strong commercial utility, explain risks diplomatically, and offer bulletproof alternative routes like feature gating.",
    modelAnswer: "1. Active listening: I seek to hear the stakeholder to understand the underlying commercial outcome desired.\n2. Risk illustration: I detail the technical risks of launching massive untested changes 24 hours prior to launch, exposing existing clients to total outage vulnerabilities.\n3. Collaborative alternative: I propose integrating the draft code behind a secure 'Feature Flag'. This isolates the code safely during release, letting us verify behavior in production post-launch before instantly toggling it live for selected cohorts."
  },
  {
    id: "preloaded-4",
    category: "cv-projects",
    question: "When orchestrating large-scale application states, how do you prevent re-rendering issues from impacting render pipelines?",
    whyAsked: "Investigates deep awareness of runtime state updates, UI lifecycle hooks, and rendering reconciliation cycles.",
    answerStrategy: "Argue clearly around component structure separation, standard memoization techniques, and decoupled selectors.",
    modelAnswer: "To optimize high-density reactive UI states, I structure components dynamically through:\n1. Utilizing selector queries like Redux `useSelector` to ensure child elements only subscribe to localized state properties.\n2. Decoupling React context providers into data versus mutate channels so layout buttons do not trigger rebuilds upon value modifications.\n3. Using `React.memo` gates around expensive display components to safely bypass the standard tree render recursion.\n4. Employing referential anchors such as `useCallback` and `useMemo` on functional props to maintain strict structural identity across renders."
  },
  {
    id: "preloaded-5",
    category: "behavioral",
    question: "Why should we hire you over other qualified candidates applying for this role?",
    whyAsked: "Measures self-evaluation accuracy, company cultural alignment, and the key technical value proposition you represent.",
    answerStrategy: "Avoid generic clichés. Link performance standards, system automation passion, and metric-driven business outcomes to their current goals.",
    modelAnswer: "Beyond basic software engineering practices, my core differentiator is aligning code metrics to commercial performance and business outcomes.\n\nIn my previous role, by introducing localized optimization and agile system tests, I increased funnel conversion rates by 18% and cut overall load bottlenecks. I am eager to apply this engineering mindset to help your team hit targets faster."
  }
];

interface InterviewPrepProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ onActionStart, lang = "ar" }) => {
  const t = translations[lang];
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalRoadmap, setTechnicalRoadmap] = useState<InterviewQuestion[]>([]);
  const [experienceBased, setExperienceBased] = useState<InterviewQuestion[]>([]);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const handleReset = () => {
    setTechnicalRoadmap([]);
    setExperienceBased([]);
    setDetectedRole(null);
    setRevealedAnswers({});
    setSimulationOpen({});
    setUserAnswers({});
    setEvaluations({});
  };

  const [activeCategory, setActiveCategory] = useState<"all" | "technical" | "experience">("all");
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const [simulationOpen, setSimulationOpen] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluatingIds, setEvaluatingIds] = useState<Record<string, boolean>>({});
  const [evaluations, setEvaluations] = useState<Record<string, {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestedSpicedAnswer: string;
  }>>({});

  const allQuestions = [...technicalRoadmap, ...experienceBased];
  const questionsToRender = activeCategory === "all"
    ? allQuestions
    : activeCategory === "technical"
      ? technicalRoadmap
      : experienceBased;

  const handleGenerateQuestions = async () => {
    if (!cvFile) {
      setError(lang === "ar" ? "يرجى رفع ملف السيرة الذاتية (PDF) أولاً للمطابقة وصياغة أسئلة مشاريعك." : "Please upload your CV (PDF) first to match and tailor questions to your projects.");
      return;
    }
    if (!jobDescription.trim()) {
      setError(lang === "ar" ? "من فضلك اكتب أو الصق الوصف الوظيفي لاستخراج الأسئلة المتوقعة." : "Please enter or paste the target Job Description first.");
      return;
    }

    onActionStart(async () => {
      setLoading(true);
      setError(null);
      setTechnicalRoadmap([]);
      setExperienceBased([]);
      setDetectedRole(null);
      setRevealedAnswers({});
      setSimulationOpen({});
      setUserAnswers({});
      setEvaluations({});

      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription: jobDescription.trim(),
            cvText: cvText.trim() || undefined,
            cvFile: cvFile ? { data: cvFile.base64, mimeType: cvFile.mimeType } : undefined,
            lang: lang
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || (lang === "ar" ? "فشل الخادم في توليد أسئلة المقابلة." : "Server failed to compile interview questions."));
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned an invalid response.");
        }
        const data = await response.json();
        setTechnicalRoadmap(data.technicalRoadmap || []);
        setExperienceBased(data.experienceBased || []);
        setDetectedRole(data.detectedRole || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || (lang === "ar" ? "حدث خطأ أثناء التواصل مع سيرفر توليد الأسئلة." : "An error occurred while calling generator endpoints."));
      } finally {
        setLoading(false);
      }
    });
  };

  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEvaluateAnswer = async (id: string, question: string, modelAnswer: string) => {
    const userAnswer = userAnswers[id]?.trim();
    if (!userAnswer) return;

    onActionStart(async () => {
      setEvaluatingIds(prev => ({ ...prev, [id]: true }));
      try {
        const response = await fetch("/api/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, modelAnswer, userAnswer, lang: lang })
        });

        if (!response.ok) {
          throw new Error(lang === "ar" ? "فشلت عملية تقييم الإجابة." : "Failed to model interactive response evaluation.");
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned an invalid response.");
        }
        const data = await response.json();
        setEvaluations(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error(err);
      } finally {
        setEvaluatingIds(prev => ({ ...prev, [id]: false }));
      }
    });
  };

  const getCategoryBadgeClass = (category?: string) => {
    if (!category) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    const cat = category.toLowerCase();
    if (cat.includes("tech") || cat.includes("roadmap")) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
    if (cat.includes("proj") || cat.includes("cv")) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    }
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
  };

  const getCategoryName = (category?: string, topic?: string) => {
    if (topic) return topic;
    if (!category) return lang === "ar" ? "سؤال عام" : "General Question";
    const cat = category.toLowerCase();
    if (cat.includes("tech") || cat.includes("roadmap")) {
      return lang === "ar" ? "خارطة طريق تقنية" : "Technical Roadmap";
    }
    if (cat.includes("proj")) {
      return lang === "ar" ? "مشروع من الـ CV" : "CV Project Deep Dive";
    }
    if (cat.includes("situational")) {
      return lang === "ar" ? "مواقف وسيناريوهات" : "Situational / STAR";
    }
    return lang === "ar" ? "تحليل خبرة" : "Experience Analysis";
  };

  return (
    <div className="space-y-12 pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>

      {error && (
        <div id="prep-error-alert" className={`p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm ${lang === "ar" ? "text-right" : "text-left"}`}>
          <AlertTriangle className="flex-shrink-0" size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading && (
        <div id="prep-loading-overlay" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            <MessageSquare className="absolute text-indigo-505 text-slate-600 dark:text-slate-350" size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-white text-center">
              {lang === "ar" ? "جاري تحليل تفاصيل الدور الوظيفي واستنباط الأسئلة الأكثر شيوعاً..." : "Analyzing functional details and extracting predictive interview vectors..."}
            </h4>
            <p className="text-xs text-slate-405 dark:text-slate-500 text-center">
              {lang === "ar"
                ? "يقوم الذكاء الاصطناعي ببناء الأسئلة وخطوات الجواب والحلول النموذجية لتستعد بشكل متكامل."
                : "AI is reconstructing baseline checklists, optimal response guides, and evaluation rubrics."}
            </p>
          </div>
        </div>
      )}

      {allQuestions.length === 0 && !loading && (
        <div className="premium-card p-8 sm:p-12 space-y-10 animate-fade-in">

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {lang === "ar" ? "توليد أسئلة مقابلات مخصصة لمشاريعك ووظيفتك" : "Targeted Interview Questions Predictor"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
              {lang === "ar"
                ? "ارفع سيرتك الذاتية ومستند الوصف الوظيفي لاستخراج أسئلة متطابقة تماماً مع مشاريعك السابقة وأسئلة خاصة بالوظيفة."
                : "Provide both your PDF resume and target Job Description. The AI will engineer highly tailored questions bridging your past projects and the needs of the target role."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">

            <div className="space-y-4 h-full flex flex-col justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-500" />
                  <span>{lang === "ar" ? "1. سيرة ذاتية *" : "1. Resume File (PDF only) *"}</span>
                </label>
                <p className="text-xs text-slate-400 mb-2 font-medium">
                  {lang === "ar" ? "استخلاص تفاصيل مشاريعك السابقة وإنجازاتها لطرح الأسئلة المطابقة." : "Extract details of your past projects to test real implementation claims."}
                </p>
              </div>
              <div className="flex-1 min-h-[220px]">
                 <FileUploader
                  selectedFile={cvFile}
                  onFileLoaded={(file) => {
                    setCvFile(file);
                  }}
                  accept=".pdf"
                  label={lang === "ar" ? "اسحب وأسقط ملف الـ CV الخاص بك هنا أو اضغط للاختيار" : "Drag and drop your PDF resume here, or click to browse"}
                  lang={lang}
                />
              </div>
            </div>

            <div className="space-y-4 h-full flex flex-col justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-705 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Terminal size={14} className="text-slate-500" />
                  <span>{lang === "ar" ? "2. تفاصيل الوصف الوظيفي المستهدف *" : "2. Target Job Description *"}</span>
                </label>
                <p className="text-xs text-slate-400 mb-2 font-medium">
                  {lang === "ar" ? "لصق بنود الوصف الوظيفي الشامل وتفاصيل التقنيات المطلوبة." : "Paste functional expectations, core frameworks, and team metrics."}
                </p>
              </div>
              <div className="flex-1">
                <textarea
                  id="interview-job-desc"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={lang === "ar" ? "الصق هنا بنود الوصف الوظيفي المستهدف، المهارات المطلوبة، والمسؤوليات الرئيسية..." : "Paste the requirements, targeted stack details, daily responsibilities, etc..."}
                  className="w-full h-56 p-6 bg-slate-50 dark:bg-slate-950/30 border-2 border-slate-100 dark:border-slate-800/80 focus:border-indigo-500/10 dark:focus:border-white/10 rounded-[2rem] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-6 text-center">
            <button
              id="generate-questions-btn"
              onClick={handleGenerateQuestions}
              disabled={loading || !cvFile || !jobDescription.trim()}
              className="premium-button-primary min-w-[300px] py-5 text-base flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <span>{lang === "ar" ? "ابدأ توليد أسئلة المقابلة الشخصية المطابقة" : "Generate Custom Match Questions"}</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {lang === "ar" ? "يتطلب وجود السيرة الذاتية والوصف الوظيفي معاً لتأمين أقصى دقة للأسئلة." : "⚡ Requires both your PDF resume and target JD to achieve tailored relevance."}
            </span>
          </div>
        </div>
      )}

      {allQuestions.length > 0 && !loading && (
        <div id="questions-dashboard-view" className="space-y-8 animate-fade-in">

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-350 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition"
            >
              {lang === "ar" ? "🔄 إجراء تحضير لوظيفة أخرى (إعادة تعيين)" : "🔄 Prepare for another role (Reset)"}
            </button>
          </div>

          {(() => {
            const answeredCount = Object.keys(userAnswers).filter(id => userAnswers[id]?.trim().length > 0).length;
            const withEvaluationCount = Object.keys(evaluations).length;
            const averageScore = withEvaluationCount > 0
              ? Math.round(Object.keys(evaluations).reduce((acc, key) => acc + (evaluations[key]?.score || 0), 0) / withEvaluationCount)
              : 0;

            const isUsingDefault = allQuestions.some(q => q.id.startsWith("preloaded-"));

            let readinessStatus = lang === "ar" ? "مبتدئ التدريب 🐣" : "Training Beginner 🐣";
            let statusColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
            let readinessTips = lang === "ar"
              ? "ابدأ بكتابة إجابتك على أي سؤال لتوليد درجتك واحتساب مؤشر الجاهزية بالذكاء الاصطناعي."
              : "Begin entering responses to check performance and calculate dynamic readiness score.";

            if (averageScore >= 85) {
              readinessStatus = lang === "ar" ? "جاهز وبقوة للمنافسة العالمية! 🏆" : "Exemplary Readiness 🏆";
              statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
              readinessTips = lang === "ar"
                ? "أداء استثنائي! إجاباتك نموذجية وتحمل تأثيرات STAR قوية ومليئة بالمصطلحات الاحترافية."
                : "Outstanding quality! Your responses leverage robust STAR signals and perfect wording.";
            } else if (averageScore >= 70) {
              readinessStatus = lang === "ar" ? "مستوى متقدّم ومبشر جداً 📈" : "Solid Proficient Level 📈";
              statusColor = "bg-sky-500/10 text-sky-500 border-sky-500/25";
              readinessTips = lang === "ar"
                ? "ممتاز، طوّر صياغاتك باستخدام الأرقام والمؤشرات المالية لرفع النتيجة للتلميع الذهبي."
                : "Great performance, decorate sentences with numeric metrics to gain golden standards.";
            } else if (averageScore > 0) {
              readinessStatus = lang === "ar" ? "جاري البناء والتطوير" : "Building Foundations";
              statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/25";
              readinessTips = lang === "ar"
                ? "صياغاتك جيدة لكن تحتاج لتبني بنية الجواب التدريجية وتوضيح الحلول التقنية بعمق أكبر."
                : "Decent formulations, but organize answers with structured sequences for better score rates.";
            }

            return (
              <div className={`bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl ${lang === "ar" ? "text-right" : "text-left"}`}>

                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 ${lang === "ar" ? "" : "md:flex-row-reverse"}`}>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 justify-start ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                      {isUsingDefault && (
                        <span className="text-xs bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-500/20">
                          {lang === "ar" ? "💡 وضع التدريب السريع والتعليمي نشط" : "💡 Active Training Bank mode"}
                        </span>
                      )}
                      {withEvaluationCount > 0 && (
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${statusColor} font-bold animate-pulse`}>
                          {readinessStatus}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {detectedRole ? (lang === "ar" ? `تحضيرك لوظيفة: ${detectedRole}` : `Preparing for: ${detectedRole}`) : (lang === "ar" ? "لوحة قياس استعدادك وجاهزيتك للمقابلة" : "AI Role Readiness Scorecard")}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {isUsingDefault
                        ? (lang === "ar"
                          ? "لقد قمنا بتوفير 5 أسئلة نموذجية استراتيجية شائعة جداً بمصر والوطن العربي لتجرب ميزة محاكاة المقابلات الفورية بالذكاء الاصطناعي وتطبيق STAR!"
                          : "We aggregated 5 highly standard strategic questions to let you practice interactive mockup simulations and automated STAR scoring!")
                        : (lang === "ar"
                          ? "لوحة تحليلات تفاعلية تقيس مستوى صياغة إجاباتك الفنية والمهارية مقارنة بمعايير مدراء التوظيف الدوليين."
                          : "An analytics panel benchmarking your technical alignment & behavioral answers against international recruiter profiles.")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 relative z-10">

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block pb-1">
                      {lang === "ar" ? "معدل الإنجاز والحل:" : "Completion & Solve Rate:"}
                    </span>
                    <div className={`flex items-baseline gap-2 justify-start ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                      <span className="text-2xl font-black text-indigo-400 font-sans">{answeredCount}</span>
                      <span className="text-xs text-slate-500">
                        {lang === "ar" ? `من أصل ${allQuestions.length} أسئلة` : `out of ${allQuestions.length} questions`}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(answeredCount / (allQuestions.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block pb-1">
                      {lang === "ar" ? "متوسط تقييم الإجابات الفنية:" : "Average Answer Accuracy:"}
                    </span>
                    <div className={`flex items-baseline gap-2 justify-start ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                      <span className="text-2xl font-black text-emerald-400 font-sans">
                        {averageScore > 0 ? `${averageScore}%` : "—"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {lang === "ar" ? "دقة المعايير والحلول" : "technical rigor standard"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${averageScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block pb-1">
                      {lang === "ar" ? "الأوسمة المستحقة المكتسبة:" : "Milestone Badges Earned:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {withEvaluationCount === 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {lang === "ar" ? "ابدأ التدريب لكسب الأوسمة الرسمية ✨" : "Start practicing to earn official badges ✨"}
                        </span>
                      ) : (
                        <>
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded font-bold">
                            {lang === "ar" ? "🎖️ خبير التحضير" : "🎖️ Prep Expert"}
                          </span>
                          {averageScore >= 80 && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded font-bold">
                              {lang === "ar" ? "💎 نجم طاقة STAR" : "💎 STAR Performer"}
                            </span>
                          )}
                          {answeredCount >= 3 && (
                            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-900 px-2 py-0.5 rounded font-bold">
                              {lang === "ar" ? "🔥 مثابر صلب" : "🔥 Persistent Dev"}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 text-xs font-medium text-slate-300 flex items-start gap-2 relative z-10 leading-relaxed font-sans mt-2">
                  <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <span><strong>{lang === "ar" ? "ملاحظات التوجيه الموجه إليك:" : "Your Aligned Recommendations:"}</strong> {readinessTips}</span>
                </div>

              </div>
            );
          })()}

          <div className={`bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap gap-1.5 shadow-sm inline-flex ${lang === "ar" ? "text-right" : "text-left"}`}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900"
              }`}
            >
              <Layers size={13} />
              <span>{lang === "ar" ? `جميع الأسئلة (${allQuestions.length})` : `All Questions (${allQuestions.length})`}</span>
            </button>
            <button
              onClick={() => setActiveCategory("technical")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === "technical"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900"
              }`}
            >
              <Terminal size={13} />
              <span>{lang === "ar" ? `خارطة الطريق التقنية للوظيفة (${technicalRoadmap.length})` : `Role Technical Roadmap (${technicalRoadmap.length})`}</span>
            </button>
            <button
              onClick={() => setActiveCategory("experience")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === "experience"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900"
              }`}
            >
              <Briefcase size={13} />
              <span>{lang === "ar" ? `الخبرة والمشاريع والمواقف (${experienceBased.length})` : `Experience & Situations (${experienceBased.length})`}</span>
            </button>
          </div>

          <div className="space-y-4">
            {questionsToRender.map((q, idx) => (
              <div
                key={q.id || idx}
                id={`question-card-${q.id || idx}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-md transition duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-805/40 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-350">
                      {idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeClass(q.category)}`}>
                      {getCategoryName(q.category, q.topic)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <h4 className={`text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5 ${lang === "ar" ? "flex-row" : "flex-row-reverse"}`}>
                        <BookOpen size={14} className="text-slate-400" />
                        {lang === "ar" ? "الهدف من السؤال:" : "Goal of this question:"}
                      </h4>
                      <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {q.whyAsked}
                      </p>
                    </div>

                    <div className="bg-amber-50/40 dark:bg-amber-955/5 p-3.5 rounded-xl border border-amber-100/60 dark:border-slate-800/50">
                      <h4 className={`text-xs font-bold text-amber-650 dark:text-amber-400 flex items-center gap-1.5 mb-1.5 ${lang === "ar" ? "flex-row" : "flex-row-reverse"}`}>
                        <UserCheck size={14} />
                        {lang === "ar" ? "استراتيجية ونمط الإجابة:" : "Optimal Response Strategy:"}
                      </h4>
                      <p className={`text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium ${lang === "ar" ? "text-right" : "text-left"}`}>
                        {q.answerStrategy}
                      </p>
                    </div>
                  </div>

                  <div className={`pt-2 flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800 ${lang === "ar" ? "" : "sm:flex-row-reverse"}`}>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === "ar" ? "تعلّم وقارن أو تدرّب على صياغة الجواب عملياً بالذكاء الاصطناعي" : "Learn & rephrase or practice answering dynamically using interactive AI models"}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <button
                        id={`toggle-sim-btn-${q.id || idx}`}
                        onClick={() => setSimulationOpen(p => ({ ...p, [q.id || idx.toString()]: !p[q.id || idx.toString()] }))}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 ${
                          simulationOpen[q.id || idx.toString()]
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          {simulationOpen[q.id || idx.toString()]
                            ? (lang === "ar" ? "إغلاق التدريب والمحاكاة" : "Close Interactive Sandbox")
                            : (lang === "ar" ? "تفعيل التدريب ومحاكاة المقابلة" : "Connect AI Simulator Mode")}
                        </span>
                      </button>

                      <button
                        id={`toggle-answer-btn-${q.id || idx}`}
                        onClick={() => toggleAnswer(q.id || idx.toString())}
                        className="px-4 py-1.5 text-xs font-bold text-indigo-600 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                      >
                        {revealedAnswers[q.id || idx.toString()]
                          ? (lang === "ar" ? "إخفاء الجواب النموذجي" : "Hide Model Answer")
                          : (lang === "ar" ? "إظهار الجواب النموذجي المقترح" : "Reveal Model Answer Blueprint")}
                      </button>
                    </div>
                  </div>

                  {revealedAnswers[q.id || idx.toString()] && (
                    <div id={`model-answer-block-${q.id || idx}`} className={`p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 rounded-xl space-y-2 animate-fade-in ${lang === "ar" ? "text-right" : "text-left"}`}>
                      <div className={`flex items-center gap-1.5 text-emerald-650 dark:text-emerald-400 font-bold text-xs ${lang === "ar" ? "" : "flex-row-reverse"}`}>
                        <span>{lang === "ar" ? "الجواب النموذجي المقترح (Model Answer):" : "Suggested Model Answer Blueprint:"}</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap">
                        {q.modelAnswer}
                      </p>
                    </div>
                  )}

                  {simulationOpen[q.id || idx.toString()] && (
                    <div id={`sim-block-${q.id || idx}`} className={`p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in font-sans ${lang === "ar" ? "text-right" : "text-left"}`}>
                      <div className="space-y-1">
                        <h4 className={`text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 ${lang === "ar" ? "" : "flex-row-reverse"}`}>
                          <CheckCircle2 size={14} className="text-indigo-505" />
                          <span>{lang === "ar" ? "تطبيق المحاكاة ومدرّب الذكاء الاصطناعي التفاعلي" : "Interactive Copilot & Trainer Canvas"}</span>
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                          {lang === "ar"
                            ? "اكتب إجابتك الخاصة على هذا السؤال لنقوم بتحليلها باستخدام منهجية STAR، واحتساب نتيجتها، وتقديم صياغة محسنة ومعدلة لك فوراً بلمسة احترافية!"
                            : "Draft your actual response under mock interview pressure. AI will run diagnostics benchmarked on STAR metrics."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          value={userAnswers[q.id || idx.toString()] || ""}
                          onChange={(e) => setUserAnswers(p => ({ ...p, [q.id || idx.toString()]: e.target.value }))}
                          placeholder={lang === "ar" ? "تخيل نفسك في المقابلة الآن! اكتب ردك وصياغتك للجواب هنا..." : "Place yourself inside the hot-seat! Frame your key value props here..."}
                          className={`w-full h-28 p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed ${lang === "ar" ? "text-right text-dir-rtl" : "text-left text-dir-ltr"}`}
                        />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleEvaluateAnswer(q.id || idx.toString(), q.question, q.modelAnswer)}
                            disabled={evaluatingIds[q.id || idx.toString()] || !userAnswers[q.id || idx.toString()]?.trim()}
                            className="w-full sm:w-auto px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-600 dark:hover:bg-indigo-50 transition duration-200 disabled:opacity-40"
                          >
                            {evaluatingIds[q.id || idx.toString()] ? (
                              <>
                                <RefreshCw className="animate-spin" size={12} />
                                <span>{lang === "ar" ? "جاري تحليل الرد" : "Analyzing response..."}</span>
                              </>
                            ) : (
                              <>
                                <span>{lang === "ar" ? "تقييم إجابتي بالذكاء الاصطناعي" : "Rate My Answer with AI"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {evaluations[q.id || idx.toString()] && (
                        <div className={`pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in ${lang === "ar" ? "text-right" : "text-left"}`}>
                          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 p-3 rounded-xl ${lang === "ar" ? "" : "sm:flex-row-reverse"}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                {lang === "ar" ? "النتيجة التقديرية للإجابة:" : "Estimated Rigor Score:"}
                              </span>
                              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg px-2.5 py-1 font-sans text-xs font-black">
                                {evaluations[q.id || idx.toString()].score} / 100
                              </div>
                            </div>

                            <span className="text-[9px] text-slate-400">
                              {lang === "ar" ? "تم فحص مؤشرات الأداء والأفعال التأثيرية الفعالة" : "Audited against optimal action verbs and technical fluency indicators"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div className="p-3 bg-emerald-50/15 dark:bg-emerald-950/5 border border-emerald-100/40 dark:border-emerald-900/10 rounded-xl space-y-1.5 text-left text-dir-ltr">
                              <h5 className={`text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ${lang === "ar" ? "flex-row" : "flex-row-reverse"}`}>
                                <CheckCircle2 size={13} />
                                <span>{lang === "ar" ? "جوانب القوة في صياغتك:" : "Demonstrated Strengths:"}</span>
                              </h5>
                              <ul className={`list-disc space-y-1 text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed ${lang === "ar" ? "pr-4 pl-0 text-right" : "pl-4 pr-0 text-left"}`}>
                                {evaluations[q.id || idx.toString()].strengths.map((str, i) => (
                                  <li key={i}>{str}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 bg-amber-50/15 dark:bg-amber-955/5 border border-amber-100/40 dark:border-amber-900/10 rounded-xl space-y-1.5 text-left text-dir-ltr">
                              <h5 className={`text-[11px] font-bold text-amber-600 flex items-center gap-1 ${lang === "ar" ? "flex-row" : "flex-row-reverse"}`}>
                                <AlertCircle size={13} />
                                <span>{lang === "ar" ? "نصائح لتعزيز الرد وتحسينه:" : "Coaching Critiques & Actions:"}</span>
                              </h5>
                              <ul className={`list-disc space-y-1 text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed ${lang === "ar" ? "pr-4 pl-0 text-right" : "pl-4 pr-0 text-left"}`}>
                                {evaluations[q.id || idx.toString()].improvements.map((imp, i) => (
                                  <li key={i}>{imp}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="p-4 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/30 rounded-xl space-y-2">
                            <h5 className={`text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 ${lang === "ar" ? "" : "flex-row-reverse"}`}>
                              <Sparkles size={12} className="text-amber-400 fill-amber-400" />
                              <span>{lang === "ar" ? "الرد المطور المقترح (صياغة مديري التوظيف الأعلى تأثيراً):" : "Optimized Pitch Rephraser (Elite Recruiter standard):"}</span>
                            </h5>
                            <p className={`text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap select-all bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-850 ${lang === "ar" ? "text-right" : "text-left"}`}>
                              {evaluations[q.id || idx.toString()].suggestedSpicedAnswer}
                            </p>
                            <span className={`block text-[9px] text-slate-400 font-mono ${lang === "ar" ? "text-left" : "text-right"}`}>
                              {lang === "ar" ? "💡 نصيحة: انقر نقراً مزدوجاً لنسخ الصياغة المطورة وحفظها لتدريباتك اللاحقة." : "💡 Tip: Double-click inside the frame to instantly select your optimized pitch formulation."}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
