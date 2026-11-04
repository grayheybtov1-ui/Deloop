"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertOctagon, Terminal } from "lucide-react";
import { getSavedLanguage, Language } from "@/lib/i18n";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<Language>("az");

  useEffect(() => {
    setLang(getSavedLanguage());
    console.error("Deloop Application Error:", error);
  }, [error]);

  const t = {
    az: {
      badge: "SİSTEM XƏTASI",
      title: "Gözlənilməz Bir Xəta Baş Verdi",
      desc: "Narahat olmayın, komandamız bu barədə məlumatlandırıldı. Səhifəni yeniləyə və ya ana səhifəyə qayıda bilərsiniz.",
      tryAgain: "Yenidən Cəhd Et",
      backHome: "Ana Səhifə",
    },
    tr: {
      badge: "SİSTEM HATASI",
      title: "Beklenmeyen Bir Hata Oluştu",
      desc: "Endişelenmeyin, hata kaydedildi. Sayfayı yenilemeyi deneyebilir veya ana sayfaya dönebilirsiniz.",
      tryAgain: "Yeniden Dene",
      backHome: "Ana Sayfa",
    },
    en: {
      badge: "SYSTEM ERROR",
      title: "Something Went Wrong",
      desc: "Don't worry, the error has been logged. You can try refreshing or go back to the home page.",
      tryAgain: "Try Again",
      backHome: "Home Page",
    },
  }[lang];

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* GLOWING ICON */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-red-500/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-lg">
            <AlertOctagon className="w-10 h-10" />
          </div>
        </div>

        {/* ERROR MESSAGE CODE BOX */}
        <div className="text-left max-w-md mx-auto p-4 rounded-xl bg-gray-900 text-gray-200 border border-gray-800 font-mono text-xs shadow-xl space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-800 text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            <span>unhandled-exception.log</span>
          </div>
          <p className="text-red-400 truncate">
            {error?.message || "An unexpected runtime error occurred."}
          </p>
          {error?.digest && (
            <p className="text-gray-500 text-[10px]">
              Digest ID: {error.digest}
            </p>
          )}
        </div>

        {/* TEXT CONTENT */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            {t.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.desc}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.tryAgain}</span>
          </button>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{t.backHome}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

