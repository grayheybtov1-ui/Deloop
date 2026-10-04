export type UserRole = 'developer' | 'admin';

export type DeveloperTitle = 
  | 'Full-Stack Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'AI / Data Engineer'
  | 'Mobile Developer'
  | 'DevOps Engineer';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  developer_title?: DeveloperTitle;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  github_username?: string;
  linkedin_url?: string;
  role: UserRole;
  created_at: string;
  skills?: string[];
  followers_count?: number;
  following_count?: number;
  projects_count?: number;
  is_following?: boolean;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cover_image?: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  category: string;
  status: ProjectStatus;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at?: string;
  profile?: Profile;
  user_has_liked?: boolean;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type NotificationType = 'follow' | 'like' | 'comment';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  project_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  project?: {
    id: string;
    title: string;
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
}

export interface GitHubUserStats {
  username: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  languages: { [key: string]: number };
  recent_repos: GitHubRepo[];
}

export interface PlatformStats {
  total_users: number;
  total_projects: number;
  completed_projects: number;
  total_comments: number;
  total_likes: number;
  new_users_this_month: number;
}
