import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
const source = (path: string) =>
  readFileSync(resolve("apps/admin/app/(app)/support", path), "utf8");
it("keeps metadata in server route wrappers", () => {
  for (const route of [
    "page.tsx",
    "reports/agents/page.tsx",
    "reports/inbox/page.tsx",
    "reports/overview/page.tsx",
    "reports/labels/page.tsx",
    "reports/teams/page.tsx",
    "contacts/page.tsx",
    "knowledge/page.tsx",
    "tickets/page.tsx",
    "tickets/new/page.tsx",
    "tickets/[id]/page.tsx",
  ]) {
    expect(source(route)).not.toMatch(/^"use client"/);
    expect(source(route)).toContain("export const metadata");
  }
});
it("loads the current compact four-metric inbox geometry", () => {
  expect(source("loading.tsx")).toContain("SupportInboxSkeleton");
  const skeleton = readFileSync(
    resolve(
      "apps/admin/features/support-hub/components/SupportInboxSkeleton.tsx",
    ),
    "utf8",
  );
  expect(skeleton).toContain('role="status"');
  expect(skeleton).toContain("length: 4");
  expect(skeleton).not.toContain("length: 6");
  expect(skeleton).toContain("@lg:grid-cols-2 @5xl:grid-cols-4");
  expect(skeleton).not.toContain("lg:w-90");
});

it("uses the settings navigation label as the page heading and leaves breadcrumbs to the app shell", () => {
  const shell = readFileSync(
    resolve(
      "apps/admin/features/support-hub/components/workspace/SupportWorkspaceShell.tsx",
    ),
    "utf8",
  );
  expect(shell).toContain("supportPageLabel(pathname)");
  expect(shell).toContain('title={section === "settings" ? leafLabel : title}');
  expect(shell).not.toContain("breadcrumbs=");
  expect(shell).toContain('className="flex min-w-0 flex-1 flex-col gap-4"');
  expect(shell).not.toContain("first-letter:uppercase");
});

it("keeps the agent setup notice above the summary so it cannot split filters from conversations", () => {
  const inbox = readFileSync(
    resolve("apps/admin/features/support-hub/components/SupportInbox.tsx"),
    "utf8",
  );
  expect(inbox.indexOf("<SupportAgentSetupNotice />")).toBeLessThan(
    inbox.indexOf("<StatsStrip />"),
  );
});

it("leaves ticket breadcrumbs to the app shell and keeps one section navigation per page branch", () => {
  for (const route of [
    "tickets/page.tsx",
    "tickets/new/page.tsx",
    "tickets/[id]/page.tsx",
  ]) {
    expect(source(route)).not.toContain("breadcrumbs=");
  }
  expect(
    source("tickets/[id]/page.tsx").match(/<SupportSubNav section="tickets"/g),
  ).toHaveLength(2);
});
