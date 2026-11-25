import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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
    default: "NumoraLookup | Reverse Phone Lookup, VoIP & Carrier Check (No Subscription)",
    template: "%s | NumoraLookup",
  },
  description:
    "Check any unknown phone number in seconds with zero subscriptions or fake loading bars. Detect Google Voice & TextNow VoIP burners, carrier routing, and scam risk 100% privately.",
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
    title: "NumoraLookup | Instant VoIP, Carrier & Scam Phone Lookup (No Subscription)",
    description:
      "Inspect carrier routing, mobile vs. VoIP burner line type, and scam risk signals for any phone number in seconds. Owner is never notified.",
    url: "/",
    siteName: "NumoraLookup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NumoraLookup | Instant VoIP & Carrier Phone Lookup",
    description:
      "Detect Google Voice & TextNow burners, verify carriers, and check scam risk in seconds. No monthly subscriptions.",
  },
};

const structuredDataGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "NumoraLookup",
      url: siteUrl,
      logo: `${siteUrl}/logo.jpg?v=2`,
      email: "support@numoralookup.com",
      sameAs: [
        "https://x.com/NumoraLookup",
        "https://www.youtube.com/@NumoraLookup",
        "https://www.tiktok.com/@numoralookup",
        "https://www.instagram.com/numoralookup/",
        "https://www.facebook.com/profile.php?id=61596552735679",
        "https://medium.com/@numoralookup",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "NumoraLookup",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataGraph).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
