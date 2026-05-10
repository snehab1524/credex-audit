// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb";
import { Lead, Audit } from "@/lib/models";
import type { LeadData } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let body: LeadData & { honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body.honeypot) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { auditId, email, companyName, role, teamSize } = body;

  if (!auditId || !email) {
    return NextResponse.json({ error: "auditId and email are required" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  await connectDB();

  // Fetch audit for context
  const audit = await Audit.findOne({ id: auditId });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Check if lead already exists
  const existing = await Lead.findOne({ auditId, email });
  if (existing) {
    return NextResponse.json({ success: true, alreadyCaptured: true });
  }

  // Save lead
  const lead = await Lead.create({ auditId, email, companyName, role, teamSize });

  // Update audit with email
  await Audit.updateOne({ id: auditId }, { $set: { email, companyName, role } });

  // Send transactional email
  const isHighSavings = audit.isHighSavings;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app";

  try {
    await resend.emails.send({
      from: "AI Spend Audit <audit@yourdomain.com>",
      to: email,
      subject: `Your AI Spend Audit — $${audit.totalMonthlySavings?.toLocaleString()}/mo in potential savings`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16a34a;">Your AI Spend Audit is ready</h2>
          <p>Hi${companyName ? ` from ${companyName}` : ""},</p>
          <p>We found <strong>$${audit.totalMonthlySavings?.toLocaleString()}/month</strong> 
          ($${audit.totalAnnualSavings?.toLocaleString()}/year) in potential savings across your AI tool stack.</p>
          
          <a href="${appUrl}/audit/${auditId}" 
             style="display:inline-block; background:#16a34a; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin: 16px 0;">
            View Your Full Audit
          </a>

          ${
            isHighSavings
              ? `<p><strong>Because your potential savings exceed $500/month</strong>, a Credex advisor will reach out within 2 business days to show you how to capture those savings through discounted AI credits.</p>`
              : `<p>We'll notify you when new optimization opportunities apply to your stack — AI tool pricing changes frequently.</p>`
          }

          <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Powered by <a href="https://credex.rocks" style="color:#16a34a;">Credex</a> — discounted AI infrastructure credits.
          </p>
        </div>
      `,
    });

    await Lead.updateOne({ _id: lead._id }, { $set: { emailSent: true } });
  } catch (err) {
    console.error("Email send failed:", err);
    // Don't fail the request if email fails — lead is already saved
  }

  return NextResponse.json({ success: true });
}
