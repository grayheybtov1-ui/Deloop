"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Users, 
  FolderGit2, 
  MessageSquare, 
  Heart, 
  UserCheck, 
  Trash2, 
  AlertTriangle,
  Lock
} from "lucide-react";

import { Profile, Project, PlatformStats } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { StatCard } from "@/components/StatCard";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "projects">("users");

  const [itemToDelete, setItemToDelete] = useState<{ type: "user" | "project"; id: string; name: string } | null>(null);

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    if (curr.role !== "admin") {
      showToast("Access Denied", "Admin privileges required to view this panel.", "error");
      router.push("/dashboard");
      return;
    }

    setCurrentUser(curr);
    setStats(localStore.getStats());
    setAllUsers(localStore.getProfiles());
    setAllProjects(localStore.getProjects());
  }, [router]);

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "project") {
      localStore.deleteProject(itemToDelete.id);
      setAllProjects((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      showToast("Admin Action", `Project "${itemToDelete.name}" was deleted.`, "info");
    }
    setItemToDelete(null);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="py-16 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Restricted Route</h2>
        <p className="text-xs text-slate-400">This area is reserved strictly for Deloop Administrators.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar user={currentUser} />

      <div className="flex-1 space-y-8">
        
        {/* ADMIN HEADER BANNER */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-Deloop-card to-slate-900 border border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Deloop Administration System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor system growth, manage registered developer accounts, and moderate platform projects.
          </p>
        </div>

        {/* METRICS STATS GRID */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon={<Users className="w-5 h-5 text-blue-400" />}
              trend={{ value: `+${stats.new_users_this_month} new`, isPositive: true }}
            />
            <StatCard
              title="Total Projects"
              value={stats.total_projects}
              icon={<FolderGit2 className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Total Comments"
              value={stats.total_comments}
              icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
            />
            <StatCard
              title="Total Likes"
              value={stats.total_likes}
              icon={<Heart className="w-5 h-5 text-red-400 fill-red-400" />}
            />
          </div>
        )}

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-3 border-b border-Deloop-border pb-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "users"
                ? "bg-amber-500 text-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Developer Users ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "projects"
                ? "bg-amber-500 text-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Projects Showcase ({allProjects.length})</span>
          </button>
        </div>

        {/* USERS TABLE */}
        {activeTab === "users" && (
          <div className="bg-Deloop-card border border-Deloop-border rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-Deloop-border font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Developer</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5">Projects</th>
                  <th className="px-4 py-3.5">Followers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-Deloop-border text-slate-300">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2.5">
                      <img
                        src={u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={u.full_name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div>
                        <div>{u.full_name}</div>
                        <div className="text-[11px] font-mono text-slate-500">@{u.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "admin"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">{u.projects_count || 0}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{u.followers_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROJECTS TABLE */}
        {activeTab === "projects" && (
          <div className="bg-Deloop-card border border-Deloop-border rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-Deloop-border font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Likes</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-Deloop-border text-slate-300">
                {allProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      <div>{proj.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">by @{proj.profile?.username}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{proj.category}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-red-400">{proj.likes_count}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setItemToDelete({ type: "project", id: proj.id, name: proj.title })}
                        className="p-1.5 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-Deloop-border transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ADMIN DELETE MODAL */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Admin Confirmation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Confirm administrative deletion of <strong className="text-white">"{itemToDelete?.name}"</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setItemToDelete(null)}
              className="px-4 py-2 rounded-lg border border-Deloop-border text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
