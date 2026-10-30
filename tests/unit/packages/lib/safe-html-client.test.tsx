// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SafeHtml } from "../../../../packages/lib/components/safe-html";

describe("safe rich HTML in a client DOM", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the HTML fixture"),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("removes executable markup and encoded protocols while preserving formatted content and styles", () => {
    const { container } = render(
      <SafeHtml
        className="prose"
        html={
          '<p StYlE="color: red"><strong>Giving</strong> &amp; care <a href="https://example.test/details">details</a><a href="jav&#x61;script:alert(1)" onclick="alert(1)">unsafe link</a></p><script>alert(1)</script><iframe srcdoc="<script>alert(1)</script>"></iframe><svg onload="alert(1)"></svg><math><mi>x</mi></math>'
        }
      />,
    );

    expect(container.querySelector("strong")?.textContent).toBe("Giving");
    expect(container.querySelector("p")?.style.color).toBe("red");
    expect(
      container.querySelector('a[href="https://example.test/details"]')
        ?.textContent,
    ).toBe("details");
    expect(container.querySelectorAll("a")[1]?.hasAttribute("href")).toBe(
      false,
    );
    expect(
      container.querySelector("script, iframe, svg, math, [onclick], [onload]"),
    ).toBeNull();
    expect(container.firstElementChild?.className).toBe("prose");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("re-sanitizes replacement content without retaining an old executable attribute", () => {
    const { container, rerender } = render(<SafeHtml html="<p>Before</p>" />);
    rerender(
      <SafeHtml html='<p>After<img src="javascript:alert(1)" onerror="alert(1)"></p>' />,
    );

    expect(container.textContent).toBe("After");
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("img")?.hasAttribute("src")).toBe(false);
    expect(container.querySelector("[onerror]")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
