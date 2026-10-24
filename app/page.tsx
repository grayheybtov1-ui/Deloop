"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localStore } from "@/lib/supabase/store";
import ProjectsFeedPage from "./projects/page";
import LoginPage from "./login/page";

export default function HomePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStore.getCurrentUser();
    if (!user) {
      setIsAuth(false);
      router.replace("/login");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] dark:bg-[#0b0f17]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    return <LoginPage />;
  }

  return <ProjectsFeedPage />;
}
