import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  if (!name) return "DH";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatLastSeen(dateString?: string, lang: "az" | "tr" | "en" = "az"): string {
  if (!dateString) {
    if (lang === "tr") return "Son görülme: yakınlarda";
    if (lang === "en") return "Last seen recently";
    return "Son görülmə: bu yaxınlarda";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    if (lang === "tr") return "Son görülme: yakınlarda";
    if (lang === "en") return "Last seen recently";
    return "Son görülmə: bu yaxınlarda";
  }

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) {
    if (lang === "tr") return "Az önce görüldü";
    if (lang === "en") return "Last seen just now";
    return "Az əvvəl görüldü";
  }

  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) {
    if (lang === "tr") return `Son görülme: ${minutes} dakika önce`;
    if (lang === "en") return `Last seen ${minutes}m ago`;
    return `Son görülmə: ${minutes} dəqiqə əvvəl`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    if (lang === "tr") return `Son görülme: ${hours} saat önce`;
    if (lang === "en") return `Last seen ${hours}h ago`;
    return `Son görülmə: ${hours} saat əvvəl`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (lang === "tr") return `Son görülme: Dün ${timeStr}`;
    if (lang === "en") return `Last seen yesterday at ${timeStr}`;
    return `Son görülmə: Dünən ${timeStr}`;
  }

  if (days < 7) {
    if (lang === "tr") return `Son görülme: ${days} gün önce`;
    if (lang === "en") return `Last seen ${days}d ago`;
    return `Son görülmə: ${days} gün əvvəl`;
  }

  const dateFormatted = date.toLocaleDateString([], { month: "short", day: "numeric" });
  if (lang === "tr") return `Son görülme: ${dateFormatted}`;
  if (lang === "en") return `Last seen ${dateFormatted}`;
  return `Son görülmə: ${dateFormatted}`;
}
