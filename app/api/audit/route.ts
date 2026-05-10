// app/api/debug/route.ts
// TEMPORARY debug route - delete after fixing
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const audit = await Audit.findOne({ id }).lean();
      return NextResponse.json({
        found: !!audit,
        audit: audit ?? null,
        searchedId: id,
      });
    }

    // List last 5 audits
    const audits = await Audit.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      count: audits.length,
      ids: audits.map((a: Record<string, unknown>) => ({
        id: a.id,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: String(err),
        mongoUri: process.env.MONGODB_URI ? "SET" : "NOT SET",
      },
      { status: 500 }
    );
  }
}