// app/api/summary/route.ts
// Standalone endpoint to regenerate AI summary for an existing audit
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";
import { generateAISummary } from "@/lib/ai-summary";
import type { AuditResult, UseCase } from "@/types";

export async function POST(req: NextRequest) {
  let body: { auditId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { auditId } = body;
  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }

  await connectDB();
  const audit = await Audit.findOne({ id: auditId }).lean() as AuditResult | null;
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const summary = await generateAISummary(audit, (audit as AuditResult & { useCase: UseCase }).useCase ?? "mixed");

  // Update in DB
  await Audit.updateOne({ id: auditId }, { $set: { aiSummary: summary } });

  return NextResponse.json({ summary });
}
