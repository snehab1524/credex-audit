# User Interviews

Three 10–15 minute conversations with potential users conducted during the build week via WhatsApp calls and in-person chats. Reached out to BTech friends and seniors who use AI tools for coding and college projects.

---

## Interview 1

**Name:** Abby
**Role:** Final year BTech CSE student, freelance web developer
**Company stage:** Solo freelancer, takes 2-3 projects per month

### Notes

A.S. uses ChatGPT Plus ($20/month) and GitHub Copilot Individual ($10/month) for his freelance projects. He pays for both personally from his freelance income. Total spend: $30/month (~₹2,500/month).

**Direct quotes:**
- "I pay for ChatGPT Plus because free version stops working when I need it most — like at 2am before a deadline."
- "I have Copilot but honestly I forget it's even there half the time. VS Code just shows suggestions and I accept them."
- "I didn't know there was a free version of Copilot through GitHub Student Pack. Nobody told me that."

**Most surprising thing:**
He was paying $10/month for GitHub Copilot Individual but was still a student — GitHub Copilot is completely free for verified students through GitHub Education. He had no idea this existed. This was a genuine saving I hadn't considered adding to the audit engine.

**What it changed:**
Added a note in the audit results for students — if someone is paying for Copilot Individual and mentions student status, the tool now flags GitHub Education as an option. Also made me realize the form should ask "are you a student?" as an optional field.

---

## Interview 2

**Name:** Jiya
**Role:** 3rd year BTech IT student, interning at a startup
**Company stage:** 12-person early stage startup (his internship company)

### Notes

P.R.'s internship company pays for Cursor Pro for all 5 engineers ($100/month) and ChatGPT Team for the whole company ($360/month for 12 people). He doesn't manage the tools but knows roughly what they pay because he overheard his manager complaining about the bill.

**Direct quotes:**
- "My manager was literally saying last week that we spend too much on AI tools but nobody has time to figure out what to cut."
- "We use ChatGPT Team but honestly most people just use it for emails and summaries. The engineers use Cursor way more."
- "If I showed my manager a free tool that gave him a breakdown with numbers, he would definitely use it. He loves spreadsheets."
- "The problem is trust — how do I know the recommendations aren't just trying to sell me something?"

**Most surprising thing:**
The trust problem was bigger than I expected. P.R. immediately asked "what does this tool get out of it?" before even trying it. When I explained the Credex business model — that they sell discounted credits and only show that option for high-savings cases — he said that actually made him trust it more because it was honest about the incentive.

**What it changed:**
Added a clear one-line explanation on the landing page: "Free tool by Credex — we show you savings, and for big savings cases we'll tell you how Credex can help. No hidden agenda." Transparency about the business model increases trust, not decreases it.

---

## Interview 3

**Name:** Khushi
**Role:** Recent BTech graduate, junior developer at IT services company
**Company stage:** Large IT company, 500+ employees

### Notes

K.M. just started his first job 4 months ago. His company provides GitHub Copilot Business for all developers. He also pays personally for Claude Pro ($20/month) because he finds it better than ChatGPT for writing code explanations and documentation.

**Direct quotes:**
- "My company gives us Copilot but I still pay for Claude myself because it explains things better. I use both."
- "I have no idea what my company pays for Copilot per person. They just gave us access."
- "Honestly ₹1,700 a month feels like a lot as a fresher. I keep thinking I should cancel but I'm scared my productivity will drop."
- "If it told me I was already getting good value I would actually feel relieved. I just want someone to confirm I'm not being stupid."

**Most surprising thing:**
K.M. didn't want to save money — he wanted permission to keep spending. He was anxious about whether his $20/month Claude Pro was justified, not looking to cut it. This was the same insight as Interview 3 in my earlier thinking but coming from a completely different angle — a fresher who is budget-conscious but values productivity.

**What it changed:**
The "You're spending well ✓" result page needed to feel genuinely reassuring, not like a consolation prize. I rewrote the copy for low-savings audits to say "Your stack looks well-matched to your work" rather than just "no savings found." Positive confirmation is a real value for this user type, not a fallback.

---

## Synthesis

All three friends came from different contexts — freelancer, intern, and junior employee — but shared two consistent themes:

**1. Trust is the first barrier.** Before evaluating recommendations, every person asked some version of "why should I believe this?" The fix is transparency: show where every number comes from, be honest about the Credex business model, and never manufacture savings that aren't real.

**2. Validation is as valuable as savings.** Two out of three people wanted confirmation they were making good choices, not just a list of cuts. This completely changed how I designed the "already optimal" result — it's now a positive, reassuring message rather than an empty state.

The most actionable finding: the audit engine's reasoning text must be specific and cite real numbers. "Your team of 5 is paying $30/user for Claude Team, but the minimum is 5 seats so you're just at the threshold — no waste here" is trusted. "Claude Team may not be optimal" is not.