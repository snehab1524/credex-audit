"use client";
// components/LeadCapture.tsx
import { useState } from "react";

interface Props {
  auditId: string;
  onSuccess: () => void;
}

export default function LeadCapture({ auditId, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (honeypot) return;
    if (!email) return setError("Email is required.");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, companyName, role, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <h3 className="font-display font-semibold text-lg">Get your report by email</h3>

      <div>
        <label className="label" htmlFor="lc-email">
          Work email <span className="text-red-400">*</span>
        </label>
        <input
          id="lc-email"
          type="email"
          className="input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="lc-company">
            Company <span className="text-gray-600">(optional)</span>
          </label>
          <input
            id="lc-company"
            type="text"
            className="input"
            placeholder="Acme Inc"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="lc-role">
            Your role <span className="text-gray-600">(optional)</span>
          </label>
          <input
            id="lc-role"
            type="text"
            className="input"
            placeholder="Engineering Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl py-2 px-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            Sending...
          </span>
        ) : (
          "Send My Report"
        )}
      </button>

      <p className="text-xs text-center text-gray-600">
        No spam. One email with your report. Credex may follow up if savings are significant.
      </p>
    </div>
  );
}
