import localFont from "next/font/local";
const GeistMono = localFont({
  src: [
    {
      path: "./cyrillic.woff2",
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
      value: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
  ],
});
export default GeistMono;
