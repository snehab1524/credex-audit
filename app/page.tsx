// app/audit/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AuditResults from "@/components/AuditResults";
import type { AuditResult } from "@/types";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    await connectDB();
    const audit = await Audit.findOne({ id }).lean() as unknown as AuditResult & {
      email?: string;
      companyName?: string;
      _id?: unknown;
      __v?: unknown;
    } | null;

    if (!audit) return null;

    // Strip private fields
    const { email: _e, companyName: _c, _id: _id2, __v: _v, ...publicAudit } = audit;
    void _e; void _c; void _id2; void _v;

    return publicAudit as unknown as AuditResult;
  } catch (err) {
    console.error("Failed to fetch audit from DB:", err);
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

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

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

  return <AuditResults audit={audit as AuditResult} auditId={params.id} />;
}
