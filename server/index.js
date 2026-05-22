/**
 * TryAssistly.AI — Agnostic Multi-Tenant Webhook Server
 * ───────────────────────────────────────
 * Standalone Express server that:
 *  1. Handles Meta WhatsApp Cloud API webhook verification per org
 *  2. Receives incoming WhatsApp messages
 *  3. Queries Supabase for BYOK credentials (WhatsApp + Gemini)
 *  4. Logs leads and messages securely using Supabase service role
 *  5. Generates bilingual replies via Google Gemini
 *  6. Sends the AI response back through the WhatsApp Graph API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

// ──────────────────────────────────────────────
// Environment variables
// ──────────────────────────────────────────────
const {
  PORT = 3001,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, // Service role bypasses RLS for logging leads/messages
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables. Exiting.");
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ──────────────────────────────────────────────
// Express app setup
// ──────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "TryAssistly.AI Multi-Tenant Webhook Server" });
});

// ──────────────────────────────────────────────
// GET /webhook/:orgId — Meta verification challenge
// ──────────────────────────────────────────────
app.get("/webhook/:orgId", async (req, res) => {
  const { orgId } = req.params;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token) {
    try {
      // Look up the org's saved verification token
      const { data: org, error } = await supabase
        .from("organizations")
        .select("whatsapp_verify_token")
        .eq("id", orgId)
        .single();

      if (error || !org) {
        console.warn(`⚠️  Verification failed: Organization ${orgId} not found.`);
        return res.sendStatus(403);
      }

      if (token === org.whatsapp_verify_token) {
        console.log(`✅ Webhook verified for org: ${orgId}`);
        return res.status(200).send(challenge);
      } else {
        console.warn(`⚠️  Verification failed: Token mismatch for org ${orgId}.`);
        return res.sendStatus(403);
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(400);
});

// ──────────────────────────────────────────────
// POST /webhook/:orgId — Incoming WhatsApp messages
// ──────────────────────────────────────────────
app.post("/webhook/:orgId", async (req, res) => {
  // 1. Immediately acknowledge Meta to prevent retries/timeouts
  res.sendStatus(200);

  const { orgId } = req.params;

  try {
    const body = req.body;

    // Validate payload structure
    if (!body?.object || !body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return; // Not a text message event
    }

    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];
    const contact = change.contacts?.[0];
    
    // Only handle text messages
    if (message.type !== "text") {
      console.log(`ℹ️  Non-text message type (${message.type}) from org ${orgId}. Skipping.`);
      return;
    }

    const userPhone = message.from;
    const userName = contact?.profile?.name || "Unknown Lead";
    const userText = message.text.body;

    console.log(`📩 [Org ${orgId.split('-')[0]}] Msg from ${userPhone}: "${userText}"`);

    // 2. Fetch Organization BYOK Credentials
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("whatsapp_access_token, whatsapp_phone_id, gemini_api_key")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      console.error(`❌ [Org ${orgId}] Organization not found or DB error.`);
      return;
    }

    if (!org.whatsapp_access_token || !org.whatsapp_phone_id || !org.gemini_api_key) {
      console.error(`❌ [Org ${orgId}] Missing BYOK credentials. Aborting.`);
      return;
    }

    // 3. Lead & Message Logging (Inbound)
    // Upsert lead (relies on UNIQUE(organization_id, phone_number) constraint)
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        { 
          organization_id: orgId, 
          phone_number: userPhone, 
          name: userName,
          updated_at: new Date().toISOString()
        },
        { onConflict: "organization_id,phone_number" }
      )
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error(`❌ [Org ${orgId}] Failed to upsert lead:`, leadError);
      return;
    }

    // Insert inbound message
    const { error: msgError } = await supabase
      .from("messages")
      .insert({
        lead_id: lead.id,
        direction: "inbound",
        content: userText,
        is_ai_generated: false,
      });

    if (msgError) {
      console.error(`❌ [Org ${orgId}] Failed to log inbound message:`, msgError);
    }

    // 4. AI Processing via Gemini
    const genAI = new GoogleGenerativeAI(org.gemini_api_key);
    const aiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful bilingual assistant for a local business. Answer inquiries politely, help with bookings, and respond in the exact language the user typed in.",
    });

    const chat = aiModel.startChat({ history: [] }); // In a production app, you'd fetch previous messages for context
    const result = await chat.sendMessage(userText);
    const aiReply = result.response.text();

    console.log(`🤖 [Org ${orgId.split('-')[0]}] AI reply: "${aiReply.substring(0, 50)}..."`);

    // 5. Send WhatsApp Reply
    await sendWhatsAppMessage(
      userPhone,
      aiReply,
      org.whatsapp_phone_id,
      org.whatsapp_access_token
    );
    console.log(`✅ [Org ${orgId.split('-')[0]}] Reply sent to ${userPhone}`);

    // 6. Log AI Response (Outbound)
    await supabase.from("messages").insert({
      lead_id: lead.id,
      direction: "outbound",
      content: aiReply,
      is_ai_generated: true,
    });

  } catch (err) {
    console.error(`❌ [Org ${orgId}] Webhook processing error:`, err.message || err);
  }
});

// ──────────────────────────────────────────────
// WhatsApp Graph API sender
// ──────────────────────────────────────────────
async function sendWhatsAppMessage(recipientPhone, textBody, phoneId, accessToken) {
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

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
        Authorization: `Bearer ${accessToken}`,
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
║  TryAssistly.AI — Multi-Tenant Webhook Server  ║
║  Running on http://localhost:${PORT}            ║
╚══════════════════════════════════════════════╝
  `);
});
