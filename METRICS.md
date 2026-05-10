# Metrics

## North Star Metric

**Qualified leads generated per week** — defined as email captures from audits showing ≥$100/month in potential savings.

**Why this and not "audits completed":** Total audits is a vanity metric. Credex only benefits from leads who have real savings opportunities. An audit from a company spending $20/month on Claude Free is not a lead — it's a data point. The North Star must align with Credex's business model: high-savings cases → consultation → credit purchase. "Qualified leads" is the exact handoff metric between this tool and Credex's sales motion.

**Why not "consultations booked":** That's a downstream metric we don't fully control. We control qualified lead volume and quality. Sales controls close rate.

## Three Input Metrics

**1. Audit completion rate (visits → completed audits)**
Target: ≥35%. This measures whether the form is frictionless enough. Below 25% → investigate drop-off points in the form. The most common problem is asking for too much information before showing value.

**2. Lead capture rate (completed audits → email submissions)**
Target: ≥18% overall; ≥35% for high-savings audits (>$500/mo). This measures whether the value shown is compelling enough to earn an email. Low rate → either savings amounts are too small, or the results UI isn't communicating the value clearly.

**3. High-savings audit rate (audits where savings > $500/mo)**
Target: ≥15% of audits. This is a product quality metric — if almost no one has significant savings, either our pricing data is stale, our rules are too conservative, or we're attracting the wrong user (solo devs on free plans vs. teams on paid plans).

## What to Instrument First

1. **Funnel events:** `page_view`, `form_started`, `tool_added`, `audit_submitted`, `audit_viewed`, `lead_captured`
2. **Savings distribution:** histogram of `totalMonthlySavings` across all audits — understand the real distribution before optimizing
3. **Drop-off point in form:** which step causes users to abandon (use `form_started` vs `audit_submitted` + time-on-page)
4. **Share link clicks:** track `share_copied` and `share_twitter` — this is the viral loop signal

Use PostHog (free tier) or Vercel Analytics for web vitals. Simple custom events logged to MongoDB for funnel tracking.

## Pivot Trigger

**If qualified lead rate drops below 5/week after 4 weeks with >500 audits/week:**
The tool is getting traffic but not generating actionable leads. Possible causes: wrong user (too small, no spend), savings amounts too low (pricing data wrong), or email capture UX broken.

At that point, evaluate: is the issue acquisition (wrong users arriving) or conversion (right users not converting)? If acquisition → revisit GTM channels. If conversion → redesign the results page or threshold for what counts as "high savings."
