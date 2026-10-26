/**
 * Deloop — Supabase Database Layer
 * All real-time data operations via Supabase PostgreSQL
 */

import { supabase } from "./client";
import { localStore } from "./store";
import {
  Profile,
  Project,
  Comment,
  Notification,
  Message,
  PlatformStats,
  DeveloperTitle,
} from "@/types";

// ==========================================
// AUTHENTICATION
// ==========================================

export async function dbSignUp(data: {
  email: string;
  password: string;
  full_name: string;
  username: string;
  developer_title?: DeveloperTitle;
}) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        username: data.username.toLowerCase(),
        developer_title: data.developer_title || "Full-Stack Developer",
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      },
    },
  });
  if (error) throw error;
  return authData;
}

export async function dbSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function dbSignInWithGoogle() {
  // Check if Google OAuth provider is enabled in Supabase via internal API route (prevents CORS issues)
  try {
    const checkRes = await fetch("/api/auth/google-check");
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (!checkData.enabled) {
        throw new Error("SUPABASE_GOOGLE_DISABLED");
      }
    }
  } catch (err: any) {
    if (err.message === "SUPABASE_GOOGLE_DISABLED") throw err;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        typeof window !== "undefined"
          ? window.location.origin + "/projects"
          : undefined,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("Google yönləndirmə URL-i tapılmadı.");

  if (typeof window !== "undefined") {
    window.location.href = data.url;
  }
  return data;
}

export async function dbSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function dbGetCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function dbUpdatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}

export async function dbVerifyPassword(password: string): Promise<boolean> {
  const session = await dbGetCurrentSession();
  if (session?.user?.email) {
    const { error } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password,
    });
    return !error;
  }
  return false;
}

export async function dbDeleteAccount(userId: string, password: string): Promise<boolean> {
  // 1. Verify credentials
  const session = await dbGetCurrentSession();
  if (session?.user?.email) {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password,
    });
    if (authError) {
      throw new Error("Şifrə yanlışdır. Zəhmət olmasa düzgün şifrə daxil edin.");
    }
  } else {
    const verified = localStore.verifyUserPassword(userId, password);
    if (!verified) {
      throw new Error("Şifrə yanlışdır. Zəhmət olmasa düzgün şifrə daxil edin.");
    }
  }

  // 2. Cascade delete from Supabase
  try {
    await supabase.from("projects").delete().eq("user_id", userId);
    await supabase.from("comments").delete().eq("user_id", userId);
    await supabase.from("project_likes").delete().eq("user_id", userId);
    await supabase.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
    await supabase.from("notifications").delete().or(`user_id.eq.${userId},actor_id.eq.${userId}`);
    await supabase.from("messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    await supabase.from("profiles").delete().eq("id", userId);
    
    // Call RPC if registered in Postgres
    try {
      await supabase.rpc("delete_user_account");
    } catch {
      // ignore
    }

    // Call server API route (sends the session token so the server can verify the caller)
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const accessToken = session?.access_token;
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    try {
      await fetch("/api/account/delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      });
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn("Supabase cascade deletion notice:", err);
  }

  // 3. Delete from LocalStore
  localStore.deleteAccount(userId);

  // 4. Sign out
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  localStore.logout();

  return true;
}

// ==========================================
// PROFILES
// ==========================================

export async function dbGetProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function dbGetProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function dbGetAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapProfile);
}

export async function dbUpdateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const updatePayload: any = {
    full_name: updates.full_name,
    developer_title: updates.developer_title,
    bio: updates.bio,
    location: updates.location,
    website: updates.website,
    github_username: updates.github_username,
    linkedin_url: updates.linkedin_url,
    avatar_url: updates.avatar_url,
  };

  if (updates.username) {
    updatePayload.username = updates.username.toLowerCase().trim();
  }
  if (updates.skills) {
    updatePayload.skills = updates.skills;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    if (error) console.error("Error updating profile in Supabase:", error);
    return null;
  }

  // Also update metadata in Supabase auth if username or full_name changed
  if (updates.username || updates.full_name) {
    try {
      await supabase.auth.updateUser({
        data: {
          username: updates.username?.toLowerCase().trim(),
          full_name: updates.full_name,
        },
      });
    } catch {
      // ignore
    }
  }

  return mapProfile(data);
}

// ==========================================
// PROJECTS
// ==========================================

