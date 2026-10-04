import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Deloop Gram",
  description: "Developers üçün Instagram. Layihələrini paylaş, developer-lərlə əlaqə qur.",
  keywords: ["Deloop", "DevGram", "Developer", "Portfolio", "Projects"],
  authors: [{ name: "Deloop Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Deloop Gram",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
        <ToastProvider>
          <Navbar />
          {/* main content — padding-bottom for mobile bottom nav */}
          <main
            className="w-full max-w-[935px] mx-auto px-0 sm:px-4"
            style={{ paddingTop: "60px", paddingBottom: "60px" }}
          >
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
