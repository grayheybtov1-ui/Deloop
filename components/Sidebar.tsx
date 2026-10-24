"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderGit2,
  Compass,
  LayoutDashboard,
  PlusCircle,
  Bell,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  X,
  Terminal,
} from "lucide-react";
import { Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { getSavedLanguage, Language } from "@/lib/i18n";
import { DeloopLogo } from "@/components/DeloopLogo";

interface SidebarProps {
  user?: Profile | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user: propUser, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(propUser || null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [lang, setLang] = useState<Language>("tr");

  useEffect(() => {
    const user = propUser || localStore.getCurrentUser();
    setCurrentUser(user);

    const notifs = localStore.getNotifications();
    setUnreadNotifs(notifs.filter((n) => !n.is_read).length);

    if (user) {
      const msgs = localStore.getMessages();
      setUnreadMsgs(msgs.filter((m) => m.receiver_id === user.id && !m.is_read).length);
    }

    setLang(getSavedLanguage());
    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, [propUser, pathname]);

  const handleLogout = () => {
    localStore.logout();
    setCurrentUser(null);
    if (onClose) onClose();
    router.push("/login");
  };

  const navSections = [
    {
      title: lang === "az" ? "Platforma" : lang === "en" ? "Platform" : "Platform",
      items: [
        { href: "/projects", label: lang === "az" ? "Ana Axın" : lang === "en" ? "Feed" : "Ana Akış", icon: FolderGit2, badge: null },
        { href: "/developers", label: lang === "az" ? "Developerlər" : lang === "en" ? "Developers" : "Geliştiriciler", icon: Compass, badge: null },
        { href: "/dashboard", label: lang === "az" ? "İdarəetmə" : lang === "en" ? "Dashboard" : "Dashboard", icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: lang === "az" ? "Yaradıcılıq" : lang === "en" ? "Create" : "Üretim",
      items: [
        { href: "/projects/new", label: lang === "az" ? "Yeni Layihə" : lang === "en" ? "New Project" : "Yeni Proje", icon: PlusCircle, highlight: true, badge: null },
        { href: "/messages", label: lang === "az" ? "Mesajlar" : lang === "en" ? "Messages" : "Mesajlar", icon: MessageSquare, badge: unreadMsgs > 0 ? unreadMsgs : null },
        { href: "/notifications", label: lang === "az" ? "Bildirişlər" : lang === "en" ? "Notifications" : "Bildirimler", icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : null },
      ],
    },
    {
      title: lang === "az" ? "Hesab" : lang === "en" ? "Account" : "Hesap",
      items: [
        ...(currentUser ? [{ href: `/developers/${currentUser.username}`, label: lang === "az" ? "Profilim" : lang === "en" ? "My Profile" : "Profilim", icon: User, badge: null }] : []),
        { href: "/settings", label: lang === "az" ? "Ayarlar" : lang === "en" ? "Settings" : "Ayarlar", icon: Settings, badge: null },
        ...(currentUser?.role === "admin" ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck, isAdmin: true, badge: null }] : []),
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-5">
        {/* MOBILE HEADER */}
        {isOpen && (
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <Link href="/projects" onClick={onClose} className="flex items-center gap-2 no-underline">
              <DeloopLogo variant="app" size="sm" showText={true} />
            </Link>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* NAV LINKS */}
        <nav className="space-y-4">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-0.5">
              <div className="px-3 mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/projects" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? (item as any).isAdmin
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                        : (item as any).isAdmin
                        ? "text-amber-600 hover:bg-amber-50"
                        : (item as any).highlight
                        ? "text-blue-600 hover:bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${
                        isActive
                          ? (item as any).isAdmin ? "text-amber-600" : "text-blue-600"
                          : (item as any).isAdmin ? "text-amber-500"
                          : (item as any).highlight ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* USER CARD */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        {currentUser ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
            <Link href={`/developers/${currentUser.username}`} onClick={() => onClose && onClose()} className="flex items-center gap-2.5 min-w-0 no-underline">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random&size=80`}
                  alt={currentUser.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.full_name}</p>
                <p className="text-[11px] text-gray-500 truncate">@{currentUser.username}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Çıxış">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" onClick={() => onClose && onClose()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all text-center">
            <span>Daxil Ol</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 z-30 bg-white border-r border-gray-200 flex-col p-4 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={onClose}>
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 p-4 z-50 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
