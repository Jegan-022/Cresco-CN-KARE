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
    const { lessonTitle, overview, keyTakeaway } = body;

    const fallbackBullets = [
      `Protocol Foundation: ${overview || 'Synchronizes communication state and verifies endpoint readiness before byte streaming.'}`,
      `Header Mechanics: ${keyTakeaway || 'Controls packet flow and sequence tracking across full-duplex socket buffers.'}`,
      `Exam Key Rule: Master the packet exchange sequence, flag values, and timeout implications of ${lessonTitle || 'the lesson'} for midterm and semester review.`
    ];
    const fallbackConcept = keyTakeaway || lessonTitle || 'Computer Networks Principle';

    return res.status(200).json({
      bullets: fallbackBullets,
      keyConcept: fallbackConcept,
      source: 'curriculum'
    });
  } catch (err: any) {
    console.error("Error generating lesson summary:", err);
    return res.status(500).json({
      error: "Failed to generate summary",
      details: err?.message || String(err)
    });
  }
}
