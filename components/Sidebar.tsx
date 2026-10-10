"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderGit2, 
  PlusCircle, 
  Bell, 
  Settings, 
  ShieldCheck, 
  User,
} from "lucide-react";
import { Profile } from "@/types";
import { getSavedLanguage, Language } from "@/lib/i18n";

interface SidebarProps {
  user: Profile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const lang: Language = getSavedLanguage();

  const links = [
    { href: "/projects", label: lang === "tr" ? "Ana Akış" : "Ana Axın", icon: FolderGit2 },
    { href: "/projects/new", label: lang === "tr" ? "Yeni Gönderi" : "Yeni Post", icon: PlusCircle },
    { href: "/notifications", label: lang === "tr" ? "Bildirimler" : "Bildirişlər", icon: Bell },
    { href: "/settings", label: lang === "tr" ? "Ayarlar" : "Ayarlar", icon: Settings },
  ];

  if (user) {
    links.unshift({ href: `/developers/${user.username}`, label: lang === "tr" ? "Profilim" : "Profilim", icon: User });
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          {lang === "tr" ? "Menü" : "Menyu"}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-neutral-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <div className="pt-2 mt-2 border-t border-neutral-800 space-y-1">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-amber-500/15 text-amber-400 font-semibold"
                  : "text-amber-400/80 hover:text-amber-300 hover:bg-neutral-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
