import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy/safe initialization for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini Stream Caller with Automatic Retry and Fallback
async function callGeminiStreamWithFallback(params: {
  contents: any[];
  systemInstruction?: string;
  temperature?: number;
}) {
  const ai = getGemini();
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.7,
          },
        });
        return stream;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Stream] Attempt ${attempt + 1} with ${model} failed:`, err?.message || err);
        if (attempt === 0) {
          // Brief backoff before re-attempting
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }
  throw lastError;
}

// Resilient Gemini Generate Content Caller with Automatic Retry and Fallback
async function callGeminiGenerateWithFallback(params: {
  contents: string | any[];
  config?: any;
}) {
  const ai = getGemini();
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Generate] Attempt ${attempt + 1} with ${model} failed:`, err?.message || err);
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }
  throw lastError;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Helper for Study Buddy core system prompt
function buildSystemPrompt(context: {
  subject?: string;
  level?: string;
  deadline?: string;
  mode?: "mastery" | "cram";
  weakSpots?: string[];
  notesContext?: string;
}) {
  const modeText =
    context.mode === "cram"
      ? "CRAM MODE ACTIVE: The exam is very soon. Prioritize highest-yield concepts, condensed summaries, rapid drills, and essential definitions."
      : "MASTERY MODE ACTIVE: Go deep into concepts, connect ideas across topics, build intuitive first-principles understanding, and use clear analogies.";

  const weakSpotsList =
    context.weakSpots && context.weakSpots.length > 0
      ? `KNOWN STUDENT WEAK SPOTS: ${context.weakSpots.join(", ")}. Weave in quick review of these concepts when naturally relevant.`
      : "No known weak spots yet.";

  const notesInstruction = context.notesContext
    ? `STUDENT UPLOADED NOTES / SLIDES / TEXTBOOK EXCERPT:
"""
${context.notesContext.slice(0, 12000)}
"""
CRITICAL GROUNDING & ACCURACY RULES FOR UPLOADED MATERIAL:
1. Base all your answers, explanations, definitions, quizzes, and flashcards DIRECTLY on this uploaded material rather than outside general knowledge.
2. CAREFULLY AUDIT THIS MATERIAL: If you spot anything in the student's uploaded notes/slides that appears factually incorrect, contradictory, outdated, or confusing, you MUST gently and explicitly flag it!
   Format flags clearly: "⚠️ Note check on your uploaded material: [quote/cite the specific detail, explain why it is inaccurate or misleading, and clarify the correct concept]." Do not silently ignore mistakes in their notes.`
    : "No custom notes uploaded yet. Rely on standard high-yield academic syllabus knowledge.";

  return `You are Study Buddy, an expert, encouraging personal AI study tutor.

STUDENT PROFILE & CONTEXT:
- Subject / Exam: ${context.subject || "Not specified yet (if unknown and needed, ask briefly once)"}
- Academic Level: ${context.level || "High School / Undergraduate"}
- Target Deadline: ${context.deadline || "Not specified"}
- ${modeText}
- ${weakSpotsList}
- ${notesInstruction}

CORE PEDAGOGICAL DIRECTIVES (MANDATORY ON EVERY RESPONSE):

1. ALWAYS GIVE THE ANSWER, BUT NEVER ALONE:
   - Always provide the direct answer right away. Never withhold the answer, make the student guess blindly, or answer with a counter-question alone.
   - However, NEVER give the answer by itself. Pair every single answer with a simple, crystal-clear explanation of WHY it is correct, broken into small, easy-to-follow steps.

2. PLAIN, EVERYDAY LANGUAGE FIRST (NO UNEXPLAINED JARGON):
   - Use plain, everyday language first. Avoid dense, intimidating academic jargon.
   - When a technical term is necessary, define it in ONE simple sentence right where it is used (e.g. in parentheses or a quick comma phrase).

3. BREAK DOWN REASONING STEP-BY-STEP:
   - Break down the underlying logic or mechanism into small, numbered steps (Step 1, Step 2, Step 3...) so the student can follow the reasoning from cause to effect, not just memorize the final result.

4. OFFER A QUICK, EASY CHECK AFTER EXPLAINING:
   - At the end of every explanation, ALWAYS conclude with a quick, easy check so the student can confirm they actually understood it (not just copied the answer down).
   - Format this distinctly: "🎯 Quick check for you: [a short, friendly question, or 'Does that step-by-step logic make sense?']".

5. CONCISE BY DEFAULT (NEVER SACRIFICE CLARITY FOR BREVITY):
   - Keep explanations concise by default. Avoid unnecessary fluff or bloated essays.
   - Expand only when asked, but never sacrifice clarity for brevity.

6. GROUNDING & ERROR FLAGGING ON UPLOADED MATERIAL:
   - Whenever the student has uploaded notes, slides, or a textbook excerpt (shown above in context), base your answers, explanations, and quizzes directly on that specific material.
   - If something in their uploaded material is inaccurate, unclear, or contradictory, flag it immediately with a friendly warning and explain the correct principle.

7. TONE & MANNER:
   - Warm, patient, positive, and motivating.
   - If the student seems stressed or stuck, reassure them: "We've got this! Let's take it one step at a time."
   - Keep formatting clean with bold key concepts and bullet points for effortless scanning.

8. INDIAN STUDY ANSWERS & CURRICULA (CBSE, ICSE, NCERT, STATE BOARDS, JEE, NEET, UPSC):
   - Full alignment with Indian curricula: NCERT (Class 6-12), CBSE, ICSE/ISC, State Boards, JEE Main/Advanced, NEET, UPSC, and Indian University courses.
   - Board Exam Answer Pattern: When answering school or board exam questions, present answers in high-scoring, point-wise format with key terminology bolded (matching CBSE/ICSE marking schemes).
   - Numericals & Derivations: Always show Given data → Relevant formula → Step-by-step calculation → Final answer with correct SI units.
   - Natural Language Flexibility: Comfortably understand and respond to Indian educational phrasing and Hinglish study requests (e.g., "NCERT back exercise solution", "important 3-marker questions", "derivation step by step").`;
}

