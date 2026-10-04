"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Terminal,
  Compass,
  LayoutDashboard
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
    { href: "/developers", label: "Kəşf Et", icon: Compass },
    { href: "/projects/new", label: "Post Paylaş", icon: PlusSquare },
    { href: "/messages", label: "Direkt DM", icon: MessageCircle },
    { href: "/notifications", label: "Bildirişlər", icon: Bell, badge: unreadNotifications },
  ];

  if (user) {
    navLinks.push({ href: `/developers/${user.username}`, label: "Profil", icon: UserIcon });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO (INSTAGRAM DEV STYLE) */}
        <Link href="/projects" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Deloop Gram
            </span>
          </div>
        </Link>

        {/* DESKTOP INSTAGRAM NAVIGATION */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/projects" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{link.label}</span>

                {/* UNREAD BADGE */}
                {link.badge && link.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE USER PROFILE / LOGOUT */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/developers/${user.username}`}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-900 transition-colors"
              >
                <img
                  src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <span className="hidden lg:inline text-xs font-bold text-slate-200">
                  {user.full_name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors"
                title="Çıxış Et"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md"
            >
              Daxil Ol
            </Link>
          )}
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (INSTAGRAM APP BOTTOM NAVIGATION) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-4 py-2 flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative p-2.5 rounded-xl transition-colors ${
                isActive ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-slate-200"
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
    </header>
  );
}
