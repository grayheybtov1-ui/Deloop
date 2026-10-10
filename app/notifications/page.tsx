"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, UserPlus, Heart, MessageSquare } from "lucide-react";
import { Notification, Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "@/components/Toast";
import { timeAgo } from "@/lib/utils";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

export default function NotificationsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lang, setLang] = useState<Language>("tr");

  useEffect(() => {
    setLang(getSavedLanguage());
    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    setUser(curr);
    setNotifications(localStore.getNotifications());

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, [router]);

  const t = translations[lang] || translations.tr;

  const handleMarkAllRead = () => {
    localStore.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast(t.notifications.markAllRead, undefined, "info");
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
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-20 pt-2 px-2 sm:px-4">
      
      {/* HEADER — Seamless & Clean */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <span>{t.notifications.title}</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {unreadCount} {t.notifications.newBadge}
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {t.notifications.subtitle}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.notifications.markAllRead}</span>
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="divide-y divide-neutral-800/80 rounded-2xl border border-neutral-800/60 overflow-hidden bg-neutral-950/40">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-neutral-600" />
            <p>{t.notifications.empty}</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const actor = notif.actor;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  notif.is_read ? "hover:bg-neutral-900/40" : "bg-neutral-900/60 hover:bg-neutral-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* ACTOR AVATAR */}
                  <div className="relative shrink-0">
                    <img
                      src={actor?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                      alt={actor?.full_name || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-black">
                      {notif.type === "follow" && (
                        <div className="p-1 rounded-full bg-purple-500/20 text-purple-400">
                          <UserPlus className="w-3 h-3" />
                        </div>
                      )}
                      {notif.type === "like" && (
                        <div className="p-1 rounded-full bg-red-500/20 text-red-400">
                          <Heart className="w-3 h-3 fill-red-400" />
                        </div>
                      )}
                      {notif.type === "comment" && (
                        <div className="p-1 rounded-full bg-blue-500/20 text-blue-400">
                          <MessageSquare className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NOTIFICATION CONTENT */}
                  <div className="text-xs sm:text-sm text-neutral-200">
                    <span className="font-semibold text-white mr-1">
                      {actor?.full_name || "Bir geliştirici"}
                    </span>
                    {notif.type === "follow" && (
                      <span className="text-neutral-400">{t.notifications.followedYou}</span>
                    )}
                    {notif.type === "like" && (
                      <>
                        <span className="text-blue-400 font-medium">"{notif.project?.title || "Proje"}"</span>{" "}
                        <span className="text-neutral-400">{t.notifications.likedYourProject}</span>
                      </>
                    )}
                    {notif.type === "comment" && (
                      <>
                        <span className="text-blue-400 font-medium">"{notif.project?.title || "Proje"}"</span>{" "}
                        <span className="text-neutral-400">{t.notifications.commentedOnYourProject}</span>
                      </>
                    )}
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {timeAgo(notif.created_at)}
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
