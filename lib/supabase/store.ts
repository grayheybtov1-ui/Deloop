import { Profile, Project, Comment, Notification, PlatformStats, DeveloperTitle } from "@/types";
import { MOCK_PROFILES, MOCK_PROJECTS, MOCK_COMMENTS, MOCK_NOTIFICATIONS, MOCK_STATS } from "@/lib/mock-data";

class LocalStore {
  private profiles: Profile[] = [...MOCK_PROFILES];
  private projects: Project[] = [...MOCK_PROJECTS];
  private comments: Comment[] = [...MOCK_COMMENTS];
  private notifications: Notification[] = [...MOCK_NOTIFICATIONS];
  private currentUser: Profile | null = MOCK_PROFILES[0]; // Logged in as Geray Heybetov by default

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("deloop_user");
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          // keep default
        }
      }
      const savedProjects = localStorage.getItem("deloop_projects");
      if (savedProjects) {
        try {
          this.projects = JSON.parse(savedProjects);
        } catch (e) {
          // keep default
        }
      }
    }
  }

  private persistProjects() {
    if (typeof window !== "undefined") {
      localStorage.setItem("deloop_projects", JSON.stringify(this.projects));
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

  // AUTH
  getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  setCurrentUser(user: Profile | null) {
    this.currentUser = user;
    this.persistUser();
  }

  login(email: string): Profile {
    const existing = this.profiles.find(p => p.username === email.split("@")[0] || p.full_name.toLowerCase().includes(email.split("@")[0].toLowerCase()));
    const user = existing || {
      ...MOCK_PROFILES[0],
      id: "user-" + Date.now(),
      full_name: email.split("@")[0].toUpperCase(),
      username: email.split("@")[0].toLowerCase(),
      developer_title: "Full-Stack Developer" as DeveloperTitle,
    };
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    this.setCurrentUser(null);
  }

  register(data: { full_name: string; username: string; email: string; developer_title?: DeveloperTitle }): Profile {
    const newUser: Profile = {
      id: "user-" + Date.now(),
      username: data.username,
      full_name: data.full_name,
      developer_title: data.developer_title || "Full-Stack Developer",
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
      bio: `${data.developer_title || "Full-Stack Developer"} building modern web applications.`,
      role: "developer",
      created_at: new Date().toISOString(),
      skills: ["JavaScript", "React", "Next.js"],
      followers_count: 0,
      following_count: 0,
      projects_count: 0,
    };
    this.profiles.push(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }

  // PROFILES
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
      if (this.currentUser && this.currentUser.username.toLowerCase() === username.toLowerCase()) {
        this.currentUser = this.profiles[idx];
        this.persistUser();
      }
      return this.profiles[idx];
    }
    return null;
  }

  // PROJECTS
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
    const newProject: Project = {
      ...projectData,
      id: "proj-" + Date.now(),
      created_at: new Date().toISOString(),
      views_count: 1,
      likes_count: 0,
      comments_count: 0,
      profile: this.currentUser || MOCK_PROFILES[0],
      user_has_liked: false,
    };
    this.projects.unshift(newProject);
    this.persistProjects();
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

  // LIKES
  toggleLike(projectId: string): { liked: boolean; count: number } {
    const proj = this.getProjectById(projectId);
    if (!proj) return { liked: false, count: 0 };

    if (proj.user_has_liked) {
      proj.user_has_liked = false;
      proj.likes_count = Math.max(0, proj.likes_count - 1);
    } else {
      proj.user_has_liked = true;
      proj.likes_count += 1;
      
      // notify creator
      if (this.currentUser && proj.user_id !== this.currentUser.id) {
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
      }
    }
    this.persistProjects();
    return { liked: proj.user_has_liked, count: proj.likes_count };
  }

  // COMMENTS
  getComments(projectId: string): Comment[] {
    return this.comments.filter(c => c.project_id === projectId);
  }

  addComment(projectId: string, content: string): Comment {
    const newComment: Comment = {
      id: "comm-" + Date.now(),
      project_id: projectId,
      user_id: this.currentUser ? this.currentUser.id : "user-1",
      content,
      created_at: new Date().toISOString(),
      profile: this.currentUser || MOCK_PROFILES[0],
    };
    this.comments.push(newComment);
    const proj = this.getProjectById(projectId);
    if (proj) {
      proj.comments_count += 1;
      this.persistProjects();

      if (this.currentUser && proj.user_id !== this.currentUser.id) {
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
      }
    }
    return newComment;
  }

  // FOLLOWS
  toggleFollow(targetProfileId: string): boolean {
    const target = this.profiles.find(p => p.id === targetProfileId);
    if (!target) return false;

    target.is_following = !target.is_following;
    if (target.is_following) {
      target.followers_count = (target.followers_count || 0) + 1;
      if (this.currentUser) {
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
      }
    } else {
      target.followers_count = Math.max(0, (target.followers_count || 1) - 1);
      if (this.currentUser) {
        this.currentUser.following_count = Math.max(0, (this.currentUser.following_count || 1) - 1);
      }
    }
    return !!target.is_following;
  }

  // NOTIFICATIONS
  getNotifications(): Notification[] {
    return this.notifications;
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => (n.is_read = true));
  }

  // STATS
  getStats(): PlatformStats {
    return {
      total_users: this.profiles.length + 44,
      total_projects: this.projects.length + 28,
      completed_projects: this.projects.filter(p => p.status === "Completed").length + 20,
      total_comments: this.comments.length + 150,
      total_likes: this.projects.reduce((acc, p) => acc + p.likes_count, 0) + 330,
      new_users_this_month: 14,
    };
  }
}

export const localStore = new LocalStore();
