// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { STUDIO_DOCUMENT_TAB_COMPONENT } from "../../../../apps/admin/src/cms-ui/web-studio/shell/document-tabs";
import { StudioDocumentTab } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-document-tab";

import type { DocumentTabServerProps } from "payload";
import type { ReactNode } from "react";

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    DocumentTabLink: ({
      adminRoute,
      baseClass,
      children,
      href,
    }: {
      adminRoute: string;
      baseClass: string;
      children?: ReactNode;
      href: string;
    }) => (
      <a className={baseClass} href={`${adminRoute}/doc${href}`}>
        {children}
      </a>
    ),
    VersionsPill: () => <span data-testid="versions-pill">3</span>,
  }),
);

afterEach(cleanup);

type EditViews = Record<
  string,
  { Component?: string; tab?: { Component?: string } } | undefined
>;
type CollectionWithViews = {
  admin?: { components?: { views?: { edit?: EditViews } } };
};

const COLLECTIONS = [
  ["media", "Media"],
  ["ministry-updates", "MinistryUpdates"],
  ["missionary-giving-pages", "MissionaryGivingPages"],
  ["missionary-profiles", "MissionaryProfiles"],
  ["navigation", "Navigation"],
  ["page-templates", "PageTemplates"],
  ["pages", "Pages"],
  ["project-pages", "ProjectPages"],
] as const;

const editViews = new Map<string, EditViews | undefined>();

beforeAll(async () => {
  for (const [file, exportName] of COLLECTIONS) {
    const mod = (await import(
      `../../../../apps/admin/src/cms/collections/${file}.ts`
    )) as Record<string, CollectionWithViews>;
    editViews.set(file, mod[exportName]?.admin?.components?.views?.edit);
  }
});

const t = (key: string) =>
  ({ "general:edit": "Edit", "version:versions": "Versions" })[key] ?? key;

function tabProps(path: string): DocumentTabServerProps {
  return {
    path,
    permissions: {},
    req: {
      i18n: { t },
      payload: { config: { routes: { admin: "/web-studio" } } },
    },
  } as unknown as DocumentTabServerProps;
}

function renderInTabList(path: string) {
  return render(
    <ul data-testid="tabs">{StudioDocumentTab(tabProps(path))}</ul>,
  );
}

describe("Studio document tabs", () => {
  it.each(COLLECTIONS.map(([file]) => file))(
    "%s renders its Edit, Versions and API tabs with the Studio tab",
    (file) => {
      const edit = editViews.get(file);
      expect(edit?.default?.Component).toMatch(/NativeEditView/);
      for (const view of ["default", "versions", "api"]) {
        expect(edit?.[view]?.tab?.Component, `${file} ${view}`).toBe(
          STUDIO_DOCUMENT_TAB_COMPONENT,
        );
      }
      // Payload keeps its stock Versions and API views only while these
      // entries carry no `Component` key.
      expect(edit?.versions).not.toHaveProperty("Component");
      expect(edit?.api).not.toHaveProperty("Component");
    },
  );

  it.each([
    ["/", "Edit", "/web-studio/doc"],
    ["/versions", "Versions", "/web-studio/doc/versions"],
    ["/api", "API", "/web-studio/doc/api"],
  ])(
    "renders the %s tab as a list item holding its link",
    (path, label, href) => {
      renderInTabList(path);
      const list = screen.getByTestId("tabs");
      expect([...list.children].map((child) => child.tagName)).toEqual(["LI"]);
      const link = screen.getByRole("link", { name: new RegExp(`^${label}`) });
      expect(link.getAttribute("href")).toBe(href);
      expect(link.closest("li")).not.toBeNull();
    },
  );

  it("shows the version count pill only on the Versions tab", () => {
    renderInTabList("/versions");
    expect(screen.getByTestId("versions-pill")).toBeTruthy();
    cleanup();
    renderInTabList("/api");
    expect(screen.queryByTestId("versions-pill")).toBeNull();
  });

  it("renders nothing for a view it does not know", () => {
    renderInTabList("/unknown");
    expect(screen.getByTestId("tabs").children).toHaveLength(0);
  });

  it("keeps the stock tab colors for tabs drawn in list items", () => {
    const css = readFileSync(
      path.join(
        process.cwd(),
        "apps/admin/src/cms-ui/web-studio/shell/studio-stock-views.css",
      ),
      "utf8",
    ).replace(/\s+/g, " ");
    expect(css).toContain(
      ".doc-tabs__tabs > li > .btn { color: var(--color-text-secondary);",
    );
    expect(css).toMatch(
      /\.doc-tabs__tabs > li > \.btn:hover, \.doc-tabs__tabs > li > \.btn--style-pill \{ color: var\(--color-text\);/,
    );
  });
});
