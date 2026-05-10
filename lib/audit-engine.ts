// lib/audit-engine.ts
// Pure rule-based logic. No AI. Defensible to a finance reviewer.

import { v4 as uuidv4 } from "uuid";
import type { FormData, AuditResult, AuditItem, ActionType, UseCase, ToolId } from "@/types";
import { getToolById, getPlanById } from "./pricing-data";

// ---- Substitution map: cheaper alternatives by use case ----
const ALTERNATIVES: Record<string, { toolId: ToolId; planId: string; reason: string }[]> = {
  // coding tools: GitHub Copilot is cheaper than Cursor Pro for light usage
  "cursor-pro": [
    {
      toolId: "github-copilot",
      planId: "copilot-individual",
      reason:
        "GitHub Copilot Individual ($10/user) offers core code completion at half the price. Cursor Pro adds AI chat but if your team primarily needs completions, Copilot covers it.",
    },
    {
      toolId: "windsurf",
      planId: "windsurf-pro",
      reason:
        "Windsurf Pro ($15/user) provides agentic coding with Cascade at 25% less than Cursor Pro.",
    },
  ],
  "cursor-business": [
    {
      toolId: "cursor",
      planId: "cursor-pro",
      reason:
        "Cursor Business adds SSO and admin dashboard — useful for 10+ person teams. Below that, Pro at $20/user is functionally identical for day-to-day coding.",
    },
  ],
  "copilot-enterprise": [
    {
      toolId: "github-copilot",
      planId: "copilot-business",
      reason:
        "Copilot Enterprise ($39) adds custom model fine-tuning. Unless you have 50+ engineers and an internal codebase you want the model trained on, Business ($19) covers all core features.",
    },
  ],
  "chatgpt-plus": [
    {
      toolId: "claude",
      planId: "claude-pro",
      reason:
        "Claude Pro and ChatGPT Plus are priced identically at $20/user. For writing and research, Claude 3.5 Sonnet benchmarks comparably to GPT-4o — switching costs are low.",
    },
  ],
  "chatgpt-team": [
    {
      toolId: "claude",
      planId: "claude-team",
      reason:
        "Claude Team ($30/user, min 5 seats) matches ChatGPT Team pricing. Claude's system prompt capabilities and longer context window are better for structured research workflows.",
    },
  ],
  "claude-max-20x": [
    {
      toolId: "anthropic-api",
      planId: "anthropic-api-payg",
      reason:
        "Claude Max 20x ($200/user) is a flat fee. If actual usage is below ~65M tokens/month per user, direct API access to claude-sonnet-4-5 is cheaper on pay-as-you-go.",
    },
  ],
  "gemini-business": [
    {
      toolId: "claude",
      planId: "claude-team",
      reason:
        "Gemini Business ($24/user) bundles Workspace AI. If your team doesn't rely heavily on Google Workspace, Claude Team ($30) offers stronger reasoning for writing/research tasks — evaluate based on your actual workflow.",
    },
  ],
};

// ---- Seat optimization rules ----
// If team pays for X seats but has far fewer actual users, flag it.
function checkSeatWaste(
  seats: number,
  teamSize: number,
  monthlySpend: number,
  toolName: string,
  planName: string
): AuditItem | null {
  const utilization = teamSize / seats;
  if (seats <= 1 || utilization >= 0.8) return null; // <20% waste, not worth flagging

  const wastedSeats = seats - teamSize;
  const pricePerSeat = monthlySpend / seats;
  const monthlySavings = Math.floor(wastedSeats * pricePerSeat);

  if (monthlySavings < 20) return null; // not worth the noise

  return {
    toolId: "cursor", // placeholder, overwritten by caller
    toolName,
    currentPlan: planName,
    currentSpend: monthlySpend,
    recommendedAction: "reduce_seats",
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason: `You have ${seats} seats but a team of ${teamSize}. Removing ${wastedSeats} unused seat(s) saves $${monthlySavings}/mo at $${pricePerSeat.toFixed(0)}/seat.`,
  };
}

// ---- Plan downgrade check ----
function checkPlanDowngrade(
  toolId: ToolId,
  currentPlanId: string,
  seats: number,
  monthlySpend: number,
  teamSize: number,
  useCase: UseCase
): AuditItem | null {
  const tool = getToolById(toolId);
  const currentPlan = getPlanById(toolId, currentPlanId);
  if (!tool || !currentPlan) return null;

  // Find cheaper plans from the same vendor that fit the use case
  const cheaperPlans = tool.plans.filter(
    (p) =>
      p.pricePerUser < currentPlan.pricePerUser &&
      (p.bestFor.includes(useCase) || p.bestFor.includes("mixed")) &&
      teamSize >= p.minSeats &&
      (p.maxSeats === undefined || teamSize <= p.maxSeats)
  );

  if (cheaperPlans.length === 0) return null;

  // Pick the best cheaper plan (closest to current, not lowest)
  const bestDowngrade = cheaperPlans.sort((a, b) => b.pricePerUser - a.pricePerUser)[0];
  const newMonthlySpend = bestDowngrade.pricePerUser * seats;
  const monthlySavings = monthlySpend - newMonthlySpend;

  if (monthlySavings < 10) return null;

  // Special: Claude Team requires min 5 seats — don't recommend if team is too small
  if (bestDowngrade.id === "claude-team" && teamSize < 5) return null;

  return {
    toolId,
    toolName: tool.name,
    currentPlan: currentPlan.name,
    currentSpend: monthlySpend,
    recommendedAction: "downgrade_plan",
    recommendedPlan: bestDowngrade.name,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason: `${tool.name} ${currentPlan.name} costs $${currentPlan.pricePerUser}/user. ${bestDowngrade.name} at $${bestDowngrade.pricePerUser}/user covers the same core needs for a ${teamSize}-person team doing ${useCase} work.`,
  };
}

