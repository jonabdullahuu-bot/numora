import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phone Number Opt-Out & Privacy Removal — NumoraLookup",
  description:
    "Request removal of your phone number from NumoraLookup search results. Fast, free self-service opt-out for personal privacy.",
  alternates: {
    canonical: "/opt-out",
  },
};

export default function OptOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
