# Lead-Flow AI — WhatsApp Webhook Server

Standalone Express.js server that powers the AI receptionist for Lead-Flow AI.

## Architecture

```
WhatsApp User ──► Meta Cloud API ──► POST /webhook ──► Gemini 1.5 Flash ──► WhatsApp Reply
```

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

| Variable | Where to find it |
|---|---|
| `WEBHOOK_VERIFY_TOKEN` | You choose this — any random string |
| `WHATSAPP_ACCESS_TOKEN` | Meta Business Manager → System Users → Generate Token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta App Dashboard → WhatsApp → API Setup |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

### 3. Run locally

```bash
npm run dev
```

The server starts on `http://localhost:3001`.

### 4. Expose to the internet (for Meta webhook registration)

Use [ngrok](https://ngrok.com) during development:

```bash
ngrok http 3001
```

Then register the ngrok HTTPS URL as your webhook in the Meta App Dashboard:
- **Callback URL:** `https://your-id.ngrok-free.app/webhook`
- **Verify Token:** The value you set in `WEBHOOK_VERIFY_TOKEN`

## Deployment (Production)

Deploy to **Render** or **Railway** as a simple Node.js web service:

1. Set the root directory to `server/`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all `.env` variables as environment secrets

## API Routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/webhook` | Meta webhook verification challenge |
| `POST` | `/webhook` | Receive incoming WhatsApp messages |
