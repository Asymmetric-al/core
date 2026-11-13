// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

// Defer the app entrypoint until the Next boundaries are mocked.
const [{ default: WorkerProfilePage }, { getFieldWorkers }] = await Promise.all(
  [
    import("../../../../apps/donor/app/(public)/(solid)/workers/[id]/page"),
    import("../../../../apps/donor/lib/mock-data"),
  ],
);

vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

// Public worker profiles render static demo data, so the page must say so
// rather than present its story, verification and funding figures as live.
it("labels the public worker profile as sample content", async () => {
  const worker = getFieldWorkers()[0]!;
  const html = renderToStaticMarkup(
    await WorkerProfilePage({ params: Promise.resolve({ id: worker.id }) }),
  );
  const root = document.createElement("div");
  root.innerHTML = html;
  const note = root.querySelector('[role="note"]');
  expect(note?.textContent).toContain("Sample profile");
  expect(note?.textContent).toContain("funding progress");
  // The hero shows a "Verified" badge; the notice must cover it too.
  expect(note?.textContent).toContain("Verified");
  // Every fact on the profile is demo data, not only the fields listed.
  expect(note?.textContent).toContain("Everything on this profile");
});
