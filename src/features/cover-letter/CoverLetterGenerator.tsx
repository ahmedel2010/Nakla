import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  RefreshCw,
  ClipboardCheck,
  Check,
  AlertTriangle,
  Upload,
  Type,
  Globe
} from "lucide-react";
import { translations } from "../../shared/lib/translations";
import { FileUploader } from "../../shared/components/FileUploader";
import { FileData } from "../../shared/lib/types";

interface CoverLetterGeneratorProps {
  onActionStart: (callback: () => void) => void;
  lang?: "ar" | "en";
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ onActionStart, lang = "ar" }) => {
  const t = translations[lang];
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "pdf">("pdf");
  const [targetLanguage, setTargetLanguage] = useState<string>(lang === "ar" ? "Arabic" : "English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError(t.coverErrorRequired);
      return;
    }

    if (inputMode === "text" && !cvText.trim()) {
      setError(t.coverErrorRequired);
      return;
    }

    if (inputMode === "pdf" && !cvFile) {
      setError(t.coverErrorRequired);
      return;
    }

    onActionStart(async () => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/generate-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription: jobDescription.trim(),
            cvText: inputMode === "text" ? cvText.trim() : undefined,
            cvFile: inputMode === "pdf" ? {
              name: cvFile?.name,
              mimeType: cvFile?.mimeType,
              data: cvFile?.base64
            } : undefined,
            lang: lang,
            targetLang: targetLanguage
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || (lang === "ar" ? "فشل الخادم في توليد الرسالة." : "Server failed to generate cover letter."));
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned an invalid response.");
        }
        const data = await response.json();
        setResult(data.coverLetter);
      } catch (err: any) {
        console.error(err);
        setError(err.message || (lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم." : "An error occurred while connecting to server."));
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="premium-card p-8 sm:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
           <div className="space-y-2">
            <h2 className="text-3xl font-display font-black text-brand dark:text-white tracking-tightest leading-none">
              {t.coverTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {t.coverSubtitle}
            </p>
          </div>
          <div className="flex bg-slate-50 dark:bg-slate-950/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
             <button onClick={() => setInputMode("pdf")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "pdf" ? "bg-white dark:bg-slate-900 text-brand dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" : "text-slate-400 hover:text-brand dark:hover:text-white"}`}>
                <Upload size={14} className="inline-block mb-0.5 ml-2" /> PDF
             </button>
             <button onClick={() => setInputMode("text")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "text" ? "bg-white dark:bg-slate-900 text-brand dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" : "text-slate-400 hover:text-brand dark:hover:text-white"}`}>
                <Type size={14} className="inline-block mb-0.5 ml-2" /> {lang === "ar" ? "نص" : "Text"}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t.coverJobDescLabel}</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.coverJobDescPlaceholder}
              className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-950/30 border-2 border-transparent focus:border-brand/10 dark:focus:border-white/10 rounded-[2rem] text-brand dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner text-sm"
            />
          </div>

          <div className="space-y-6">
            {inputMode === "pdf" ? (
              <div className="space-y-4 h-full flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{t.coverOptionPdf}</label>
                <div className="flex-1">
                   <FileUploader onFileLoaded={setCvFile} selectedFile={cvFile} lang={lang} accept=".pdf,.txt,.docx" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t.coverCvLabel}</label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={t.coverCvPlaceholder}
                  className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-950/30 border-2 border-transparent focus:border-brand/10 dark:focus:border-white/10 rounded-[2rem] text-brand dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 dark:border-slate-800/80 pt-8 max-w-xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Globe size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === "ar" ? "اختر لغة خطاب التقديم" : "Select Cover Letter Language"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {[
              { value: "Arabic", name: lang === "ar" ? "العربية" : "Arabic" },
              { value: "English", name: lang === "ar" ? "الإنجليزية" : "English" },
              { value: "French", name: lang === "ar" ? "الفرنسية" : "French" },
              { value: "German", name: lang === "ar" ? "الألمانية" : "German" },
              { value: "Spanish", name: lang === "ar" ? "الإسبانية" : "Spanish" }
            ].map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setTargetLanguage(l.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  targetLanguage === l.value
                    ? "bg-brand dark:bg-white text-white dark:text-slate-900 border-brand dark:border-white shadow-sm font-black scale-[1.03]"
                    : "bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 border-slate-150/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription.trim() || (inputMode === "text" ? !cvText.trim() : !cvFile)}
            className="premium-button-primary px-12 py-5 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:scale-100 disabled:active:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>{t.coverSubmitBtnLoading}</span>
              </>
            ) : (
              <span>{t.coverSubmitBtn}</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
          <AlertTriangle className="flex-shrink-0" size={20} />
          <p className={`${lang === "ar" ? "text-right" : "text-left"} font-medium`}>{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-150 dark:border-slate-800 p-6 sm:p-8 glass animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white tracking-tight">
              {t.coverResultTitle}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title={t.coverCopyBtn}
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <ClipboardCheck size={18} />}
              </button>
            </div>
          </div>

          <div
            className={`whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 font-sans ${targetLanguage === "Arabic" ? "text-right" : "text-left"}`}
            dir={targetLanguage === "Arabic" ? "rtl" : "ltr"}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
