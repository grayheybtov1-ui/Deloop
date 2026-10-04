"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { Project } from "@/types";
import { localStore } from "@/lib/supabase/store";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStore.getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const proj = localStore.getProjectById(id);
    if (proj) {
      setProject(proj);
    }
    setLoading(false);
  }, [id, router]);

  if (loading) return null;

  if (!project) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        Project not found or access denied.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <ProjectForm initialData={project} isEditing={true} />
    </div>
  );
}
