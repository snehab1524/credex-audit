// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="font-mono text-brand-400 text-sm">404</p>
        <h1 className="font-display text-4xl font-bold">Audit not found</h1>
        <p className="text-gray-400">
          This audit link may have expired or never existed.
        </p>
        <Link href="/" className="btn-primary inline-block mt-4">
          Run a New Audit →
        </Link>
      </div>
    </main>
  );
}
