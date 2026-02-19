import { type User, type InsertUser, type Project, type InsertProject, type Profile } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: InsertProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Profile
  getProfile(): Promise<Profile>;
  updateProfile(profile: Profile): Promise<Profile>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private profile: Profile;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.profile = {
      name: "Vaibhav Nagdeo",
      title: "Full Stack Developer",
      bio: "Passionate about building scalable web applications and intuitive user experiences. Specialized in React, Node.js, and cloud architecture. Always learning and exploring new technologies to solve real-world problems.",
      location: "Hyderabad, India",
      email: "vaibhavnagdeo@gmail.com",
      website: "https://Vaibhav.dev",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Tailwind CSS", "PostgreSQL", "Next.js"],
      socials: {
        github: "https://github.com/vaibhavnagdeo18",
        linkedin: "https://www.linkedin.com/in/vaibhavnagdeo/",
        twitter: "https://x.com/vaibhavnagdeo",
      }
    };
    this.seedProjects();
  }

  private seedProjects() {
    const initialProjects: Project[] = [
      {
        id: randomUUID(),
        title: "Gym Management System",
        description: "Full stack gym management app with member tracking, payments, and admin dashboard.",
        image: "https://images.unsplash.com/photo-1571019613914-85f342c1d4b1",
        tech: ["React", "Node.js", "Firebase"]
      },
      {
        id: randomUUID(),
        title: "Swiggy Clone",
        description: "Food delivery app with real-time order tracking, authentication and payment integration.",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        tech: ["Kotlin", "Firebase", "REST API"]
      }
    ];
    initialProjects.forEach(p => this.projects.set(p.id, p));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, insertProject: InsertProject): Promise<Project | undefined> {
    if (!this.projects.has(id)) return undefined;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getProfile(): Promise<Profile> {
    return this.profile;
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    this.profile = profile;
    return this.profile;
  }
}

export const storage = new MemStorage();
