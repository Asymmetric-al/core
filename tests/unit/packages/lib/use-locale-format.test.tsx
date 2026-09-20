/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  SERVER_FORMAT_ENVIRONMENT,
  createLocaleFormatters,
  useLocaleFormat,
} from "../../../../packages/lib/hooks/use-locale-format";

afterEach(() => {
  cleanup();
});

describe("createLocaleFormatters (server environment)", () => {
  const formatters = createLocaleFormatters(SERVER_FORMAT_ENVIRONMENT, false);

  it("formats in en-US/UTC regardless of the host time zone", () => {
    // 23:30 UTC on Jan 5 is already Jan 6 east of UTC+0:30 and Jan 5 in the US.
    expect(formatters.formatDate("2026-01-05T23:30:00Z")).toBe("1/5/2026");
    expect(formatters.formatDateTime("2026-01-05T23:30:00Z")).toBe(
      "1/5/2026, 11:30:00 PM",
    );
    expect(formatters.formatTime("2026-01-05T23:30:00Z")).toBe("11:30:00 PM");
  });

  it("honors caller options and keeps an explicit time zone", () => {
    expect(
      formatters.formatDate("2026-01-05T23:30:00Z", {
        month: "short",
        day: "numeric",
      }),
    ).toBe("Jan 5");
    expect(
      formatters.formatDate("2026-01-05T23:30:00Z", {
        month: "short",
        day: "numeric",
        timeZone: "Asia/Tokyo",
      }),
    ).toBe("Jan 6");
  });

  it("mirrors Date#toLocaleDateString for invalid input instead of throwing", () => {
    expect(formatters.formatDate("not a date")).toBe("Invalid Date");
  });

  it("reuses formatter instances for identical options", () => {
    const options = { dateStyle: "medium" } as const;
    expect(formatters.dateTimeFormat(options)).toBe(
      formatters.dateTimeFormat({ ...options }),
    );
  });
});

function Stamp({ value }: { value: string }) {
  const { formatDate, hydrated } = useLocaleFormat();
  return (
    <span data-hydrated={String(hydrated)}>
      {formatDate(value, { timeZone: "UTC" })}
    </span>
  );
}

describe("useLocaleFormat", () => {
  it("renders the deterministic server text during SSR", () => {
    const html = renderToString(<Stamp value="2026-01-05T23:30:00Z" />);
    expect(html).toContain('data-hydrated="false"');
    expect(html).toContain("1/5/2026");
  });

  it("switches to the visitor environment once the client owns the tree", () => {
    render(<Stamp value="2026-01-05T23:30:00Z" />);
    const stamp = screen.getByText("1/5/2026");
    expect(stamp.getAttribute("data-hydrated")).toBe("true");
  });
});
