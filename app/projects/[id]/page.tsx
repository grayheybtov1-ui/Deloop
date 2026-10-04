"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  Github, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Eye, 
  Calendar, 
  Terminal,
  Share2
} from "lucide-react";

import { Project, Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { TechBadge } from "@/components/TechBadge";
import { CommentSection } from "@/components/CommentSection";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const proj = localStore.getProjectById(id);
    if (proj) {
      setProject(proj);
      setHasLiked(!!proj.user_has_liked);
      setLikesCount(proj.likes_count || 0);
    }
    setCurrentUser(localStore.getCurrentUser());
  }, [id]);

  if (!project) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Project Not Found</h2>
        <p className="text-xs text-slate-400">The project showcase could not be located in the database.</p>
        <Link href="/projects" className="inline-block px-4 py-2 rounded-lg bg-Deloop-accent text-white text-xs font-semibold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const isAuthor = currentUser && (currentUser.id === project.user_id || currentUser.username === project.profile?.username);

  const handleLikeToggle = () => {
    const res = localStore.toggleLike(project.id);
    setHasLiked(res.liked);
    setLikesCount(res.count);
    showToast(res.liked ? "Liked!" : "Unliked", undefined, "success");
  };

  const handleDelete = () => {
    localStore.deleteProject(project.id);
    showToast("Project Deleted", `"${project.title}" has been removed.`, "info");
    router.push("/projects");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link Copied", "Project URL copied to clipboard.", "info");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* BACK BUTTON */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* PROJECT HEADER CARD */}
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl overflow-hidden shadow-xl space-y-6">
        
        {/* COVER IMAGE */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-950 border-b border-Deloop-border">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center text-slate-600">
              <Terminal className="w-16 h-16 mb-2 text-slate-700" />
              <span className="font-mono text-sm text-slate-500">{project.category} Showcase</span>
            </div>
          )}

          {/* STATUS BADGE */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-black/70 text-slate-200 border border-slate-700 backdrop-blur-md">
              {project.status}
            </span>
          </div>

          {/* EDIT/DELETE ACTIONS (FOR AUTHOR) */}
          {isAuthor && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="p-2 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-blue-400 border border-slate-700 backdrop-blur-md transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-red-400 border border-slate-700 backdrop-blur-md transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* CREATOR & METADATA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-Deloop-border pb-6">
            {project.profile && (
              <Link href={`/developers/${project.profile.username}`} className="flex items-center gap-3 group">
                <img
                  src={project.profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={project.profile.full_name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-Deloop-accent transition-colors text-sm">
                    {project.profile.full_name}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">@{project.profile.username}</p>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                Published {formatDate(project.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-500" />
                {project.views_count} views
              </span>
            </div>
          </div>

          {/* TITLE & DESCRIPTION */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* TECHNOLOGIES */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Built With:
            </span>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <TechBadge key={tech} name={tech} size="md" />
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS & LINKS */}
          <div className="pt-6 border-t border-Deloop-border flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleLikeToggle}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  hasLiked
                    ? "bg-red-950/60 text-red-400 border border-red-900/60 font-bold shadow-md"
                    : "bg-slate-900 text-slate-300 border border-Deloop-border hover:bg-slate-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-400 text-red-400" : ""}`} />
                <span>{likesCount} Likes</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-Deloop-border transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-Deloop-border text-xs font-semibold flex items-center gap-2 transition-colors font-mono"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.live_demo_url && (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <CommentSection projectId={project.id} />

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Project Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete <strong className="text-white">"{project.title}"</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-Deloop-border text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
