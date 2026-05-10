"use client";
// components/AuditResults.tsx
import { useState, useEffect, useRef } from "react";
import type { AuditResult, AuditItem } from "@/types";
import LeadCapture from "./LeadCapture";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  downgrade_plan: { label: "Downgrade Plan", color: "text-yellow-400 bg-yellow-400/10" },
  switch_tool: { label: "Switch Tool", color: "text-blue-400 bg-blue-400/10" },
  use_credits: { label: "Use Credits", color: "text-purple-400 bg-purple-400/10" },
  reduce_seats: { label: "Reduce Seats", color: "text-orange-400 bg-orange-400/10" },
  already_optimal: { label: "✓ Optimal", color: "text-brand-400 bg-brand-400/10" },
};

function AuditItemCard({ item }: { item: AuditItem }) {
  const action = ACTION_LABELS[item.recommendedAction] ?? ACTION_LABELS.already_optimal;
  const hasSavings = item.monthlySavings > 0;

  return (
    <div className="card p-5 space-y-3 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold">{item.toolName}</h3>
          <p className="text-sm text-gray-400">{item.currentPlan}</p>
        </div>
        <span className={`text-xs font-mono px-3 py-1 rounded-full whitespace-nowrap ${action.color}`}>
          {action.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-0.5">Current</p>
          <p className="font-mono font-semibold">${item.currentSpend.toLocaleString()}/mo</p>
        </div>
        {hasSavings && (
          <>
            <span className="text-gray-600">→</span>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Save</p>
              <p className="font-mono font-semibold text-brand-400">
                −${item.monthlySavings.toLocaleString()}/mo
              </p>
            </div>
            {item.recommendedPlan && (
              <div className="hidden sm:block">
                <p className="text-gray-500 text-xs mb-0.5">Switch to</p>
                <p className="font-mono text-sm">{item.recommendedPlan}</p>
              </div>
            )}
            {item.recommendedTool && (
              <div className="hidden sm:block">
                <p className="text-gray-500 text-xs mb-0.5">Switch to</p>
                <p className="font-mono text-sm">{item.recommendedTool}</p>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-sm text-gray-400 border-t border-dark-600 pt-3">{item.reason}</p>
    </div>
  );
}

export default function AuditResults({
  audit,
  auditId,
}: {
  audit: AuditResult;
  auditId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  // Poll for AI summary generated in background
  const [aiSummary, setAiSummary] = useState<string>(audit.aiSummary ?? "");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (audit.aiSummary) return; // already done
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/audit/${auditId}`);
        const data = await res.json();
        if (data.aiSummary) {
          setAiSummary(data.aiSummary);
          clearInterval(pollRef.current!);
        }
      } catch { /* ignore */ }
      if (attempts >= 20) clearInterval(pollRef.current!);
    }, 1000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const shareUrl = `${appUrl}/audit/${auditId}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasSavings = audit.totalMonthlySavings > 0;

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-display font-bold text-xl tracking-tight">
          <span className="text-brand-400">AI</span>Audit
        </a>
        <button onClick={copyLink} className="btn-ghost text-sm py-2">
          {copied ? "✓ Copied!" : "Share Report"}
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Hero savings card */}
        <div
          className={`card p-8 text-center animate-fade-up ${
            hasSavings
              ? "border-brand-500/30 bg-gradient-to-b from-brand-500/5 to-transparent"
              : "border-dark-500"
          }`}
        >
          {hasSavings ? (
            <>
              <p className="text-gray-400 text-sm font-mono mb-2">POTENTIAL SAVINGS FOUND</p>
              <p className="font-display text-6xl font-bold text-brand-400 mb-1">
                ${audit.totalMonthlySavings.toLocaleString()}
                <span className="text-2xl text-gray-400 font-normal">/mo</span>
              </p>
              <p className="text-gray-300 text-lg">
                That&apos;s{" "}
                <span className="text-white font-semibold">
                  ${audit.totalAnnualSavings.toLocaleString()}/year
                </span>{" "}
                you&apos;re currently leaving on the table
              </p>
              <p className="text-sm text-gray-500 mt-2">
                vs. current spend of ${audit.totalCurrentSpend.toLocaleString()}/mo
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-4xl font-bold text-brand-400 mb-2">
                You&apos;re spending well ✓
              </p>
              <p className="text-gray-400">
                Less than $100/month in optimization opportunities found.
                <br />
                Your AI stack looks well-matched to your needs.
              </p>
            </>
          )}
        </div>

        {/* AI Summary — streams in after results (background generation) */}
        <div className="card p-6 animate-fade-in">
          <p className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">
            AI Analysis
          </p>
          {aiSummary ? (
            <p className="text-gray-300 leading-relaxed">{aiSummary}</p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-dark-600 rounded w-full" />
              <div className="h-3 bg-dark-600 rounded w-5/6" />
              <div className="h-3 bg-dark-600 rounded w-4/6" />
              <p className="text-xs text-gray-600 pt-1">Generating AI summary…</p>
            </div>
          )}
        </div>

        {/* Credex CTA for high savings */}
        {audit.isHighSavings && (
          <div className="bg-gradient-to-r from-brand-500/10 to-brand-600/5 border border-brand-500/30 rounded-2xl p-6 animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💰</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg mb-1">
                  Capture these savings with Credex
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  You&apos;re spending over $500/mo on AI tools. Credex sells discounted credits
                  for Cursor, Claude, ChatGPT and more — sourced from companies that
                  overforecast. Real discounts, same products.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  Book a Credex Consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* BONUS: Benchmark mode */}
        {audit.spendPerDev !== undefined && audit.benchmarkAvg !== undefined && (
          <div className="card p-5 animate-fade-up">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Benchmark</p>
            <div className="flex items-center justify-between gap-4">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">
                  ${audit.spendPerDev}
                  <span className="text-sm text-gray-400 font-normal">/dev/mo</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Your spend</p>
              </div>
              <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    audit.spendPerDev > audit.benchmarkAvg ? "bg-red-400" : "bg-brand-500"
                  }`}
                  style={{ width: `${Math.min(100, (audit.spendPerDev / (audit.benchmarkAvg * 2)) * 100)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-gray-400">
                  ${audit.benchmarkAvg}
                  <span className="text-sm text-gray-500 font-normal">/dev/mo</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Team average</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              {audit.spendPerDev > audit.benchmarkAvg
                ? `You spend $${audit.spendPerDev - audit.benchmarkAvg} more per developer than similar teams`
                : `You spend $${audit.benchmarkAvg - audit.spendPerDev} less per developer than similar teams`}
            </p>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4">Tool-by-Tool Breakdown</h2>
          <div className="space-y-3">
            {audit.items?.map((item, i) => (
              <AuditItemCard key={i} item={item} />
            ))}
          </div>
        </div>

        {/* Lead capture */}
        {!leadDone ? (
          <div className="card p-6 animate-fade-up">
            {!showLead ? (
              <div className="text-center space-y-3">
                <p className="font-display font-semibold text-lg">
                  {hasSavings
                    ? "Get your full report by email"
                    : "Stay updated on new optimizations"}
                </p>
                <p className="text-sm text-gray-400">
                  {hasSavings
                    ? "We'll send you the full breakdown and notify you when new savings apply to your stack."
                    : "AI tool pricing changes constantly. We'll ping you when a better option appears for your stack."}
                </p>
                <button onClick={() => setShowLead(true)} className="btn-primary">
                  {hasSavings ? "Email Me This Report" : "Notify Me of Future Savings"}
                </button>
              </div>
            ) : (
              <LeadCapture auditId={auditId} onSuccess={() => setLeadDone(true)} />
            )}
          </div>
        ) : (
          <div className="card p-6 text-center animate-fade-up">
            <p className="text-brand-400 font-display font-semibold text-lg">
              ✓ Report sent to your inbox
            </p>
            <p className="text-gray-400 text-sm mt-1">
              We&apos;ll reach out if we find new savings for your stack.
            </p>
          </div>
        )}

        {/* Export + Share */}
        <div className="card p-6 space-y-4 animate-fade-up">
          <p className="text-sm font-display font-semibold text-gray-300 text-center">
            Share or export your report
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={copyLink} className="btn-ghost text-sm py-2 px-5">
              {copied ? "✓ Copied" : "📋 Copy Link"}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                hasSavings
                  ? `Just audited our AI tool spend — found $${audit.totalMonthlySavings}/mo in savings. Free tool:`
                  : `Just audited our AI tool spend — we're already optimized ✅. Check yours:`
              )}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-2 px-5"
            >
              𝕏 Share on X
            </a>
            <a
              href={`/api/export/${auditId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-2 px-5"
            >
              📄 Export PDF
            </a>
            <a href="/" className="btn-primary text-sm py-2 px-5">
              New Audit
            </a>
          </div>
          <p className="text-xs text-center text-gray-600">
            Shareable link strips your email and company name — only tool names and savings numbers are public.
          </p>
        </div>
      </div>
    </main>
  );
}
