// app/api/audit/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Audit } from "@/lib/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const audit = await Audit.findOne({ id: params.id }).lean();
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Strip private fields before returning public data
    const doc = audit as Record<string, unknown>;
    const { email: _e, companyName: _c, ...publicAudit } = doc;
    void _e;
    void _c;

    return NextResponse.json(publicAudit);
  } catch (err) {
    console.error("GET /api/audit/[id] failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

