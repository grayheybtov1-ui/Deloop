"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User as UserIcon,
  LogOut,
  Send,
  Compass,
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile } from "@/types";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);
  const [lang, setLang] = useState<Language>("tr");
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setUser(curr);
    const notifs = localStore.getNotifications();
    setUnread(notifs.filter((n) => !n.is_read).length);
    setLang(getSavedLanguage());

    const handleLangChange = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLangChange);
    return () => window.removeEventListener("deloop_lang_changed", handleLangChange);
  }, [pathname]);

  const t = translations[lang] || translations.tr;

  const handleLogout = () => {
    localStore.logout();
    setUser(null);
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/developers?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Mobile bottom nav items
  const mobileNavItems = [
    { href: "/projects", icon: Home, label: t.nav.home },
    { href: "/developers", icon: Compass, label: t.nav.explore },
    { href: "/projects/new", icon: PlusSquare, label: t.nav.newPost },
    { href: "/notifications", icon: Heart, label: t.nav.notifications, badge: unread },
    {
      href: user ? `/developers/${user.username}` : "/login",
      icon: UserIcon,
      label: t.nav.profile,
      isAvatar: true,
    },
  ];

  return (
    <>
      {/* ==========================================
          TOP HEADER — Seamless with body background
          ========================================== */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-colors"
        style={{
          backgroundColor: "var(--bg-main)",
          borderBottom: "1px solid var(--border-color)",
          height: "60px",
        }}
      >
        <div
          className="h-full flex items-center justify-between px-4"
          style={{ maxWidth: "935px", margin: "0 auto" }}
        >
          {/* LOGO WITH THIN WHITE "Deloop" TEXT */}
          <Link
            href="/projects"
            className="flex items-center gap-2.5 no-underline group"
            style={{ textDecoration: "none" }}
          >
            {/* Minimalist Logo Badge */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 text-white text-sm font-semibold tracking-tight shadow-sm group-hover:border-neutral-500 transition-colors">
              <span className="font-mono text-blue-400">D</span>
            </div>
            {/* Nazik ağ şriftlə "Deloop" */}
            <span className="font-light text-white text-xl tracking-wider hidden sm:block">
              Deloop
            </span>
          </Link>

          {/* DESKTOP CENTER — Clean, refined search bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder={t.nav.searchPlaceholder}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-xl text-xs sm:text-sm outline-none transition-all placeholder:text-neutral-500"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </form>
          </div>

          {/* DESKTOP RIGHT — Nav Icons */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/projects", icon: Home, label: t.nav.home },
              { href: "/developers", icon: Compass, label: t.nav.explore },
              { href: "/projects/new", icon: PlusSquare, label: t.nav.newPost },
              { href: "/notifications", icon: Heart, label: t.nav.notifications, badge: unread },
              { href: "/messages", icon: Send, label: t.nav.messages },
            ].map(({ href, icon: Icon, label, badge }) => {
              const isActive = pathname === href || (href !== "/projects" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className="relative p-2.5 rounded-lg transition-colors hover:opacity-80"
                  style={{
                    color: isActive ? "var(--text-main)" : "var(--text-muted)",
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    fill={isActive ? "var(--text-main)" : "none"}
                    strokeWidth={isActive ? 2.3 : 1.6}
                  />
                  {badge && badge > 0 ? (
                    <span
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: "#ed4956" }}
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            {/* USER AVATAR or LOGIN */}
            {user ? (
              <div className="flex items-center gap-1.5 ml-1.5">
                <Link href={`/developers/${user.username}`} className="p-1" title={t.nav.profile}>
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                    alt={user.full_name}
                    className="w-7 h-7 rounded-full object-cover transition-all"
                    style={{
                      border: pathname.includes(user.username) ? "2px solid var(--text-main)" : "1px solid var(--border-color)",
                    }}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-all hidden lg:block hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                  title={t.nav.logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all bg-blue-600 hover:bg-blue-500 shadow-sm"
              >
                {t.nav.login}
              </Link>
            )}
          </nav>

          {/* MOBILE RIGHT — DM icon + Avatar */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/messages" className="p-1.5" style={{ color: "var(--text-main)" }}>
              <Send className="w-6 h-6" />
            </Link>
            {user && (
              <Link href={`/developers/${user.username}`} className="p-1">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover"
                  style={{ border: "1px solid var(--border-color)" }}
                />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          BOTTOM NAV — Mobile
          ========================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors"
        style={{
          backgroundColor: "var(--bg-main)",
          borderTop: "1px solid var(--border-color)",
          height: "49px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="h-full flex items-center justify-around px-2">
          {mobileNavItems.map(({ href, icon: Icon, label, badge, isAvatar }) => {
            const isActive =
              pathname === href ||
              (href !== "/projects" && href.length > 1 && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className="relative flex items-center justify-center w-12 h-full"
                style={{ color: isActive ? "var(--text-main)" : "var(--text-muted)" }}
              >
                {isAvatar && user ? (
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                    alt={label}
                    className="w-[26px] h-[26px] rounded-full object-cover"
                    style={{
                      border: isActive ? "2px solid var(--text-main)" : "1px solid var(--border-color)",
                    }}
                  />
                ) : (
                  <Icon
                    className="w-[26px] h-[26px]"
                    fill={isActive ? "var(--text-main)" : "none"}
                    strokeWidth={isActive ? 2.3 : 1.6}
                  />
                )}
                {badge && badge > 0 ? (
                  <span
                    className="absolute top-2 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: "#ed4956" }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
