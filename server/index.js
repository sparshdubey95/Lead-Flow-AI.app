/**
 * Lead-Flow AI — WhatsApp Webhook Server
 * ───────────────────────────────────────
 * Standalone Express server that:
 *  1. Handles Meta WhatsApp Cloud API webhook verification (GET /webhook)
 *  2. Receives incoming WhatsApp messages (POST /webhook)
 *  3. Generates bilingual clinic-receptionist replies via Google Gemini
 *  4. Sends the AI response back through the WhatsApp Graph API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ──────────────────────────────────────────────
// Environment variables
// ──────────────────────────────────────────────
const {
  PORT = 3001,
  WEBHOOK_VERIFY_TOKEN,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  GEMINI_API_KEY,
} = process.env;

// ──────────────────────────────────────────────
// Gemini AI setup
// ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are the front-desk receptionist for a premium medical clinic called "Lead-Flow Clinic".

Your responsibilities:
- Greet patients warmly and help them book, reschedule, or cancel appointments.
- Answer common questions about clinic hours (Mon–Fri 8 AM – 6 PM, Sat 9 AM – 1 PM, closed Sundays), accepted insurances, and services offered (general check-ups, dental, dermatology, pediatrics).
- If the patient describes an emergency, advise them to call emergency services immediately and provide the clinic's emergency hotline: +1-800-555-0199.

Language rules — CRITICAL:
- You MUST detect the language the user is writing in and reply in that EXACT same language.
- Supported languages: English, Spanish (Español), French (Français), German (Deutsch), Italian (Italiano).
- If the user writes in Spanish, you reply entirely in Spanish. If French, entirely in French. And so on.
- Never mix languages within a single reply.
- If the language is not one of the five supported, reply in English and politely mention the supported languages.

Tone:
- Warm, professional, concise. Use short paragraphs.
- Do NOT use markdown formatting (no asterisks, no bullet points). Write plain text suitable for WhatsApp.
- Keep replies under 300 words.`,
});

// ──────────────────────────────────────────────
// Express app
// ──────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Lead-Flow AI WhatsApp Server" });
});

// ──────────────────────────────────────────────
// GET /webhook — Meta verification challenge
// ──────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verification successful.");
    return res.status(200).send(challenge);
  }

  console.warn("⚠️  Webhook verification failed. Token mismatch.");
  return res.sendStatus(403);
});

// ──────────────────────────────────────────────
// POST /webhook — Incoming WhatsApp messages
// ──────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  // Always respond 200 immediately to prevent Meta webhook timeouts
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validate payload structure
    if (
      !body?.object ||
      !body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    ) {
      // Not a message event (could be a status update, etc.) — ignore silently
      return;
    }

    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];

    // Only handle text messages for now
    if (message.type !== "text") {
      console.log(`ℹ️  Received non-text message type: ${message.type}. Skipping.`);
      return;
    }

    const userPhone = message.from; // e.g. "521234567890"
    const userText = message.text.body;

    console.log(`📩 Message from ${userPhone}: "${userText}"`);

    // ── Generate AI reply via Gemini ──
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(userText);
    const aiReply = result.response.text();

    console.log(`🤖 AI reply: "${aiReply.substring(0, 80)}..."`);

    // ── Send reply back via WhatsApp Graph API ──
    await sendWhatsAppMessage(userPhone, aiReply);

    console.log(`✅ Reply sent to ${userPhone}`);
  } catch (err) {
    // Log but never crash — Meta will retry on non-200 responses
    console.error("❌ Error processing webhook:", err.message || err);
  }
});

// ──────────────────────────────────────────────
// WhatsApp Graph API sender
// ──────────────────────────────────────────────
async function sendWhatsAppMessage(recipientPhone, textBody) {
  const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "text",
      text: { body: textBody },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  Lead-Flow AI — WhatsApp Webhook Server      ║
║  Running on http://localhost:${PORT}            ║
╚══════════════════════════════════════════════╝
  `);
});
