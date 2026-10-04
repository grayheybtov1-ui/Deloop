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
  Linkedin, 
  Heart, 
  MessageCircle, 
  ExternalLink,
  Code2,
  Terminal,
  Bookmark
} from "lucide-react";

import { Profile, Project } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { GitHubStatsCard } from "@/components/GitHubStatsCard";
import { useToast } from "@/components/Toast";
import { ProjectCard } from "@/components/ProjectCard";

export default function DeveloperInstagramProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "feed" | "github">("grid");

  useEffect(() => {
    const prof = localStore.getProfileByUsername(username);
    if (prof) {
      setProfile(prof);
      setIsFollowing(!!prof.is_following);
      const allProj = localStore.getProjects();
      setProjects(allProj.filter((p) => p.user_id === prof.id || p.profile?.username === prof.username));
    }
    setCurrentUser(localStore.getCurrentUser());
  }, [username]);

  if (!profile) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Tərtibatçı Tapılmadı</h2>
        <p className="text-xs text-slate-400">@{username} adlı istifadəçi mövcud deyil.</p>
        <Link href="/developers" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Tərtibatçılara Qayıt
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
      newStatus ? `@${profile.username} təqib edilir 👤` : `@${profile.username} təqibdən çıxarıldı`,
      undefined,
      "info"
    );
  };

  const handleOpenDM = () => {
    router.push(`/messages?user=${profile.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* 1. INSTAGRAM PROFILE HEADER SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          
          {/* PROFILE AVATAR WITH INSTAGRAM STORY GRADIENT RING */}
          <div className="relative shrink-0">
            <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xl">
              <img
                src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={profile.full_name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-slate-950"
              />
            </div>
          </div>

          {/* PROFILE DETAILS & ACTION BUTTONS */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            
            {/* USERNAME & BUTTONS ROW */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
                @{profile.username}
              </h1>

              <div className="flex items-center gap-2">
                {isSelf ? (
                  <Link
                    href="/settings"
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Profili Düzəlt</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isFollowing
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {isFollowing ? "Təqibdədir" : "Təqib Et"}
                    </button>

                    <button
                      onClick={handleOpenDM}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Direkt (DM)</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* STATS ROW (INSTAGRAM METRICS: POSTS, FOLLOWERS, FOLLOWING) */}
            <div className="flex items-center justify-center sm:justify-start gap-8 border-y border-slate-800/80 py-3 text-xs sm:text-sm">
              <div>
                <span className="font-extrabold text-slate-100 mr-1">{projects.length}</span>
                <span className="text-slate-400">Post</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-100 mr-1">{profile.followers_count || 0}</span>
                <span className="text-slate-400">Təqibçi</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-100 mr-1">{profile.following_count || 0}</span>
                <span className="text-slate-400">Təqib edir</span>
              </div>
            </div>

            {/* BIO & LINKS */}
            <div className="space-y-2 text-xs sm:text-sm">
              <h2 className="font-bold text-slate-100">{profile.full_name}</h2>
              <p className="text-blue-400 font-mono text-xs font-semibold">{profile.developer_title}</p>
              {profile.bio && <p className="text-slate-300 leading-relaxed max-w-xl">{profile.bio}</p>}

              {/* SOCIAL & WEBSITE LINKS */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
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
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
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

      {/* 2. INSTAGRAM PROFILE NAVIGATION TABS */}
      <div className="flex items-center justify-center border-t border-slate-800">
        <div className="flex items-center gap-12 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("grid")}
            className={`py-4 flex items-center gap-2 border-t-2 transition-colors ${
              activeTab === "grid"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>POSTLAR (GRID)</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`py-4 flex items-center gap-2 border-t-2 transition-colors ${
              activeTab === "feed"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>FEED GÖRÜNÜŞÜ</span>
          </button>

          {profile.github_username && (
            <button
              onClick={() => setActiveTab("github")}
              className={`py-4 flex items-center gap-2 border-t-2 transition-colors ${
                activeTab === "github"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Github className="w-4 h-4" />
              <span>GITHUB REPOLARI</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group"
            >
              {project.cover_image ? (
                <img
                  src={project.cover_image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-500 text-center">
                  <Terminal className="w-8 h-8 mb-2 text-blue-500/60" />
                  <span className="font-mono text-xs font-semibold text-slate-300">{project.title}</span>
                </div>
              )}

              {/* INSTAGRAM HOVER OVERLAY WITH LIKES AND COMMENTS */}
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span>{project.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                  <span>{project.comments_count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "feed" && (
        <div className="max-w-xl mx-auto space-y-6">
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
