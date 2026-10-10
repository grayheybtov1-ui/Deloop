"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { ProjectCard } from "@/components/ProjectCard";
import { DeveloperStories } from "@/components/DeveloperStories";
import { Profile } from "@/types";
import { useToast } from "@/components/Toast";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

export default function ProjectsFeedPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const [lang, setLang] = useState<Language>("tr");
  const { showToast } = useToast();

  useEffect(() => {
    setLang(getSavedLanguage());
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);
    const profiles = localStore.getProfiles().filter((p) => p.id !== curr?.id);
    setSuggestedProfiles(profiles.slice(0, 5));

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, []);

  const t = translations[lang] || translations.tr;
  const projects = localStore.getProjects();

  const handleFollowToggle = (profile: Profile) => {
    const isNowFollowing = localStore.toggleFollow(profile.id);
    setSuggestedProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, is_following: isNowFollowing } : p))
    );
    showToast(
      isNowFollowing ? t.feed.following : t.feed.follow,
      isNowFollowing ? `${profile.full_name}` : undefined,
      "info"
    );
  };

  return (
    <div className="flex justify-center gap-8 px-0 sm:px-4" style={{ paddingTop: "8px" }}>

      {/* ─────────── LEFT: FEED ─────────── */}
      <div className="w-full" style={{ maxWidth: "470px" }}>

        {/* STORIES */}
        <DeveloperStories />

        {/* POSTS */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-neutral-800"
              >
                <Sparkles className="w-7 h-7 text-neutral-400" />
              </div>
              <h3 className="font-semibold text-base mb-1 text-white">
                {t.feed.noPosts}
              </h3>
              <p className="text-sm mb-4 text-neutral-400">
                {t.feed.noPostsDesc}
              </p>
              <Link
                href="/projects/new"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                {t.feed.createPost}
              </Link>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>

      {/* ─────────── RIGHT: SIDEBAR (Desktop only) ─────────── */}
      <div className="hidden lg:block" style={{ width: "293px", flexShrink: 0 }}>
        <div className="sticky" style={{ top: "80px" }}>

          {/* CURRENT USER */}
          {currentUser && (
            <div className="flex items-center justify-between mb-5">
              <Link
                href={`/developers/${currentUser.username}`}
                className="flex items-center gap-3 no-underline"
              >
                <img
                  src={
                    currentUser.avatar_url ||
                    `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random&size=120`
                  }
                  alt={currentUser.full_name}
                  className="rounded-full object-cover border border-neutral-800"
                  style={{ width: "44px", height: "44px" }}
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {currentUser.username}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {currentUser.full_name}
                  </p>
                </div>
              </Link>
              <Link
                href={`/developers/${currentUser.username}`}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 no-underline"
              >
                {t.nav.profile}
              </Link>
            </div>
          )}

          {/* SUGGESTIONS HEADER */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-neutral-400">
              {t.feed.suggestions}
            </span>
            <Link
              href="/developers"
              className="text-xs font-semibold text-neutral-300 hover:text-white no-underline"
            >
              {t.feed.seeAll}
            </Link>
          </div>

          {/* SUGGESTED ACCOUNTS */}
          <div className="space-y-3">
            {suggestedProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <Link
                  href={`/developers/${p.username}`}
                  className="flex items-center gap-2.5 min-w-0 no-underline"
                >
                  <img
                    src={
                      p.avatar_url ||
                      `https://ui-avatars.com/api/?name=${p.full_name}&background=random&size=80`
                    }
                    alt={p.full_name}
                    className="rounded-full object-cover shrink-0 border border-neutral-800"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-white">
                      {p.username}
                    </p>
                    <p className="text-xs truncate text-neutral-400">
                      {p.developer_title || "Developer"}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollowToggle(p)}
                  className={`text-xs font-semibold shrink-0 ml-2 transition-all cursor-pointer bg-transparent border-0 p-0 ${
                    p.is_following ? "text-neutral-400" : "text-blue-500 hover:text-blue-400"
                  }`}
                >
                  {p.is_following ? t.feed.following : t.feed.follow}
                </button>
              </div>
            ))}
          </div>

          {/* FOOTER LINKS */}
          <div className="mt-5 space-y-1 text-[11px] text-neutral-500">
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              {[
                lang === "tr" ? "Hakkımızda" : "Haqqımızda",
                lang === "tr" ? "Destek" : "Dəstək",
                lang === "tr" ? "Gizlilik" : "Məxfilik",
                lang === "tr" ? "Koşullar" : "Şərtlər",
                "Cookies"
              ].map((link, i) => (
                <React.Fragment key={link}>
                  <span className="hover:underline cursor-pointer">{link}</span>
                  {i < 4 && <span>·</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[11px] text-neutral-600">© 2026 DELOOP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
