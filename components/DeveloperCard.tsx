"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, UserPlus, UserCheck, FolderGit2, Users, Code2 } from "lucide-react";
import { Profile } from "@/types";
import { TechBadge } from "./TechBadge";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";

interface DeveloperCardProps {
  profile: Profile;
}

export function DeveloperCard({ profile: initialProfile }: DeveloperCardProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialProfile.is_following);
  const { showToast } = useToast();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newStatus = localStore.toggleFollow(profile.id);
    setIsFollowing(newStatus);
    setProfile((prev) => ({
      ...prev,
      followers_count: newStatus
        ? (prev.followers_count || 0) + 1
        : Math.max(0, (prev.followers_count || 1) - 1),
    }));

    showToast(
      newStatus ? `Following @${profile.username}` : `Unfollowed @${profile.username}`,
      newStatus ? `You will receive updates from ${profile.full_name}` : undefined,
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
    <div className="group bg-Deloop-card border border-Deloop-border hover:border-Deloop-borderHover rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg">
      <div className="space-y-4">
        
        {/* TOP HEADER: AVATAR & INFO */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/developers/${profile.username}`} className="flex items-center gap-3 group-hover:text-blue-400 transition-colors">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={profile.full_name}
              className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-700/60 shrink-0"
            />
            <div>
              <h3 className="font-bold text-slate-100 group-hover:text-Deloop-accent transition-colors leading-tight">
                {profile.full_name}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">@{profile.username}</p>
              
              {/* DEVELOPER TITLE BADGE */}
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${titleBadgeColor}`}>
                  <Code2 className="w-3 h-3" />
                  {profile.developer_title || "Full-Stack Developer"}
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={handleFollowToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              isFollowing
                ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50"
                : "bg-Deloop-accent/15 text-Deloop-accent border border-Deloop-accent/40 hover:bg-Deloop-accent hover:text-white"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        {/* BIO & LOCATION */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {profile.bio || "Software developer building modern web experiences."}
        </p>

        {profile.location && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* SKILLS BADGES */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.skills.slice(0, 4).map((skill) => (
              <TechBadge key={skill} name={skill} size="sm" />
            ))}
            {profile.skills.length > 4 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="mt-5 pt-4 border-t border-Deloop-border flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-200">{profile.projects_count || 0}</strong> projects
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-200">{profile.followers_count || 0}</strong> followers
          </span>
        </div>

        <Link
          href={`/developers/${profile.username}`}
          className="text-Deloop-accent text-xs font-semibold hover:underline"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
