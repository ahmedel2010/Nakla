import React, { useState } from "react";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Link as LinkIcon,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  FolderGit,
  Award,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Palette,
  Layout,
  Globe2,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface CVBuilderProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

interface WorkExp {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

interface ProjectData {
  title: string;
  period: string;
  bullets: string[];
  technologies: string[];
}

interface EduData {
  degree: string;
  institution: string;
  period: string;
  details?: string;
}

interface SkillCategory {
  category: string;
  items: string[];
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ onActionStart, lang = "ar" }) => {
  const isAr = lang === "ar";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const [fullName, setFullName] = useState(isAr ? "أحمد المحمدي" : "Ahmed Hammadi");
  const [professionalTitle, setProfessionalTitle] = useState(isAr ? "أخصائي مبيعات وتطوير أعمال أول" : "Senior Sales & Business Development Specialist");
  const [email, setEmail] = useState("ahmed.hammadi@example.com");
  const [phone, setPhone] = useState("+20 100 123 4567");
  const [location, setLocation] = useState(isAr ? "العجوزة، الجيزة، مصر" : "Agouza, Giza, Egypt");
  const [linksText, setLinksText] = useState("linkedin.com/in/ahmed-hammadi, github.com/ahmed-hammadi");
  const [summary, setSummary] = useState(
    isAr
      ? "أخصائي تطوير أعمال ومبيعات ذو خبرة تفوق 6 سنوات في تحقيق قفزات ربحية للشركات وتوسيع الحصة السوقية. بارع في صياغة الاستراتيجيات التنافسية وإغلاق الصفقات المعقدة."
      : "Results-driven Sales & Business Development Executive with over 6 years of experience accelerating corporate revenue streams, building strategic partnerships, and managing accounts."
  );

  const [workExperience, setWorkExperience] = useState<WorkExp[]>([
    {
      role: isAr ? "ديفلوبر تطوير أعمال مبيعات" : "Business Development Executive",
      company: isAr ? "نماء للحلول البرمجية" : "Namaa Software Solutions",
      period: "2023 - Present",
      bullets: isAr ? [
        "سجلت زيادة في حجم المبيعات بنسبة 35% خلال الربع الأول من عام 2024 عبر استقطاب 15 شريكاً تجارياً جديداً.",
        "أعدت صياغة مقترحات العروض للمناقصات الكبرى، مما رفع نسبة الفوز بالعقود بنسبة 40% ووفر 120 ساعة عمل للفريق."
      ] : [
        "Accelerated regional software sales by 35% in Q1 2024 by acquiring 15 high-value enterprise accounts.",
        "Redesigned corporate proposal methodology, boosting bidding success rate by 40% and cutting preparation cycle by 15 hours weekly."
      ]
    },
    {
      role: isAr ? "أخصائي مبيعات خارجي" : "Account Executive",
      company: isAr ? "مجموعة السويدي للحلول" : "Elsewedy Technology Solutions",
      period: "2021 - 2023",
      bullets: isAr ? [
        "أشرفت على إدارة وتنمية محفظة عملاء كبرى تضم 28 عميلاً في السوق المصري محققاً مستهدفاً مالياً بقيمة 4.2 مليون جنيه.",
        "قللت فترة إتمام الصفقات (Sales Cycle) بنسبة 25% من خلال أتمتة وتطوير مسار ترشيح العملاء."
      ] : [
        "Managed and expanded a pipeline of 28 key industrial accounts, consistently exceeding annual quota by 12% to generate 4.2M EGP.",
        "Shortened average client acquisition cycle by 25% through CRM automation and rigorous pre-sales qualification audits."
      ]
    }
  ]);

  const [projects, setProjects] = useState<ProjectData[]>([
    {
      title: isAr ? "منصة مبيعات التجزئة الذكية" : "Smart Retail Pipeline Project",
      period: "2024",
      technologies: ["Salesforce CRM", "HubSpot", "Power BI", "Python"],
      bullets: isAr ? [
        "صممت نظام تنبؤ ذكياً للتفاعل التجاري المباشر أسهم في الكشف الفوري عن 400 عميل مهتم بالمنتجات الجاهزة.",
        "ربطت واصل الربط لرفع الكفاءة التشغيلية لقسم خدمة العملاء بنسبة 30%."
      ] : [
        "Engineered an automated lead scoring dashboard mapping over 400 corporate prospects, boosting SDR conversion by 18%.",
        "Formulated automated onboarding flows using HubSpot integrations, boosting net client retention rate by 12%."
      ]
    }
  ]);

  const [education, setEducation] = useState<EduData[]>([
    {
      degree: isAr ? "بكالوريوس إدارة أعمال وتسويق" : "B.Sc. in Business Administration & Marketing",
      institution: isAr ? "جامعة عين شمس" : "Ain Shams University",
      period: "2016 - 2020",
      details: isAr ? "تقدير ممتاز مع مرتبة الشرف الأولى مكللاً بدرجة التميز في بحوث الأسواق والتحليل الإحصائي للعملاء." : "Graduated with Highest Honors. Specialization in Market Research & Data Analytics."
    }
  ]);

  const [skills, setSkills] = useState<SkillCategory[]>([
    {
      category: isAr ? "المهارات المتخصصة والمبيعات" : "Core Sales & Technical Skills",
      items: isAr
        ? ["مفاوضات الصفقات الكبرى", "إدارة علاقات العملاء CRM", "التنبؤ المالي والمستهدف", "تحليل المنافسين", "أبحاث الأسواق"]
        : ["B2B & Enterprise Negotiating", "CRM Administration (Salesforce)", "Financial Forecasting", "Market Penetration", "Strategic Solution Selling"]
    },
    {
      category: isAr ? "المهارات العامة والتقنية" : "Productivity & Technologies",
      items: isAr
        ? ["تحليل البيانات باستخدام Power BI", "تطبيقات Microsoft 365", "مهارات الإقناع والتحدث العام", "القيادة وإدارة الفرق"]
        : ["Business Intelligence (Power BI)", "Microsoft Office 365 Pro", "Public Speaking & Presenting", "SaaS Concept Engineering"]
    }
  ]);

  const [languages, setLanguages] = useState<string[]>(isAr ? ["العربية (اللغة الأم)", "الإنجليزية (طلاقة مهنية)"] : ["Arabic (Native)", "English (Fluent)"]);

  const [templateStyle, setTemplateStyle] = useState<"classic" | "modern" | "minimal">("modern");
  const [accentColor, setAccentColor] = useState<string>("#2563eb");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [docGenerating, setDocGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [summaryAILoading, setSummaryAILoading] = useState(false);
  const [expAILoading, setExpAILoading] = useState<number | null>(null);
  const [projAILoading, setProjAILoading] = useState<number | null>(null);

  const handleResetForm = () => {
    if (confirm(isAr ? "هل أنت متأكد من رغبتك في إفراغ كافة البيانات للبدء من الصفر تماماً؟" : "Are you sure you want to completely clear the form and start from scratch?")) {
      setFullName("");
      setProfessionalTitle("");
      setEmail("");
      setPhone("");
      setLocation("");
      setLinksText("");
      setSummary("");
      setWorkExperience([]);
      setProjects([]);
      setEducation([]);
      setSkills([]);
      setLanguages([]);
      setCurrentStep(1);
    }
  };

  const handleAIGenerateSummary = async () => {
    if (!professionalTitle.trim()) {
      alert(isAr ? "الرجاء كتابة المسمى الوظيفي أولاً لنصوغ ملخصاً ذكياً على أساسه." : "Please type your professional title first so we can tailor the summary based on it.");
      return;
    }
    setSummaryAILoading(true);
    try {
      const resp = await fetch("/api/builder-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          title: professionalTitle,
          text: summary,
          lang: lang
        })
      });
      if (!resp.ok) throw new Error("API failed");
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response.");
      }
      const data = await resp.json();
      if (data.result) {
        setSummary(data.result);
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? "فشل الاتصال بالذكاء الاصطناعي. الرجاء المحاولة مجدداً." : "AI assistant failed to connect. Please retry.");
    } finally {
      setSummaryAILoading(false);
    }
  };

  const handleAIOptimizeExperience = async (index: number) => {
    const job = workExperience[index];
    if (!job.role || job.bullets.length === 0) {
      alert(isAr ? "يرجى ملء المسمى الوظيفي وكتابة بعض السطور في المهام أولاً." : "Please enter the role title and draft some raw responsibilities first.");
      return;
    }

    setExpAILoading(index);
    try {
      const rawText = job.bullets.join("\n");
      const resp = await fetch("/api/builder-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "experience",
          title: job.role,
          text: rawText,
          lang: lang
        })
      });
      if (!resp.ok) throw new Error("API failed");
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response.");
      }
      const data = await resp.json();
      if (data.result && Array.isArray(data.result)) {
        const updated = [...workExperience];
        updated[index].bullets = data.result;
        setWorkExperience(updated);
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? "فشل تحسين البيانات بالذكاء الاصطناعي." : "Failed to optimize work history bullets.");
    } finally {
      setExpAILoading(null);
    }
  };

  const handleAIOptimizeProject = async (index: number) => {
    const proj = projects[index];
    if (!proj.title || proj.bullets.length === 0) {
      alert(isAr ? "يرجى كتابة عنوان المشروع والوصف الأساسي." : "Please enter the project name and raw details.");
      return;
    }

    setProjAILoading(index);
    try {
      const rawText = proj.bullets.join("\n");
      const resp = await fetch("/api/builder-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          title: proj.title,
          text: rawText,
          lang: lang
        })
      });
      if (!resp.ok) throw new Error("API Failed");
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response.");
      }
      const data = await resp.json();
      if (data.result && Array.isArray(data.result)) {
        const updated = [...projects];
        updated[index].bullets = data.result;
        setProjects(updated);
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? "فشل تحسين المشروع." : "Failed to optimize project details.");
    } finally {
      setProjAILoading(null);
    }
  };

  const handleAddExperience = () => {
    setWorkExperience([...workExperience, {
      role: "",
      company: "",
      period: "",
      bullets: [""]
    }]);
  };

  const handleRemoveExperience = (idx: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== idx));
  };

  const handleAddExpBullet = (expIdx: number) => {
    const updated = [...workExperience];
    updated[expIdx].bullets.push("");
    setWorkExperience(updated);
  };

  const handleRemoveExpBullet = (expIdx: number, bulletIdx: number) => {
    const updated = [...workExperience];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bulletIdx);
    setWorkExperience(updated);
  };

  const handleAddProject = () => {
    setProjects([...projects, {
      title: "",
      period: "",
      bullets: [""],
      technologies: [""]
    }]);
  };

  const handleRemoveProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleAddProjBullet = (projIdx: number) => {
    const updated = [...projects];
    updated[projIdx].bullets.push("");
    setProjects(updated);
  };

  const handleRemoveProjBullet = (projIdx: number, bulletIdx: number) => {
    const updated = [...projects];
    updated[projIdx].bullets = updated[projIdx].bullets.filter((_, i) => i !== bulletIdx);
    setProjects(updated);
  };

  const handleAddEducation = () => {
    setEducation([...education, {
      degree: "",
      institution: "",
      period: "",
      details: ""
    }]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleAddSkillCategory = () => {
    setSkills([...skills, {
      category: "",
      items: [""]
    }]);
  };

  const handleRemoveSkillCategory = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddSkillItem = (catIdx: number) => {
    const updated = [...skills];
    updated[catIdx].items.push("");
    setSkills(updated);
  };

  const handleRemoveSkillItem = (catIdx: number, itemIdx: number) => {
    const updated = [...skills];
    updated[catIdx].items = updated[catIdx].items.filter((_, i) => i !== itemIdx);
    setSkills(updated);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("scratch-cv-pdf-template");
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

      const r_l = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
      const g_l = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
      const b_l = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

      const clip = (x: number) => Math.max(0, Math.min(255, Math.round(x * 255)));
      return [clip(r_l), clip(g_l), clip(b_l)];
    }

    window.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle(el, pseudoElt);
      const updatedStyle = style as any;
      const rewriteProps = ["backgroundColor", "borderColor", "color", "stroke"];

      rewriteProps.forEach((prop) => {
        const val = style[prop as any] as string;
        if (val && val.includes("oklch")) {
          const match = val.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
          if (match) {
            const l = parseFloat(match[1]);
            const c = parseFloat(match[2]);
            const h = parseFloat(match[3]);
            const [r, g, b] = oklchToRgb(l, c, h);
            updatedStyle[prop] = `rgb(${r}, ${g}, ${b})`;
          }
        }
      });
      return style;
    };

    onActionStart(async () => {
      try {
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

        const sanitizedName = fullName.replace(/\s+/g, "_") || "ATS_Resume";
        pdf.save(`${sanitizedName}_Nakla_A4.pdf`);
      } catch (err) {
        console.error("PDF engine crash detail:", err);
        alert(isAr ? "عذراً، فشل توليد ملف الـ PDF." : "Error synthesizing the printable PDF module.");
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        setPdfGenerating(false);
      }
    });
  };

  const handleCopyText = () => {
    let textOut = `\n${fullName}\n${professionalTitle}\n${email} | ${phone} | ${location}\n${linksText}\n\n`;
    textOut += `-------------------------------\nSUMMARY\n-------------------------------\n${summary}\n\n`;

    textOut += `-------------------------------\nWORK EXPERIENCE\n-------------------------------\n`;
    workExperience.forEach((job) => {
      textOut += `${job.role} - ${job.company} (${job.period})\n`;
      job.bullets.forEach((b) => {
        if (b.trim()) textOut += `• ${b}\n`;
      });
      textOut += `\n`;
    });

    textOut += `-------------------------------\nKEY PROJECTS\n-------------------------------\n`;
    projects.forEach((proj) => {
      textOut += `${proj.title} (${proj.period})\n`;
      if (proj.technologies.length > 0) textOut += `Tech: ${proj.technologies.join(", ")}\n`;
      proj.bullets.forEach((b) => {
        if (b.trim()) textOut += `• ${b}\n`;
      });
      textOut += `\n`;
    });

    textOut += `-------------------------------\nEDUCATION\n-------------------------------\n`;
    education.forEach((edu) => {
      textOut += `${edu.degree} - ${edu.institution} (${edu.period})\n${edu.details || ""}\n\n`;
    });

    textOut += `-------------------------------\nSKILLS & LANGUAGES\n-------------------------------\n`;
    skills.forEach((cat) => {
      textOut += `${cat.category}: ${cat.items.join(", ")}\n`;
    });
    if (languages.length > 0) textOut += `Languages: ${languages.join(", ")}\n`;

    navigator.clipboard.writeText(textOut);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadWordDoc = () => {
    setDocGenerating(true);
    try {
      const isRtlLang = isRtl;
      const fullNameText = fullName || (isAr ? "الاسم الكامل" : "Your Name");
      const titleText = professionalTitle || (isAr ? "المسمى الوظيفي" : "Professional Title");
      const phoneVal = phone ? `<span>📞 ${phone}</span>` : "";
      const emailVal = email ? `<span>✉️ ${email}</span>` : "";
      const locVal = location ? `<span>📍 ${location}</span>` : "";

      let contactsRow = [phoneVal, emailVal, locVal].filter(Boolean).join(" &nbsp;|&nbsp; ");
      let linksRow = "";
      if (linksText.trim()) {
        linksRow = `<div class="contacts">` + linksText.split(",").map(l => `🔗 ${l.trim()}`).join(" &nbsp;|&nbsp; ") + `</div>`;
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
              direction: ${isRtlLang ? "rtl" : "ltr"};
              text-align: ${isRtlLang ? "right" : "left"};
            }
            .header {
              text-align: center;
              border-bottom: 2px solid ${accentColor};
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
              color: ${accentColor};
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
              color: ${accentColor};
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

      if (summary) {
        docHtml += `
          <div class="section-title">${isAr ? "الملخص والهدف المهني" : "Professional Summary"}</div>
          <div class="section-content">${summary}</div>
        `;
      }

      if (workExperience.length > 0) {
        docHtml += `
          <div class="section-title">${isAr ? "الخبرات والمسار المهني" : "Employment History"}</div>
          <div class="section-content">
        `;
        workExperience.forEach(job => {
          if (!job.role && !job.company) return;
          let bulletItems = "";
          if (job.bullets && job.bullets.length > 0) {
            bulletItems = "<ul>" + job.bullets.map(b => b.trim() ? `<li>${b}</li>` : "").join("") + "</ul>";
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

      if (projects.length > 0) {
        docHtml += `
          <div class="section-title">${isAr ? "المشاريع والحلول التطبيقية" : "Key Project Portfolio"}</div>
          <div class="section-content">
        `;
        projects.forEach(proj => {
          if (!proj.title) return;
          let bulletItems = "";
          if (proj.bullets && proj.bullets.length > 0) {
            bulletItems = "<ul>" + proj.bullets.map(b => b.trim() ? `<li>${b}</li>` : "").join("") + "</ul>";
          }
          let techStr = "";
          if (proj.technologies && proj.technologies.length > 0 && proj.technologies[0] !== "") {
            techStr = `<div style="font-size: 9.5pt; font-weight: bold; color: ${accentColor}; margin-bottom: 2px;">
              ${isAr ? "التقنيات المستخدمة: " : "Technologies: "} ${proj.technologies.join(" • ")}
            </div>`;
          }
          const projPeriod = proj.period ? ` &mdash; (${proj.period})` : "";

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

      if (education.length > 0) {
        docHtml += `
          <div class="section-title">${isAr ? "التحصيل الأكاديمي والشهادات" : "Academic Credentials"}</div>
          <div class="section-content">
        `;
        education.forEach(edu => {
          if (!edu.degree && !edu.institution) return;
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

      if (skills.length > 0 || languages.length > 0) {
        docHtml += `
          <div class="section-title">${isAr ? "المهارات المتخصصة واللغات" : "Talent Taxonomy & Languages"}</div>
          <div class="section-content skills-list">
        `;
        skills.forEach(cat => {
          if (!cat.category) return;
          const validItems = cat.items ? cat.items.filter(Boolean) : [];
          if (validItems.length === 0) return;
          docHtml += `
            <div style="margin-bottom: 5px;">
              <span class="skills-category">${cat.category}:</span> ${validItems.join(" • ")}
            </div>
          `;
        });
        if (languages.length > 0 && languages[0] !== "") {
          docHtml += `
            <div style="margin-top: 5px; border-top: 1px solid #eeeeee; padding-top: 5px;">
              <span class="skills-category">${isAr ? "اللغات المكتسبة:" : "Languages:"}</span> ${languages.join(" • ")}
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
      const downloadName = (fullName || "Resume").replace(/\\s+/g, "_") + "_Word.doc";
      tempLink.setAttribute('download', downloadName);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (err) {
      console.error(err);
      alert(isAr ? "عذراً، فشل تصدير ملف الـ Word." : "Failed to export Word document.");
    } finally {
      setDocGenerating(false);
    }
  };

  const hasArabic = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text || "");
  };

  const isRtl = hasArabic(fullName) || hasArabic(summary);

  return (
    <div className="space-y-8" id="cv-builder-section">

      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-200/50 dark:border-white/10">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <React.Fragment key={stepNum}>
                <button
                  onClick={() => setCurrentStep(stepNum)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 focus:outline-none`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    {stepNum}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {stepNum === 1 ? (isAr ? "البيانات الشخصية" : "Personal Care") :
                     stepNum === 2 ? (isAr ? "الملخص المهني" : "Summary") :
                     stepNum === 3 ? (isAr ? "الخبرات" : "Work Experience") :
                     stepNum === 4 ? (isAr ? "المشاريع" : "Projects") :
                     stepNum === 5 ? (isAr ? "التعليم" : "Education") :
                     stepNum === 6 ? (isAr ? "المهارات واللغات" : "Skills & Languages") :
                     (isAr ? "المعاينة والتنزيل" : "Compile A4")}
                  </span>
                </button>
                {stepNum < totalSteps && (
                  <div className={`flex-1 h-[2px] min-w-[12px] bg-slate-200 dark:bg-slate-800 transition-colors ${
                    currentStep > stepNum ? "bg-emerald-500" : ""
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        <div className="xl:col-span-5 bg-white dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-md font-black tracking-tight flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">الخطوة {currentStep}</span>
              {currentStep === 1 && (isAr ? "البيانات الشخصية ومفاتيح التواصل" : "Contact details & headers")}
              {currentStep === 2 && (isAr ? "الملخص المهني والكلمات الدلالية" : "Professional executive summary")}
              {currentStep === 3 && (isAr ? "الخبرات والمسيرة الوظيفية" : "Review work history")}
              {currentStep === 4 && (isAr ? "المشاريع والعمل الريادي" : "Add key projects")}
              {currentStep === 5 && (isAr ? "التحصيل التعليمي والشهادات" : "Review academic history")}
              {currentStep === 6 && (isAr ? "المهارات واللغات المكتسبة" : "Skills & languages categorization")}
              {currentStep === 7 && (isAr ? "ألوان وأخراجه وتحميل الـ PDF" : "Layout preview styling options")}
            </h3>

            <button
              onClick={handleResetForm}
              className="text-[10px] font-bold text-rose-500 hover:bg-rose-500/5 px-2.5 py-1 rounded transition-colors"
            >
              {isAr ? "إفراغ النموذج 🔄" : "Clear fields 🔄"}
            </button>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "الاسم الكامل واللقب:" : "Full name & titles:"}</label>
                <div className="relative">
                  <User size={15} className="absolute top-3.5 right-3 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? "مثال: أحمد المحمدي" : "e.g. Ahmed Ali"}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none ${isAr ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "المسمى الوظيفي المستهدف:" : "Professional Subtitle:"}</label>
                <input
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder={isAr ? "مثال: أخصائي مبيعات أول" : "e.g. Senior Software Engineer"}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "البريد الإلكتروني:" : "Email address:"}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "رقم الهاتف:" : "Phone connection:"}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20100..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "الموقع (المدينة والبلد):" : "Location:"}</label>
                <div className="relative">
                  <MapPin size={15} className="absolute top-3.5 right-3 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isAr ? "القاهرة، مصر" : "Cairo, Egypt"}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none ${isAr ? "pr-10" : "pl-10"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{isAr ? "روابط مفيدة (مثل LinkedIn، GitHub مفصولة بفاصلة):" : "Relevant external links:"}</label>
                <input
                  type="text"
                  value={linksText}
                  onChange={(e) => setLinksText(e.target.value)}
                  placeholder="linkedin.com/in/username, github.com/username"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{isAr ? "اكتب نبذة أو الصق ليرتبها الـ AI:" : "Draft raw summary or idea:"}</label>

                <button
                  onClick={handleAIGenerateSummary}
                  disabled={summaryAILoading}
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg active:scale-95 disabled:opacity-50 tracking-wider transition-all shadow-xs"
                >
                  {summaryAILoading ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <Sparkles size={11} />
                  )}
                  <span>{isAr ? "صياغة وتعديل بالذكاء الاصطناعي ✨" : "Draft with AI ✨"}</span>
                </button>
              </div>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                placeholder={isAr ? "تحدث هنا باختصار عن شغفك وعدد سنوات خبرتك والمهارات التي تثق بها..." : "List your passion, years of experience, or main accomplishments..."}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold leading-relaxed focus:ring-1 focus:ring-blue-600 outline-none text-slate-700 dark:text-slate-200"
              />
              <p className="text-[10px] text-slate-400 font-bold leading-none mt-1">
                {isAr ? "* سيقوم الذكاء الاصطناعي بصياغة ٣ إلى ٤ أسطر احترافية مشبعة بالكلمات المفتاحية." : "* AI transforms draft points inside summary to standard recruiters-grade metrics summary."}
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "السجل والخبرة العملية:" : "Listed employment history:"}</span>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                >
                  <Plus size={12} />
                  <span>{isAr ? "إضافة خبرة" : "Add Experience"}</span>
                </button>
              </div>

              {workExperience.map((job, jIdx) => (
                <div key={jIdx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 relative space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(jIdx)}
                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                    title={isAr ? "حذف هذه الخبرة" : "Delete Experience"}
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "المسمى الوظيفي:" : "Role/Title:"}</label>
                      <input
                        type="text"
                        value={job.role}
                        onChange={(e) => {
                          const updated = [...workExperience];
                          updated[jIdx].role = e.target.value;
                          setWorkExperience(updated);
                        }}
                        placeholder={isAr ? "مثال: مبيعات التجزئة" : "e.g. Sales Specialist"}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "الشركة / المنظمة:" : "Company Name:"}</label>
                      <input
                        type="text"
                        value={job.company}
                        onChange={(e) => {
                          const updated = [...workExperience];
                          updated[jIdx].company = e.target.value;
                          setWorkExperience(updated);
                        }}
                        placeholder={isAr ? "السويدي للتكنولوجيا" : "e.g. Google LLC"}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "فترة العمل (من كذا لـ كذا):" : "Employment years:"}</label>
                    <input
                      type="text"
                      value={job.period}
                      onChange={(e) => {
                        const updated = [...workExperience];
                        updated[jIdx].period = e.target.value;
                        setWorkExperience(updated);
                      }}
                      placeholder="Oct 2021 - Present"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? "المهام والإنجازات (نقاط دلالية):" : "Bullet accomplishments:"}</span>
                      <button
                        type="button"
                        onClick={() => handleAddExpBullet(jIdx)}
                        className="text-[9px] font-bold text-blue-600 hover:underline"
                      >
                        + {isAr ? "إضافة نقطة" : "Add bullet"}
                      </button>
                    </div>

                    {job.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-1 items-center">
                        <textarea
                          value={b}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[jIdx].bullets[bIdx] = e.target.value;
                            setWorkExperience(updated);
                          }}
                          rows={2}
                          placeholder={isAr ? "صف مهامك كـ 'المسؤولية الإدارية' أو 'زيادة كفاءة الفهرسة للضعف'." : "Highlight direct key accomplishments..."}
                          className="flex-1 bg-white dark:bg-slate-950 border border-slate-200/50 p-2 rounded-lg text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExpBullet(jIdx, bIdx)}
                          className="text-rose-400 hover:text-rose-500 shrink-0 p-1"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAIOptimizeExperience(jIdx)}
                    disabled={expAILoading === jIdx}
                    className="w-full mt-3 flex items-center justify-center gap-1 bg-blue-600/5 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/5 dark:text-blue-400 border border-blue-600/20 py-2 rounded-lg text-[10px] font-black transition-all active:scale-98"
                  >
                    {expAILoading === jIdx ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    <span>{isAr ? "بث قوة ومؤشرات الأداء بالـ AI ✨" : "Revamp with AI verbs & metrics ✨"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "المشاريع والعمل المستقل:" : "Listed portfolio projects:"}</span>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                >
                  <Plus size={12} />
                  <span>{isAr ? "إضافة مشروع" : "Add Project"}</span>
                </button>
              </div>

              {projects.map((proj, pIdx) => (
                <div key={pIdx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 relative space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(pIdx)}
                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "اسم المشروع:" : "Project Title:"}</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[pIdx].title = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="e.g. Sales Forecast Dashboard"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "فترة المشروع (سنة):" : "Project Year:"}</label>
                      <input
                        type="text"
                        value={proj.period}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[pIdx].period = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="2024"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "التقنيات المستخدمة (مفصولة بفاصلة):" : "Technologies (comma separated):"}</label>
                    <input
                      type="text"
                      value={proj.technologies.join(", ")}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[pIdx].technologies = e.target.value.split(",").map(t => t.trim());
                        setProjects(updated);
                      }}
                      placeholder="Salesforce, HubSpot, Power BI"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? "شرح ومخرجات المشروع:" : "Project bullet details:"}</span>
                      <button
                        type="button"
                        onClick={() => handleAddProjBullet(pIdx)}
                        className="text-[9px] font-bold text-blue-600 hover:underline"
                      >
                        + {isAr ? "إضافة شرح" : "Add description"}
                      </button>
                    </div>

                    {proj.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-1 items-center">
                        <textarea
                          value={b}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[pIdx].bullets[bIdx] = e.target.value;
                            setProjects(updated);
                          }}
                          rows={2}
                          placeholder={isAr ? "صممت نظام أتمتة الصفقات لتسريح العمل المكرر..." : "Designed automated CRM routing which..."}
                          className="flex-1 bg-white dark:bg-slate-950 border border-slate-200/50 p-2 rounded-lg text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProjBullet(pIdx, bIdx)}
                          className="text-rose-400 hover:text-rose-500 shrink-0 p-1"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAIOptimizeProject(pIdx)}
                    disabled={projAILoading === pIdx}
                    className="w-full mt-3 flex items-center justify-center gap-1 bg-indigo-500/5 hover:bg-indigo-500 text-indigo-500 hover:text-white border border-indigo-500/20 py-2 rounded-lg text-[10px] font-black transition-all active:scale-98"
                  >
                    {projAILoading === pIdx ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    <span>{isAr ? "صياغة معمارية المشروع بالـ AI ✨" : "Revamp details with AI verbs ✨"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "السجلات الأكاديمية والشهادات:" : "Education records:"}</span>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                >
                  <Plus size={12} />
                  <span>{isAr ? "إضافة شهادة" : "Add Education"}</span>
                </button>
              </div>

              {education.map((edu, eIdx) => (
                <div key={eIdx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 relative space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(eIdx)}
                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "الدرجة العلمية / الشهادة:" : "Degree / Certificate:"}</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[eIdx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      placeholder="e.g. Master of Science in Accounting"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "الجامعة / الجهة المانحة:" : "Institution Name:"}</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eIdx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. Ain Shams University"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "سنين الدراسة:" : "Academic Period:"}</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[eIdx].period = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="2016 - 2020"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "تفاصيل إضافية / تقديرات (اختياري):" : "Additional details (Optional):"}</label>
                    <input
                      type="text"
                      value={edu.details}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[eIdx].details = e.target.value;
                        setEducation(updated);
                      }}
                      placeholder={isAr ? "تقدير ممتاز مع شرف" : "GPA 3.8/4.0 Or Top honors..."}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "تصنيفات المهارات ومفرداتها:" : "Specialized structural skills:"}</span>
                <button
                  type="button"
                  onClick={handleAddSkillCategory}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                >
                  <Plus size={12} />
                  <span>{isAr ? "إضافة فئة مهارات" : "Add category"}</span>
                </button>
              </div>

              {skills.map((cat, cIdx) => (
                <div key={cIdx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 relative space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillCategory(cIdx)}
                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? "عنوان فئة المهارات:" : "Skills category title:"}</label>
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => {
                        const updated = [...skills];
                        updated[cIdx].category = e.target.value;
                        setSkills(updated);
                      }}
                      placeholder="e.g. Sales Technology Tools"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">{isAr ? "قائمة المهارات في هذه الفئة:" : "Skill items list:"}</span>
                      <button
                        type="button"
                        onClick={() => handleAddSkillItem(cIdx)}
                        className="text-[9px] font-bold text-blue-600 hover:underline"
                      >
                        + {isAr ? "إضافة مهارة" : "Add skill"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200/50 p-1 pl-2 text-xs font-bold gap-1">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...skills];
                              updated[cIdx].items[itemIdx] = e.target.value;
                              setSkills(updated);
                            }}
                            placeholder="Skill"
                            className="bg-transparent border-none focus:outline-none p-0.5 text-xs max-w-[120px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillItem(cIdx, itemIdx)}
                            className="text-rose-500 hover:bg-rose-500/10 p-0.5 rounded shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">{isAr ? "اللغات وتحديثاتها (مفصولة بفاصلة):" : "Languages list (comma separated):"}</label>
                <input
                  type="text"
                  value={languages.join(", ")}
                  onChange={(e) => setLanguages(e.target.value.split(",").map(l => l.trim()).filter(Boolean))}
                  placeholder="e.g. Arabic, English"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200/50 p-2.5 rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "١. أسلوب و تنسيق هيكل السيرة:" : "Choose CV template layout style:"}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTemplateStyle("classic")}
                    className={`p-3 rounded-xl border text-xs font-black text-center transition-all ${
                      templateStyle === "classic"
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:border-white/5"
                    }`}
                  >
                    {isAr ? "كلاسيكي كحلي" : "Classic"}
                  </button>
                  <button
                    onClick={() => setTemplateStyle("modern")}
                    className={`p-3 rounded-xl border text-xs font-black text-center transition-all ${
                      templateStyle === "modern"
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:border-white/5"
                    }`}
                  >
                    {isAr ? "حديث وأنيق" : "Modern"}
                  </button>
                  <button
                    onClick={() => setTemplateStyle("minimal")}
                    className={`p-3 rounded-xl border text-xs font-black text-center transition-all ${
                      templateStyle === "minimal"
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:border-white/5"
                    }`}
                  >
                    {isAr ? "بسيط وعملي" : "Sleek"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? "٢. اللون المهيمن بالـ CV:" : "Select primary branding color:"}</label>
                <div className="flex gap-3">
                  {[
                    { hex: "#2563eb", name: "blue" },
                    { hex: "#0f766e", name: "teal" },
                    { hex: "#0284c7", name: "sky" },
                    { hex: "#dc2626", name: "crimson" },
                    { hex: "#1e293b", name: "slate" },
                    { hex: "#059669", name: "emerald" },
                  ].map((colorObj) => (
                    <button
                      key={colorObj.hex}
                      onClick={() => setAccentColor(colorObj.hex)}
                      style={{ backgroundColor: colorObj.hex }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        accentColor === colorObj.hex ? "scale-115 ring-2 ring-blue-500 ring-offset-2" : "border-transparent opacity-80"
                      }`}
                      title={colorObj.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm p-4 rounded-xl transition-all shadow-lg hover:shadow-blue-600/10 active:scale-98"
                >
                  {pdfGenerating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>{pdfGenerating ? (isAr ? "جاري تجميع الملف كـ PDF..." : "Assembling standard Layout...") : (isAr ? "تحميل الـ CV الآن كـ PDF (للطباعة)" : "Download PDF (Print Ready)")}</span>
                </button>

                <button
                  onClick={handleDownloadWordDoc}
                  disabled={docGenerating}
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm p-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/10 active:scale-98"
                >
                  {docGenerating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>{docGenerating ? (isAr ? "جاري تجهيز مستند Word..." : "Generating Word Document...") : (isAr ? "تنزيل مستند Word قابل للتعديل (كلام عادي)" : "Download Editable Word CV (Real Text)")}</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center justify-center gap-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs py-3 rounded-lg border border-slate-250 dark:border-white/5 transition-all active:scale-98"
                >
                  {copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copySuccess ? (isAr ? "تم نسخ السيرة!" : "Copied successfully!") : (isAr ? "نسخ النص الكامل للـ CV" : "Copy raw text")}</span>
                </button>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                  <Check size={12} />
                  <span>{isAr ? "جاهزية تامة ومطابقة 98%" : "Full compatibility ready"}</span>
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-relaxed">
                  {isAr
                    ? "السيرة المركبة متوافقة 100% مع أنظمة الفرز الإلكتروني وبوابات إدراك السير. تم تنسيقها لتجاوز الفلترة والتأهيل للمقابلات!"
                    : "Your constructed CV is completely compliance-engineered for premium parsers. Optimized details reduce audit sieve bounce-backs by 98.7%."}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 select-none">
            <button
              onClick={() => setCurrentStep(prev => prev > 1 ? prev - 1 : 1)}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 font-black text-xs border border-slate-200 dark:border-white/5 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
            >
              {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span>{isAr ? "السابق" : "Prev"}</span>
            </button>

            <span className="text-[11px] font-black text-slate-300 dark:text-slate-600">
              {currentStep} / {totalSteps}
            </span>

            <button
              onClick={() => setCurrentStep(prev => prev < totalSteps ? prev + 1 : totalSteps)}
              disabled={currentStep === totalSteps}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs rounded-xl disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Layout size={12} />
              <span>{isAr ? "شاشة المعاينة الحقيقية (A4 Live View):" : "Standard A4 Paper Live View:"}</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold">
                {isAr ? "متوافق مع الذكاء الاصطناعي" : "AI compliance-vetted"}
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide">
                ATS Approved
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-inner bg-slate-100/50 dark:bg-slate-900/40 p-4 min-h-[500px]">

            <div
              id="scratch-cv-pdf-template"
              dir={isRtl ? "rtl" : "ltr"}
              className={`bg-white text-slate-800 p-8 sm:p-12 shadow-md mx-auto relative select-none antialiased`}
              style={{
                width: "794px",
                minHeight: "1123px",
                fontFamily: "Arial, sans-serif"
              }}
            >

              <div
                className="text-center pb-6 border-b"
                style={{ borderColor: `${accentColor}30` }}
              >
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{fullName || (isAr ? "[اسمك بالكامل]" : "[Candidate Full Name]")}</h1>
                <p
                  className="text-[13px] font-extrabold tracking-wide uppercase mt-1"
                  style={{ color: accentColor }}
                >
                  {professionalTitle || (isAr ? "[المسمى الوظيفي الخاص بك]" : "[Target Professional Title]")}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-bold pt-3">
                  {phone && (
                    <span className="flex items-center gap-1">
                      <span>📞 {phone}</span>
                    </span>
                  )}
                  {email && (
                    <span className="flex items-center gap-1 font-mono">
                      <span>✉️ {email}</span>
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1">
                      <span>📍 {location}</span>
                    </span>
                  )}
                </div>

                {linksText.trim() && (
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold mt-2 text-slate-400">
                    {linksText.split(",").map((l, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span>🔗</span>
                        <span className="hover:underline text-[10px]">{l.trim()}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {summary && (
                <div className="mt-5 space-y-2">
                  <h2
                    className={`text-[12px] font-extrabold border-b pb-1 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                    style={{ color: accentColor, borderColor: `${accentColor}40` }}
                  >
                    {isAr ? "الملخص والهدف المهني" : "Professional Summary"}
                  </h2>
                  <p className={`text-[11px] leading-relaxed font-semibold text-slate-650 ${isRtl ? "text-right" : "text-left"}`}>
                    {summary}
                  </p>
                </div>
              )}

              {workExperience.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h2
                    className={`text-[12px] font-extrabold border-b pb-1 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                    style={{ color: accentColor, borderColor: `${accentColor}40` }}
                  >
                    {isAr ? "الخبرات والمسار المهني" : "Employment History"}
                  </h2>

                  <div className="space-y-4">
                    {workExperience.map((job, idx) => {
                      if (!job.role && !job.company) return null;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-black">
                            <span className="text-slate-900">
                              {job.role} <span className="text-slate-400 font-bold">—</span> <span className="text-slate-600 font-bold">{job.company}</span>
                            </span>
                            {job.period && (
                              <span className="text-slate-400 font-mono text-[10px] tracking-tight">{job.period}</span>
                            )}
                          </div>

                          {job.bullets.length > 0 && (
                            <ul className={`list-disc text-[11px] text-slate-600 space-y-1 font-semibold leading-relaxed ${isRtl ? "pr-4 pl-0 text-right list-inside" : "pl-4 pr-0 text-left list-outside"}`}>
                              {job.bullets.map((b, bIdx) => {
                                if (!b.trim()) return null;
                                return <li key={bIdx}>{b}</li>;
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h2
                    className={`text-[12px] font-extrabold border-b pb-1 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                    style={{ color: accentColor, borderColor: `${accentColor}40` }}
                  >
                    {isAr ? "المشاريع والحلول التطبيقية" : "Key Project Portfolio"}
                  </h2>

                  <div className="space-y-3">
                    {projects.map((proj, idx) => {
                      if (!proj.title) return null;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-black">
                            <span className="text-slate-900 font-bold">{proj.title}</span>
                            {proj.period && (
                              <span className="text-slate-400 font-mono text-[10px]">{proj.period}</span>
                            )}
                          </div>

                          {proj.technologies && proj.technologies.length > 0 && proj.technologies[0] !== "" && (
                            <div className={`text-[9.5px] font-black ${isRtl ? "text-right" : "text-left"}`} style={{ color: accentColor }}>
                              {isAr ? "التقنيات المستخدمة: " : "Technologies: "} {proj.technologies.join(" • ")}
                            </div>
                          )}

                          {proj.bullets.length > 0 && (
                            <ul className={`list-disc text-[11px] text-slate-600 space-y-0.5 font-semibold leading-relaxed ${isRtl ? "pr-4 pl-0 text-right list-inside" : "pl-4 pr-0 text-left list-outside"}`}>
                              {proj.bullets.map((b, bIdx) => {
                                if (!b.trim()) return null;
                                return <li key={bIdx}>{b}</li>;
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h2
                    className={`text-[12px] font-extrabold border-b pb-1 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                    style={{ color: accentColor, borderColor: `${accentColor}40` }}
                  >
                    {isAr ? "التحصيل الأكاديمي والشهادات" : "Academic Credentials"}
                  </h2>

                  <div className="space-y-2.5">
                    {education.map((edu, idx) => {
                      if (!edu.degree && !edu.institution) return null;
                      return (
                        <div key={idx} className="text-[11px] font-bold leading-relaxed">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-900">{edu.degree}</span>
                            {edu.period && (
                              <span className="text-slate-400 font-mono text-[10px]">{edu.period}</span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[10.5px] font-semibold">{edu.institution}</div>
                          {edu.details && (
                            <p className="text-slate-405 text-[10px] italic">{edu.details}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(skills.length > 0 || languages.length > 0) && (
                <div className="mt-5 space-y-3 pb-4">
                  <h2
                    className={`text-[12px] font-extrabold border-b pb-1 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}
                    style={{ color: accentColor, borderColor: `${accentColor}40` }}
                  >
                    {isAr ? "المهارات المتخصصة واللغات" : "Talent Taxonomy & Languages"}
                  </h2>

                  <div className="grid grid-cols-1 gap-2.5">
                    {skills.map((cat, idx) => {
                      if (!cat.category) return null;
                      const validItems = cat.items.filter(Boolean);
                      if (validItems.length === 0) return null;
                      return (
                        <div key={idx} className="text-[11px] font-bold flex flex-wrap gap-x-2">
                          <span className="text-slate-900 uppercase tracking-tight">{cat.category}:</span>
                          <span className="text-slate-500 font-medium">{validItems.join(" • ")}</span>
                        </div>
                      );
                    })}

                    {languages.length > 0 && languages[0] !== "" && (
                      <div className="text-[11px] font-bold flex flex-wrap gap-x-2 border-t pt-2 border-slate-100">
                        <span className="text-slate-900">{isAr ? "اللغات المكتسبة:" : "Authorized Languages:"}</span>
                        <span className="text-slate-500 font-medium">{languages.join(" • ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div
                className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[8px] uppercase tracking-widest text-slate-300 font-black border-t pt-2"
                style={{ borderTopColor: `${accentColor}10` }}
              >
                <span>Nakla AI Resume Builder</span>
                <span>ATS Formatted</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
