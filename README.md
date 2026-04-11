# The Polling Authority — Frontend

Production-oriented Vite + React app for the polling API. UI follows the Google Stitch “The Polling Authority” design (dark Material-style surfaces, gradient primary, glass panels).

## Prerequisites

- Node.js 18+
- Backend API running (default `http://localhost:3000`) with CORS allowing `http://localhost:5173`

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_API_URL` — API base URL (e.g. `http://localhost:3000`)
- `VITE_CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` — **Unsigned** upload preset for direct browser uploads

## Scripts

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Stack

React Router, TanStack Query, Axios, Tailwind CSS v4, GSAP, i18next (EN/AR + RTL), Zustand, React Hook Form + Zod, react-hot-toast, Cloudinary direct upload with progress.

## API notes

- Public: `GET /api/v1/polls`, `GET /api/v1/polls/:id`
- Authenticated: options, votes, per-poll results, create poll/options (see `src/features/polls/PollService.js`)
- Poll “cover” + description are stored in the `description` field via `encodePollDescription` (`src/utils/pollDescription.js`) so no backend schema change is required.
