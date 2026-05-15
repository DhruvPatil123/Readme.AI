import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GitHub Repository Analysis
  app.post("/api/analyze-repo", async (req, res) => {
    const { url } = req.body;
    try {
      // Parse owner and repo from URL
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });
      
      const [, owner, repo] = match;
      
      // Fetch basic repo info
      const { data: repoInfo } = await octokit.repos.get({ owner, repo: repo.replace(".git", "") });
      
      // Fetch file list (recursive)
      const { data: tree } = await octokit.repos.getBranch({ owner, repo: repo.replace(".git", ""), branch: repoInfo.default_branch });
      const { data: fullTree } = await octokit.git.getTree({ 
        owner, 
        repo: repo.replace(".git", ""), 
        tree_sha: tree.commit.commit.tree.sha, 
        recursive: "true" 
      });

      // Fetch package.json for tech stack analysis
      let packageJson = null;
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo: repo.replace(".git", ""), path: "package.json" });
        if ('content' in file) {
          packageJson = JSON.parse(Buffer.from(file.content, 'base64').toString());
        }
      } catch (e) {}

      res.json({
        name: repoInfo.name,
        description: repoInfo.description,
        techStack: packageJson ? Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).join(", ") : "",
        files: fullTree.tree.map(f => f.path).slice(0, 50) // Limit for prompt context
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Readme.AI Backend Active" });
  });

  // Vite middleware for development
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
