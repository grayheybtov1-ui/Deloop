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
  Film,
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setUser(curr);
    const notifs = localStore.getNotifications();
    setUnread(notifs.filter((n) => !n.is_read).length);
  }, [pathname]);

  const handleLogout = () => {
    localStore.logout();
    setUser(null);
    router.push("/login");
  };

  // Instagram bottom nav items (mobile)
  const mobileNavItems = [
    { href: "/projects", icon: Home, label: "Ana Səhifə" },
    { href: "/developers", icon: Search, label: "Kəşf Et" },
    { href: "/projects/new", icon: PlusSquare, label: "Yeni Post" },
    { href: "/notifications", icon: Heart, label: "Bildirişlər", badge: unread },
    {
      href: user ? `/developers/${user.username}` : "/login",
      icon: UserIcon,
      label: "Profil",
      isAvatar: true,
    },
  ];

  return (
    <>
      {/* ==========================================
          TOP HEADER — Instagram Web Style
          ========================================== */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
          height: "60px",
        }}
      >
        <div
          className="h-full flex items-center justify-between px-4"
          style={{ maxWidth: "935px", margin: "0 auto" }}
        >
          {/* LOGO */}
          <Link
            href="/projects"
            className="flex items-center gap-2 no-underline"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white text-sm font-black"
              style={{
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              D
            </div>
            <span
              className="font-black text-lg tracking-tight hidden sm:block"
              style={{
                background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Deloop Gram
            </span>
          </Link>

          {/* DESKTOP CENTER — Search (Instagram style) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <div
              className="relative w-full"
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Axtar"
                className="w-full py-2 pl-10 pr-4 rounded-lg text-sm outline-none border-0"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-main)",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.backgroundColor = "var(--bg-subtle)";
                }}
              />
            </div>
          </div>

          {/* DESKTOP RIGHT — Nav Icons */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/projects", icon: Home, label: "Ana Səhifə" },
              { href: "/projects/new", icon: PlusSquare, label: "Yeni Post" },
              { href: "/notifications", icon: Heart, label: "Bildirişlər", badge: unread },
              { href: "/messages", icon: Send, label: "Mesajlar" },
            ].map(({ href, icon: Icon, label, badge }) => {
              const isActive = pathname === href || (href !== "/projects" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className="relative p-2.5 rounded-lg transition-all"
                  style={{
                    color: isActive ? "var(--text-main)" : "var(--text-muted)",
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    fill={isActive ? "var(--text-main)" : "none"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {badge && badge > 0 ? (
                    <span
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
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
              <div className="flex items-center gap-1 ml-1">
                <Link href={`/developers/${user.username}`} className="p-1">
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random&size=80`}
                    alt={user.full_name}
                    className="w-7 h-7 rounded-full object-cover"
                    style={{
                      border: pathname.includes(user.username) ? "2px solid var(--text-main)" : "1px solid var(--border-color)",
                    }}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-all hidden lg:block"
                  style={{ color: "var(--text-muted)" }}
                  title="Çıxış"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Daxil Ol
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
          BOTTOM NAV — Instagram Mobile App Style
          ========================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "var(--nav-bg)",
          borderTop: "1px solid var(--nav-border)",
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
                    strokeWidth={isActive ? 2.5 : 1.5}
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
