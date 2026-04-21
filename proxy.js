/**
 * proxy.js — Groq Proxy Server for Roblox AI NPC
 *
 * SETUP:
 *   1. npm install express openai cors
 *   2. Set your GROQ_API_KEY as an environment variable
 *      Get a free key at: https://console.groq.com
 *   3. node proxy.js
 *   4. Deploy to Render.com
 *   5. Paste your deployed URL into your lua script as PROXY_URL
 */

const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");

const app  = express();
const port = process.env.PORT || 3000;

// ── Groq client (uses OpenAI-compatible API) ───────────────────────────────────
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

  const messages = [
    { role: "system", content: system || "You are a helpful NPC in a Roblox game." },
    ...history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",  // free and fast
      messages: messages,
      max_tokens: 120,
      temperature: 0.85,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "...";
    res.json({ reply });

  } catch (err) {
    console.error("[Proxy Error]", err.message);
    res.status(500).json({ error: "Groq request failed.", detail: err.message });
  }
});

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🤖 AI NPC Proxy (Groq) running on port ${port}`);
});
