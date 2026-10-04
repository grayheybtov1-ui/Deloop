"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Compass, Sparkles, UserPlus, Flame } from "lucide-react";
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
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* 1. TOP INSTAGRAM STORIES BAR */}
      <DeveloperStories />

      {/* 2. CATEGORY & SEARCH BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Postlarda və ya texnologiyalarda axtarın (#react, #nextjs, #python)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <Link
            href="/projects/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Post</span>
          </Link>
        </div>

        {/* CATEGORY TAGS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN INSTAGRAM FEED & RIGHT SIDEBAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CENTER POSTS FEED (MAX WIDTH INSTAGRAM STYLE) */}
        <div className="lg:col-span-8 space-y-6">
          {projects.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <Flame className="w-10 h-10 mx-auto text-blue-500/60 animate-bounce" />
              <h3 className="font-bold text-slate-200 text-sm sm:text-base">Hələ ki, post tapılmadı</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                İlk post paylaşan siz olun və layihənizi tərtibatçılar icması ilə bölüşün!
              </p>
              <div className="pt-2">
                <Link
                  href="/projects/new"
                  className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md"
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
        <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
          
          {/* LOGGED IN USER PROFILE SUMMARY */}
          {currentUser && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <Link href={`/developers/${currentUser.username}`} className="flex items-center gap-3">
                <img
                  src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={currentUser.full_name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm hover:text-blue-400 transition-colors">
                    {currentUser.full_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
                </div>
              </Link>
              <Link
                href={`/developers/${currentUser.username}`}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                Profil
              </Link>
            </div>
          )}

          {/* SUGGESTED DEVELOPERS TO FOLLOW */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sizin üçün təkliflər</span>
              </h3>
              <Link href="/developers" className="text-xs font-bold text-blue-400 hover:underline">
                Hamısına Bax
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <Link href={`/developers/${p.username}`} className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={p.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-200 truncate hover:text-blue-400">
                        {p.full_name}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-mono truncate">@{p.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      p.is_following
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {p.is_following ? "Təqibdədir" : "Təqib et"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* INSTAGRAM FOOTER LINKS */}
          <div className="px-2 text-[11px] text-slate-500 space-y-2 font-mono">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span>Haqqımızda</span> • <span>Dəstək</span> • <span>Məxfilik</span> • <span>Şərtlər</span>
            </div>
            <p>© 2026 Deloop Gram • Instagram for Developers</p>
          </div>

        </div>

      </div>

    </div>
  );
}
