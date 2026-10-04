"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  Search, 
  MessageSquare, 
  User, 
  Check, 
  CheckCheck,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Profile, Message } from "@/types";
import { useToast } from "@/components/Toast";
import { timeAgo } from "@/lib/utils";

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

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !currentUser || !selectedUser) return;

    const sent = localStore.sendMessage(selectedUser.id, newMessageText.trim());
    setMessages((prev) => [...prev, sent]);
    setNewMessageText("");

    showToast("Mesaj Göndərildi ✉️", undefined, "success");
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
      
      {/* 1. LEFT SIDEBAR - CHAT LIST */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/60 ${
        selectedUser ? "hidden md:flex" : "flex"
      }`}>
        
        {/* CHAT HEADER & SEARCH */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Direkt Mesajlar</span>
            </h1>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {profiles.length} Tərtibatçı
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tərtibatçı axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* PROFILES LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredProfiles.map((p) => {
            const isSelected = selectedUser?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedUser(p)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  isSelected
                    ? "bg-blue-600/15 border border-blue-500/30 text-slate-100"
                    : "hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                <div className="relative">
                  <img
                    src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={p.full_name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold truncate">{p.full_name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">@{p.username}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {p.developer_title || "Full-Stack Developer"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT PANEL - ACTIVE CHAT CONVERSATION */}
      <div className={`flex-1 flex flex-col bg-slate-900 ${
        !selectedUser ? "hidden md:flex items-center justify-center" : "flex"
      }`}>
        {selectedUser ? (
          <>
            {/* CHAT HEADER */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={selectedUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={selectedUser.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />

                <div>
                  <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <span>{selectedUser.full_name}</span>
                    <span className="text-xs text-blue-400 font-mono">@{selectedUser.username}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedUser.developer_title || "Developer"}
                  </p>
                </div>
              </div>

              <Link
                href={`/developers/${selectedUser.username}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <span>Profilə Bax</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* MESSAGES BUBBLE FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-950/20 to-slate-900">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-blue-500/50" />
                  <p className="text-xs">Söhbətə başlayın! Bir-birinizə mesaj yazın.</p>
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
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700/80"
                        }`}
                      >
                        <p className="leading-relaxed">{m.content}</p>
                        <div
                          className={`text-[10px] mt-1 font-mono flex items-center justify-end gap-1 ${
                            isMe ? "text-blue-200" : "text-slate-400"
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

            {/* CHAT INPUT FORM */}
            <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-800 bg-slate-950/50 flex items-center gap-2">
              <input
                type="text"
                placeholder={`${selectedUser.full_name} üçün mesaj yazın...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md"
              >
                <span>Göndər</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center text-slate-500 space-y-3">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-medium">Yazışmaq üçün sol tərəfdən bir tərtibatçı seçin.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm">
        Mesajlar yüklənir...
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
