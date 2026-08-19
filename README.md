# AI EDI Analyzer

An AI-powered tool that reads EDI messages, order confirmations, invoices, and other business emails, then classifies them, summarizes them, extracts key fields, and flags which ones are time-sensitive or important. It's built as three connected pieces:

- **`backend/`** — Node.js/Express API that sends message text to Google's Gemini model and returns structured JSON.
- **`frontend/`** — A Vite + React web app for uploading a file and viewing results in a dashboard (with a chart of message types).
- **`gmail-extension/`** — A Chrome (Manifest V3) extension that adds an "Analyze" button directly inside Gmail, so you can analyze an open email with one click.

## How it works

1. You provide message text — either by uploading a `.txt` file in the web app, or by clicking "Analyze" on an open email in Gmail.
2. The text is sent to the backend at `POST /api/analyze`.
3. The backend prompts Gemini (`gemini-2.5-flash`) to analyze the message and return a strict JSON object:
   ```json
   {
     "messageType": "ORDER | INVOICE | CANCEL | SHIPMENT | REJECTION | INVITATION | UNKNOWN",
     "isImportant": true,
     "summary": "One-sentence summary of the message.",
     "timestamp": "2025-11-13T13:00:00Z",
     "keyFields": { "eventName": "...", "eventLocation": "..." }
   }
   ```
4. `isImportant` is decided using the current date (currently hardcoded for the Pune, India / IST timezone): a message is flagged important if its event date is today or in the future **and** it's a cancellation/rejection, uses urgent language, or falls within the next 3 days. Anything with no date, or a date already in the past, is treated as expired and not important.
5. The frontend (or the Gmail modal) renders that JSON as a readable card.

## Project structure

```
.
├── backend/              Express API, Gemini integration (index.js)
├── frontend/             Vite + React + Tailwind dashboard UI
├── gmail-extension/      Chrome MV3 extension (content script + background worker)
├── email.txt             Sample email for local testing
└── test-invoice.txt      Sample invoice for local testing
```

## Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey))
- A Chromium-based browser (Chrome/Edge) if you want to use the Gmail extension

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Start the server:

```bash
node index.js
```

The API will run at `http://localhost:3001`.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it, upload a text file (try `test-invoice.txt` or `email.txt` from the repo root), and click **Analyze**.

> Note: the frontend currently calls the backend at a hardcoded `http://localhost:3001/api/analyze`, so the backend must be running on that port.

### 3. Gmail extension

1. Go to `chrome://extensions` (or the equivalent in your browser).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `gmail-extension/` folder.
4. Open Gmail (`mail.google.com`), open any email, and click the **Analyze** button injected into the toolbar. Results appear in a popup modal.

The extension requires the backend to be running locally at `http://localhost:3001` — this is declared in `manifest.json`'s `host_permissions`.

## API reference

### `POST /api/analyze`

Accepts **either**:
- `multipart/form-data` with a file field named `ediFile` (used by the frontend), or
- a JSON body `{ "text": "..." }` (used by the Gmail extension).

Returns the structured analysis JSON described above, or `{ "error": "..." }` with a `4xx`/`5xx` status on failure.

## Configuration notes

- The backend listens on port `3001` (hardcoded in `backend/index.js`).
- The "current location/timezone" used for date reasoning (Pune, India / IST) is hardcoded in the prompt inside `analyzeText()` in `backend/index.js` — update it there if you're deploying this for a different timezone.
- CORS is fully open on the backend (`app.use(cors())`) for local development; tighten this before deploying anywhere public.

## Troubleshooting

- **"Port already in use"** — stop whatever else is using port 3001, or change `PORT` in `backend/index.js` (and update the frontend/extension URLs to match).
- **Frontend/extension can't reach the backend** — confirm `node index.js` is running and that nothing is blocking `localhost:3001`.
- **`Failed to parse the analysis from AI`** — the model didn't return valid JSON. Check the `GEMINI_API_KEY` is set correctly and check the "Raw AI Response" logged in the backend console.
- **Extension button doesn't appear in Gmail** — reload the extension after code changes, and make sure you're on `mail.google.com` with an email actually open.

## Roadmap / known gaps

- No automated tests yet (a good first addition: Jest/Supertest for the backend API, Vitest/RTL for the frontend).
- No `.env.example` file — consider adding one for `GEMINI_API_KEY`.
- No license file — add one (e.g., MIT) if you plan to share or open-source this.

## License

No license is currently specified for this project.
