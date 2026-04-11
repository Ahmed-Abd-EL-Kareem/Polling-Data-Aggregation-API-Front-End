# The Polling Authority — Frontend

Single-page application for **The Polling Authority**: browse polls, vote, create polls with optional cover images, manage your profile, and (for admins) view platform-wide statistics. It talks to the companion **Express + MongoDB** API and is built with **Vite** and **React**.

The UI follows the **Google Stitch** “The Polling Authority” direction—dark Material-style surfaces, a strong primary gradient, glass-style panels, and a polished marketing hero on the home page.

## How this frontend was built

- **Cursor AI** — Used as an AI-assisted editor for implementing features, wiring routes and API calls, forms, state, and refactors.
- **Google Stitch** — Used for **design exploration**: layout, typography, color system, and component feel before and during implementation.

## The idea (from the user’s perspective)

The app turns **group opinions into clear numbers**: each poll has a question, options, and an **end time**. Signed-in users **vote once**; the UI then shows **aggregated results** (counts, percentages, progress bars) so individuals and communities can see the signal—not just chat.

The frontend emphasizes **discovery** (searchable poll grid), **trust** (one vote per poll enforced by the API), and **readability** in both **English and Arabic** with **light and dark** themes.

## How to use the website

### Browsing (anyone)

1. Open the **home** page to see polls in a grid; use **search** to filter by title, description, or creator.
2. Click a poll card or open `/poll/<id>` to view details.

### Account

1. Use **Register** or **Login**. **Continue with Google** is available when the backend OAuth URL is configured (`/auth/google`).
2. After login, you get **Create poll**, **Profile**, and **Admin dashboard** (only if your account has the `admin` role).

### Voting

1. On a poll page, pick **one** option and submit.
2. After you vote—or when the poll **expires**—you see **live aggregated results**. If you already voted, the UI may **refresh results** on an interval so totals stay current.

### Creating a poll

1. Go to **Create poll** (`/create`).
2. Enter a **title**, optional **description**, optional **cover image** (Cloudinary direct upload when env vars are set), **expiration** date/time, and at least **two** options (add/remove rows as needed).
3. Submit; you return to home and the new poll appears in the list.

### Profile & admin

- **Profile** (`/profile`): view and update **name** and **email**.
- **Admin dashboard** (`/admin`): **global** stats (total polls, total votes, highlights). Non-admins see an access-denied screen.

### UI controls

- **Sun / moon** — Toggle light or dark theme.
- **Globe** — Switch **English ↔ Arabic** (RTL where applicable).
- **Logout** — Clear session (important on shared devices).

## Technologies used

| Technology | Role |
|------------|------|
| **React 19** | UI components and client rendering |
| **Vite** | Dev server, HMR, production build |
| **React Router** | SPA routes (`/`, `/login`, `/register`, `/poll/:id`, `/create`, `/profile`, `/admin`) |
| **TanStack Query** | Server state, caching, mutations, polling for results |
| **Zustand** | Auth and theme (and related client state) |
| **Axios** | HTTP client (`src/services/api.js`) |
| **Tailwind CSS 4** | Styling via `@tailwindcss/vite` |
| **React Hook Form** + **Zod** + **@hookform/resolvers** | Validated forms (auth, create poll, profile) |
| **i18next** + **react-i18next** | Translations (EN/AR) |
| **GSAP** | Page and list motion |
| **Lucide React** | Icons |
| **Radix UI** (`@radix-ui/react-slot`) | Composable primitives for buttons and UI |
| **class-variance-authority**, **clsx**, **tailwind-merge** | Variants and class names |
| **react-hot-toast** | Toasts for success and errors |
| **ESLint** | Linting |

**Media:** poll cover images use **Cloudinary** unsigned uploads from the browser when `VITE_CLOUDINARY_*` are set.

## Prerequisites

- **Node.js** 18+
- Backend API running with CORS allowing your dev origin (default `http://localhost:5173`)

## Environment

Copy `.env.example` to `.env.local` (or `.env`) and set:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (e.g. `http://localhost:3000` or your deployed API) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (dashboard) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | **Unsigned** upload preset for direct browser uploads |

## Scripts

```bash
npm install
npm run dev
```

Build and preview production output:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## API integration notes

- Public: `GET /api/v1/polls`, `GET /api/v1/polls/:id`
- Authenticated: poll options, voting, per-poll results, create poll/options, profile, admin stats — see `src/features/polls/PollService.js` and `src/services/`.
- Poll **cover + rich description** may be encoded in the poll `description` field via `encodePollDescription` / `getPollCoverAndBody` in `src/utils/pollDescription.js` so the backend schema stays unchanged.

---

**Author:** Ahmed Abd-Elkareem
