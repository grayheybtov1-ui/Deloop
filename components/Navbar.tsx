"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Terminal, 
  Users, 
  FolderGit2, 
  LayoutDashboard, 
  Bell, 
  Plus, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile } from "@/types";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/developers", label: "Developers", icon: Users },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-Deloop-border bg-Deloop-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-Deloop-accent/15 border border-Deloop-accent/40 flex items-center justify-center text-Deloop-accent group-hover:bg-Deloop-accent group-hover:text-white transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1">
              Deloop <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">v1.0</span>
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-Deloop-border text-slate-100 border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/projects/new"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </Link>

              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-Deloop-card transition-colors border border-transparent hover:border-Deloop-border"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-Deloop-bg" />
                )}
              </Link>

              {/* USER DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-Deloop-card border border-transparent hover:border-Deloop-border transition-colors text-left"
                >
                  <img
                    src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-Deloop-border"
                  />
                  <div className="hidden lg:flex flex-col text-xs leading-tight">
                    <span className="font-semibold text-slate-200">{user.full_name}</span>
                    <span className="text-slate-400 font-mono">@{user.username}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-Deloop-card border border-Deloop-border rounded-xl shadow-xl py-1 z-50 text-sm"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-Deloop-border">
                      <p className="font-semibold text-slate-100">{user.full_name}</p>
                      <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                    </div>

                    <Link
                      href={`/developers/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-Deloop-border hover:text-slate-100"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      View Profile
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-Deloop-border hover:text-slate-100"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-Deloop-border hover:text-slate-100"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-amber-400 hover:bg-Deloop-border"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-Deloop-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-Deloop-card transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-Deloop-border bg-Deloop-bg px-4 py-5 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                    isActive
                      ? "bg-Deloop-accent/15 text-Deloop-accent border border-Deloop-accent/30"
                      : "text-slate-300 hover:bg-Deloop-card"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-Deloop-border pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">{user.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                  </div>
                </div>

                <Link
                  href="/projects/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-Deloop-accent text-white font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/developers/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-Deloop-border text-slate-300 text-sm"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-Deloop-border text-slate-300 text-sm"
                  >
                    Settings
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-900/40 text-red-400 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl border border-Deloop-border text-slate-200 font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl bg-Deloop-accent text-white font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
