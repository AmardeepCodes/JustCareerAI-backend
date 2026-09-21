# JustCareer.ai

**An AI-powered, full-stack job search and interview preparation platform.**

JustCareer.ai helps job seekers get past the resume screen and into the interview room — combining ATS-style resume analysis, AI job matching, cover letter generation, and a voice-interactive mock interview coach into one platform.

---

## ✨ Features

| Feature | What it does |
|---|---|
| **Resume ATS Analysis** | Scores a resume against a job description, surfaces matched/missing keywords, and gives actionable improvement tips |
| **AI Job Matching** | Extracts relevant job titles and skills from a candidate's profile, then searches live job listings (India + remote) that fit |
| **Cover Letter Generator** | Generates a tailored cover letter from the candidate's resume and a target job description |
| **Voice-Based Mock Interview** | AI generates role-specific interview questions, **speaks them aloud**, accepts spoken or typed answers, and gives STAR-method feedback with a score |
| **Bullet Point Rewriter** | Rewrites weak resume bullet points into stronger, quantified, ATS-friendly versions |
| **ATS Resume Builder** | Generates a polished, ATS-compatible resume PDF from a structured profile using LaTeX |
| **Auth** | Email/password (JWT) and Google OAuth 2.0 |

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router, Framer Motion, Recharts, Lucide Icons
- Web Speech API (speech synthesis + recognition) for the voice interview

**Backend**
- Node.js + Express 5 (ESM)
- MongoDB + Mongoose
- Passport.js (Google OAuth 2.0) + JWT
- Google Gemini AI (`@google/genai`) for all AI-generated content
- JSearch / Adzuna APIs for live job listings

**Infrastructure**
- Redis (via `ioredis`, hosted on Upstash) — response caching and a horizontally-scalable rate-limiter store
- `express-rate-limit` — tiered limits (general / auth / AI-cost-sensitive routes)
- `helmet` — security headers
- `compression` — gzip responses

---

## 🏗️ Architecture & Engineering Notes

A few decisions worth calling out, since they came from real debugging rather than defaults:

- **Redis caching with content fingerprinting** — Job Match results are cached by an MD5 hash of the parts of a user's profile that affect matching (skills, experience, education). If the profile hasn't changed, a repeat request skips both the Gemini call and the external job-search API call entirely — cutting cost and latency. Caching degrades gracefully: if Redis is unreachable, the app falls back to a live fetch instead of failing.
- **Redis-backed rate limiting** — `express-rate-limit`'s default store is in-memory per process, which breaks down the moment the app runs as more than one instance behind a load balancer (each instance counts independently). The store here is Redis-backed when `REDIS_URL` is set, so limits hold correctly across multiple instances; it falls back to the in-memory store automatically when Redis isn't configured.
- **Compound MongoDB indexes + pagination** — history endpoints (analyses, cover letters, interview sessions) are indexed on `{ userId, createdAt }` and paginated, so response time and payload size stay flat as a user's history grows instead of degrading linearly.
- **Security hardening** — `passwordHash` is excluded from all queries by default (`select: false` on the schema) so it can never leak into an API response; login returns a generic "invalid email or password" for both a wrong password and an unregistered email, to avoid leaking which emails are registered.

### Scalability — current state, honestly
The codebase is designed to scale (indexed queries, pagination, a cache layer, and a rate limiter that works across multiple instances), but it has **not been load-tested**, and a few things would need to change before it could actually serve large concurrent traffic:
- It isn't deployed yet — it currently runs locally.
- Third-party free tiers (Gemini, JSearch/Adzuna, MongoDB Atlas M0, Upstash free) have request-rate and connection ceilings well below what heavy concurrent traffic would need.
- The Node process runs single-instance; real horizontal scaling would mean running it under something like PM2 cluster mode or multiple containers behind a load balancer.

---

## 📂 Project Structure

```
JOB/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, Redis, Passport setup
│   │   ├── controllers/   # Route handlers (AI calls, auth, resume, etc.)
│   │   ├── middlewares/   # Auth, rate limiting, file upload
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   ├── lib/           # Token / hashing / email helpers
│   │   ├── utils/         # Cache, LaTeX builder, resume generator
│   │   └── app.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, shared UI
    │   ├── pages/         # Route-level pages
    │   └── utils/         # Axios instance
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas free tier)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone & install
```bash
git clone <your-repo-url>
cd JOB

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`**
```
NODE_ENV=development
PORT=5000

MONGO_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_SECRET=

GEMINI_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

JSEARCH_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Optional — leave blank and the app runs fine without caching/distributed rate limiting.
# Free Redis DB: https://upstash.com
REDIS_URL=
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

> **Never commit `.env` or hardcode API keys anywhere in the source** — even in comments. Leaked keys get flagged and blocked by providers automatically.

### 3. Run it
```bash
# backend
cd backend
npm run dev

# frontend (separate terminal)
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

---

## 🔒 Security

- Passwords hashed with bcrypt; hash is never returned in any API response
- JWT-based auth with a 7-day expiry
- Google OAuth 2.0 via Passport.js
- Tiered rate limiting (general, auth, AI-cost-sensitive routes)
- Security headers via Helmet, with a scoped `crossOriginResourcePolicy` exception so cross-origin PDF downloads still work
- Generic auth error messages to prevent user enumeration

---

## 📄 License

This project is for personal/portfolio use.

---

## 👤 Author

**Amardeep Kumar**
[GitHub](https://github.com/AmardeepCodes) · [LinkedIn](https://linkedin.com/in/amardeepkumar1810)
