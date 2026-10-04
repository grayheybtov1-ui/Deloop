"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { ProjectCard } from "@/components/ProjectCard";
import { DeveloperStories } from "@/components/DeveloperStories";
import { Profile } from "@/types";
import { useToast } from "@/components/Toast";

export default function ProjectsFeedPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    setCurrentUser(curr);
    const profiles = localStore.getProfiles().filter((p) => p.id !== curr?.id);
    setSuggestedProfiles(profiles.slice(0, 5));
  }, []);

  const projects = localStore.getProjects();

  const handleFollowToggle = (profile: Profile) => {
    const isNowFollowing = localStore.toggleFollow(profile.id);
    setSuggestedProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, is_following: isNowFollowing } : p))
    );
    showToast(
      isNowFollowing ? "Təqib edildi" : "Təqibdən çıxarıldı",
      isNowFollowing ? `${profile.full_name} siyahınıza əlavə olundu` : undefined,
      "info"
    );
  };

  return (
    /* Instagram uses a centered 2-column layout on desktop:
       left = feed (max-w-[470px]), right = sidebar */
    <div className="flex justify-center gap-8 px-0 sm:px-4" style={{ paddingTop: "8px" }}>

      {/* ─────────── LEFT: FEED ─────────── */}
      <div className="w-full" style={{ maxWidth: "470px" }}>

        {/* STORIES */}
        <DeveloperStories />

        {/* POSTS */}
        <div>
          {projects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ border: "2px solid var(--border-color)" }}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: "var(--text-main)" }}>
                Hələ post yoxdur
              </h3>
              <p className="text-sm mb-4">
                İlk post paylaşan siz olun!
              </p>
              <Link
                href="/projects/new"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "#0095f6" }}
              >
                Post Paylaş
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
                className="flex items-center gap-3"
                style={{ textDecoration: "none" }}
              >
                <img
                  src={
                    currentUser.avatar_url ||
                    `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random&size=120`
                  }
                  alt={currentUser.full_name}
                  className="rounded-full object-cover"
                  style={{ width: "44px", height: "44px", border: "1px solid var(--border-color)" }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                    {currentUser.username}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {currentUser.full_name}
                  </p>
                </div>
              </Link>
              <Link
                href={`/developers/${currentUser.username}`}
                className="text-xs font-semibold"
                style={{ color: "#0095f6", textDecoration: "none" }}
              >
                Profil
              </Link>
            </div>
          )}

          {/* SUGGESTIONS HEADER */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              Sizin üçün təkliflər
            </span>
            <Link
              href="/developers"
              className="text-xs font-semibold"
              style={{ color: "var(--text-main)", textDecoration: "none" }}
            >
              Hamısı
            </Link>
          </div>

          {/* SUGGESTED ACCOUNTS */}
          <div className="space-y-3">
            {suggestedProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <Link
                  href={`/developers/${p.username}`}
                  className="flex items-center gap-2.5 min-w-0"
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src={
                      p.avatar_url ||
                      `https://ui-avatars.com/api/?name=${p.full_name}&background=random&size=80`
                    }
                    alt={p.full_name}
                    className="rounded-full object-cover shrink-0"
                    style={{ width: "32px", height: "32px", border: "1px solid var(--border-color)" }}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-main)" }}
                    >
                      {p.username}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.developer_title || "Developer"}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollowToggle(p)}
                  className="text-xs font-semibold shrink-0 ml-2 transition-all"
                  style={{
                    color: p.is_following ? "var(--text-muted)" : "#0095f6",
                    textDecoration: "none",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  {p.is_following ? "Təqibdə" : "Təqib et"}
                </button>
              </div>
            ))}
          </div>

          {/* FOOTER LINKS */}
          <div className="mt-5 space-y-1" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              {["Haqqımızda", "Dəstək", "Məxfilik", "Şərtlər", "Cookies"].map((link, i) => (
                <React.Fragment key={link}>
                  <span className="hover:underline cursor-pointer">{link}</span>
                  {i < 4 && <span>·</span>}
                </React.Fragment>
              ))}
            </div>
            <p>© 2026 DELOOP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
