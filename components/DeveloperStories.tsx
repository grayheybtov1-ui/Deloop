"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, Camera, Image as ImageIcon, Send, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { Story, Profile } from "@/types";
import { useToast } from "./Toast";
import { timeAgo } from "@/lib/utils";
import { getSavedLanguage } from "@/lib/i18n";

export function DeveloperStories() {
  const { showToast } = useToast();
  const lang = getSavedLanguage();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  // New Story Form States
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Story Viewer Timer & Pause State
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and sync stories & current user
  useEffect(() => {
    const refreshData = () => {
      setCurrentUser(localStore.getCurrentUser());
      setStories(localStore.getStories());
    };
    refreshData();

    window.addEventListener("deloop_stories_updated", refreshData);
    window.addEventListener("deloop_user_updated", refreshData);
    return () => {
      window.removeEventListener("deloop_stories_updated", refreshData);
      window.removeEventListener("deloop_user_updated", refreshData);
    };
  }, []);

  // Filter my active story vs others
  const myStories = stories.filter(s => s.user_id === currentUser?.id);
  const otherStories = stories.filter(s => s.user_id !== currentUser?.id);

  // Distinct other users who have stories
  const distinctStories: Story[] = [];
  const seenUserIds = new Set<string>();
  for (const story of otherStories) {
    if (!seenUserIds.has(story.user_id)) {
      seenUserIds.add(story.user_id);
      distinctStories.push(story);
    }
  }

  // Handle Photo selection from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        showToast(
          lang === "tr" ? "Lütfen bir resim dosyası seçin" : "Zəhmət olmasa şəkil faylı seçin",
          undefined,
          "error"
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) setMediaUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Story
  const handleShareStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast(
        lang === "tr" ? "Hekaye paylaşmak için giriş yapın" : "Hekayə paylaşmaq üçün daxil olun",
        undefined,
        "error"
      );
      return;
    }
    if (!mediaUrl.trim()) {
      showToast(
        lang === "tr" ? "Lütfen bir fotoğraf seçin veya URL girin" : "Zəhmət olmasa şəkil seçin və ya link daxil edin",
        undefined,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      localStore.addStory({
        user_id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
        media_url: mediaUrl.trim(),
        caption: caption.trim() || undefined,
      });

      setMediaUrl("");
      setCaption("");
      setIsAddModalOpen(false);
      showToast(
        lang === "tr" ? "Hekayeniz paylaşıldı! 🚀" : "Hekayəniz paylaşıldı! 🚀",
        lang === "tr" ? "24 saat boyunca profilinizde görünecektir." : "24 saat ərzində aktiv qalacaq.",
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Xəta baş verdi", undefined, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Story
  const handleDeleteStory = (storyId: string) => {
    const success = localStore.deleteStory(storyId);
    if (success) {
      setSelectedStoryIndex(null);
      showToast(
        lang === "tr" ? "Hekaye silindi" : "Hekayə silindi",
        undefined,
        "info"
      );
    }
  };

  // Story Viewer Timer effect
  useEffect(() => {
    if (selectedStoryIndex === null) {
      setProgress(0);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    if (isPaused) return;

    const intervalTime = 50; // ms
    const step = (100 / (5000 / intervalTime)); // 5 seconds duration

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story or close
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex(selectedStoryIndex + 1);
            return 0;
          } else {
            setSelectedStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [selectedStoryIndex, isPaused, stories.length]);

  const activeViewerStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : null;

  return (
    <>
      {/* ── STORIES BAR ── */}
      <div className="bg-[#f5f7fa] dark:bg-[#0b0f17] border border-gray-200/80 dark:border-neutral-800/80 rounded-2xl p-4 overflow-x-auto no-scrollbar shadow-xs mb-6 transition-colors">
        <div className="flex items-start gap-4 min-w-max px-1">
          
          {/* 1. MY STORY BUTTON */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group" style={{ width: "68px" }}>
            <div
              className="relative"
              onClick={() => {
                if (myStories.length > 0) {
                  const myIndex = stories.findIndex((s) => s.id === myStories[0].id);
                  setSelectedStoryIndex(myIndex !== -1 ? myIndex : 0);
                  setProgress(0);
                } else {
                  setIsAddModalOpen(true);
                }
              }}
            >
              {/* Ring around avatar if my active story exists */}
              <div
                className={`rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                  myStories.length > 0
                    ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                    : "border-2 border-transparent"
                }`}
              >
                <img
                  src={
                    currentUser?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${currentUser?.full_name || "U"}&background=random&size=120`
                  }
                  alt="Hekayəniz"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#0b0f17] bg-neutral-800"
                />
              </div>

              {/* Blue Plus Button to add story directly */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddModalOpen(true);
                }}
                className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-white bg-blue-600 hover:bg-blue-500 border-2 border-white dark:border-[#0b0f17] shadow-sm transition-transform active:scale-90"
                style={{ width: "22px", height: "22px" }}
                title="Yeni Hekayə Paylaş"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            <span className="text-center truncate text-[11px] font-medium text-gray-800 dark:text-neutral-200 block w-full">
              {lang === "tr" ? "Hikayen" : "Hekayəniz"}
            </span>
          </div>

          {/* 2. OTHER ACTIVE STORIES */}
          {distinctStories.map((story) => {
            const storyIdx = stories.findIndex((s) => s.id === story.id);
            return (
              <div
                key={story.id}
                onClick={() => {
                  setSelectedStoryIndex(storyIdx);
                  setProgress(0);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                style={{ width: "68px" }}
              >
                {/* Colorful Story Ring */}
                <div className="rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 transition-transform group-hover:scale-105">
                  <div className="rounded-full p-0.5 bg-white dark:bg-[#0b0f17]">
                    <img
                      src={
                        story.avatar_url ||
                        `https://ui-avatars.com/api/?name=${story.full_name}&background=random&size=120`
                      }
                      alt={story.full_name}
                      className="w-13 h-13 rounded-full object-cover"
                    />
                  </div>
                </div>

                <span className="truncate text-center text-[11px] font-medium text-gray-800 dark:text-neutral-200 group-hover:text-blue-500 transition-colors block w-full">
                  {story.username}
                </span>
              </div>
            );
          })}

          {/* EMPTY STATE HINT IF NO STORIES */}
          {distinctStories.length === 0 && myStories.length === 0 && (
            <div className="flex items-center gap-2 pl-2 text-xs text-neutral-400 self-center">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{lang === "tr" ? "İlk hekayeyi sen paylaş!" : "İlk hekayəni sən paylaş!"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. ADD STORY MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#121824] rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {lang === "tr" ? "Yeni Hikaye Paylaş" : "Yeni Hekayə Paylaş"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleShareStory} className="p-5 space-y-4">
              {/* Media Preview or Picker */}
              {mediaUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-72 w-full mx-auto bg-neutral-900 border border-neutral-800">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-colors"
                    title="Şəkli sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-neutral-800 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-gray-50 dark:bg-neutral-900/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                    {lang === "tr" ? "Cihazdan Fotoğraf Seç" : "Qurğudan Şəkil Seç"}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                    PNG, JPG, WEBP
                  </p>
                </div>
              )}

              {/* Or paste Image URL */}
              {!mediaUrl && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400">
                    {lang === "tr" ? "veya Şəkil Linki (URL)" : "və ya Şəkil Linki (URL)"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Optional Caption */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  {lang === "tr" ? "Açıklama / Mesaj (İsteğe bağlı)" : "Açıqlama / Mesaj (İstəyə görə)"}
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder={lang === "tr" ? "Geliştirme aşamasındayım... 💻" : "Yeni layihəm üzərində işləyirəm... 🚀"}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {lang === "tr" ? "İptal" : "Ləğv et"}
                </button>
                <button
                  type="submit"
                  disabled={!mediaUrl.trim() || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === "tr" ? "Paylaş" : "Paylaş"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. FULLSCREEN STORY VIEWER ── */}
      {activeViewerStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none p-2 sm:p-4"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Main Story Container */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full max-h-[85vh] rounded-2xl overflow-hidden bg-neutral-900 flex flex-col justify-between shadow-2xl border border-white/10">
            
            {/* Top Progress Bar */}
            <div className="absolute top-0 inset-x-0 z-20 p-2 sm:p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Author Info & Actions */}
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      activeViewerStory.avatar_url ||
                      `https://ui-avatars.com/api/?name=${activeViewerStory.full_name}&background=random&size=80`
                    }
                    alt={activeViewerStory.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white drop-shadow-sm leading-tight">
                      {activeViewerStory.full_name}
                    </h4>
                    <p className="text-[10px] text-white/70 font-mono">
                      @{activeViewerStory.username} • {timeAgo(activeViewerStory.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 z-30">
                  {/* DELETE STORY BUTTON (Shown if story belongs to current user) */}
                  {currentUser && activeViewerStory.user_id === currentUser.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(lang === "tr" ? "Bu hikayeyi silmek istediğinize emin misiniz?" : "Bu hekayəni silmək istədiyinizə əminsiniz?")) {
                          handleDeleteStory(activeViewerStory.id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      title="Hekayəni Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === "tr" ? "Sil" : "Sil"}</span>
                    </button>
                  )}

                  {/* Close Viewer */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStoryIndex(null);
                    }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Story Media (Image) */}
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img
                src={activeViewerStory.media_url}
                alt="Story content"
                className="w-full h-full object-cover sm:object-contain"
              />
            </div>

            {/* Bottom Caption Overlay */}
            {activeViewerStory.caption && (
              <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-xs sm:text-sm text-white font-medium text-center drop-shadow-md">
                  {activeViewerStory.caption}
                </p>
              </div>
            )}

            {/* Prev / Next Tap Areas */}
            <div
              className="absolute inset-y-16 left-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
                  setSelectedStoryIndex(selectedStoryIndex - 1);
                  setProgress(0);
                }
              }}
            />
            <div
              className="absolute inset-y-16 right-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
                  setSelectedStoryIndex(selectedStoryIndex + 1);
                  setProgress(0);
                } else {
                  setSelectedStoryIndex(null);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
