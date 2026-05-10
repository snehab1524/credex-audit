# User Interviews

Three 10–15 minute conversations with potential users conducted during the build week.
Cold outreach via LinkedIn and mutual Slack communities.

---

## Interview 1

**Name:** R.K. (preferred initials)
**Role:** CTO
**Company stage:** Seed-stage SaaS, 8-person team

### Notes

R.K. manages all software tool purchases directly. Monthly AI tool spend is roughly $600/month across Cursor Business (5 seats), ChatGPT Team (8 seats), and Anthropic API for their product.

**Direct quotes:**
- "I just renewed everything on auto-pilot this year. I haven't looked at whether we're on the right plans since we hired the last three engineers."
- "The problem is I don't have a benchmark. I have no idea if $600/month for 8 engineers is high or low compared to similar teams."
- "I'd trust a recommendation more if it showed me where the number came from — like, link me to the pricing page."

**Most surprising thing:**
He didn't know Claude Team requires a minimum of 5 seats. He thought Pro was per-user and Team was just "more features." He was paying Team pricing for 3 users and would have been better on Pro × 3 for the same functionality.

**What it changed:**
Added the plan notes under each tool selector in the form (e.g., "Team: min 5 seats") so users can see the constraint before submitting. Also made the seat-waste rule more prominent in the reasoning text.

---

## Interview 2

**Name:** Priya M.
**Role:** Engineering Manager
**Company stage:** Series A, ~25 engineers

### Notes

Priya's team uses GitHub Copilot Business (18 seats), Cursor Pro (6 seats for senior engineers), and OpenAI API for internal tooling. Her total spend is around $500/month.

**Direct quotes:**
- "We have Copilot for everyone but honestly maybe 8 people use it daily. The rest just have it because we gave it to the whole team when we onboarded."
- "I keep meaning to audit this but there's always something more urgent."
- "If the tool showed me 'you have X seats but your team is Y people' I'd act on that immediately. That's just waste."
- "I don't want to switch tools — too much retraining. I want to know if I can get what I have cheaper."

**Most surprising thing:**
She actively didn't want tool-switching recommendations — she wanted same-tool cost optimization. Most of my audit engine logic was about switching tools. I had underweighted the "reduce seats" and "downgrade plan" paths.

**What it changed:**
Reordered the recommendation priority in `runAudit()` — seat waste and plan downgrade now surface before alternative tool suggestions. A recommendation to "switch to Windsurf" when someone is deeply committed to Copilot is useless friction.

---

## Interview 3

**Name:** James T.
**Role:** Solo founder / indie developer
**Company stage:** Pre-revenue side project, 1 person

### Notes

James pays for Claude Pro ($20) and Cursor Pro ($20) personally. Total $40/month. He saw the assignment on Twitter and agreed to a quick call.

**Direct quotes:**
- "Forty dollars is nothing, but I'm curious if I'm missing something better."
- "I've been thinking about switching to Windsurf — I see it mentioned everywhere. But I haven't had time to actually compare."
- "Honestly the most valuable thing you could show me is whether the free tier is enough for what I do. I don't actually know how much I use these tools."

**Most surprising thing:**
For a solo developer at $40/month, the tool isn't that useful in dollar terms. But James wanted it purely for the "am I making the right choices?" validation. This is a different motivation than I designed for — it's not about saving money, it's about confidence.

**What it changed:**
Added the "You're spending well ✓" honest result path for low/no-savings audits (< $100/month savings). Originally I was going to manufacture some recommendation to seem useful. James's interview confirmed that honesty + a future-savings notification is more valuable than fake recommendations. He said "if it told me I was already optimal I'd trust it more for next time."

---

## Synthesis

Across all three interviews, the most consistent theme was **trust through transparency** — people want to see the source of every number, understand the reasoning, and not feel like they're being pushed toward a sale. The most actionable change: making the audit engine's reasoning text specific and citable, not vague ("based on your team size of 8, the minimum 5-seat requirement for Claude Team means you're overpaying for 2 seats at $30/user = $60/mo wasted").
