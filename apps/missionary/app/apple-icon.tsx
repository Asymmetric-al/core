import { ImageResponse } from "next/og";

export const contentType = "image/png";

export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#020617",
        color: "#ffffff",
        display: "flex",
        fontFamily: "system-ui, sans-serif",
        fontSize: 88,
        fontWeight: 800,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.08em",
        width: "100%",
      }}
    >
      M
    </div>,
    size,
  );
}
