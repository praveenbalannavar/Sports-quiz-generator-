import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { ChromaClient, Collection } from "./chromaClient";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shareable facts DB interface
interface SportFact {
  sport: string;
  fact: string;
}

// Global ChromaDB Client & Collection instance variables
const chromaClient = new ChromaClient();
let sportsCollection: Collection | null = null;

/**
 * Initializes ChromaDB and seeds the "sports_history" collection
 */
async function initChromaDB() {
  try {
    const filePath = path.join(process.cwd(), "data", "sports_facts.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const factsList: SportFact[] = JSON.parse(fileContent);

    sportsCollection = await chromaClient.getOrCreateCollection({ name: "sports_history" });

    // Seed the collection with our offline facts structured properly for ChromaDB
    const ids = factsList.map((f, i) => `fact_${f.sport.toLowerCase()}_${i}`);
    const metadatas = factsList.map((f) => ({ sport: f.sport }));
    const documents = factsList.map((f) => f.fact);

    await sportsCollection.add({
      ids,
      metadatas,
      documents,
    });

    console.log("[ChromaDB Seeder] Successfully initialized and seeded 'sports_history' vector collection!");
  } catch (err) {
    console.error("[ChromaDB Seeder Error] Failed to seed 'sports_history' collection:", err);
  }
}

// Global Gemini client helper (Lazy initialization)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your Secrets panel or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Searches local facts for the requested sport using the ChromaDB collection query.
 */
async function queryLocalFacts(sport: string, queryText?: string): Promise<string[]> {
  try {
    if (!sportsCollection) {
      console.warn("[ChromaDB Warning] sportsCollection is not seeded yet. Seeding now.");
      await initChromaDB();
    }

    if (!sportsCollection) {
      return [];
    }

    // Query the ChromaDB collection using standard vector syntax
    const queryResults = await sportsCollection.query({
      queryTexts: queryText ? [queryText] : [sport],
      nResults: 3,
      where: { sport: sport },
    });

    // Extract documents safely from the returned ChromaDB query schema
    const docsList = queryResults.documents[0] || [];
    return docsList.filter((doc): doc is string => doc !== null);
  } catch (error) {
    console.error("[ChromaDB Query Error] Failed to retrieve facts from ChromaDB collection:", error);
    return [];
  }
}

/**
 * Scrapes DuckDuckGo HTML search results for live updates.
 * Implements a clean, robust pattern and graceful fallback if DDG is throttled or offline.
 */
async function getLiveNewsContext(sport: string): Promise<string> {
  const query = `${sport} latest match updates championship winners news 2026`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  console.log(`[CRAWLER] Fetching live updates from DuckDuckGo for query: "${query}"`);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo responded with status ${response.status}`);
    }

    const html = await response.text();
    const snippets: string[] = [];

    // Extract snippets matching the DuckDuckGo HTML layout
    // Typically matches: <a class="result__snippet" ...>...</a>
    const snippetRegex = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    let index = 1;

    while ((match = snippetRegex.exec(html)) !== null && index <= 3) {
      const text = match[1].replace(/<[^>]*>/g, "").trim();
      if (text) {
        snippets.push(`[Web Source ${index}] ${text}`);
        index++;
      }
    }

    // Alternate regex fallback for td.result-snippet or generic result descriptions
    if (snippets.length === 0) {
      const tdRegex = /<td class="result-snippet">([\s\S]*?)<\/td>/g;
      let altIndex = 1;
      while ((match = tdRegex.exec(html)) !== null && altIndex <= 3) {
        const text = match[1].replace(/<[^>]*>/g, "").trim();
        if (text) {
          snippets.push(`[Web Source ${altIndex}] ${text}`);
          altIndex++;
        }
      }
    }

    if (snippets.length > 0) {
      return snippets.join("\n\n");
    }

    return `No immediate search result snippets could be parsed from DuckDuckGo HTML format. Generating with latest 2026 parameters.`;
  } catch (error: any) {
    console.warn(`[CRAWLER WARNING] Live web search had a network error or was rate limited: ${error.message}`);
    return `Live web connection not fully active or restricted. Fallback: Querying grounded sports database parameters directly.`;
  }
}

/**
 * Safely calls Gemini's generateContent with automatic retry on 503/429
 * and model fallback from gemini-3.5-flash to gemini-flash-latest.
 */
async function generateQuizContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config: any;
  }
): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let delay = 1000;
    const maxRetriesForModel = 2;

    for (let attempt = 1; attempt <= maxRetriesForModel; attempt++) {
      try {
        console.log(`[GEMINI] Generating content with model: ${modelName} (Attempt ${attempt}/${maxRetriesForModel})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          console.log(`[GEMINI SUCCESS] Model ${modelName} succeeded!`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.error(`[GEMINI ERROR] Model ${modelName} (Attempt ${attempt}) failed:`, err.message || err);

        const isRetryable =
          err.status === "UNAVAILABLE" ||
          err.message?.toLowerCase().includes("unavailable") ||
          err.message?.toLowerCase().includes("503") ||
          err.message?.toLowerCase().includes("temporary") ||
          err.message?.toLowerCase().includes("demand") ||
          err.message?.toLowerCase().includes("429") ||
          err.message?.toLowerCase().includes("exhausted") ||
          err.message?.toLowerCase().includes("busy") ||
          err.message?.toLowerCase().includes("limit") ||
          err.statusCode === 503 ||
          err.statusCode === 429;

        if (attempt < maxRetriesForModel && isRetryable) {
          console.log(`[GEMINI] Temporary error. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          break; // Break retry loop for this model and try next model
        }
      }
    }
    
    console.warn(`[GEMINI WARNING] Model ${modelName} completely failed. Trying fallback...`);
  }

  throw lastError || new Error("Failed to generate content using primary and fallback Gemini models.");
}

// API Routes

// 1. Get sports list and details
app.get("/api/sports", async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "data", "sports_facts.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const factsList: SportFact[] = JSON.parse(fileContent);

    // Group and count facts
    const sportsMap: Record<string, number> = {};
    factsList.forEach((f) => {
      sportsMap[f.sport] = (sportsMap[f.sport] || 0) + 1;
    });

    const list = Object.keys(sportsMap).map((name) => ({
      name,
      factsCount: sportsMap[name],
    }));

    res.json({ success: true, sports: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Generate a RAG quiz
app.post("/api/quiz/generate", async (req, res) => {
  const { sport, difficulty, questionCount = 3, focus = "" } = req.body;

  if (!sport) {
    return res.status(400).json({ success: false, error: "Sport parameter is required." });
  }

  try {
    // A. Gather offline facts from our local "ChromaDB-equivalent" search
    const localFacts = await queryLocalFacts(sport, focus || undefined);
    const historicalContext = localFacts.length > 0 
      ? localFacts.map((f, i) => `[Historical Fact ${i + 1}] ${f}`).join("\n")
      : "No offline historical data recorded for this sport.";

    // B. Scrape live web search
    const liveContext = await getLiveNewsContext(sport);

    // C. Form unified context
    const unifiedContext = `=== HISTORICAL FACTS ===\n${historicalContext}\n\n=== LIVE INTERNET NEWS ===\n${liveContext}`;

    // D. Call Gemini via @google/genai SDK
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert sports quiz creator. Your job is to write a multiple-choice quiz relying strictly on the provided Context. Avoid hallucinations. Do not use facts not found in the Context details below. If facts are scarce, make do with what you have, but keep details completely accurate to the text context. Ensure the questions match the targeted difficulty: ${difficulty}.
    
CONTEXT DETAILS:
${unifiedContext}`;

    const userPrompt = `Generate exactly ${questionCount} unique multiple-choice questions for the sport: ${sport}.
Difficulty target: ${difficulty}.
${focus ? `Optional Focus: ${focus}.` : ""}

Ensure the generated options are well-crafted, clear, and feature exactly one correct choice. Each option must have a corresponding option label like "A) ...", "B) ...", "C) ...", "D) ...". Provide a detailed explanation for each answer that quotes or references the provided context details.`;

    const response = await generateQuizContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING, description: "Elegant title of the generated quiz" },
            questions: {
              type: Type.ARRAY,
              description: `List of exactly ${questionCount} multiple choice questions`,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    description: "Exactly four multiple-choice options, starting with 'A) ', 'B) ', 'C) ', 'D) '",
                    items: { type: Type.STRING },
                  },
                  correctOption: { 
                    type: Type.STRING, 
                    description: "The correct option letter. Must be one of: 'A', 'B', 'C', or 'D'" 
                  },
                  explanation: { 
                    type: Type.STRING, 
                    description: "Reasoning and citation of the facts from the ground-truth context that prove why this option is correct" 
                  }
                },
                required: ["questionText", "options", "correctOption", "explanation"]
              }
            }
          },
          required: ["quizTitle", "questions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the AI model.");
    }

    const quizData = JSON.parse(text);

    // Return the response containing the quiz, and the ground-truth context used for audit/inspection
    res.json({
      success: true,
      quizTitle: quizData.quizTitle,
      questions: quizData.questions,
      contextUsed: unifiedContext
    });

  } catch (error: any) {
    console.error("Quiz generation endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup dev/prod configurations
async function bootstrap() {
  // Initialize ChromaDB collection and seed facts
  await initChromaDB();

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

bootstrap();
