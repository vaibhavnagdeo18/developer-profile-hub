import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ✅ GET PROFILE
  app.get("/api/profile", async (req, res) => {
    const profile = await storage.getProfile();
    res.json(profile);
  });

  // ✅ UPDATE PROFILE
  app.put("/api/profile", async (req, res) => {
    const profile = await storage.updateProfile(req.body);
    res.json(profile);
  });

  // ✅ GET PROJECTS
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  // ✅ CREATE PROJECT
  app.post("/api/projects", async (req, res) => {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const project = await storage.createProject(result.data);
    res.json(project);
  });

  // ✅ UPDATE PROJECT
  app.put("/api/projects/:id", async (req, res) => {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const project = await storage.updateProject(req.params.id, result.data);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  // ✅ DELETE PROJECT
  app.delete("/api/projects/:id", async (req, res) => {
    const success = await storage.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  });

  // 🔥 AI BIO GENERATOR (extra feature)
  app.post("/api/generate-bio", (req, res) => {
    const { skills, title } = req.body;

    const bio = `A passionate ${title} skilled in ${skills.join(", ")}, focused on building scalable and efficient applications.`;

    res.json({ bio });
  });

  return httpServer;
}