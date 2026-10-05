import { writeFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./test";

interface FAQPanelObservation {
  id: string;
  expanded: boolean;
  hidden: boolean | "until-found";
  display: string;
  position: string;
  layoutHeight: number;
  ownTranslateY: number;
  answerTranslateYs: number[];
  contentFitsPanel: boolean;
  panelFitsCard: boolean;
  animatedProperties: string[];
}

interface FAQMotionObservation {
  phase: "initial" | "mutation" | "frame" | "final";
  time: number;
  panels: FAQPanelObservation[];
}

declare global {
  interface Window {
    __coreFAQMotionProbe?: {
      observer: MutationObserver;
      frame: number;
      observations: FAQMotionObservation[];
      sample: (phase: FAQMotionObservation["phase"]) => void;
    };
  }
}

async function observeToggle(page: Page, key: "Enter" | "Space") {
  await page.evaluate(() => {
    const root = document.querySelector(
      "#faq-contracts [data-slot='accordion']",
    );
    if (!root) throw new Error("FAQ accordion is missing");
    const observations: FAQMotionObservation[] = [];
    const sample = (phase: FAQMotionObservation["phase"]) => {
      const panels = Array.from(
        root.querySelectorAll<HTMLElement>('[role="region"]'),
      ).map((panel) => {
        const style = getComputedStyle(panel);
        const triggerId = panel.getAttribute("aria-labelledby");
        const trigger = triggerId ? document.getElementById(triggerId) : null;
        const bounds = panel.getBoundingClientRect();
        const cardBounds = panel
          .closest("[data-slot='accordion-item']")
          ?.getBoundingClientRect();
        const descendants = Array.from(
          panel.querySelectorAll<HTMLElement>("*"),
        );
        const translateY = (element: Element) => {
          const transform = getComputedStyle(element).transform;
          return transform === "none"
            ? 0
            : new DOMMatrixReadOnly(transform).m42;
        };
        const inFlow =
          style.display !== "none" &&
          style.position !== "absolute" &&
          style.position !== "fixed";
        return {
          id: panel.id,
          expanded: trigger?.getAttribute("aria-expanded") === "true",
          hidden: panel.hidden,
          display: style.display,
          position: style.position,
          layoutHeight: inFlow ? panel.offsetHeight : 0,
          ownTranslateY: translateY(panel),
          answerTranslateYs: descendants.map(translateY),
          contentFitsPanel:
            panel.scrollHeight <= panel.clientHeight + 1 &&
            descendants.every((element) => {
              const childBounds = element.getBoundingClientRect();
              return (
                childBounds.top >= bounds.top - 1 &&
                childBounds.bottom <= bounds.bottom + 1
              );
            }),
          panelFitsCard: Boolean(
            cardBounds &&
            bounds.top >= cardBounds.top - 1 &&
            bounds.bottom <= cardBounds.bottom + 1,
          ),
          animatedProperties: panel
            .getAnimations({ subtree: true })
            .flatMap((animation) => {
              const effect = animation.effect;
              return effect instanceof KeyframeEffect
                ? effect.getKeyframes().flatMap((frame) => Object.keys(frame))
                : [];
            }),
        };
      });
      observations.push({ phase, time: performance.now(), panels });
    };
    const observer = new MutationObserver(() => sample("mutation"));
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
    });
    const probe = { observer, frame: 0, observations, sample };
    window.__coreFAQMotionProbe = probe;
    const frame = () => {
      sample("frame");
      probe.frame = requestAnimationFrame(frame);
    };
    sample("initial");
    probe.frame = requestAnimationFrame(frame);
  });
  await page.keyboard.press(key);
  const observations = await page.evaluate(async () => {
    const probe = window.__coreFAQMotionProbe;
    if (!probe) throw new Error("FAQ motion probe is missing");
    const end = performance.now() + 500;
    await new Promise<void>((resolve) => {
      const settle = () => {
        if (performance.now() >= end) resolve();
        else requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
    });
    probe.sample("final");
    probe.observer.disconnect();
    cancelAnimationFrame(probe.frame);
    delete window.__coreFAQMotionProbe;
    return probe.observations;
  });
  expect(observations.length).toBeGreaterThan(2);
  expect(
    observations.filter((sample) => sample.phase === "frame").length,
  ).toBeGreaterThan(1);
  expect(
    observations.some((sample) =>
      sample.panels.some((panel) => panel.expanded),
    ),
  ).toBe(true);
  for (const sample of observations) {
    expect(
      sample.panels.filter((panel) => panel.layoutHeight > 0).length,
      JSON.stringify(sample),
    ).toBeLessThanOrEqual(1);
    for (const panel of sample.panels) {
      if (!panel.expanded)
        expect(panel.layoutHeight, JSON.stringify(sample)).toBe(0);
      expect(
        Math.abs(panel.ownTranslateY),
        JSON.stringify(sample),
      ).toBeLessThanOrEqual(0.001);
      for (const y of panel.answerTranslateYs)
        expect(Math.abs(y), JSON.stringify(sample)).toBeLessThanOrEqual(0.001);
      expect(panel.animatedProperties, JSON.stringify(sample)).not.toContain(
        "height",
      );
      expect(panel.animatedProperties, JSON.stringify(sample)).not.toContain(
        "width",
      );
      if (panel.layoutHeight > 0) {
        expect(panel.contentFitsPanel, JSON.stringify(sample)).toBe(true);
        expect(panel.panelFitsCard, JSON.stringify(sample)).toBe(true);
      }
    }
  }
  return observations;
}

