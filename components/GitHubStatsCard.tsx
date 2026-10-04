"use client";

import React, { useEffect, useState } from "react";
import { Github, Star, GitFork, BookOpen, Users, Code2, ExternalLink } from "lucide-react";
import { GitHubUserStats } from "@/types";
import { fetchGitHubUserStats } from "@/lib/github";
import { Skeleton } from "./Skeleton";

interface GitHubStatsCardProps {
  githubUsername: string;
}

export function GitHubStatsCard({ githubUsername }: GitHubStatsCardProps) {
  const [stats, setStats] = useState<GitHubUserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!githubUsername) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchGitHubUserStats(githubUsername);
      setStats(res);
      setLoading(false);
    }

    loadStats();
  }, [githubUsername]);

  if (loading) {
    return (
      <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 text-center text-slate-400 text-xs">
        <Github className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        No GitHub username linked to this profile yet.
      </div>
    );
  }

  return (
    <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-Deloop-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
              GitHub Insights
              <span className="text-xs font-mono font-normal text-slate-400">@{stats.username}</span>
            </h3>
            <p className="text-xs text-slate-400">Live stats synced from GitHub REST API</p>
          </div>
        </div>

        <a
          href={`https://github.com/${stats.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-Deloop-accent hover:underline flex items-center gap-1"
        >
          <span>View GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-Deloop-border flex flex-col items-center justify-center text-center">
          <BookOpen className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-lg font-bold text-slate-100">{stats.public_repos}</span>
          <span className="text-[11px] font-mono text-slate-400">Public Repos</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-Deloop-border flex flex-col items-center justify-center text-center">
          <Star className="w-4 h-4 text-amber-400 mb-1" />
          <span className="text-lg font-bold text-slate-100">{stats.total_stars}</span>
          <span className="text-[11px] font-mono text-slate-400">Total Stars</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-Deloop-border flex flex-col items-center justify-center text-center">
          <Users className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-lg font-bold text-slate-100">{stats.followers}</span>
          <span className="text-[11px] font-mono text-slate-400">Followers</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-Deloop-border flex flex-col items-center justify-center text-center">
          <Code2 className="w-4 h-4 text-purple-400 mb-1" />
          <span className="text-lg font-bold text-slate-100">{Object.keys(stats.languages).length}</span>
          <span className="text-[11px] font-mono text-slate-400">Languages</span>
        </div>
      </div>

      {/* TOP LANGUAGES BREAKDOWN */}
      {Object.keys(stats.languages).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Most Used Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.languages).map(([lang, count]) => (
              <div
                key={lang}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-Deloop-border text-xs flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-Deloop-accent" />
                <span className="font-semibold text-slate-200">{lang}</span>
                <span className="text-[11px] font-mono text-slate-400">({count} repos)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT REPOSITORIES LIST */}
      {stats.recent_repos.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Recent Repositories
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.recent_repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-900/40 border border-Deloop-border hover:border-Deloop-borderHover transition-all flex flex-col justify-between group/repo"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-200 text-xs group-hover/repo:text-Deloop-accent transition-colors font-mono">
                      {repo.name}
                    </h5>
                    <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover/repo:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  {repo.language && <span className="text-slate-300">{repo.language}</span>}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-slate-400" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
