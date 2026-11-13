// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { usePlatformModifierLabel } from "../../../../apps/admin/features/studios/use-platform-modifier";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each([
  ["Win32", "Ctrl"],
  ["Linux x86_64", "Ctrl"],
  ["MacIntel", "⌘"],
])("labels shortcuts for %s", (platform, expected) => {
  vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
  expect(renderHook(usePlatformModifierLabel).result.current).toBe(expected);
});
it("uses a stable server label before detecting the browser platform", () => {
  vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
  function Label() {
    return <span>{usePlatformModifierLabel()}</span>;
  }
  expect(renderToString(<Label />)).toBe("<span>Ctrl</span>");
});
