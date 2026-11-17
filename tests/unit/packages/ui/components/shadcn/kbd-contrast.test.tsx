// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Kbd } from "../../../../../../packages/ui/components/shadcn/kbd";

// WCAG 1.4.3 also covers aria-hidden text: the 12px key hint needs 4.5:1
// against its chip in both themes, computed from the real theme tokens.
type Rgb = [number, number, number];
type Theme = ":root" | ".dark";

const MIN_TEXT_CONTRAST = 4.5;
const TOOLTIP = "[[data-slot=tooltip-content]_&]:";

const css = readFileSync(
  path.resolve(__dirname, "../../../../../../packages/ui/styles/globals.css"),
  "utf8",
);

function themeTokens(theme: Theme) {
  const start = css.indexOf(`\n${theme} {`);
  const block = css.slice(start, css.indexOf("}", start));
  const tokens = new Map<string, Rgb>();
  for (const match of block.matchAll(
    /--([\w-]+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g,
  )) {
    tokens.set(
      match[1]!,
      oklchToSrgb(Number(match[2]), Number(match[3]), Number(match[4])),
    );
  }
  return tokens;
}

function oklchToSrgb(l: number, c: number, h: number): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lc = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mc = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sc = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ];
  return linear.map((value) => {
    const x = Math.min(1, Math.max(0, value));
    const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255);
  }) as Rgb;
}

function over(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return fg.map((v, i) => Math.round(v * alpha + bg[i]! * (1 - alpha))) as Rgb;
}

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

function kbdClasses() {
  render(<Kbd>K</Kbd>);
  return screen.getByText("K").className.split(/\s+/);
}

// Returns the colour utility the first matching variant prefix sets, so the
// order of `variants` is the cascade order, highest first.
function utility(
  classes: string[],
  property: "text" | "bg",
  variants: string[],
  tokens: Map<string, Rgb>,
) {
  for (const variant of variants) {
    for (const cls of classes) {
      if (!cls.startsWith(variant)) continue;
      const match = new RegExp(`^${property}-([a-z-]+)(?:/(\\d+))?$`).exec(
        cls.slice(variant.length),
      );
      if (match && tokens.has(match[1]!)) {
        return {
          rgb: tokens.get(match[1]!)!,
          alpha: match[2] ? Number(match[2]) / 100 : 1,
        };
      }
    }
  }
  throw new Error(`No ${property} colour for variants ${variants.join(", ")}`);
}

function textContrast(
  classes: string[],
  variants: string[],
  tokens: Map<string, Rgb>,
  surface: Rgb,
) {
  const bg = utility(classes, "bg", variants, tokens);
  const chip = over(bg.rgb, bg.alpha, surface);
  const text = utility(classes, "text", variants, tokens);
  return contrast(over(text.rgb, text.alpha, chip), chip);
}

afterEach(cleanup);

describe("Kbd text contrast", () => {
  it.each([
    { theme: ":root" as const, variants: [""] },
    { theme: ".dark" as const, variants: ["dark:", ""] },
  ])(
    "meets 4.5:1 on page, card and popover surfaces in $theme",
    ({ theme, variants }) => {
      const tokens = themeTokens(theme);
      const classes = kbdClasses();
      for (const surface of ["background", "card", "popover"]) {
        expect(
          textContrast(classes, variants, tokens, tokens.get(surface)!),
          `${theme} on ${surface}`,
        ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    },
  );

  it.each([
    { theme: ":root" as const, variants: [TOOLTIP, ""] },
    {
      theme: ".dark" as const,
      variants: [`dark:${TOOLTIP}`, TOOLTIP, "dark:", ""],
    },
  ])(
    "meets 4.5:1 inside a tooltip (bg-foreground) in $theme",
    ({ theme, variants }) => {
      const tokens = themeTokens(theme);
      expect(
        textContrast(kbdClasses(), variants, tokens, tokens.get("foreground")!),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    },
  );

  it("keeps the light look and lifts only dark text, which was 4.18:1 as muted-foreground on muted", () => {
    const classes = kbdClasses();
    expect(classes).toEqual(
      expect.arrayContaining([
        "bg-muted",
        "text-muted-foreground",
        // foreground at 60% on muted is 5.79:1 in dark.
        "dark:text-foreground/60",
        // Without this, the dark text above ties the tooltip's own text colour
        // on specificity and only wins or loses by stylesheet order.
        `dark:${TOOLTIP}text-background`,
      ]),
    );
  });
});
