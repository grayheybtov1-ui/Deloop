"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, User } from "lucide-react";
import { Comment, Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";
import { timeAgo } from "@/lib/utils";

interface CommentSectionProps {
  projectId: string;
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setComments(localStore.getComments(projectId));
    setCurrentUser(localStore.getCurrentUser());
  }, [projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = localStore.addComment(projectId, newComment.trim());
    setComments((prev) => [...prev, added]);
    setNewComment("");

    showToast("Comment Added", "Your feedback was published to the project.", "success");
  };

  return (
    <div id="comments" className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-Deloop-border pb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-Deloop-accent" />
          <span>Discussion ({comments.length})</span>
        </h3>
      </div>

      {/* NEW COMMENT INPUT FORM */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={currentUser.full_name}
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
          />
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a constructive comment or suggestion..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-5 py-2.5 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-Deloop-border text-center text-xs text-slate-400">
          Please{" "}
          <Link href="/login" className="text-Deloop-accent font-semibold underline">
            Log In
          </Link>{" "}
          to leave a comment on this project.
        </div>
      )}

      {/* COMMENTS LIST */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No comments yet. Be the first developer to start the discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl bg-slate-900/40 border border-Deloop-border/60 flex items-start gap-3.5"
            >
              {comment.profile && (
                <Link href={`/developers/${comment.profile.username}`}>
                  <img
                    src={comment.profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={comment.profile.full_name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                  />
                </Link>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/developers/${comment.profile?.username}`}
                      className="font-bold text-slate-200 text-xs hover:text-Deloop-accent transition-colors"
                    >
                      {comment.profile?.full_name}
                    </Link>
                    <span className="text-[11px] font-mono text-slate-500">
                      @{comment.profile?.username}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
