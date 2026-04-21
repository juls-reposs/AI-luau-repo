/**
 * proxy.js — Gemini Proxy Server for Roblox AI NPC
 *
 * SETUP:
 *   1. npm install express @google/generative-ai cors
 *   2. Set your GEMINI_API_KEY as an environment variable
 *      Get a free key at: https://aistudio.google.com/app/apikey
 *   3. node proxy.js
 *   4. Deploy to Render.com
 *   5. Paste your deployed URL into your script as PROXY_URL
 */

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app  = express();
const port = process.env.PORT || 3000;

// ── Gemini client ──────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // free tier model

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "AI NPC Proxy is running ✅" });
});

// ── Main chat endpoint ─────────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { system, history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Missing or invalid 'history' field." });
  }

  // Gemini uses "user" and "model" roles (not "assistant")
  // Also requires alternating user/model turns, starting with user
  const geminiHistory = history.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // The last message is the current user input
  const lastMessage = history[history.length - 1];
  const userMessage = lastMessage ? lastMessage.content : "";

  try {
    const chat = model.startChat({
      history: geminiHistory,
      systemInstruction: system || "You are a helpful NPC in a Roblox game.",
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.85,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text().trim() || "...";

    res.json({ reply });

  } catch (err) {
    console.error("[Proxy Error]", err.message);
    res.status(500).json({ error: "Gemini request failed.", detail: err.message });
  }
});

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🤖 AI NPC Proxy (Gemini) running on port ${port}`);
});
