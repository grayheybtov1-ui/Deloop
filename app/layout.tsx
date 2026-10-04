import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Deloop Gram - Instagram for Developers",
  description: "Web App for developers to showcase projects, connect with peers, send direct messages, and build identity.",
  keywords: ["Deloop", "DevGram", "Developer Instagram", "React", "Next.js", "Supabase"],
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
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
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
      <body className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-2.5 sm:px-4 lg:px-6 py-4 md:py-6">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
