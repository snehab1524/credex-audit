import { notFound } from "next/navigation";
import { Metadata } from "next";
import AuditResults from "@/components/AuditResults";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";
import type { AuditResult } from "@/types";

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    await connectDB();
    const doc = await Audit.findOne({ id }).lean();
    if (!doc) return null;
    const obj = JSON.parse(JSON.stringify(doc));
    delete obj._id;
    delete obj.__v;
    delete obj.email;
    delete obj.companyName;
    return obj as AuditResult;
  } catch (err) {
    console.error("getAudit error:", err);
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
    : `That's $${audit.totalAnnualSavings?.toLocaleString()}/year. Check your own stack.`;

  return { title, description };
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