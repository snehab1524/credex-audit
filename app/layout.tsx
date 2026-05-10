// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Spend Audit — Find where you're overpaying on AI tools",
  description:
    "Free instant audit of your AI tool subscriptions. See exactly where you're overspending and how much you could save.",
  openGraph: {
    title: "AI Spend Audit",
    description: "Free instant audit of your AI tool subscriptions.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "AI Spend Audit by Credex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit — Are you overpaying on AI tools?",
    description: "Free instant audit. See your savings in 2 minutes.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-dark-900 text-white antialiased">{children}</body>
    </html>
  );
}
