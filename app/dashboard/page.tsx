"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FolderGit2, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  Github, 
  Plus, 
  Bell, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

import { Profile, Project, Notification } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { StatCard } from "@/components/StatCard";
import { Sidebar } from "@/components/Sidebar";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";

const ACTIVITY_DATA = [
  { name: "Mon", commits: 4, views: 42 },
  { name: "Tue", commits: 7, views: 89 },
  { name: "Wed", commits: 3, views: 56 },
  { name: "Thu", commits: 12, views: 140 },
  { name: "Fri", commits: 8, views: 110 },
  { name: "Sat", commits: 2, views: 45 },
  { name: "Sun", commits: 5, views: 78 },
];

const CATEGORY_PIE_DATA = [
  { name: "Full Stack", value: 4, color: "#3b82f6" },
  { name: "Frontend", value: 2, color: "#06b6d4" },
  { name: "Backend", value: 2, color: "#10b981" },
  { name: "AI", value: 1, color: "#8b5cf6" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<Profile | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    setUser(curr);
    const allProj = localStore.getProjects();
    setUserProjects(allProj.filter((p) => p.user_id === curr.id || p.profile?.username === curr.username));
    setNotifications(localStore.getNotifications().slice(0, 5));
  }, [router]);

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;
    localStore.deleteProject(projectToDelete.id);
    setUserProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
    showToast("Project Deleted", `"${projectToDelete.title}" was removed.`, "info");
    setProjectToDelete(null);
  };

  if (!user) return null;

  const completedCount = userProjects.filter((p) => p.status === "Completed").length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar user={user} />

      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 space-y-8">
        
        {/* WELCOME BANNER */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/60 via-Deloop-card to-slate-900 border border-Deloop-border overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Developer Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Welcome back, {user.full_name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage your full-stack projects, review platform statistics, and monitor GitHub activity.
              </p>
            </div>

            <Link
              href="/projects/new"
              className="px-4 py-2.5 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Project</span>
            </Link>
          </div>
        </div>

        {/* METRICS STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={userProjects.length}
            icon={<FolderGit2 className="w-5 h-5 text-blue-400" />}
            trend={{ value: "+2 this mo", isPositive: true }}
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="Followers"
            value={user.followers_count || 0}
            icon={<Users className="w-5 h-5 text-purple-400" />}
            trend={{ value: "+12%", isPositive: true }}
          />
          <StatCard
            title="Following"
            value={user.following_count || 0}
            icon={<UserCheck className="w-5 h-5 text-amber-400" />}
          />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ACTIVITY OVERVIEW AREA CHART */}
          <div className="lg:col-span-2 bg-Deloop-card border border-Deloop-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Weekly Activity & Views</h3>
                <p className="text-xs text-slate-400">Project impressions vs GitHub commits</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Last 7 Days
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACTIVITY_DATA}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PROJECT CATEGORIES PIE CHART */}
          <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Project Categories</h3>
              <p className="text-xs text-slate-400">Distribution across tech stacks</p>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_PIE_DATA}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center text-[11px] font-mono">
              {CATEGORY_PIE_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MY PROJECTS LIST SECTION */}
        <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-Deloop-border pb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-base">My Project Showcase</h3>
              <p className="text-xs text-slate-400">Manage your published codebases and live demos</p>
            </div>
            <Link
              href="/projects/new"
              className="text-xs font-semibold text-Deloop-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </Link>
          </div>

          {userProjects.length === 0 ? (
            <div className="py-10 text-center space-y-3 text-slate-400 text-xs">
              <FolderGit2 className="w-8 h-8 mx-auto text-slate-600" />
              <p>You haven't added any projects yet.</p>
              <Link
                href="/projects/new"
                className="inline-block px-4 py-2 rounded-lg bg-Deloop-accent text-white font-semibold"
              >
                Create First Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-Deloop-border">
              {userProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={proj.cover_image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150"}
                      alt={proj.title}
                      className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-bold text-slate-200 text-sm hover:text-Deloop-accent transition-colors"
                        >
                          {proj.title}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{proj.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-Deloop-border"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/projects/${proj.id}/edit`}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-blue-400 border border-Deloop-border"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 border border-Deloop-border"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Project Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white">"{projectToDelete?.title}"</strong>? This operation will remove the project, likes, and comments from the database.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setProjectToDelete(null)}
              className="px-4 py-2 rounded-lg border border-Deloop-border text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md"
            >
              Delete Project
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
