# EDI Analyzer

A small, opinionated project for parsing and analyzing EDI-like invoice data with a local backend, a Vite + React frontend, and a small Gmail extension helper. This repository contains tools and demos for extracting invoice-like information, exploring mock data, and integrating a browser helper to capture email content.

## Contents

- `backend/` — Node.js backend and simple API (contains `index.js`, `package.json`).
- `frontend/` — Vite + React front-end demo (Tailwind + PostCSS configured).
- `gmail-extension/` — Chrome extension assets (content/background scripts, manifest) to help capture email content from Gmail.
- `email.txt`, `test-invoice.txt` — sample/raw invoice/email text used for local testing.
- `git.txt` — repository notes.

## Key features

- Lightweight Node.js backend for parsing/analyzing invoice text.
- Vite + React UI to present parsed data and demo flows.
- Small Gmail extension scaffold for capturing email text into the toolchain.
- Minimal example data so you can try parsing locally.

## Quick start (Windows PowerShell)

Prerequisites:

- Node.js (v16+ recommended) and npm (or pnpm/yarn)
- A Chromium-based browser for the Gmail extension (Chrome/Edge)

1) Backend

Open PowerShell, then:

```powershell
cd .\backend
npm install
# If the project defines an npm start script you can run:
npm start
# Otherwise run directly:
node index.js
```

The backend is a small Node script — check `backend/package.json` for scripts and any environment variables.

2) Frontend

In a separate PowerShell window:

```powershell
cd .\frontend
npm install
npm run dev
```

Vite will print the local URL (usually http://localhost:5173). Open that URL to view the demo UI.

3) Gmail extension (developer install)

- Open Chrome/Edge -> Extensions -> Enable "Developer mode"
- Click "Load unpacked" and point to the `gmail-extension/` folder
- The extension is a small helper that can read/capture email body text and send it to your local backend or save to disk depending on how you wire it.

## Usage

- Start the backend and frontend as described above.
- Use the UI to paste or load sample invoice text (`test-invoice.txt` / `email.txt`) and run the parsing/analysis.
- If you install the Gmail extension, use it to capture email text and forward it to the backend (adjust endpoints in `content_script.js` or `background.js` as needed).

## Development notes

- Frontend: Vite + React. TailwindCSS and PostCSS are configured in `frontend/` (see `tailwind.config.js` and `postcss.config.js`). Use `npm run build` in `frontend` to create a production build.
- Backend: Minimal Node script(s). If you add APIs, prefer Express or Fastify and expose a small JSON API for the frontend to consume.
- Gmail extension: This is a static extension geared for Gmail content scripting. Update `manifest.json` or scripts if you need extra permissions or different behavior.

## Project structure (summary)

- `backend/` — Node backend; check `index.js`.
- `frontend/` — React UI built with Vite; entry is `src/main.jsx`.
- `gmail-extension/` — extension scripts and manifest.
- Root files: `email.txt`, `test-invoice.txt` (samples), `git.txt` (notes).

## Environment & configuration

- If the backend exposes an API, configure the frontend to point at that host/port (default Vite dev server runs on port 5173; backend often on 3000 or another free port). Update any hard-coded URLs in `frontend/src` or `gmail-extension` scripts.
- For local development, you can use a simple proxy from Vite to the backend (edit `frontend/vite.config.js`) or set an environment variable like `VITE_API_URL`.

## Troubleshooting

- "Port already in use" — change the port or stop other services. For Node, use Task Manager or `Get-Process -Id <PID>` to find/kill a process in PowerShell.
- Frontend can't reach backend — ensure both are running and check CORS. For local testing, enable permissive CORS in the backend or proxy requests through Vite.
- Gmail extension not working — ensure you loaded the correct directory (unpacked) and granted required permissions in `manifest.json`.

## Adding tests

This repo doesn't include automated tests yet. Recommended minimal additions:

- Backend: Jest or Mocha + supertest for API tests.
- Frontend: React Testing Library + Vitest for component tests.

Add a couple of tests (happy path + one edge case like empty input) and wire them to CI if desired.

## Contributing

Feel free to open issues or PRs. When contributing:

- Add clear descriptions and targeted commits.
- Include tests for new parsing logic.
- Keep changes small and focused.

## License

No license file included in this repository. Add a `LICENSE` file if you want to set terms (MIT is a common permissive choice).

## Contact / Notes

If you need help customizing behavior (parsers, release/builds, deployment), open an issue or add TODOs in `git.txt` so collaborators can pick them up.

---

This README is intentionally concise. If you want, I can:

- Add a `README` per subproject (`backend/README.md`, `frontend/README.md`, `gmail-extension/README.md`) with exact run scripts discovered from `package.json` files.
- Add example curl or PowerShell requests to exercise backend endpoints once they're defined.
- Add a LICENSE file.

Tell me which of the above you'd like next and I will implement it.