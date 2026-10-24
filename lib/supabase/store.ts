import { Profile, Project, Comment, Notification, PlatformStats, DeveloperTitle, Message } from "@/types";
import { supabase, isSupabaseConfigured } from "./client";

class LocalStore {
  private profiles: Profile[] = [];
  private projects: Project[] = [];
  private comments: Comment[] = [];
  private notifications: Notification[] = [];
  private messages: Message[] = [];
  private currentUser: Profile | null = null; // No one logged in initially

  constructor() {
    if (typeof window !== "undefined") {
      // 1. Clean up any leftover fake mock users
      const savedUser = localStorage.getItem("deloop_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (
            parsed &&
            parsed.username !== "geray_dev" &&
            parsed.username !== "aisha_codes" &&
            parsed.username !== "murad_backend" &&
            parsed.username !== "leyla_ai" &&
            parsed.id !== "user-1"
          ) {
            this.currentUser = parsed;
          } else {
            localStorage.removeItem("deloop_user");
          }
        } catch (e) {
          localStorage.removeItem("deloop_user");
        }
      }

      // 2. Load real profiles
      const savedProfiles = localStorage.getItem("deloop_profiles");
      if (savedProfiles) {
        try {
          const parsedProfiles: Profile[] = JSON.parse(savedProfiles);
          // filter out any old mock profiles
          this.profiles = parsedProfiles.filter(
            p =>
              p.username !== "geray_dev" &&
              p.username !== "aisha_codes" &&
              p.username !== "murad_backend" &&
              p.username !== "leyla_ai" &&
              p.id !== "user-1"
          );
        } catch (e) {
          this.profiles = [];
        }
      }

      // 3. Load real projects
      const savedProjects = localStorage.getItem("deloop_projects");
      if (savedProjects) {
        try {
          const parsedProjects: Project[] = JSON.parse(savedProjects);
          this.projects = parsedProjects.filter(p => !p.id.startsWith("proj-1") && !p.id.startsWith("proj-2") && !p.id.startsWith("proj-3") && !p.id.startsWith("proj-4"));
        } catch (e) {
          this.projects = [];
        }
      }

      // 4. Load real comments
      const savedComments = localStorage.getItem("deloop_comments");
      if (savedComments) {
        try {
          this.comments = JSON.parse(savedComments);
        } catch (e) {
          this.comments = [];
        }
      }

      // 5. Load real messages
      const savedMessages = localStorage.getItem("deloop_messages");
      if (savedMessages) {
        try {
          this.messages = JSON.parse(savedMessages);
        } catch (e) {
          this.messages = [];
        }
      }

