import React, { useState } from "react";
import { FileUploader } from "../../shared/components/FileUploader";
import {
  Award,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Layers,
  Download,
  Copy,
  Check,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Upload,
  Type,
  Search
} from "lucide-react";
import { CVEvaluationResult, FileData } from "../../shared/lib/types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { translations } from "../../shared/lib/translations";

interface CVAuditorProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

export const CVAuditor: React.FC<CVAuditorProps> = ({ onActionStart, lang = "ar" }) => {
  const t = translations[lang];
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<CVEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [correctedLoading, setCorrectedLoading] = useState(false);
  const [correctedCvData, setCorrectedCvData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [docGenerating, setDocGenerating] = useState(false);
  const [correctedError, setCorrectedError] = useState<string | null>(null);

  const loadingTexts = lang === "ar" ? [
    "جاري قراءة وتحليل ملف الـ CV الخاص بك...",
    "جاري فحص التوافقية ومطابقة أنظمة الفرز والـ ATS...",
    "جاري استخلال نقاط القوة ومواقع الضعف الإملائية والهيكلية...",
    "جاري صياغة التوصيات المهنية والخطوات القادمة..."
  ] : [
    "Reading and parsing your CV document standard headers...",
    "Analyzing structures for full ATS compliance parameters...",
    "Scrutinizing grammars, templates, and spelling correctness...",
    "Compiling critical suggestions and roadmap criteria..."
  ];

  const handleEvaluate = async () => {
    if (!cvFile && !cvText.trim()) {
      setError(lang === "ar" ? "الرجاء تحديد ملف CV أو لصق نص الـ CV الخاص بك أولاً." : "Please select a CV file or paste your resume plain text content first.");
      return;
    }

    onActionStart(async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      setLoadingStep(0);

      setTimeout(() => {
        document.getElementById("start-evaluate-btn")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);

      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
      }, 2500);

      try {
        const response = await fetch("/api/evaluate-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText: cvText.trim() || undefined,
            cvFile: cvFile ? { data: cvFile.base64, mimeType: cvFile.mimeType } : undefined,
            lang: lang
          })
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || (lang === "ar" ? "فشل الخادم في تقييم الـ CV." : "Server failed to evaluate CV."));
          } else {
            throw new Error(lang === "ar" ? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى أو التأكد من حجم الملف المرفق." : "An unexpected error occurred. Please try again or check your file size.");
          }
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error((lang === "ar" ? "الخادم لم يُرجع استجابة صحيحة (قد يكون حجم الملف كبير جداً)." : "Server returned an invalid response (file might be too large).") + " Response: " + text.substring(0, 50));
        }

        const data = await response.json();
        setResult(data);

        setTimeout(() => {
          document.getElementById("evaluation-results-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } catch (err: any) {
        console.error(err);
        const errorMsg = err.message || (lang === "ar" ? "عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي." : "Sorry, an error occurred while connecting to the smart server.");
        setError(errorMsg);

        setTimeout(() => {
          document.getElementById("evaluation-error-alert")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      } finally {
        clearInterval(interval);
        setLoading(false);
      }
    });
  };

  const hasArabic = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text || "");
  };

  const handleGenerateCorrectedCV = async () => {
    onActionStart(async () => {
      setCorrectedLoading(true);
      setCorrectedError(null);
      setCorrectedCvData(null);

      try {
        const response = await fetch("/api/generate-corrected-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText: cvText.trim() || undefined,
            cvFile: cvFile ? { data: cvFile.base64, mimeType: cvFile.mimeType } : undefined,
            lang: lang
          })
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || (lang === "ar" ? "فشل توليد الـ CV المصحح." : "Failed to generate corrected resume structure."));
          } else {
            const text = await response.text();
            throw new Error((lang === "ar" ? "الخادم لم يُرجع استجابة صحيحة (قد يكون حجم الملف كبير جداً)." : "Server returned an invalid response (file might be too large).") + " Response: " + text.substring(0, 50));
          }
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error((lang === "ar" ? "الخادم لم يُرجع استجابة صحيحة (قد يكون حجم الملف كبير جداً)." : "Server returned an invalid response (file might be too large).") + " Response: " + text.substring(0, 50));
        }

        const data = await response.json();
        setCorrectedCvData(data);
        setShowModal(true);
      } catch (err: any) {
        console.error(err);
        setCorrectedError(err.message || (lang === "ar" ? "عذراً، حدث خطأ أثناء محاولة توليد وتصحيح الـ CV." : "An error occurred while generating corrected resume suggestions."));
      } finally {
        setCorrectedLoading(false);
      }
    });
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("corrected-cv-pdf-template");
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
          return "rgb(255, 255, 255)";
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
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nameSanitized = correctedCvData.fullName ? correctedCvData.fullName.replace(/\s+/g, "_") : "ATS_CV";
      pdf.save(`${nameSanitized}_ATS_Optimized.pdf`);
    } catch (err) {
      console.error("PDF creation error:", err);
      alert("فشل تحميل ملف الـ PDF. يرجى المحاولة لاحقاً.");
    } finally {

      window.getComputedStyle = originalGetComputedStyle;
      setPdfGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!correctedCvData) return;

    let text = `${correctedCvData.fullName}\n${correctedCvData.professionalTitle}\n${correctedCvData.email} | ${correctedCvData.phone} | ${correctedCvData.location}\n`;
    if (correctedCvData.links && correctedCvData.links.length > 0) {
      text += `${correctedCvData.links.join(" | ")}\n`;
    }
    text += `\n=========================================\n`;
    text += `المستخلص المهني / Summary\n`;
    text += `=========================================\n`;
    text += `${correctedCvData.summary}\n\n`;

    text += `=========================================\n`;
    text += `الخبرات المهنية / Work Experience\n`;
    text += `=========================================\n`;
    correctedCvData.workExperience.forEach((job: any) => {
      text += `${job.role} - ${job.company} (${job.period})\n`;
      job.bullets.forEach((bullet: string) => {
        text += `- ${bullet}\n`;
      });
      text += `\n`;
    });

    if (correctedCvData.projects && correctedCvData.projects.length > 0) {
      text += `=========================================\n`;
      text += `المشاريع / Projects\n`;
      text += `=========================================\n`;
      correctedCvData.projects.forEach((proj: any) => {
        text += `${proj.title} (${proj.period})\n`;
        proj.bullets.forEach((bullet: string) => {
          text += `- ${bullet}\n`;
        });
        if (proj.technologies && proj.technologies.length > 0) {
          text += `التقنيات المستخدمة / Technologies: ${proj.technologies.join(", ")}\n`;
        }
        text += `\n`;
      });
    }

    text += `=========================================\n`;
    text += `التعليم والشهادات / Education\n`;
    text += `=========================================\n`;
    correctedCvData.education.forEach((edu: any) => {
      text += `${edu.degree} - ${edu.institution} (${edu.period})\n`;
      if (edu.details) text += `${edu.details}\n`;
    });
    text += `\n`;

    text += `=========================================\n`;
    text += `المهارات / Skills\n`;
    text += `=========================================\n`;
    correctedCvData.skills.forEach((skill: any) => {
      text += `${skill.category}: ${skill.items.join(", ")}\n`;
    });

    if (correctedCvData.languages && correctedCvData.languages.length > 0) {
      text += `\n=========================================\n`;
      text += `اللغات / Languages\n`;
      text += `=========================================\n`;
      text += correctedCvData.languages.join(", ") + "\n";
    }

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadWordDoc = () => {
    if (!correctedCvData) return;
    setDocGenerating(true);
    try {
      const isRtl = lang === "ar";
      const fullNameText = correctedCvData.fullName || (isRtl ? "الاسم الكامل" : "Your Name");
      const titleText = correctedCvData.professionalTitle || (isRtl ? "المسمى الوظيفي" : "Professional Title");
      const phoneVal = correctedCvData.phone ? `<span>📞 ${correctedCvData.phone}</span>` : "";
      const emailVal = correctedCvData.email ? `<span>✉️ ${correctedCvData.email}</span>` : "";
      const locVal = correctedCvData.location ? `<span>📍 ${correctedCvData.location}</span>` : "";

      let contactsRow = [phoneVal, emailVal, locVal].filter(Boolean).join(" &nbsp;|&nbsp; ");
      let linksRow = "";
      if (correctedCvData.links && correctedCvData.links.length > 0) {
        linksRow = `<div class="contacts">` + correctedCvData.links.map((l: string) => `🔗 ${l}`).join(" &nbsp;|&nbsp; ") + `</div>`;
      }

      let docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${fullNameText}</title>
          <style>
            @page {
              size: a4;
              margin: 1in;
            }
            body {
              font-family: 'Arial', 'Calibri', sans-serif;
              line-height: 1.5;
              color: #333333;
              direction: ${isRtl ? "rtl" : "ltr"};
              text-align: ${isRtl ? "right" : "left"};
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .name {
              font-size: 24pt;
              font-weight: bold;
              color: #111111;
              margin: 0;
            }
            .title {
              font-size: 14pt;
              font-weight: bold;
              color: #2563eb;
              margin: 5px 0 10px 0;
              text-transform: uppercase;
            }
            .contacts {
              font-size: 10pt;
              color: #666666;
              margin-bottom: 5px;
            }
            .section-title {
              font-size: 13pt;
              font-weight: bold;
              color: #2563eb;
              border-bottom: 1px solid #dddddd;
              padding-bottom: 3px;
              margin-top: 20px;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .section-content {
              font-size: 11pt;
              margin-bottom: 15px;
            }
            .experience-item, .project-item {
              margin-bottom: 12px;
            }
            .item-header {
              font-weight: bold;
              font-size: 11.5pt;
              color: #111111;
            }
            .item-meta {
              font-size: 10pt;
              color: #777777;
              margin-bottom: 4px;
            }
            ul {
              margin: 5px 0 10px 20px;
              padding: 0;
            }
            li {
              font-size: 11pt;
              margin-bottom: 4px;
              color: #444444;
            }
            .skills-list {
              font-size: 11pt;
              line-height: 1.6;
            }
            .skills-category {
              font-weight: bold;
              color: #222222;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${fullNameText}</div>
            <div class="title">${titleText}</div>
            <div class="contacts">${contactsRow}</div>
            ${linksRow}
          </div>
      `;

      if (correctedCvData.summary) {
        docHtml += `
          <div class="section-title">${isRtl ? "الملخص والهدف المهني" : "Professional Summary"}</div>
          <div class="section-content">${correctedCvData.summary}</div>
        `;
      }

      if (correctedCvData.workExperience && correctedCvData.workExperience.length > 0) {
        docHtml += `
          <div class="section-title">${isRtl ? "الخبرات والمسار المهني" : "Employment History"}</div>
          <div class="section-content">
        `;
        correctedCvData.workExperience.forEach((job: any) => {
          let bulletItems = "";
          if (job.bullets && job.bullets.length > 0) {
            bulletItems = "<ul>" + job.bullets.map((b: string) => b.trim() ? `<li>${b}</li>` : "").join("") + "</ul>";
          }
          const jobPeriod = job.period ? `<div class="item-meta">${job.period}</div>` : "";
          const companyStr = job.company ? ` &mdash; ${job.company}` : "";

          docHtml += `
            <div class="experience-item">
              <div class="item-header">${job.role}${companyStr}</div>
              ${jobPeriod}
              ${bulletItems}
            </div>
          `;
        });
        docHtml += `</div>`;
      }

      if (correctedCvData.projects && correctedCvData.projects.length > 0) {
        docHtml += `
          <div class="section-title">${isRtl ? "المشاريع والحلول التطبيقية" : "Key Project Portfolio"}</div>
          <div class="section-content">
        `;
        correctedCvData.projects.forEach((proj: any) => {
          let bulletItems = "";
          if (proj.bullets && proj.bullets.length > 0) {
            bulletItems = "<ul>" + proj.bullets.map((b: string) => b.trim() ? `<li>${b}</li>` : "").join("") + "</ul>";
          }
          let techStr = "";
          if (proj.technologies && proj.technologies.length > 0) {
            techStr = `<div style="font-size: 9.5pt; font-weight: bold; color: #2563eb; margin-bottom: 2px;">
              ${isRtl ? "التقنيات المستخدمة: " : "Technologies: "} ${proj.technologies.join(" • ")}
            </div>`;
          }
          const projPeriod = proj.period ? ` (${proj.period})` : "";

          docHtml += `
            <div class="project-item">
              <div class="item-header">${proj.title}${projPeriod}</div>
              ${techStr}
              ${bulletItems}
            </div>
          `;
        });
        docHtml += `</div>`;
      }

      if (correctedCvData.education && correctedCvData.education.length > 0) {
        docHtml += `
          <div class="section-title">${isRtl ? "التحصيل الأكاديمي والشهادات" : "Academic Credentials"}</div>
          <div class="section-content">
        `;
        correctedCvData.education.forEach((edu: any) => {
          const detailsStr = edu.details ? `<div style="font-size: 10pt; font-style: italic; color: #666666;">${edu.details}</div>` : "";
          const periodStr = edu.period ? ` (&nbsp;${edu.period})` : "";

          docHtml += `
            <div style="margin-bottom: 10px;">
              <div class="item-header">${edu.degree}</div>
              <div style="font-size: 10.5pt; color: #555555;">${edu.institution}${periodStr}</div>
              ${detailsStr}
            </div>
          `;
        });
        docHtml += `</div>`;
      }

      if (correctedCvData.skills && correctedCvData.skills.length > 0) {
        docHtml += `
          <div class="section-title">${isRtl ? "المهارات المتخصصة واللغات" : "Talent Taxonomy & Languages"}</div>
          <div class="section-content skills-list">
        `;
        correctedCvData.skills.forEach((cat: any) => {
          const validItems = cat.items ? cat.items.filter(Boolean) : [];
          if (validItems.length === 0) return;
          docHtml += `
            <div style="margin-bottom: 5px;">
              <span class="skills-category">${cat.category}:</span> ${validItems.join(" • ")}
            </div>
          `;
        });
        if (correctedCvData.languages && correctedCvData.languages.length > 0) {
          docHtml += `
            <div style="margin-top: 5px; border-top: 1px solid #eeeeee; padding-top: 5px;">
              <span class="skills-category">${isRtl ? "اللغات المكتسبة:" : "Languages:"}</span> ${correctedCvData.languages.join(" • ")}
            </div>
          `;
        }
        docHtml += `</div>`;
      }

      docHtml += `
        </body>
        </html>
      `;

      const blob = new Blob(['\\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      const downloadName = (correctedCvData.fullName || "Resume").replace(/\\s+/g, "_") + "_Word.doc";
      tempLink.setAttribute('download', downloadName);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "عذراً، فشل تصدير ملف الـ Word." : "Failed to export Word document.");
    } finally {
      setDocGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60";
    if (score >= 70) return "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60";
    return "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/60";
  };

  const getPercentageColor = (score: number) => {
    if (score >= 85) return "stroke-emerald-500";
    if (score >= 70) return "stroke-amber-400";
    return "stroke-rose-500";
  };

  return (
    <div className="space-y-12 pb-20"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="premium-card p-8 sm:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-black text-brand dark:text-white tracking-tightest leading-none">
              {t.auditTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {t.auditSubtitle}
            </p>
          </div>
          <div className="flex bg-slate-50 dark:bg-slate-950/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
             <button onClick={() => setCvFile(null)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!cvText ? "bg-white dark:bg-slate-900 text-brand dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" : "text-slate-400 hover:text-brand dark:hover:text-white"}`}>
                <Upload size={14} className="inline-block mb-0.5 ml-2" /> {lang === "ar" ? "ملف" : "File"}
             </button>
             <button onClick={() => setCvFile(null)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${cvText ? "bg-white dark:bg-slate-900 text-brand dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" : "text-slate-400 hover:text-brand dark:hover:text-white"}`}>
                <Type size={14} className="inline-block mb-0.5 ml-2" /> {lang === "ar" ? "نص" : "Text"}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <FileUploader
              selectedFile={cvFile}
              onFileLoaded={(file) => {
                setCvFile(file);
                if (file) setCvText("");
              }}
              lang={lang}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>
              {t.auditPasteLabel}
            </label>
            <textarea
              id="cv-text-input"
              value={cvText}
              onChange={(e) => {
                setCvText(e.target.value);
                if (e.target.value.trim()) setCvFile(null);
              }}
              placeholder={t.auditPastePlaceholder}
              className={`w-full h-42 p-6 bg-slate-50 dark:bg-slate-950/30 border-2 border-transparent focus:border-brand/10 dark:focus:border-white/10 rounded-[2rem] text-brand dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner text-sm ${lang === "ar" ? "text-right" : "text-left"}`}
            />
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            id="start-evaluate-btn"
            onClick={handleEvaluate}
            disabled={loading || (!cvFile && !cvText.trim())}
            className="premium-button-primary w-full sm:w-auto min-w-[240px] py-4.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:scale-100 disabled:active:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>{t.auditSubmitLoading}</span>
              </>
            ) : (
              <>
                <Search size={20} className="shrink-0" />
                <span>{t.auditSubmitBtn}</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center gap-3.5">
            <RefreshCw className="animate-spin text-indigo-500 flex-shrink-0" size={20} />
            <div className={`space-y-1 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <h4 className="text-sm font-semibold text-slate-850 dark:text-white animate-pulse">
                {loadingTexts[loadingStep]}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {lang === "ar"
                  ? "هذا الإجراء قد يستغرق من 5 إلى 15 ثانية حسب حجم الملف."
                  : "This procedure might take 5 to 15 seconds depending on file size."}
              </p>
            </div>
          </div>
        )}

      </div>

      {error && (
        <div id="evaluation-error-alert" className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-201 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-450 text-sm">
          <AlertTriangle className="flex-shrink-0" size={20} />
          <p className={`font-medium ${lang === "ar" ? "text-right" : "text-left"}`}>{error}</p>
        </div>
      )}

      {result && !loading && (
        <div id="evaluation-results-dashboard" className="space-y-8 animate-fade-in">

          <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 glass shadow-xl shadow-indigo-500/5 ${getScoreColor(result.score)}`}>

            <div className="flex-shrink-0 relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className={`transition-all duration-1000 ease-out ${getPercentageColor(result.score)}`}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={389.5}
                  strokeDashoffset={389.5 - (389.5 * result.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold font-display tracking-tight text-slate-800 dark:text-white">{result.score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === "ar" ? "من 100" : "out of 100"}
                </span>
              </div>
            </div>

            <div className={`flex-1 space-y-3 ${lang === "ar" ? "text-right" : "text-left"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/70 dark:bg-slate-800/60 shadow-sm">
                <Layers size={14} />
                <span>
                  {result.score >= 85
                    ? (lang === "ar" ? "توافق ممتاز" : "Excellent compatability")
                    : result.score >= 70
                    ? (lang === "ar" ? "توافق مقبول" : "Acceptable alignment")
                    : (lang === "ar" ? "توافق منخفض" : "Low ATS score")}
                </span>
              </div>
              <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
                {lang === "ar" ? "نتيجة الفرز الذكي" : "Smart ATS Score"}
              </h3>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-300">
                {result.summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800/60 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2.5">
                <span className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg">
                  <CheckCircle size={18} />
                </span>
                {lang === "ar" ? "مكامن القوة والتميز (Strengths)" : "Core Areas of Excellence (Strengths)"}
              </h3>
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2.5 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className={lang === "ar" ? "text-right" : "text-left"}>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800/60 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2.5">
                <span className="bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg">
                  <AlertTriangle size={18} />
                </span>
                {lang === "ar" ? "النقاط والأخطاء الحرجة (Weaknesses)" : "Critical Sieve Bottlenecks (Weaknesses)"}
              </h3>
              <ul className="space-y-3">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex gap-2.5 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span className={lang === "ar" ? "text-right" : "text-left"}>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
              {lang === "ar" ? "التدقيق الإملائي والأسلوب العام" : "Spelling, Grammar & Professional Style"}
            </h3>
            <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350">{result.grammarAndStyle}</p>
          </div>

          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {lang === "ar" ? "تحليل أركان وفهرس الـ CV الرئيسي" : "Section-by-Section ATS Penetration Review"}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {lang === "ar"
                  ? "تأكد من صياغة كل ركن لمنع استبعاد نظام الفرز لأي تفاصيل مهمة."
                  : "Ensure each area is formatted dynamically to prevent auto-filtering blockages."}
              </p>
            </div>

            <div className="space-y-4">

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === "ar" ? "البيانات الشخصية ومعلومات الاتصال" : "Contact Info & Personal Details"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed">{result.sectionsAnalysis.contactInfo}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === "ar" ? "الملخص المهني (Professional Summary)" : "Professional Summary"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed">{result.sectionsAnalysis.summary}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === "ar" ? "الخبرة العملية والمشروعات (Experience)" : "Work Experience & Achievements"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed">{result.sectionsAnalysis.experience}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === "ar" ? "المهارات والكلمات الدلالية التقنية (Skills)" : "Technical Skills & Keywords"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed">{result.sectionsAnalysis.skills}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === "ar" ? "التحصيل التعليمي والشهادات (Education)" : "Education & Academic Credentials"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed">{result.sectionsAnalysis.education}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl shadow-emerald-100 dark:shadow-none">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold">
                {lang === "ar" ? "الخطة الذهبية لتخطي أنظمة الـ ATS والحصول على المقابلات" : "Golden Roadmap to Bypass ATS Filters"}
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                {lang === "ar"
                  ? "ابدأ بتعديل الـ CV وفقاً لهذه الارشادات لزيادة فرصة قبولك للضعف."
                  : "Apply these enhancements to boost your resume callbacks rate."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.atsRecommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition duration-200">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-xs font-mono font-bold font-sans">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed self-center">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 rounded-3xl p-6 sm:p-8 border border-indigo-100 dark:border-indigo-900/40 space-y-6 shadow-sm ${lang === "ar" ? "text-right" : "text-left"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h4 className="text-md sm:text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2 justify-start">
                  <span>
                    {lang === "ar"
                      ? "توليد الـ CV المصحّح والجاهز للتحميل والمطابق لـ ATS"
                      : "Generate ATS-Compliant Corrected Resume"}
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === "ar"
                    ? "سيقوم محرك الذكاء الاصطناعي بتصحيح كافة الأخطاء المكتشفة تلقائياً، وإعادة صياغة إنجازاتك المهنية بدقة مع تعزيزها بمؤشرات أداء رقمية وكافّة الكلمات المفتاحية اللازمة."
                    : "The AI engine will automatically correct all identified errors, rewriting your achievements with digital KPIs and targeted search terms."}
                </p>
              </div>
              <button
                id="generate-corrected-cv-btn"
                onClick={handleGenerateCorrectedCV}
                disabled={correctedLoading}
                className="flex-shrink-0 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition duration-200 text-sm cursor-pointer"
              >
                {correctedLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-white" />
                    <span>{lang === "ar" ? "جاري التعديل والصياغة..." : "Rewriting & structuring..."}</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>{lang === "ar" ? "تعديل مقترح للـ CV (تحميل PDF)" : "Generate Corrected CV (Download PDF)"}</span>
                  </>
                )}
              </button>
            </div>
            {correctedError && (
              <p className="text-xs text-rose-500 font-semibold">{correctedError}</p>
            )}
          </div>

        </div>
      )}

      {showModal && correctedCvData && (
        <div id="corrected-cv-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-7xl xl:max-w-screen-xl 2xl:max-w-[1720px] w-full max-h-[92vh] overflow-hidden flex flex-col">

            <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className={`flex items-center gap-3 ${lang === "ar" ? "text-right" : "text-left"}`}>
                <div className="bg-indigo-100 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                    {lang === "ar" ? "الـ CV المصحح والمعدل المقترح (ATS Grade CV)" : "ATS-Compliant Suggested Resume"}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {lang === "ar" ? "جاهز تماماً للتحميل واستخدامه للتقديم المباشر." : "Standardized, fully formatted, and ready for primary submission."}
                  </p>
                </div>
              </div>
              <button
                id="close-cv-modal-btn"
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-150/30 dark:bg-slate-950/20">

              <div className={`lg:col-span-4 space-y-5 flex flex-col justify-between ${lang === "ar" ? "text-right" : "text-left"}`}>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-50/50 dark:border-slate-800 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {lang === "ar" ? "✨ أهم التعديلات والتحسينات المضافة:" : "✨ Applied Refinements & Fixes:"}
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-300 leading-relaxed list-disc list-inside">
                      <li>{lang === "ar" ? "إعادة صياغة الملخص المهني ليتضمن كلمات بحث ATS دلالية مبهرة." : "Replaced passive phrases with high-impact active, searchable keywords."}</li>
                      <li>{lang === "ar" ? "تحويل مهام المسؤوليات التكرارية إلى إنجازات كمية مدعومة بمؤشرات أداء (%-KPIs)." : "Synthesized empty tasks into quantified, metric-driven achievements."}</li>
                      <li>{lang === "ar" ? "تنظيم وتصنيف المهارات في مجموعات واضحة وسهلة الفرز الآلي واليدوي." : "Mapped skills into direct, filterable ATS industry categories."}</li>
                      <li>{lang === "ar" ? "صياغة لغوية ممتازة وتدقيق إملائي كامل بكافة الأقسام." : "Proofread and fully eradicated all potential writing or structures issues."}</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-800 dark:text-amber-400 text-xs leading-relaxed space-y-1">
                    <p className="font-bold">{lang === "ar" ? "📬 نصيحة مهنية:" : "📬 Career Advice:"}</p>
                    <p>{lang === "ar" ? "التحميل كـ PDF يعطيك نسخة منسقة كلياً. يمكنك كذلك نسخ النص واختبار مطابقتها مجدداً!" : "Downloading as PDF preserves the standard layout. You can also copy details to recompile later!"}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    id="download-cv-pdf-btn"
                    onClick={handleDownloadPDF}
                    disabled={pdfGenerating}
                    className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-indigo-150 dark:shadow-none transition duration-200 cursor-pointer text-sm"
                  >
                    {pdfGenerating ? (
                      <>
                        <RefreshCw size={18} className="animate-spin text-white" />
                        <span>{lang === "ar" ? "جاري إنشاء وتحميل الملف..." : "Generating A4 PDF Layout..."}</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>{lang === "ar" ? "تحميل الـ CV كـ PDF جاهز (للطباعة)" : "Download Resume PDF (Print Ready)"}</span>
                      </>
                    )}
                  </button>

                  <button
                    id="download-cv-word-btn"
                    onClick={handleDownloadWordDoc}
                    disabled={docGenerating}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-150 dark:shadow-none transition duration-200 cursor-pointer text-sm"
                  >
                    {docGenerating ? (
                      <>
                        <RefreshCw size={18} className="animate-spin text-white" />
                        <span>{lang === "ar" ? "جاري تجهيز مستند Word..." : "Generating Word Document..."}</span>
                      </>
                    ) : (
                      <>
                        <FileText size={18} />
                        <span>{lang === "ar" ? "تنزيل مستند Word قابل للتعديل (كلام عادي)" : "Download Editable Word CV (Real Text)"}</span>
                      </>
                    )}
                  </button>

                  <button
                    id="copy-cv-text-btn"
                    onClick={handleCopyText}
                    className="w-full py-3 px-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
                  >
                    {copySuccess ? (
                      <>
                        <Check size={18} className="text-emerald-500" />
                        <span className="text-emerald-500 font-bold">{lang === "ar" ? "تم نسخ النص بنجاح!" : "Plain text copied to clipboard!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>{lang === "ar" ? "نسخ النص الكامل للـ CV" : "Copy entire resume plain text"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {lang === "ar" ? "معاينة المستند الورقي (A4 Preview):" : "Printable Paper Preview (A4):"}
                  </span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-300 px-2.5 py-1 rounded-full font-bold">ATS Standard Format</span>
                </div>

                <div className="w-full overflow-x-auto rounded-2xl border border-slate-205 dark:border-slate-800 shadow-inner bg-neutral-200/50 p-4 min-h-[450px]">

                  <div
                    id="corrected-cv-pdf-template"
                    dir={hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "rtl" : "ltr"}
                    className={`bg-white text-slate-800 p-8 sm:p-12 shadow-sm font-sans mx-auto tracking-normal antialiased ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}
                    style={{
                      width: "794px",
                      minHeight: "1123px",
                      fontFamily: "Arial, sans-serif"
                    }}
                  >

                    <div className="text-center space-y-2 pb-6 border-b border-slate-200">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">{correctedCvData.fullName}</h1>
                      <p className="text-sm font-bold text-indigo-600 tracking-wide uppercase">{correctedCvData.professionalTitle}</p>

                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-medium pt-2">
                        {correctedCvData.phone && (
                          <span className="flex items-center gap-1">
                            <span>📞 {correctedCvData.phone}</span>
                          </span>
                        )}
                        {correctedCvData.email && (
                          <span className="flex items-center gap-1 font-mono">
                            ✉️ {correctedCvData.email}
                          </span>
                        )}
                        {correctedCvData.location && (
                          <span className="flex items-center gap-1">
                            📍 {correctedCvData.location}
                          </span>
                        )}
                      </div>

                      {correctedCvData.links && correctedCvData.links.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-indigo-505 font-medium pt-1">
                          {correctedCvData.links.map((link: string, idx: number) => (
                            <span key={idx} className="hover:underline">🔗 {link}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {correctedCvData.summary && (
                      <div className="mt-5 space-y-2">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.summary) ? "المستخلص والديباجة المهنية" : "Professional Summary"}
                        </h2>
                        <p className={`text-[11px] text-slate-600 leading-relaxed font-semibold ${hasArabic(correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {correctedCvData.summary}
                        </p>
                      </div>
                    )}

                    {correctedCvData.workExperience && correctedCvData.workExperience.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "الخبرات والمسيرة العملية" : "Work Experience"}
                        </h2>
                        <div className="space-y-3.5">
                          {correctedCvData.workExperience.map((job: any, index: number) => (
                            <div key={index} className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="text-slate-900">{job.role} — <span className="text-slate-500 font-medium">{job.company}</span></span>
                                <span className="text-slate-500 font-mono text-[10px]">{job.period}</span>
                              </div>
                              <ul className={`list-disc text-[11px] text-slate-600 space-y-1 font-semibold leading-relaxed ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'pr-4 pl-0 text-right list-inside' : 'pl-4 pr-0 text-left list-outside'}`}>
                                {job.bullets.map((bullet: string, bIdx: number) => (
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

                    {correctedCvData.projects && correctedCvData.projects.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "المشاريع والعمل الريادي" : "Key Projects"}
                        </h2>
                        <div className="space-y-3">
                          {correctedCvData.projects.map((proj: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="text-slate-900">{proj.title}</span>
                                <span className="text-slate-500 font-mono text-[10px]">{proj.period}</span>
                              </div>
                              {proj.technologies && proj.technologies.length > 0 && (
                                <p className={`text-[10px] text-indigo-600 font-bold ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                                  {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "التقنيات: " : "Technologies: "} {proj.technologies.join(" • ")}
                                </p>
                              )}
                              <ul className={`list-disc text-[11px] text-slate-600 space-y-0.5 font-semibold leading-relaxed ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'pr-4 pl-0 text-right list-inside' : 'pl-4 pr-0 text-left list-outside'}`}>
                                {proj.bullets.map((bullet: string, bIdx: number) => (
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

                    {correctedCvData.education && correctedCvData.education.length > 0 && (
                      <div className="mt-5 space-y-2.5">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "التعليم والشهادات الأكاديمية" : "Education"}
                        </h2>
                        <div className="space-y-2">
                          {correctedCvData.education.map((edu: any, index: number) => (
                            <div key={index} className="text-[11px]">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-slate-900">{edu.degree} — <span className="text-slate-500 font-medium">{edu.institution}</span></span>
                                <span className="text-slate-500 font-mono text-[10px]">{edu.period}</span>
                              </div>
                              {edu.details && (
                                <p className={`text-[10px] text-slate-500 mt-0.5 ${hasArabic(edu.details) ? 'text-right' : 'text-left'}`}>{edu.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {correctedCvData.skills && correctedCvData.skills.length > 0 && (
                      <div className="mt-5 space-y-2.5">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "المهارات والكلمات الدلالية التقنية" : "Skills & Competencies"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                          {correctedCvData.skills.map((skill: any, index: number) => (
                            <div key={index} className={`text-[11px] ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                              <span className="font-bold text-slate-800">{skill.category}: </span>
                              <span className="text-slate-600 font-semibold">{skill.items.join(" • ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {correctedCvData.languages && correctedCvData.languages.length > 0 && (
                      <div className="mt-5 space-y-1.5">
                        <h2 className={`text-[12px] font-extrabold text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {hasArabic(correctedCvData.fullName || correctedCvData.summary) ? "اللغات" : "Languages"}
                        </h2>
                        <p className={`text-[11px] text-slate-600 font-semibold ${hasArabic(correctedCvData.fullName || correctedCvData.summary) ? 'text-right' : 'text-left'}`}>
                          {correctedCvData.languages.join(" ، ")}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
