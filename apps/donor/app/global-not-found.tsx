import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Give Hope",
  description: "The requested Give Hope page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#fafafa",
          color: "#18181b",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            alignItems: "center",
            display: "flex",
            minHeight: "100vh",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
              maxWidth: "440px",
              padding: "32px",
              textAlign: "center",
              width: "100%",
            }}
          >
            <p
              style={{
                color: "#71717a",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                margin: "0 0 12px",
                textTransform: "uppercase",
              }}
            >
              404
            </p>
            <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>
              Page not found
            </h1>
            <p style={{ color: "#52525b", fontSize: "14px", margin: 0 }}>
              The page you are looking for does not exist or has moved.
            </p>
            <Link
              href="/"
              style={{
                background: "#18181b",
                borderRadius: "10px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                marginTop: "24px",
                padding: "12px 18px",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              Return home
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
