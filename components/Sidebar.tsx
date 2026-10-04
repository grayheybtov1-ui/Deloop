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
  Github
} from "lucide-react";
import { Profile } from "@/types";

interface SidebarProps {
  user: Profile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/projects", label: "Browse Projects", icon: FolderGit2 },
    { href: "/projects/new", label: "Create Project", icon: PlusCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  if (user) {
    links.unshift({ href: `/developers/${user.username}`, label: "My Profile", icon: User });
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-Deloop-accent/15 text-Deloop-accent font-semibold border border-Deloop-accent/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-Deloop-border/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-Deloop-accent" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <div className="pt-3 mt-3 border-t border-Deloop-border space-y-1">
            <div className="px-3 py-1 text-xs font-mono font-semibold text-amber-400/80 uppercase tracking-wider">
              Admin Access
            </div>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                  : "text-amber-400/80 hover:text-amber-300 hover:bg-Deloop-border/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
