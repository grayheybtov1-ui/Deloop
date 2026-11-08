"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

interface ZoomableAvatarProps {
  src: string;
  alt?: string;
  username?: string;
  fullName?: string;
  className?: string;
  containerClassName?: string;
  badge?: React.ReactNode;
}

export function ZoomableAvatar({
  src,
  alt = "Profile avatar",
  username,
  fullName,
  className = "w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border border-neutral-700/60 shadow-sm",
  containerClassName = "",
  badge,
}: ZoomableAvatarProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef<boolean>(false);
  const hasTriggeredHoldRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // TOUCH EVENTS (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isHoldingRef.current = true;
    hasTriggeredHoldRef.current = false;

    clearTimer();
    timerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        hasTriggeredHoldRef.current = true;
        setIsZoomed(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {}
        }
      }
    }, 280);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHoldingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startPosRef.current.x;
    const dy = e.touches[0].clientY - startPosRef.current.y;
    // If finger moves more than 10px (scrolling), cancel hold
    if (Math.hypot(dx, dy) > 10 && !hasTriggeredHoldRef.current) {
      clearTimer();
      isHoldingRef.current = false;
    }
  };

  const handleTouchEnd = () => {
    clearTimer();
    const wasHolding = hasTriggeredHoldRef.current;
    isHoldingRef.current = false;
    hasTriggeredHoldRef.current = false;

    if (wasHolding) {
      // Releasing finger after long-press closes the preview
      setIsZoomed(false);
    }
  };

  // MOUSE EVENTS (Desktop click & hold)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary left-click
    isHoldingRef.current = true;
    hasTriggeredHoldRef.current = false;

    clearTimer();
    timerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        hasTriggeredHoldRef.current = true;
        setIsZoomed(true);
      }
    }, 280);
  };

  const handleMouseUp = () => {
    clearTimer();
    const wasHolding = hasTriggeredHoldRef.current;
    isHoldingRef.current = false;
    hasTriggeredHoldRef.current = false;

    if (wasHolding) {
      setIsZoomed(false);
    }
  };

  const handleMouseLeave = () => {
    clearTimer();
    if (hasTriggeredHoldRef.current) {
      setIsZoomed(false);
    }
    isHoldingRef.current = false;
    hasTriggeredHoldRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    // If long press already triggered, prevent standard click action
    if (hasTriggeredHoldRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Quick click / tap also opens the zoom preview
    setIsZoomed(true);
  };

  // Close on Escape key and lock body scroll when zoomed
  useEffect(() => {
    if (!isZoomed) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed]);

  return (
    <>
      {/* AVATAR TRIGGER CONTAINER */}
      <div
        className={`relative inline-block cursor-pointer select-none group touch-manipulation ${containerClassName}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        title="Baxmaq üçün basılı saxlayın və ya klikləyin"
      >
        <img
          src={src}
          alt={alt}
          className={`${className} transition-transform duration-200 group-hover:scale-102 group-active:scale-95`}
          draggable={false}
        />

        {/* SUBTLE HOVER ZOOM HINT */}
        <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <ZoomIn className="w-5 h-5 text-white/90 drop-shadow-md" />
        </div>

        {badge}
      </div>

      {/* ZOOM MODAL / BACKDROP OVERLAY */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={() => setIsZoomed(false)}
          onTouchEnd={() => setIsZoomed(false)}
        >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors backdrop-blur-sm z-10"
            aria-label="Bağla"
          >
            <X className="w-6 h-6" />
          </button>

          {/* CENTER IMAGE CARD */}
          <div
            className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full animate-in zoom-in-75 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-neutral-900 ring-8 ring-white/5">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* USER INFO */}
            {(fullName || username) && (
              <div className="mt-5 text-center space-y-1">
                {fullName && (
                  <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">
                    {fullName}
                  </h3>
                )}
                {username && (
                  <p className="text-xs sm:text-sm font-mono text-neutral-400">
                    @{username}
                  </p>
                )}
              </div>
            )}

            <p className="text-[11px] text-neutral-500 mt-3 font-mono">
              Bağlamaq üçün ekrana toxunun
            </p>
          </div>
        </div>
      )}
    </>
  );
}

