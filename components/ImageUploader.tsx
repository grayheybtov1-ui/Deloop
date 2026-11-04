"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, CheckCircle, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "video" | "square";
  maxSizeMB?: number;
  lang?: "az" | "tr" | "en";
}

export function ImageUploader({
  value,
  onChange,
  label,
  aspectRatio = "video",
  maxSizeMB = 5,
  lang = "az",
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"file" | "url">(value.startsWith("http") ? "url" : "file");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    az: {
      fileTab: "Fayl Yüklə",
      urlTab: "Şəkil Linki (URL)",
      dragTitle: "Şəkli bura sürükləyin və ya klikləyin",
      dragDesc: `PNG, JPG, WEBP, GIF (maksimum ${maxSizeMB}MB)`,
      invalidType: "Zəhmət olmasa düzgün şəkil formatı seçin (PNG, JPG, WEBP, GIF)",
      tooLarge: `Şəkil ölçüsü maksimum ${maxSizeMB}MB ola bilər`,
      remove: "Şəkli Sil",
      change: "Dəyiş",
      urlPlaceholder: "https://images.unsplash.com/photo-...",
    },
    tr: {
      fileTab: "Dosya Yükle",
      urlTab: "Resim Bağlantısı (URL)",
      dragTitle: "Resmi buraya sürükleyin veya tıklayın",
      dragDesc: `PNG, JPG, WEBP, GIF (maksimum ${maxSizeMB}MB)`,
      invalidType: "Lütfen geçerli bir resim formatı seçin (PNG, JPG, WEBP, GIF)",
      tooLarge: `Resim boyutu maksimum ${maxSizeMB}MB olabilir`,
      remove: "Resmi Kaldır",
      change: "Değiştir",
      urlPlaceholder: "https://images.unsplash.com/photo-...",
    },
    en: {
      fileTab: "Upload File",
      urlTab: "Image URL",
      dragTitle: "Drag & drop image here or click to browse",
      dragDesc: `PNG, JPG, WEBP, GIF (up to ${maxSizeMB}MB)`,
      invalidType: "Please select a valid image format (PNG, JPG, WEBP, GIF)",
      tooLarge: `Image size must be less than ${maxSizeMB}MB`,
      remove: "Remove Image",
      change: "Change",
      urlPlaceholder: "https://images.unsplash.com/photo-...",
    },
  }[lang];

  const processFile = (file: File) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError(t.invalidType);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(t.tooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setError("Fayl oxunarkən xəta baş verdi.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>{label}</span>
          </span>

          {/* MODE TABS */}
          <span className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-lg text-[11px] font-normal">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                mode === "file"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white font-medium shadow-xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t.fileTab}
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                mode === "url"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white font-medium shadow-xs"
                  : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {t.urlTab}
            </button>
          </span>
        </label>
      )}

      {/* PREVIEW IF HAS VALUE */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gray-900">
          <div
            className={`w-full ${
              aspectRatio === "square" ? "aspect-square max-w-[200px]" : "aspect-video"
            } overflow-hidden flex items-center justify-center`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              {t.change}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.remove}</span>
            </button>
          </div>
        </div>
      ) : mode === "file" ? (
        /* DRAG & DROP ZONE */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 scale-[0.99]"
              : "border-gray-300 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-neutral-200">
            {t.dragTitle}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
            {t.dragDesc}
          </p>
        </div>
      ) : (
        /* URL INPUT */
        <div className="space-y-1">
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t.urlPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

