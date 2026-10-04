"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  UserPlus, 
  UserCheck, 
  FolderGit2, 
  Users, 
  Edit3, 
  Calendar,
  Code2
} from "lucide-react";

import { Profile, Project } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { TechBadge } from "@/components/TechBadge";
import { ProjectCard } from "@/components/ProjectCard";
import { GitHubStatsCard } from "@/components/GitHubStatsCard";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";

export default function DeveloperProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "github">("projects");
  const { showToast } = useToast();

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
        <h2 className="text-2xl font-bold text-slate-100">Developer Profile Not Found</h2>
        <p className="text-xs text-slate-400">The developer @{username} does not exist or has been removed.</p>
        <Link href="/developers" className="inline-block px-4 py-2 rounded-lg bg-Deloop-accent text-white text-xs font-semibold">
          Back to Developers
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
      newStatus ? `Following @${profile.username}` : `Unfollowed @${profile.username}`,
      undefined,
      "info"
    );
  };

  const titleBadgeColor =
    profile.developer_title === "Full-Stack Developer"
      ? "bg-blue-950/80 text-blue-300 border-blue-700/60"
      : profile.developer_title === "Frontend Developer"
      ? "bg-cyan-950/80 text-cyan-300 border-cyan-700/60"
      : profile.developer_title === "Backend Developer"
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
      : profile.developer_title === "AI / Data Engineer"
      ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
      : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="space-y-8 py-4">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
              alt={profile.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-Deloop-border shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {profile.full_name}
                </h1>
                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${titleBadgeColor}`}>
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  {profile.developer_title || "Full-Stack Developer"}
                </span>
              </div>
              <p className="text-sm font-mono text-Deloop-accent">@{profile.username}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            {isSelf ? (
              <Link
                href="/settings"
                className="px-4 py-2.5 rounded-xl border border-Deloop-border hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isFollowing
                    ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-red-950/40 hover:text-red-400"
                    : "bg-Deloop-accent hover:bg-Deloop-accentHover text-white shadow-md"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Developer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* BIO */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {profile.bio || "Full-stack software developer passionate about code excellence and open-source."}
        </p>

        {/* SKILLS */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-Deloop-border">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Primary Technologies:
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <TechBadge key={skill} name={skill} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* EXTERNAL LINKS & STATS */}
        <div className="pt-4 border-t border-Deloop-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-Deloop-accent transition-colors font-mono"
              >
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-mono"
              >
                <Github className="w-4 h-4" />
                <span>github.com/{profile.github_username}</span>
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors font-mono"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-6 font-mono text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <strong className="text-white text-sm">{projects.length}</strong> projects
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <strong className="text-white text-sm">{profile.followers_count || 0}</strong> followers
            </span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-3 border-b border-Deloop-border pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "projects"
              ? "bg-Deloop-accent text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("github")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "github"
              ? "bg-Deloop-accent text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Insights</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "projects" ? (
        projects.length === 0 ? (
          <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-12 text-center text-slate-400 text-xs">
            This developer has not published any project showcases yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )
      ) : (
        <GitHubStatsCard githubUsername={profile.github_username || profile.username} />
      )}
    </div>
  );
}
