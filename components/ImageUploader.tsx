"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  X, 
  AlertCircle, 
  Crop as CropIcon, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Maximize2 
} from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "video" | "square";
  maxSizeMB?: number;
  lang?: "az" | "tr" | "en";
}

// ============================================================
// CROP MODAL COMPONENT (Canvas-based crop, zoom, and rotate)
// ============================================================
interface CropModalProps {
  imageSrc: string;
  aspectRatio?: "video" | "square";
  lang?: "az" | "tr" | "en";
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

function CropModal({ imageSrc, aspectRatio = "square", lang = "az", onCropComplete, onClose }: CropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const t = {
    az: {
      title: aspectRatio === "square" ? "Profil Şəklini Kəs və Düzəlt" : "Şəkli Kəs və Düzəlt",
      subtitle: "Şəkli dartaraq mövqeyini dəyişin, miqyas və fırlanmanı tənzimləyin.",
      zoom: "Böyüt / Kiçilt",
      rotate: "90° Fırlat",
      reset: "Sıfırla",
      cancel: "Ləğv et",
      save: "Kəs və Yadda Saxla",
    },
    tr: {
      title: aspectRatio === "square" ? "Profil Resmini Kırp ve Düzenle" : "Resmi Kırp ve Düzenle",
      subtitle: "Resmi sürükleyerek konumlandırın, yakınlaştırma ve döndürmeyi ayarlayın.",
      zoom: "Yakınlaştır / Uzaklaştır",
      rotate: "90° Döndür",
      reset: "Sıfırla",
      cancel: "İptal",
      save: "Kırp ve Kaydet",
    },
    en: {
      title: aspectRatio === "square" ? "Crop & Adjust Profile Picture" : "Crop & Adjust Image",
      subtitle: "Drag to reposition the image, adjust zoom and rotation.",
      zoom: "Zoom",
      rotate: "Rotate 90°",
      reset: "Reset",
      cancel: "Cancel",
      save: "Crop & Save",
    },
  }[lang];

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleConfirmCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const outputSize = 400; // Output dimension for avatar / crop
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport box is roughly 280x280px in UI
    const viewportSize = 280;
    const scaleFactor = outputSize / viewportSize;

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.save();

    // Center canvas context
    ctx.translate(outputSize / 2, outputSize / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom and scale
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    // Compute drawing dimensions based on original aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = viewportSize;
    let drawH = viewportSize;

    if (imgAspect > 1) {
      drawW = viewportSize * imgAspect;
    } else {
      drawH = viewportSize / imgAspect;
    }

    // Apply pan translation (rotated coordinate system adjustment)
    const rad = (-rotation * Math.PI) / 180;
    const rotPanX = pan.x * Math.cos(rad) - pan.y * Math.sin(rad);
    const rotPanY = pan.x * Math.sin(rad) + pan.y * Math.cos(rad);

    ctx.drawImage(
      img,
      -drawW / 2 + rotPanX / zoom,
      -drawH / 2 + rotPanY / zoom,
      drawW,
      drawH
    );

    ctx.restore();

    // High quality JPEG compression (only ~30-45KB)
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onCropComplete(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#121824] rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t.title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CROP VIEWPORT */}
        <div 
          className="relative bg-gray-950 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
          style={{ height: 320 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* IMAGE */}
          {imageLoaded ? (
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                transformOrigin: "center center",
              }}
              className="pointer-events-none select-none flex items-center justify-center"
            >
              <img
                src={imageSrc}
                alt="To Crop"
                className="max-w-none max-h-none select-none pointer-events-none"
                style={{ width: 280, height: 280, objectFit: "contain" }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="text-xs text-neutral-500">Yüklənir...</div>
          )}

          {/* CROP OVERLAY MASK */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened backdrop with circular cut-out for avatar */}
            <div 
              className={`w-[260px] h-[260px] border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none ${
                aspectRatio === "square" ? "rounded-full" : "rounded-xl"
              }`}
            />
            {/* Grid overlay lines */}
            <div className={`absolute w-[260px] h-[260px] pointer-events-none border border-white/30 grid grid-cols-3 grid-rows-3 ${
              aspectRatio === "square" ? "rounded-full" : "rounded-xl"
            }`}>
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-4 bg-gray-50 dark:bg-[#0e131d] space-y-3 border-t border-gray-200 dark:border-neutral-800">
          {/* ZOOM SLIDER */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 rounded-lg text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={0.6}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, z + 0.2))}
              className="p-1.5 rounded-lg text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* ROTATE & RESET */}
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors"
              title={t.rotate}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>90°</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-white text-xs font-medium transition-colors"
            >
              {t.reset}
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-medium transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN IMAGE UPLOADER COMPONENT
// ============================================================
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
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
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
      crop: "Qıraqları Kəs / Düzəlt",
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
      crop: "Kırp / Düzenle",
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
      crop: "Crop & Adjust",
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
        // Open Crop modal immediately for avatar/square uploads or allow cropping
        if (aspectRatio === "square") {
          setCropImageSrc(result);
        } else {
          onChange(result);
        }
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
    <>
      {/* CROP MODAL */}
      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          aspectRatio={aspectRatio}
          lang={lang}
          onCropComplete={(croppedUrl) => {
            onChange(croppedUrl);
            setCropImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          onClose={() => {
            setCropImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}

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
          <>
          <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900">
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

            {/* OVERLAY ACTIONS (Change, Crop, Remove) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              {/* CROP BUTTON */}
              <button
                type="button"
                onClick={() => setCropImageSrc(value)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                title={t.crop}
              >
                <CropIcon className="w-3.5 h-3.5" />
                <span>{t.crop}</span>
              </button>

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
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                title={t.remove}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* VISIBLE CONTROLS FOR MOBILE AND QUICK ACCESS */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCropImageSrc(value)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <CropIcon className="w-3.5 h-3.5" />
              <span>{t.crop}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 text-xs font-medium transition-colors active:scale-95"
            >
              {t.change}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-medium transition-colors flex items-center gap-1 active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.remove}</span>
            </button>
          </div>
          </>
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
    </>
  );
}
