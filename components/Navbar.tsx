"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Plus,
  Bell,
  Send,
  User as UserIcon,
  LogOut,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  ChevronDown,
  Terminal,
  Sun,
  Moon,
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { dbSignOut } from "@/lib/supabase/db";
import { Profile } from "@/types";
import { getSavedLanguage, setSavedLanguage, translations, Language } from "@/lib/i18n";
import { DeloopLogo } from "@/components/DeloopLogo";

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function Navbar({ onToggleMobileSidebar, isMobileSidebarOpen }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [lang, setLang] = useState<Language>("tr");
  const [searchVal, setSearchVal] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDarkMode = typeof document !== "undefined" && (
      document.documentElement.classList.contains("dark") || 
      localStorage.getItem("deloop_theme") === "dark"
    );
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("deloop_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("deloop_theme", "light");
    }
    window.dispatchEvent(new Event("deloop_theme_changed"));
  };

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setUser(curr);

    const notifs = localStore.getNotifications();
    setUnreadNotifs(notifs.filter((n) => !n.is_read).length);

    const msgs = localStore.getMessages();
    if (curr) {
      setUnreadMessages(msgs.filter((m) => m.receiver_id === curr.id && !m.is_read).length);
    }

    setLang(getSavedLanguage());
    const handleLangChange = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLangChange);
    return () => window.removeEventListener("deloop_lang_changed", handleLangChange);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = translations[lang] || translations.tr;

  const handleLogout = async () => {
    try {
      await dbSignOut();
    } catch (e) { /* ignore */ }
    localStore.logout();
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/developers?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  };

  const handleLanguageSelect = (newLang: Language) => {
    setSavedLanguage(newLang);
    setLang(newLang);
    setLangDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#0b0f17] border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">

        {/* LEFT: MOBILE TOGGLE & BRAND */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/projects" className="flex items-center gap-2.5 no-underline group select-none">
            <DeloopLogo variant="app" size="md" />
            <div className="flex items-baseline gap-1.5">
              <span className="max-[400px]:hidden font-extrabold text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Deloop
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hidden sm:inline-block">
                DEV
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: SEARCH */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder || "Layihə və ya developer axtar..."}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg text-sm bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </form>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">

          {/* NEW PROJECT BUTTON */}
          <Link
            href="/projects/new"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === "az" ? "Yeni Layihə" : lang === "en" ? "New Project" : "Yeni Proje"}</span>
          </Link>

          {/* MESSAGES */}
          <Link
            href="/messages"
            title={t.nav.messages}
            className={`relative p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${
              pathname.startsWith("/messages") ? "bg-blue-50 text-blue-600" : ""
            }`}
          >
            <Send className="w-[18px] h-[18px]" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Link>

          {/* NOTIFICATIONS */}
          <Link
            href="/notifications"
            title={t.nav.notifications}
            className={`relative p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${
              pathname.startsWith("/notifications") ? "bg-blue-50 text-blue-600" : ""
            }`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </Link>

          {/* THEME TOGGLE (LIGHT / DARK) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-amber-300 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
            title={isDark ? "Açıq Rejim (Light Mode)" : "Tünd Rejim (Dark Mode)"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* LANGUAGE */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{lang}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50 text-xs">
                {[
                  { code: "az", label: "Azərbaycan" },
                  { code: "tr", label: "Türkçe" },
                  { code: "en", label: "English" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleLanguageSelect(item.code as Language)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${
                      lang === item.code
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[10px] uppercase text-gray-400">{item.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* USER */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                  <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] font-mono text-gray-500 truncate">@{user.username}</p>
                    {user.role === "admin" && (
                      <span className="inline-block mt-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <Link href={`/developers/${user.username}`} onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>{t.nav.profile}</span>
                    </Link>

                    <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link href="/settings" onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>{t.nav.settings}</span>
                    </Link>
                  </div>

                  <div className="pt-1 mt-1 border-t border-gray-100">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left">
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all">
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
