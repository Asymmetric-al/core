import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TimeAgo } from "../../../../packages/lib/hooks/use-time-ago";

const DATE_ONLY = "2026-01-05";
const INSTANT = "2026-01-06T05:00:00.000Z";

describe("TimeAgo SSR", () => {
  it("uses the UTC snapshot so instants do not follow the host zone", () => {
    const html = renderToString(<TimeAgo date={INSTANT} />);
    expect(html).toContain("Jan 6");
  });

  it("keeps a date-only YYYY-MM-DD on its calendar day", () => {
    const html = renderToString(<TimeAgo date={DATE_ONLY} />);
    expect(html).toContain("Jan 5");
  });
});
