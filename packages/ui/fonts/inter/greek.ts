import localFont from "next/font/local";
const Inter = localFont({
  src: [
    {
      path: "./greek.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./greek.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./greek.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./greek.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./greek.woff2",
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
        "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
    },
  ],
});
export default Inter;
