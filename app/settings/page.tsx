"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Share2, 
  Globe, 
  Save, 
  CheckCircle2, 
  Github, 
  Linkedin,
  Sun,
  Moon,
  Palette,
  Trash2,
  AlertTriangle,
  AlertCircle,
  AtSign,
} from "lucide-react";

import { Profile, DeveloperTitle } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { dbUpdateProfile, dbDeleteAccount, dbUpdatePassword } from "@/lib/supabase/db";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { getSavedLanguage, setSavedLanguage, translations, Language } from "@/lib/i18n";

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<Profile | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "social" | "security" | "language" | "appearance">("profile");
  const [lang, setLang] = useState<Language>("tr");
  const [isDark, setIsDark] = useState(false);

  // FORM FIELDS
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [developerTitle, setDeveloperTitle] = useState<DeveloperTitle>("Full-Stack Developer");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const [githubUsername, setGithubUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [newPassword, setNewPassword] = useState("");

  // DELETE ACCOUNT MODAL STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLang = getSavedLanguage();
    setLang(currentLang);

    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    setUser(curr);
    setFullName(curr.full_name || "");
    setUsername(curr.username || "");
    setDeveloperTitle(curr.developer_title || "Full-Stack Developer");
    setBio(curr.bio || "");
    setLocation(curr.location || "");
    setSkillsInput(curr.skills ? curr.skills.join(", ") : "");
    setGithubUsername(curr.github_username || "");
    setWebsite(curr.website || "");
    setLinkedinUrl(curr.linkedin_url || "");
  }, [router]);

  const t = translations[lang] || translations.tr;

  useEffect(() => {
    const isDarkMode = typeof document !== "undefined" && (
      document.documentElement.classList.contains("dark") || 
      localStorage.getItem("deloop_theme") === "dark"
    );
    setIsDark(isDarkMode);

    const onTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("deloop_theme_changed", onTheme);
    return () => window.removeEventListener("deloop_theme_changed", onTheme);
  }, []);

  const handleThemeChange = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("deloop_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("deloop_theme", "light");
    }
    window.dispatchEvent(new Event("deloop_theme_changed"));
    showToast(
      dark
        ? (lang === "tr" ? "Karanlık Mod Aktif" : "Qaranlıq Rejim Aktiv")
        : (lang === "tr" ? "Aydınlık Mod Aktif" : "İşıqlı Rejim Aktiv"),
      undefined,
      "info"
    );
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setSavedLanguage(newLang);
    showToast(
      newLang === "tr" ? "Dil Değiştirildi: Türkçe" : newLang === "az" ? "Dil Dəyişdirildi: Azərbaycan dili" : "Language Changed: English",
      undefined,
      "success"
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      showToast(
        lang === "tr" ? "Kullanıcı adı en az 3 karakter olmalıdır" : "İstifadəçi adı ən az 3 simvol olmalıdır",
        undefined,
        "error"
      );
      return;
    }

    // Check username uniqueness if changed
    if (cleanUsername !== user.username.toLowerCase()) {
      const isTakenLocally = localStore.getProfiles().some(
        (p) => p.id !== user.id && p.username.toLowerCase() === cleanUsername
      );
      if (isTakenLocally) {
        showToast(
          lang === "tr" ? "Bu kullanıcı adı zaten alınmış" : "Bu istifadəçi adı artıq götürülüb",
          lang === "tr" ? "Lütfen başka bir kullanıcı adı seçin" : "Zəhmət olmasa başqa ad seçin",
          "error"
        );
        return;
      }

      try {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", cleanUsername)
          .neq("id", user.id)
          .maybeSingle();

        if (existingUser) {
          showToast(
            lang === "tr" ? "Bu kullanıcı adı zaten alınmış" : "Bu istifadəçi adı artıq götürülüb",
            lang === "tr" ? "Lütfen başka bir kullanıcı adı seçin" : "Zəhmət olmasa başqa ad seçin",
            "error"
          );
          return;
        }
      } catch {
        // ignore
      }
    }

    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatePayload = {
      username: cleanUsername,
      full_name: fullName.trim(),
      developer_title: developerTitle,
      bio: bio.trim(),
      location: location.trim(),
      skills: skillsArray,
      github_username: githubUsername.trim(),
      website: website.trim(),
      linkedin_url: linkedinUrl.trim(),
    };

    try {
      const updated = await dbUpdateProfile(user.id, updatePayload);
      if (updated) {
        setUser(updated);
        localStore.setCurrentUser(updated);
      } else {
        const localUpdated = localStore.updateProfile(user.id, updatePayload);
        if (localUpdated) setUser(localUpdated);
      }
    } catch {
      // Fallback
      const localUpdated = localStore.updateProfile(user.id, updatePayload);
      if (localUpdated) {
        setUser(localUpdated);
      }
    }

    localStore.updateProfile(user.id, updatePayload);
    window.dispatchEvent(new Event("deloop_user_updated"));
    showToast(t.settings.savedToast, undefined, "success");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast(lang === "tr" ? "Şifre en az 6 karakter olmalıdır" : "Şifrə ən az 6 simvol olmalıdır", undefined, "error");
      return;
    }

    try {
      await dbUpdatePassword(newPassword);
    } catch {
      // ignore
    }

    if (user) {
      localStore.updateProfile(user.id, { password: newPassword });
    }

    setNewPassword("");
    showToast(lang === "tr" ? "Şifre başarıyla güncellendi" : "Şifrə yeniləndi", undefined, "success");
  };

  const handleConfirmDelete = async () => {
    if (!user) return;
    if (!deletePassword.trim()) {
      setDeleteError(lang === "tr" ? "Lütfen hesap şifrenizi girin." : "Zəhmət olmasa hesab şifrənizi daxil edin.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await dbDeleteAccount(user.id, deletePassword.trim());
      setIsDeleteModalOpen(false);
      showToast(
        lang === "tr" ? "Hesabınız başarıyla silindi." : "Hesabınız uğurla silindi.",
        undefined,
        "info"
      );
      router.push("/login");
    } catch (err: any) {
      setDeleteError(
        err.message ||
        (lang === "tr" ? "Şifre yanlış veya hesap silinemedi." : "Şifrə yanlışdır və ya hesabı silmək mümkün olmadı.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 pt-2 px-2 sm:px-4">
      
      {/* SETTINGS HEADER */}
      <div className="pb-4 border-b border-neutral-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-blue-500" />
          <span>{t.settings.title}</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveSection("profile")}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0 ${
            activeSection === "profile"
              ? "bg-neutral-800 text-white font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.settings.tabProfile}</span>
        </button>

        <button
          onClick={() => setActiveSection("language")}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0 ${
            activeSection === "language"
              ? "bg-neutral-800 text-white font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{t.settings.tabLanguage}</span>
        </button>

        <button
          onClick={() => setActiveSection("social")}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0 ${
            activeSection === "social"
              ? "bg-neutral-800 text-white font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{t.settings.tabSocial}</span>
        </button>

        <button
          onClick={() => setActiveSection("security")}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0 ${
            activeSection === "security"
              ? "bg-neutral-800 text-white font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t.settings.tabSecurity}</span>
        </button>

        <button
          onClick={() => setActiveSection("appearance")}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0 ${
            activeSection === "appearance"
              ? "bg-neutral-800 text-white font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>{lang === "tr" ? "Görünüm & Logo" : "Görünüş & Loqo"}</span>
        </button>
      </div>

      {/* TAB CONTENT: PROFILE DETAILS */}
      {activeSection === "profile" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-5 sm:p-6">
            <h3 className="font-semibold text-white text-sm border-b border-neutral-800 pb-3">
              {lang === "tr" ? "Geliştirici Kimlik Bilgileri" : "Tərtibatçı Məlumatları"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Ad Soyad" : "Ad və Soyad"}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* NICKNAME / USERNAME FIELD */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Kullanıcı Adı (Nickname)" : "İstifadəçi Adı (Nickname)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-neutral-500 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 font-mono">
                  {lang === "tr" ? `Profil URL: @${username}` : `Profil URL: @${username}`}
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Uzmanlık Alanı" : "İxtisas"}
                </label>
                <select
                  value={developerTitle}
                  onChange={(e) => setDeveloperTitle(e.target.value as DeveloperTitle)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI / Data Engineer">AI / Data Engineer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Konum" : "Məkan"}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Örn: Bakü, Azerbaycan / İstanbul, Türkiye"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Biyografi" : "Bio"}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={lang === "tr" ? "Kendinizden ve üzerinde çalıştığınız teknolojilerden bahsedin..." : "Özünüz haqqında qısa məlumat..."}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  {lang === "tr" ? "Yetenekler (Virgülle ayırın)" : "Bacarıqlar (Vergüllə ayırın)"}
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Next.js, TypeScript, PostgreSQL, Node.js"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.settings.save}</span>
              </button>
            </div>
          </form>

          {/* DANGER ZONE: HESABI SİL CARD */}
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>{lang === "tr" ? "Hesabı Sil" : "Hesabı Sil"}</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  {lang === "tr"
                    ? "Profilinizi, tüm paylaşımlarınızı ve hesap verilerinizi kalıcı olarak silin."
                    : "Profilinizi, layihələrinizi və hesab məlumatlarınızı həmişəlik silin."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 hover:text-red-300 font-semibold text-xs transition-colors shrink-0 flex items-center gap-2 self-start sm:self-auto shadow-sm active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "tr" ? "Hesabı Sil" : "Hesabı Sil"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LANGUAGE & APPEARANCE (DİL SEÇİMİ) */}
      {activeSection === "language" && (
        <div className="space-y-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-5 sm:p-6">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="font-semibold text-white text-sm">
              {t.settings.languageTitle}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {t.settings.languageSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* TÜRKÇE */}
            <div
              onClick={() => handleLanguageChange("tr")}
              className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                lang === "tr"
                  ? "bg-neutral-800/90 border-blue-500 ring-1 ring-blue-500/50"
                  : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">🇹🇷 Türkçe</span>
                {lang === "tr" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-neutral-400">Varsayılan platform dili.</p>
            </div>

            {/* AZƏRBAYCAN DİLİ */}
            <div
              onClick={() => handleLanguageChange("az")}
              className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                lang === "az"
                  ? "bg-neutral-800/90 border-blue-500 ring-1 ring-blue-500/50"
                  : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">🇦🇿 Azərbaycan</span>
                {lang === "az" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-neutral-400">Azərbaycan dili seçimi.</p>
            </div>

            {/* ENGLISH */}
            <div
              onClick={() => handleLanguageChange("en")}
              className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                lang === "en"
                  ? "bg-neutral-800/90 border-blue-500 ring-1 ring-blue-500/50"
                  : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">🇬🇧 English</span>
                {lang === "en" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-neutral-400">International English language.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SOCIAL LINKS */}
      {activeSection === "social" && (
        <form onSubmit={handleSaveProfile} className="space-y-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-5 sm:p-6">
          <h3 className="font-semibold text-white text-sm border-b border-neutral-800 pb-3">
            {lang === "tr" ? "GitHub ve Sosyal Bağlantılar" : "GitHub və Sosial Şəbəkələr"}
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Github className="w-4 h-4 text-neutral-400" />
                GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="octocat"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-neutral-400" />
                Portfolio / Web Sitesi
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 text-neutral-400" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.settings.save}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: SECURITY */}
      {activeSection === "security" && (
        <form onSubmit={handlePasswordUpdate} className="space-y-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-5 sm:p-6">
          <h3 className="font-semibold text-white text-sm border-b border-neutral-800 pb-3">
            {lang === "tr" ? "Şifre ve Güvenlik" : "Şifrə və Təhlükəsizlik"}
          </h3>

          <div className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                {lang === "tr" ? "Yeni Şifre" : "Yeni Şifrə"}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === "tr" ? "Şifreyi Güncelle" : "Şifrəni Yenilə"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: APPEARANCE & BRAND LOGOS */}
      {activeSection === "appearance" && (
        <div className="space-y-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-5 sm:p-6">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="font-semibold text-white text-sm">
              {lang === "tr" ? "Görünüm ve Marka Logoları" : "Görünüş və Brend Loqoları"}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {lang === "tr"
                ? "Platform temasını seçin ve resmi Deloop marka logolarını inceleyin."
                : "Platforma rejimini seçin və rəsmi Deloop brend loqolarına baxın."}
            </p>
          </div>

          {/* THEME SELECTOR */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 font-mono uppercase tracking-wider">
              {lang === "tr" ? "Tema Tercihi" : "Rejim Seçimi"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <button
                type="button"
                onClick={() => handleThemeChange(false)}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left ${
                  !isDark
                    ? "bg-white text-gray-900 border-blue-500 ring-2 ring-blue-500/30 shadow-md"
                    : "bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">
                    {lang === "tr" ? "Aydınlık Mod (Light)" : "Açıq Rejim (Light)"}
                  </div>
                  <div className="text-[11px] opacity-75">
                    {lang === "tr" ? "Açık arayüz ve 1. logo" : "İşıqlı interfeys və 1-ci loqo"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange(true)}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left ${
                  isDark
                    ? "bg-neutral-950 text-white border-blue-500 ring-2 ring-blue-500/30 shadow-md"
                    : "bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">
                    {lang === "tr" ? "Karanlık Mod (Dark)" : "Tünd Rejim (Dark)"}
                  </div>
                  <div className="text-[11px] opacity-75">
                    {lang === "tr" ? "Karanlık tema ve 2. logo" : "Qaranlıq rejim və 2-ci loqo"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* OFFICIAL LOGO ASSETS SHOWCASE */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-neutral-200 font-mono uppercase tracking-wider">
                {lang === "tr" ? "Deloop Resmi Varlıklar" : "Deloop Rəsmi Brend Loqoları"}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {lang === "tr"
                  ? "Tüm platformda kullanılan 3 özel logo tasarımı:"
                  : "Platformada istifadə olunan 3 xüsusi loqo dizaynı:"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. LIGHT MODE LOGO */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-light.png"
                    alt="Light Mode Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
                    1. Light Mode
                  </span>
                  <div className="font-bold text-gray-900 text-xs">
                    {lang === "tr" ? "Aydınlık Tema Logosu" : "Açıq Rejim Loqosu"}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {lang === "tr" ? "Açık arayüzler için ana logo" : "Açıq interfeyslər üçün əsas loqo"}
                  </p>
                </div>
              </div>

              {/* 2. DARK MODE LOGO */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-gray-800 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-dark.png"
                    alt="Dark Mode Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 font-mono">
                    2. Dark Mode
                  </span>
                  <div className="font-bold text-white text-xs">
                    {lang === "tr" ? "Karanlık Tema Logosu" : "Tünd Rejim Loqosu"}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {lang === "tr" ? "Karanlık arayüz için metalik logo" : "Tünd rejim üçün metalik loqo"}
                  </p>
                </div>
              </div>

              {/* 3. APP LOGO & CHROME TAB FAVICON */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-neutral-700 flex items-center justify-center bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/app-logo.png"
                    alt="App Logo and Favicon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    3. App & Favicon
                  </span>
                  <div className="font-bold text-white text-xs">
                    {lang === "tr" ? "App Logosu & Chrome İkonu" : "App Loqosu & Chrome İkonu"}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {lang === "tr"
                      ? "Uygulama logosu ve tarayıcı sekme simgesi"
                      : "Tətbiq loqosu və Chrome tabında sayt adının yanındakı ikon"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#121824] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 pb-1 border-b border-gray-100 dark:border-neutral-800/80">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {lang === "tr" ? "Hesabı Sil" : "Hesabı Sil"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {lang === "tr" ? "Kalıcı hesap silme işlemi" : "Hesabın birdəfəlik silinməsi"}
                </p>
              </div>
            </div>

            {/* EXACT USER SPECIFIED WARNING */}
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <span className="leading-snug">
                hesabi sildikden sonra birde geri qaytarmaq mumkun deyl
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
              {lang === "tr"
                ? "Hesabınızı silmek için lütfen onay olarak hesap şifrenizi girin:"
                : "Hesabınızı silmək üçün zəhmət olmasa təsdiq olaraq hesab şifrənizi daxil edin:"}
            </p>

            {/* PASSWORD INPUT FOR CONFIRMATION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-400" />
                <span>{lang === "tr" ? "Hesap Şifresi" : "Hesab Şifrəsi"}</span>
              </label>
              <input
                type="password"
                autoFocus
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deletePassword.trim() && !isDeleting) {
                    handleConfirmDelete();
                  }
                }}
                placeholder={lang === "tr" ? "Hesap şifrenizi girin" : "Hesab şifrənizi daxil edin"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 font-mono transition-colors"
              />
            </div>

            {/* ERROR DISPLAY */}
            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* TWO BUTTONS: 'geri don' and 'hesabi sil' */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
              >
                {lang === "tr" ? "Geri dön" : "Geri dön"}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || !deletePassword.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeleting
                    ? (lang === "tr" ? "Siliniyor..." : "Silinir...")
                    : (lang === "tr" ? "Hesabı sil" : "Hesabı sil")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
