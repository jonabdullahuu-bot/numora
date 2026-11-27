import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Token Dashboard",
  description: "Manage your NumoraLookup credits, access token, and unlocked phone lookup dossiers.",
  alternates: {
    canonical: "/dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
