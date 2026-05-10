"use client";
// components/SpendForm.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/pricing-data";
import type { FormData, ToolEntry, UseCase, ToolId } from "@/types";

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "💻 Coding / Engineering" },
  { value: "writing", label: "✍️ Writing / Content" },
  { value: "data", label: "📊 Data / Analytics" },
  { value: "research", label: "🔬 Research" },
  { value: "mixed", label: "🔀 Mixed / General" },
];

const defaultTool = (): ToolEntry => ({
  toolId: "cursor" as ToolId,
  planId: "cursor-pro",
  seats: 1,
  monthlySpend: 20,
});

const STORAGE_KEY = "aiaudit_form";

export default function SpendForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolEntry[]>([defaultTool()]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Persist form to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormData;
        setTools(parsed.tools);
        setTeamSize(parsed.teamSize);
        setUseCase(parsed.useCase);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
  }, [tools, teamSize, useCase]);

  function updateTool(index: number, patch: Partial<ToolEntry>) {
    setTools((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      // Auto-update planId when toolId changes
      if (patch.toolId) {
        const tool = TOOLS.find((t) => t.id === patch.toolId);
        if (tool?.plans[0]) {
          updated[index].planId = tool.plans[0].id;
          updated[index].monthlySpend = tool.plans[0].pricePerUser;
        }
      }
      // Auto-update monthlySpend when planId changes
      if (patch.planId && !patch.monthlySpend) {
        const tool = TOOLS.find((t) => t.id === updated[index].toolId);
        const plan = tool?.plans.find((p) => p.id === patch.planId);
        if (plan) updated[index].monthlySpend = plan.pricePerUser * updated[index].seats;
      }
      return updated;
    });
  }

  function addTool() {
    setTools((prev) => [...prev, defaultTool()]);
  }

  function removeTool(index: number) {
    setTools((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (honeypot) return; // bot
    if (tools.length === 0) return setError("Add at least one tool.");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: { tools, teamSize, useCase }, honeypot }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      // Clear saved form
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Honeypot - hidden from real users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Team context */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Your Team</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Team size</label>
            <input
              type="number"
              className="input"
              min={1}
              max={10000}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div>
            <label className="label">Primary use case</label>
            <select
              className="input"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>
                  {uc.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tool entries */}
      <div className="space-y-3">
        {tools.map((entry, index) => {
          const toolDef = TOOLS.find((t) => t.id === entry.toolId);
          const planDef = toolDef?.plans.find((p) => p.id === entry.planId);

          return (
            <div key={index} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-mono text-brand-400">Tool #{index + 1}</span>
                {tools.length > 1 && (
                  <button
                    onClick={() => removeTool(index)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Tool selector */}
                <div className="col-span-2 md:col-span-1">
                  <label className="label">Tool</label>
                  <select
                    className="input text-sm"
                    value={entry.toolId}
                    onChange={(e) => updateTool(index, { toolId: e.target.value as ToolId })}
                  >
                    {TOOLS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan selector */}
                <div className="col-span-2 md:col-span-1">
                  <label className="label">Plan</label>
                  <select
                    className="input text-sm"
                    value={entry.planId}
                    onChange={(e) => updateTool(index, { planId: e.target.value })}
                  >
                    {toolDef?.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.pricePerUser > 0 ? `($${p.pricePerUser}/user)` : "(Free)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seats */}
                <div>
                  <label className="label">Seats</label>
                  <input
                    type="number"
                    className="input text-sm"
                    min={1}
                    value={entry.seats}
                    onChange={(e) => {
                      const seats = Math.max(1, parseInt(e.target.value) || 1);
                      const plan = toolDef?.plans.find((p) => p.id === entry.planId);
                      updateTool(index, {
                        seats,
                        monthlySpend: plan ? plan.pricePerUser * seats : entry.monthlySpend,
                      });
                    }}
                  />
                </div>

                {/* Monthly spend */}
                <div>
                  <label className="label">Monthly ($)</label>
                  <input
                    type="number"
                    className="input text-sm"
                    min={0}
                    value={entry.monthlySpend}
                    onChange={(e) =>
                      updateTool(index, { monthlySpend: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              {planDef?.notes && (
                <p className="text-xs text-gray-500 mt-2 font-mono">{planDef.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add tool */}
      <button
        onClick={addTool}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        <span className="text-brand-400 text-lg leading-none">+</span>
        Add another tool
      </button>

      {/* Total preview */}
      {tools.length > 0 && (
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-gray-400">Total monthly spend entered:</span>
          <span className="font-mono font-semibold text-white">
            ${tools.reduce((s, t) => s + t.monthlySpend, 0).toLocaleString()}/mo
          </span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl py-3">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            Running audit...
          </span>
        ) : (
          "Run My Free Audit →"
        )}
      </button>

      <p className="text-center text-xs text-gray-600">
        No account required. Email captured after your results, never before.
      </p>
    </div>
  );
}
