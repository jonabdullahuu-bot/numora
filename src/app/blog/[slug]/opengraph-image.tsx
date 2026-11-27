import { ImageResponse } from "next/og";
import { BLOG_POSTS } from "../../../data/blogPosts";

export const alt = "NumoraLookup Safety Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  const title = post?.title || "Phone Safety & VoIP Verification Guide";
  const category = (post?.category || "Scam Prevention").toUpperCase();
  const readTime = post?.readTime || "5 min read";
  const description =
    post?.description ||
    "Learn how to spot VoIP burners, verify carrier routing, and check unknown callers privately.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background:
            "#141519",
          padding: "56px 64px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#4d6fa9",
                color: "#141519",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              N
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#ffffff" }}>
              NumoraLookup
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(77, 111, 169, 0.55)",
              background: "rgba(77, 111, 169, 0.16)",
              padding: "8px 20px",
              fontSize: 16,
              fontWeight: 800,
              color: "#4d6fa9",
              letterSpacing: 1,
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: title.length > 68 ? 44 : 52,
              fontWeight: 800,
              lineHeight: 1.14,
              color: "#ffffff",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 23,
              lineHeight: 1.45,
              color: "#cbd5e1",
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148, 163, 184, 0.25)",
            paddingTop: 22,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: "#4d6fa9" }}>
            numoralookup.com/blog
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 19,
              color: "#94a3b8",
            }}
          >
            <span>{readTime}</span>
            <span>No Subscriptions</span>
            <span>100% Private</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
