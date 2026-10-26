"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, User, AtSign, Briefcase } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "@/components/Toast";
import { getSavedLanguage, Language } from "@/lib/i18n";
import { DeloopLogo } from "@/components/DeloopLogo";
import { DeveloperTitle } from "@/types";
import { dbSignIn, dbSignUp, dbSignInWithGoogle, dbGetProfile } from "@/lib/supabase/db";
import { supabase } from "@/lib/supabase/client";

function AuthPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [lang, setLang] = useState<Language>("tr");

  useEffect(() => {
    setLang(getSavedLanguage());
    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, []);

  // Mode: "signin" or "signup"
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialTab);

  // Sign In fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [developerTitle, setDeveloperTitle] = useState<DeveloperTitle>("Full-Stack Developer");

  // State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

  // Check if already logged in (Supabase session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.push("/projects");
      }
    });
  }, [router]);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError(lang === "tr" ? "Lütfen e-posta ve şifrenizi girin." : "Zəhmət olmasa email və şifrəni daxil edin.");
      return;
    }

    setLoading(true);

    try {
      const { session } = await dbSignIn(email.trim(), password);
      if (session?.user) {
        // Sync to local store for UI
        const profile = await dbGetProfile(session.user.id);
        if (profile) localStore.setCurrentUser(profile);
        showToast(
          lang === "tr" ? "Hoş Geldiniz!" : "Xoş Gəldiniz!",
          profile ? `@${profile.username}` : "",
          "success"
        );
      }
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || (lang === "tr" ? "Geçersiz giriş bilgileri" : "Yanlış giriş məlumatları"));
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError(lang === "tr" ? "Lütfen tüm zorunlu alanları doldurun." : "Zəhmət olmasa bütün vacib xanaları doldurun.");
      return;
    }

    if (username.trim().length < 3) {
      setError(lang === "tr" ? "Kullanıcı adı en az 3 karakter olmalıdır." : "İstifadəçi adı ən azı 3 simvol olmalıdır.");
      return;
    }

    if (password.length < 6) {
      setError(lang === "tr" ? "Şifre en az 6 karakter olmalıdır." : "Şifrə ən azı 6 simvol olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const { session } = await dbSignUp({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        developer_title: developerTitle,
      });

      if (session?.user) {
        const profile = await dbGetProfile(session.user.id);
        if (profile) localStore.setCurrentUser(profile);
        showToast(
          lang === "tr" ? "Hesap Oluşturuldu!" : "Hesab Uğurla Yaradıldı!",
          profile ? `@${profile.username}` : "",
          "success"
        );
        router.push("/projects");
      } else {
        // Email confirmation may be required
        showToast(
          lang === "tr" ? "E-posta doğrulaması gerekiyor" : "Email təsdiqi tələb olunur",
          lang === "tr" ? "Lütfen e-postanızı kontrol edin." : "Zəhmət olmasa emailinizi yoxlayın.",
          "info"
        );
      }
    } catch (err: any) {
      setError(err.message || (lang === "tr" ? "Kayıt işlemi başarısız oldu." : "Qeydiyyat zamanı xəta baş verdi."));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      await dbSignInWithGoogle();
      // Will redirect automatically via OAuth flow
    } catch (err: any) {
      if (err.message === "SUPABASE_GOOGLE_DISABLED") {
        setGoogleModalOpen(true);
      } else {
        setError(err.message || (lang === "tr" ? "Google ile giriş başarısız oldu." : "Google ilə giriş zamanı xəta baş verdi."));
      }
    } finally {
      setLoading(false);
    }
  };

  const submitGoogleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;

    const email = googleEmailInput.trim();
    const name = googleNameInput.trim() || email.split("@")[0];
    const user = localStore.loginWithGoogle({
      email,
      name,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    });

    setGoogleModalOpen(false);
    showToast("Google ilə Giriş Edildi!", `@${user.username}`, "success");
    router.push("/projects");
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 sm:py-12 px-4">
      <div className="bg-white dark:bg-[#121824] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
        
        {/* APP LOGO & BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <DeloopLogo variant="app" size="xl" className="shadow-md" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Deloop
              </h1>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                DEV
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {lang === "tr"
                ? "Geliştiriciler için Sosyal Ağ ve Portfolyo Platformu"
                : "Developer-lər üçün Sosial Şəbəkə və Portfolio Platforması"}
            </p>
          </div>
        </div>

        {/* TAB SWITCHER: SIGN IN vs SIGN UP */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "signin"
                ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>{lang === "tr" ? "Giriş Yap" : "Daxil Ol"}</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>{lang === "tr" ? "Kayıt Ol" : "Qeydiyyat"}</span>
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800/80 text-gray-800 dark:text-neutral-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm group active:scale-[0.99]"
          >
            <svg
              className="w-5 h-5 shrink-0"
              style={{ width: "20px", height: "20px", minWidth: "20px" }}
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === "signin"
                ? (lang === "tr" ? "Google ile Giriş Yap" : "Google ilə Daxil Ol")
                : (lang === "tr" ? "Google ile Kayıt Ol" : "Google ilə Qeydiyyatdan Keç")}
            </span>
          </button>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
              <span className="bg-white dark:bg-[#121824] px-3 text-gray-400 dark:text-neutral-500">
                {lang === "tr" ? "veya e-posta ile" : "və ya email ilə"}
              </span>
            </div>
          </div>
        </div>

        {/* SIGN IN FORM */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "E-posta Adresi" : "Email Ünvanı"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  {lang === "tr" ? "Şifre" : "Şifrə"}
                </label>
                <Link href="/forgot-password" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                  {lang === "tr" ? "Şifremi unuttum?" : "Şifrəni unutmusunuz?"}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              <span>{loading ? "Giriş edilir..." : (lang === "tr" ? "Giriş Yap" : "Daxil Ol")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {/* FULL NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "Ad Soyad" : "Ad və Soyad"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elvin Əliyev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* USERNAME */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "Kullanıcı Adı" : "İstifadəçi Adı (@username)"}
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="elvin_dev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "E-posta" : "Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "Şifre (min. 6 karakter)" : "Şifrə (min. 6 simvol)"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* DEVELOPER TITLE */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {lang === "tr" ? "Uzmanlık Alanı" : "İxtisas Sahəniz"}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={developerTitle}
                  onChange={(e) => setDeveloperTitle(e.target.value as DeveloperTitle)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI / Data Engineer">AI / Data Engineer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              <span>{loading ? "Qeydiyyat edilir..." : (lang === "tr" ? "Hesap Oluştur" : "Hesab Yarat")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* BOTTOM TOGGLE HELPER */}
        <div className="text-center pt-2 text-xs text-gray-500 dark:text-neutral-400">
          {mode === "signin" ? (
            <>
              {lang === "tr" ? "Hesabınız yok mu? " : "Hesabınız yoxdur? "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1"
              >
                {lang === "tr" ? "Şimdi Kayıt Olun" : "İndi Qeydiyyatdan Keçin"}
              </button>
            </>
          ) : (
            <>
              {lang === "tr" ? "Zaten bir hesabınız var mı? " : "Artıq hesabınız var? "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1"
              >
                {lang === "tr" ? "Giriş Yapın" : "Daxil Olun"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* GOOGLE DIRECT PROMPT MODAL (Fallback for quick Google authentication) */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#121824] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full max-h-[90dvh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
              <svg
                className="w-5 h-5 shrink-0"
                style={{ width: "20px", height: "20px", minWidth: "20px" }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Google ilə Giriş</h3>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === "tr"
                ? "Google hesabınız ile hızlıca giriş yapın:"
                : "Google hesabınız ilə Deloop platformasında dərhal profilinizlə işə başlayın:"}
            </p>

            <form onSubmit={submitGoogleModal} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="developer@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Ad və Soyad
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Adınız və Soyadınız"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Davam et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Yüklənir...</div>}>
      <AuthPortalContent />
    </Suspense>
  );
}
