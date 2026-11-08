"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Bookmark, Flame, LayoutGrid } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { dbGetProjects, dbGetAllProfiles, dbToggleFollow } from "@/lib/supabase/db";
import { ProjectCard } from "@/components/ProjectCard";
import { DeveloperStories } from "@/components/DeveloperStories";
import { Profile, Project } from "@/types";
import { useToast } from "@/components/Toast";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

export default function ProjectsFeedPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("tr");
  const [feedFilter, setFeedFilter] = useState<"all" | "saved" | "popular">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    setLang(getSavedLanguage());
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);
    setBookmarkedIds(localStore.getBookmarkedProjectIds());

    async function loadFeed() {
      try {
        const [projList, profList] = await Promise.all([
          dbGetProjects(),
          dbGetAllProfiles(),
        ]);
        setProjects(projList.length > 0 ? projList : localStore.getProjects());
        const userNow = localStore.getCurrentUser();
        const pool = profList.length > 0 ? profList : localStore.getProfiles();
        setSuggestedProfiles(pool.filter((p) => p.id !== userNow?.id).slice(0, 5));
      } catch {
        setProjects(localStore.getProjects());
        const pool = localStore.getProfiles();
        setSuggestedProfiles(pool.filter((p) => p.id !== curr?.id).slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    loadFeed();

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);

    const handleBookmarksChanged = () => {
      setBookmarkedIds(localStore.getBookmarkedProjectIds());
    };
    window.addEventListener("deloop_bookmarks_changed", handleBookmarksChanged);

    const handleProjectsUpdated = async () => {
      try {
        const projList = await dbGetProjects();
        setProjects(projList.length > 0 ? projList : localStore.getProjects());
      } catch {
        setProjects(localStore.getProjects());
      }
    };
    window.addEventListener("deloop_projects_updated", handleProjectsUpdated);

    const handleUserUpdated = () => {
      setCurrentUser(localStore.getCurrentUser());
    };
    window.addEventListener("deloop_user_updated", handleUserUpdated);

    return () => {
      window.removeEventListener("deloop_lang_changed", handleLang);
      window.removeEventListener("deloop_bookmarks_changed", handleBookmarksChanged);
      window.removeEventListener("deloop_projects_updated", handleProjectsUpdated);
      window.removeEventListener("deloop_user_updated", handleUserUpdated);
    };
  }, []);

  const t = translations[lang] || translations.tr;

  const getFilteredProjects = () => {
    if (feedFilter === "saved") {
      return projects.filter((p) => bookmarkedIds.includes(p.id));
    }
    if (feedFilter === "popular") {
      return [...projects].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }
    return projects;
  };

  const displayedProjects = getFilteredProjects();

  const handleFollowToggle = async (profile: Profile) => {
    try {
      const res = await dbToggleFollow(profile.id);
      const isNowFollowing = res.following;
      localStore.toggleFollow(profile.id);
      setSuggestedProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_following: isNowFollowing } : p))
      );
      showToast(
        isNowFollowing ? t.feed.following : t.feed.follow,
        isNowFollowing ? `${profile.full_name}` : undefined,
        "info"
      );
    } catch {
      const isNowFollowing = localStore.toggleFollow(profile.id);
      setSuggestedProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_following: isNowFollowing } : p))
      );
      showToast(
        isNowFollowing ? t.feed.following : t.feed.follow,
        isNowFollowing ? `${profile.full_name}` : undefined,
        "info"
      );
    }
  };

  return (
    <div className="flex justify-center gap-8 px-0 sm:px-4" style={{ paddingTop: "8px" }}>

      {/* ─────────── LEFT: FEED ─────────── */}
      <div className="w-full" style={{ maxWidth: "470px" }}>

        {/* STORIES */}
        <DeveloperStories />

        {/* FEED FILTER TABS */}
        <div className="flex items-center gap-1.5 p-1 mb-4 rounded-xl bg-[#f5f7fa] dark:bg-[#0b0f17] border border-gray-200 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setFeedFilter("all")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              feedFilter === "all"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === "tr" ? "Tümü" : lang === "az" ? "Hamısı" : "All"}</span>
          </button>

          <button
            onClick={() => setFeedFilter("popular")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              feedFilter === "popular"
                ? "bg-amber-600 text-white font-semibold shadow-sm"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === "tr" ? "Popüler" : lang === "az" ? "Populyar" : "Popular"}</span>
          </button>

          <button
            onClick={() => setFeedFilter("saved")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              feedFilter === "saved"
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === "tr" ? "Kaydedilenler" : lang === "az" ? "Saxlanılanlar" : "Saved"}</span>
            {bookmarkedIds.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {bookmarkedIds.length}
              </span>
            )}
          </button>
        </div>

        {/* POSTS */}
        <div className="space-y-4">
          {displayedProjects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-neutral-800"
              >
                {feedFilter === "saved" ? (
                  <Bookmark className="w-7 h-7 text-indigo-400" />
                ) : (
                  <Sparkles className="w-7 h-7 text-neutral-400" />
                )}
              </div>
              <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                {feedFilter === "saved"
                  ? lang === "tr"
                    ? "Henüz kaydedilen proje yok"
                    : lang === "az"
                    ? "Hələ heç bir layihə saxlanılmayıb"
                    : "No saved projects yet"
                  : t.feed.noPosts}
              </h3>
              <p className="text-sm mb-4 text-gray-500 dark:text-neutral-400 max-w-xs">
                {feedFilter === "saved"
                  ? lang === "tr"
                    ? "İlginizi çeken projelerin altındaki 🔖 butonuna basarak kaydedebilirsiniz."
                    : lang === "az"
                    ? "Maraqlı layihələri 🔖 işarəsi ilə şəxsi siyahınıza əlavə edin."
                    : "Bookmark projects you like using the 🔖 button."
                  : t.feed.noPostsDesc}
              </p>
              {feedFilter === "saved" ? (
                <button
                  onClick={() => setFeedFilter("all")}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {lang === "tr" ? "Projeleri Gör" : lang === "az" ? "Layihələrə Bax" : "Browse Projects"}
                </button>
              ) : (
                <Link
                  href="/projects/new"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  {t.feed.createPost}
                </Link>
              )}
            </div>
          ) : (
            displayedProjects.map((project) => (
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
                  className="rounded-full object-cover border border-gray-200 dark:border-neutral-800"
                  style={{ width: "44px", height: "44px" }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentUser.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {currentUser.full_name}
                  </p>
                </div>
              </Link>
              <Link
                href={`/developers/${currentUser.username}`}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline no-underline"
              >
                {t.nav.profile}
              </Link>
            </div>
          )}

          {/* SUGGESTIONS HEADER */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-neutral-400">
              {t.feed.suggestions}
            </span>
            <Link
              href="/developers"
              className="text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white no-underline"
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
                    className="rounded-full object-cover shrink-0 border border-gray-200 dark:border-neutral-800"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                      {p.username}
                    </p>
                    <p className="text-xs truncate text-gray-500 dark:text-neutral-400">
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
