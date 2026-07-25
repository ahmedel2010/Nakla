import React, { useState, useEffect } from "react";
import { User, Mail, Briefcase, Camera, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, UploadCloud, Sparkles } from "lucide-react";
import { translations } from "../../shared/lib/translations";

interface UserProfileProps {
  user: { name: string; email: string; role: string; photo?: string };
  onUpdate: (updatedUser: { name: string; email: string; role: string; photo?: string }) => void;
  lang?: "ar" | "en";
}

const PRESET_AVATARS = [
  { id: "gradient-indigo", label: "Indigo Mist", class: "bg-gradient-to-tr from-indigo-500 to-indigo-700" },
  { id: "gradient-emerald", label: "Emerald Glade", class: "bg-gradient-to-tr from-emerald-500 to-teal-700" },
  { id: "gradient-amber", label: "Amber Sunset", class: "bg-gradient-to-tr from-amber-500 to-rose-600" },
  { id: "gradient-purple", label: "Purple Nebula", class: "bg-gradient-to-tr from-purple-500 to-fuchsia-700" },
  { id: "gradient-sky", label: "Sky Dream", class: "bg-gradient-to-tr from-sky-400 to-blue-600" },
  { id: "gradient-dark", label: "Charcoal Slate", class: "bg-gradient-to-tr from-slate-700 to-slate-900" }
];

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, lang = "ar" }) => {
  const t = translations[lang];

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [photo, setPhoto] = useState(user.photo || "");

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPassState, setShowNewPassState] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user.name);
    setRole(user.role);
    setPhoto(user.photo || "");
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError(
        lang === "ar"
          ? "حجم الصورة كبير جداً! يرجى اختيار صورة أصغر من 1 ميجابايت."
          : "Selected file is too large! Please choose an image smaller than 1MB."
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        lang === "ar"
          ? "صيغة الملف غير مدعومة! يرجى رفع صورة صالحة فقط."
          : "File type not supported! Please select a valid image file."
      );
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetClass: string) => {
    setError(null);

    setPhoto(presetClass);
  };

  const isGradientPhoto = (url: string) => {
    return url.startsWith("bg-gradient");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error(lang === "ar" ? "الاسم الكامل مطلوب." : "Full name is required.");
      }

      const usersJson = localStorage.getItem("cv_eval_users") || "[]";
      const users = JSON.parse(usersJson);

      const userIndex = users.findIndex(
        (u: any) => u.email.toLowerCase() === user.email.toLowerCase()
      );

      if (userIndex === -1) {
        throw new Error(
          lang === "ar"
            ? "لم يتم العثور على حساب المستخدم الحالي."
            : "Current user account reference was not found."
        );
      }

      const cachedUser = users[userIndex];

      if (showPasswordFields) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          throw new Error(
            lang === "ar"
              ? "الرجاء تعبئة جميع حقول تغيير كلمة المرور."
              : "Please fill out all password modification fields."
          );
        }

        if (currentPassword !== cachedUser.password) {
          throw new Error(
            lang === "ar"
              ? "كلمة المرور الحالية المدخلة غير صحيحة."
              : "Entered current password credential is incorrect."
          );
        }

        if (newPassword.length < 6) {
          throw new Error(
            lang === "ar"
              ? "يجب أن تتكون كلمة المرور الجديدة من 6 رموز كحد أدنى."
              : "The new secure password must contains at least 6 characters."
          );
        }

        if (newPassword !== confirmNewPassword) {
          throw new Error(
            lang === "ar"
              ? "كلمة المرور التأكيدية لا تطابق الكلمة الجديدة."
              : "The confirmed password does not match your new password."
          );
        }

        cachedUser.password = newPassword;
      }

      cachedUser.name = name.trim();
      cachedUser.role = role;
      cachedUser.photo = photo;

      users[userIndex] = cachedUser;
      localStorage.setItem("cv_eval_users", JSON.stringify(users));

      onUpdate({
        name: cachedUser.name,
        email: cachedUser.email,
        role: cachedUser.role,
        photo: cachedUser.photo
      });

      setSuccess(t.profileSaveSuccess);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordFields(false);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err: any) {
      setError(err.message || t.authGeneralError);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t.profileTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.profileSubtitle}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-3">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <p className="font-bold leading-relaxed">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t.profilePhotoLabel}
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">

            <div className="relative shrink-0 group">
              {photo ? (
                isGradientPhoto(photo) ? (
                  <div className={`w-20 h-20 rounded-full ${photo} flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white dark:border-slate-800`}>
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={photo}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white dark:border-slate-800"
                  />
                )
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xl font-bold border-2 border-white dark:border-slate-800">
                  {name.substring(0, 2).toUpperCase()}
                </div>
              )}

              <label className="absolute bottom-0 right-0 p-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-100 rounded-full cursor-pointer shadow-md transition-all">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                {lang === "ar" ? "اختر مظهر سريع جاهز:" : "Select a rapid visual preset:"}
              </span>

              <div className="grid grid-cols-6 gap-2 w-full max-w-sm">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.class)}
                    className={`h-7 w-7 rounded-full ${preset.class} border-2 transition hover:scale-110 active:scale-95 ${
                      photo === preset.class ? "border-slate-950 dark:border-white ring-2 ring-slate-200 dark:ring-slate-700" : "border-transparent"
                    }`}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.profileNameLabel}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 flex items-center text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  lang === "ar" ? "pl-4 pr-10" : "pr-4 pl-10"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.profileRoleLabel}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 flex items-center text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
                <Briefcase size={16} />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer ${
                  lang === "ar" ? "pl-4 pr-10" : "pr-4 pl-10"
                }`}
              >
                <option value="Software Developer" className="dark:bg-slate-900">{lang === "ar" ? "مطور برمجيات (Software Developer)" : "Software Developer"}</option>
                <option value="Data Scientist" className="dark:bg-slate-900">{lang === "ar" ? "عالم بيانات (Data Scientist)" : "Data Scientist"}</option>
                <option value="Product Manager" className="dark:bg-slate-900">{lang === "ar" ? "مدير منتج (Product Manager)" : "Product Manager"}</option>
                <option value="HR & Recruitment" className="dark:bg-slate-900">{lang === "ar" ? "مسؤول موارد بشرية وتوظيف (HR)" : "HR Specialist"}</option>
                <option value="UI/UX Designer" className="dark:bg-slate-900">{lang === "ar" ? "مصمم واجهات وتجربة المستخدم" : "UI/UX Designer"}</option>
                <option value="Marketing Specialist" className="dark:bg-slate-900">{lang === "ar" ? "أخصائي تسويق رقمي" : "Marketing Specialist"}</option>
                <option value="Other Specialist" className="dark:bg-slate-900">{lang === "ar" ? "تخصص آخر / باحث عن عمل" : "Other / Job Seeker"}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/10">
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500">
            {t.profileEmailLabel}
          </label>
          <div className="relative">
            <span className={`absolute inset-y-0 flex items-center text-slate-400/50 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
              <Mail size={16} />
            </span>
            <input
              type="email"
              disabled
              value={user.email}
              className={`w-full py-2.5 rounded-xl border border-slate-205/50 dark:border-slate-800 bg-transparent text-slate-400 dark:text-slate-500 text-sm select-none cursor-not-allowed ${
                lang === "ar" ? "pl-4 pr-10" : "pr-4 pl-10"
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">
            {lang === "ar"
              ? "البريد الإلكتروني يمثل معرف حسابك الرقمي الموثق ولا يمكن تغييره لضمان حماية سجلات الـ CV."
              : "Email constitutes your primary verified database key and cannot be updated to safeguard history configurations."}
          </p>
        </div>

        <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden p-4 space-y-4">
          <button
            type="button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 hover:underline">
              <Lock size={15} />
              {t.profileChangePassTitle}
            </span>
            <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
              {showPasswordFields ? (lang === "ar" ? "إخفاء" : "Collapse") : (lang === "ar" ? "تعديل" : "Setup")}
            </span>
          </button>

          {showPasswordFields && (
            <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-850 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.profileOldPass}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 flex items-center text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
                    <Lock size={16} />
                  </span>
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                      lang === "ar" ? "pl-10 pr-10" : "pr-10 pl-10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className={`absolute inset-y-0 flex items-center text-slate-400 hover:text-slate-600 ${lang === "ar" ? "left-3" : "right-3"}`}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.profileNewPass}
                  </label>
                  <div className="relative">
                    <span className={`absolute inset-y-0 flex items-center text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
                      <Lock size={16} />
                    </span>
                    <input
                      type={showNewPassState ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                        lang === "ar" ? "pl-10 pr-10" : "pr-10 pl-10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassState(!showNewPassState)}
                      className={`absolute inset-y-0 flex items-center text-slate-400 hover:text-slate-600 ${lang === "ar" ? "left-3" : "right-3"}`}
                    >
                      {showNewPassState ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.profileConfirmNewPass}
                  </label>
                  <div className="relative">
                    <span className={`absolute inset-y-0 flex items-center text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`}>
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                        lang === "ar" ? "pl-4 pr-10" : "pr-4 pl-10"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-950 dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white dark:text-slate-950 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md dark:shadow-none transition duration-200"
        >
          {loading ? (
            <span className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
          ) : (
            <span>{t.profileSaveBtn}</span>
          )}
        </button>
      </form>
    </div>
  );
};
