import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, UserPlus, Mail, Lock, User, Briefcase, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ShieldCheck, Clock, ArrowRight, KeyRound, ExternalLink, Zap, Target, LineChart } from "lucide-react";
import { translations } from "../../shared/lib/translations";
import professionalBg from "../assets/images/professional_abstract_background_1780616998517.png";

interface AuthScreenProps {
  onSuccess: (userData: { name: string; email: string; role: string; photo?: string }) => void;
  lang?: "ar" | "en";
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, lang = "ar" }) => {
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const testimonials = useMemo(() => [
    {
      id: 1,
      initals: "MA",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
      name: { ar: "محمود أحمد", en: "Mahmoud Ahmed" },
      role: { ar: "مدير مشاريع", en: "Project Manager" },
      text: {
        ar: "“نُقلة ساعدتني في إعادة صياغة سيرتي الذاتية بشكل احترافي. حصلت على 3 مقابلات عمل في أول أسبوع من استخدام المنصة!”",
        en: "“Nakla helped me rewrite my CV professionally. I landed 3 job interviews in the first week of using the platform!”"
      }
    },
    {
      id: 2,
      initals: "SH",
      color: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      name: { ar: "سارة حسن", en: "Sarah Hassan" },
      role: { ar: "مصممة واجهات", en: "UI/UX Designer" },
      text: {
        ar: "“خطاب التقديم المخصص لكل وظيفة هو ميزة خرافية. يوفر الكثير من الوقت والمجهود ويزيد من نسبة القبول.”",
        en: "“The tailored cover letter feature is incredible. It saves so much time and effort and significantly increases acceptance rates.”"
      }
    },
    {
      id: 3,
      initals: "OS",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      name: { ar: "عمر سالم", en: "Omar Salem" },
      role: { ar: "مطور برمجيات", en: "Software Developer" },
      text: {
        ar: "“بفضل التدقيق والتحليل من نُقلة، قدرت أكتشف فجوات كبيرة في سيرتي وأعالجها. أداة لا غنى عنها!”",
        en: "“Thanks to Nakla's analysis, I discovered major gaps in my CV and fixed them. An indispensable tool!”"
      }
    },
    {
      id: 4,
      initals: "NK",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
      name: { ar: "نور كمال", en: "Nour Kamal" },
      role: { ar: "مسؤولة مبيعات", en: "Sales Executive" },
      text: {
        ar: "“الواجهة بسيطة وسهلة، والنتائج مدهشة. ترجمة سيرتي للإنجليزية كانت دقيقة واحترافية جداً.”",
        en: "“The interface is simple, and the results are amazing. Translating my CV to English was highly accurate.”"
      }
    }
  ], []);

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length]);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "verification" | "reset" | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleRealGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(window.location.origin)}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "missing_credentials") {
          setShowConfigModal(true);
          return;
        }
        throw new Error(data.message || (lang === "ar" ? "فشل الاتصال بخدمة Google Auth." : "Failed to connect to Google Auth service."));
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      console.log("[Google OAuth] Opening auth URL popup...", data.url);
      const authWindow = window.open(
        data.url,
        "google_oauth_popup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      if (!authWindow) {
        throw new Error(lang === "ar"
          ? "تم حظر النافذة المنبثقة! يرجى السماح بالنوافذ المنبثقة في متصفحك لإتمام تسجيل الدخول بحساب جوجل."
          : "Popup was blocked! Please enable popups for this website in your browser settings."
        );
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;

      const allowedOrigins = [
        window.location.origin,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
      ];
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".run.app") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app");

      if (!isAllowed) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const userInfo = event.data.user;
        if (userInfo && userInfo.email) {
          setLoading(true);
          try {
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

            onSuccess({
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.role || "Software Developer",
              photo: foundUser.photo
            });
          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [lang, onSuccess]);

  useEffect(() => {
    const existingUsers = localStorage.getItem("cv_eval_users");
    if (!existingUsers) {
      const defaultUsers = [
        {
          name: "أحمد محمد",
          email: "ahmed@example.com",
          password: "password123",
          role: "Software Developer"
        },
        {
          name: "سارة عبد الله",
          email: "sara@example.com",
          password: "password123",
          role: "HR Specialist"
        }
      ];
      localStorage.setItem("cv_eval_users", JSON.stringify(defaultUsers));
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const sendCode = async (targetEmail: string) => {
    try {
      const response = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل إرسال كود التحقق الأمني.");
      }
      setTimeLeft(60);
      return true;
    } catch (err: any) {
      setError(err.message || "فشلت عملية إرسال الرمز إلى بريدك الإلكتروني.");
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const usersJson = localStorage.getItem("cv_eval_users") || "[]";
      const users = JSON.parse(usersJson);

      if (isLogin) {

        if (!email || !password) {
          throw new Error("الرجاء ملء جميع الحقول المطلوبة.");
        }

        const foundUser = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!foundUser) {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.");
        }

        onSuccess({
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || "باحث عن عمل",
          photo: foundUser.photo
        });
      } else {

        if (!name || !email || !password || !confirmPassword) {
          throw new Error("يرجى تعبئة كافة البيانات الأساسية.");
        }

        if (password.length < 6) {
          throw new Error("يجب أن تتكون كلمة المرور من 6 خانات كحد أدنى.");
        }

        if (password !== confirmPassword) {
          throw new Error("تأكيد كلمة المرور لا يطابق كلمة المرور التي أدخلتها.");
        }

        const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          throw new Error("هذا البريد الإلكتروني مسجّل بالفعل في المنصة!");
        }

        const sent = await sendCode(email);
        if (sent) {
          setIsVerifying(true);
          setSuccess("تم إرسال كود تأكيد الهوية للبريد المسجل بنجاح!");
        }
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyLoading(true);

    try {
      if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
        throw new Error("رمز التحقق يجب أن يتكون من 6 أرقام رقمية صحيحة.");
      }

      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: verificationCode })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "رمز التحقق الذي أدخلته غير مطابق.");
      }

      const usersJson = localStorage.getItem("cv_eval_users") || "[]";
      const users = JSON.parse(usersJson);

      if (isLogin) {
        const foundUser = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!foundUser) {
          throw new Error("حدث خطأ طارئ؛ لم نجد تفاصيل الحساب الخاص بك.");
        }
        setSuccess(`أهلاً بك! تم التحقق بنجاح ومطابقة الرمز. جاري الدخول...`);
        setTimeout(() => {
          onSuccess({
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role || "باحث عن عمل",
            photo: foundUser.photo
          });
        }, 1200);
      } else {
        const newUser = { name, email, password, role, photo: "" };
        users.push(newUser);
        localStorage.setItem("cv_eval_users", JSON.stringify(users));
        setSuccess("تهانينا! تم التحقق بنجاح من بريدك الإلكتروني وتفعيل الحساب.");
        setTimeout(() => {
          onSuccess({ name, email, role, photo: "" });
        }, 1400);
      }

    } catch (err: any) {
      setVerifyError(err.message || "فشلت عملية التحقق، يرجى إعادة المحاولة.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!email) {
        throw new Error("يرجى إدخال البريد الإلكتروني الخاص بك.");
      }

      const usersJson = localStorage.getItem("cv_eval_users") || "[]";
      const users = JSON.parse(usersJson);
      const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!userExists) {
        throw new Error("البريد الإلكتروني المدخل غير مسجل لدينا في المنصة.");
      }

      const sent = await sendCode(email);
      if (sent) {
        setForgotPasswordStep("verification");
        setSuccess("تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyLoading(true);

    try {
      if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
        throw new Error("رمز التحقق يجب أن يتكون من 6 أرقام.");
      }

      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: verificationCode })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "رمز التحقق الذي أدخلته غير مطابق.");
      }

      setSuccess("تم التحقق من الرمز بنجاح! يرجى تعيين كلمة المرور الجديدة الآن.");
      setForgotPasswordStep("reset");
      setVerificationCode("");
    } catch (err: any) {
      setVerifyError(err.message || "فشلت عملية التحقق، يرجى إعادة المحاولة.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!newPassword || !confirmNewPassword) {
        throw new Error("يرجى ملء جميع الحقول المطلوبة.");
      }

      if (newPassword.length < 6) {
        throw new Error("كلمة المرور يجب أن تتكون من 6 خانات كحد أدنى.");
      }

      if (newPassword !== confirmNewPassword) {
        throw new Error("تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.");
      }

      const usersJson = localStorage.getItem("cv_eval_users") || "[]";
      const users = JSON.parse(usersJson);
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex === -1) {
        throw new Error("لم نتمكن من العثور على حسابك لتعديل كلمة المرور.");
      }

      users[userIndex].password = newPassword;
      localStorage.setItem("cv_eval_users", JSON.stringify(users));

      setSuccess("تم تحديث كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...");
      setTimeout(() => {
        setForgotPasswordStep(null);
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تعديل كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { text: lang === "ar" ? "فارغة" : "empty", color: "bg-slate-250", width: "w-0" };
    if (password.length < 4) return { text: lang === "ar" ? "ضعيفة جداً" : "Very Weak", color: "bg-rose-500", width: "w-1/4" };
    if (password.length < 7) return { text: lang === "ar" ? "متوسطة" : "Medium", color: "bg-amber-500", width: "w-2/4" };
    return { text: lang === "ar" ? "قوية وآمنة" : "Strong & Secure", color: "bg-emerald-500", width: "w-full" };
  };

  const getNewPasswordStrength = () => {
    if (!newPassword) return { text: lang === "ar" ? "فارغة" : "empty", color: "bg-slate-250", width: "w-0" };
    if (newPassword.length < 4) return { text: lang === "ar" ? "ضعيفة جداً" : "Very Weak", color: "bg-rose-500", width: "w-1/4" };
    if (newPassword.length < 7) return { text: lang === "ar" ? "متوسطة" : "Medium", color: "bg-amber-500", width: "w-2/4" };
    return { text: lang === "ar" ? "قوية وآمنة" : "Strong & Secure", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength();
  const newStrength = getNewPasswordStrength();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#fbfbfd] dark:bg-[#000000] selection:bg-indigo-100/30" dir={lang === "ar" ? "rtl" : "ltr"}>

        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)', transform: 'translateZ(0)' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)', transform: 'translateZ(0)' }} />

      <div className="relative w-full max-w-md lg:max-w-5xl xl:max-w-6xl bg-white dark:bg-[#09090b] rounded-[40px] shadow-[0_48px_80px_-16px_rgba(0,0,0,0.08)] border border-slate-200/60 dark:border-white/5 overflow-hidden transition-all duration-500 grid grid-cols-1 lg:grid-cols-12" dir="ltr">

        <div className="lg:col-span-5 xl:col-span-6 flex flex-col justify-center p-8 sm:p-12 xl:p-16 z-10" dir={lang === "ar" ? "rtl" : "ltr"}>

          <div className="hidden lg:flex items-center justify-between mb-12 pb-8 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-bold text-lg select-none">
                N
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">نُقلة</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{lang === "ar" ? "شريكك المهني" : "Professional Partner"}</p>
              </div>
            </div>
          </div>

          <div className="lg:hidden p-8 text-center space-y-4 relative border-b border-slate-100 dark:border-white/5 mb-8">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-bold text-lg mx-auto select-none">
              N
            </div>

            <h2 className="text-2xl font-serif text-slate-900 dark:text-white leading-tight">{lang === "ar" ? "نُقلة للهوية المهنية" : "Nakla Professional Identity"}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              {lang === "ar"
                ? "حوّل مسيرتك المهنية إلى قصة نجاح تلفت الانتباه بمعايير رقمية عالمية."
                : "Transform your career path into a success story that captures attention with global digital standards."}
            </p>
          </div>

        {!isVerifying && forgotPasswordStep === null && (
          <div className="flex border-b border-slate-100 dark:border-white/5 w-full mb-8">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-4 text-xs font-bold transition-all relative ${
                isLogin
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              {t.authLoginTab}
              {isLogin && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-4 text-xs font-bold transition-all relative ${
                !isLogin
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              {t.authSignupTab}
              {!isLogin && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
              )}
            </button>
          </div>
        )}

        {isVerifying ? (
          <form onSubmit={handleVerifyCode} className="space-y-8 animate-fade-in animate-duration-300">

            <div className="text-center space-y-4 pb-2">
              <h3 className="font-serif text-2xl text-slate-900 dark:text-white">{lang === "ar" ? "تأكيد بريدك الإلكتروني" : "Verify your email"}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {lang === "ar"
                  ? "أرسلنا رمز تأكيد إلى بريدك لضمان أمان خصوصيتك المهنية:"
                  : "We've sent a verification code to your email to ensure your data privacy:"}<br />
                <span className="text-slate-900 dark:text-white font-medium block mt-1 tracking-tight">{email}</span>
              </p>
            </div>

            {verifyError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-450 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{verifyError}</p>
              </div>
            )}

            {success && !verifyError && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{success}</p>
              </div>
            )}

            <div className="space-y-3 text-right">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === "ar" ? "رمز التأكيد" : "SECURE CODE"}</label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full py-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02] text-center text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-3xl font-serif tracking-[12px] transition-all"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsVerifying(false);
                  setVerifyError(null);
                  setVerificationCode("");
                  setSuccess(null);
                }}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 transition"
              >
                <ArrowRight size={14} className="ml-1" />
                <span>الرجوع وتغيير البريد</span>
              </button>

              <button
                type="button"
                disabled={timeLeft > 0 || verifyLoading}
                onClick={async () => {
                  setVerifyError(null);
                  setSuccess(null);
                  setVerificationCode("");
                  const sent = await sendCode(email);
                  if (sent) {
                    setSuccess("تم إرسال كود تحقق جديد لبريدك بنجاح.");
                  }
                }}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 disabled:text-slate-450 dark:text-indigo-400 dark:disabled:text-slate-550 transition"
              >
                <Clock size={12} className="ml-1" />
                <span>{timeLeft > 0 ? `إعادة إرسال (${timeLeft}ث)` : "أعد طلب الرمز"}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={verifyLoading || verificationCode.length !== 6 || success?.includes("تأكيد")}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              {verifyLoading ? (
                <span className="border-2 border-current border-t-transparent rounded-full w-4 h-4 animate-spin" />
              ) : (
                <span>{lang === "ar" ? "تأكيد الحساب" : "Confirm Account"}</span>
              )}
            </button>
          </form>
        ) : forgotPasswordStep === "email" ? (
          <form onSubmit={handleForgotPasswordRequest} className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-2 pb-2">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-900 shadow-sm">
                <KeyRound size={28} />
              </div>
              <h3 className="font-black text-slate-800 dark:text-white text-md">استعادة كلمة المرور</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                أدخل بريدك الإلكتروني المسجل لنقوم بإرسال الرمز الأمني للتحقق وتغيير كلمة المرور.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-455 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{success}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-350">البريد الإلكتروني المسجل:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordStep(null);
                  setError(null);
                  setSuccess(null);
                }}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 transition"
              >
                <ArrowRight size={14} className="ml-1" />
                <span>الرجوع لتسجيل الدخول</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none transition duration-200"
            >
              {loading ? (
                <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Clock size={18} />
                  <span>إرسال كود التحقق الأمني</span>
                </>
              )}
            </button>
          </form>
        ) : forgotPasswordStep === "verification" ? (
          <form onSubmit={handleVerifyResetCode} className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-2 pb-2">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-900 shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-black text-slate-800 dark:text-white text-md">أدخل كود استعادة الحساب</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                لقد أرسلنا كوداً سرياً مكوناً من 6 خانات رقمية إلى بريدك للتحقق من هويتك:<br />
                <strong className="text-indigo-600 dark:text-indigo-400 font-sans break-all select-all block mt-1">{email}</strong>
              </p>
            </div>

            {verifyError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-450 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{verifyError}</p>
              </div>
            )}

            {success && !verifyError && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{success}</p>
              </div>
            )}

            <div className="space-y-1.5 text-right font-sans">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-350">رمز التحقق الأمني (OTP Code):</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-250 dark:border-slate-700 bg-transparent text-center text-slate-800 dark:text-slate-100 placeholder-slate-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-mono font-bold tracking-[8px] sm:tracking-[12px] focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordStep("email");
                  setVerifyError(null);
                  setVerificationCode("");
                  setSuccess(null);
                }}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 transition"
              >
                <ArrowRight size={14} className="ml-1" />
                <span>الرجوع وتغيير البريد</span>
              </button>

              <button
                type="button"
                disabled={timeLeft > 0 || verifyLoading}
                onClick={async () => {
                  setVerifyError(null);
                  setSuccess(null);
                  setVerificationCode("");
                  const sent = await sendCode(email);
                  if (sent) {
                    setSuccess("تم إرسال كود تحقق جديد بنجاح.");
                  }
                }}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 disabled:text-slate-450 dark:text-indigo-400 dark:disabled:text-slate-555 transition"
              >
                <Clock size={12} className="ml-1" />
                <span>{timeLeft > 0 ? `إعادة إرسال (${timeLeft}ث)` : "أعد طلب الرمز"}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={verifyLoading || verificationCode.length !== 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none transition duration-200"
            >
              {verifyLoading ? (
                <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>تحقق وتأكيد كود الاستعادة</span>
                </>
              )}
            </button>
          </form>
        ) : forgotPasswordStep === "reset" ? (
          <form onSubmit={handleUpdatePassword} className="p-6 sm:p-8 space-y-5 animate-fade-in">
            <div className="text-center space-y-2 pb-2">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-rose-500 dark:text-rose-450 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900 shadow-sm">
                <Lock size={28} />
              </div>
              <h3 className="font-black text-slate-800 dark:text-white text-md">تعيين كلمة مرور جديدة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                لقد تم التحقق من هويتك بنجاح للبريد الإلكتروني المدخل. يرجى إدخال كلمة المرور الجديدة الآن لتأمين الحساب.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-455 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <p className="font-bold leading-relaxed">{success}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-350">كلمة المرور الجديدة:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {newPassword && (
                <div className="space-y-1 pt-1.5 animate-fade-in">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>قوة كلمة المرور: {newStrength.text}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${newStrength.color} ${newStrength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-350">
                {lang === "ar" ? "تأكيد كلمة المرور الجديدة:" : "Confirm New Password:"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success?.includes("تحديث كلمة")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none transition duration-200"
            >
              {loading ? (
                <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{lang === "ar" ? "تحديث وحفظ كلمة المرور" : "Update & Save Password"}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-[20px] text-xs flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-[20px] text-xs flex items-center gap-3">
                <CheckCircle2 size={16} className="shrink-0" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            {!isLogin && (
              <>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authFullNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "ar" ? "أحمد سليم" : "e.g., John Doe"}
                    className="w-full px-4 py-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authSpecialtyLabel}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm appearance-none cursor-pointer"
                  >
                    <option value="Software Developer" className="dark:bg-slate-900">{lang === "ar" ? "مطور برمجيات" : "Software Developer"}</option>
                    <option value="Data Scientist" className="dark:bg-slate-900">{lang === "ar" ? "عالم بيانات" : "Data Scientist"}</option>
                    <option value="Product Manager" className="dark:bg-slate-900">{lang === "ar" ? "مدير منتج" : "Product Manager"}</option>
                    <option value="HR & Recruitment" className="dark:bg-slate-900">{lang === "ar" ? "مسؤول موارد بشرية" : "HR Specialist"}</option>
                    <option value="UI/UX Designer" className="dark:bg-slate-900">{lang === "ar" ? "مصمم واجهات" : "UI/UX Designer"}</option>
                    <option value="Marketing Specialist" className="dark:bg-slate-900">{lang === "ar" ? "أخصائي تسويق" : "Marketing Specialist"}</option>
                    <option value="Other Specialist" className="dark:bg-slate-900">{lang === "ar" ? "تخصص آخر" : "Other Specialist"}</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authEmailLabel}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm font-sans transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authPasswordLabel}</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep("email");
                      setError(null);
                      setSuccess(null);
                      setVerificationCode("");
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all"
                  >
                    {lang === "ar" ? "نسيت كلمة المرور؟" : "FORGOT PASSWORD?"}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm font-sans transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-300 hover:text-slate-600 transition-all font-sans"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {!isLogin && password && (
                <div className="pt-2">
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-0.5 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-500`} />
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authConfirmPasswordLabel}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-[16px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm font-sans transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[18px] text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <span className="border-2 border-current border-t-transparent rounded-full w-4 h-4 animate-spin" />
              ) : (
                <span>{isLogin ? (lang === "ar" ? "تسجيل الدخول" : "Sign In") : (lang === "ar" ? "إنشاء حساب مجاني" : "Create Account")}</span>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100 dark:border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em]">
                <span className="bg-white dark:bg-[#09090b] px-4 text-slate-400">{lang === "ar" ? "أو المتابعة باستخدام" : "OR CONTINUE WITH"}</span>
              </div>
            </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleRealGoogleLogin}
                className="w-full py-3.5 flex items-center justify-center gap-3 border border-slate-100 dark:border-white/5 rounded-[18px] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all font-bold text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-slate-900 dark:text-white uppercase tracking-wider">Google</span>
              </button>
          </form>
        )}

        <div className="pt-8 flex gap-3 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 mt-auto">
          <ShieldCheck className="text-slate-300 dark:text-white/20 shrink-0" size={14} />
          <p>
            {lang === "ar"
              ? "نستخدم تشفيراً محلياً متقدماً لضمان خصوصية بياناتك المهنية بالكامل. لا نقوم بمشاركة ملفاتك مع أي أطراف خارجية."
              : "We use advanced local encryption to ensure total privacy of your professional data. We do not share your files with any third parties."}
          </p>
        </div>

      </div>

      <div className="hidden lg:col-span-7 xl:col-span-6 text-white p-12 lg:flex flex-col justify-between relative overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] border-l border-slate-100 dark:border-white/5" dir={lang === "ar" ? "rtl" : "ltr"}>

        <div className="relative z-10 space-y-10 text-right pt-8">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-6xl font-serif text-slate-900 dark:text-white leading-[1.15]">
              {lang === "ar" ? (
                <>
                  بناء ملف مهني <br />
                  <span className="italic text-indigo-600 dark:text-indigo-400">يليق بطموحك</span>
                </>
              ) : (
                <>
                  Build a profile <br />
                  <span className="italic text-indigo-600 dark:text-indigo-400">worthy of you</span>
                </>
              )}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-sm mr-0 ml-auto font-medium">
              {lang === "ar"
                ? "نحن نؤمن أن كل خبرة تستحق أن تروى بأفضل شكل ممكن. نُقلة تعيد تصميم حضورك المهني بلمسة فنية ودقة رقمية."
                : "We believe every experience deserve to be told in the best way possible. Nakla redesigns your presence with art and precision."}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 justify-end">
            <div className="space-y-1">
               <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">98%</p>
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "ar" ? "رضا المستخدمين" : "User Satisfaction"}</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
            <div className="space-y-1">
               <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">+10K</p>
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lang === "ar" ? "سيرة ذاتية" : "CVs Crafted"}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-8 text-right min-h-[160px]">
          <div className="border-t border-slate-200/50 dark:border-white/5 pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonialIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <blockquote className="text-xl font-serif text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  {testimonials[activeTestimonialIndex].text[lang]}
                </blockquote>

                <div className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                      {testimonials[activeTestimonialIndex].name[lang]}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                      {testimonials[activeTestimonialIndex].role[lang]}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg">
                    <span className="font-bold text-[10px] text-white dark:text-slate-900">{testimonials[activeTestimonialIndex].initals}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>

      {showConfigModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-800 dark:text-slate-100" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-2xl relative border border-slate-100 dark:border-slate-800 flex flex-col space-y-4 animate-fade-in animate-duration-300">

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                <KeyRound size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black font-sans text-slate-900 dark:text-white">
                  {lang === "ar" ? "خطوة واحدة لتفعيل الدخول باستخدام Google" : "One step to enable Google Sign-In"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === "ar" ? "ربط التطبيق مع بوابات Google API لمطابقة حسابك بأمان" : "Establish direct link to official Google Identity APIs"}
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-650 dark:text-slate-300 space-y-3 leading-relaxed text-right font-medium">
              <p className="border-l-4 border-indigo-550 pl-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-lg text-xs leading-relaxed text-left">
                {lang === "ar"
                  ? "لتسجيل الدخول باستخدام حسابات Google المسجلة على متصفحك بأمان، يرجى تزويد التطبيق بـ Client ID من حساب المطورين الخاص بك:"
                  : "To fetch & authenticate the Google accounts logged into your browser session, please provide your own Google OAuth Client coordinates:"}
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2.5 text-xs text-left" dir="ltr">
                <p className="font-extrabold text-slate-800 dark:text-slate-200">📋 Setup Steps / خطوات التهيئة السريعة:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400 font-sans">
                  <li>
                    Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-bold">Google Cloud Console <ExternalLink size={10} /></a>
                  </li>
                  <li>Create an <strong>OAuth Client ID</strong> for a Web Application.</li>
                  <li>
                    Add these authorized Javascript origins and redirect URIs:
                    <div className="mt-1 p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-[10px] break-all font-mono space-y-1">
                      <div><strong>Authorized Origin:</strong> {window.location.origin}</div>
                      <div><strong>Redirect URI:</strong> {window.location.origin}/auth/callback</div>
                    </div>
                  </li>
                  <li>
                    In <strong>Google AI Studio</strong> (where you configure code), open the <strong>Settings (⚙️) / Secrets</strong> menu and add:
                    <div className="mt-1 p-1.5 bg-indigo-50/30 dark:bg-indigo-950/25 rounded border border-indigo-100 dark:border-indigo-900 text-[10px] font-mono select-none space-y-0.5 text-indigo-700 dark:text-indigo-400">
                      <div>🔑 <strong>GOOGLE_CLIENT_ID</strong> = &lt;Your OAuth Client ID&gt;</div>
                      <div>🔑 <strong>GOOGLE_CLIENT_SECRET</strong> = &lt;Your OAuth Client Secret&gt;</div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 transition"
              >
                {lang === "ar" ? "فهمت، سأقوم بضبطها" : "Okay, I will configure it"}
              </button>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1 transition"
              >
                <span>{lang === "ar" ? "افتح Google Console" : "Open Google Console"}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="absolute top-2 right-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition"
            >
              ✕
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
