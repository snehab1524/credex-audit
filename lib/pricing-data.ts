// lib/pricing-data.ts
// Every price verified from official vendor pages.
// Full citation URLs in PRICING_DATA.md

import type { UseCase, ToolId } from "@/types";

export interface Plan {
  id: string;
  name: string;
  pricePerUser: number; // USD/user/month
  bestFor: UseCase[];
  minSeats: number;
  maxSeats?: number;
  notes?: string;
}

export interface Tool {
  id: ToolId;
  name: string;
  category: "coding" | "chat" | "api";
  plans: Plan[];
  officialPricingUrl: string;
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    officialPricingUrl: "https://cursor.sh/pricing",
    plans: [
      {
        id: "cursor-hobby",
        name: "Hobby",
        pricePerUser: 0,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "2,000 completions/mo, 50 slow premium requests",
      },
      {
        id: "cursor-pro",
        name: "Pro",
        pricePerUser: 20,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "Unlimited completions, 500 fast premium requests",
      },
      {
        id: "cursor-business",
        name: "Business",
        pricePerUser: 40,
        bestFor: ["coding"],
        minSeats: 2,
        notes: "Pro + SSO, centralized billing, admin dashboard",
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot#pricing",
    plans: [
      {
        id: "copilot-individual",
        name: "Individual",
        pricePerUser: 10,
        bestFor: ["coding"],
        minSeats: 1,
      },
      {
        id: "copilot-business",
        name: "Business",
        pricePerUser: 19,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "Policy mgmt, audit logs, IP indemnity",
      },
      {
        id: "copilot-enterprise",
        name: "Enterprise",
        pricePerUser: 39,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "Custom models, PR summaries, codebase context",
      },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    category: "chat",
    officialPricingUrl: "https://www.anthropic.com/pricing",
    plans: [
      {
        id: "claude-free",
        name: "Free",
        pricePerUser: 0,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
      },
      {
        id: "claude-pro",
        name: "Pro",
        pricePerUser: 20,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
        notes: "5x more usage than free, priority access",
      },
      {
        id: "claude-max-5x",
        name: "Max (5x)",
        pricePerUser: 100,
        bestFor: ["writing", "research", "data"],
        minSeats: 1,
        notes: "5x Pro usage limits",
      },
      {
        id: "claude-max-20x",
        name: "Max (20x)",
        pricePerUser: 200,
        bestFor: ["writing", "data"],
        minSeats: 1,
        notes: "20x Pro usage limits, highest priority",
      },
      {
        id: "claude-team",
        name: "Team",
        pricePerUser: 30,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 5,
        notes: "Higher limits, team workspace, central billing",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "chat",
    officialPricingUrl: "https://openai.com/chatgpt/pricing",
    plans: [
      {
        id: "chatgpt-free",
        name: "Free",
        pricePerUser: 0,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
      },
      {
        id: "chatgpt-plus",
        name: "Plus",
        pricePerUser: 20,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
        notes: "GPT-4o access, DALL-E, web browsing",
      },
      {
        id: "chatgpt-team",
        name: "Team",
        pricePerUser: 30,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 2,
        notes: "Higher message caps, data excluded from training",
      },
      {
        id: "chatgpt-enterprise",
        name: "Enterprise",
        pricePerUser: 0, // custom
        bestFor: ["writing", "research", "mixed", "data"],
        minSeats: 150,
        notes: "Custom pricing, SSO, admin controls",
      },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/pricing#api",
    plans: [
      {
        id: "anthropic-api-payg",
        name: "Pay as you go",
        pricePerUser: 0, // usage-based
        bestFor: ["coding", "writing", "data", "research", "mixed"],
        minSeats: 1,
        notes: "Claude Haiku ~$0.25/MTok input, Sonnet ~$3/MTok input",
      },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing",
    plans: [
      {
        id: "openai-api-payg",
        name: "Pay as you go",
        pricePerUser: 0, // usage-based
        bestFor: ["coding", "writing", "data", "research", "mixed"],
        minSeats: 1,
        notes: "GPT-4o ~$2.50/MTok input, GPT-4o-mini ~$0.15/MTok",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "chat",
    officialPricingUrl: "https://one.google.com/about/ai-premium",
    plans: [
      {
        id: "gemini-free",
        name: "Free",
        pricePerUser: 0,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
      },
      {
        id: "gemini-advanced",
        name: "Advanced (Google One AI Premium)",
        pricePerUser: 20,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
        notes: "Gemini 1.5 Pro, 2TB Google storage included",
      },
      {
        id: "gemini-business",
        name: "Business (Workspace)",
        pricePerUser: 24,
        bestFor: ["writing", "research", "mixed"],
        minSeats: 1,
        notes: "Gemini in Gmail/Docs/Sheets/Meet",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    officialPricingUrl: "https://codeium.com/windsurf/pricing",
    plans: [
      {
        id: "windsurf-free",
        name: "Free",
        pricePerUser: 0,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "Limited premium model credits",
      },
      {
        id: "windsurf-pro",
        name: "Pro",
        pricePerUser: 15,
        bestFor: ["coding"],
        minSeats: 1,
        notes: "Unlimited base model, 500 premium credits/mo",
      },
      {
        id: "windsurf-teams",
        name: "Teams",
        pricePerUser: 35,
        bestFor: ["coding"],
        minSeats: 2,
        notes: "Pro + team admin, SSO",
      },
    ],
  },
];

export function getToolById(id: ToolId): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getPlanById(toolId: ToolId, planId: string): Plan | undefined {
  return getToolById(toolId)?.plans.find((p) => p.id === planId);
}
