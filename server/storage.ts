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
      profilePicture: "/profile.jpg",
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
        title: "AI Manim Visualizer",
        description: "Developed an AI system to convert natural language prompts into mathematical animations, improving education and engagement by 40%. Integrated GPT API for code generation and narration synchronization. Optimized render time by 25% through multiprocessing.",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
        tech: ["Python", "Manim", "OpenAI API"]
      },
      {
        id: randomUUID(),
        title: "Gesture Builder AI",
        description: "Designed AI-driven gesture-based 3D creation platform, improving user interactivity by 50%. Integrated Node.js backend with Three.js to dynamically process user commands and update 3D environments in real time. Enhanced backend with Python FastAPI for real-time rendering and scalable management.",
        image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec",
        tech: ["React", "Node.js", "Three.js", "OpenAI API", "Python", "FastAPI"]
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
