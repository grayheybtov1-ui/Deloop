import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Deloop - Where Developers Build Their Identity",
  description: "Professional full-stack platform for developers to showcase projects, connect with peers, manage codebases, and analyze GitHub statistics.",
  keywords: ["Deloop", "Developer Portfolio", "GitHub API", "Full-Stack", "React", "Next.js", "Supabase"],
  authors: [{ name: "Deloop Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="flex flex-col min-h-screen bg-Deloop-bg text-slate-100 antialiased selection:bg-Deloop-accent selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
