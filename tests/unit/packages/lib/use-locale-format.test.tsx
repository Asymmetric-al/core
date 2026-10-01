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

const DATE_ONLY = "2026-01-05";
const EVENING_UTC = "2026-01-05T23:30:00Z";
const INSTANT = "2026-01-06T05:00:00.000Z";

const VISITOR_LA_ENVIRONMENT = {
  locale: "en-US",
  timeZone: "America/Los_Angeles",
} as const;

describe("createLocaleFormatters (server environment)", () => {
  const formatters = createLocaleFormatters(SERVER_FORMAT_ENVIRONMENT, false);

  it("formats in en-US/UTC regardless of the host time zone", () => {
    // 23:30 UTC on Jan 5 is already Jan 6 east of UTC+0:30 and Jan 5 in the US.
    expect(formatters.formatDate(EVENING_UTC)).toBe("1/5/2026");
    expect(formatters.formatDateTime(EVENING_UTC)).toBe(
      "1/5/2026, 11:30:00 PM",
    );
    expect(formatters.formatTime(EVENING_UTC)).toBe("11:30:00 PM");
  });

  it("keeps a date-only YYYY-MM-DD on its calendar day without a caller time zone", () => {
    expect(formatters.formatDate(DATE_ONLY)).toBe("1/5/2026");
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
});

describe("createLocaleFormatters (visitor America/Los_Angeles)", () => {
  const formatters = createLocaleFormatters(VISITOR_LA_ENVIRONMENT, true);

  it("keeps a date-only YYYY-MM-DD on its calendar day after the visitor-TZ switch", () => {
    // new Date("2026-01-05") is UTC midnight; LA must not roll that back to Jan 4.
    expect(formatters.formatDate(DATE_ONLY)).toBe("1/5/2026");
  });

  it("still projects instants and date-times into the visitor time zone", () => {
    expect(formatters.formatDate(INSTANT)).toBe("1/5/2026");
    expect(formatters.formatDateTime(INSTANT)).toBe("1/5/2026, 9:00:00 PM");
    expect(formatters.formatTime(INSTANT)).toBe("9:00:00 PM");
    expect(formatters.formatDate(EVENING_UTC)).toBe("1/5/2026");
    expect(formatters.formatDateTime(EVENING_UTC)).toBe("1/5/2026, 3:30:00 PM");
  });

  it("honors an explicit time zone on a date-only value", () => {
    expect(
      formatters.formatDate(DATE_ONLY, { timeZone: "America/Los_Angeles" }),
    ).toBe("1/4/2026");
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

function DateOnlyStamp({ value }: { value: string }) {
  const { formatDate, hydrated } = useLocaleFormat();
  return (
    <span data-hydrated={String(hydrated)} data-kind="date-only">
      {formatDate(value)}
    </span>
  );
}

describe("useLocaleFormat", () => {
  it("renders the deterministic server text during SSR", () => {
    const html = renderToString(<Stamp value={EVENING_UTC} />);
    expect(html).toContain('data-hydrated="false"');
    expect(html).toContain("1/5/2026");
  });

  it("renders a date-only YYYY-MM-DD without a caller time zone", () => {
    const html = renderToString(<DateOnlyStamp value={DATE_ONLY} />);
    expect(html).toContain('data-hydrated="false"');
    expect(html).toContain("1/5/2026");
  });

  it("switches to the visitor environment once the client owns the tree", () => {
    render(<Stamp value={EVENING_UTC} />);
    const stamp = screen.getByText("1/5/2026");
    expect(stamp.getAttribute("data-hydrated")).toBe("true");
  });
});
