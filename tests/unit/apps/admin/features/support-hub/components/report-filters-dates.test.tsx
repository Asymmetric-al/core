// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ReportFilters } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters";
// nuqs is installed in the admin workspace, not hoisted to the repo root.
import { NuqsTestingAdapter } from "../../../../../../../apps/admin/node_modules/nuqs/dist/adapters/testing.js";

const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  // 01:45 on 10 November in Bangkok (UTC+7) is still 9 November in UTC.
  process.env.TZ = "Asia/Bangkok";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-09T18:45:00.000Z"));
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.useRealTimers();
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

function renderFilters(searchParams = "") {
  return render(
    <NuqsTestingAdapter searchParams={searchParams}>
      <ReportFilters hideScope />
    </NuqsTestingAdapter>,
  );
}

describe("ReportFilters dates", () => {
  it("defaults To to the viewer's today, not the UTC date", () => {
    renderFilters();
    const to = screen.getByLabelText("To") as HTMLInputElement;
    const from = screen.getByLabelText("From") as HTMLInputElement;
    expect(to.value).toBe("2026-11-10");
    expect(from.value).toBe("2026-10-11");
  });

  it("shows a linked window as the local days it covers", () => {
    renderFilters("?from=2026-10-31T17:00:00.000Z&to=2026-11-07T17:00:00.000Z");
    const to = screen.getByLabelText("To") as HTMLInputElement;
    const from = screen.getByLabelText("From") as HTMLInputElement;
    expect(from.max).toBe(to.value);
    expect(to.min).toBe(from.value);
    expect(from.value).toBe("2026-11-01");
    expect(to.value).toBe("2026-11-07");
  });
});
