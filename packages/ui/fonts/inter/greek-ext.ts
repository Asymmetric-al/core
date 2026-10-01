import localFont from "next/font/local";
const Inter = localFont({
  src: [
    {
      path: "./greek-ext.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./greek-ext.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./greek-ext.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./greek-ext.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./greek-ext.woff2",
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
      value: "U+1F00-1FFF",
    },
  ],
});
export default Inter;
