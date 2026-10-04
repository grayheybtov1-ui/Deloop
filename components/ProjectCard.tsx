"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, ExternalLink, Github, Eye, Terminal } from "lucide-react";
import { Project } from "@/types";
import { TechBadge } from "./TechBadge";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";
import { timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project: initialProject }: ProjectCardProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [hasLiked, setHasLiked] = useState<boolean>(!!initialProject.user_has_liked);
  const [likesCount, setLikesCount] = useState<number>(initialProject.likes_count || 0);
  const { showToast } = useToast();

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = localStore.toggleLike(project.id);
    setHasLiked(result.liked);
    setLikesCount(result.count);

    showToast(
      result.liked ? "Project Liked" : "Like Removed",
      result.liked ? `You liked "${project.title}"` : undefined,
      "success"
    );
  };

  const statusColor =
    project.status === "Completed"
      ? "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
      : project.status === "In Progress"
      ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
      : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="group bg-Deloop-card border border-Deloop-border hover:border-Deloop-borderHover rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl">
      <div>
        {/* COVER IMAGE OR CODE FALLBACK HEADER */}
        <div className="relative h-44 w-full bg-slate-950 border-b border-Deloop-border overflow-hidden">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center text-slate-600">
              <Terminal className="w-10 h-10 mb-2 text-slate-700" />
              <span className="font-mono text-xs text-slate-500">{project.category} Codebase</span>
            </div>
          )}

          {/* STATUS BADGE */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border backdrop-blur-md ${statusColor}`}>
              {project.status}
            </span>
          </div>

          {/* EXTERNAL LINKS */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/50 transition-colors"
                title="GitHub Repo"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/50 transition-colors"
                title="Live Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* CARD CONTENT */}
        <div className="p-5 space-y-3">
          
          {/* AUTHOR HEADER */}
          {project.profile && (
            <Link
              href={`/developers/${project.profile.username}`}
              className="inline-flex items-center gap-2 group/author"
            >
              <img
                src={project.profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={project.profile.full_name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
              />
              <span className="text-xs text-slate-400 font-medium group-hover/author:text-slate-200 transition-colors">
                {project.profile.full_name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                • {timeAgo(project.created_at)}
              </span>
            </Link>
          )}

          {/* PROJECT TITLE */}
          <Link href={`/projects/${project.id}`}>
            <h3 className="font-bold text-slate-100 group-hover:text-Deloop-accent transition-colors text-base line-clamp-1">
              {project.title}
            </h3>
          </Link>

          {/* DESCRIPTION */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* TECHNOLOGIES */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.slice(0, 4).map((tech) => (
              <TechBadge key={tech} name={tech} size="sm" />
            ))}
            {project.technologies.length > 4 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS: LIKE & COMMENT */}
      <div className="px-5 py-3 bg-slate-900/40 border-t border-Deloop-border flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          
          {/* LIKE BUTTON */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              hasLiked
                ? "bg-red-950/50 text-red-400 border border-red-900/60 font-semibold"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-400 text-red-400" : ""}`} />
            <span>{likesCount}</span>
          </button>

          {/* COMMENTS LINK */}
          <Link
            href={`/projects/${project.id}#comments`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{project.comments_count || 0}</span>
          </Link>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="text-xs font-semibold text-Deloop-accent hover:underline flex items-center gap-1"
        >
          <span>Details</span>
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
