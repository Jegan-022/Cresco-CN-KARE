import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Curriculum Lesson Summary Endpoint
  app.post("/api/lesson-summary", async (req, res) => {
    try {
      const { lessonTitle, overview, keyTakeaway } = req.body || {};

      return res.json({
        bullets: [
          `Protocol Foundation: ${overview || 'Synchronizes communication state and verifies endpoint readiness before byte streaming.'}`,
          `Header Mechanics: ${keyTakeaway || 'Controls packet flow and sequence tracking across full-duplex socket buffers.'}`,
          `Exam Key Rule: Master the packet exchange sequence, flag values, and timeout implications of ${lessonTitle || 'the protocol'} for academic review.`
        ],
        keyConcept: keyTakeaway || lessonTitle || 'Computer Networks Principle',
        source: 'curriculum'
      });
    } catch (err: any) {
      console.error("Error generating lesson summary:", err);
      return res.status(500).json({ 
        error: "Failed to generate summary", 
        details: err?.message || String(err) 
      });
    }
  });

  // AI Personal Tutor Endpoint (Step 23)
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const { handleAiTutorRequest } = await import("./api/ai-tutor");
      const result = await handleAiTutorRequest(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error("Error in /api/ai-tutor:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Server error in AI tutor",
        errorCode: "AI_PROVIDER_UNAVAILABLE"
      });
    }
  });

  // Standalone Animated Learning modules (served directly, independent from React SPA)
  app.get("/animated_learn_:num", (req, res, next) => {
    const isProd = process.env.NODE_ENV === "production";
    const baseDir = isProd ? path.join(process.cwd(), "dist") : path.join(process.cwd(), "public");
    const filePath = path.join(baseDir, `animated_learn_${req.params.num}`, "index.html");
    res.sendFile(filePath, (err) => {
      if (err) next();
    });
  });

  app.get("/animated_learn_:num/*", (req, res, next) => {
    const isProd = process.env.NODE_ENV === "production";
    const baseDir = isProd ? path.join(process.cwd(), "dist") : path.join(process.cwd(), "public");
    const relativePath = req.params[0] || "index.html";
    const filePath = path.join(baseDir, `animated_learn_${req.params.num}`, relativePath);
    res.sendFile(filePath, (err) => {
      if (err) next();
    });
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[CRESCO Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[CRESCO Server] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[CRESCO Server] AI Tutor: ${process.env.GEMINI_API_KEY ? 'Configured (Active)' : 'Unconfigured (Fallback Ready)'}`);
  });
}

startServer();