export async function dbGetProjects(options?: {
  category?: string;
  query?: string;
  userId?: string;
  limit?: number;
}): Promise<Project[]> {
  let q = supabase
    .from("projects")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });

  if (options?.category && options.category !== "All") {
    q = q.ilike("category", options.category);
  }
  if (options?.userId) {
    q = q.eq("user_id", options.userId);
  }
  if (options?.limit) {
    q = q.limit(options.limit);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  const session = await dbGetCurrentSession();
  const currentUserId = session?.user?.id;

  const projects = await Promise.all(
    data.map(async (p) => {
      const { count: likesCount } = await supabase
        .from("project_likes")
        .select("*", { count: "exact", head: true })
        .eq("project_id", p.id);

      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("project_id", p.id);

      let userHasLiked = false;
      if (currentUserId) {
        const { data: likeData } = await supabase
          .from("project_likes")
          .select("id")
          .eq("project_id", p.id)
          .eq("user_id", currentUserId)
          .maybeSingle();
        userHasLiked = !!likeData;
      }

      return mapProject(p, likesCount || 0, commentsCount || 0, userHasLiked);
    })
  );

  if (options?.query) {
    const qStr = options.query.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(qStr) ||
        p.description.toLowerCase().includes(qStr) ||
        p.technologies.some((t) => t.toLowerCase().includes(qStr))
    );
  }

  return projects;
}

export async function dbGetProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, profile:profiles(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;

  // Increment view count
  await supabase
    .from("projects")
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq("id", id);

  const { count: likesCount } = await supabase
    .from("project_likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  const { count: commentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  const session = await dbGetCurrentSession();
  let userHasLiked = false;
  if (session?.user) {
    const { data: likeData } = await supabase
      .from("project_likes")
      .select("id")
      .eq("project_id", id)
      .eq("user_id", session.user.id)
      .maybeSingle();
    userHasLiked = !!likeData;
  }

  return mapProject(data, likesCount || 0, commentsCount || 0, userHasLiked);
}

export async function dbCreateProject(projectData: {
  title: string;
  description: string;
  cover_image?: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  category: string;
  status: string;
}): Promise<Project> {
  const session = await dbGetCurrentSession();
  if (!session?.user) throw new Error("Layihə paylaşmaq üçün zəhmət olmasa daxil olun.");

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...projectData, user_id: session.user.id, views_count: 0 })
    .select("*, profile:profiles(*)")
    .single();

  if (error) throw error;
  return mapProject(data, 0, 0, false);
}

export async function dbUpdateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      title: updates.title,
      description: updates.description,
      cover_image: updates.cover_image,
      technologies: updates.technologies,
      github_url: updates.github_url,
      live_demo_url: updates.live_demo_url,
      category: updates.category,
      status: updates.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, profile:profiles(*)")
    .single();
  if (error || !data) return null;
  return mapProject(data, 0, 0, false);
}

export async function dbDeleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return !error;
}

// ==========================================
// LIKES
// ==========================================

export async function dbToggleLike(projectId: string): Promise<{ liked: boolean; count: number }> {
  const session = await dbGetCurrentSession();
  if (!session?.user) throw new Error("Bəyənmək üçün zəhmət olmasa daxil olun.");
  const userId = session.user.id;

  const { data: existing } = await supabase
    .from("project_likes")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("project_likes").delete().eq("project_id", projectId).eq("user_id", userId);
  } else {
    await supabase.from("project_likes").insert({ project_id: projectId, user_id: userId });
    const { data: project } = await supabase.from("projects").select("user_id").eq("id", projectId).single();
    if (project && project.user_id !== userId) {
      await supabase.from("notifications").insert({
        user_id: project.user_id,
        actor_id: userId,
        type: "like",
        project_id: projectId,
        is_read: false,
      });
    }
  }

  const { count } = await supabase
    .from("project_likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  return { liked: !existing, count: count || 0 };
}

// ==========================================
// COMMENTS
// ==========================================

export async function dbGetComments(projectId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profile:profiles(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(mapComment);
}

export async function dbAddComment(projectId: string, content: string): Promise<Comment> {
  const session = await dbGetCurrentSession();
  if (!session?.user) throw new Error("Şərh yazmaq üçün zəhmət olmasa daxil olun.");
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("comments")
    .insert({ project_id: projectId, user_id: userId, content })
    .select("*, profile:profiles(*)")
    .single();
  if (error) throw error;

  const { data: project } = await supabase.from("projects").select("user_id").eq("id", projectId).single();
  if (project && project.user_id !== userId) {
    await supabase.from("notifications").insert({
      user_id: project.user_id,
      actor_id: userId,
      type: "comment",
      project_id: projectId,
      is_read: false,
    });
  }

  return mapComment(data);
}

// ==========================================
// FOLLOWS
// ==========================================

export async function dbToggleFollow(targetUserId: string): Promise<{ following: boolean }> {
  const session = await dbGetCurrentSession();
  if (!session?.user) throw new Error("İzləmək üçün zəhmət olmasa daxil olun.");
  const followerId = session.user.id;

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", targetUserId);
    return { following: false };
  } else {
    await supabase.from("follows").insert({ follower_id: followerId, following_id: targetUserId });
    await supabase.from("notifications").insert({
      user_id: targetUserId,
      actor_id: followerId,
      type: "follow",
      is_read: false,
    });
    return { following: true };
  }
}

