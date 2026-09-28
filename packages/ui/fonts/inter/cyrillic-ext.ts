import localFont from "next/font/local";
const Inter = localFont({
  src: [
    {
      path: "./cyrillic-ext.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./cyrillic-ext.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./cyrillic-ext.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./cyrillic-ext.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./cyrillic-ext.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-inter",
  adjustFontFallback: false,
  fallback: ["Inter Fallback"],
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
  ],
});
export default Inter;
