/**
 * proxy.js — OpenAI Proxy Server for Roblox AI NPC
 *
 * Roblox cannot call OpenAI directly due to CORS and domain restrictions.
 * This tiny Node.js server acts as a middleman.
 *
 * SETUP:
 *   1. npm install express openai cors
 *   2. Set your OPENAI_API_KEY as an environment variable
 *   3. node proxy.js
 *   4. Deploy to Railway, Render, Fly.io, or any Node host
 *   5. Paste your deployed URL into your script as PROXY_URL
 */

const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");

const app  = express();
const port = process.env.PORT || 3000;

// ── OpenAI client ──────────────────────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set this in your hosting environment
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

  // Build the messages array for OpenAI
  const messages = [
    { role: "system", content: system || "You are a helpful NPC in a Roblox game." },
    ...history.map((msg) => ({
      role: msg.role,       // "user" or "assistant"
      content: msg.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // Fast and cheap; swap for "gpt-4o" for better quality
      messages: messages,
      max_tokens: 120,         // Keep NPC replies short
      temperature: 0.85,       // Slight creativity
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "...";
    res.json({ reply });

  } catch (err) {
    console.error("[Proxy Error]", err.message);
    res.status(500).json({ error: "OpenAI request failed.", detail: err.message });
  }
});

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🤖 AI NPC Proxy running on port ${port}`);
});