export async function dbIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function dbGetNotifications(): Promise<Notification[]> {
  const session = await dbGetCurrentSession();
  if (!session?.user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(*), project:projects(id, title)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map(mapNotification);
}

export async function dbMarkNotificationRead(id: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function dbMarkAllNotificationsRead() {
  const session = await dbGetCurrentSession();
  if (!session?.user) return;
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id);
}

// ==========================================
// MESSAGES
// ==========================================

export async function dbGetMessagesBetween(userBId: string): Promise<Message[]> {
  const session = await dbGetCurrentSession();
  if (!session?.user) return [];
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)")
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${userBId}),and(sender_id.eq.${userBId},receiver_id.eq.${userId})`)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapMessage);
}

export async function dbSendMessage(receiverId: string, content: string): Promise<Message> {
  const session = await dbGetCurrentSession();
  if (!session?.user) throw new Error("Mesaj göndərmək üçün zəhmət olmasa daxil olun.");

  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: session.user.id, receiver_id: receiverId, content, is_read: false })
    .select("*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)")
    .single();

  if (error) throw error;
  return mapMessage(data);
}

// ==========================================
// STATS
// ==========================================

export async function dbGetPlatformStats(): Promise<PlatformStats> {
  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: completedProjects },
    { count: totalComments },
    { count: totalLikes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "Completed"),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("project_likes").select("*", { count: "exact", head: true }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: newUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  return {
    total_users: totalUsers || 0,
    total_projects: totalProjects || 0,
    completed_projects: completedProjects || 0,
    total_comments: totalComments || 0,
    total_likes: totalLikes || 0,
    new_users_this_month: newUsers || 0,
  };
}

// ==========================================
// ADMIN
// ==========================================

export async function dbAdminDeleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  return !error;
}

export async function dbAdminUpdateUserRole(userId: string, role: "admin" | "developer"): Promise<boolean> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  return !error;
}

// ==========================================
// MAPPERS
// ==========================================

function mapProfile(data: any): Profile {
  return {
    id: data.id,
    username: data.username,
    full_name: data.full_name,
    developer_title: data.developer_title,
    avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
    bio: data.bio,
    location: data.location,
    website: data.website,
    github_username: data.github_username,
    linkedin_url: data.linkedin_url,
    role: data.role || "developer",
    created_at: data.created_at,
    skills: data.skills || [],
    followers_count: data.followers_count || 0,
    following_count: data.following_count || 0,
    projects_count: data.projects_count || 0,
  };
}

function mapProject(data: any, likesCount: number, commentsCount: number, userHasLiked: boolean): Project {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    cover_image: data.cover_image,
    technologies: data.technologies || [],
    github_url: data.github_url,
    live_demo_url: data.live_demo_url,
    category: data.category,
    status: data.status,
    views_count: data.views_count || 0,
    likes_count: likesCount,
    comments_count: commentsCount,
    created_at: data.created_at,
    updated_at: data.updated_at,
    profile: data.profile ? mapProfile(data.profile) : undefined,
    user_has_liked: userHasLiked,
  };
}

function mapComment(data: any): Comment {
  return {
    id: data.id,
    project_id: data.project_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    profile: data.profile ? mapProfile(data.profile) : undefined,
  };
}

function mapNotification(data: any): Notification {
  return {
    id: data.id,
    user_id: data.user_id,
    actor_id: data.actor_id,
    type: data.type,
    project_id: data.project_id,
    is_read: data.is_read,
    created_at: data.created_at,
    actor: data.actor ? mapProfile(data.actor) : undefined,
    project: data.project ? { id: data.project.id, title: data.project.title } : undefined,
  };
}

function mapMessage(data: any): Message {
  return {
    id: data.id,
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    content: data.content,
    is_read: data.is_read,
    created_at: data.created_at,
    sender: data.sender ? mapProfile(data.sender) : undefined,
    receiver: data.receiver ? mapProfile(data.receiver) : undefined,
  };
}
