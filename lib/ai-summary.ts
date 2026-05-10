// lib/ai-summary.ts
// Tries Gemini → Anthropic → OpenAI → template fallback
// Gemini is FREE at aistudio.google.com — recommended

import type { AuditResult, UseCase } from "@/types";

function templateFallback(audit: Omit<AuditResult, "aiSummary">, useCase: UseCase): string {
  const { totalMonthlySavings, totalCurrentSpend, items, isAlreadyOptimal } = audit;

  if (isAlreadyOptimal) {
    return `Your AI stack of $${totalCurrentSpend}/month is already well-optimized for ${useCase} work. The tools you have chosen are appropriately matched to your team size and workflow. We will notify you as new optimization opportunities emerge — pricing changes frequently in this market.`;
  }

  const topItem = [...(items ?? [])].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const savingsPct = totalCurrentSpend > 0
    ? Math.round((totalMonthlySavings / totalCurrentSpend) * 100)
    : 0;

  return `Your team is spending $${totalCurrentSpend}/month on AI tools. This audit identified $${totalMonthlySavings}/month (${savingsPct}%) in potential savings. The biggest opportunity is ${topItem?.toolName ?? "your current setup"} — ${topItem?.reason ?? "a plan change could reduce your bill significantly"}. Annualized, these optimizations total $${(audit.totalAnnualSavings ?? 0).toLocaleString()}/year.`;
}

function buildPrompt(audit: Omit<AuditResult, "aiSummary">, useCase: UseCase): string {
  const auditLines = (audit.items ?? [])
    .map(
      (item) =>
        `- ${item.toolName} (${item.currentPlan}): $${item.currentSpend}/mo → ${
          item.recommendedAction === "already_optimal"
            ? "optimal"
            : `save $${item.monthlySavings}/mo`
        }`
    )
    .join("\n");

  return `You are a concise financial analyst writing a 100-word personalized summary for a startup's AI spend audit.

Audit data:
- Total current spend: $${audit.totalCurrentSpend}/month
- Total potential savings: $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year)
- Team use case: ${useCase}
- Per-tool breakdown:
${auditLines}

Write a 100-word summary paragraph (no headers, no bullet points, one flowing paragraph) that:
1. Acknowledges their current spend
2. Calls out the biggest saving opportunity specifically
3. Gives the total annual savings figure
4. Ends with one actionable next step

Tone: direct, founder-to-founder, not salesy. No filler phrases like "great news" or "exciting opportunity".`;
}

// ---- Gemini (FREE at aistudio.google.com) ----
async function tryGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}

// ---- Anthropic (optional) ----
async function tryAnthropic(prompt: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}

// ---- OpenAI (optional) ----
async function tryOpenAI(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

// ---- Main export ----
export async function generateAISummary(
  audit: Omit<AuditResult, "aiSummary">,
  useCase: UseCase
): Promise<string> {
  const prompt = buildPrompt(audit, useCase);

  // Priority: Gemini (free) → Anthropic → OpenAI → template
  const summary =
    (await tryGemini(prompt)) ??
    (await tryAnthropic(prompt)) ??
    (await tryOpenAI(prompt)) ??
    templateFallback(audit, useCase);

  return summary;
}
