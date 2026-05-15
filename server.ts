import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Octokit } from "@octokit/rest";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // README Generation
  app.post("/api/generate", async (req, res) => {
    const { name, template, language, description, techStack, license, badges, roadmap, supplemental } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const prompt = `
      You are an elite software architect and documentation expert.
      Generate a professional README.md for a project called "${name}".
      
      Project Parameters:
      - Description: ${description}
      - Template Style: ${template}
      - Target Language: ${language}
      - Tech Stack: ${techStack}
      - License: ${license}
      - Badges requested: ${badges.join(", ")}
      - Roadmap items: ${roadmap.join(", ")}
      - Supplemental documents to reference: ${supplemental.join(", ")}

      CRITICAL: You must output a SINGLE STRING that contains the main README and the supplemental documents separated by the delimiter "---FILE_SEPARATOR---".
      Each supplemental document MUST follow this format:
      ---FILE_SEPARATOR---
      [FILENAME.md]
      # Document Title
      Content...

      Design Instructions:
      - Use high-quality, professional markdown.
      - Include a hero section if the template is "Hero Visual".
      - Use modern accessibility standards.
      - Do NOT include any intro/outro text, just the markdown content.
    `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      res.json({ content: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GitHub Repository Analysis
  app.post("/api/analyze-repo", async (req, res) => {
    const { url } = req.body;
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });
      
      const [, owner, repo] = match;
      const cleanRepo = repo.replace(".git", "");
      
      const { data: repoInfo } = await octokit.repos.get({ owner, repo: cleanRepo });
      const { data: branchInfo } = await octokit.repos.getBranch({ owner, repo: cleanRepo, branch: repoInfo.default_branch });
      const { data: fullTree } = await octokit.git.getTree({ 
        owner, 
        repo: cleanRepo, 
        tree_sha: branchInfo.commit.commit.tree.sha, 
        recursive: "true" 
      });

      let packageJson = null;
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo: cleanRepo, path: "package.json" });
        if ('content' in file) {
          packageJson = JSON.parse(Buffer.from(file.content, 'base64').toString());
        }
      } catch (e) {}

      res.json({
        name: repoInfo.name,
        description: repoInfo.description || "",
        techStack: packageJson ? Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).join(", ") : "",
        files: fullTree.tree.map(f => f.path).slice(0, 50)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Readme.AI Backend Active" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