// 1. Chat with streaming SSE
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array." });
    }

    const systemPrompt = buildSystemPrompt(context || {});

    // Prepare contents for Gemini
    // Map messages: student -> user, buddy -> model
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "buddy" ? "model" : "user",
      parts: [{ text: m.content || "Hello" }],
    }));

    // Start stream with retry & fallback BEFORE committing SSE headers
    const responseStream = await callGeminiStreamWithFallback({
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.7,
    });

    // Setup SSE headers once stream successfully initialized
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to generate chat response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
      res.end();
    }
  }
});

// 2. Generate Flashcards endpoint
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { topic, notes, count = 6, level = "College" } = req.body;

    const prompt = `Generate a high-yield study flashcard deck of ${count} cards.
Target Level: ${level}
Topic / Focus: ${topic || "Key Concepts"}
Source Material / Notes (if provided):
${notes ? notes.slice(0, 12000) : "Use standard high-yield academic syllabus curriculum."}

Strict Rules:
1. Grounding: If source notes/slides are provided above, base the flashcards strictly on that uploaded material rather than outside general knowledge.
2. Error & Confusion Flagging: If anything in the student's uploaded notes/source material appears factually incorrect, misleading, contradictory, or unclear, create a dedicated flashcard or clearly prepend the card's back with: "⚠️ Note check on your material: [explain what was unclear/incorrect and state the accurate fact]".
3. Card Back Structure:
   - Always give the direct answer first, but NEVER give it alone.
   - Pair the answer with a simple explanation in plain, everyday language explaining WHY it is correct, broken into small, easy-to-follow steps.
   - Avoid jargon; if a technical term is necessary, define it in one simple sentence right where it is used.
   - Conclude with a quick, easy check or memorable tip so the student can verify their understanding.
   - Keep it concise by default (never sacrifice clarity for brevity).
- Front: A specific, clear prompt, definition query, or active recall question.
- Category: Subtopic tag.
- Difficulty: "easy" | "medium" | "hard"`;

    const response = await callGeminiGenerateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING, description: "Question or term on front of card" },
              back: { type: Type.STRING, description: "Direct answer + simple step-by-step why it's correct + term definition + quick check" },
              category: { type: Type.STRING, description: "Subtopic or chapter" },
              difficulty: { type: Type.STRING, description: "easy, medium, or hard" },
            },
            required: ["front", "back", "category", "difficulty"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const cards = JSON.parse(text);
    res.json({ cards });
  } catch (error: any) {
    console.error("Flashcards error:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards" });
  }
});

