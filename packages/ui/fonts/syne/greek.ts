import localFont from "next/font/local";
const Syne = localFont({
  src: [
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
    {
      path: "./greek.woff2",
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
        "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
    },
  ],
});
export default Syne;
