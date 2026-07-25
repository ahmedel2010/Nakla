import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, BookOpen, GraduationCap, ChevronRight, CheckCircle2, AlertCircle, Upload, FileText, X, Lock } from "lucide-react";

interface Resource {
  name: string;
  provider: string;
  url: string;
  type: "course" | "certification" | "tutorial";
}

interface SkillGap {
  skill: string;
  importance: "high" | "medium";
  description: string;
  resources: Resource[];
}

interface SkillsGapAnalysisProps {
  lang: "ar" | "en";
  onActionStart: (callback: () => void) => void;
}

export const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({ lang, onActionStart }) => {
  const isAr = lang === "ar";
  const [jd, setJd] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SkillGap[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setError(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;

        const base64Content = base64String.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAnalysis = async () => {
    if (!uploadedFile || !jd.trim()) return;

    onActionStart(async () => {
      setAnalyzing(true);
      setError(null);
      setResult(null);

      try {
        const base64Data = await fileToBase64(uploadedFile);

        const response = await fetch("/api/analyze-skills-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvFile: {
              data: base64Data,
              mimeType: uploadedFile.type
            },
            jobDescription: jd.trim(),
            lang: lang
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to analyze skills gap");
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        console.error("Analysis failed:", err);
        setError(err.message || (isAr ? "فشل التحليل، يرجى المحاولة مرة أخرى." : "Analysis failed, please try again."));
      } finally {
        setAnalyzing(false);
      }
    });
  };

  return (
    <div className="space-y-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {isAr ? "سيرتك الذاتية (ملف PDF)" : "Your Resume (PDF Only)"}
            </label>
            <span className="text-[10px] font-medium text-slate-400 italic">
              {isAr ? "يجب أن يكون الملف بصيغة PDF" : "File must be in PDF format"}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />

          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-400 transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{isAr ? "اضغط لرفع الـ CV" : "Click to upload CV"}</p>
                <p className="text-[10px] text-slate-400 mt-1">{isAr ? "أو اسحب الملف وأفلته هنا" : "or drag and drop file here"}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="absolute top-4 right-4">
                 <button
                  onClick={removeFile}
                  className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all"
                 >
                   <X size={18} />
                 </button>
               </div>
               <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-indigo-500 mb-4">
                 <FileText size={32} />
               </div>
               <p className="text-sm font-bold text-slate-900 dark:text-white text-center line-clamp-1 max-w-[80%]">{uploadedFile.name}</p>
               <p className="text-[10px] text-slate-400 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {isAr ? "الوصف الوظيفي (Job Description)" : "Job Description"}
            </label>
            <span className="text-[10px] font-medium text-slate-400 italic">
              {isAr ? "انسخ تفاصيل الوظيفة" : "Paste job details"}
            </span>
          </div>

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder={isAr ? "مثال: مهارات القيادة، التعامل مع العملاء، خبرة في البرمجة..." : "e.g., Leadership, client relations, programming experience..."}
            className="w-full h-48 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all font-medium text-sm leading-relaxed shadow-sm resize-none"
          />
        </div>

        <div className="col-span-full">
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-500 text-sm font-medium flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          <button
            onClick={handleAnalysis}
            disabled={analyzing || !jd.trim() || !uploadedFile}
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-sm font-bold flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale transition-all duration-300"
          >
            {analyzing ? (
              <span className="border-2 border-current border-t-transparent rounded-full w-5 h-5 animate-spin" />
            ) : (
              <>
                <Target size={18} />
                <span>{isAr ? "تحليل الفجوات المعرفية والمهارية" : "Analyze Skills & Knowledge Gaps"}</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-12 space-y-10 pt-12 border-t border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-slate-900 dark:text-white">{isAr ? "النتائج والمسارات المقترحة" : "Analysis Outcomes & Recommended Paths"}</h3>
                  <p className="text-xs text-slate-400 font-medium">{isAr ? "تم تحديد 3 فجوات جوهرية تفصلك عن فرصتك القادمة" : "Identified 3 core gaps separating you from your next role"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {result.map((item, idx) => (
                   <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 rounded-[36px] bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-col h-full group hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none transition-all duration-500"
                   >
                     <div className="flex items-start justify-between mb-6">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.importance === 'high' ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/10 text-blue-500'}`}>
                          {isAr ? (item.importance === 'high' ? 'أولوية قصوى' : 'تطوير مفضل') : item.importance}
                        </div>
                        <AlertCircle size={16} className="text-slate-200 dark:text-white/10" />
                     </div>

                     <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                       {item.skill}
                     </h4>

                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-8 flex-grow">
                        {item.description}
                     </p>

                     <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-white/5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <BookOpen size={12} />
                          {isAr ? "مصادر مقترحة للإتقان" : "Recommended Resources"}
                        </p>

                        {item.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all group/res"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                <GraduationCap size={12} className="text-indigo-500" />
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{res.name}</p>
                                <p className="text-[9px] text-slate-400">{res.provider}</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover/res:translate-x-1 lg:group-hover/res:translate-x-2 transition-transform" />
                          </a>
                        ))}
                     </div>
                   </motion.div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
