import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Lookup Passes, NumoraLookup",
  description:
    "Compare one-time NumoraLookup passes for reverse phone lookup, carrier & VoIP line detection, and spam risk checks. No recurring monthly subscriptions.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
