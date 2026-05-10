// app/api/og/route.tsx
// Generates Open Graph preview images for shareable audit URLs
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savings = searchParams.get("savings") ?? "0";
  const annual = searchParams.get("annual") ?? "0";
  const optimal = searchParams.get("optimal") === "true";

  const monthlySavings = parseInt(savings);
  const annualSavings = parseInt(annual);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#060a0d",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Border glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid #16a34a33",
            borderRadius: "0px",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            fontSize: 22,
            fontWeight: 700,
            color: "#ffffff",
            display: "flex",
          }}
        >
          <span style={{ color: "#4ade80" }}>AI</span>Audit by Credex
        </div>

        {optimal ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              Already optimized
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#9ca3af",
                marginTop: 20,
                textAlign: "center",
              }}
            >
              Check your own AI tool spend → free 2-minute audit
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 22,
                color: "#9ca3af",
                marginBottom: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Potential savings found
            </div>
            <div
              style={{
                fontSize: 100,
                fontWeight: 800,
                color: "#4ade80",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              ${monthlySavings.toLocaleString()}
              <span style={{ fontSize: 36, color: "#6b7280", fontWeight: 400 }}>/mo</span>
            </div>
            <div style={{ fontSize: 28, color: "#d1d5db", marginBottom: 40 }}>
              That&apos;s{" "}
              <span style={{ color: "#ffffff", fontWeight: 700 }}>
                ${annualSavings.toLocaleString()}/year
              </span>{" "}
              in AI tool overspend
            </div>
            <div
              style={{
                background: "#16a34a22",
                border: "1px solid #16a34a44",
                borderRadius: 12,
                padding: "14px 28px",
                fontSize: 20,
                color: "#4ade80",
              }}
            >
              Run your free audit → aiaudit.credex.rocks
            </div>
          </>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
