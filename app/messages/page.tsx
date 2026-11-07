"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  Search, 
  MessageSquare, 
  CheckCheck,
  ArrowLeft,
  ExternalLink,
  Circle
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { supabase } from "@/lib/supabase/client";
import { 
  dbGetAllProfiles, 
  dbGetMessagesBetween, 
  dbSendMessage, 
  dbMarkMessagesAsRead,
  mapMessage 
} from "@/lib/supabase/db";
import { Profile, Message } from "@/types";
import { useToast } from "@/components/Toast";
import { timeAgo, formatLastSeen } from "@/lib/utils";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const [isOtherOnline, setIsOtherOnline] = useState<boolean>(false);
  const [otherLastSeen, setOtherLastSeen] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>("tr");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);

    async function loadData() {
      try {
        const pool = await dbGetAllProfiles();
        const validProfiles = (pool.length > 0 ? pool : localStore.getProfiles()).filter((p) => p.id !== curr?.id);
        setProfiles(validProfiles);
        if (targetUserId) {
          const target = validProfiles.find((p) => p.id === targetUserId);
          if (target) setSelectedUser(target);
          else if (validProfiles.length > 0) setSelectedUser(validProfiles[0]);
        } else if (validProfiles.length > 0) {
          setSelectedUser(validProfiles[0]);
        }
      } catch {
        const allProfiles = localStore.getProfiles().filter((p) => p.id !== curr?.id);
        setProfiles(allProfiles);
        if (allProfiles.length > 0) setSelectedUser(allProfiles[0]);
      }
    }
    loadData();

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, [targetUserId]);

  // FETCH MESSAGES & SETUP REAL-TIME WEBSOCKET SUBSCRIPTION
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const u1 = currentUser.id;
    const u2 = selectedUser.id;
    const roomId = [u1, u2].sort().join("_");
    const lastSeenStorageKey = `deloop_last_seen_${u2}`;

    // 0. Load cached last-seen timestamp
    const cachedLastSeen = typeof window !== "undefined" ? localStorage.getItem(lastSeenStorageKey) : null;
    setOtherLastSeen(cachedLastSeen || selectedUser.created_at || null);
    setIsOtherOnline(false);

    // 1. Initial chat fetch
    async function fetchChat() {
      try {
        const chatHistory = await dbGetMessagesBetween(u2);
        if (chatHistory.length > 0) {
          setMessages(chatHistory);
        } else {
          setMessages(localStore.getMessagesBetween(u1, u2));
        }
        dbMarkMessagesAsRead(u2).catch(() => null);
      } catch {
        setMessages(localStore.getMessagesBetween(u1, u2));
      }
    }
    fetchChat();

    // 2. Realtime WebSocket Channel (Broadcast + Presence + Postgres Changes)
    if (activeChannelRef.current) {
      supabase.removeChannel(activeChannelRef.current);
    }

    const channel = supabase.channel(`deloop_chat_${roomId}`, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: currentUser.id },
      },
    });

    // Track presence changes (Online / Offline status)
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const isOnline = Object.keys(state).includes(u2);
        setIsOtherOnline(isOnline);
        if (isOnline) {
          const now = new Date().toISOString();
          setOtherLastSeen(now);
          if (typeof window !== "undefined") {
            localStorage.setItem(lastSeenStorageKey, now);
          }
        }
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key === u2) {
          const now = new Date().toISOString();
          setIsOtherOnline(true);
          setOtherLastSeen(now);
          if (typeof window !== "undefined") {
            localStorage.setItem(lastSeenStorageKey, now);
          }
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === u2) {
          const now = new Date().toISOString();
          setIsOtherOnline(false);
          setOtherLastSeen(now);
          if (typeof window !== "undefined") {
            localStorage.setItem(lastSeenStorageKey, now);
          }
        }
      });

    // Listen to real-time peer broadcast (instant sub-50ms message delivery)
    channel.on("broadcast", { event: "new_message" }, ({ payload }) => {
      if (payload && payload.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        setIsOtherTyping(false);
        setIsOtherOnline(true);
        const now = new Date().toISOString();
        setOtherLastSeen(now);
        if (typeof window !== "undefined") {
          localStorage.setItem(lastSeenStorageKey, now);
        }
        dbMarkMessagesAsRead(u2).catch(() => null);
      }
    });

    // Listen to typing indicator
    channel.on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload?.userId === u2) {
        setIsOtherTyping(true);
        setIsOtherOnline(true);
        const now = new Date().toISOString();
        setOtherLastSeen(now);
        if (typeof window !== "undefined") {
          localStorage.setItem(lastSeenStorageKey, now);
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherTyping(false);
        }, 3000);
      }
    });

    // Listen to Postgres INSERT changes (database-level fallback)
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const newDbMsg = payload.new as any;
        if (
          newDbMsg &&
          ((newDbMsg.sender_id === u1 && newDbMsg.receiver_id === u2) ||
           (newDbMsg.sender_id === u2 && newDbMsg.receiver_id === u1))
        ) {
          const mapped = mapMessage(newDbMsg);
          setMessages((prev) => {
            if (prev.some((m) => m.id === mapped.id)) return prev;
            return [...prev, mapped];
          });
        }
      }
    );

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: currentUser.id,
          online_at: new Date().toISOString(),
        });
      }
    });
    activeChannelRef.current = channel;

    // 3. Fallback polling every 3.5 seconds in case of mobile/tab background sleep
    const pollInterval = setInterval(() => {
      fetchChat();
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser, selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const t = translations[lang] || translations.tr;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessageText(val);

    // Broadcast typing indicator
    if (activeChannelRef.current && currentUser && val.trim().length > 0) {
      activeChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUser.id },
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser || !selectedUser || isSending) return;

    const content = newMessageText.trim();
    setNewMessageText("");
    setIsSending(true);

    try {
      const sent = await dbSendMessage(selectedUser.id, content);
      
      // Update local state immediately
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      // Broadcast to room immediately for real-time delivery
      if (activeChannelRef.current) {
        activeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: sent,
        });
      }

      try { localStore.sendMessage(selectedUser.id, content); } catch { /* best-effort sync */ }
    } catch {
      // Offline fallback
      const sent = localStore.sendMessage(selectedUser.id, content);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100dvh-8.5rem)] max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col md:flex-row bg-white dark:bg-[#0b0f17] shadow-sm transition-colors">
      
      {/* 1. LEFT COLUMN — CHAT LIST */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-neutral-800 flex flex-col bg-gray-50/60 dark:bg-black/40 ${
        selectedUser ? "hidden md:flex" : "flex"
      }`}>
        
        {/* HEADER & SEARCH */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-[#0b0f17]">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.messages.title}</span>
            </h1>
            <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 px-2 py-0.5 rounded-full">
              {profiles.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.messages.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* PROFILES LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredProfiles.length === 0 ? (
            <p className="text-xs text-center text-gray-400 dark:text-neutral-500 py-6">
              Heç kim tapılmadı
            </p>
          ) : (
            filteredProfiles.map((p) => {
              const isSelected = selectedUser?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedUser(p)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? "bg-blue-50 dark:bg-neutral-900 text-blue-600 dark:text-white border border-blue-200/60 dark:border-neutral-800 shadow-xs"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-900/50 text-gray-700 dark:text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name}&background=random&size=80`}
                      alt={p.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-800"
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-[#0b0f17] rounded-full transition-colors ${
                      isSelected
                        ? isOtherOnline
                          ? "bg-emerald-500"
                          : "bg-gray-400 dark:bg-neutral-600"
                        : "bg-emerald-500/70"
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                        {p.full_name}
                      </h3>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
                        @{p.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate mt-0.5">
                      {p.developer_title || "Full-Stack Developer"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT COLUMN — ACTIVE CONVERSATION */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-[#0b0f17] ${
        !selectedUser ? "hidden md:flex items-center justify-center" : "flex"
      }`}>
        {selectedUser ? (
          <>
            {/* CONVERSATION HEADER */}
            <div className="p-3.5 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0b0f17] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser.full_name}&background=random&size=80`}
                    alt={selectedUser.full_name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-neutral-800"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-[#0b0f17] rounded-full transition-colors ${
                      isOtherOnline ? "bg-emerald-500" : "bg-gray-400 dark:bg-neutral-600"
                    }`}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{selectedUser.full_name}</span>
                    <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-normal">
                      @{selectedUser.username}
                    </span>
                  </h2>
                  <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                    {isOtherOnline ? (
                      <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{lang === "tr" ? "Çevrimiçi" : lang === "en" ? "Online" : "Onlayn"}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-neutral-400 font-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-neutral-500 inline-block" />
                        <span>{formatLastSeen(otherLastSeen || undefined, lang)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href={`/developers/${selectedUser.username}`}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 border border-gray-200 dark:border-neutral-800 transition-colors no-underline"
              >
                <span>{t.messages.viewProfile}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40 dark:bg-black/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-neutral-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 dark:text-neutral-600" />
                  <p className="text-xs">{t.messages.startConversation}</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-200 rounded-bl-xs border border-gray-200/80 dark:border-neutral-800"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                            isMe ? "text-blue-200" : "text-gray-400 dark:text-neutral-500"
                          }`}
                        >
                          <span>{timeAgo(m.created_at)}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* TYPING INDICATOR */}
              {isOtherTyping && (
                <div className="flex justify-start items-center gap-2 text-xs text-gray-500 dark:text-neutral-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{selectedUser.full_name} yazır...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0b0f17] flex items-center gap-2">
              <input
                type="text"
                placeholder={`${selectedUser.full_name} - ${t.messages.writeMessage}`}
                value={newMessageText}
                onChange={handleInputChange}
                className="flex-1 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim() || isSending}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-xs active:scale-95"
              >
                <span>{isSending ? "..." : t.messages.send}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-gray-400 dark:text-neutral-500 space-y-2 p-6">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-neutral-700" />
            <p className="text-xs sm:text-sm">{t.messages.selectUser}</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-96 flex items-center justify-center text-gray-400 text-xs">
        Yüklənir...
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
