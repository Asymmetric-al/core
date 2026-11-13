// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  Fragment,
  StrictMode,
  Suspense,
  memo,
  startTransition,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTable } from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import {
  DataGrid,
  dataGridFeatures,
  useDataGrid,
  useDataGridAtom,
} from "../../../../packages/ui/components/reui/data-grid/data-grid";

import type { DataGridColumnDef } from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import type { DataGridContextProps } from "../../../../packages/ui/components/reui/data-grid/data-grid";

interface Person {
  id: string;
  name: string;
}

const COMMITTED_ROWS: Person[] = [
  { id: "committed", name: "Committed person" },
];
const PENDING_ROWS: Person[] = [{ id: "pending", name: "Pending person" }];
const COLUMNS: DataGridColumnDef<Person>[] = [{ accessorKey: "name" }];
const COMMITTED_OPTIONS = {
  features: dataGridFeatures,
  data: COMMITTED_ROWS,
  columns: COLUMNS,
};
const PENDING_OPTIONS = {
  features: dataGridFeatures,
  data: PENDING_ROWS,
  columns: COLUMNS,
};
const COMMITTED_AUTO_OPTIONS = {
  ...COMMITTED_OPTIONS,
  columns: [
    {
      accessorKey: "name",
      id: "committed",
      size: 100,
      meta: { autoSize: true },
    },
  ],
};
const PENDING_AUTO_OPTIONS = {
  ...PENDING_OPTIONS,
  columns: [
    { accessorKey: "name", id: "pending", size: 100, meta: { autoSize: true } },
  ],
};

function createPendingWork() {
  let resolve: () => void = () => {};
  let ready = false;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return {
    read() {
      if (!ready) throw promise;
    },
    resolve() {
      ready = true;
      resolve();
    },
  };
}

function readContext(context: DataGridContextProps<Person>) {
  return {
    context,
    table: context.table,
    props: context.props,
    i18n: context.i18n,
    recordCount: context.recordCount,
    isLoading: context.isLoading,
  };
}

function ContextConsumer({
  onRead,
  onCommit,
}: {
  onRead: (snapshot: ReturnType<typeof readContext>) => void;
  onCommit?: (snapshot: ReturnType<typeof readContext>) => void;
}) {
  const context = useDataGrid<Person>();
  useLayoutEffect(() => {
    onCommit?.(readContext(context));
  });
  return (
    <>
      <output aria-label="Rendered grid snapshot">
        {context.table.options.data[0]?.name}:{context.props.emptyMessage}:
        {context.i18n.labels.empty}:{context.recordCount}:
        {String(context.isLoading)}
      </output>
      <button
        type="button"
        onClick={() => {
          onRead(readContext(context));
          const person = context.table.options.data[0];
          if (person) context.props.onRowClick?.(person);
        }}
      >
        Read committed context
      </button>
    </>
  );
}

const MemoizedContextConsumer = memo(ContextConsumer);

function ColumnSizingConsumer() {
  const { table } = useDataGrid<Person>();
  const size = useDataGridAtom(
    table.atoms.columnSizing,
    (sizing) => sizing?.name ?? 0,
  );
  return <output aria-label="Live column size">{size}</output>;
}

function SuspendGrid({
  work,
  onSuspend,
}: {
  work: ReturnType<typeof createPendingWork>;
  onSuspend: () => void;
}) {
  onSuspend();
  work.read();
  return null;
}

function SuspendedGrid({
  work,
  onRead,
  onSuspend,
  onCommittedRowClick,
  onPendingRowClick,
}: {
  work: ReturnType<typeof createPendingWork>;
  onRead: (snapshot: ReturnType<typeof readContext>) => void;
  onSuspend: () => void;
  onCommittedRowClick: (person: Person) => void;
  onPendingRowClick: (person: Person) => void;
}) {
  const [{ pending }, setVersion] = useState({ pending: false });
  const committedTable = useTable(COMMITTED_OPTIONS);
  const pendingTable = useTable(PENDING_OPTIONS);
  return (
    <>
      <button
        type="button"
        onClick={() => startTransition(() => setVersion({ pending: true }))}
      >
        Prepare pending grid
      </button>
      <button type="button" onClick={() => setVersion({ pending: false })}>
        Discard pending grid
      </button>
      <Suspense fallback={<p>Preparing grid</p>}>
        <DataGrid
          table={pending ? pendingTable : committedTable}
          recordCount={pending ? 20 : 10}
          isLoading={pending}
          emptyMessage={pending ? "Pending prop" : "Committed prop"}
          i18n={{
            labels: { empty: pending ? "Pending label" : "Committed label" },
          }}
          onRowClick={pending ? onPendingRowClick : onCommittedRowClick}
        >
          <ContextConsumer onRead={onRead} />
          {pending && <SuspendGrid work={work} onSuspend={onSuspend} />}
        </DataGrid>
      </Suspense>
    </>
  );
}

