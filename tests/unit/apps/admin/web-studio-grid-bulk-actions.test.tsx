// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GridBulkActions } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/grid-bulk-actions";

type DeleteManyResult = Record<
  string,
  {
    deletedCount: number;
    errors: unknown[] | null;
    ids: Array<number | string>;
    totalCount?: number;
  }
>;

const fixture = vi.hoisted(() => ({
  toggleAll: vi.fn(),
  nextResult: undefined as DeleteManyResult | undefined,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useListQuery: () => ({ query: {} }),
    useSelection: () => ({
      count: 1,
      selectAll: "some",
      selectedIDs: [101],
      toggleAll: fixture.toggleAll,
    }),
    EditMany: () => null,
    PublishMany: () => null,
    UnpublishMany: () => null,
    DeleteMany: ({
      afterDelete,
    }: {
      afterDelete?: (result?: DeleteManyResult) => void;
    }) => (
      <button
        type="button"
        onClick={() => {
          afterDelete?.(fixture.nextResult);
        }}
      >
        Trigger afterDelete
      </button>
    ),
  }),
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fixture.nextResult = undefined;
});

describe("GridBulkActions bulk delete outcome handling (WP6 part 2a)", () => {
  const bulk = {
    collection: { slug: "pages" } as never,
    hasDeletePermission: true,
  };

  it("calls neither clearSelection nor onDeleted when bulk delete is refused with errors", () => {
    const onDeleted = vi.fn();
    fixture.nextResult = {
      pages: {
        deletedCount: 0,
        errors: [
          {
            message:
              "This page was opened for a different organization. Reload the page to continue; nothing was saved.",
          },
        ],
        ids: [],
        totalCount: 0,
      },
    };

    render(<GridBulkActions bulk={bulk} onDeleted={onDeleted} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Trigger afterDelete" }),
    );

    expect(fixture.toggleAll).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("calls neither clearSelection nor onDeleted when bulk delete deletes zero documents", () => {
    const onDeleted = vi.fn();
    fixture.nextResult = {
      pages: {
        deletedCount: 0,
        errors: [],
        ids: [],
        totalCount: 0,
      },
    };

    render(<GridBulkActions bulk={bulk} onDeleted={onDeleted} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Trigger afterDelete" }),
    );

    expect(fixture.toggleAll).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("clears selection and notifies onDeleted when bulk delete deletes documents without errors", () => {
    const onDeleted = vi.fn();
    fixture.nextResult = {
      pages: {
        deletedCount: 1,
        errors: [],
        ids: [101],
        totalCount: 1,
      },
    };

    render(<GridBulkActions bulk={bulk} onDeleted={onDeleted} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Trigger afterDelete" }),
    );

    expect(fixture.toggleAll).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });
});
