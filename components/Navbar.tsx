"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  Heart,
  Bell, 
  User as UserIcon, 
  LogOut, 
  Terminal,
  Compass,
  Send
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setUser(curr);
    const notifs = localStore.getNotifications();
    setUnreadNotifications(notifs.filter((n) => !n.is_read).length);
  }, [pathname]);

  const handleLogout = () => {
    localStore.logout();
    setUser(null);
    router.push("/");
  };

  const navLinks = [
    { href: "/projects", label: "Feed", icon: Home },
    { href: "/developers", label: "Kəşf Et", icon: Search },
    { href: "/projects/new", label: "Post Paylaş", icon: PlusSquare },
    { href: "/notifications", label: "Bildirişlər", icon: Heart, badge: unreadNotifications },
  ];

  if (user) {
    navLinks.push({ href: `/developers/${user.username}`, label: "Profil", icon: UserIcon });
  }

  return (
    <>
      {/* 1. TOP HEADER (INSTAGRAM APP TOP BAR) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/projects" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 font-sans">
              Deloop Gram
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/projects" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                  <span>{link.label}</span>

                  {link.badge && link.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE ICONS (DM & USER) */}
          <div className="flex items-center gap-2">
            {/* DIRECT MESSAGE (DM) ICON */}
            <Link
              href="/messages"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors relative"
              title="Direkt Mesajlar (DM)"
            >
              <Send className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/developers/${user.username}`}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <img
                    src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={user.full_name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors hidden sm:block"
                  title="Çıxış Et"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Daxil Ol
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* 2. MOBILE BOTTOM FIXED APP BAR (INSTAGRAM NATIVE APP BAR) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-xl px-2 py-2.5 flex items-center justify-around shadow-2xl transition-colors">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative p-2 rounded-xl transition-transform active:scale-90 ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-6 h-6" />
              {link.badge && link.badge > 0 ? (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
