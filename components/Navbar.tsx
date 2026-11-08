"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Send,
  User as UserIcon,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

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
    const handleUserUpdated = () => {
      const updated = localStore.getCurrentUser();
      setUser(updated);
    };
    const handleNotifsUpdated = () => {
      const notifs = localStore.getNotifications();
      setUnreadNotifs(notifs.filter((n) => !n.is_read).length);
    };
    window.addEventListener("deloop_lang_changed", handleLangChange);
    window.addEventListener("deloop_user_updated", handleUserUpdated);
    window.addEventListener("deloop_notifications_updated", handleNotifsUpdated);
    return () => {
      window.removeEventListener("deloop_lang_changed", handleLangChange);
      window.removeEventListener("deloop_user_updated", handleUserUpdated);
      window.removeEventListener("deloop_notifications_updated", handleNotifsUpdated);
    };
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#0b0f17] border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">

        {/* LEFT: BRAND LOGO ONLY ON MOBILE */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/projects" className="flex items-center gap-2.5 no-underline group select-none">
            <DeloopLogo variant="app" size="md" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Deloop
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hidden sm:inline-block">
                DEV
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: SEARCH (Desktop only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("deloop_open_search"))}
            className="relative w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-between transition-all group hover:border-gray-300 dark:hover:border-neutral-700"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs text-gray-500 dark:text-neutral-400 truncate">
              {lang === "tr"
                ? "Proje veya geliştirici ara..."
                : lang === "az"
                ? "Layihə və ya developer axtar..."
                : "Search projects or devs..."}
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-neutral-800 border border-gray-300/60 dark:border-neutral-700 text-[10px] font-mono text-gray-500 dark:text-neutral-400">
              <span>Ctrl K</span>
            </div>
          </button>
        </div>

        {/* RIGHT: ACTIONS (On mobile: ONLY DM and Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* NEW PROJECT BUTTON (Desktop only) */}
          <Link
            href="/projects/new"
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === "az" ? "Yeni Layihə" : lang === "en" ? "New Project" : "Yeni Proje"}</span>
          </Link>

          {/* NOTIFICATIONS (Desktop only, mobile has it in bottom nav) */}
          <Link
            href="/notifications"
            title={t.nav.notifications}
            className={`hidden md:flex relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all ${
              pathname.startsWith("/notifications") ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : ""
            }`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </Link>

          {/* MESSAGES (DM) - Always visible: on mobile & desktop */}
          <Link
            href="/messages"
            title={t.nav.messages}
            className={`relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all ${
              pathname.startsWith("/messages") ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : ""
            }`}
          >
            <Send className="w-[18px] h-[18px]" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadMessages}
              </span>
            )}
          </Link>

          {/* USER PROFILE - Always visible: on mobile & desktop */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/40 transition-all"
                aria-label="User menu"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-neutral-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121824] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-gray-100 dark:border-neutral-800 mb-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 truncate">@{user.username}</p>
                    {user.role === "admin" && (
                      <span className="inline-block mt-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <Link
                      href={`/developers/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>{t.nav.profile}</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>{t.nav.settings}</span>
                    </Link>
                  </div>

                  <div className="pt-1 mt-1 border-t border-gray-100 dark:border-neutral-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
