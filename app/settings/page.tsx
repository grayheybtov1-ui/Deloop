"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Share2, 
  Palette, 
  Save, 
  CheckCircle2, 
  Github, 
  Globe, 
  Linkedin,
  Code2 
} from "lucide-react";

import { Profile, DeveloperTitle } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<Profile | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "social" | "appearance">("profile");

  // FORM FIELDS
  const [fullName, setFullName] = useState("");
  const [developerTitle, setDeveloperTitle] = useState<DeveloperTitle>("Full-Stack Developer");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const [githubUsername, setGithubUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const curr = localStore.getCurrentUser();
    if (!curr) {
      router.push("/login");
      return;
    }
    setUser(curr);
    setFullName(curr.full_name || "");
    setDeveloperTitle(curr.developer_title || "Full-Stack Developer");
    setBio(curr.bio || "");
    setLocation(curr.location || "");
    setSkillsInput(curr.skills ? curr.skills.join(", ") : "");
    setGithubUsername(curr.github_username || "");
    setWebsite(curr.website || "");
    setLinkedinUrl(curr.linkedin_url || "");
  }, [router]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const skillsArray = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated = localStore.updateProfile(user.username, {
      full_name: fullName.trim(),
      developer_title: developerTitle,
      bio: bio.trim(),
      location: location.trim(),
      skills: skillsArray,
      github_username: githubUsername.trim(),
      website: website.trim(),
      linkedin_url: linkedinUrl.trim(),
    });

    if (updated) {
      setUser(updated);
      showToast("Settings Saved", "Your profile details have been updated.", "success");
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Error", "Password must be at least 6 characters.", "error");
      return;
    }
    setNewPassword("");
    showToast("Security", "Password updated successfully.", "success");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar user={user} />

      <div className="flex-1 space-y-6">
        
        {/* SETTINGS HEADER */}
        <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-Deloop-accent" />
            <span>Account Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your developer profile details, specialization, security, and social links.
          </p>
        </div>

        {/* SECTION TABS */}
        <div className="flex items-center gap-2 border-b border-Deloop-border pb-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveSection("profile")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeSection === "profile"
                ? "bg-Deloop-accent text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveSection("social")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeSection === "social"
                ? "bg-Deloop-accent text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social & GitHub</span>
          </button>

          <button
            onClick={() => setActiveSection("security")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeSection === "security"
                ? "bg-Deloop-accent text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveSection("appearance")}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeSection === "appearance"
                ? "bg-Deloop-accent text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>
        </div>

        {/* TAB CONTENT: PROFILE DETAILS */}
        {activeSection === "profile" && (
          <form onSubmit={handleSaveProfile} className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-slate-100 text-sm border-b border-Deloop-border pb-3">
              Developer Identity Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">Developer Specialization</label>
                <select
                  value={developerTitle}
                  onChange={(e) => setDeveloperTitle(e.target.value as DeveloperTitle)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI / Data Engineer">AI / Data Engineer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Baku, Azerbaijan"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">Developer Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your architectural focus, experience, and interests..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">Skills (Comma Separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Next.js, React, TypeScript, Node.js, PostgreSQL"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-Deloop-border flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB CONTENT: SOCIAL LINKS */}
        {activeSection === "social" && (
          <form onSubmit={handleSaveProfile} className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-slate-100 text-sm border-b border-Deloop-border pb-3">
              GitHub & Social Profiles
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-slate-400" />
                  GitHub Username (for API integration)
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="octocat"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Personal Website / Portfolio
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-slate-400" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-Deloop-border flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Links</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB CONTENT: SECURITY */}
        {activeSection === "security" && (
          <form onSubmit={handlePasswordUpdate} className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-slate-100 text-sm border-b border-Deloop-border pb-3">
              Password & Supabase Security
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-Deloop-border flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB CONTENT: APPEARANCE */}
        {activeSection === "appearance" && (
          <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-slate-100 text-sm border-b border-Deloop-border pb-3">
              Platform Theme & Appearance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                  theme === "dark"
                    ? "bg-slate-900 border-Deloop-accent ring-1 ring-Deloop-accent"
                    : "bg-Deloop-card border-Deloop-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs font-mono">Dark IDE Mode (Default)</span>
                  {theme === "dark" && <CheckCircle2 className="w-4 h-4 text-Deloop-accent" />}
                </div>
                <p className="text-[11px] text-slate-400">Deep slate background with blue/indigo code highlights.</p>
              </div>

              <div
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border cursor-pointer space-y-2 transition-all ${
                  theme === "light"
                    ? "bg-slate-900 border-Deloop-accent ring-1 ring-Deloop-accent"
                    : "bg-Deloop-card border-Deloop-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs font-mono">Light Developer Mode</span>
                  {theme === "light" && <CheckCircle2 className="w-4 h-4 text-Deloop-accent" />}
                </div>
                <p className="text-[11px] text-slate-400">Clean high-contrast theme for bright environments.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
