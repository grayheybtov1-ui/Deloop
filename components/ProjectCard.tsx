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
  Share2
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
      showToast("Bəyənildi ❤️", `"${project.title}" postunu bəyəndiniz`, "success");
    }
  };

  const handleDoubleClickMedia = () => {
    if (!hasLiked) {
      handleLikeToggle();
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 900);
  };

  const handleAddQuickComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    localStore.addComment(project.id, commentText);
    setCommentsCount((prev) => prev + 1);
    setCommentText("");
    showToast("Rəy əlavə edildi 💬", "Rəyiniz postun altına yazıldı.", "success");
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
      showToast("Link kopyalandı 🔗", "Postun linki kopyalandı.", "info");
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* 1. INSTAGRAM POST HEADER */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          {project.profile && (
            <Link href={`/developers/${project.profile.username}`} className="relative group">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform">
                <img
                  src={project.profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={project.profile.full_name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-950"
                />
              </div>
            </Link>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <Link 
                href={`/developers/${project.profile?.username || "dev"}`}
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm transition-colors"
              >
                {project.profile?.full_name || "Tərtibatçı"}
              </Link>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">@{project.profile?.username}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">{project.category}</span>
              <span>•</span>
              <span>{timeAgo(project.created_at)}</span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT DM & OPTIONS MENU */}
        <div className="flex items-center gap-1">
          {project.profile && (
            <button
              onClick={handleDirectMessage}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Şəxsi Mesaj (DM)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>

      {/* 2. INSTAGRAM POST MEDIA (Double Click to Like) */}
      <div 
        onDoubleClick={handleDoubleClickMedia}
        className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer select-none group"
      >
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 text-center text-slate-200">
            <Terminal className="w-10 h-10 mb-2 text-blue-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-100">{project.title}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{project.category} Codebase</span>
          </div>
        )}

        {/* DOUBLE CLICK INSTAGRAM HEART OVERLAY */}
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs animate-in fade-in zoom-in duration-200">
            <Heart className="w-20 h-20 fill-red-500 text-red-500 animate-bounce drop-shadow-2xl" />
          </div>
        )}

        {/* STATUS OVERLAY */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 text-blue-400 border border-blue-500/30 backdrop-blur-md shadow-md">
            {project.status}
          </span>
        </div>

        {/* DEMO & GITHUB BUTTONS */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md transition-transform hover:scale-105"
            >
              <span>Canlı Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-200 backdrop-blur-md border border-slate-700 transition-transform hover:scale-105"
              title="GitHub Repozitoriyası"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 3. INSTAGRAM ACTION BAR */}
      <div className="p-3 sm:p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            
            {/* LIKE BUTTON */}
            <button
              onClick={handleLikeToggle}
              className="group text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors focus:outline-none"
            >
              <Heart 
                className={`w-5.5 h-5.5 transition-transform group-hover:scale-110 ${
                  hasLiked ? "fill-red-500 text-red-500" : ""
                }`} 
              />
            </button>

            {/* COMMENT BUTTON */}
            <Link
              href={`/projects/${project.id}#comments`}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5.5 h-5.5 hover:scale-110 transition-transform" />
            </Link>

            {/* SHARE LINK */}
            <button
              onClick={handleCopyShare}
              className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Linki Kopyala"
            >
              <Share2 className="w-5 h-5 hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* BOOKMARK BUTTON */}
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              showToast(
                !isSaved ? "Yadda saxlanıldı 🔖" : "Silindi",
                !isSaved ? "Post kolleksiyanıza əlavə olundu." : undefined,
                "info"
              );
            }}
            className="text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
          >
            <Bookmark className={`w-5.5 h-5.5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>

        {/* LIKES COUNTER */}
        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
          <span>{likesCount} bəyənmə</span>
        </div>

        {/* CAPTION & HASHTAGS */}
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="text-slate-800 dark:text-slate-300 leading-relaxed">
            <Link 
              href={`/developers/${project.profile?.username}`}
              className="font-bold text-slate-900 dark:text-slate-100 mr-2 hover:underline"
            >
              {project.profile?.full_name}
            </Link>
            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">[{project.title}]</span>
            {project.description}
          </p>

          {/* HASHTAGS */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {project.technologies.map((tech) => (
              <span key={tech} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-mono text-[11px]">
                #{tech.toLowerCase().replace(/\s+/g, "")}
              </span>
            ))}
          </div>
        </div>

        {/* COMMENTS LINK */}
        {commentsCount > 0 && (
          <Link
            href={`/projects/${project.id}#comments`}
            className="block text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
          >
            Bütün {commentsCount} rəyə baxın...
          </Link>
        )}

        {/* INLINE QUICK COMMENT */}
        <form onSubmit={handleAddQuickComment} className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <input
            type="text"
            placeholder="Rəy yazın..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 disabled:opacity-40 transition-colors"
          >
            Paylaş
          </button>
        </form>

      </div>

    </article>
  );
}
