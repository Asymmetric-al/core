/** @vitest-environment jsdom */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AboutPage from "../../../../apps/donor/app/(public)/(hero)/about/page";
import { ViewTransitionRouteLayerContext } from "../../../../packages/lib/view-transitions";

import type { ImageProps } from "next/image";

// Image transport is outside these semantic/content assertions. The browser
// regression and actual-font audit retain the installed Next Image component.
vi.mock("next/image", () => ({
  default: ({ src, alt, sizes }: ImageProps) => (
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      sizes={sizes}
    />
  ),
}));

function renderAbout() {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<AboutPage />);
  return container;
}

describe("public About route", () => {
  for (const withinRouteLayer of [false, true]) {
    it(`uses ${withinRouteLayer ? "the route transition" : "its own entrances"} for About motion`, () => {
      const container = document.createElement("div");
      container.innerHTML = renderToStaticMarkup(
        <ViewTransitionRouteLayerContext.Provider value={withinRouteLayer}>
          <AboutPage />
        </ViewTransitionRouteLayerContext.Provider>,
      );
      const entrances = [
        ...container.querySelectorAll<HTMLElement>('[style*="opacity:"]'),
      ];
      expect(entrances.length).toBeGreaterThan(0);
      expect(
        entrances.every(
          (node) => node.style.opacity === (withinRouteLayer ? "1" : "0"),
        ),
      ).toBe(true);
    });
  }

  it("provides the unique focusable main target used by the public skip link", () => {
    const container = renderAbout();
    const main = container.querySelector("main#main-content");
    expect(main).not.toBeNull();
    expect(main?.getAttribute("tabindex")).toBe("-1");
    expect(main?.getAttribute("data-testid")).toBe("about-route-shell");
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelectorAll("#main-content")).toHaveLength(1);
  });

  it("preserves the five sections, editorial content and checkout destination", () => {
    const route = renderAbout().querySelector(
      '[data-testid="about-route-shell"]',
    )!;
    expect(route.querySelectorAll(":scope > section")).toHaveLength(5);
    expect(
      [...route.querySelectorAll("h1,h2")].map((node) =>
        node.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual([
      "Engineered Restoration.",
      "Hope as Infrastructure.",
      "Operational Principles.",
      "Trustees of Hope.",
      "Join the Method.",
    ]);
    expect(
      [...route.querySelectorAll("h3")].map((node) => node.textContent),
    ).toEqual([
      "Precision",
      "Partnership",
      "Integrity",
      "Dignity",
      "Dr. Elena Rostova",
      "Marcus Chen",
      "Sarah O'Connell",
    ]);
    expect(route.textContent).toContain("100% Direct-");
    expect(
      [...route.querySelectorAll("a")].map((node) => [
        node.textContent,
        node.getAttribute("href"),
      ]),
    ).toEqual([
      ["Explore the Frontlines", "/workers"],
      ["View Directory", "/workers"],
      ["Support Urgent Needs", "/checkout?fund=general"],
    ]);
    const breadcrumb = JSON.parse(
      route.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(
      breadcrumb.itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["Home", "About"]);
  });

  it("preserves image sources, meaningful alternatives and responsive sizes", () => {
    const images = [...renderAbout().querySelectorAll("img")].map((node) => ({
      src: node.getAttribute("src"),
      alt: node.alt,
      sizes: node.sizes,
    }));
    expect(images).toEqual([
      {
        src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000",
        alt: "Community members gathering together",
        sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
      },
      {
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&fit=crop",
        alt: "Dr. Elena Rostova, Executive Director at GiveHope",
        sizes: "(max-width: 768px) 100vw, 25vw",
      },
      {
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&fit=crop",
        alt: "Marcus Chen, Director of Field Ops at GiveHope",
        sizes: "(max-width: 768px) 100vw, 25vw",
      },
      {
        src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&fit=crop",
        alt: "Sarah O'Connell, Head of Finance at GiveHope",
        sizes: "(max-width: 768px) 100vw, 25vw",
      },
    ]);
  });
});
