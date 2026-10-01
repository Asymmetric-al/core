import localFont from "next/font/local";
const Inter = localFont({
  src: [
    {
      path: "./vietnamese.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./vietnamese.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./vietnamese.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./vietnamese.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./vietnamese.woff2",
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
        "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    },
  ],
});
export default Inter;