function StableGrid({
  memoizedOptions = true,
  work,
  onSuspend = () => {},
  onRead,
  onCommit,
  onRowClick,
}: {
  memoizedOptions?: boolean;
  work?: ReturnType<typeof createPendingWork>;
  onSuspend?: () => void;
  onRead: (snapshot: ReturnType<typeof readContext>) => void;
  onCommit: (snapshot: ReturnType<typeof readContext>) => void;
  onRowClick: (revision: number, person: Person) => void;
}) {
  const [revision, setRevision] = useState(0);
  const table = useTable(
    memoizedOptions ? COMMITTED_OPTIONS : { ...COMMITTED_OPTIONS },
  );
  const handleRowClick = useCallback(
    (person: Person) => {
      onRowClick(revision, person);
    },
    [revision, onRowClick],
  );
  return (
    <>
      <button
        type="button"
        onClick={() => startTransition(() => setRevision(1))}
      >
        Change callback
      </button>
      <button
        type="button"
        onClick={() =>
          table.setColumnResizing((previous) => ({
            ...previous,
            isResizingColumn: "name",
          }))
        }
      >
        Begin resize
      </button>
      <button
        type="button"
        onClick={() => table.setColumnSizing({ name: 240 })}
      >
        Resize column
      </button>
      <button
        type="button"
        onClick={() =>
          table.setColumnResizing((previous) => ({
            ...previous,
            isResizingColumn: false,
          }))
        }
      >
        Finish resize
      </button>
      <Suspense fallback={<p>Preparing callback</p>}>
        <DataGrid
          table={table}
          recordCount={10}
          onRowClick={handleRowClick}
          tableLayout={{ columnsResizable: true }}
        >
          <MemoizedContextConsumer onRead={onRead} onCommit={onCommit} />
          <ColumnSizingConsumer />
          {revision > 0 && work && (
            <SuspendGrid work={work} onSuspend={onSuspend} />
          )}
        </DataGrid>
      </Suspense>
    </>
  );
}

function AutoSizeOnCommit() {
  const { autoSize } = useDataGrid<Person>();
  useLayoutEffect(() => {
    autoSize?.apply(100);
  }, [autoSize]);
  return null;
}

function AutoSizeGrid({
  onRead,
}: {
  onRead: (snapshot: ReturnType<typeof readContext>) => void;
}) {
  const [pending, setPending] = useState(false);
  const committedTable = useTable(COMMITTED_AUTO_OPTIONS);
  const pendingTable = useTable(PENDING_AUTO_OPTIONS);
  return (
    <>
      <button type="button" onClick={() => setPending(true)}>
        Replace sized table
      </button>
      <DataGrid
        table={pending ? pendingTable : committedTable}
        recordCount={10}
      >
        <AutoSizeOnCommit />
        <ContextConsumer onRead={onRead} />
      </DataGrid>
    </>
  );
}

afterEach(cleanup);

