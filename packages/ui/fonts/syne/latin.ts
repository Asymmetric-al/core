import localFont from "next/font/local";
const Syne = localFont({
  src: [
    {
      path: "./latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./latin.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./latin.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./latin.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-syne",
  adjustFontFallback: false,
  fallback: ["Syne Fallback"],
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
export default Syne;
