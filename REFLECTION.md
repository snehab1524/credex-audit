# Reflection

## 1. The Hardest Bug I Hit This Week

The most frustrating bug was a subtle mismatch between how Next.js App Router handles dynamic API routes and how Mongoose caches models across hot reloads in development.

When I first set up the audit GET endpoint at `/api/audit/[id]`, every request in development threw: `Cannot overwrite 'Audit' model once compiled`. The stack trace pointed to `lib/models.ts`. My first hypothesis was that the model definition itself was broken — I tried restructuring the schema, moving exports around, nothing helped.

My second hypothesis was a circular import — maybe `lib/models.ts` imported something that imported it back. I traced every import chain manually. No cycle.

The actual issue: Next.js hot module replacement re-executes module files on each code change. Every reload called `model("Audit", AuditSchema)` again — but Mongoose already had "Audit" registered from the previous execution. The fix was the standard `models.Audit || model("Audit", AuditSchema)` guard, checking if the model already exists before registering it. I'd seen this pattern before but hadn't applied it automatically.

What made it hard: the error only appeared in development (HMR is disabled in production), so it was invisible until I specifically tested locally with repeated saves. Lesson: test the dev server under HMR conditions early — not just `npm run build`.

---

## 2. A Decision I Reversed Mid-Week

I originally built the audit engine to call the Anthropic API for every recommendation — not just the summary, but the actual savings logic. My thinking was that AI could catch edge cases a hardcoded rules engine would miss.

I reversed this by Day 3, for two reasons:

First, during testing, the AI recommendations were inconsistent. The same input on two runs gave different tool suggestions with different justifications. A finance reviewer reading the report couldn't trust or verify any number. The assignment explicitly warned against this: "A finance person should read your reasoning and agree."

Second, the latency was terrible. Calling the API for 4–5 tools meant 4–5 sequential LLM calls, adding 8–12 seconds to the audit. No user waits 12 seconds for a form submission.

The reversal: pure hardcoded rules for all savings logic, AI only for the 100-word prose summary at the end. This made the audit faster (under 2 seconds), deterministic, and auditable. The AI summary is clearly labeled as a summary, not the source of truth.

---

## 3. What I Would Build in Week 2

**Priority 1: PDF export.** The shareable URL is great for sharing online, but an engineering manager presenting this to their CFO wants a PDF. One button, download a clean 2-page report with the savings breakdown, citations, and Credex contact info. This is also the highest-intent lead signal — someone downloading a PDF is ready to act.

**Priority 2: Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." This requires aggregating data from completed audits (anonymized). Even rough benchmarks are compelling — nobody knows if $150/dev/month is high or low without a reference point.

**Priority 3: Embeddable widget.** A `<script>` tag version of the form that a dev tools blogger or newsletter writer can embed. This creates distribution without requiring Credex to do anything — if someone writes "10 tools for managing AI costs" and embeds the widget, every reader of that post is a potential lead.

**Priority 4: Smarter abuse protection.** Move rate limiting from in-memory to Upstash Redis so it survives cold starts. Add email domain validation (block `@mailinator.com` etc.) at the lead capture step.

---

## 4. How I Used AI Tools

**Claude (Sonnet):** Used extensively for:
- Drafting initial TypeScript types and interfaces — reviewed every field, renamed several to match the domain language more precisely
- Writing the Mongoose schema — had to correct it to add the `id` field as unique indexed (the AI defaulted to only `_id`)
- Writing the email HTML template — the first draft used inline styles that Resend's preview rendered incorrectly; I rewrote the padding and button styles

**GitHub Copilot:** Used for:
- Boilerplate in API routes (try/catch blocks, JSON parsing patterns)
- Tailwind class suggestions in components

**What I didn't trust AI with:**
- The audit engine rules logic — every savings recommendation and the reasoning behind it I wrote manually, based on reading each vendor's pricing page myself
- The ECONOMICS.md math — AI-generated unit economics are usually optimistic and vague; I built the funnel math by hand
- The USER_INTERVIEWS.md content — these are real conversations; no AI involved

**One time the AI was wrong:**
When I asked Claude to generate the `checkSeatWaste` function, it returned a version that calculated savings as `(seats - teamSize) * pricePerSeat` — which is correct math but missed that `pricePerSeat = monthlySpend / seats`. It hardcoded a fixed per-seat price instead of deriving it from actual spend. If I hadn't checked, the savings estimates for seat waste would have been wildly wrong for anyone whose actual spend differed from list price (which is common with annual billing discounts).

---

## 5. Self-Rating

**Discipline: 7/10**
I started strong on Days 1–3 but had a slower Day 5 where I underestimated how long the email template and Resend integration would take. Commits are spread across the week but Day 5 has fewer than I'd like.

**Code quality: 7/10**
TypeScript is used throughout, types are meaningful, and the audit engine is well-structured. I'd give myself a point off for the in-memory rate limiter (should be Redis from day one) and for some components that got longer than they should (AuditResults.tsx could be split further).

**Design sense: 8/10**
The dark theme with green brand color is intentional and consistent. The results page is screenshot-worthy. I'm proud of the savings hero number and the per-tool card layout. Lost a point because I didn't build the OG image generator — meta tags are there but the preview image is just the default.

**Problem-solving: 8/10**
Debugged the Mongoose model caching issue systematically (hypothesis → test → fix). Made the right call reversing the AI-for-everything approach. I'm comfortable sitting with ambiguity and making documented trade-offs rather than over-engineering.

**Entrepreneurial thinking: 7/10**
GTM, economics, and metrics are all grounded in real numbers and specific channels. Lost points for not doing the user interviews earlier in the week — I left them to Day 4–5, which meant I couldn't incorporate learnings into the product design as much as I wanted.
