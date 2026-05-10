// types/index.ts

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number; // actual amount user pays
}

export interface FormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

// ---- Audit types ----

export type ActionType =
  | "downgrade_plan"
  | "switch_tool"
  | "use_credits"
  | "already_optimal"
  | "reduce_seats";

export interface AuditItem {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: ActionType;
  recommendedPlan?: string;
  recommendedTool?: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

export interface AuditResult {
  id: string;
  items: AuditItem[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  isHighSavings: boolean; // >$500/mo
  isAlreadyOptimal: boolean; // <$100/mo savings
  aiSummary: string;
  createdAt: string;
  // Benchmark data
  spendPerDev?: number;
  benchmarkAvg?: number;
  teamSize?: number;
  useCase?: UseCase;
  // Lead data (stripped from public URL)
  email?: string;
  companyName?: string;
  role?: string;
}

export interface LeadData {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}
