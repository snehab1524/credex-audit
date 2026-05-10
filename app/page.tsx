// app/audit/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AuditResults from "@/components/AuditResults";
import type { AuditResult } from "@/types";

function getBaseUrl(): string {
  // Vercel automatically sets VERCEL_URL for every deployment
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Fallback to manually set URL
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  // Local development
  return "http://localhost:3000";
}

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/audit/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Failed to fetch audit:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const audit = await getAudit(params.id);
  if (!audit) return { title: "Audit Not Found" };

  const title = audit.isAlreadyOptimal
    ? "My AI stack is already optimized ✅"
    : `I found $${audit.totalMonthlySavings?.toLocaleString()}/mo in AI savings 💰`;

  const description = audit.isAlreadyOptimal
    ? "Check if your team is overpaying on AI tools — free instant audit."
    : `That's $${audit.totalAnnualSavings?.toLocaleString()}/year. See the full breakdown and check your own stack.`;

  const base = getBaseUrl();
  const ogImageUrl = `${base}/api/og?savings=${audit.totalMonthlySavings ?? 0}&annual=${audit.totalAnnualSavings ?? 0}&optimal=${audit.isAlreadyOptimal ?? false}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/audit/${params.id}`,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AuditPage({
  params,
}: {
  params: { id: string };
}) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();

  return <AuditResults audit={audit} auditId={params.id} />;
}
