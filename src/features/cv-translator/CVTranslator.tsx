import React, { useState } from "react";
import { FileUploader } from "../../shared/components/FileUploader";
import {
  Languages,
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
  ChevronRight,
  ArrowRightLeft
} from "lucide-react";
import { FileData } from "../../shared/lib/types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { translations } from "../../shared/lib/translations";

interface CVTranslatorProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

interface TranslatedCVData {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  sectionTitles?: {
    summary: string;
    experience: string;
    education: string;
    skills: string;
    projects?: string;
    languages?: string;
  };
  workExperience: {
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    details?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    title: string;
    period: string;
    bullets: string[];
    technologies: string[];
  }[];
  languages?: string[];
}

interface CVTranslationResult {
  translatedCvData: TranslatedCVData;
  translationNotes: string[];
}

export const CVTranslator: React.FC<CVTranslatorProps> = ({ onActionStart, lang = "ar" }) => {
  const t = translations[lang];
  const isAr = lang === "ar";

  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [cvText, setCvText] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<CVTranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const [previewMode, setPreviewMode] = useState<"visual" | "markdown">("visual");
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "modern" | "minimal">("classic");
  const [selectedColor, setSelectedColor] = useState<"indigo" | "emerald" | "amber" | "rose" | "slate">("indigo");

  const popularLanguages = [
    { value: "English", labelAr: "الإنجليزية (English)", labelEn: "English" },
    { value: "Arabic", labelAr: "العربية (Arabic)", labelEn: "Arabic" },
    { value: "French", labelAr: "الفرنسية (French)", labelEn: "French" },
    { value: "German", labelAr: "الألمانية (German)", labelEn: "German" },
    { value: "Spanish", labelAr: "الإسبانية (Spanish)", labelEn: "Spanish" },
    { value: "Italian", labelAr: "الإيطالية (Italian)", labelEn: "Italian" },
    { value: "Turkish", labelAr: "التركية (Turkish)", labelEn: "Turkish" }
  ];

  const loadingSteps = isAr ? [
    "جاري قراءة وتحليل مفردات الـ CV المصدرية...",
    "جاري صياغة المصطلحات المهنية المكافئة في لغة وجهتك الكبرى...",
    "جاري نقل الإنجازات والـ KPIs بالأرقام وتجنب صياغة الترجمة الحرفية العادية...",
    "جاري بناء الـ CV المترجم الكامل بتنسيق ذكي متوافق 100% مع الـ ATS..."
  ] : [
    "Parsing and identifying core resume vocabulary from source document...",
    "Mapping professional titles and skills into global target terminology standards...",
    "Converting performance achievements while preserving exact numeric metrics & KPIs...",
    "Assembling beautifully translated document with 100% ATS-compliant layout..."
  ];

  const handleTranslate = async () => {
    if (!cvFile && !cvText.trim()) {
      setError(isAr ? "يرجى تزويد النظام بنسخة الـ CV الأساسية أولاً." : "Please upload or paste your resume content first.");
      return;
    }

    onActionStart(async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      setLoadingStep(0);

      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);

      try {
        const response = await fetch("/api/translate-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText: cvText.trim() || undefined,
            cvFile: cvFile ? { data: cvFile.base64, mimeType: cvFile.mimeType } : undefined,
            targetLang: targetLang
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || (isAr ? "فشل الخادم في ترجمة الـ CV." : "Server failed to translate resume."));
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned an invalid response.");
        }
        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || (isAr ? "حدث خطأ أثناء الاتصال بالخادم لترجمة الـ CV." : "An error occurred while connecting to server."));
      } finally {
        clearInterval(interval);
        setLoading(false);
      }
    });
  };

  const hasArabic = (text?: string): boolean => {
    if (!text) return false;
    return /[\u0600-\u06FF]/.test(text);
  };

  const convertCvDataToText = (data: TranslatedCVData): string => {
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
      data.workExperience.forEach((job) => {
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
      data.projects.forEach((proj) => {
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
      data.education.forEach((edu) => {
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
      data.skills.forEach((skill) => {
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
    if (!result || !result.translatedCvData) return;
    const plainText = convertCvDataToText(result.translatedCvData);
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWordDoc = () => {
    if (!result || !result.translatedCvData) return;
    const cv = result.translatedCvData;
    const isRtl = hasArabic(cv.summary || cv.fullName);

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${cv.fullName} - Resume</title>
        <style>
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            font-family: ${isRtl ? "'Simplified Arabic', 'Arial', sans-serif" : "'Calibri', 'Arial', sans-serif"};
            font-size: 11pt;
            line-height: 1.25;
            color: #333333;
            direction: ${isRtl ? "rtl" : "ltr"};
            text-align: ${isRtl ? "right" : "left"};
          }
          .header {
            text-align: center;
            margin-bottom: 20pt;
            border-bottom: 2pt solid #4f46e5;
            padding-bottom: 12pt;
          }
          .name {
            font-size: 24pt;
            font-weight: bold;
            color: #111111;
            margin: 0 0 4pt 0;
            text-transform: uppercase;
          }
          .title {
            font-size: 14pt;
            color: #4f46e5;
            margin: 0 0 8pt 0;
            font-weight: bold;
          }
          .contact {
            font-size: 9.5pt;
            color: #666666;
          }
          .section-title {
            font-size: 13pt;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 1px solid #d1d5db;
            margin-top: 22pt;
            margin-bottom: 8pt;
            padding-bottom: 2pt;
            text-transform: uppercase;
          }
          .summary {
            margin-bottom: 12pt;
            text-align: justify;
          }
          .entry {
            margin-bottom: 14pt;
          }
          .entry-header {
            font-weight: bold;
            margin-bottom: 3pt;
          }
          .entry-meta {
            font-size: 9.5pt;
            color: #555555;
            margin-bottom: 4pt;
          }
          ul {
            margin: 0 0 8pt 0;
            padding-left: ${isRtl ? "0" : "20px"};
            padding-right: ${isRtl ? "20px" : "0"};
          }
          li {
            margin-bottom: 3.5pt;
            text-align: justify;
          }
          .skills-table {
            width: 100%;
            border-collapse: collapse;
          }
          .skills-row {
            margin-bottom: 6pt;
          }
          .skills-category {
            font-weight: bold;
            width: 150px;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${cv.fullName}</div>
          <div class="title">${cv.professionalTitle}</div>
          <div class="contact">
            ${cv.email} | ${cv.phone} | ${cv.location}
            ${cv.links && cv.links.length > 0 ? `<br>${cv.links.join(" | ")}` : ""}
          </div>
        </div>

        ${cv.summary ? `
        <div class="section-title">${isRtl ? "الملخص المهنـي" : "Professional Summary"}</div>
        <div class="summary">${cv.summary}</div>
        ` : ""}

        ${cv.workExperience && cv.workExperience.length > 0 ? `
        <div class="section-title">${isRtl ? "الخبرات المهنـية" : "Work Experience"}</div>
        ${cv.workExperience.map(job => `
          <div class="entry">
            <div class="entry-header">${job.role} | ${job.company}</div>
            <div class="entry-meta">${job.period}</div>
            ${job.bullets && job.bullets.length > 0 ? `
            <ul>
              ${job.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
            ` : ""}
          </div>
        `).join("")}
        ` : ""}

        ${cv.projects && cv.projects.length > 0 ? `
        <div class="section-title">${isRtl ? "المشاريع الرئيسية" : "Key Projects"}</div>
        ${cv.projects.map(proj => `
          <div class="entry">
            <div class="entry-header">${proj.title}</div>
            <div class="entry-meta">${proj.period} ${proj.technologies && proj.technologies.length > 0 ? `| ${proj.technologies.join(", ")}` : ""}</div>
            ${proj.bullets && proj.bullets.length > 0 ? `
            <ul>
              ${proj.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
            ` : ""}
          </div>
        `).join("")}
        ` : ""}

        ${cv.education && cv.education.length > 0 ? `
        <div class="section-title">${isRtl ? "التحصيل التعليمي" : "Education"}</div>
        ${cv.education.map(edu => `
          <div class="entry">
            <div class="entry-header">${edu.degree}</div>
            <div class="entry-meta">${edu.institution} | ${edu.period}</div>
            ${edu.details ? `<div style="font-size: 9.5pt; color: #444; margin-top:2pt;">${edu.details}</div>` : ""}
          </div>
        `).join("")}
        ` : ""}

        ${cv.skills && cv.skills.length > 0 ? `
        <div class="section-title">${isRtl ? "المهارات المتخصصة" : "Professional Skills"}</div>
        <div style="margin-top: 5pt;">
          ${cv.skills.map(s => `
            <div class="skills-row">
              <span class="skills-category">${s.category}:</span>
              <span>${s.items ? s.items.join(", ") : ""}</span>
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${cv.languages && cv.languages.length > 0 ? `
        <div class="section-title">${isRtl ? "اللغات" : "Languages"}</div>
        <div style="margin-top: 5pt;">${cv.languages.join(", ")}</div>
        ` : ""}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + docHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cv.fullName.replace(/\s+/g, "_")}_Translated_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!result || !result.translatedCvData) return;
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
      const element = document.getElementById("translated-a4-preview-canvas");
      if (!element) {
        throw new Error("Preview element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const calculatedHeight = imgHeight / ratio;

      if (calculatedHeight <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, calculatedHeight);
      } else {

        let remainingHeight = calculatedHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight);
        remainingHeight -= pdfHeight;

        while (remainingHeight > 0) {
          position = remainingHeight - calculatedHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, calculatedHeight);
          remainingHeight -= pdfHeight;
        }
      }

      pdf.save(`${result.translatedCvData.fullName.replace(/\s+/g, "_")}_Translated_${targetLang}.pdf`);
    } catch (err) {
      console.error("PDF generation failure:", err);
      alert(isAr ? "حدث خطأ أثناء رندر وتوليد ملف الـ PDF." : "An error occurred during PDF rendering.");
    } finally {

      window.getComputedStyle = originalGetComputedStyle;
      setPdfGenerating(false);
    }
  };

  const themeColors = {
    indigo: {
      primary: "text-indigo-600 dark:text-indigo-400",
      bgLight: "bg-indigo-50/50 dark:bg-indigo-950/20",
      border: "border-indigo-200 dark:border-indigo-900",
      accent: "bg-indigo-600",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
    },
    emerald: {
      primary: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-50/50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-900",
      accent: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    },
    amber: {
      primary: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50/50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-900",
      accent: "bg-amber-600",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
    },
    rose: {
      primary: "text-rose-600 dark:text-rose-400",
      bgLight: "bg-rose-50/50 dark:bg-rose-950/20",
      border: "border-rose-200 dark:border-rose-900",
      accent: "bg-rose-600",
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
    },
    slate: {
      primary: "text-slate-800 dark:text-slate-200",
      bgLight: "bg-slate-100 dark:bg-slate-900",
      border: "border-slate-300 dark:border-slate-700",
      accent: "bg-slate-800 dark:bg-slate-200",
      badge: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
    }
  };

  const activeColor = themeColors[selectedColor];

  return (
    <div className="w-full">
      {!result ? (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-transparent dark:border-white/10">
              <Languages size={28} />
            </div>
            <div className={`space-y-2 font-sans ${isAr ? "text-right" : "text-left"}`}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isAr ? "ترجمة السيرة الذاتية المهنية الفورية" : "Immediate Professional CV Translation"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
                {isAr
                  ? "ارفع سيرتك الذاتية بأي لغة واختر اللغة التي تود الترجمة إليها. سيقوم نظامنا المعتمد بوضع الترجمة القياسية التي تقبلها الشركات والـ ATS بذكاء دون إخلال بالأرقام أو المصطلحات المتخصصة."
                  : "Upload your resume in any language and select your target. Our certified translation model produces enterprise-standard translations compatible with ATS algorithms, protecting critical metrics."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">

              <div className="bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 p-5 rounded-2xl space-y-3">
                <label className={`block text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "الترجمة إلى لغة الوجهة والمطابقة:" : "Translate To Target Language:"}
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-sans text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                  >
                    {popularLanguages.map((langOpt) => (
                      <option key={langOpt.value} value={langOpt.value}>
                        {isAr ? langOpt.labelAr : langOpt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl space-y-6">
                <FileUploader
                  onFileLoaded={(file) => {
                    setCvFile(file);
                    setError(null);
                  }}
                  selectedFile={cvFile}
                  lang={lang}
                  label={isAr ? "1. ارفع ملف الـ CV الخاص بك (مفضل PDF):" : "1. Load your CV document (PDF preferred):"}
                />

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 font-extrabold text-xs uppercase tracking-widest">
                    {isAr ? "أو الصق النص كبديل" : "Or paste your plain text"}
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-350 ${isAr ? "text-right" : "text-left"}`}>
                    {isAr ? "أدخل نص السيرة الذاتية المهنية بالكامل:" : "Enter full plain text statement of your CV:"}
                  </label>
                  <textarea
                    rows={8}
                    className={`w-full p-4 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/50 rounded-xl font-sans text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all leading-relaxed ${isAr ? "text-right" : "text-left"}`}
                    placeholder={
                      isAr
                        ? "الصق هنا تفاصيل البيانات الشخصية والخبرات والشهادات التي تريد ترجمتها..."
                        : "Paste your raw name, career history summary, projects, academic degrees..."
                    }
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-center text-sm font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleTranslate}
                disabled={loading || (!cvFile && !cvText.trim())}
                className="w-full h-14 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition shadow-lg shadow-slate-950/10 dark:shadow-none cursor-pointer text-base active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin text-white shrink-0" size={18} />
                    <span>{isAr ? "جاري الترجمة المهنية بالـ AI..." : "Translating scientifically by AI..."}</span>
                  </>
                ) : (
                  <>
                    <Languages className="shrink-0" size={18} />
                    <span>{isAr ? "ابدأ الترجمة الفورية بالذكاء الاصطناعي" : "Begin Live AI Professional Translation"}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 space-y-6 font-sans">
                <h4 className={`text-base font-bold text-slate-800 dark:text-white ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "لماذا ترجمة الـ AI بمنصتنا تختلف عن Google Translate؟" : "How our AI translator beats general tools?"}
                </h4>

                <div className="space-y-4">
                  {[
                    {
                      titleAr: "مصطلحات مهنية دقيقة وليست حرفية",
                      titleEn: "Precise Work Taxonomy (Non-literal)",
                      descAr: "يقوم النموذج بتحليل واختيار المسميات والمهارات المقبولة عالمياً حسب دليل التوظيف للشركات الكبرى.",
                      descEn: "Uses accepted industry standards matching standard HR search dictionary terms."
                    },
                    {
                      titleAr: "حماية تماسك الأرقام والإنجازات",
                      titleEn: "Numeric KPI and Metric Integrity",
                      descAr: "تظل نسب النمو والمبيعات وأعداد الموظفين والمشاريع دقيقة وثابتة بدلاً من تشويه الأرقام الحرفية.",
                      descEn: "Your custom numbers and achievements keep their perfect structure."
                    },
                    {
                      titleAr: "تعديل لغوي لرفع التوافق بالـ ATS",
                      titleEn: "ATS Compatibility Formulation",
                      descAr: "يتوافق النص النهائي 100% مع خوارزميات التدقيق الآلي ويحفظ الفرز الفوري للمتقدم.",
                      descEn: "Outputs highly parsable documents optimized explicitly for recruitment bots."
                    }
                  ].map((feat, index) => (
                    <div key={index} className="flex gap-4 flex-row">
                      <div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 font-bold text-sm rounded-lg flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
                        <h5 className="font-bold text-slate-850 dark:text-slate-100 text-sm">
                          {isAr ? feat.titleAr : feat.titleEn}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {isAr ? feat.descAr : feat.descEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/50 dark:border-white/5 pb-6">
            <div className={`space-y-1 font-sans ${isAr ? "text-right" : "text-left"}`}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase rounded-full">
                  {isAr ? "تمت الترجمة بنجاح" : "Translated successfully"}
                </span>
                <span className="text-slate-400 text-xs font-semibold">
                  {isAr ? `إلى لغة: ${targetLang}` : `Target: ${targetLang}`}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {isAr ? "سيرتك الذاتية المترجمة والمهيأة" : "Your Translated & Ready Resume"}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {isAr ? "ترجمة مستند آخر" : "Translate another document"}
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copied ? <Check size={14} /> : <ClipboardCheck size={14} />}
                <span>{copied ? (isAr ? "تم نسخ النص!" : "Copied!") : (isAr ? "نسخ نص الـ CV" : "Copy Resume text")}</span>
              </button>
              <button
                onClick={handleDownloadWordDoc}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileText size={14} />
                <span>{isAr ? "تحميل كـ Word" : "Download Word"}</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfGenerating}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {pdfGenerating ? (
                  <>
                    <RefreshCw className="animate-spin shrink-0" size={14} />
                    <span>{isAr ? "جاري تجميع الـ PDF..." : "Assembling PDF..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="shrink-0" size={14} />
                    <span>{isAr ? "تحميل كـ PDF" : "Download PDF"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-4 space-y-6">

              <div className="bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                  <Palette className="text-indigo-500" size={18} />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                    {isAr ? "تخصيص مستند المعاينة المطبوع:" : "Customize Printable Output:"}
                  </h4>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    {isAr ? "تصميم وتخطيط الـ CV:" : "Layout theme template:"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "classic", label: isAr ? "كلاسيكي" : "Classic" },
                      { id: "modern", label: isAr ? "مودرن" : "Modern" },
                      { id: "minimal", label: isAr ? "بسيط" : "Minimal" }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id as any)}
                        className={`py-2 px-1 text-xs font-bold border rounded-lg transition text-center cursor-pointer ${
                          selectedTemplate === tpl.id
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    {isAr ? "اللون الرئيسي للقالب المهني:" : "Template Key Color Theme:"}
                  </span>
                  <div className="flex gap-2.5 justify-end">
                    {[
                      { id: "indigo", bg: "bg-indigo-600" },
                      { id: "emerald", bg: "bg-emerald-600" },
                      { id: "amber", bg: "bg-amber-500" },
                      { id: "rose", bg: "bg-rose-500" },
                      { id: "slate", bg: "bg-slate-700" }
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setSelectedColor(col.id as any)}
                        className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition border ${col.bg} ${
                          selectedColor === col.id ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 border-white" : "border-transparent"
                        }`}
                        title={col.id}
                      >
                        {selectedColor === col.id && <Check className="text-white" size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    {isAr ? "أسلوب العرض الفوري:" : "Rendering View Mode:"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewMode("visual")}
                      className={`py-2 text-xs font-black rounded-lg border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        previewMode === "visual"
                          ? "bg-indigo-600/10 text-indigo-600 border-indigo-500/30"
                          : "border-slate-200/50 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <Eye size={12} />
                      <span>{isAr ? "معاينة ورقية A4" : "Visual A4 Page"}</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode("markdown")}
                      className={`py-2 text-xs font-black rounded-lg border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        previewMode === "markdown"
                          ? "bg-indigo-600/10 text-indigo-600 border-indigo-500/30"
                          : "border-slate-200/50 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <FileText size={12} />
                      <span>{isAr ? "نص عادي (Markdown)" : "Editable Normal Text"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {result.translationNotes && result.translationNotes.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 space-y-4 font-sans">
                  <div className="flex items-center gap-2 text-amber-500 border-b border-amber-500/10 pb-2">
                    <Info size={16} />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">
                      {isAr ? "ملاحظات وتوجيهات الترجمة المهنية:" : "Bilingual Professional Translation Notes:"}
                    </h4>
                  </div>
                  <ul className="space-y-2.5">
                    {result.translationNotes.map((note, index) => (
                      <li key={index} className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2 ${isAr ? "text-right flex-row-reverse" : "text-left"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              {previewMode === "markdown" ? (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
                    <span className="text-xs font-mono text-slate-400">RAW_CV_TEXT.md</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {isAr ? "نسخ النص كاملاً" : "Copy entire text content"}
                    </button>
                  </div>
                  <textarea
                    rows={20}
                    readOnly
                    className="w-full bg-transparent font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 pointer-events-auto select-all outline-none"
                    value={convertCvDataToText(result.translatedCvData)}
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto pb-4 scrollbar-thin flex justify-center bg-slate-100 dark:bg-slate-900/60 p-4 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  <div
                    id="translated-a4-preview-canvas"
                    className="w-[210mm] min-h-[297mm] bg-white text-slate-850 p-[20mm] shadow-2xl relative select-text font-serif leading-normal"
                    style={{
                      fontFamily: hasArabic(result.translatedCvData.summary || result.translatedCvData.fullName)
                        ? "'Times New Roman', 'traditional-arabic', serif"
                        : "Calibri, Helvetica, Arial, sans-serif"
                    }}
                    dir={hasArabic(result.translatedCvData.summary || result.translatedCvData.fullName) ? "rtl" : "ltr"}
                  >

                    {selectedTemplate === "classic" && (
                      <div className="space-y-6 text-sm text-[#333]">

                        <div className="text-center border-b-2 pb-4 space-y-1.5" style={{ borderColor: activeColor.accent.split(" ")[0] === "bg-slate-800" ? "#334155" : selectedColor === "indigo" ? "#6366f1" : selectedColor === "emerald" ? "#10b981" : selectedColor === "rose" ? "#f43f5e" : selectedColor === "amber" ? "#f59e0b" : "#6366f1" }}>
                          <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">{result.translatedCvData.fullName}</h1>
                          <p className="text-base font-extrabold" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569" }}>{result.translatedCvData.professionalTitle}</p>
                          <div className="text-xs text-slate-500 font-sans tracking-wide">
                            {result.translatedCvData.email} | {result.translatedCvData.phone} | {result.translatedCvData.location}
                          </div>
                          {result.translatedCvData.links && result.translatedCvData.links.length > 0 && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {result.translatedCvData.links.join(" | ")}
                            </div>
                          )}
                        </div>

                        {result.translatedCvData.summary && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.summary || (hasArabic(result.translatedCvData.summary) ? "الملخص المهني" : "Professional Summary")}
                            </h3>
                            <p className="text-[12.5px] leading-relaxed text-justify text-slate-700">{result.translatedCvData.summary}</p>
                          </div>
                        )}

                        {result.translatedCvData.workExperience && result.translatedCvData.workExperience.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.experience || (hasArabic(result.translatedCvData.summary) ? "الخبرات والمسؤوليات" : "Work Experience")}
                            </h3>
                            <div className="space-y-4">
                              {result.translatedCvData.workExperience.map((job, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between font-bold text-slate-950 text-xs sm:text-sm">
                                    <span>{job.role} - {job.company}</span>
                                    <span className="text-xs font-mono text-slate-500">{job.period}</span>
                                  </div>
                                  {job.bullets && job.bullets.length > 0 && (
                                    <ul className="list-disc list-outside pl-5 pr-5 text-[12.5px] text-slate-700 space-y-1">
                                      {job.bullets.map((bullet, bulletIdx) => (
                                        <li key={bulletIdx} className="text-justify leading-relaxed">{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.translatedCvData.projects && result.translatedCvData.projects.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.projects || (hasArabic(result.translatedCvData.summary) ? "المشاريع الرئيسية" : "Key Projects")}
                            </h3>
                            <div className="space-y-3">
                              {result.translatedCvData.projects.map((proj, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between font-bold text-slate-900 text-xs sm:text-sm">
                                    <span>{proj.title}</span>
                                    <span className="text-xs font-mono text-slate-500">{proj.period}</span>
                                  </div>
                                  {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                                      {result.translatedCvData.sectionTitles?.projects ? `${result.translatedCvData.sectionTitles.projects}:` : (hasArabic(result.translatedCvData.summary) ? "التقنيات المستخدمة:" : "Technologies:")} {proj.technologies.join(", ")}
                                    </p>
                                  )}
                                  {proj.bullets && proj.bullets.length > 0 && (
                                    <ul className="list-disc list-outside pl-5 pr-5 text-[12.5px] text-slate-700 space-y-0.5">
                                      {proj.bullets.map((b, bIdx) => (
                                        <li key={bIdx} className="text-justify leading-relaxed">{b}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.translatedCvData.education && result.translatedCvData.education.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.education || (hasArabic(result.translatedCvData.summary) ? "التحصيل التعليمي" : "Education")}
                            </h3>
                            <div className="space-y-2">
                              {result.translatedCvData.education.map((edu, idx) => (
                                <div key={idx} className="text-xs sm:text-sm">
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>{edu.degree}</span>
                                    <span className="text-xs font-mono text-slate-500">{edu.period}</span>
                                  </div>
                                  <div className="text-xs text-slate-600">{edu.institution}</div>
                                  {edu.details && <p className="text-xs italic text-slate-500 mt-0.5 leading-relaxed">{edu.details}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.translatedCvData.skills && result.translatedCvData.skills.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.skills || (hasArabic(result.translatedCvData.summary) ? "المهارات المتخصصة" : "Skills & Competencies")}
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                              {result.translatedCvData.skills.map((skill, idx) => (
                                <div key={idx} className="text-xs sm:text-sm flex gap-4">
                                  <span className="font-extrabold text-slate-800 min-w-[120px]">{skill.category}:</span>
                                  <span className="text-slate-600">{skill.items ? skill.items.join(", ") : ""}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.translatedCvData.languages && result.translatedCvData.languages.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
                              {result.translatedCvData.sectionTitles?.languages || (hasArabic(result.translatedCvData.summary) ? "اللغات المستهدفة" : "Languages")}
                            </h3>
                            <p className="text-xs text-slate-700">{result.translatedCvData.languages.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTemplate === "modern" && (
                      <div className="space-y-6 text-sm text-[#2d3748]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-5" style={{ borderColor: selectedColor === "indigo" ? "#e0e7ff" : selectedColor === "emerald" ? "#ecfdf5" : selectedColor === "rose" ? "#ffe4e6" : "#e2e8f0" }}>
                          <div className="md:col-span-2 space-y-1 text-right">
                            <h1 className="text-3xl font-black text-slate-950 uppercase">{result.translatedCvData.fullName}</h1>
                            <p className="text-sm font-extrabold tracking-wide" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569" }}>{result.translatedCvData.professionalTitle}</p>
                          </div>
                          <div className="text-xs text-slate-500 space-y-1 font-sans">
                            <div className="flex items-center gap-1"><Mail size={11} /> <span>{result.translatedCvData.email}</span></div>
                            <div className="flex items-center gap-1"><Phone size={11} /> <span>{result.translatedCvData.phone}</span></div>
                            <div className="flex items-center gap-1"><MapPin size={11} /> <span>{result.translatedCvData.location}</span></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-6">
                            {result.translatedCvData.summary && (
                              <div className="space-y-2">
                                <h3 className="text-xs font-black tracking-widest uppercase border-b pb-1" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569", borderColor: selectedColor === "indigo" ? "#e0e7ff" : selectedColor === "emerald" ? "#ecfdf5" : selectedColor === "rose" ? "#ffe4e6" : "#e2e8f0" }}>
                                  {result.translatedCvData.sectionTitles?.summary || (hasArabic(result.translatedCvData.summary) ? "الملخص المهني" : "Summary")}
                                </h3>
                                <p className="text-[12px] leading-relaxed text-justify text-slate-700">{result.translatedCvData.summary}</p>
                              </div>
                            )}

                            {result.translatedCvData.workExperience && result.translatedCvData.workExperience.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-xs font-black tracking-widest uppercase border-b pb-1" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569", borderColor: selectedColor === "indigo" ? "#e0e7ff" : selectedColor === "emerald" ? "#ecfdf5" : selectedColor === "rose" ? "#ffe4e6" : "#e2e8f0" }}>
                                  {result.translatedCvData.sectionTitles?.experience || (hasArabic(result.translatedCvData.summary) ? "التاريخ الوظيفي" : "Experience")}
                                </h3>
                                <div className="space-y-4">
                                  {result.translatedCvData.workExperience.map((job, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                      <div className="flex justify-between font-bold text-slate-900 text-xs sm:text-sm">
                                        <span>{job.role}</span>
                                        <span className="text-xs font-mono text-slate-500">{job.period}</span>
                                      </div>
                                      <p className="text-[11px] font-bold text-slate-500">{job.company}</p>
                                      {job.bullets && job.bullets.length > 0 && (
                                        <ul className="list-disc pl-4 pr-4 text-[12px] text-slate-700 space-y-1">
                                          {job.bullets.map((b, bIdx) => (
                                            <li key={bIdx} className="text-justify leading-relaxed">{b}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            {result.translatedCvData.skills && result.translatedCvData.skills.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-black tracking-widest uppercase border-b pb-1" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569" }}>
                                  {result.translatedCvData.sectionTitles?.skills || (hasArabic(result.translatedCvData.summary) ? "المهارات والتقنيات" : "Skills")}
                                </h3>
                                <div className="space-y-3">
                                  {result.translatedCvData.skills.map((skill, idx) => (
                                    <div key={idx} className="space-y-1">
                                      <p className="text-[11px] font-bold text-slate-900">{skill.category}:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {skill.items && skill.items.map((item, itemIdx) => (
                                          <span key={itemIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-sans border border-slate-200/50">
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.translatedCvData.education && result.translatedCvData.education.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-black tracking-widest uppercase border-b pb-1" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569" }}>
                                  {result.translatedCvData.sectionTitles?.education || (hasArabic(result.translatedCvData.summary) ? "التعليم" : "Education")}
                                </h3>
                                <div className="space-y-3">
                                  {result.translatedCvData.education.map((edu, idx) => (
                                    <div key={idx} className="space-y-0.5">
                                      <p className="text-xs font-extrabold text-slate-900 leading-tight">{edu.degree}</p>
                                      <p className="text-[11px] text-slate-500 font-sans">{edu.institution}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">{edu.period}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTemplate === "minimal" && (
                      <div className="space-y-5 text-sm text-slate-800">
                        <div className="space-y-2">
                          <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">{result.translatedCvData.fullName}</h1>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-extrabold font-mono" style={{ color: selectedColor === "indigo" ? "#4f46e5" : selectedColor === "emerald" ? "#047857" : selectedColor === "rose" ? "#be123c" : selectedColor === "amber" ? "#b45309" : "#475569" }}>
                            {result.translatedCvData.professionalTitle} | {result.translatedCvData.email} | {result.translatedCvData.phone}
                          </p>
                          <p className="text-xs text-slate-400">{result.translatedCvData.location}</p>
                        </div>

                        {result.translatedCvData.summary && (
                          <p className="text-[12px] leading-relaxed text-justify border-l-2 pl-4 border-slate-300 dark:border-slate-850 py-1 text-slate-600">
                            {result.translatedCvData.summary}
                          </p>
                        )}

                        {result.translatedCvData.workExperience && result.translatedCvData.workExperience.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-950">
                              {result.translatedCvData.sectionTitles?.experience || (hasArabic(result.translatedCvData.summary) ? "سجل الخبرة" : "Experience")}
                            </h2>
                            <div className="space-y-4">
                              {result.translatedCvData.workExperience.map((job, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-extrabold text-slate-955 text-xs sm:text-sm">{job.role} — {job.company}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{job.period}</span>
                                  </div>
                                  {job.bullets && job.bullets.length > 0 && (
                                    <ul className="list-inside list-disc pl-4 pr-4 space-y-0.5 text-[12px] text-slate-650">
                                      {job.bullets.map((b, bIdx) => (
                                        <li key={bIdx} className="text-justify">{b}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
