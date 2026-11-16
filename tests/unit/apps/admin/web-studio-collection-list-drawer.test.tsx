// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { NativeCollectionListView } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView";

const fixture = vi.hoisted(() => ({
  isInDrawer: false,
  gridProps: null as Record<string, unknown> | null,
  hasRecord: false,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useListDrawerContext: () => ({ isInDrawer: fixture.isInDrawer }),
    DefaultListView: ({ collectionSlug }: { collectionSlug: string }) => (
      <div data-testid="payload-list">{collectionSlug}</div>
    ),
    useConfig: () => ({
      getEntityConfig: () => ({
        admin: { useAsTitle: "title" },
        fields: [],
        labels: { plural: "Media" },
      }),
    }),
    TableColumnsProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    RelationshipProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    SelectionProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useListQuery: () => ({ data: { docs: [], totalDocs: 0 } }),
  }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid",
  () => ({
    NativeCollectionGrid: (gridProps: Record<string, unknown>) => {
      fixture.gridProps = gridProps;
      return (
        <div data-testid="studio-grid">
          {fixture.hasRecord ? (
            <a href="/record" data-grid-row-primary="">
              First record
            </a>
          ) : null}
        </div>
      );
    },
  }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  async (importOriginal) => {
    const { StudioLayout } =
      await importOriginal<
        typeof import("../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout")
      >();
    return {
      StudioLayout: (props: React.ComponentProps<typeof StudioLayout>) => (
        <div data-testid="studio-shell">
          <StudioLayout {...props} />
        </div>
      ),
    };
  },
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar",
  () => ({ StudioTopBar: () => <a href="/">Shell action</a> }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail",
  () => ({ StudioNavRail: () => <nav /> }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
  fixture.isInDrawer = false;
  fixture.gridProps = null;
  fixture.hasRecord = false;
});

const props = {
  collectionSlug: "media",
  columnState: [],
  hasCreatePermission: true,
  newDocumentURL: "/web-studio/collections/media/create",
  viewType: "list",
} as unknown as React.ComponentProps<typeof NativeCollectionListView>;

it.each([
  ["cms-users", "Users", "New user"],
  ["tenants", "Organizations", "New organization"],
] as const)(
  "uses the shared records grid for %s",
  (collectionSlug, title, createLabel) => {
    render(
      <NativeCollectionListView
        {...props}
        collectionSlug={collectionSlug}
        newDocumentURL={`/web-studio/collections/${collectionSlug}/create`}
      />,
    );
    expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: createLabel }).getAttribute("href"),
    ).toBe(`/web-studio/collections/${collectionSlug}/create`);
    expect(fixture.gridProps).toMatchObject({
      title,
      hasDrafts: false,
      listPath: `/web-studio/collections/${collectionSlug}`,
    });
    expect(screen.getByRole("link", { name: "Skip to records" })).toBeTruthy();
  },
);

it("renders the Studio list page on its own route", () => {
  render(<NativeCollectionListView {...props} />);
  expect(screen.getByTestId("studio-shell")).toBeTruthy();
  expect(screen.getByTestId("studio-grid")).toBeTruthy();
  expect(screen.queryByTestId("payload-list")).toBeNull();
});

it("skips list controls and focuses the records", () => {
  render(<NativeCollectionListView {...props} />);
  const skip = screen.getByRole("link", { name: "Skip to records" });
  const targetId = skip.getAttribute("href")?.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;
  expect(target?.contains(screen.getByTestId("studio-grid"))).toBe(true);
  expect(target?.getAttribute("tabindex")).toBe("-1");
  fireEvent.click(skip);
  expect(document.activeElement).toBe(target);
});

it("puts the skip link before shell controls and focuses the first record", () => {
  fixture.hasRecord = true;
  render(<NativeCollectionListView {...props} />);
  const skip = screen.getByRole("link", { name: "Skip to records" });
  expect(screen.getAllByRole("link")[0]).toBe(skip);
  fireEvent.click(skip);
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "First record" }),
  );
});

it("hands Payload's list drawers its stock list, so rows select instead of navigating", () => {
  fixture.isInDrawer = true;
  render(<NativeCollectionListView {...props} />);
  expect(screen.getByTestId("payload-list").textContent).toBe("media");
  expect(screen.queryByTestId("studio-shell")).toBeNull();
});

it("offers Payload's bulk actions only where its list allows row selection", () => {
  const view = render(<NativeCollectionListView {...props} />);
  expect(fixture.gridProps?.bulk).toBeNull();
  view.unmount();
  render(
    <NativeCollectionListView
      {...props}
      enableRowSelections
      disableBulkEdit
      hasDeletePermission
    />,
  );
  expect(fixture.gridProps?.bulk).toMatchObject({
    disableBulkEdit: true,
    hasDeletePermission: true,
  });
});
