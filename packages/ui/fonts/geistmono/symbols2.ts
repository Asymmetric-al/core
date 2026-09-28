import localFont from "next/font/local";
const GeistMono = localFont({
  src: [
    {
      path: "./symbols2.woff2",
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
      value: "U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD, U+2500-259F",
    },
  ],
});
export default GeistMono;
