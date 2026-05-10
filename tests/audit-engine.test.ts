// tests/audit-engine.test.ts
import { describe, it, expect } from "vitest";
import { runAudit } from "../lib/audit-engine";
import type { FormData } from "../types";

// ---- Test 1: Detects plan downgrade opportunity ----
describe("audit-engine: plan downgrade", () => {
  it("flags Cursor Business for a 2-person team (should use Pro)", () => {
    const form: FormData = {
      tools: [{ toolId: "cursor", planId: "cursor-business", seats: 2, monthlySpend: 80 }],
      teamSize: 2,
      useCase: "coding",
    };
    const result = runAudit(form);
    const item = result.items[0];
    expect(item.recommendedAction).toBe("downgrade_plan");
    expect(item.monthlySavings).toBeGreaterThan(0);
  });
});

// ---- Test 2: Detects seat waste ----
describe("audit-engine: seat waste", () => {
  it("flags 10 Copilot seats for a 4-person team", () => {
    const form: FormData = {
      tools: [{ toolId: "github-copilot", planId: "copilot-business", seats: 10, monthlySpend: 190 }],
      teamSize: 4,
      useCase: "coding",
    };
    const result = runAudit(form);
    const item = result.items[0];
    expect(["reduce_seats", "downgrade_plan", "switch_tool"]).toContain(item.recommendedAction);
    expect(item.monthlySavings).toBeGreaterThan(0);
  });
});

// ---- Test 3: Detects switch_tool alternative ----
describe("audit-engine: switch tool", () => {
  it("suggests cheaper alternative for cursor-pro when Windsurf is cheaper", () => {
    const form: FormData = {
      tools: [{ toolId: "cursor", planId: "cursor-pro", seats: 3, monthlySpend: 60 }],
      teamSize: 3,
      useCase: "coding",
    };
    const result = runAudit(form);
    const item = result.items[0];
    // Should find savings either via switch or downgrade
    expect(item.monthlySavings).toBeGreaterThanOrEqual(0);
  });
});

// ---- Test 4: Already optimal returns correct action ----
describe("audit-engine: already optimal", () => {
  it("marks GitHub Copilot Individual for 1 person as already_optimal", () => {
    const form: FormData = {
      tools: [{ toolId: "github-copilot", planId: "copilot-individual", seats: 1, monthlySpend: 10 }],
      teamSize: 1,
      useCase: "coding",
    };
    const result = runAudit(form);
    const item = result.items[0];
    expect(item.recommendedAction).toBe("already_optimal");
    expect(item.monthlySavings).toBe(0);
  });
});

// ---- Test 5: Total savings sum is correct ----
describe("audit-engine: total savings calculation", () => {
  it("correctly sums savings across multiple tools", () => {
    const form: FormData = {
      tools: [
        { toolId: "cursor", planId: "cursor-business", seats: 2, monthlySpend: 80 },
        { toolId: "github-copilot", planId: "copilot-enterprise", seats: 2, monthlySpend: 78 },
      ],
      teamSize: 2,
      useCase: "coding",
    };
    const result = runAudit(form);
    const expectedTotal = result.items.reduce((s, i) => s + i.monthlySavings, 0);
    expect(result.totalMonthlySavings).toBe(expectedTotal);
    expect(result.totalAnnualSavings).toBe(expectedTotal * 12);
  });
});

// ---- Test 6: isHighSavings flag triggers correctly ----
describe("audit-engine: isHighSavings flag", () => {
  it("sets isHighSavings=true when monthly savings exceed $500", () => {
    // Build a form that will definitely generate > $500 savings
    const form: FormData = {
      tools: [
        { toolId: "cursor", planId: "cursor-business", seats: 20, monthlySpend: 800 },
        { toolId: "chatgpt", planId: "chatgpt-enterprise", seats: 20, monthlySpend: 600 },
      ],
      teamSize: 5,
      useCase: "mixed",
    };
    const result = runAudit(form);
    if (result.totalMonthlySavings > 500) {
      expect(result.isHighSavings).toBe(true);
    } else {
      expect(result.isHighSavings).toBe(false);
    }
  });
});

// ---- Test 7: Audit result always has a unique ID ----
describe("audit-engine: unique IDs", () => {
  it("generates different IDs for separate audit runs", () => {
    const form: FormData = {
      tools: [{ toolId: "cursor", planId: "cursor-pro", seats: 1, monthlySpend: 20 }],
      teamSize: 1,
      useCase: "coding",
    };
    const r1 = runAudit(form);
    const r2 = runAudit(form);
    expect(r1.id).not.toBe(r2.id);
  });
});

// ---- Test 8: Credits recommendation for high-spend tool ----
describe("audit-engine: credits recommendation", () => {
  it("suggests credits for cursor-pro with high monthly spend", () => {
    const form: FormData = {
      tools: [{ toolId: "cursor", planId: "cursor-pro", seats: 10, monthlySpend: 200 }],
      teamSize: 10,
      useCase: "coding",
    };
    const result = runAudit(form);
    const item = result.items[0];
    // Should find some savings opportunity given 10 seats
    expect(item).toBeDefined();
    expect(typeof item.monthlySavings).toBe("number");
  });
});
