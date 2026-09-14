import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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

  // AI Summary Endpoint
  app.post("/api/lesson-summary", async (req, res) => {
    try {
      const { lessonTitle, lessonContent, overview, keyTakeaway } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: "GEMINI_API_KEY is not configured.",
          bullets: [
            `Overview: ${overview || 'Understanding core network layer concepts and packet switching mechanics.'}`,
            `Mechanism: ${keyTakeaway || 'Routing protocols determine the most efficient path for data transmission.'}`,
            `Exam Tip: Focus on the sequence of operations and specific protocol headers.`
          ],
          keyConcept: keyTakeaway || lessonTitle,
          source: 'curriculum'
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Based on the following lesson content, generate a concise 3-bullet summary and a 1-phrase key concept.\n\nTitle: ${lessonTitle}\nOverview: ${overview || ''}\nKey Takeaway: ${keyTakeaway || ''}\nContent: ${lessonContent || 'Standard networking principle'}\n\nInstructions:\n1. Provide exactly 3 bullet points.\n2. Bullet 1 must summarize the fundamental mechanism or purpose of the protocol.\n3. Bullet 2 must highlight the critical technical detail (e.g. sequence numbers, header flags, formulas, or state transitions).\n4. Bullet 3 must give a practical exam review takeaway or common student pitfall to remember.\n5. Keep each bullet clear, precise, and under 25 words.\n6. Provide a 1-phrase core concept title.`;

      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let rawText = "";

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: "You are a concise, authoritative Computer Science professor. Provide exact 3-bullet point summaries formatted for college students mastering Computer Networks.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 3 concise bullet points summarizing the lesson video for quick review."
                  },
                  keyConcept: {
                    type: Type.STRING,
                    description: "A 1-phrase core concept or exam tip (e.g. 'SYN + ACK Flag Negotiation')."
                  }
                },
                required: ["bullets", "keyConcept"]
              }
            }
          });
          
          if (response && response.text) {
            rawText = response.text;
            break;
          }
        } catch (mErr: any) {
          console.warn(`Model ${model} attempt failed:`, mErr?.message || mErr);
        }
      }

      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        if (parsed && Array.isArray(parsed.bullets) && parsed.bullets.length >= 3) {
          return res.json({
            bullets: parsed.bullets.slice(0, 3),
            keyConcept: parsed.keyConcept || keyTakeaway || lessonTitle,
            source: 'gemini'
          });
        }
      }

      return res.json({
        bullets: [
          `Protocol Foundation: ${overview || 'Synchronizes communication state and verifies endpoint readiness before byte streaming.'}`,
          `Header Mechanics: ${keyTakeaway || 'Controls packet flow and sequence tracking across full-duplex socket buffers.'}`,
          `Exam Key Rule: Master the packet exchange sequence, flag values, and timeout implications of ${lessonTitle} for the midterm.`
        ],
        keyConcept: keyTakeaway || lessonTitle,
        source: 'curriculum'
      });
    } catch (err: any) {
      console.error("Error generating lesson summary:", err);
      return res.status(500).json({ 
        error: "Failed to generate AI summary", 
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
