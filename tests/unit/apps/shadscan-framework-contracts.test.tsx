/** @vitest-environment jsdom */

import fs from "node:fs";
import path from "node:path";

import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminError from "../../../apps/admin/app/global-error";
import AdminNotFound from "../../../apps/admin/app/global-not-found";
import DonorError from "../../../apps/donor/app/global-error";
import DonorNotFound from "../../../apps/donor/app/global-not-found";
import MissionaryError from "../../../apps/missionary/app/global-error";
import MissionaryNotFound from "../../../apps/missionary/app/global-not-found";
import { Toaster } from "../../../packages/ui/components/shadcn/sonner";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";

afterEach(() => {
  cleanup();
  toast.dismiss();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("Shadscan shared runtime and framework conventions", () => {
  it("mounts the actual shared notification runtime with a live announcement channel", () => {
    const { baseElement } = render(<Toaster theme="light" />);
    expect(baseElement.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it("keeps shared notifications light inside the application's forced-light provider", async () => {
    localStorage.setItem("donor-theme", "dark");
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }));
    const { baseElement } = render(
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        storageKey="donor-theme"
      >
        <Toaster />
      </ThemeProvider>,
    );
    act(() => {
      toast.success("Saved successfully");
    });
    await screen.findByText("Saved successfully");
    expect(
      baseElement
        .querySelector("[data-sonner-toaster]")
        ?.getAttribute("data-sonner-theme"),
    ).toBe("light");
  });

  it.each(["admin", "donor", "missionary"])(
    "%s uses the shared toaster and global not-found framework convention",
    (app) => {
      const layout = fs.readFileSync(
        path.join(process.cwd(), "apps", app, "app/layout.tsx"),
        "utf8",
      );
      const config = fs.readFileSync(
        path.join(process.cwd(), "apps", app, "next.config.ts"),
        "utf8",
      );
      expect(layout).toContain('from "@asym/ui/components/shadcn/sonner"');
      expect(layout).toContain("<Toaster />");
      expect(layout.indexOf("<Toaster />")).toBeLessThan(
        layout.lastIndexOf("</ThemeProvider>"),
      );
      expect(config).toMatch(/globalNotFound:\s*true/);
    },
  );

  it.each([
    ["admin", AdminError],
    ["donor", DonorError],
    ["missionary", MissionaryError],
  ] as const)(
    "%s global error renders a named recovery action",
    (_app, Boundary) => {
      const document = new DOMParser().parseFromString(
        renderToStaticMarkup(
          <Boundary
            error={new Error("Fixture failure")}
            reset={() => undefined}
          />,
        ),
        "text/html",
      );
      expect(document.querySelector("h1")?.textContent).toBeTruthy();
      expect(document.querySelector("button")?.textContent).toContain(
        "Try again",
      );
    },
  );

  it.each([
    ["admin", AdminNotFound],
    ["donor", DonorNotFound],
    ["missionary", MissionaryNotFound],
  ] as const)(
    "%s global not-found renders usable navigation recovery",
    (_app, Boundary) => {
      const document = new DOMParser().parseFromString(
        renderToStaticMarkup(<Boundary />),
        "text/html",
      );
      const recovery = document.querySelector("a[href]");
      expect(document.querySelector("h1")?.textContent).toContain("not found");
      expect(recovery?.getAttribute("href")).toMatch(/^\//);
      expect(recovery?.textContent?.trim()).toBeTruthy();
    },
  );
});
