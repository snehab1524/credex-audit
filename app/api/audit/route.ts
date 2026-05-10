// app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";
import { runAudit } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import type { FormData } from "@/types";

// Simple in-memory rate limit (per IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let body: { formData: FormData; honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { formData } = body;
  if (!formData?.tools?.length || !formData.teamSize || !formData.useCase) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Run audit engine — pure logic, instant (<5ms)
  const auditBase = runAudit(formData);

  const auditResult = {
    ...auditBase,
    aiSummary: "", // empty for now, filled in background
    teamSize: formData.teamSize,
    useCase: formData.useCase,
  };

  // 2. Save to MongoDB immediately — don't wait for AI
  try {
    await connectDB();
    await Audit.create(auditResult);
  } catch (err) {
    console.error("POST /api/audit failed saving to MongoDB:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }


  // 3. Generate AI summary in background — does NOT block the response
  // We fire-and-forget, the results page polls /api/summary/:id until it appears
  generateAISummary(auditBase, formData.useCase)
    .then((summary) =>
      Audit.updateOne({ id: auditResult.id }, { $set: { aiSummary: summary } })
    )
    .catch((err) => console.error("Background AI summary failed:", err));

  // 4. Return immediately — user lands on results in <500ms
  return NextResponse.json({ auditId: auditResult.id });
}
