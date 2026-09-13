import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { lessonTitle, lessonContent, overview, keyTakeaway } = body;

    const fallbackBullets = [
      `Protocol Foundation: ${overview || 'Synchronizes communication state and verifies endpoint readiness before byte streaming.'}`,
      `Header Mechanics: ${keyTakeaway || 'Controls packet flow and sequence tracking across full-duplex socket buffers.'}`,
      `Exam Key Rule: Master the packet exchange sequence, flag values, and timeout implications of ${lessonTitle || 'the lesson'} for the midterm.`
    ];
    const fallbackConcept = keyTakeaway || lessonTitle || 'Computer Networks Principle';

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        bullets: [
          `Overview: ${overview || 'Understanding core network layer concepts and packet switching mechanics.'}`,
          `Mechanism: ${keyTakeaway || 'Routing protocols determine the most efficient path for data transmission.'}`,
          `Exam Tip: Focus on the sequence of operations and specific protocol headers.`
        ],
        keyConcept: fallbackConcept,
        source: 'curriculum'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Based on the following lesson content, generate a concise 3-bullet summary and a 1-phrase key concept.\n\nTitle: ${lessonTitle}\nOverview: ${overview || ''}\nKey Takeaway: ${keyTakeaway || ''}\nContent: ${lessonContent || 'Standard networking principle'}\n\nInstructions:\n1. Provide exactly 3 bullet points.\n2. Bullet 1 must summarize the fundamental mechanism or purpose of the protocol.\n3. Bullet 2 must highlight the critical technical detail (e.g. sequence numbers, header flags, formulas, or state transitions).\n4. Bullet 3 must give a practical exam review takeaway or common student pitfall to remember.\n5. Keep each bullet clear, precise, and under 25 words.\n6. Provide a 1-phrase core concept title.`;

    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
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
      try {
        const parsed = JSON.parse(rawText.trim());
        if (parsed && Array.isArray(parsed.bullets) && parsed.bullets.length >= 3) {
          return res.status(200).json({
            bullets: parsed.bullets.slice(0, 3),
            keyConcept: parsed.keyConcept || fallbackConcept,
            source: 'gemini'
          });
        }
      } catch (parseErr) {
        console.warn("Error parsing AI response JSON:", parseErr);
      }
    }

    return res.status(200).json({
      bullets: fallbackBullets,
      keyConcept: fallbackConcept,
      source: 'curriculum'
    });
  } catch (err: any) {
    console.error("Error generating lesson summary:", err);
    return res.status(500).json({
      error: "Failed to generate AI summary",
      details: err?.message || String(err)
    });
  }
}