for (const viewport of [
  { width: 320, height: 820 },
  { width: 1440, height: 1000 },
]) {
  test(`actual FAQ exposes answers, keyboard focus and filtering at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/faq.html");
    await expect(
      page.getByRole("heading", { name: "How can we help?", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/light/);

    const firstName = "How much of my donation actually goes to the field?";
    const secondName = "How do you ensure financial accountability?";
    const first = page.getByRole("button", { name: firstName, exact: true });
    const second = page.getByRole("button", { name: secondName, exact: true });
    const search = page.getByRole("textbox", {
      name: "Search frequently asked questions",
    });

    await expect(first).toHaveAttribute("aria-expanded", "true");
    const firstAnswer = page.getByRole("region", {
      name: firstName,
      exact: true,
    });
    await expect(firstAnswer).toBeVisible();
    await expect(first).toHaveAttribute(
      "aria-controls",
      (await firstAnswer.getAttribute("id")) ?? "",
    );
    await expect(firstAnswer).toContainText("85%");

    await page.keyboard.press("Tab");
    await expect(search).toBeFocused();
    for (const category of [
      "All Questions",
      "Financials",
      "Donations",
      "Partners",
      "My Account",
    ]) {
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("button", { name: category, exact: true }),
      ).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    const focus = await first.evaluate((element) => ({
      focusVisible: element.matches(":focus-visible"),
      boxShadow: getComputedStyle(element).boxShadow,
    }));
    expect(focus.focusVisible).toBe(true);
    expect(focus.boxShadow).not.toBe("none");

    const motionObservations = [];
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    motionObservations.push({
      action: "switch-first-to-second",
      samples: await observeToggle(page, "Space"),
    });
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Shift+Tab");
    await expect(first).toBeFocused();
    motionObservations.push({
      action: "switch-second-to-first",
      samples: await observeToggle(page, "Space"),
    });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");
    motionObservations.push({
      action: "collapse-first",
      samples: await observeToggle(page, "Enter"),
    });
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("region")).toHaveCount(0);
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    motionObservations.push({
      action: "open-second",
      samples: await observeToggle(page, "Space"),
    });
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    const secondAnswer = page.getByRole("region", {
      name: secondName,
      exact: true,
    });
    await expect(secondAnswer).toBeVisible();
    await expect(page.getByRole("region")).toHaveCount(1);
    const panelMotion = await secondAnswer.evaluate((element) => ({
      animationName: getComputedStyle(element).animationName,
      animatedProperties: element
        .getAnimations({ subtree: true })
        .flatMap((animation) => {
          const effect = animation.effect;
          return effect instanceof KeyframeEffect
            ? effect.getKeyframes().flatMap((frame) => Object.keys(frame))
            : [];
        }),
    }));
    expect(panelMotion.animationName).toBe("none");
    expect(panelMotion.animatedProperties).not.toContain("height");
    expect(panelMotion.animatedProperties).not.toContain("width");

    await page.getByRole("button", { name: "My Account", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "My Account", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "All Questions", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(first).toHaveCount(0);
    await search.fill("January 31st");
    await expect(
      page.getByRole("button", {
        name: "Where can I find my year-end tax statement?",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Clear/ }).click();
    await expect(search).toHaveValue("");
    await search.fill("no matching question");
    await expect(
      page.getByRole("heading", { name: "No results found", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "View all questions", exact: true })
      .click();
    await expect(search).toHaveValue("");
    await expect(first).toBeVisible();
    await expect(
      page.getByRole("button", { name: "All Questions", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("link", { name: "Email Support", exact: true }),
    ).toHaveAttribute("href", "/contact");
    await expect(
      page.getByRole("button", { name: "Chat with Us", exact: true }),
    ).toHaveCount(0);

    const geometry = await page.evaluate(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    const axe = await new AxeBuilder({ page })
      .include("#faq-contracts [data-slot='accordion']")
      .analyze();
    expect(axe.violations).toEqual([]);
    const path = testInfo.outputPath("faq-browser-evidence.json");
    await writeFile(
      path,
      JSON.stringify(
        {
          viewport,
          project: testInfo.project.name,
          reducedMotion: await page.evaluate(
            () => matchMedia("(prefers-reduced-motion: reduce)").matches,
          ),
          focus,
          geometry,
          panelMotion,
          motionObservations,
          axeViolations: axe.violations,
          scope:
            "Actual FAQPageClient in an isolated fixture; no production routing or service claims.",
        },
        null,
        2,
      ),
    );
    await testInfo.attach("actual-faq-evidence", {
      path,
      contentType: "application/json",
    });
    const screenshot = testInfo.outputPath("faq.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach("actual-faq", {
      path: screenshot,
      contentType: "image/png",
    });
  });
}
