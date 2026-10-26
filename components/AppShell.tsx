"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FolderGit2, Compass, PlusCircle, Bell, User as UserIcon } from "lucide-react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { localStore } from "@/lib/supabase/store";
import { supabase } from "@/lib/supabase/client";
import { dbGetProfile } from "@/lib/supabase/db";
import { Profile } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    // Sync Supabase session to local store on every route change
    const syncAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        let profile = localStore.getCurrentUser();
        if (!profile || profile.id !== data.session.user.id) {
          profile = await dbGetProfile(data.session.user.id);
          if (profile) localStore.setCurrentUser(profile);
        }
        setCurrentUser(profile);
      } else {
        // No Supabase session — check local store
        const localUser = localStore.getCurrentUser();
        setCurrentUser(localUser);
      }
      const notifs = localStore.getNotifications();
      setUnreadNotifs(notifs.filter((n) => !n.is_read).length);
      setMobileSidebarOpen(false);
    };
    syncAuth();
  }, [pathname]);

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f7fa] dark:bg-[#0b0f17] transition-colors">
        {children}
      </div>
    );
  }

  const mobileBottomNavItems = [
    { href: "/projects", icon: FolderGit2, label: "Feed" },
    { href: "/developers", icon: Compass, label: "Explore" },
    { href: "/projects/new", icon: PlusCircle, label: "New", isAction: true },
    { href: "/notifications", icon: Bell, label: "Notifs", badge: unreadNotifs },
    {
      href: currentUser ? `/developers/${currentUser.username}` : "/login",
      icon: UserIcon,
      label: "Profile",
      isAvatar: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa] dark:bg-[#0b0f17] text-gray-900 dark:text-gray-100 transition-colors">
      {/* TOP NAVBAR */}
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={mobileSidebarOpen}
      />

      {/* LEFT SIDEBAR */}
      <Sidebar
        user={currentUser}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:pl-64 pt-16 flex flex-col min-w-0 transition-all">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-10">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] bg-white dark:bg-[#0b0f17] border-t border-gray-200 dark:border-gray-800 px-2 pb-[env(safe-area-inset-bottom,0px)] flex items-center justify-around shadow-sm">
        {mobileBottomNavItems.map(({ href, icon: Icon, label, badge, isAvatar, isAction }) => {
          const isActive =
            pathname === href ||
            (href !== "/projects" && href.length > 1 && pathname.startsWith(href));

          if (isAction) {
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center justify-center -top-2 w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-2 border-white transition-transform active:scale-95"
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative flex flex-col items-center justify-center w-12 h-full text-xs transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {isAvatar && currentUser ? (
                <img
                  src={
                    currentUser.avatar_url ||
                    `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random&size=80`
                  }
                  alt={label}
                  className={`w-6 h-6 rounded-full object-cover ring-1 ${
                    isActive ? "ring-blue-500" : "ring-gray-300"
                  }`}
                />
              ) : (
                <Icon className="w-5 h-5" />
              )}

              {badge && badge > 0 ? (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
