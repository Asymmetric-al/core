import React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const motionPreference = vi.hoisted(() => ({ reduce: false }));

vi.mock("@asym/lib/motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@asym/lib/motion")>();
  return { ...actual, useReducedMotion: () => motionPreference.reduce };
});

import { DemoOnlyLoginCard } from "../../../../packages/ui/components/auth/DemoOnlyLoginCard";
import { FullLoginCard } from "../../../../packages/ui/components/auth/FullLoginCard";

afterEach(() => {
  motionPreference.reduce = false;
});

function html(reduce: boolean, card: React.ReactElement) {
  motionPreference.reduce = reduce;
  return renderToString(card);
}

const full = (
  <FullLoginCard
    title="Sign in"
    email=""
    password=""
    onEmailChange={() => {}}
    onPasswordChange={() => {}}
    onSubmit={() => {}}
  />
);

describe("sign-in cards hydrate the same way for every motion preference", () => {
  // The server can't know the visitor's motion preference, so the first
  // client render must match whatever the server sent.
  it("renders the full sign-in card identically with and without reduced motion", () => {
    expect(html(true, full)).toBe(html(false, full));
  });

  it("renders the demo sign-in card identically with and without reduced motion", () => {
    const demo = <DemoOnlyLoginCard title="Sign in" onDemoLogin={() => {}} />;
    expect(html(true, demo)).toBe(html(false, demo));
  });
});
