# AIAudit — Free AI Spend Audit Tool

A free web app that audits your AI tool subscriptions and tells you exactly where you're overspending. Built as a lead-gen asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

**Target users:** Engineering managers and startup founders paying for Cursor, GitHub Copilot, Claude, ChatGPT, and similar tools.

---

## Screenshots


---

## Live Demo

🔗 [your-app.vercel.app](https://credex-audit-ten.vercel.app/)

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier)
- Anthropic API key
- Resend API key

### Install & Run Locally

```bash
git clone https://github.com/yourusername/credex-audit.git
cd credex-audit

npm install

cp .env.local.example .env.local
# Fill in your keys in .env.local

npm run dev
# Open http://localhost:3000
```

### Run Tests

```bash
npm test
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

---

## Decisions

1. **Next.js over plain React + Express** — API routes in Next.js let us ship a single deployable unit. No separate backend service to keep alive, no CORS config, one Vercel deploy. Trade-off: less flexibility for long-running jobs (would need a queue for scale).

2. **MongoDB over SQL (Postgres/Supabase)** — Audit objects have variable shape (different tools per user). MongoDB's document model fits this naturally without migrations. Trade-off: no joins, so lead + audit data is duplicated slightly.

3. **Rule-based audit engine, not AI** — Pricing math should be deterministic and auditable. A finance reviewer should agree with every recommendation. AI-generated recommendations would be inconsistent and hard to defend. Only the 100-word summary uses AI.

4. **Email captured after value shown, never before** — Standard growth practice. Ungated audits get completed; gated ones get abandoned. The audit itself IS the value demonstration.

5. **Rate limiting in-memory vs Redis** — Used in-memory rate limiting for simplicity in week 1. Resets on cold starts, which Vercel has frequently. For production, I'd move to Upstash Redis (10-line change, already architected for it).
