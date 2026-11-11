import React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

const motionPreference = vi.hoisted(() => ({ reduce: false }));

vi.mock("@asym/lib/motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@asym/lib/motion")>();
  return { ...actual, useReducedMotion: () => motionPreference.reduce };
});

import { PageShell } from "../../../../packages/ui/components/primitives/page-shell";

afterEach(() => {
  motionPreference.reduce = false;
});

function html(reduce: boolean) {
  motionPreference.reduce = reduce;
  return renderToString(
    <PageShell
      title="Welcome back"
      actions={<button type="button">Act</button>}
    >
      <p>Body</p>
    </PageShell>,
  );
}

// The server can't know the visitor's motion preference, so the first client
// render must match whatever the server sent.
it("renders the page header identically with and without reduced motion", () => {
  expect(html(true)).toBe(html(false));
});
