# Reflection

## 1. Hardest Bug
The hardest bug was the Vercel deployment showing 404 on 
the audit results page even though MongoDB had the data. 
I checked the Vercel logs and found the internal HTTP fetch 
was using the wrong URL. My first hypothesis was wrong 
environment variables — I checked those and they were correct. 
Second hypothesis was MongoDB connection — I built a debug 
API route and confirmed data was saving fine (5 audits found). 
The actual fix was querying MongoDB directly in the page 
instead of making an internal HTTP fetch, which was using 
an incorrect URL on Vercel's infrastructure.

## 2. Decision I Reversed
[Write something real you changed — e.g. switching from 
Supabase to MongoDB, or changing how the form works]

## 3. Week 2 Plans
[PDF export improvements, benchmark mode, referral codes]

## 4. How I Used AI Tools
I used Claude to help scaffold the initial Next.js project 
structure, generate TypeScript types, and debug the Vercel 
deployment issues. I reviewed every piece of code it generated 
and caught several issues — for example the Resend client was 
being initialized at module level which crashed the Vercel 
build when RESEND_API_KEY was not set. I fixed this by lazy 
loading Resend only when the key exists. I did not use AI 
for the audit engine rules — those required reading each 
vendor's actual pricing page and writing defensible logic.

## 5. Self Ratings
- Discipline: 6/10 — Only had 3 days due to late start
- Code quality: 7/10 — TypeScript throughout, clean abstractions
- Design sense: 7/10 — Dark theme, clear savings hero number
- Problem solving: 8/10 — Debugged Vercel 404 systematically
- Entrepreneurial thinking: 7/10 — GTM and economics are specific