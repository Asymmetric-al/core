import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ViewTransitionRouteLayerContext } from "../../../../packages/lib/view-transitions";
import { PageShell } from "../../../../packages/ui/components/primitives/page-shell";

function renderShell(withinRouteViewTransition = false) {
  return renderToString(
    <ViewTransitionRouteLayerContext value={withinRouteViewTransition}>
      <PageShell
        title="Contributions"
        description="Every gift"
        actions={<button type="button">Export</button>}
      >
        <p>Body</p>
      </PageShell>
    </ViewTransitionRouteLayerContext>,
  );
}

function headerTag(html: string) {
  return html.match(/<div[^>]*data-slot="page-shell-header"[^>]*>/)?.[0];
}

/**
 * The server HTML is what people see before JavaScript runs (and what the
 * instant shell shows during navigation), so the page title and its actions
 * must be readable there instead of waiting for hydration to fade them in.
 */
describe("PageShell first paint", () => {
  it("never hides the header or its actions with inline styles", () => {
    const html = renderShell();
    expect(html).toContain("Contributions");
    expect(html).toContain("Export");
    expect(html).not.toMatch(/style="[^"]*opacity:\s*0/);
    expect(html).not.toMatch(/style="[^"]*transform/);
  });

  it("keeps the entrance in CSS, skipped for reduced motion", () => {
    const header = headerTag(renderShell());
    expect(header).toBeDefined();
    expect(header).toMatch(/motion-safe:animate-in/);
    expect(header).not.toMatch(/(?<!motion-safe:)\banimate-in/);
  });

  it("leaves the entrance to a route view transition when one wraps the page", () => {
    const header = headerTag(renderShell(true));
    expect(header).toBeDefined();
    expect(header).not.toMatch(/animate-in/);
  });
});
