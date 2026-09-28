import localFont from "next/font/local";
const GeistMono = localFont({
  src: [
    {
      path: "./latin.woff2",
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
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
export default GeistMono;