      // 6. Load real notifications
      const savedNotifs = localStorage.getItem("deloop_notifications");
      if (savedNotifs) {
        try {
          this.notifications = JSON.parse(savedNotifs);
        } catch (e) {
          this.notifications = [];
        }
      }
    }
  }

  private persistProfiles() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_profiles", JSON.stringify(this.profiles));
    }
  }

  private persistProjects() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_projects", JSON.stringify(this.projects));
    }
  }

  private persistComments() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_comments", JSON.stringify(this.comments));
    }
  }

  private persistMessages() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_messages", JSON.stringify(this.messages));
    }
  }

  private persistNotifications() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_notifications", JSON.stringify(this.notifications));
    }
  }

  private persistUser() {
    if (typeof window !== "undefined") {
      if (this.currentUser) {
        localStorage.setItem("deloop_user", JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem("deloop_user");
      }
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  setCurrentUser(user: Profile | null) {
    this.currentUser = user;
    this.persistUser();
  }

  login(email: string, password?: string): Profile {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.profiles.find(
      p => (p as any).email?.toLowerCase() === cleanEmail ||
           p.username.toLowerCase() === cleanEmail.split("@")[0]
    );

    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    // If new real user logging in
    const username = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    const newUser: Profile = {
      id: "usr-" + Date.now(),
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1),
      developer_title: "Full-Stack Developer",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: "Developer at Deloop.",
      role: "developer",
      created_at: new Date().toISOString(),
      skills: ["React", "TypeScript", "Next.js"],
      followers_count: 0,
      following_count: 0,
      projects_count: 0,
    };
    (newUser as any).email = cleanEmail;

    this.profiles.push(newUser);
    this.persistProfiles();
    this.setCurrentUser(newUser);
    return newUser;
  }

  loginWithGoogle(data: { email: string; name?: string; avatar_url?: string }): Profile {
    const cleanEmail = data.email.trim().toLowerCase();
    let existing = this.profiles.find(
      p => (p as any).email?.toLowerCase() === cleanEmail ||
           p.username.toLowerCase() === cleanEmail.split("@")[0]
    );

    if (existing) {
      if (data.name && (!existing.full_name || existing.full_name === existing.username)) {
        existing.full_name = data.name;
      }
      if (data.avatar_url && !existing.avatar_url) {
        existing.avatar_url = data.avatar_url;
      }
      this.persistProfiles();
      this.setCurrentUser(existing);
      return existing;
    }

    const username = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    const newUser: Profile = {
      id: "usr-google-" + Date.now(),
      username,
      full_name: data.name || (username.charAt(0).toUpperCase() + username.slice(1)),
      developer_title: "Full-Stack Developer",
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: "Developer at Deloop via Google.",
      role: "developer",
      created_at: new Date().toISOString(),
      skills: ["React", "JavaScript", "TypeScript"],
      followers_count: 0,
      following_count: 0,
      projects_count: 0,
    };
    (newUser as any).email = cleanEmail;

    this.profiles.push(newUser);
    this.persistProfiles();
    this.setCurrentUser(newUser);
    return newUser;
  }

  register(data: { full_name: string; username: string; email: string; developer_title?: DeveloperTitle; password?: string }): Profile {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    const existingUser = this.profiles.find(p => p.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      throw new Error("Bu istifadəçi adı artıq götürülüb. Zəhmət olmasa başqa bir ad seçin.");
    }

    const newUser: Profile = {
      id: "usr-" + Date.now(),
      username: cleanUsername,
      full_name: data.full_name.trim(),
      developer_title: data.developer_title || "Full-Stack Developer",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: `${data.developer_title || "Full-Stack Developer"} building scalable web applications.`,
      role: cleanUsername === "admin" ? "admin" : "developer",
      created_at: new Date().toISOString(),
      skills: ["JavaScript", "TypeScript", "React", "Next.js"],
      followers_count: 0,
      following_count: 0,
      projects_count: 0,
    };
    (newUser as any).email = cleanEmail;

    this.profiles.push(newUser);
    this.persistProfiles();
    this.setCurrentUser(newUser);
    return newUser;
  }

  logout() {
    this.setCurrentUser(null);
    if (isSupabaseConfigured()) {
      try {
        supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
  }

  // ==========================================
  // PROFILES
  // ==========================================
  getProfiles(): Profile[] {
    return this.profiles;
  }

  getProfileByUsername(username: string): Profile | null {
    return this.profiles.find(p => p.username.toLowerCase() === username.toLowerCase()) || null;
  }

  updateProfile(username: string, updates: Partial<Profile>): Profile | null {
    const idx = this.profiles.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...updates };
      this.persistProfiles();
      if (this.currentUser && this.currentUser.username.toLowerCase() === username.toLowerCase()) {
        this.currentUser = this.profiles[idx];
        this.persistUser();
      }
      return this.profiles[idx];
    }
    return null;
  }

  // ==========================================
  // PROJECTS
  // ==========================================
  getProjects(category?: string, query?: string): Project[] {
    let result = [...this.projects];
    if (category && category !== "All") {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getProjectById(id: string): Project | null {
    return this.projects.find(p => p.id === id) || null;
  }

  createProject(projectData: Omit<Project, "id" | "created_at" | "views_count" | "likes_count" | "comments_count">): Project {
    if (!this.currentUser) {
      throw new Error("Layihə paylaşmaq üçün zəhmət olmasa daxil olun.");
    }

    const newProject: Project = {
      ...projectData,
      id: "proj-" + Date.now(),
      created_at: new Date().toISOString(),
      views_count: 1,
      likes_count: 0,
      comments_count: 0,
      profile: this.currentUser,
      user_id: this.currentUser.id,
      user_has_liked: false,
    };
    this.projects.unshift(newProject);
    this.persistProjects();

    // Increment user projects_count
    if (this.currentUser) {
      this.currentUser.projects_count = (this.currentUser.projects_count || 0) + 1;
      this.updateProfile(this.currentUser.username, { projects_count: this.currentUser.projects_count });
    }

    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = { ...this.projects[idx], ...updates, updated_at: new Date().toISOString() };
      this.persistProjects();
      return this.projects[idx];
    }
    return null;
  }

  deleteProject(id: string): boolean {
    const initialLen = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    this.persistProjects();
    return this.projects.length < initialLen;
  }

  // ==========================================
  // LIKES
  // ==========================================
  toggleLike(projectId: string): { liked: boolean; count: number } {
    if (!this.currentUser) {
      throw new Error("Bəyənmək üçün zəhmət olmasa daxil olun.");
    }

    const proj = this.getProjectById(projectId);
    if (!proj) return { liked: false, count: 0 };

    if (proj.user_has_liked) {
      proj.user_has_liked = false;
      proj.likes_count = Math.max(0, proj.likes_count - 1);
    } else {
      proj.user_has_liked = true;
      proj.likes_count += 1;
      
      // notify creator
      if (proj.user_id !== this.currentUser.id) {
        this.notifications.unshift({
          id: "notif-" + Date.now(),
          user_id: proj.user_id,
          actor_id: this.currentUser.id,
          type: "like",
          project_id: proj.id,
          is_read: false,
          created_at: new Date().toISOString(),
          actor: this.currentUser,
          project: { id: proj.id, title: proj.title },
        });
        this.persistNotifications();
      }
    }
    this.persistProjects();
    return { liked: proj.user_has_liked, count: proj.likes_count };
  }

  // ==========================================
  // COMMENTS
  // ==========================================
  getComments(projectId: string): Comment[] {
    return this.comments.filter(c => c.project_id === projectId);
  }

  addComment(projectId: string, content: string): Comment {
    if (!this.currentUser) {
      throw new Error("Şərh yazmaq üçün zəhmət olmasa daxil olun.");
    }

    const newComment: Comment = {
      id: "comm-" + Date.now(),
      project_id: projectId,
      user_id: this.currentUser.id,
      content,
      created_at: new Date().toISOString(),
      profile: this.currentUser,
    };
    this.comments.push(newComment);
    this.persistComments();

    const proj = this.getProjectById(projectId);
    if (proj) {
      proj.comments_count += 1;
      this.persistProjects();

      if (proj.user_id !== this.currentUser.id) {
        this.notifications.unshift({
          id: "notif-" + Date.now(),
          user_id: proj.user_id,
          actor_id: this.currentUser.id,
          type: "comment",
          project_id: proj.id,
          is_read: false,
          created_at: new Date().toISOString(),
          actor: this.currentUser,
          project: { id: proj.id, title: proj.title },
        });
        this.persistNotifications();
      }
    }
    return newComment;
  }

  // ==========================================
  // FOLLOWS
  // ==========================================
  toggleFollow(targetProfileId: string): boolean {
    if (!this.currentUser) {
      throw new Error("İzləmək üçün zəhmət olmasa daxil olun.");
    }

    const target = this.profiles.find(p => p.id === targetProfileId);
    if (!target) return false;

    target.is_following = !target.is_following;
    if (target.is_following) {
      target.followers_count = (target.followers_count || 0) + 1;
      this.currentUser.following_count = (this.currentUser.following_count || 0) + 1;
      this.notifications.unshift({
        id: "notif-" + Date.now(),
        user_id: target.id,
        actor_id: this.currentUser.id,
        type: "follow",
        is_read: false,
        created_at: new Date().toISOString(),
        actor: this.currentUser,
      });
      this.persistNotifications();
    } else {
      target.followers_count = Math.max(0, (target.followers_count || 1) - 1);
      this.currentUser.following_count = Math.max(0, (this.currentUser.following_count || 1) - 1);
    }
    this.persistProfiles();
    this.persistUser();
    return !!target.is_following;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications(): Notification[] {
    return this.notifications;
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.persistNotifications();
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => (n.is_read = true));
    this.persistNotifications();
  }

  // ==========================================
  // DIRECT MESSAGES (DM)
  // ==========================================
  getMessages(): Message[] {
    return this.messages;
  }

  getMessagesBetween(userAId: string, userBId: string): Message[] {
    return this.messages
      .filter(
        (m) =>
          (m.sender_id === userAId && m.receiver_id === userBId) ||
          (m.sender_id === userBId && m.receiver_id === userAId)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  sendMessage(receiverId: string, content: string): Message {
    if (!this.currentUser) throw new Error("Mesaj göndərmək üçün zəhmət olmasa daxil olun.");

    const senderProfile = this.currentUser;
    const receiverProfile = this.profiles.find((p) => p.id === receiverId);

    const newMessage: Message = {
      id: "msg-" + Date.now(),
      sender_id: this.currentUser.id,
      receiver_id: receiverId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: senderProfile,
      receiver: receiverProfile,
    };

    this.messages.push(newMessage);
    this.persistMessages();
    return newMessage;
  }

  // ==========================================
  // STATS (REAL DATA)
  // ==========================================
  getStats(): PlatformStats {
    return {
      total_users: this.profiles.length,
      total_projects: this.projects.length,
      completed_projects: this.projects.filter(p => p.status === "Completed").length,
      total_comments: this.comments.length,
      total_likes: this.projects.reduce((acc, p) => acc + (p.likes_count || 0), 0),
      new_users_this_month: this.profiles.length,
    };
  }
}

export const localStore = new LocalStore();
