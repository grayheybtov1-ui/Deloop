"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, UserPlus, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { Notification, Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    setUser(curr);
    setNotifications(localStore.getNotifications());
  }, [router]);

  const handleMarkAllRead = () => {
    localStore.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast("Notifications", "All notifications marked as read.", "info");
  };

  const handleNotificationClick = (notif: Notification) => {
    localStore.markNotificationAsRead(notif.id);
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));

    if (notif.type === "follow" && notif.actor) {
      router.push(`/developers/${notif.actor.username}`);
    } else if (notif.project_id) {
      router.push(`/projects/${notif.project_id}`);
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar user={user} />

      <div className="flex-1 space-y-6">
        
        {/* HEADER */}
        <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-6 h-6 text-Deloop-accent" />
              <span>Activity Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Track likes, comments, and new followers on your Deloop profile
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-Deloop-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="bg-Deloop-card border border-Deloop-border rounded-xl overflow-hidden divide-y divide-Deloop-border">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-600" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const actor = notif.actor;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                    notif.is_read ? "bg-Deloop-card hover:bg-slate-900/50" : "bg-blue-950/20 hover:bg-blue-950/30"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    
                    {/* TYPE ICON */}
                    <div className="mt-1 shrink-0">
                      {notif.type === "follow" && (
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          <UserPlus className="w-4 h-4" />
                        </div>
                      )}
                      {notif.type === "like" && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                          <Heart className="w-4 h-4 fill-red-400" />
                        </div>
                      )}
                      {notif.type === "comment" && (
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-0.5">
                      <div className="text-xs text-slate-200">
                        <strong className="text-slate-100">{actor?.full_name || "A developer"}</strong>{" "}
                        {notif.type === "follow" && "started following your profile."}
                        {notif.type === "like" && (
                          <>
                            liked your project <strong className="text-blue-400">"{notif.project?.title || "Project"}"</strong>
                          </>
                        )}
                        {notif.type === "comment" && (
                          <>
                            commented on <strong className="text-blue-400">"{notif.project?.title || "Project"}"</strong>
                          </>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-500 block">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
