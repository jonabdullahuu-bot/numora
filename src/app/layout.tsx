import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://numoralookup.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "NumoraLookup — Reverse Phone Lookup, Carrier & VoIP Scam Checker",
    template: "%s | NumoraLookup",
  },
  description:
    "Check any unknown phone number in seconds. Identify carrier routing, VoIP burner lines (Google Voice, TextNow), country origin, and spam/catfish risk signals anonymously.",
  keywords: [
    "NumoraLookup",
    "reverse phone lookup",
    "phone number lookup",
    "who called me",
    "scammer phone number lookup",
    "voip number checker",
    "google voice lookup",
    "carrier lookup",
    "check unknown number",
    "catfish phone number check",
    "international phone lookup",
    "spam caller check",
  ],
  icons: {
    icon: "/logo.jpg?v=2",
    shortcut: "/logo.jpg?v=2",
    apple: "/logo.jpg?v=2",
  },
  openGraph: {
    title: "NumoraLookup — Reverse Phone Lookup, Carrier & VoIP Scam Checker",
    description:
      "Inspect carrier routing, mobile vs. VoIP line type, and scam risk signals for any phone number in seconds.",
    url: "/",
    siteName: "NumoraLookup",
    type: "website",
    images: ["/logo.jpg?v=2"],
  },
  twitter: {
    card: "summary",
    title: "NumoraLookup — Reverse Phone Lookup & Scam Checker",
    description:
      "Verify unknown callers, detect VoIP burners, and check carrier telemetry in seconds.",
    images: ["/logo.jpg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
