import React, { useState, useRef } from "react";
import { Upload, FileText, Trash2, X } from "lucide-react";
import { fileToBase64, formatBytes } from "../lib/utils";
import { FileData } from "../lib/types";

interface FileUploaderProps {
  onFileLoaded: (fileData: FileData | null) => void;
  selectedFile: FileData | null;
  label?: string;
  accept?: string;
  lang?: "ar" | "en";
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoaded,
  selectedFile,
  label,
  accept = ".pdf,.txt,image/*",
  lang = "ar"
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultLabel = label
    ? label
    : lang === "ar"
      ? "ارفع ملف الـ CV الخاص بك (PDF, TXT, أو صورة)"
      : "Upload your CV file (PDF, TXT, or Image)";

  const processFile = async (file: File) => {
    setError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        setError(lang === "ar" ? "حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت." : "File is too large. Maximum size is 10MB.");
        return;
      }

      const base64 = await fileToBase64(file);
      onFileLoaded({
        name: file.name,
        base64,
        mimeType: file.type || "application/octet-stream",
        size: file.size
      });
    } catch (err) {
      console.error(err);
      setError(lang === "ar" ? "حدث خطأ أثناء معالجة الملف. يرجى المحاولة مرة أخرى." : "An error occurred while processing the file. Please try again.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.value && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileLoaded(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className={`block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>
        {defaultLabel}
      </label>

      {selectedFile ? (
        <div id="file-uploader-selected" className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-xl transition duration-250 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-3 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
            <div className="bg-indigo-100 dark:bg-indigo-950 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText size={24} />
            </div>
            <div className={`${lang === "ar" ? "text-right" : "text-left"} font-sans`}>
              <p className="font-semibold text-slate-800 dark:text-slate-100 max-w-xs sm:max-w-md truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            id="clear-file-btn"
            onClick={clearFile}
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            title={lang === "ar" ? "حذف الملف" : "Delete File"}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <div
          id="dropzone-container"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition text-center ${
            isDragActive
              ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-full text-slate-600 dark:text-slate-350 mb-3 group-hover:scale-105 transition">
            <Upload size={28} className="text-slate-500 dark:text-indigo-400" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 text-sm sm:text-base">
            {lang === "ar" ? "اسحب وأسقط ملف الـ CV هنا أو انقر للتصفح" : "Drag and drop your CV here or click to browse"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
            {lang === "ar"
              ? "الملفات المدعومة: PDF, TXT والملفات الصورية حتى 10 ميجابايت"
              : "Supported formats: PDF, TXT and image files up to 10MB"}
          </p>
        </div>
      )}

      {error && (
        <p className={`text-xs text-rose-500 mt-2 font-medium ${lang === "ar" ? "text-right" : "text-left"}`}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
