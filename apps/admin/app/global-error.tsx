"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f8fafc",
          color: "#18181b",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <title>Admin error</title>
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
              Mission Control
            </p>
            <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#52525b", fontSize: "14px", margin: 0 }}>
              The admin app could not render this page. Try again, or return to
              the dashboard if the problem continues.
            </p>
            {error.digest ? (
              <p
                style={{
                  color: "#71717a",
                  fontSize: "12px",
                  margin: "20px 0 0",
                }}
              >
                Reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#18181b",
                border: 0,
                borderRadius: "10px",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                marginTop: "24px",
                padding: "12px 18px",
                textTransform: "uppercase",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
