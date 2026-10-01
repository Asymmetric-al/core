import localFont from "next/font/local";
const Inter = localFont({
  src: [
    {
      path: "./cyrillic.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./cyrillic.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./cyrillic.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./cyrillic.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./cyrillic.woff2",
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
      value: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
  ],
});
export default Inter;
