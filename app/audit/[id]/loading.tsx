// app/audit/[id]/loading.tsx
export default function AuditLoading() {
  return (
    <main className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <span className="font-display font-bold text-xl">
          <span className="text-brand-400">AI</span>Audit
        </span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        {/* Hero skeleton */}
        <div className="card p-8 text-center space-y-3">
          <div className="h-3 w-40 bg-dark-600 rounded mx-auto" />
          <div className="h-16 w-56 bg-dark-600 rounded mx-auto" />
          <div className="h-4 w-72 bg-dark-600 rounded mx-auto" />
        </div>

        {/* Summary skeleton */}
        <div className="card p-6 space-y-2">
          <div className="h-3 w-24 bg-dark-600 rounded" />
          <div className="h-4 w-full bg-dark-600 rounded" />
          <div className="h-4 w-5/6 bg-dark-600 rounded" />
          <div className="h-4 w-4/6 bg-dark-600 rounded" />
        </div>

        {/* Item skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-4 w-28 bg-dark-600 rounded" />
                <div className="h-3 w-20 bg-dark-600 rounded" />
              </div>
              <div className="h-6 w-24 bg-dark-600 rounded-full" />
            </div>
            <div className="h-3 w-full bg-dark-600 rounded" />
            <div className="h-3 w-4/5 bg-dark-600 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
