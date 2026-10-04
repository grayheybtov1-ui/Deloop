"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Sparkles, Flame } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { ProjectCard } from "@/components/ProjectCard";
import { DeveloperStories } from "@/components/DeveloperStories";
import { Profile } from "@/types";
import { useToast } from "@/components/Toast";

const CATEGORIES = ["Barchasi", "Full Stack", "Frontend", "Backend", "AI", "Mobile", "DevOps"];

export default function ProjectsFeedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);
    const profiles = localStore.getProfiles().filter((p) => p.id !== curr?.id);
    setSuggestedProfiles(profiles.slice(0, 5));
  }, []);

  const projects = localStore.getProjects(
    selectedCategory === "Barchasi" ? "All" : selectedCategory, 
    searchQuery
  );

  const handleFollowToggle = (profile: Profile) => {
    const isNowFollowing = localStore.toggleFollow(profile.id);
    setSuggestedProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, is_following: isNowFollowing } : p))
    );
    showToast(
      isNowFollowing ? "Təqib edildi 👤" : "Təqibdən çıxarıldı",
      isNowFollowing ? `${profile.full_name} təqibçilərinizə əlavə olundu.` : undefined,
      "info"
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-16">
      
      {/* 1. COMPACT TOP INSTAGRAM STORIES BAR */}
      <DeveloperStories />

      {/* 2. CATEGORY & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Postlarda və ya texnologiyalarda axtarın (#react, #python)..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          <Link
            href="/projects/new"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1 shadow-sm shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yeni Post</span>
          </Link>
        </div>

        {/* CATEGORY TAGS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN INSTAGRAM FEED & RIGHT SIDEBAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CENTER POSTS FEED */}
        <div className="lg:col-span-8 space-y-5">
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <Flame className="w-8 h-8 mx-auto text-blue-500/60 animate-bounce" />
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">Hələ ki, post tapılmadı</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                İlk post paylaşan siz olun və layihənizi icma ilə bölüşün!
              </p>
              <div className="pt-2">
                <Link
                  href="/projects/new"
                  className="inline-block px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
                >
                  Post Paylaş
                </Link>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>

        {/* RIGHT SIDEBAR - INSTAGRAM SUGGESTIONS */}
        <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-20">
          
          {/* LOGGED IN USER PROFILE SUMMARY */}
          {currentUser && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
              <Link href={`/developers/${currentUser.username}`} className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={currentUser.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {currentUser.full_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">@{currentUser.username}</p>
                </div>
              </Link>
              <Link
                href={`/developers/${currentUser.username}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Profil
              </Link>
            </div>
          )}

          {/* SUGGESTED DEVELOPERS TO FOLLOW */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sizin üçün təkliflər</span>
              </h3>
              <Link href="/developers" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Hamısı
              </Link>
            </div>

            <div className="space-y-2.5">
              {suggestedProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <Link href={`/developers/${p.username}`} className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={p.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate hover:text-blue-600">
                        {p.full_name}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-mono truncate">@{p.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      p.is_following
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {p.is_following ? "Təqibdədir" : "Təqib et"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER LINKS */}
          <div className="px-2 text-[10px] text-slate-500 dark:text-slate-500 space-y-1 font-mono">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span>Haqqımızda</span> • <span>Dəstək</span> • <span>Məxfilik</span> • <span>Şərtlər</span>
            </div>
            <p>© 2026 Deloop Gram • Native Mobile App</p>
          </div>

        </div>

      </div>

    </div>
  );
}
