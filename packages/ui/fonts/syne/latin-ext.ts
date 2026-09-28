import localFont from "next/font/local";
const Syne = localFont({
  src: [
    {
      path: "./latin-ext.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./latin-ext.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./latin-ext.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./latin-ext.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./latin-ext.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-syne",
  adjustFontFallback: false,
  fallback: ["Syne Fallback"],
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});
export default Syne;
