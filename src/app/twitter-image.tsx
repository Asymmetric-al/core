import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        backgroundImage: "linear-gradient(135deg, #020617 0%, #18181b 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 24,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#18181b",
            }}
          >
            {siteConfig.shortName}
          </span>
        </div>
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.05em",
          }}
        >
          {siteConfig.name.toUpperCase()}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 36,
          fontWeight: 500,
          color: "#a1a1aa",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        {siteConfig.tagline}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 60,
          padding: "16px 32px",
          borderRadius: 9999,
          backgroundColor: "white",
          color: "#18181b",
          fontSize: 24,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Support the Mission
      </div>
    </div>,
    { ...size },
  );
}
