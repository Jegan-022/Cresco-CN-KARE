/**
 * CRESCO Backend AI Personal Tutor Endpoint
 *
 * Secure server-side proxy connecting to Groq API for the AI Personal Tutor.
 * Protects GROQ_API_KEY from exposure to browser client code.
 *
 * Reference: docs/CRESCO_LEARNING_DATA_MODEL.md Section 10
 */

interface TutorContextPayload {
  courseId?: string;
  unitId?: string;
  levelNumber?: number;
  lessonId?: string;
  conceptTopic?: string;
  learningObjective?: string;
  actionType?: string;
  questionPrompt?: string;
  studentMistake?: string;
  explanationSnippet?: string;
}

interface RecommendedLessonRef {
  lessonId: string;
  title: string;
  unitNumber: number;
}

const CANONICAL_LESSON_DIRECTORY: RecommendedLessonRef[] = [
  { lessonId: 'u3_m01', title: 'Network Layer – Need and Issues', unitNumber: 3 },
  { lessonId: 'u3_m02', title: 'Routing Algorithms (Distance Vector & Link State)', unitNumber: 3 },
  { lessonId: 'u3_m03', title: 'IPv4 Addressing & Subnetting Mechanics', unitNumber: 3 },
  { lessonId: 'u4_m01', title: 'Transport Layer Services & Port Multiplexing', unitNumber: 4 },
  { lessonId: 'u4_m05', title: 'TCP Connection Management & 3-Way Handshake', unitNumber: 4 },
  { lessonId: 'u4_m06', title: 'TCP Flow Control & Sliding Window Mechanics', unitNumber: 4 },
  { lessonId: 'u5_m01', title: 'Application Layer Architecture & Paradigms', unitNumber: 5 },
  { lessonId: 'u5_m02', title: 'Domain Name System (DNS) Architecture', unitNumber: 5 },
  { lessonId: 'u5_m08', title: 'Web Architectures: HTTP/1.1 to HTTP/3', unitNumber: 5 }
];

