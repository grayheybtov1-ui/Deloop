"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, UserPlus, UserCheck, FolderGit2, Users, Code2 } from "lucide-react";
import { Profile } from "@/types";
import { TechBadge } from "./TechBadge";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";
import { getSavedLanguage, Language } from "@/lib/i18n";

interface DeveloperCardProps {
  profile: Profile;
}

export function DeveloperCard({ profile: initialProfile }: DeveloperCardProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialProfile.is_following);
  const { showToast } = useToast();
  const lang: Language = getSavedLanguage();

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
      newStatus ? `@${profile.username} ${lang === "tr" ? "takip ediliyor" : "təqib edilir"}` : `@${profile.username}`,
      undefined,
      "info"
    );
  };

  const titleBadgeColor =
    profile.developer_title === "Full-Stack Developer"
      ? "bg-blue-950/60 text-blue-300 border-blue-800/50"
      : profile.developer_title === "Frontend Developer"
      ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/50"
      : profile.developer_title === "Backend Developer"
      ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
      : profile.developer_title === "AI / Data Engineer"
      ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
      : "bg-neutral-800 text-neutral-300 border-neutral-700";

  return (
    <div className="group bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 flex flex-col justify-between transition-all duration-200">
      <div className="space-y-4">
        
        {/* TOP HEADER: AVATAR & INFO */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/developers/${profile.username}`} className="flex items-center gap-3 transition-colors">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={profile.full_name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-700/80 shrink-0"
            />
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight text-sm">
                {profile.full_name}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">@{profile.username}</p>
              
              {/* DEVELOPER TITLE BADGE */}
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${titleBadgeColor}`}>
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
                ? "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>{lang === "tr" ? "Takipte" : "Təqibdə"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === "tr" ? "Takip Et" : "Təqib Et"}</span>
              </>
            )}
          </button>
        </div>

        {/* BIO & LOCATION */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
          {profile.bio || "Software developer building modern web experiences."}
        </p>

        {profile.location && (
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
            <strong className="text-neutral-200">{profile.projects_count || 0}</strong> {lang === "tr" ? "proje" : "layihə"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <strong className="text-neutral-200">{profile.followers_count || 0}</strong> {lang === "tr" ? "takipçi" : "təqibçi"}
          </span>
        </div>
      </div>
    </div>
  );
}
