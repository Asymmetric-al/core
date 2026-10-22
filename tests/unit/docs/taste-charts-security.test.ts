// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import { afterEach, describe, expect, it, vi } from "vitest";

const source = readFileSync(
  "docs/ai/skills/design-taste-frontend/assets/charts.js",
  "utf8",
);

type ChartApi = {
  line: (
    el: HTMLElement,
    options: {
      labels: string[];
      series: { name: string; values: (number | null)[] }[];
      format: (value: number) => string;
      tickFormat: (value: number) => string;
    },
  ) => unknown;
  ring: (
    el: HTMLElement,
    options: { value: number; label: string; sub: string },
  ) => void;
  plan: (
    el: HTMLElement,
    rows: {
      label: string;
      planned: number;
      spent: number;
      committed?: number;
    }[],
    options: {
      format: (value: number) => string;
      note: () => string;
      scale?: "row" | "plan";
    },
  ) => void;
  bullet: (
    el: HTMLElement,
    rows: { label: string; value: number; target: number }[],
    options: { format: (value: number) => string; max?: number },
  ) => void;
};

function chart() {
  const chartWindow: { Charts?: ChartApi } = {};
  // Run only the reviewed asset in a synthetic DOM, without Node or network APIs.
  runInNewContext(source, {
    document,
    window: chartWindow,
    getComputedStyle: window.getComputedStyle.bind(window),
    Intl,
  });
  if (!chartWindow.Charts) throw new Error("Charts public API missing");
  const el = document.createElement("div");
  document.body.appendChild(el);
  Object.defineProperty(el, "clientWidth", { value: 600 });
  return { charts: chartWindow.Charts, el };
}

function expectLiteralText(el: Element, values: string[]) {
  for (const value of values) expect(el.textContent).toContain(value);
  expect(el.querySelector("img, script, iframe, foreignObject, a")).toBeNull();
  for (const child of el.querySelectorAll("*")) {
    for (const attribute of child.getAttributeNames())
      expect(attribute.toLowerCase().startsWith("on")).toBe(false);
  }
}

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelector("#chart-legend-style")?.remove();
  vi.restoreAllMocks();
});

describe("Taste chart untrusted text rendering", () => {
  const label = '<img src=x onerror="window.chartPwned=1">';
  const value = '<svg onload="window.chartPwned=2">value</svg>';
  const name = "</b><script>window.chartPwned=3</script>";

  it("renders line tooltip labels, series names and formatter results literally", () => {
    const { charts, el } = chart();
    charts.line(el, {
      labels: ["First", label],
      series: [
        { name, values: [null, 20] },
        { name: "Other", values: [10, 30] },
      ],
      format: () => value,
      tickFormat: String,
    });
    const svg = el.querySelector("svg");
    const hit = el.querySelector("svg > rect[fill=transparent]");
    if (!svg || !hit) throw new Error("Line hover target missing");
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 600,
      bottom: 220,
      width: 600,
      height: 220,
      toJSON: () => ({}),
    });
    hit.dispatchEvent(new MouseEvent("pointermove", { clientX: 600 }));
    const tip = el.querySelector(".chart-tip");
    if (!tip) throw new Error("Line tooltip missing");
    expectLiteralText(tip, [label, value, name]);
    expect(tip.children).toHaveLength(3);
    expect(tip.querySelectorAll("b")).toHaveLength(2);
    expect(tip.querySelector("b")?.style.fontWeight).toBe("600");
    hit.dispatchEvent(new MouseEvent("pointermove", { clientX: 0 }));
    expect(tip.children).toHaveLength(3);
    expect(tip.querySelector("b")?.textContent).toBe("–");
    expectLiteralText(el, [value, name]);
  });

  it("renders ring labels and subtitles literally while preserving the ring", () => {
    const { charts, el } = chart();
    charts.ring(el, { value: 0.72, label, sub: value });
    expectLiteralText(el, [label, value]);
    expect(el.querySelectorAll("circle")).toHaveLength(2);
    const center = el.querySelector("svg")?.nextElementSibling;
    expect(center?.children).toHaveLength(2);
    expect(center?.firstElementChild?.textContent).toBe(label);
    expect(center?.lastElementChild?.textContent).toBe(value);
    expect(el.querySelector("svg")?.getAttribute("aria-label")).toBe(
      label + " " + value,
    );
  });

  it("renders plan labels, formatter values and notes literally with committed and over-plan marks", () => {
    const { charts, el } = chart();
    charts.plan(
      el,
      [
        { label, planned: 100, spent: 40, committed: 20 },
        { label: name, planned: 100, spent: 120 },
      ],
      { format: () => value, note: () => label, scale: "plan" },
    );
    expectLiteralText(el, [label, value, name]);
    const rows = el.querySelectorAll("li");
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector("b")?.textContent).toBe(value);
    const firstTrack = rows[0].querySelector("[role=img]");
    const overTrack = rows[1].querySelector("[role=img]");
    expect(firstTrack?.children).toHaveLength(2);
    expect(firstTrack?.firstElementChild?.getAttribute("style")).toContain(
      "width: 40%",
    );
    expect(overTrack?.children).toHaveLength(3);
    expect(overTrack?.getAttribute("aria-label")).toContain("over plan");
  });

  it("renders bullet labels and all formatter results literally with target marks", () => {
    const { charts, el } = chart();
    charts.bullet(
      el,
      [
        { label, value: 0.4, target: 0.25 },
        { label: name, value: 0.2, target: 0.25 },
      ],
      { format: () => value, max: 1 },
    );
    expectLiteralText(el, [label, value, name]);
    const rows = el.querySelectorAll("li");
    expect(rows).toHaveLength(2);
    expect(rows[0].children).toHaveLength(3);
    expect(rows[0].children[1].children).toHaveLength(2);
    expect(rows[0].querySelector("b")?.textContent).toBe(value);
    expect(rows[0].lastElementChild?.textContent).toBe(
      value + " +" + value + " vs " + value,
    );
    expect(rows[1].lastElementChild?.textContent).toBe(
      value + " −" + value + " vs " + value,
    );
  });
});