describe("DataGrid context publication", () => {
  it.each([false, true])(
    "keeps committed table, props and labels until a suspended update commits (StrictMode=%s)",
    async (strict) => {
      const work = createPendingWork();
      const onRead =
        vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
      const onSuspend = vi.fn();
      const onCommittedRowClick = vi.fn();
      const onPendingRowClick = vi.fn();
      render(
        <SuspendedGrid
          work={work}
          onRead={onRead}
          onSuspend={onSuspend}
          onCommittedRowClick={onCommittedRowClick}
          onPendingRowClick={onPendingRowClick}
        />,
        { wrapper: strict ? StrictMode : Fragment },
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Read committed context" }),
      );
      const committed = onRead.mock.calls[0]![0];
      onCommittedRowClick.mockClear();

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Prepare pending grid" }),
        );
      });

      expect(onSuspend).toHaveBeenCalled();
      expect(screen.queryByText("Preparing grid")).toBeNull();
      expect(
        screen.getByRole("status", { name: "Rendered grid snapshot" })
          .textContent,
      ).toBe("Committed person:Committed prop:Committed label:10:false");
      fireEvent.click(
        screen.getByRole("button", { name: "Read committed context" }),
      );
      const suspended = onRead.mock.calls[1]![0];
      expect({
        person: suspended.table.options.data[0]?.name,
        message: suspended.props.emptyMessage,
        label: suspended.i18n.labels.empty,
        recordCount: suspended.recordCount,
        isLoading: suspended.isLoading,
      }).toEqual({
        person: "Committed person",
        message: "Committed prop",
        label: "Committed label",
        recordCount: 10,
        isLoading: false,
      });
      expect(suspended.table).toBe(committed.table);
      expect(suspended.props).toBe(committed.props);
      expect(suspended.i18n).toBe(committed.i18n);
      expect(suspended.recordCount).toBe(10);
      expect(suspended.isLoading).toBe(false);
      expect(onCommittedRowClick).toHaveBeenCalledWith(COMMITTED_ROWS[0]);
      expect(onPendingRowClick).not.toHaveBeenCalled();

      await act(async () => work.resolve());

      expect(
        screen.getByRole("status", { name: "Rendered grid snapshot" })
          .textContent,
      ).toBe("Pending person:Pending prop:Pending label:20:true");
      fireEvent.click(
        screen.getByRole("button", { name: "Read committed context" }),
      );
      const resumed = onRead.mock.calls[2]![0];
      expect(resumed.context).not.toBe(committed.context);
      expect(resumed.table.options.data).toBe(PENDING_ROWS);
      expect(resumed.props.emptyMessage).toBe("Pending prop");
      expect(resumed.i18n.labels.empty).toBe("Pending label");
      expect(resumed.recordCount).toBe(20);
      expect(resumed.isLoading).toBe(true);
      expect(resumed.context.gridId).toBe(committed.context.gridId);
      expect(onPendingRowClick).toHaveBeenCalledWith(PENDING_ROWS[0]);
    },
  );

  it("does not replace the committed publication when a suspended render is discarded", async () => {
    const work = createPendingWork();
    const onRead = vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
    const onSuspend = vi.fn();
    const onCommittedRowClick = vi.fn();
    const onPendingRowClick = vi.fn();
    render(
      <SuspendedGrid
        work={work}
        onRead={onRead}
        onSuspend={onSuspend}
        onCommittedRowClick={onCommittedRowClick}
        onPendingRowClick={onPendingRowClick}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const committed = onRead.mock.calls[0]![0];
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Prepare pending grid" }),
      );
    });
    expect(onSuspend).toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Discard pending grid" }),
    );
    await act(async () => work.resolve());
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const discarded = onRead.mock.calls[1]![0];
    expect(discarded.context === committed.context).toBe(true);
    expect(discarded.table.options.data).toBe(COMMITTED_ROWS);
    expect(discarded.props.emptyMessage).toBe("Committed prop");
    expect(discarded.i18n.labels.empty).toBe("Committed label");
    expect(onPendingRowClick).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "preserves callback publication policy (memoizedOptions=%s)",
    async (memoizedOptions) => {
      const onRead =
        vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
      const onCommit = vi.fn();
      const onRowClick = vi.fn();
      render(
        <StableGrid
          memoizedOptions={memoizedOptions}
          onRead={onRead}
          onCommit={onCommit}
          onRowClick={onRowClick}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Read committed context" }),
      );
      const committed = onRead.mock.calls[0]![0];
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Change callback" }),
        );
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Read committed context" }),
      );
      const updated = onRead.mock.calls[1]![0];
      expect(updated.context === committed.context).toBe(!memoizedOptions);
      expect(onCommit).toHaveBeenCalledTimes(memoizedOptions ? 2 : 1);
      expect(onRowClick).toHaveBeenLastCalledWith(1, COMMITTED_ROWS[0]);
    },
  );

  it("retains committed callbacks while a stable-context update suspends", async () => {
    const work = createPendingWork();
    const onSuspend = vi.fn();
    const onRead = vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
    const onCommit = vi.fn();
    const onRowClick = vi.fn();
    render(
      <StableGrid
        memoizedOptions={false}
        work={work}
        onSuspend={onSuspend}
        onRead={onRead}
        onCommit={onCommit}
        onRowClick={onRowClick}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const committed = onRead.mock.calls[0]![0];
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Change callback" }));
    });
    expect(onSuspend).toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    expect(onRead.mock.calls[1]![0].props === committed.props).toBe(true);
    expect(onRowClick).toHaveBeenLastCalledWith(0, COMMITTED_ROWS[0]);
    await act(async () => work.resolve());
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    expect(onRead.mock.calls[2]![0].context === committed.context).toBe(true);
    expect(onRowClick).toHaveBeenLastCalledWith(1, COMMITTED_ROWS[0]);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("keeps context stable during resize and publishes the final sizing snapshot", () => {
    const onRead = vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
    const onCommit = vi.fn();
    render(
      <StableGrid onRead={onRead} onCommit={onCommit} onRowClick={vi.fn()} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const committed = onRead.mock.calls[0]![0];
    fireEvent.click(screen.getByRole("button", { name: "Begin resize" }));
    fireEvent.click(screen.getByRole("button", { name: "Resize column" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const resizing = onRead.mock.calls[1]![0];
    expect(resizing.context === committed.context).toBe(true);
    expect(resizing.table.state.columnSizing.name).toBe(240);
    expect(
      screen.getByRole("status", { name: "Live column size" }).textContent,
    ).toBe("240");
    expect(onCommit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Finish resize" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const finished = onRead.mock.calls[2]![0];
    expect(finished.context === committed.context).toBe(false);
    expect(finished.table.state.columnSizing.name).toBe(240);
    expect(finished.context.gridId).toBe(committed.context.gridId);
    expect(finished.context.autoSize === committed.context.autoSize).toBe(true);
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it("sizes the newly committed table before descendant layout effects", () => {
    const onRead = vi.fn<(snapshot: ReturnType<typeof readContext>) => void>();
    render(<AutoSizeGrid onRead={onRead} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const committed = onRead.mock.calls[0]![0];
    expect(committed.table.atoms.columnSizing.get()).toEqual({
      committed: 200,
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Replace sized table" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Read committed context" }),
    );
    const replaced = onRead.mock.calls[1]![0];
    expect(replaced.table.atoms.columnSizing.get()).toEqual({ pending: 200 });
    expect(committed.table.atoms.columnSizing.get()).toEqual({
      committed: 200,
    });
  });
});
