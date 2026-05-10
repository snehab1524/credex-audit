// app/page.tsx  — Server Component (no "use client")
import SpendForm from "@/components/SpendForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <span className="font-display font-bold text-xl tracking-tight">
          <span className="text-brand-400">AI</span>Audit
        </span>
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
        >
          by Credex →
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-mono px-4 py-1.5 rounded-full mb-6">
          Free · No signup · Takes 2 minutes
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4">
          Are you overpaying
          <br />
          <span className="text-brand-400">on AI tools?</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-2">
          Enter your AI subscriptions. Get an instant audit showing exactly where
          you&apos;re overspending and how much you could save.
        </p>
        <p className="text-sm text-gray-500">
          Used by engineering teams worldwide. Average savings found:{" "}
          <span className="text-brand-400 font-semibold">$340/month</span>
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: "1", label: "Enter your tools", sub: "Plans, seats, spend" },
            { step: "2", label: "Instant audit", sub: "Rule-based analysis" },
            { step: "3", label: "See your savings", sub: "Shareable report" },
          ].map((s) => (
            <div key={s.step} className="card p-4">
              <div className="text-brand-400 font-mono text-sm mb-1">Step {s.step}</div>
              <div className="font-display font-semibold text-sm">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <SpendForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-6 text-center text-sm text-gray-500">
        Built by{" "}
        <a href="https://credex.rocks" className="text-brand-400 hover:underline">
          Credex
        </a>{" "}
        · Discounted AI infrastructure credits for startups
      </footer>
    </main>
  );
}
