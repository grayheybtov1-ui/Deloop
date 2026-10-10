"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Grid, 
  Send, 
  Settings, 
  MapPin, 
  Globe, 
  Github, 
  Heart, 
  MessageCircle, 
  Terminal
} from "lucide-react";

import { Profile, Project } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { GitHubStatsCard } from "@/components/GitHubStatsCard";
import { useToast } from "@/components/Toast";
import { ProjectCard } from "@/components/ProjectCard";
import { getSavedLanguage, translations, Language } from "@/lib/i18n";

export default function DeveloperProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "feed" | "github">("grid");
  const [lang, setLang] = useState<Language>("tr");

  useEffect(() => {
    setLang(getSavedLanguage());
    const prof = localStore.getProfileByUsername(username);
    if (prof) {
      setProfile(prof);
      setIsFollowing(!!prof.is_following);
      const allProj = localStore.getProjects();
      setProjects(allProj.filter((p) => p.user_id === prof.id || p.profile?.username === prof.username));
    }
    setCurrentUser(localStore.getCurrentUser());

    const handleLang = () => setLang(getSavedLanguage());
    window.addEventListener("deloop_lang_changed", handleLang);
    return () => window.removeEventListener("deloop_lang_changed", handleLang);
  }, [username]);

  const t = translations[lang] || translations.tr;

  if (!profile) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-100">{t.profile.notFound}</h2>
        <p className="text-xs text-neutral-400">@{username}</p>
        <Link href="/developers" className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
          {t.profile.backToDevs}
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.username.toLowerCase() === profile.username.toLowerCase();

  const handleFollowToggle = () => {
    const newStatus = localStore.toggleFollow(profile.id);
    setIsFollowing(newStatus);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            followers_count: newStatus
              ? (prev.followers_count || 0) + 1
              : Math.max(0, (prev.followers_count || 1) - 1),
          }
        : null
    );

    showToast(
      newStatus ? `@${profile.username} ${t.feed.following}` : `@${profile.username}`,
      undefined,
      "info"
    );
  };

  const handleOpenDM = () => {
    router.push(`/messages?user=${profile.id}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 pt-2">
      
      {/* 1. CLEAN PROFILE HEADER — ÇƏRÇİVƏSİZ (Unboxed & Seamless) */}
      <div className="w-full px-2 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12">
          
          {/* PROFILE AVATAR — Clean, natural circular avatar */}
          <div className="shrink-0">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
              alt={profile.full_name}
              className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border border-neutral-700/60 shadow-sm"
            />
          </div>

          {/* PROFILE DETAILS & ACTIONS */}
          <div className="flex-1 text-center sm:text-left space-y-4 w-full">
            
            {/* USERNAME & BUTTONS ROW */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-normal text-white">
                @{profile.username}
              </h1>

              <div className="flex items-center gap-2">
                {isSelf ? (
                  <Link
                    href="/settings"
                    className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{t.profile.editProfile}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isFollowing
                          ? "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {isFollowing ? t.profile.following : t.profile.follow}
                    </button>

                    <button
                      onClick={handleOpenDM}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.profile.directMessage}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* METRICS ROW: POSTS, FOLLOWERS, FOLLOWING */}
            <div className="flex items-center justify-center sm:justify-start gap-8 py-1 text-sm">
              <div>
                <span className="font-semibold text-white mr-1.5">{projects.length}</span>
                <span className="text-neutral-400">{t.profile.posts}</span>
              </div>
              <div>
                <span className="font-semibold text-white mr-1.5">{profile.followers_count || 0}</span>
                <span className="text-neutral-400">{t.profile.followers}</span>
              </div>
              <div>
                <span className="font-semibold text-white mr-1.5">{profile.following_count || 0}</span>
                <span className="text-neutral-400">{t.profile.followingCount}</span>
              </div>
            </div>

            {/* BIO & METADATA */}
            <div className="space-y-1.5 text-sm">
              <h2 className="font-semibold text-white">{profile.full_name}</h2>
              {profile.developer_title && (
                <p className="text-neutral-400 text-xs font-mono">{profile.developer_title}</p>
              )}
              {profile.bio && (
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl whitespace-pre-line pt-0.5">
                  {profile.bio}
                </p>
              )}

              {/* SOCIAL & WEBSITE LINKS */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-neutral-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.website.replace("https://", "")}</span>
                  </a>
                )}
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-neutral-300 hover:text-white"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>github/{profile.github_username}</span>
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. PROFILE TABS */}
      <div className="flex items-center justify-center border-t border-neutral-800">
        <div className="flex items-center gap-8 sm:gap-14 text-xs font-semibold tracking-wider">
          <button
            onClick={() => setActiveTab("grid")}
            className={`py-3 flex items-center gap-1.5 border-t transition-colors ${
              activeTab === "grid"
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t.profile.gridTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`py-3 flex items-center gap-1.5 border-t transition-colors ${
              activeTab === "feed"
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.profile.feedTab}</span>
          </button>

          {profile.github_username && (
            <button
              onClick={() => setActiveTab("github")}
              className={`py-3 flex items-center gap-1.5 border-t transition-colors ${
                activeTab === "github"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>{t.profile.githubTab}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-3 px-2 sm:px-0">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="relative aspect-square overflow-hidden bg-neutral-900 group rounded-lg"
            >
              {project.cover_image ? (
                <img
                  src={project.cover_image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-neutral-400 text-center">
                  <Terminal className="w-6 h-6 mb-1 text-blue-400" />
                  <span className="font-mono text-xs font-semibold text-neutral-200">{project.title}</span>
                </div>
              )}

              {/* Hover overlay with likes & comments */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-semibold text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>{project.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>{project.comments_count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "feed" && (
        <div className="max-w-xl mx-auto space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {activeTab === "github" && profile.github_username && (
        <div className="max-w-3xl mx-auto">
          <GitHubStatsCard githubUsername={profile.github_username} />
        </div>
      )}

    </div>
  );
}