export async function handleAiTutorRequest(reqBody: any): Promise<{
  status: number;
  data: any;
}> {
  const { message, context, conversationHistory } = reqBody || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Invalid request: message must be a non-empty string.',
        errorCode: 'INVALID_REQUEST'
      }
    };
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      status: 503,
      data: {
        success: false,
        error: 'AI provider is unconfigured. Set GROQ_API_KEY in the server environment.',
        errorCode: 'AI_PROVIDER_UNAVAILABLE'
      }
    };
  }

  const tutorContext: TutorContextPayload = context || {};
  const startTime = Date.now();
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  // 1. Build Socratic System Prompt grounded in CRESCO Curriculum
  const systemInstruction = `
You are Neta (also known as Network AI Neta), the friendly, pedagogically rigorous AI Personal Tutor for CRESCO Computer Networks (CS-4200).
Your name is Neta. Whenever a student asks who you are, what your name is, or introduces themselves, warmly state that you are Neta, their AI Personal Tutor for Computer Networks. Never call yourself ByteBot.
Your mission: Help undergraduate engineering students master networking concepts, protocol state machines, packet formats, and routing algorithms through supportive Socratic dialogue.

PEDAGOGICAL & ETHICAL INVARIANTS:
1. Socratic First: Never reveal the final answer to an assessment or quiz question directly. Offer progressive conceptual hints, analogies, and questions that prompt the student to think through the mechanics.
2. Grounded in Networking Standards: Ground your answers in authoritative RFC protocol specifications (RFC 793 TCP, RFC 768 UDP, RFC 1035 DNS, IPv4/IPv6, CIDR/VLSM subnetting, Dijkstra/Bellman-Ford).
3. Curriculum Awareness:
   - Current Unit: ${tutorContext.unitId || 'Computer Networks'}
   - Current Lesson: ${tutorContext.lessonId || 'Not specified'}
   - Current Topic: ${tutorContext.conceptTopic || 'General Protocol Engineering'}
   - Learning Objective: ${tutorContext.learningObjective || 'Not specified'}
${tutorContext.questionPrompt ? `   - Question Under Discussion: "${tutorContext.questionPrompt}"` : ''}
${tutorContext.studentMistake ? `   - Student Incorrect Answer: "${tutorContext.studentMistake}" (Gently unpack why this is incorrect without shaming)` : ''}
${tutorContext.explanationSnippet ? `   - Curriculum Reference Material: "${tutorContext.explanationSnippet}"` : ''}
4. Outside Scope Clarity: If a student asks about a topic outside Computer Networks or outside CRESCO's CS-4200 scope, politely acknowledge that your expertise is dedicated to Computer Networks.
5. Authority Boundary: You are assistive only. You cannot change student grades, award XP, or certify topic mastery.
6. Friendly Tone: Speak encouragingly as Neta, using clear bullet points and short code/packet diagrams when helpful.
`.trim();

  // 2. Build multi-turn messages array (OpenAI-compatible format for Groq)
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  if (Array.isArray(conversationHistory)) {
    for (const turn of conversationHistory.slice(-8)) {
      if (turn && turn.text) {
        messages.push({
          role: turn.role === 'model' ? 'assistant' : 'user',
          content: turn.text
        });
      }
    }
  }

  // Add the current user query
  messages.push({
    role: 'user',
    content: message.trim()
  });

  try {
    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1024
      })
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Tutor Backend] Groq API error (${response.status}):`, errorText);

      if (response.status === 429) {
        return {
          status: 429,
          data: {
            success: false,
            error: 'AI tutor query rate limit reached. Please wait a moment before asking another question.',
            errorCode: 'RATE_LIMIT_EXCEEDED'
          }
        };
      }

      return {
        status: response.status,
        data: {
          success: false,
          error: `AI provider error (${response.status}). Please try again.`,
          errorCode: 'AI_PROVIDER_UNAVAILABLE'
        }
      };
    }

    const json = await response.json();
    const replyText = json.choices?.[0]?.message?.content;

    if (!replyText || replyText.trim().length === 0) {
      return {
        status: 200,
        data: {
          success: false,
          error: 'AI tutor returned an empty response. Please rephrase your question.',
          errorCode: 'CONTENT_FILTERED'
        }
      };
    }

    // Identify contextual recommended lessons
    const lowerReply = replyText.toLowerCase();
    const recommendedLessons = CANONICAL_LESSON_DIRECTORY.filter((l) => {
      if (tutorContext.lessonId && l.lessonId === tutorContext.lessonId) return false; // don't recommend current lesson
      return (
        lowerReply.includes(l.lessonId.toLowerCase()) ||
        lowerReply.includes(l.title.toLowerCase()) ||
        (l.unitNumber === 4 && (lowerReply.includes('tcp') || lowerReply.includes('handshake'))) ||
        (l.unitNumber === 3 && (lowerReply.includes('routing') || lowerReply.includes('subnet'))) ||
        (l.unitNumber === 5 && (lowerReply.includes('dns') || lowerReply.includes('http')))
      );
    }).slice(0, 2);

    return {
      status: 200,
      data: {
        success: true,
        reply: replyText.trim(),
        model,
        latencyMs,
        recommendedLessons: recommendedLessons.length > 0 ? recommendedLessons : undefined
      }
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error('[AI Tutor Backend] Request exception:', err);

    if (err?.name === 'AbortError') {
      return {
        status: 504,
        data: {
          success: false,
          error: 'AI tutor request timed out (15s limit). Please check your connection and try again.',
          errorCode: 'NETWORK_TIMEOUT',
          latencyMs
        }
      };
    }

    return {
      status: 500,
      data: {
        success: false,
        error: err?.message || 'An unexpected error occurred in the AI tutor backend.',
        errorCode: 'AI_PROVIDER_UNAVAILABLE',
        latencyMs
      }
    };
  }
}

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
    const result = await handleAiTutorRequest(body);
    return res.status(result.status).json(result.data);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error processing AI tutor request',
      errorCode: 'AI_PROVIDER_UNAVAILABLE'
    });
  }
}