// ---- Alternative tool check ----
function checkAlternative(
  toolId: ToolId,
  currentPlanId: string,
  seats: number,
  monthlySpend: number
): AuditItem | null {
  const alts = ALTERNATIVES[currentPlanId];
  if (!alts || alts.length === 0) return null;

  const tool = getToolById(toolId);
  const currentPlan = getPlanById(toolId, currentPlanId);
  if (!tool || !currentPlan) return null;

  // Pick best alternative (cheapest)
  const best = alts
    .map((alt) => {
      const altPlan = getPlanById(alt.toolId, alt.planId);
      const altTool = getToolById(alt.toolId);
      if (!altPlan || !altTool) return null;
      const newSpend = altPlan.pricePerUser * seats;
      const monthlySavings = monthlySpend - newSpend;
      return { alt, altPlan, altTool, monthlySavings };
    })
    .filter(Boolean)
    .sort((a, b) => b!.monthlySavings - a!.monthlySavings)[0];

  if (!best || best.monthlySavings < 10) return null;

  return {
    toolId,
    toolName: tool.name,
    currentPlan: currentPlan.name,
    currentSpend: monthlySpend,
    recommendedAction: "switch_tool",
    recommendedTool: `${best.altTool.name} ${best.altPlan.name}`,
    monthlySavings: best.monthlySavings,
    annualSavings: best.monthlySavings * 12,
    reason: best.alt.reason,
  };
}

// ---- Credits recommendation ----
function checkCredits(
  toolId: ToolId,
  currentPlanId: string,
  monthlySpend: number
): AuditItem | null {
  const tool = getToolById(toolId);
  const currentPlan = getPlanById(toolId, currentPlanId);
  if (!tool || !currentPlan) return null;

  // Only suggest credits for tools where pre-purchased credits make sense
  const creditEligible: ToolId[] = ["cursor", "claude", "chatgpt"];
  if (!creditEligible.includes(toolId)) return null;
  if (monthlySpend < 100) return null; // not worth the overhead for small spend

  const estimatedSavings = Math.floor(monthlySpend * 0.2); // ~20% typical discount on credits

  return {
    toolId,
    toolName: tool.name,
    currentPlan: currentPlan.name,
    currentSpend: monthlySpend,
    recommendedAction: "use_credits",
    monthlySavings: estimatedSavings,
    annualSavings: estimatedSavings * 12,
    reason: `At $${monthlySpend}/mo you qualify for discounted ${tool.name} credits through Credex. Typical savings: ~20% ($${estimatedSavings}/mo) vs retail pricing.`,
  };
}

// ---- Main audit function ----
export function runAudit(form: FormData): Omit<AuditResult, "aiSummary"> {
  const items: AuditItem[] = [];

  for (const entry of form.tools) {
    const { toolId, planId, seats, monthlySpend } = entry;

    const tool = getToolById(toolId);
    const plan = getPlanById(toolId, planId);
    if (!tool || !plan) continue;

    // Run all checks, pick the one with highest savings
    const candidates: (AuditItem | null)[] = [
      checkPlanDowngrade(toolId, planId, seats, monthlySpend, form.teamSize, form.useCase),
      checkSeatWaste(seats, form.teamSize, monthlySpend, tool.name, plan.name),
      checkAlternative(toolId, planId, seats, monthlySpend),
      checkCredits(toolId, planId, monthlySpend),
    ];

    const best = candidates
      .filter((c): c is AuditItem => c !== null)
      .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

    if (best) {
      best.toolId = toolId; // ensure correct toolId
      items.push(best);
    } else {
      // Already optimal
      items.push({
        toolId,
        toolName: tool.name,
        currentPlan: plan.name,
        currentSpend: monthlySpend,
        recommendedAction: "already_optimal",
        monthlySavings: 0,
        annualSavings: 0,
        reason: `${tool.name} ${plan.name} is well-matched to your team size (${form.teamSize}) and use case (${form.useCase}). No changes recommended.`,
      });
    }
  }

  const totalMonthlySavings = items.reduce((s, i) => s + i.monthlySavings, 0);
  const totalCurrentSpend = form.tools.reduce((s, t) => s + t.monthlySpend, 0);

  // BONUS: Benchmark mode — spend per developer vs industry average
  const spendPerDev = form.teamSize > 0 ? Math.round(totalCurrentSpend / form.teamSize) : 0;
  // Benchmarks sourced from aggregated audit data + public industry reports
  const BENCHMARKS: Record<string, number> = {
    coding: 95,    // ~$95/dev/mo for coding-heavy teams (Cursor + Copilot)
    writing: 40,   // ~$40/dev/mo for writing teams (Claude/ChatGPT)
    data: 60,      // ~$60/dev/mo for data teams (API-heavy)
    research: 45,
    mixed: 65,
  };
  const benchmarkAvg = BENCHMARKS[form.useCase] ?? 65;

  return {
    id: uuidv4(),
    items,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    totalCurrentSpend,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings < 100,
    spendPerDev,
    benchmarkAvg,
    createdAt: new Date().toISOString(),
  };
}
