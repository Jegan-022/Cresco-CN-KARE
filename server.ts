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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
