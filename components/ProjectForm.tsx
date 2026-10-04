"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Image, Link as LinkIcon, Code2, CheckCircle2, AlertCircle } from "lucide-react";
import { Project, ProjectStatus } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";

interface ProjectFormProps {
  initialData?: Project;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [category, setCategory] = useState(initialData?.category || "Full Stack");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || "Completed");
  const [techInput, setTechInput] = useState(initialData?.technologies ? initialData.technologies.join(", ") : "React, Next.js, TypeScript");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(initialData?.live_demo_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = "Project title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (description.trim().length < 20) errs.description = "Description should be at least 20 characters";
    if (!techInput.trim()) errs.technologies = "Add at least one technology tag";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const techArray = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      cover_image: coverImage.trim() || undefined,
      category,
      status,
      technologies: techArray,
      github_url: githubUrl.trim() || undefined,
      live_demo_url: liveDemoUrl.trim() || undefined,
      user_id: initialData?.user_id || localStore.getCurrentUser()?.id || "user-1",
    };

    if (isEditing && initialData) {
      localStore.updateProject(initialData.id, payload);
      showToast("Project Updated", `"${title}" has been updated successfully.`, "success");
      router.push(`/projects/${initialData.id}`);
    } else {
      const created = localStore.createProject(payload);
      showToast("Project Created", `"${title}" has been published to Deloop.`, "success");
      router.push(`/projects/${created.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 md:p-8 space-y-6">
      
      {/* FORM TITLE */}
      <div className="border-b border-Deloop-border pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-Deloop-accent" />
          <span>{isEditing ? "Edit Project Details" : "Create New Project Showcase"}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Share your web application, open source project, or developer tool with the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TITLE */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Project Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deloop - Developer Network Platform"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
          {errors.title && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          >
            <option value="Full Stack">Full Stack</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="AI">AI & Machine Learning</option>
            <option value="Mobile">Mobile App</option>
            <option value="DevOps">DevOps & Cloud</option>
            <option value="Open Source">Open Source Tool</option>
          </select>
        </div>

        {/* STATUS */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Project Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          >
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning Phase</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Project Description *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what problem your project solves, architectural choices, and key features..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors leading-relaxed"
          />
          {errors.description && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description}
            </p>
          )}
        </div>

        {/* TECHNOLOGIES */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Technologies Used (Comma Separated) *
          </label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Next.js, React, TypeScript, Supabase, Tailwind CSS"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors font-mono"
          />
          {errors.technologies && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.technologies}
            </p>
          )}
        </div>

        {/* COVER IMAGE URL */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-slate-400" />
            Cover Image URL (Optional)
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-1555066931-4365d14bab8c"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
        </div>

        {/* GITHUB URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
        </div>

        {/* LIVE DEMO URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
            Live Demo URL
          </label>
          <input
            type="url"
            value={liveDemoUrl}
            onChange={(e) => setLiveDemoUrl(e.target.value)}
            placeholder="https://my-app.vercel.app"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-Deloop-border flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-Deloop-border text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-Deloop-accent hover:bg-Deloop-accentHover text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isEditing ? "Save Changes" : "Publish Project"}</span>
        </button>
      </div>
    </form>
  );
}
