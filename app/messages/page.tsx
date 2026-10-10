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
  ExternalLink
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile, Message } from "@/types";
import { useToast } from "@/components/Toast";
import { timeAgo } from "@/lib/utils";
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
  const [lang, setLang] = useState<Language>("tr");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);

    const allProfiles = localStore.getProfiles().filter((p) => p.id !== curr?.id);
    setProfiles(allProfiles);

    if (targetUserId) {
      const target = allProfiles.find((p) => p.id === targetUserId);
      if (target) {
        setSelectedUser(target);
      } else if (allProfiles.length > 0) {
        setSelectedUser(allProfiles[0]);
      }
    } else if (allProfiles.length > 0) {
      setSelectedUser(allProfiles[0]);
    }

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, [targetUserId]);

  useEffect(() => {
    if (currentUser && selectedUser) {
      const chatHistory = localStore.getMessagesBetween(currentUser.id, selectedUser.id);
      setMessages(chatHistory);
    }
  }, [currentUser, selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const t = translations[lang] || translations.tr;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser || !selectedUser) return;

    const sent = localStore.sendMessage(selectedUser.id, newMessageText.trim());
    setMessages((prev) => [...prev, sent]);
    setNewMessageText("");

    showToast(lang === "tr" ? "Mesaj Gönderildi" : "Mesaj Göndərildi", undefined, "success");
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-2xl border border-neutral-800 overflow-hidden flex flex-col md:flex-row bg-black">
      
      {/* 1. LEFT COLUMN — CHAT LIST */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-800 flex flex-col bg-black ${
        selectedUser ? "hidden md:flex" : "flex"
      }`}>
        
        {/* HEADER & SEARCH */}
        <div className="p-4 border-b border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neutral-300" />
              <span>{t.messages.title}</span>
            </h1>
            <span className="text-[11px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
              {profiles.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.messages.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>

        {/* PROFILES LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-neutral-900">
          {filteredProfiles.map((p) => {
            const isSelected = selectedUser?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedUser(p)}
                className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                  isSelected
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-900/50 text-neutral-300"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={p.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold truncate text-white">{p.full_name}</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">@{p.username}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {p.developer_title || "Full-Stack Developer"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT COLUMN — ACTIVE CONVERSATION */}
      <div className={`flex-1 flex flex-col bg-black ${
        !selectedUser ? "hidden md:flex items-center justify-center" : "flex"
      }`}>
        {selectedUser ? (
          <>
            {/* CONVERSATION HEADER */}
            <div className="p-3.5 border-b border-neutral-800 bg-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={selectedUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={selectedUser.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-neutral-800"
                />

                <div>
                  <h2 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{selectedUser.full_name}</span>
                    <span className="text-[11px] text-neutral-400 font-normal">@{selectedUser.username}</span>
                  </h2>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    {selectedUser.developer_title || "Developer"}
                  </p>
                </div>
              </div>

              <Link
                href={`/developers/${selectedUser.username}`}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1.5 border border-neutral-800 transition-colors"
              >
                <span>{t.messages.viewProfile}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-neutral-600" />
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
                        className={`max-w-md px-3.5 py-2 rounded-2xl text-xs sm:text-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-neutral-900 text-neutral-200 rounded-bl-xs border border-neutral-800"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                            isMe ? "text-blue-200" : "text-neutral-500"
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
              <div ref={chatEndRef} />
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-black flex items-center gap-2">
              <input
                type="text"
                placeholder={`${selectedUser.full_name} - ${t.messages.writeMessage}`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all"
              >
                <span>{t.messages.send}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-neutral-500 space-y-2 p-6">
            <MessageSquare className="w-10 h-10 mx-auto text-neutral-700" />
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
      <div className="h-96 flex items-center justify-center text-neutral-400 text-xs">
        Yükleniyor...
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