// 3. Generate Quiz Questions endpoint
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic, notes, count = 5, level = "College", weakSpots = [] } = req.body;

    const weakSpotsHint =
      weakSpots.length > 0 ? `Specially target these weak spots: ${weakSpots.join(", ")}` : "";

    const prompt = `Create an active-recall quiz with ${count} questions.
Target Level: ${level}
Topic: ${topic || "General Review"}
${weakSpotsHint}
Source Material / Uploaded Notes:
${notes ? notes.slice(0, 12000) : "High-yield core curriculum"}

Strict Rules:
1. Grounding: If source notes/slides are provided above, base the quiz questions strictly on that uploaded material rather than general knowledge.
2. Error Checking: If something in the student's material is unclear, ambiguous, or incorrect, address the misconception in a question or explicitly flag it in the explanation ("⚠️ Note on your uploaded material: ...").
3. Explanation Structure:
   - In the explanation: Always state the answer, paired with a simple explanation of why it's correct broken into small, easy-to-follow steps.
   - Use plain, everyday language first. If a technical term is necessary, define it in one simple sentence right where it is used.
   - Keep the explanation concise by default.
   - Conclude with a quick, easy check or memory tip.
4. Format as multiple-choice questions with 4 distinct options, and a clear correct index (0-3).`;

    const response = await callGeminiGenerateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options",
              },
              correctIndex: { type: Type.INTEGER, description: "0 to 3" },
              explanation: { type: Type.STRING, description: "Direct answer + simple step-by-step why it's correct in plain language + term definition + quick check" },
              topicTag: { type: Type.STRING, description: "Concept tested" },
            },
            required: ["question", "options", "correctIndex", "explanation", "topicTag"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (error: any) {
    console.error("Quiz error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// 4. "Explain it Back" evaluation
app.post("/api/evaluate-explain-back", async (req, res) => {
  try {
    const { concept, studentExplanation, level = "College" } = req.body;
    if (!concept || !studentExplanation) {
      return res.status(400).json({ error: "Missing concept or studentExplanation." });
    }

    const prompt = `You are Study Buddy. The student is testing their understanding by explaining "${concept}" back to you.
Student's Academic Level: ${level}
Student's Explanation:
"""
${studentExplanation}
"""

Evaluate their explanation with high pedagogical craft adhering to these core principles:
1. Always state the complete, accurate principle clearly, paired with a simple explanation of why it's correct broken into small steps.
2. Use plain, everyday language first. Avoid jargon; when a technical term is necessary, define it in one simple sentence right where it's used.
3. Identify what they got completely right (celebrate progress!).
4. Identify subtle gaps, omitted steps, or misconceptions, and explain the correct logic step-by-step.
5. Keep explanations concise by default.
6. Provide an easy, quick check question so the student can confirm they grasped the correction.`;

    const response = await callGeminiGenerateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            celebration: { type: Type.STRING, description: "Warm, encouraging praise for what they nailed" },
            whatTheyGotRight: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points of correctly explained elements",
            },
            gapsAndCorrections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Gentle fixes and missing points",
            },
            analogyTip: { type: Type.STRING, description: "Vivid analogy or memory hook to lock it in" },
            masteryScore: { type: Type.INTEGER, description: "0 to 100" },
            verdict: { type: Type.STRING, description: "e.g., 'Mastered!', 'Almost There', 'Needs Quick Review'" },
            followUpQuestion: { type: Type.STRING, description: "A quick question to test the gap" },
          },
          required: [
            "celebration",
            "whatTheyGotRight",
            "gapsAndCorrections",
            "analogyTip",
            "masteryScore",
            "verdict",
            "followUpQuestion",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const evaluation = JSON.parse(text);
    res.json({ evaluation });
  } catch (error: any) {
    console.error("Explain-back error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate explanation" });
  }
});

// 5. Generate Study Plan endpoint
app.post("/api/generate-study-plan", async (req, res) => {
  try {
    const { subject, deadline, hoursPerDay = 2, topics, level = "College", mode = "mastery" } = req.body;

    const prompt = `Create a realistic, motivating study plan.
Subject: ${subject || "General Course"}
Target Exam / Deadline: ${deadline || "Next week"}
Available Study Time: ${hoursPerDay} hours per day
Mode: ${mode} (${mode === "cram" ? "Cram/Urgent: focus on high-yield, condensed summaries, rapid quizzes" : "Mastery: deep understanding, spacing, practice"})
Level: ${level}
Topics or Syllabus:
${topics || "Standard comprehensive coverage"}

Requirements:
- Break into daily or session blocks with realistic time estimates.
- Include structured breaks (e.g., Pomodoro 25/5 or 45/10).
- Clear tangible goals for each session (e.g., "Day 1: Read chapters 1-2 definitions, 10 practice questions, explain back core theorem").
- Add motivational milestones and a final day review buffer.`;

    const response = await callGeminiGenerateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            dailyTargetHours: { type: Type.NUMBER },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayTitle: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        type: { type: Type.STRING, description: "study, quiz, recall, break, review" },
                        durationMin: { type: Type.INTEGER },
                      },
                      required: ["text", "type", "durationMin"],
                    },
                  },
                  recommendedBreak: { type: Type.STRING },
                },
                required: ["dayNumber", "dayTitle", "focusArea", "estimatedMinutes", "tasks"],
              },
            },
            finalTip: { type: Type.STRING },
          },
          required: ["title", "summary", "totalDays", "dailyTargetHours", "days", "finalTip"],
        },
      },
    });

    const text = response.text || "{}";
    const plan = JSON.parse(text);
    res.json({ plan });
  } catch (error: any) {
    console.error("Study plan error:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Study Buddy server listening on port ${PORT}`);
  });
}

startServer();
