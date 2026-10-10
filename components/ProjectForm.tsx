"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Image, Link as LinkIcon, Code2, CheckCircle2, AlertCircle } from "lucide-react";
import { Project, ProjectStatus } from "@/types";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "./Toast";
import { getSavedLanguage, Language } from "@/lib/i18n";

interface ProjectFormProps {
  initialData?: Project;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const lang: Language = getSavedLanguage();

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
    if (!title.trim()) errs.title = lang === "tr" ? "Proje başlığı zorunludur" : "Başlıq tələb olunur";
    if (!description.trim()) errs.description = lang === "tr" ? "Açıklama zorunludur" : "Təsvir tələb olunur";
    if (description.trim().length < 20) errs.description = lang === "tr" ? "Açıklama en az 20 karakter olmalıdır" : "Təsvir ən az 20 simvol olmalıdır";
    if (!techInput.trim()) errs.technologies = lang === "tr" ? "En az bir teknoloji ekleyin" : "Ən az bir texnologiya əlavə edin";
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
      showToast(lang === "tr" ? "Proje Güncellendi" : "Layihə Yeniləndi", `"${title}"`, "success");
      router.push(`/projects/${initialData.id}`);
    } else {
      const created = localStore.createProject(payload);
      showToast(lang === "tr" ? "Proje Paylaşıldı" : "Layihə Paylaşıldı", `"${title}"`, "success");
      router.push(`/projects/${created.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
      
      {/* FORM TITLE */}
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-blue-500" />
          <span>{isEditing ? (lang === "tr" ? "Projeyi Düzenle" : "Layihəni Düzəlt") : (lang === "tr" ? "Yeni Proje Paylaş" : "Yeni Layihə Paylaş")}</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === "tr"
            ? "Web uygulamanızı, açık kaynak projenizi veya geliştirici aracınızı toplulukla paylaşın."
            : "Veb tətbiqinizi və ya layihənizi komandayla bölüşün."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* TITLE */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300">
            {lang === "tr" ? "Proje Başlığı *" : "Layihə Başlığı *"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="örn: Deloop - Developer Network Platform"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
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
          <label className="block text-xs font-semibold text-neutral-300">
            {lang === "tr" ? "Kategori" : "Kateqoriya"}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
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
          <label className="block text-xs font-semibold text-neutral-300">
            {lang === "tr" ? "Proje Durumu" : "Layihə Statusu"}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
          >
            <option value="Completed">{lang === "tr" ? "Tamamlandı" : "Tamamlandı"}</option>
            <option value="In Progress">{lang === "tr" ? "Geliştiriliyor" : "Davam edir"}</option>
            <option value="Planning">{lang === "tr" ? "Planlama Aşamasında" : "Planlaşdırma"}</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300">
            {lang === "tr" ? "Proje Açıklaması *" : "Layihə Təsviri *"}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              lang === "tr"
                ? "Projenizin ne işe yaradığını, mimarisini ve temel özelliklerini açıklayın..."
                : "Layihənizin məqsədini və əsas xüsusiyyətlərini qeyd edin..."
            }
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors leading-relaxed"
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
          <label className="block text-xs font-semibold text-neutral-300">
            {lang === "tr" ? "Kullanılan Teknolojiler (Virgülle ayırın) *" : "İstifadə Olunan Texnologiyalar *"}
          </label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Next.js, React, TypeScript, Supabase, Tailwind CSS"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors font-mono"
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
          <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-neutral-400" />
            {lang === "tr" ? "Kapak Resmi URL (İsteğe bağlı)" : "Kaver Şəkil URL"}
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-1555066931-4365d14bab8c"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* GITHUB URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-neutral-400" />
            GitHub URL
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* LIVE DEMO URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
            Canlı Demo URL
          </label>
          <input
            type="url"
            value={liveDemoUrl}
            onChange={(e) => setLiveDemoUrl(e.target.value)}
            placeholder="https://my-app.vercel.app"
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors"
        >
          {lang === "tr" ? "İptal" : "Ləğv et"}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isEditing ? (lang === "tr" ? "Değişiklikleri Kaydet" : "Yadda Saxla") : (lang === "tr" ? "Projeyi Yayınla" : "Paylaş")}</span>
        </button>
      </div>
    </form>
  );
}
