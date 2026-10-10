"use client";

import React, { useState } from "react";
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

  const handleLikeToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const result = localStore.toggleLike(project.id);
    setHasLiked(result.liked);
    setLikesCount(result.count);
    if (result.liked) {
      showToast("❤️ Beğenildi", `"${project.title}"`, "success");
    }
  };

  const handleDoubleClickMedia = () => {
    if (!hasLiked) handleLikeToggle();
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 850);
  };

  const handleAddQuickComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    localStore.addComment(project.id, commentText);
    setCommentsCount((prev) => prev + 1);
    setCommentText("");
    showToast("💬 Yorum eklendi", "", "success");
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
    <article
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
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
                className="text-sm font-semibold"
                style={{ color: "var(--text-main)", textDecoration: "none" }}
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
            onClick={() => {
              setIsSaved(!isSaved);
              showToast(!isSaved ? "🔖 Yadda saxlanıldı" : "Silindi", "", "info");
            }}
            style={{ lineHeight: 0 }}
          >
            <Bookmark
              className="w-6 h-6 transition-all"
              style={{
                fill: isSaved ? "var(--text-main)" : "none",
                color: "var(--text-main)",
                strokeWidth: isSaved ? 0 : 1.5,
              }}
            />
          </button>
        </div>

        {/* LIKES COUNT */}
        <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
          {likesCount.toLocaleString()} beğeni
        </p>

        {/* CAPTION */}
        <div style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: "1.5" }}>
          <Link
            href={`/developers/${project.profile?.username}`}
            className="font-semibold mr-1.5"
            style={{ color: "var(--text-main)", textDecoration: "none" }}
          >
            {project.profile?.username}
          </Link>
          <span style={{ fontWeight: "600", color: "#0095f6" }}>[{project.title}]</span>{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{project.description}</span>
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
            className="block"
            style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}
          >
            Tüm {commentsCount} yorumu gör
          </Link>
        )}

        {/* TIME */}
        <p style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {timeAgo(project.created_at)}
        </p>
      </div>

      {/* ── 4. COMMENT INPUT ── */}
      <form
        onSubmit={handleAddQuickComment}
        className="flex items-center gap-3 px-3 sm:px-4 py-2.5"
        style={{ borderTop: "1px solid var(--border-color)" }}
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
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-main)" }}
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
