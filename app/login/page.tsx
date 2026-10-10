"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "@/components/Toast";
import { getSavedLanguage, Language } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const lang: Language = getSavedLanguage();

  const [email, setEmail] = useState("elvin@deloop.az");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(lang === "tr" ? "Lütfen e-posta ve şifrenizi girin." : "Zəhmət olmasa email və şifrəni daxil edin.");
      return;
    }

    setLoading(true);

    try {
      const user = localStore.login(email);
      showToast(lang === "tr" ? "Hoş Geldiniz!" : "Xoş Gəldiniz!", `@${user.username}`, "success");
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || (lang === "tr" ? "Geçersiz giriş bilgileri" : "Yanlış məlumatlar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16 px-4">
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-blue-400 mx-auto font-mono font-bold text-lg">
            D
          </div>
          <h1 className="text-xl font-bold text-white">
            {lang === "tr" ? "Deloop'a Giriş Yap" : "Deloop-a Daxil Ol"}
          </h1>
          <p className="text-xs text-neutral-400">
            {lang === "tr" ? "Geliştirici hesabınızla oturum açın" : "Tərtibatçı hesabınızla daxil olun"}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              {lang === "tr" ? "E-posta Adresi" : "Email Ünvanı"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-300">
                {lang === "tr" ? "Şifre" : "Şifrə"}
              </label>
              <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                {lang === "tr" ? "Şifremi unuttum" : "Şifrəni unutmusunuz?"}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors font-mono"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{lang === "tr" ? "Giriş Yap" : "Daxil Ol"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="text-center pt-1 text-xs text-neutral-400">
          {lang === "tr" ? "Hesabınız yok mu? " : "Hesabınız yoxdur? "}
          <Link href="/register" className="text-blue-400 font-semibold hover:underline">
            {lang === "tr" ? "Kayıt Olun" : "Qeydiyyatdan Keçin"}
          </Link>
        </div>
      </div>
    </div>
  );
}
