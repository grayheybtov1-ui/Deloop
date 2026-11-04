"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, FolderGit2, Home, ArrowLeft, Terminal, AlertCircle } from "lucide-react";
import { getSavedLanguage, Language } from "@/lib/i18n";

export default function NotFound() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("az");

  useEffect(() => {
    setLang(getSavedLanguage());
  }, []);

  const t = {
    az: {
      badge: "XƏTA 404",
      title: "Səhifə Tapılmadı",
      desc: "Axtardığınız səhifə silinmiş, ünvanı dəyişdirilmiş və ya heç mövcud olmamış ola bilər.",
      backHome: "Ana Səhifə",
      goBack: "Geri Qayıt",
      exploreProjects: "Layihələri Kəşf Et",
      exploreDevs: "Developerləri Kəşf Et",
      codeComment: "// Axtarılan URL marşrut cədvəlində tapılmadı",
    },
    tr: {
      badge: "HATA 404",
      title: "Sayfa Bulunamadı",
      desc: "Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.",
      backHome: "Ana Sayfa",
      goBack: "Geri Dön",
      exploreProjects: "Projeleri Keşfet",
      exploreDevs: "Geliştiricileri Keşfet",
      codeComment: "// Aranan URL yönlendirme tablosunda bulunamadı",
    },
    en: {
      badge: "ERROR 404",
      title: "Page Not Found",
      desc: "The page you are looking for might have been removed, renamed, or is temporarily unavailable.",
      backHome: "Home Page",
      goBack: "Go Back",
      exploreProjects: "Explore Projects",
      exploreDevs: "Explore Developers",
      codeComment: "// Requested route was not found in routing table",
    },
  }[lang];

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* TOP GLOWING BADGE & 404 NUMBER */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl rounded-full" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              {t.badge}
            </span>
            <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 select-none">
              404
            </h1>
          </div>
        </div>

        {/* CODE BLOCK AESTHETIC */}
        <div className="text-left max-w-md mx-auto p-4 rounded-xl bg-gray-900 text-gray-200 border border-gray-800 font-mono text-xs shadow-xl">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-800 mb-2 text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>deloop-router.ts</span>
          </div>
          <p className="text-gray-500">{t.codeComment}</p>
          <p className="mt-1">
            <span className="text-rose-400">throw</span>{" "}
            <span className="text-amber-300">new</span>{" "}
            <span className="text-blue-300">NotFoundError</span>(
            <span className="text-emerald-300">&quot;404: Route not resolved&quot;</span>);
          </p>
        </div>

        {/* TEXT CONTENT */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.desc}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.goBack}</span>
          </button>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{t.backHome}</span>
          </Link>
        </div>

        {/* HELPFUL QUICK LINKS */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{t.exploreProjects}</span>
          </Link>
          <span>•</span>
          <Link
            href="/developers"
            className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.exploreDevs}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

