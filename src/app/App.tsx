import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";

import { BannerSlider } from "../shared/components/BannerSlider";
import { BarChart3, Edit3, MessageSquareText, FileText, User, LogOut, Sun, Moon, Languages, Lock, Target, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../shared/lib/translations";
import professionalBg from "../assets/images/professional_abstract_background_1780616998517.png";

const AuthScreen = React.lazy(() => import("../features/auth/AuthScreen").then(module => ({ default: module.AuthScreen })));
const CVAuditor = React.lazy(() => import("../features/cv-auditor/CVAuditor").then(module => ({ default: module.CVAuditor })));
const CVTailor = React.lazy(() => import("../features/cv-tailor/CVTailor").then(module => ({ default: module.CVTailor })));
const CVTranslator = React.lazy(() => import("../features/cv-translator/CVTranslator").then(module => ({ default: module.CVTranslator })));
const InterviewPrep = React.lazy(() => import("../features/interview-prep/InterviewPrep").then(module => ({ default: module.InterviewPrep })));
const CoverLetterGenerator = React.lazy(() => import("../features/cover-letter/CoverLetterGenerator").then(module => ({ default: module.CoverLetterGenerator })));
const UserProfile = React.lazy(() => import("../features/profile/UserProfile").then(module => ({ default: module.UserProfile })));
const SkillsGapAnalysis = React.lazy(() => import("../features/skills-gap/SkillsGapAnalysis").then(module => ({ default: module.SkillsGapAnalysis })));
const Support = React.lazy(() => import("../features/support/Support").then(module => ({ default: module.Support })));

type TabType = "evaluate" | "tailor" | "translate" | "interview" | "cover-letter" | "skills-gap" | "profile" | "support";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("evaluate");
  const [preLoginAlert, setPreLoginAlert] = useState<string | null>(null);

  useEffect(() => {
    if (preLoginAlert) {
      const timer = setTimeout(() => {
        setPreLoginAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [preLoginAlert]);
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "ar" || saved === "en") return saved;
    return "ar";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => translations[lang], [lang]);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [user, setUser] = useState<{ name: string; email: string; role: string; photo?: string } | null>(() => {
    const saved = localStorage.getItem("cv_eval_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleActionAttempt = useCallback((callback: () => void) => {
    callback();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cv_eval_current_user");
    setUser(null);
  };

  // Handle OAuth redirect fallback (when popup opener is not available)
  useEffect(() => {
    const pendingUser = sessionStorage.getItem("oauth_pending_user");
    if (pendingUser) {
      try {
        const userInfo = JSON.parse(pendingUser);
        sessionStorage.removeItem("oauth_pending_user");
        if (userInfo && userInfo.email) {
          const usersJson = localStorage.getItem("cv_eval_users") || "[]";
          const users = JSON.parse(usersJson);
          const cleanEmail = userInfo.email.trim().toLowerCase();
          let foundUser = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
          if (!foundUser) {
            foundUser = {
              name: userInfo.name || cleanEmail.split("@")[0],
              email: cleanEmail,
              password: "social_signup_auth",
              role: "Software Developer"
            };
            users.push(foundUser);
            localStorage.setItem("cv_eval_users", JSON.stringify(users));
          }
          const userData = {
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role || "Software Developer",
            photo: userInfo.picture || foundUser.photo || ""
          };
          localStorage.setItem("cv_eval_current_user", JSON.stringify(userData));
          setUser(userData);
        }
      } catch (e) {
        sessionStorage.removeItem("oauth_pending_user");
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased relative overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>

        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <img
            src={professionalBg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-[0.08] dark:opacity-[0.14] mix-blend-luminosity select-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#f8fafc] dark:to-slate-950/80 pointer-events-none" />
        </div>

        <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none shrink-0 mb-8" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="w-full max-w-[96%] xl:max-w-[92%] 2xl:max-w-[1720px] mx-auto h-16 bg-white/75 dark:bg-[#090915]/80 backdrop-blur-xl border border-slate-200/40 dark:border-white/5 rounded-2xl flex items-center justify-between px-4 sm:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.55)] pointer-events-auto transition-all duration-300">

            <div
              className="flex items-center gap-3 cursor-pointer group pointer-events-auto shrink-0 transition-transform duration-350 active:scale-95"
              onClick={() => setPreLoginAlert(lang === "ar" ? "أهلاً بك! يرجى تسجيل الدخول أو إنشاء حساب مجاني للبدء." : "Welcome! Please log in or sign up for free to get started.")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/15 rounded-xl blur-md opacity-35 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                <div className="relative w-9 h-9 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center font-black text-md shadow-[0_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.05)] border border-transparent dark:border-white/10 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 shrink-0">
                  N
                </div>
              </div>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 transition-colors hidden sm:block" />

              <div className={`flex flex-col justify-center select-none ${lang === "ar" ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-1.5 leading-none">
                  <h1 className="text-lg font-black font-display text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {lang === "ar" ? "نُقلة" : "Nakla"}
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" title="Offline pre-login" />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wide mt-1 whitespace-nowrap hidden xs:block">
                  {lang === "ar" ? "من CV عادي لفرصة حقيقية" : "From standard CV to career breakthrough"}
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-full border border-slate-200/30 dark:border-white/5">
              {[
                { id: "evaluate", label: t.tabEvaluate, icon: <BarChart3 size={13} /> },
                { id: "tailor", label: t.tabTailor, icon: <Edit3 size={13} /> },
                { id: "translate", label: t.tabTranslateCv, icon: <Languages size={13} /> },
                { id: "cover-letter", label: t.tabCoverLetter, icon: <FileText size={13} /> },
                { id: "interview", label: t.tabInterview, icon: <MessageSquareText size={13} /> }
              ].map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => setPreLoginAlert(lang === "ar" ? `يرجى تسجيل الدخول أو إنشاء حساب للانتقال إلى قسم (${item.label})` : `Please log in or sign up to access the ${item.label} section`)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-all duration-200"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">

              <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-full border border-slate-200/30 dark:border-white/5">
                <button
                  onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white uppercase transition-all duration-200 px-2.5 py-1 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs"
                  title={lang === "ar" ? "Switch to English" : "تغيير للعربية"}
                >
                  {lang === "ar" ? "EN" : "عربي"}
                </button>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all duration-200 p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs"
                  title={theme === "dark" ? t.switchThemeLight : t.switchThemeDark}
                >
                  {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                </button>
              </div>

              <button
                onClick={() => setPreLoginAlert(lang === "ar" ? "يرجى تسجيل الدخول للوصول إلى لوحة التحكم الشخصية الخاصة بك." : "Please log in to access your personal workspace dashboard.")}
                className="flex items-center gap-2 p-1 pr-3 pl-1 sm:px-2 rounded-full border border-slate-200/40 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/20 bg-transparent transition-all group pointer-events-auto"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] border border-slate-200 dark:border-slate-700 font-bold">
                  <User size={12} />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-none group-hover:text-blue-500 transition-colors hidden sm:inline">
                  {lang === "ar" ? "دخول" : "Login"}
                </span>
              </button>

            </div>
          </div>
        </header>

        <AnimatePresence>
          {preLoginAlert && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none"
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 pointer-events-auto">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 relative">
                    <div className="absolute inset-0 rounded-xl bg-blue-600/20 dark:bg-blue-500/20 animate-pulse" />
                    <Lock size={16} className="relative z-10" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold select-none leading-relaxed text-slate-800 dark:text-slate-200">
                    {preLoginAlert}
                  </div>
                </div>
                <button
                  onClick={() => setPreLoginAlert(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/20 via-transparent to-transparent dark:from-indigo-950/10 z-10">
          <div className="relative z-10 w-full max-w-md lg:max-w-7xl xl:max-w-screen-xl 2xl:max-w-[1720px]">
            <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
              <AuthScreen lang={lang} onSuccess={(userData) => {
                localStorage.setItem("cv_eval_current_user", JSON.stringify(userData));
                setUser(userData);
              }} />
            </Suspense>
          </div>
        </main>
      </div>
    );
  }



  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f4f7fa] dark:bg-[#020205] text-slate-900 dark:text-slate-100 font-sans antialiased relative overflow-x-hidden transition-colors duration-500" dir={lang === "ar" ? "rtl" : "ltr"}>

      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', transform: 'translateZ(0)' }} />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', transform: 'translateZ(0)' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)', transform: 'translateZ(0)' }} />

      <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none shrink-0 mb-8" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="w-full max-w-[96%] xl:max-w-[92%] 2xl:max-w-[1720px] mx-auto h-16 bg-white/75 dark:bg-[#090915]/80 backdrop-blur-xl border border-slate-200/40 dark:border-white/5 rounded-2xl flex items-center justify-between px-4 sm:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.55)] pointer-events-auto transition-all duration-300">

          <div
            className="flex items-center gap-3 cursor-pointer group pointer-events-auto shrink-0 transition-transform duration-350 active:scale-95"
            onClick={() => setActiveTab("evaluate")}
          >
            <div className="relative">

              <div className="absolute inset-0 bg-blue-600/15 rounded-xl blur-md opacity-35 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
              <div className="relative w-9 h-9 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center font-black text-md shadow-[0_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.05)] border border-transparent dark:border-white/10 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 shrink-0">
                N
              </div>
            </div>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 transition-colors hidden sm:block" />

            <div className={`flex flex-col justify-center select-none ${lang === "ar" ? "text-right" : "text-left"}`}>
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-lg font-black font-display text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {lang === "ar" ? "نُقلة" : "Nakla"}
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wide mt-1 whitespace-nowrap hidden xs:block">
                {lang === "ar" ? "من CV عادي لفرصة حقيقية" : "From standard CV to career breakthrough"}
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-full border border-slate-200/30 dark:border-white/5">
            {[
              { id: "evaluate", label: t.tabEvaluate, icon: <BarChart3 size={13} /> },
              { id: "tailor", label: t.tabTailor, icon: <Edit3 size={13} /> },
              { id: "skills-gap", label: lang === "ar" ? "مالذي ينقصني؟" : "What's Missing?", icon: <Target size={13} /> },
              { id: "translate", label: t.tabTranslateCv, icon: <Languages size={13} /> },
              { id: "cover-letter", label: t.tabCoverLetter, icon: <FileText size={13} /> },
              { id: "interview", label: t.tabInterview, icon: <MessageSquareText size={13} /> }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 relative ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm scale-102"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">

            <div className="flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-full border border-slate-200/30 dark:border-white/5">
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white uppercase transition-all duration-200 px-2.5 py-1 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs"
                title={lang === "ar" ? "Switch to English" : "تغيير للعربية"}
              >
                {lang === "ar" ? "EN" : "عربي"}
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all duration-200 p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs"
                title={theme === "dark" ? t.switchThemeLight : t.switchThemeDark}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 p-1 pr-3 pl-1 sm:px-2 rounded-full border transition-all duration-305 group ${
                activeTab === "profile"
                  ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-400/5"
                  : "border-slate-200/40 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/20 bg-transparent"
              }`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200/80 dark:border-white/10 group-hover:border-blue-500/50 transition-all duration-300 shrink-0">
                {user.photo && !user.photo.startsWith("bg-") ? (
                  <img src={user.photo} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-blue-950 flex items-center justify-center text-blue-300 text-[10px] font-black italic">{user.name.substring(0, 1)}</div>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-right h-full justify-center">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              title={t.logout}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/5 hover:bg-rose-600 text-rose-500 hover:text-white dark:bg-rose-500/5 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200/10 dark:border-rose-500/15 active:scale-95 transition-all duration-300 shrink-0 shadow-xs hover:shadow-sm"
            >
              <LogOut size={13} className="shrink-0" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:hidden w-full max-w-7xl mx-auto mb-6 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "evaluate", label: t.tabEvaluate, icon: <BarChart3 size={15} /> },
            { id: "tailor", label: t.tabTailor, icon: <Edit3 size={15} /> },
            { id: "skills-gap", label: lang === "ar" ? "مالذي ينقصني؟" : "Skills Gap", icon: <Target size={15} /> },
            { id: "translate", label: t.tabTranslateCv, icon: <Languages size={15} /> },
            { id: "cover-letter", label: t.tabCoverLetter, icon: <FileText size={15} /> },
            { id: "interview", label: t.tabInterview, icon: <MessageSquareText size={15} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 shrink-0 ${
                activeTab === item.id
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md"
                  : "bg-white/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 lg:px-16 relative z-10">

        <AnimatePresence mode="popLayout">
          {activeTab === "evaluate" && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 36 }}
              exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden w-full max-w-8xl lg:max-w-screen-2xl mx-auto transition-all duration-300"
            >
              <BannerSlider
                lang={lang}
                onCtaClick={(id) => {
                  if (id === 1) {
                    const el = document.getElementById("cv-text-input") || document.getElementById("start-evaluate-btn");
                    el?.scrollIntoView({ behavior: "smooth" });
                  } else if (id === 2) {
                    setActiveTab("interview");
                  } else if (id === 3) {
                    setActiveTab("cover-letter");
                  } else if (id === 4) {
                    setActiveTab("tailor");
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-[96%] xl:max-w-[92%] 2xl:max-w-[1720px] mx-auto">

          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-10">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {activeTab === "evaluate" ? t.tabEvaluate :
                 activeTab === "tailor" ? t.tabTailor :
                 activeTab === "translate" ? t.translateTitle :
                 activeTab === "interview" ? t.tabInterview :
                 activeTab === "profile" ? t.profileTitle :
                 activeTab === "support" ? t.supportTitle :
                 activeTab === "skills-gap" ? t.skillsGapTitle :
                 activeTab === "career-roadmap" ? (lang === "ar" ? "خارطة الطريق المهنية" : "Career Roadmap") :
                 activeTab === "salary-negotiator" ? (lang === "ar" ? "مساعد التفاوض المالي" : "Salary Negotiation") :
                 t.tabCoverLetter}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
                {activeTab === "evaluate" ? t.auditSubtitle :
                 activeTab === "tailor" ? t.tailorSubtitle :
                 activeTab === "translate" ? t.translateSubtitle :
                 activeTab === "interview" ? t.prepSubtitle :
                 activeTab === "profile" ? t.profileSubtitle :
                 activeTab === "support" ? t.supportSubtitle :
                 activeTab === "skills-gap" ? t.skillsGapSubtitle :
                 activeTab === "career-roadmap" ? (lang === "ar" ? "ارسم مسار نجاحك للعشر سنوات القادمة." : "Map out your next 10 years of professional success.") :
                 activeTab === "salary-negotiator" ? (lang === "ar" ? "احصل على أفضل عرض مالي ممكن بذكاء." : "Get the best compensation package with AI strategies.") :
                 t.coverSubtitle}
              </p>
            </div>

            {false && activeTab !== "profile" && activeTab !== "support" && (
              <div className="hidden sm:flex items-center gap-3">
                 <div className="bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/10 p-4 rounded-xl shadow-sm min-w-[140px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">1,240</p>
                 </div>
                 <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-600/20 min-w-[140px]">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">System Health</p>
                    <p className="text-2xl font-black text-white">99.8%</p>
                 </div>
              </div>
            )}
          </div>

          <div className="relative z-10 transition-all">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-white/70 dark:bg-slate-950/40 backdrop-blur-md border border-slate-200/55 dark:border-white/10 rounded-3xl p-6 sm:p-8 lg:p-14 shadow-lg text-slate-900 dark:text-white"
              >
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">جاري التحميل...</p>
                  </div>
                }>
                  {activeTab === "evaluate" && <CVAuditor lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "tailor" && <CVTailor lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "skills-gap" && <SkillsGapAnalysis lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "translate" && <CVTranslator lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "interview" && <InterviewPrep lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "cover-letter" && <CoverLetterGenerator lang={lang} onActionStart={handleActionAttempt} />}
                  {activeTab === "profile" && (
                    <UserProfile
                      user={user}
                      lang={lang}
                      onUpdate={(updatedData) => {
                        setUser(updatedData);
                        localStorage.setItem("cv_eval_current_user", JSON.stringify(updatedData));
                      }}
                    />
                  )}
                  {activeTab === "support" && <Support lang={lang} />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200/65 dark:border-white/10 bg-white/50 dark:bg-slate-950/30 backdrop-blur-3xl px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 font-sans">
         <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-950 font-black shadow-md">N</div>
            <div className="flex flex-col">
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                {t.title}
              </p>
            </div>
         </div>
         <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab("support")}
              className="text-[10px] font-extrabold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-wider transition-colors duration-200"
            >
              {t.tabSupport}
            </button>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-300 dark:bg-rose-900/40" />
            <button
              onClick={handleLogout}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 uppercase tracking-wider transition-colors duration-200 flex items-center gap-1"
            >
              <LogOut size={11} />
              <span>{t.logout}</span>
            </button>
         </div>
      </footer>
    </div>
  );
}
