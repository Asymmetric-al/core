import localFont from "next/font/local";
const GeistMono = localFont({
  src: [
    {
      path: "./cyrillic-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-geist-mono",
  adjustFontFallback: false,
  fallback: ["Geist Mono Fallback"],
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
  ],
});
export default GeistMono;
