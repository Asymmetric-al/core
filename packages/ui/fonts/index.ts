import geistMonoCyrillic from "./geistmono/cyrillic";
import geistMonoCyrillicExt from "./geistmono/cyrillic-ext";
import geistMonoLatin from "./geistmono/latin";
import geistMonoLatinExt from "./geistmono/latin-ext";
import geistMonoSymbols2 from "./geistmono/symbols2";
import geistMonoVietnamese from "./geistmono/vietnamese";
import interCyrillic from "./inter/cyrillic";
import interCyrillicExt from "./inter/cyrillic-ext";
import interGreek from "./inter/greek";
import interGreekExt from "./inter/greek-ext";
import interLatin from "./inter/latin";
import interLatinExt from "./inter/latin-ext";
import interVietnamese from "./inter/vietnamese";
import syneGreek from "./syne/greek";
import syneLatin from "./syne/latin";
import syneLatinExt from "./syne/latin-ext";
import "./fallbacks.css";

export const fontVariables = [
  interCyrillicExt.variable,
  interCyrillic.variable,
  interGreekExt.variable,
  interGreek.variable,
  interVietnamese.variable,
  interLatinExt.variable,
  interLatin.variable,
  syneGreek.variable,
  syneLatinExt.variable,
  syneLatin.variable,
  geistMonoCyrillicExt.variable,
  geistMonoCyrillic.variable,
  geistMonoSymbols2.variable,
  geistMonoVietnamese.variable,
  geistMonoLatinExt.variable,
  geistMonoLatin.variable,
].join(" ");
