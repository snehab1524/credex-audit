// app/audit/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AuditResults from "@/components/AuditResults";
import type { AuditResult } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app";

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    const res = await fetch(`${APP_URL}/api/audit/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
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

  const ogImageUrl = `${APP_URL}/api/og?savings=${audit.totalMonthlySavings ?? 0}&annual=${audit.totalAnnualSavings ?? 0}&optimal=${audit.isAlreadyOptimal ?? false}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${APP_URL}/audit/${params.id}`,
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

export default async function AuditPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();

  return <AuditResults audit={audit} auditId={params.id} />;
}
