"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, UserPlus, Heart, MessageSquare } from "lucide-react";
import { Notification, Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { dbGetNotifications, dbMarkNotificationRead, dbMarkAllNotificationsRead } from "@/lib/supabase/db";
import { supabase } from "@/lib/supabase/client";
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

    async function fetchNotifs() {
      try {
        const data = await dbGetNotifications();
        if (data.length > 0) {
          setNotifications(data);
        } else {
          setNotifications(localStore.getNotifications());
        }
      } catch {
        setNotifications(localStore.getNotifications());
      }
    }
    fetchNotifs();

    // Listen to local notifications update events (instant)
    const handleLocalNotifs = () => {
      fetchNotifs();
    };
    window.addEventListener("deloop_notifications_updated", handleLocalNotifs);

    // Supabase Realtime channel for live notifications
    const channel = supabase
      .channel(`notifications_user_${curr.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${curr.id}`,
        },
        () => {
          fetchNotifs();
        }
      )
      .subscribe();

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => {
      window.removeEventListener("deloop_lang_changed", handleLang);
      window.removeEventListener("deloop_notifications_updated", handleLocalNotifs);
      supabase.removeChannel(channel);
    };
  }, [router]);

  const t = translations[lang] || translations.tr;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await dbMarkAllNotificationsRead();
      localStore.markAllNotificationsAsRead();
    } catch {
      localStore.markAllNotificationsAsRead();
    }
    showToast(t.notifications.markAllRead, undefined, "info");
  };

  const handleNotificationClick = async (notif: Notification) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    try {
      await dbMarkNotificationRead(notif.id);
      localStore.markNotificationAsRead(notif.id);
    } catch {
      localStore.markNotificationAsRead(notif.id);
    }

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
      
      {/* HEADER — Clean and Balanced for both Light & Dark modes */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <span>{t.notifications.title}</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                {unreadCount} {t.notifications.newBadge}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            {t.notifications.subtitle}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{t.notifications.markAllRead}</span>
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="divide-y divide-gray-100 dark:divide-neutral-800/80 rounded-2xl border border-gray-200 dark:border-neutral-800/60 overflow-hidden bg-white dark:bg-neutral-950/40 shadow-xs">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-neutral-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-600" />
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
                  notif.is_read
                    ? "hover:bg-gray-50/80 dark:hover:bg-neutral-900/40"
                    : "bg-blue-50/40 dark:bg-neutral-900/60 hover:bg-blue-50/70 dark:hover:bg-neutral-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* ACTOR AVATAR */}
                  <div className="relative shrink-0">
                    <img
                      src={actor?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                      alt={actor?.full_name || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-800"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-black">
                      {notif.type === "follow" && (
                        <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                          <UserPlus className="w-3 h-3" />
                        </div>
                      )}
                      {notif.type === "like" && (
                        <div className="p-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                          <Heart className="w-3 h-3 fill-red-500 dark:fill-red-400" />
                        </div>
                      )}
                      {notif.type === "comment" && (
                        <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                          <MessageSquare className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NOTIFICATION CONTENT */}
                  <div className="text-xs sm:text-sm text-gray-800 dark:text-neutral-200">
                    <span className="font-semibold text-gray-900 dark:text-white mr-1">
                      {actor?.full_name || "Bir istifadəçi"}
                    </span>
                    {notif.type === "follow" && (
                      <span className="text-gray-500 dark:text-neutral-400">{t.notifications.followedYou}</span>
                    )}
                    {notif.type === "like" && (
                      <>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">"{notif.project?.title || "Layihə"}"</span>{" "}
                        <span className="text-gray-500 dark:text-neutral-400">{t.notifications.likedYourProject}</span>
                      </>
                    )}
                    {notif.type === "comment" && (
                      <>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">"{notif.project?.title || "Layihə"}"</span>{" "}
                        <span className="text-gray-500 dark:text-neutral-400">{t.notifications.commentedOnYourProject}</span>
                      </>
                    )}
                    <div className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
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
