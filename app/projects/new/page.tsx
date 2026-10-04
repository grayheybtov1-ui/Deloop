"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { localStore } from "@/lib/supabase/store";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStore.getCurrentUser();
    if (!user) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <ProjectForm />
    </div>
  );
}
