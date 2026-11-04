"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FolderGit2,
  User,
  ArrowRight,
  Code2,
  Sparkles,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { dbGetProjects, dbGetAllProfiles } from "@/lib/supabase/db";
import { Project, Profile } from "@/types";
import { getSavedLanguage, Language } from "@/lib/i18n";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lang, setLang] = useState<Language>("tr");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
  }, []);

  // Fetch data on modal open
  useEffect(() => {
    if (!isOpen) return;

    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const loadData = async () => {
      try {
        const [projList, profList] = await Promise.all([
          dbGetProjects(),
          dbGetAllProfiles(),
        ]);
        setProjects(projList.length > 0 ? projList : localStore.getProjects());
        setProfiles(profList.length > 0 ? profList : localStore.getProfiles());
      } catch {
        setProjects(localStore.getProjects());
        setProfiles(localStore.getProfiles());
      }
    };
    loadData();
  }, [isOpen]);

  // Reset query on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered results
  const filteredProjects = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.technologies?.some((t) => t.toLowerCase().includes(q)) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [query, projects]);

  const filteredProfiles = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return profiles.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.developer_title?.toLowerCase().includes(q) ||
        p.skills?.some((s) => s.toLowerCase().includes(q))
    );
  }, [query, profiles]);

  const allResults = useMemo(() => {
    const list: Array<{ type: "project" | "profile"; data: any }> = [];
    filteredProjects.forEach((p) => list.push({ type: "project", data: p }));
    filteredProfiles.forEach((p) => list.push({ type: "profile", data: p }));
    return list;
  }, [filteredProjects, filteredProfiles]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0
        );
      } else if (e.key === "Enter" && allResults.length > 0) {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allResults, selectedIndex]);

  const handleSelect = (item: { type: "project" | "profile"; data: any }) => {
    onClose();
    if (item.type === "project") {
      router.push(`/projects/${item.data.id}`);
    } else {
      router.push(`/developers/${item.data.username}`);
    }
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* OUTSIDE CLICK DISMISS */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl bg-white dark:bg-[#0e131f] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all">
        
        {/* SEARCH BAR INPUT */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              lang === "tr"
                ? "Proje, geliştirici veya teknoloji ara... (Örn: Next.js, React)"
                : lang === "az"
                ? "Layihə, developer və ya texnologiya axtar... (Məs: Next.js, React)"
                : "Search projects, developers or tech... (e.g. Next.js, React)"
            }
            className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-gray-500 text-[10px] font-mono">
            <span>ESC</span>
          </div>
        </div>

        {/* RESULTS BODY */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* EMPTY QUERY: SUGGESTIONS */}
          {!query.trim() && (
            <div className="p-3 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {lang === "tr"
                      ? "Popüler Teknolojiler"
                      : lang === "az"
                      ? "Populyar Texnologiyalar"
                      : "Popular Technologies"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {["React", "Next.js", "TypeScript", "Tailwind CSS", "Python", "Supabase", "Node.js", "AI", "Mobile"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => handleQuickTag(tag)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700/60 transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80">
                <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {lang === "tr" ? "Son Projeler" : lang === "az" ? "Son Layihələr" : "Recent Projects"}
                  </span>
                </p>
                <div className="space-y-1">
                  {projects.slice(0, 3).map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleSelect({ type: "project", data: proj })}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {proj.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                            {proj.technologies?.slice(0, 3).join(", ")}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QUERY TYPED: SHOW RESULTS */}
          {query.trim() && allResults.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-neutral-400 space-y-2">
              <p className="text-sm font-semibold">
                {lang === "tr"
                  ? `"${query}" ile eşleşen sonuç bulunamadı`
                  : lang === "az"
                  ? `"${query}" üzrə heç bir nəticə tapılmadı`
                  : `No results found for "${query}"`}
              </p>
              <p className="text-xs">
                {lang === "tr"
                  ? "Başka bir arama terimi deneyin."
                  : lang === "az"
                  ? "Fərqli söz və ya texnologiya adı ilə yoxlayın."
                  : "Try searching for a different keyword."}
              </p>
            </div>
          )}

          {/* RESULTS LIST */}
          {query.trim() && allResults.length > 0 && (
            <div className="space-y-1">
              {allResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                if (item.type === "project") {
                  const proj: Project = item.data;
                  return (
                    <div
                      key={`proj-${proj.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-gray-100 dark:hover:bg-neutral-800/60 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-blue-600/10 border-blue-600/20 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {proj.title}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                isSelected
                                  ? "bg-white/25 text-white"
                                  : "bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400"
                              }`}
                            >
                              {proj.category}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${
                              isSelected ? "text-blue-100" : "text-gray-500 dark:text-neutral-400"
                            }`}
                          >
                            {proj.technologies?.join(" • ")}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-blue-100 shrink-0">
                          <span>Aç</span>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const prof: Profile = item.data;
                  return (
                    <div
                      key={`prof-${prof.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-gray-100 dark:hover:bg-neutral-800/60 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            prof.avatar_url ||
                            `https://ui-avatars.com/api/?name=${prof.full_name}&background=random&size=80`
                          }
                          alt={prof.full_name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-300 dark:border-neutral-700"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {prof.full_name}
                            </span>
                            <span
                              className={`text-[11px] font-mono ${
                                isSelected ? "text-blue-200" : "text-gray-500 dark:text-neutral-400"
                              }`}
                            >
                              @{prof.username}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${
                              isSelected ? "text-blue-100" : "text-gray-500 dark:text-neutral-400"
                            }`}
                          >
                            {prof.developer_title || "Developer"}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-blue-100 shrink-0">
                          <span>Profil</span>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          )}

        </div>

        {/* FOOTER SHORTCUTS */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800">↓</kbd>
              <span>Seç</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800">↵</kbd>
              <span>Daxil ol</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800">ESC</kbd>
            <span>Bağla</span>
          </span>
        </div>

      </div>
    </div>
  );
}

