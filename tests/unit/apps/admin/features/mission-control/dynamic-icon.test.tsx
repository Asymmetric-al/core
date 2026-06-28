// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DynamicIcon,
  Globe,
  Settings,
} from "../../../../../../apps/admin/features/mission-control/components/icons";

afterEach(() => {
  cleanup();
});

describe("DynamicIcon", () => {
  it("renders icon components passed directly", () => {
    const { container } = render(
      <DynamicIcon name={Globe} className="direct-icon" />,
    );

    expect(container.querySelector("svg.lucide-globe")).toBeTruthy();
    expect(container.querySelector("svg.direct-icon")).toBeTruthy();
  });

  it("falls back to Settings for unknown string names", () => {
    const { container } = render(<DynamicIcon name="NotARealIcon" />);

    expect(container.querySelector("svg.lucide-settings")).toBeTruthy();
    expect(container.querySelector("svg.lucide-globe")).toBeNull();
  });

  it("falls back to Settings for empty or null string names", () => {
    const empty = render(<DynamicIcon name="" />);
    expect(empty.container.querySelector("svg.lucide-settings")).toBeTruthy();
    empty.unmount();

    const missing = render(
      <DynamicIcon name={null as unknown as string} />,
    );
    expect(missing.container.querySelector("svg.lucide-settings")).toBeTruthy();
    missing.unmount();
  });

  it("does not treat Settings fallback as a dynamic import", () => {
    const { container } = render(<DynamicIcon name={Settings} />);

    expect(container.querySelector("svg.lucide-settings")).toBeTruthy();
  });
});
