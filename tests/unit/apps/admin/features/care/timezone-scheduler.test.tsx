// @vitest-environment jsdom

import { act, cleanup } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TimezoneScheduler } from "../../../../../../apps/admin/features/mission-control/care/components/TimezoneScheduler";

let root: Root | undefined;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(new Date("2026-10-08T10:20:30Z"));
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  cleanup();
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe("TimezoneScheduler clock", () => {
  it("hydrates from placeholders, shows time immediately, ticks each second and cleans up", async () => {
    const scheduler = (
      <TimezoneScheduler remoteTimezone="UTC" remoteName="Partner" />
    );
    const serverHtml = renderToString(scheduler);
    expect(serverHtml.match(/--:--:-- --/g)).toHaveLength(2);
    expect(serverHtml).toContain("Outside Working Hours");
    expect(vi.getTimerCount()).toBe(0);

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.append(container);
    const hydrationErrors: unknown[] = [];

    await act(async () => {
      root = hydrateRoot(container, scheduler, {
        onRecoverableError: (error) => hydrationErrors.push(error),
      });
    });

    expect(hydrationErrors).toEqual([]);
    expect(container.textContent).not.toContain("--:--:-- --");
    expect(container.textContent).toContain("10:20:30 AM");
    expect(container.textContent).toContain("Within Working Hours");

    await act(async () => vi.advanceTimersByTime(1000));
    expect(container.textContent).toContain("10:20:31 AM");
    expect(container.textContent).not.toContain("10:20:30 AM");

    await act(async () => root?.unmount());
    root = undefined;
    expect(vi.getTimerCount()).toBe(0);
  });
});
