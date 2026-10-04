"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderGit2, Search, Filter, Plus, Terminal } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { ProjectCard } from "@/components/ProjectCard";

const CATEGORIES = ["All", "Full Stack", "Frontend", "Backend", "AI", "Mobile", "DevOps", "Open Source"];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const projects = localStore.getProjects(selectedCategory, searchQuery);

  return (
    <div className="space-y-8 py-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-7 h-7 text-Deloop-accent" />
            <span>Discover Projects</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Explore full-stack web applications, open source libraries, and AI tools built by our community.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="px-5 py-2.5 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Project</span>
        </Link>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or technology (e.g. Supabase, Docker)..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-Deloop-accent text-white font-semibold shadow-sm"
                  : "bg-slate-900 text-slate-400 border border-Deloop-border hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTS GRID */}
      {projects.length === 0 ? (
        <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-12 text-center space-y-3">
          <Terminal className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-bold text-slate-200 text-base">No projects matched your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filter or be the first to publish a project in this category!
          </p>
          <div className="pt-2">
            <Link
              href="/projects/new"
              className="inline-block px-4 py-2 rounded-lg bg-Deloop-accent text-white text-xs font-semibold"
            >
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
