// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";

import { ViewerDate } from "../../../../apps/admin/src/cms-ui/web-studio/shell/viewer-date";

afterEach(cleanup);

const VALUE = "2026-11-07T21:06:00.000Z";
const OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
} as const;

it("renders an explicit UTC time on the server, never the server's own zone", () => {
  const html = renderToString(<ViewerDate value={VALUE} options={OPTIONS} />);
  expect(html).toContain(`dateTime="${VALUE}"`);
  expect(html).toContain("Nov 7, 2026, 9:06 PM UTC");
});

it("shows the viewer's own time zone once in the browser", () => {
  render(<ViewerDate value={VALUE} options={OPTIONS} />);
  const time = screen.getByText((_, element) => element?.tagName === "TIME");
  expect(time.textContent).toBe(
    new Intl.DateTimeFormat("en-US", OPTIONS).format(new Date(VALUE)),
  );
  expect(time.getAttribute("dateTime")).toBe(VALUE);
  // The full value stays available on hover.
  expect(time.getAttribute("title")).toBeTruthy();
});

it("renders nothing for a value that is not a date", () => {
  const view = render(<ViewerDate value="not a date" options={OPTIONS} />);
  expect(view.container.querySelector("time")).toBeNull();
});
