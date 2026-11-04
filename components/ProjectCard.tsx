"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ExternalLink,
  Github,
  MoreHorizontal,
  Terminal,
} from "lucide-react";
import { Project } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { dbToggleLike, dbAddComment, dbToggleBookmark, dbIsBookmarked } from "@/lib/supabase/db";
import { useToast } from "./Toast";
import { timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project: initialProject }: ProjectCardProps) {
  const router = useRouter();
  const [project] = useState<Project>(initialProject);
  const [hasLiked, setHasLiked] = useState<boolean>(!!initialProject.user_has_liked);
  const [likesCount, setLikesCount] = useState<number>(initialProject.likes_count || 0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [commentsCount, setCommentsCount] = useState<number>(initialProject.comments_count || 0);
  const { showToast } = useToast();

  useEffect(() => {
    // Check initial bookmark status
    const checkBookmark = async () => {
      try {
        const saved = await dbIsBookmarked(project.id);
        setIsSaved(saved);
      } catch {
        setIsSaved(localStore.isBookmarked(project.id));
      }
    };
    checkBookmark();

    // Listen to changes across components
    const handleBookmarkChange = (e: any) => {
      if (e?.detail?.projectId === project.id) {
        setIsSaved(e.detail.isSaved);
      }
    };
    window.addEventListener("deloop_bookmarks_changed", handleBookmarkChange);
    return () => window.removeEventListener("deloop_bookmarks_changed", handleBookmarkChange);
  }, [project.id]);

  const handleBookmarkToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const nextSaved = await dbToggleBookmark(project.id);
      setIsSaved(nextSaved);
      showToast(
        nextSaved ? "🔖 Yadda saxlanıldı" : "Yadda saxlanılanlardan çıxarıldı",
        `"${project.title}"`,
        "info"
      );
    } catch {
      const nextSaved = localStore.toggleBookmark(project.id);
      setIsSaved(nextSaved);
      showToast(
        nextSaved ? "🔖 Yadda saxlanıldı" : "Yadda saxlanılanlardan çıxarıldı",
        `"${project.title}"`,
        "info"
      );
    }
  };

  const handleLikeToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prevLiked = hasLiked;
    const prevCount = likesCount;
    const optimisticLiked = !prevLiked;
    const optimisticCount = optimisticLiked ? prevCount + 1 : Math.max(0, prevCount - 1);
    setHasLiked(optimisticLiked);
    setLikesCount(optimisticCount);

    try {
      const result = await dbToggleLike(project.id);
      setHasLiked(result.liked);
      setLikesCount(result.count);
      try { localStore.toggleLike(project.id); } catch { /* local cache sync is best-effort */ }
      if (result.liked) {
        showToast("❤️ Beğenildi", `"${project.title}"`, "success");
      }
    } catch {
      // Fallback to localStore if DB isn't reached
      const fallback = localStore.toggleLike(project.id);
      setHasLiked(fallback.liked);
      setLikesCount(fallback.count);
      if (fallback.liked) {
        showToast("❤️ Beğenildi", `"${project.title}"`, "success");
      }
    }
  };

  const handleDoubleClickMedia = () => {
    if (!hasLiked) handleLikeToggle();
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 850);
  };

  const handleAddQuickComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    setCommentsCount((prev) => prev + 1);

    try {
      await dbAddComment(project.id, text);
      try { localStore.addComment(project.id, text); } catch { /* local cache sync is best-effort */ }
      showToast("💬 Yorum eklendi", "", "success");
    } catch {
      localStore.addComment(project.id, text);
      showToast("💬 Yorum eklendi", "", "success");
    }
  };

  const handleDirectMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.profile) {
      router.push(`/messages?user=${project.profile.id}`);
    }
  };

  const handleCopyShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`);
      showToast("🔗 Bağlantı kopyalandı", "", "info");
    }
  };

  return (
    <article className="bg-[#f5f7fa] dark:bg-[#0b0f17] border border-gray-200/80 dark:border-neutral-800/80 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-neutral-700/80 transition-all shadow-xs">
      {/* ── 1. POST HEADER ── */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          {project.profile && (
            <Link href={`/developers/${project.profile.username}`} className="relative">
              <img
                src={
                  project.profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${project.profile.full_name}&background=random&size=80`
                }
                alt={project.profile.full_name}
                className="w-8 h-8 rounded-full object-cover border border-neutral-700/60"
              />
            </Link>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/developers/${project.profile?.username || "dev"}`}
                className="text-sm font-semibold text-gray-900 dark:text-white no-underline"
              >
                {project.profile?.username || "developer"}
              </Link>
              {/* Blue verified-style category badge */}
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(0,149,246,0.12)",
                  color: "#0095f6",
                  fontSize: "10px",
                }}
              >
                {project.category}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {timeAgo(project.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {project.profile && (
            <button
              onClick={handleDirectMessage}
              className="p-1.5 rounded-full transition-all"
              style={{ color: "var(--text-muted)" }}
              title="Şəxsi Mesaj"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="p-1.5 rounded-full"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* ── 2. POST IMAGE (Double-tap to like) ── */}
      <div
        onDoubleClick={handleDoubleClickMedia}
        className="relative w-full select-none cursor-pointer overflow-hidden"
        style={{ aspectRatio: "1 / 1", backgroundColor: "#000" }}
      >
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-center p-6"
            style={{
              background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            }}
          >
            <Terminal className="w-12 h-12 mb-3" style={{ color: "#0095f6" }} />
            <span className="font-bold text-base text-white">{project.title}</span>
            <span style={{ color: "#a8a8a8", fontSize: "12px", marginTop: "4px" }}>
              {project.category} Project
            </span>
          </div>
        )}

        {/* Double-tap heart overlay */}
        {showHeartOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          >
            <Heart
              className="like-overlay-heart"
              style={{
                width: "96px",
                height: "96px",
                fill: "white",
                color: "white",
                filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#0095f6",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,149,246,0.3)",
              fontSize: "10px",
            }}
          >
            {project.status}
          </span>
        </div>

        {/* Demo & GitHub buttons */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-white font-semibold rounded-full px-2.5 py-1 transition-all"
              style={{ backgroundColor: "#0095f6", fontSize: "11px" }}
            >
              <span>Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-full text-white transition-all"
              style={{
                backgroundColor: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* ── 3. ACTION BAR ── */}
      <div className="px-3 sm:px-4 pt-3 pb-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Like */}
            <button
              onClick={handleLikeToggle}
              className="transition-transform active:scale-90"
              style={{ lineHeight: 0 }}
            >
              <Heart
                className="w-6 h-6 transition-all"
                style={{
                  fill: hasLiked ? "#ed4956" : "none",
                  color: hasLiked ? "#ed4956" : "var(--text-main)",
                  strokeWidth: hasLiked ? 0 : 1.5,
                }}
              />
            </button>

            {/* Comment */}
            <Link
              href={`/projects/${project.id}#comments`}
              style={{ lineHeight: 0 }}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{ color: "var(--text-main)", strokeWidth: 1.5 }}
              />
            </Link>

            {/* Share */}
            <button
              onClick={handleCopyShare}
              className="transition-transform active:scale-90"
              style={{ lineHeight: 0 }}
            >
              <Send
                className="w-6 h-6"
                style={{ color: "var(--text-main)", strokeWidth: 1.5 }}
              />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            className="transition-transform active:scale-90"
            title={isSaved ? "Yadda saxlanılanlardan çıxar" : "Yadda saxla"}
            style={{ lineHeight: 0 }}
          >
            <Bookmark
              className="w-6 h-6 transition-all"
              style={{
                fill: isSaved ? "#0095f6" : "none",
                color: isSaved ? "#0095f6" : "var(--text-main)",
                strokeWidth: isSaved ? 0 : 1.5,
              }}
            />
          </button>
        </div>

        {/* LIKES COUNT */}
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {likesCount.toLocaleString()} beğeni
        </p>

        {/* CAPTION */}
        <div className="text-sm text-gray-900 dark:text-neutral-200 leading-relaxed">
          <Link
            href={`/developers/${project.profile?.username}`}
            className="font-semibold mr-1.5 text-gray-900 dark:text-white no-underline hover:underline"
          >
            {project.profile?.username}
          </Link>
          <span style={{ fontWeight: "600", color: "#0095f6" }}>[{project.title}]</span>{" "}
          <span className="text-gray-600 dark:text-neutral-400 text-xs sm:text-sm">{project.description}</span>
        </div>

        {/* HASHTAGS */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              style={{ color: "#0095f6", fontSize: "13px", cursor: "pointer" }}
            >
              #{tech.toLowerCase().replace(/\s+/g, "")}
            </span>
          ))}
        </div>

        {/* VIEW COMMENTS LINK */}
        {commentsCount > 0 && (
          <Link
            href={`/projects/${project.id}#comments`}
            className="block text-gray-500 dark:text-neutral-400 text-xs sm:text-sm no-underline hover:text-gray-700 dark:hover:text-neutral-300"
          >
            Tüm {commentsCount} yorumu gör
          </Link>
        )}

        {/* TIME */}
        <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
          {timeAgo(project.created_at)}
        </p>
      </div>

      {/* ── 4. COMMENT INPUT ── */}
      <form
        onSubmit={handleAddQuickComment}
        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-t border-gray-200 dark:border-neutral-800/80"
      >
        {/* Current user avatar */}
        <img
          src={
            localStore.getCurrentUser()?.avatar_url ||
            `https://ui-avatars.com/api/?name=U&background=random&size=60`
          }
          alt="siz"
          className="rounded-full object-cover shrink-0"
          style={{ width: "28px", height: "28px" }}
        />
        <input
          type="text"
          placeholder="Yorum ekle..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500"
        />
        {commentText.trim() && (
          <button
            type="submit"
            className="text-sm font-semibold transition-opacity"
            style={{ color: "#0095f6" }}
          >
            Paylaş
          </button>
        )}
      </form>
    </article>
  );
}
