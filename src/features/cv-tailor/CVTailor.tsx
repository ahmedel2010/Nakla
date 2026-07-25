import React, { useState } from "react";
import { FileUploader } from "../../shared/components/FileUploader";
import {
  Sliders,
  RefreshCw,
  Sparkles,
  Check,
  Download,
  ClipboardCheck,
  Sparkle,
  AlertTriangle,
  Printer,
  Eye,
  FileText,
  Palette,
  Type,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Upload,
  Info,
  Copy
} from "lucide-react";
import { CVTailorResult, FileData } from "../../shared/lib/types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { translations } from "../../shared/lib/translations";

interface CVTailorProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

export const CVTailor: React.FC<CVTailorProps> = ({ onActionStart, lang = "ar" }) => {
  const t = translations[lang];
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<CVTailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const [previewMode, setPreviewMode] = useState<"visual" | "markdown">("visual");
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "modern" | "minimal">("classic");
  const [selectedColor, setSelectedColor] = useState<"indigo" | "emerald" | "amber" | "rose" | "slate">("indigo");

  const loadingTexts = lang === "ar" ? [
    "جاري تحليل متطلبات وتفاصيل الوصف الوظيفي (Job Description)...",
    "جاري استخراج المهارات والمهام ذات الأولوية العالية وربطها بخلفيتك...",
    "جاري إعادة صياغة الـ CV وتطعيمها بالكلمات الدلالية الحرجة...",
    "جاري احتساب توافق الـ ATS الجديد وتنسيق الـ CV النهائي..."
  ] : [
    "Parsing and identifying critical skills from the Job Description...",
    "Correlating priority tasks of the enterprise with your candidate background...",
    "Rewriting bullets and enriching resume with semantic ATS keywords...",
    "Measuring new compatibility index scores and printing final tailored resume..."
  ];

  const executeTailorService = () => {
    onActionStart(async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      setLoadingStep(0);

      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
      }, 2500);

      try {
        const response = await fetch("/api/tailor-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvFile: cvFile ? { data: cvFile.base64, mimeType: cvFile.mimeType } : undefined,
            jobDescription: jobDescription.trim(),
            lang: lang
          })
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || (lang === "ar" ? "فشل الخادم في تفصيل الـ CV." : "Server failed to tailor resume."));
          } else {
            throw new Error(lang === "ar" ? "حدث خطأ غير متوقع، يرجى التأكد من حجم الملف المرفق." : "An unexpected error occurred. Please check your file size.");
          }
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(lang === "ar" ? "استجابة الخادم غير صالحة (قد يكون الملف المرفق كبير جداً)." : "Invalid server response (file might be too large).");
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || (lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم لمطابقة الـ CV." : "An error occurred while connecting to server."));
      } finally {
        clearInterval(interval);
        setLoading(false);
      }
    });
  };

  const handleTailor = async () => {
    if (!cvFile) {
      setError(lang === "ar" ? "يرجى رفع ملف الـ CV الخاص بك أولاً." : "Please upload your resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError(lang === "ar" ? "من فضلك اكتب أو الصق الوصف الوظيفي للوظيفة المستهدفة." : "Please enter or paste the target Job Description first.");
      return;
    }

    executeTailorService();
  };

  const hasArabic = (text?: string): boolean => {
    if (!text) return false;
    return /[\u0600-\u06FF]/.test(text);
  };

  const convertCvDataToText = (data: any): string => {
    if (!data) return "";
    let text = "";
    text += `=========================================\n`;
    text += `${data.fullName?.toUpperCase()}\n`;
    text += `${data.professionalTitle}\n`;
    text += `=========================================\n`;
    text += `Email: ${data.email} | Phone: ${data.phone} | Location: ${data.location}\n`;
    if (data.links && data.links.length > 0) {
      text += `Links: ${data.links.join(" | ")}\n`;
    }
    text += `\n`;

    if (data.summary) {
      text += `PROFESSIONAL SUMMARY\n`;
      text += `--------------------\n`;
      text += `${data.summary}\n\n`;
    }

    if (data.workExperience && data.workExperience.length > 0) {
      text += `WORK EXPERIENCE\n`;
      text += `---------------\n`;
      data.workExperience.forEach((job: any) => {
        text += `${job.role} - ${job.company} (${job.period})\n`;
        if (job.bullets && job.bullets.length > 0) {
          job.bullets.forEach((bullet: string) => {
            text += `- ${bullet}\n`;
          });
        }
        text += `\n`;
      });
    }

    if (data.projects && data.projects.length > 0) {
      text += `KEY PROJECTS\n`;
      text += `------------\n`;
      data.projects.forEach((proj: any) => {
        text += `${proj.title} (${proj.period})\n`;
        if (proj.technologies && proj.technologies.length > 0) {
          text += `Technologies: ${proj.technologies.join(", ")}\n`;
        }
        if (proj.bullets && proj.bullets.length > 0) {
          proj.bullets.forEach((bullet: string) => {
            text += `- ${bullet}\n`;
          });
        }
        text += `\n`;
      });
    }

    if (data.education && data.education.length > 0) {
      text += `EDUCATION\n`;
      text += `---------\n`;
      data.education.forEach((edu: any) => {
        text += `${edu.degree} - ${edu.institution} (${edu.period})\n`;
        if (edu.details) {
          text += `Details: ${edu.details}\n`;
        }
        text += `\n`;
      });
    }

    if (data.skills && data.skills.length > 0) {
      text += `SKILLS\n`;
      text += `------\n`;
      data.skills.forEach((skill: any) => {
        text += `${skill.category}: ${skill.items ? skill.items.join(", ") : ""}\n`;
      });
      text += `\n`;
    }

    if (data.languages && data.languages.length > 0) {
      text += `LANGUAGES\n`;
      text += `---------\n`;
      text += `${data.languages.join(", ")}\n`;
    }

    return text;
  };

  const handleCopy = () => {
    if (!result || !result.tailoredCvData) return;
    const plainText = convertCvDataToText(result.tailoredCvData);
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("tailored-cv-pdf-template");
    if (!element) return;

    setPdfGenerating(true);

    const originalGetComputedStyle = window.getComputedStyle;

    function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
      const hRad = (h * Math.PI) / 180;
      const a = c * Math.cos(hRad);
      const b = c * Math.sin(hRad);

      const l_2 = l + 0.3963377774 * a + 0.2158037573 * b;
      const m_2 = l - 0.1055613458 * a - 0.0638541728 * b;
      const s_2 = l - 0.0894841775 * a - 1.2914855414 * b;

      const l_3 = l_2 * l_2 * l_2;
      const m_3 = m_2 * m_2 * m_2;
      const s_3 = s_2 * s_2 * s_2;

      const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
      const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
      const b_val = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

      const f = (x: number) => {
        const clamped = Math.max(0, Math.min(1, x));
        return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      };

      return [
        Math.round(f(r) * 255),
        Math.round(f(g) * 255),
        Math.round(f(b_val) * 255)
      ];
    }

    function convertOklchToRgbString(str: string): string {
      const regex = /oklch\(\s*([\d\.]+%?)[,\s]+([\d\.]+%?)[,\s]+([\d\.]+(?:deg|rad)?)\s*(?:[,\/]\s*([\d\.]+%?))?\s*\)/g;
      return str.replace(regex, (match, lStr, cStr, hStr, aStr) => {
        try {
          const l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
          const c = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
          const h = parseFloat(hStr);
          const alpha = aStr ? (aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr)) : 1;

          const [r, g, b] = oklchToRgb(l, c, h);
          return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch (e) {
          return match;
        }
      });
    }

    window.getComputedStyle = function(elt, pseudoElt) {
      const style = originalGetComputedStyle.call(this, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && val.includes('oklch')) {
                return convertOklchToRgbString(val);
              }
              return val;
            };
          }
          const val = target[prop as any];
          if (typeof val === 'string' && val.includes('oklch')) {
            return convertOklchToRgbString(val);
          }
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });
    };

    try {
      await new Promise((sub) => setTimeout(sub, 250));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      const safeName = result?.tailoredCvData?.fullName ? result.tailoredCvData.fullName.replace(/\s+/g, "_") : "Tailored_CV";
      pdf.save(`${safeName}_Tailored_ATS.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(lang === "ar" ? "عذراً، فشل تصدير الـ PDF. يرجى تجربة النسخ اليدوي أو طباعة الصفحة." : "Sorry, PDF generation failed. Please try printing the page or copying manually.");
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-12 pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="premium-card p-8 sm:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
           <div className="space-y-4">
            <h2 className="text-3xl font-display font-black text-brand dark:text-white tracking-tightest leading-none">
              {t.tailorTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {t.tailorSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t.tailorJobDescLabel}</label>
            <textarea
              id="job-descr-input"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setError(null);
              }}
              placeholder={t.tailorJobDescPlaceholder}
              className="w-full h-80 p-6 bg-slate-50 dark:bg-slate-950/30 border-2 border-transparent focus:border-brand/10 dark:focus:border-white/10 rounded-[2rem] text-brand dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner text-sm"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4 h-full flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                {lang === "ar" ? "تحميل ملف السيرة الذاتية الأصلي (PDF)" : "Original CV (PDF format only)"}
              </label>
              <div className="flex-1">
                 <FileUploader
                  onFileLoaded={(file) => {
                    setCvFile(file);
                    setError(null);
                  }}
                  selectedFile={cvFile}
                  lang={lang}
                  accept=".pdf"
                  label={lang === "ar" ? "اسحب وأسقط ملف الـ PDF هنا أو اضغط للاختيار" : "Drag & drop your PDF file here, or click to browse"}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div id="tailor-error-alert" className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm max-w-xl mx-auto animate-fade-in">
            <AlertTriangle className="flex-shrink-0 text-rose-500 animate-bounce" size={20} />
            <p className="font-semibold text-center w-full">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            id="start-tailor-btn"
            onClick={handleTailor}
            disabled={loading || !cvFile || !jobDescription.trim()}
            className="premium-button-primary min-w-[320px] py-5 text-base flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>{t.tailorSubmitBtnLoading}</span>
              </>
            ) : (
              <>
                <span>{t.tailorSubmitBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div id="tailor-loading-overlay" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <Sparkle className="absolute text-indigo-500 animate-pulse" size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-slate-800 dark:text-white">
              {loadingTexts[loadingStep]}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {lang === "ar"
                ? "يقوم خادم الذكاء الاصطناعي بدمج المهارات الأساسية وتحديث صياغة المسؤوليات والمشاريع لضمان تخطي فحص الـ ATS التلقائي لنسب تفوق 90%."
                : "The intelligence engine blends keyword taxonomy and updates action bullets to secure dynamic compliance of above 90%."}
            </p>
          </div>
        </div>
      )}

      {result && result.tailoredCvData && !loading && (
        <div id="tailored-cv-results" className="space-y-8 animate-fade-in">

          <div className={`bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 dark:from-emerald-950/15 dark:to-indigo-505/5 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 ${lang === "ar" ? "" : "sm:flex-row-reverse"}`}>
            <div className="bg-emerald-500 text-white rounded-2xl p-4 flex flex-col items-center justify-center h-24 w-28 flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <span className="text-3xl font-black font-sans leading-none">{result.alignmentScore}%</span>
              <span className="text-[10px] font-bold mt-1 text-emerald-100 uppercase">
                {lang === "ar" ? "معدل التوافق" : "Match Rate"}
              </span>
            </div>

            <div className={`flex-1 space-y-2 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                {lang === "ar" ? "تمّت المطابقة وتعديل السيرة الذاتية بنجاح!" : "Resume Tailored & Synced Successfully!"}
              </h3>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                {result.matchingAnalysis}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className={`lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 justify-start">
                  <Info size={18} className="text-indigo-500" />
                  <span>{lang === "ar" ? "تعديلات تخصيص السيرة الذاتية" : "Customization Adjustments Log"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "ar" ? "مجموعة التحديثات التي تمت لمواءمة الوظيفة الشاغرة:" : "A sequence of additions made to optimize compatibility:"}
                </p>
              </div>

              <ul className="space-y-3.5">
                {result.changesMade.map((change, index) => (
                  <li key={index} className="flex gap-2.5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed items-start">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className={`${lang === "ar" ? "text-right" : "text-left"} font-medium`}>{change}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-100 dark:shadow-none transition hover:scale-[1.01]"
                >
                  {pdfGenerating ? (
                    <>
                      <RefreshCw className="animate-spin text-white" size={16} />
                      <span>{lang === "ar" ? "جاري تصدير الـ PDF..." : "Exporting PDF..."}</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>{lang === "ar" ? "تحميل السيرة الذاتية كـ PDF" : "Download Resume PDF"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-205 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-500" />
                      <span className="text-emerald-500 font-bold">{lang === "ar" ? "تم نسخ النص بنجاح!" : "Copied successfully!"}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={16} />
                      <span>{lang === "ar" ? "نسخ النص الكامل للسيرة" : "Copy Full Plain Text"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {lang === "ar" ? "معاينة السيرة المخصصة (ATS Standard Format):" : "Customized Resume Layout (ATS Standard Format):"}
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-300 px-2.5 py-1 rounded-full font-bold">A4 Page Design</span>
              </div>

              <div className="w-full overflow-x-auto rounded-2xl border border-slate-205 dark:border-slate-800 shadow-inner bg-neutral-200/50 p-4 min-h-[450px]">

                <div
                  id="tailored-cv-pdf-template"
                  dir={hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "rtl" : "ltr"}
                  className={`bg-white text-slate-800 p-8 sm:p-12 shadow-sm font-sans mx-auto tracking-normal antialiased ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}
                  style={{
                    width: "794px",
                    minHeight: "1123px",
                    fontFamily: "Arial, sans-serif"
                  }}
                >

                  <div className="text-center space-y-2 pb-6 border-b border-slate-200">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{result.tailoredCvData.fullName}</h1>
                    <p className="text-sm font-bold text-indigo-600 tracking-wide uppercase">{result.tailoredCvData.professionalTitle}</p>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-medium pt-2">
                      {result.tailoredCvData.phone && (
                        <span className="flex items-center gap-1">
                          <span>📞 {result.tailoredCvData.phone}</span>
                        </span>
                      )}
                      {result.tailoredCvData.email && (
                        <span className="flex items-center gap-1 font-mono">
                          ✉️ {result.tailoredCvData.email}
                        </span>
                      )}
                      {result.tailoredCvData.location && (
                        <span className="flex items-center gap-1">
                          📍 {result.tailoredCvData.location}
                        </span>
                      )}
                    </div>

                    {result.tailoredCvData.links && result.tailoredCvData.links.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-indigo-505 font-medium pt-1">
                        {result.tailoredCvData.links.map((link: string, idx: number) => (
                          <span key={idx} className="hover:underline">🔗 {link}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.tailoredCvData.summary && (
                    <div className="mt-5 space-y-2">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.summary) ? "الملخص المهني" : "Professional Summary"}
                      </h2>
                      <p className={`text-[11px] text-slate-600 leading-relaxed font-semibold ${hasArabic(result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {result.tailoredCvData.summary}
                      </p>
                    </div>
                  )}

                  {result.tailoredCvData.workExperience && result.tailoredCvData.workExperience.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "الخبرات والمسار المهني" : "Work Experience"}
                      </h2>
                      <div className="space-y-3.5">
                        {result.tailoredCvData.workExperience.map((job: any, index: number) => (
                          <div key={index} className="space-y-1.5 font-sans">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-slate-900">{job.role} — <span className="text-slate-500 font-medium">{job.company}</span></span>
                              <span className="text-slate-500 font-mono text-[10px]">{job.period}</span>
                            </div>
                            <ul className={`list-disc text-[11px] text-slate-600 space-y-1 font-semibold leading-relaxed ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'pr-4 pl-0 text-right list-inside' : 'pl-4 pr-0 text-left list-outside'}`}>
                              {job.bullets && job.bullets.map((bullet: string, bIdx: number) => (
                                <li key={bIdx} className="leading-relaxed">
                                  <span className="inline">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.tailoredCvData.projects && result.tailoredCvData.projects.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "المشاريع التقنية المستهدفة" : "Key Projects"}
                      </h2>
                      <div className="space-y-3">
                        {result.tailoredCvData.projects.map((proj: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-bold font-sans">
                              <span className="text-slate-900">{proj.title}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{proj.period}</span>
                            </div>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <p className={`text-[10px] text-indigo-600 font-bold ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                                {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "التقنيات المستخدمة: " : "Technologies: "} {proj.technologies.join(" • ")}
                              </p>
                            )}
                            <ul className={`list-disc text-[11px] text-slate-600 space-y-0.5 font-semibold leading-relaxed ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'pr-4 pl-0 text-right list-inside' : 'pl-4 pr-0 text-left list-outside'}`}>
                              {proj.bullets && proj.bullets.map((bullet: string, bIdx: number) => (
                                <li key={bIdx} className="leading-relaxed">
                                  <span className="inline">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.tailoredCvData.education && result.tailoredCvData.education.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "التعليم الأكاديمي والشهادات" : "Education"}
                      </h2>
                      <div className="space-y-2">
                        {result.tailoredCvData.education.map((edu: any, index: number) => (
                          <div key={index} className="text-[11px]">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-900">{edu.degree} — <span className="text-slate-500 font-medium">{edu.institution}</span></span>
                              <span className="text-slate-500 font-mono text-[10px]">{edu.period}</span>
                            </div>
                            {edu.details && (
                              <p className={`text-[10px] text-slate-500 italic mt-0.5 ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                                {edu.details}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.tailoredCvData.skills && result.tailoredCvData.skills.length > 0 && (
                    <div className="mt-5 space-y-2 bg-transparent">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "المهارات والكلمات المفتاحية" : "Skills & Keywords"}
                      </h2>
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 font-sans ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {result.tailoredCvData.skills.map((skill: any, index: number) => (
                          <div key={index} className="text-[11px] leading-relaxed">
                            <span className="font-bold text-slate-900">{skill.category}:</span>{" "}
                            <span className="text-slate-600 font-semibold">{skill.items ? skill.items.join(" • ") : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.tailoredCvData.languages && result.tailoredCvData.languages.length > 0 && (
                    <div className="mt-5 space-y-1.5">
                      <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? "اللغات" : "Languages"}
                      </h2>
                      <p className={`text-[11px] text-slate-600 font-bold ${hasArabic(result.tailoredCvData.fullName || result.tailoredCvData.summary) ? 'text-right' : 'text-left'}`}>
                        {result.tailoredCvData.languages.join(" • ")}
                      </p>
                    </div>
                  )}

                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900 rounded-xl flex gap-2 text-indigo-750 dark:text-indigo-400 text-xs font-semibold">
                <p className={`leading-relaxed font-semibold ${lang === "ar" ? "text-right" : "text-left"}`}>
                  {lang === "ar"
                    ? "نصيحة: هذه السير الذاتية مخصصة للعمل مباشرة مع آلات فرز الطلبات للعمل (ATS). يوصى بتحميل السيرة كـ PDF لتخزين الهيكل بشكل تفاعلي ورائع."
                    : "Tip: These resumes are engineered directly to succeed with ATS algorithmic filters. Download as PDF for an optimized structural layout."}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
