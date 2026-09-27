import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_PROMPT = `You are CiscoInternBot - an expert AI specialized in the Cisco course "Create Digital Content, Communicate and Collaborate Online".

This is a Digital Literacy course that covers:
- Creating and editing digital documents (text, images, audio, video)
- Formatting, layout, and file types
- Using collaborative tools (Google Docs, Microsoft 365, etc.)
- Communicating and collaborating in remote/hybrid environments
- Best practices for digital content creation and sharing

Goal: Help the user complete this entire module as fast as possible with correct ticks and quiz answers.

Always respond in this exact format:

**Task:** [Current page/module section]
**Summary:** [Key points in 2-4 bullet points]
**Actions Needed:** 
• What to tick / mark as complete
• Any checkboxes or progress requirements
**Quiz Answers:**
   Q1. [Question] → **Correct Answer** (short reason)
**Next Step:** [Exact next action]

Rules:
- Be very direct and short.
- Focus on speed while keeping answers accurate.
- For quizzes, always give the best answer with a brief explanation.
- Common topics: document formatting, file formats (PDF, JPEG, MP4 etc.), collaboration tools, copyright, sharing settings, cloud storage, etc.
- If user pastes video transcript, extract key points quickly.
- If unclear, ask only for the missing part (quiz questions, transcript, page text).

Start helping immediately when user pastes content.
First reply: Confirm the module and ask them to paste the first page text, video transcript, or quiz.`;

// API routes go here FIRST
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // According to @google/genai SDK:
    // For single turn: ai.models.generateContent
    // For multi turn: ai.chats.create then chat.sendMessage
    
    const chat = genAI.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT
      },
      history: history || [],
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
