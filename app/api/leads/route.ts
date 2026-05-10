import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead, Audit } from "@/lib/models";
import type { LeadData } from "@/types";

export async function POST(req: NextRequest) {
  let body: LeadData & { honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { auditId, email, companyName, role, teamSize } = body;

  if (!auditId || !email) {
    return NextResponse.json({ error: "auditId and email are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  await connectDB();

  const audit = await Audit.findOne({ id: auditId });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const existing = await Lead.findOne({ auditId, email });
  if (existing) {
    return NextResponse.json({ success: true, alreadyCaptured: true });
  }

  await Lead.create({ auditId, email, companyName, role, teamSize });
  await Audit.updateOne({ id: auditId }, { $set: { email, companyName, role } });

  return NextResponse.json({ success: true });
}