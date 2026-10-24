"use client";

import React from "react";
import Image from "next/image";

interface DeloopLogoProps {
  /**
   * "app": 3rd image (app logo / squircle badge)
   * "adaptive": 1st image in light mode, 2nd image in dark mode
   * "light": 1st image (light mode logo)
   * "dark": 2nd image (dark mode logo)
   */
  variant?: "app" | "adaptive" | "light" | "dark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { box: "w-6 h-6", img: 24, text: "text-sm", badge: "text-[9px]" },
  sm: { box: "w-8 h-8", img: 32, text: "text-base", badge: "text-[10px]" },
  md: { box: "w-10 h-10", img: 40, text: "text-lg", badge: "text-[10px]" },
  lg: { box: "w-12 h-12", img: 48, text: "text-xl", badge: "text-xs" },
  xl: { box: "w-16 h-16", img: 64, text: "text-2xl", badge: "text-xs" },
};

export function DeloopLogo({
  variant = "adaptive",
  size = "md",
  className = "",
  showText = false,
}: DeloopLogoProps) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  const renderIcon = () => {
    if (variant === "app") {
      return (
        <div
          className={`relative ${s.box} rounded-xl overflow-hidden shadow-sm border border-gray-200/80 bg-neutral-900 flex items-center justify-center shrink-0 ${className}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app-logo.png"
            alt="Deloop App Logo"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (variant === "light") {
      return (
        <div className={`relative ${s.box} flex items-center justify-center shrink-0 ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.png"
            alt="Deloop Logo"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (variant === "dark") {
      return (
        <div className={`relative ${s.box} flex items-center justify-center shrink-0 ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dark.png"
            alt="Deloop Logo"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // Adaptive: displays light mode logo on light backgrounds, dark mode logo on dark backgrounds
    return (
      <div className={`relative ${s.box} flex items-center justify-center shrink-0 ${className}`}>
        {/* Light mode logo (1st image) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-light.png"
          alt="Deloop Logo"
          className="w-full h-full object-contain block dark:hidden"
        />
        {/* Dark mode logo (2nd image) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-dark.png"
          alt="Deloop Logo"
          className="w-full h-full object-contain hidden dark:block"
        />
      </div>
    );
  };

  if (!showText) {
    return renderIcon();
  }

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {renderIcon()}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors ${s.text}`}
        >
          Deloop
        </span>
        <span
          className={`font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hidden sm:inline-block ${s.badge}`}
        >
          DEV
        </span>
      </div>
    </div>
  );
}
