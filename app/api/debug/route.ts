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
        searchedId: id,
        audit: audit ?? null,
      });
    }

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
      mongoUri: process.env.MONGODB_URI ? "SET" : "NOT SET",
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}