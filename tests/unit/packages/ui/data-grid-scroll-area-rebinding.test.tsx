// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installDomInfrastructure } from "./data-grid-scroll-area-infrastructure";
import { useTable } from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import {
  DataGrid,
  dataGridFeatures,
} from "../../../../packages/ui/components/reui/data-grid/data-grid";
import { DataGridScrollArea } from "../../../../packages/ui/components/reui/data-grid/data-grid-scroll-area";

import type { DomInfrastructure } from "./data-grid-scroll-area-infrastructure";
import type { DataGridColumnDef } from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import type { DataGridScrollAreaOrientation } from "../../../../packages/ui/components/reui/data-grid/data-grid-scroll-area";

type Person = { id: string; name: string };
const rows: Person[] = [{ id: "one", name: "Actual table engine row" }];
const columns: DataGridColumnDef<Person>[] = [{ accessorKey: "name" }];
const tableOptions = { features: dataGridFeatures, data: rows, columns };
const stickyLayout = { headerSticky: true };
const nonStickyLayout = { headerSticky: false };
const headerProperty = "--data-grid-scrollbar-header-height";

type FixtureProps = {
  orientation?: DataGridScrollAreaOrientation;
  present?: boolean;
  tableKey?: string;
  headerKey?: string;
  headerHeight?: number;
  tableViewportKey?: string;
  sticky?: boolean;
};

function GridFixture({
  orientation = "both",
  present = true,
  tableKey = "initial-table",
  headerKey = "initial-header",
  headerHeight = 24,
  tableViewportKey = "initial-table-viewport",
  sticky = true,
}: FixtureProps) {
  const table = useTable(tableOptions);
  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      tableLayout={sticky ? stickyLayout : nonStickyLayout}
    >
      <DataGridScrollArea orientation={orientation}>
        {present ? (
          <div key={tableViewportKey} data-slot="data-grid-table-viewport">
            <table key={tableKey} data-slot="data-grid-table">
              <thead
                key={headerKey}
                data-test-height={headerHeight}
                style={{ position: "sticky", top: 0 }}
              >
                <tr>
                  <th scope="col">Name</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{table.options.data[0]?.name}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" style={{ height: 600 }}>
            Waiting for rows
          </div>
        )}
      </DataGridScrollArea>
    </DataGrid>
  );
}

function requireElement(container: HTMLElement, selector: string) {
  const element = container.querySelector<HTMLElement>(selector);
  expect(
    element,
    `Missing public rendered element: ${selector}`,
  ).not.toBeNull();
  return element!;
}

function readNodes(container: HTMLElement) {
  return {
    root: requireElement(container, '[data-slot="data-grid-scroll-area"]'),
    viewport: requireElement(container, '[data-slot="scroll-area-viewport"]'),
    table: requireElement(container, '[data-slot="data-grid-table"]'),
    header: requireElement(container, '[data-slot="data-grid-table"] thead'),
    tableViewport: requireElement(
      container,
      '[data-slot="data-grid-table-viewport"]',
    ),
    overlay: requireElement(
      container,
      '[style*="--data-grid-scrollbar-header-height"]',
    ),
  };
}

let infrastructure: DomInfrastructure;
const testWitnesses: MutationObserver[] = [];

beforeEach(() => {
  infrastructure = installDomInfrastructure();
});

afterEach(async () => {
  try {
    for (const witness of testWitnesses.splice(0)) witness.disconnect();
    cleanup();
    await act(async () => {
      await Promise.resolve();
    });
    const audit = infrastructure.audit();
    expect(audit.resizeTargets).toBe(0);
    expect(audit.mutationTargets).toBe(0);
    expect(audit.pendingFrames).toBe(0);
    expect(
      infrastructure.resizeObservers.every(
        (observer) => observer.disconnectCount > 0,
      ),
    ).toBe(true);
    expect(
      infrastructure.mutationObservers.every(
        (observer) => observer.disconnectCount > 0,
      ),
    ).toBe(true);
  } finally {
    infrastructure.restore();
  }
});

function ownerFor(header: HTMLElement) {
  const owners = infrastructure.resizeObservers.filter((observer) =>
    observer.targets.has(header),
  );
  expect(owners).toHaveLength(1);
  return owners[0]!;
}

function mutationWitness(container: HTMLElement) {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((delivered) =>
    records.push(...delivered),
  );
  observer.observe(container, { childList: true, subtree: true });
  testWitnesses.push(observer);
  return { records, observer };
}

function assertEnabled(nodes: ReturnType<typeof readNodes>, height: number) {
  expect(nodes.root.getAttribute("data-overflow-vertical")).toBe("true");
  expect(nodes.viewport.clientHeight).toBe(200);
  expect(nodes.viewport.scrollHeight).toBe(600);
  expect(nodes.overlay.style.getPropertyValue(headerProperty)).toBe(
    `${height}px`,
  );
  expect(
    nodes.overlay.style.getPropertyValue("--data-grid-scrollbar-track-height"),
  ).toBe(`${200 - height}px`);
  const owner = ownerFor(nodes.header);
  expect(owner.targets.has(nodes.table)).toBe(true);
  expect(owner.targets.has(nodes.tableViewport)).toBe(true);
  expect(owner.targets.has(nodes.viewport)).toBe(true);
  return owner;
}

async function checkReplacement(
  initialProps: FixtureProps,
  nextProps: FixtureProps,
  discoverLate = false,
) {
  const view = render(
    <GridFixture {...initialProps} present={!discoverLate} />,
  );
  await infrastructure.settle();
  if (discoverLate) {
    view.rerender(<GridFixture {...initialProps} />);
    await infrastructure.settle();
  }
  const initial = readNodes(view.container);
  const owner = assertEnabled(initial, initialProps.headerHeight ?? 24);
  const witness = mutationWitness(view.container);
  const resizeInstances = infrastructure.resizeObservers.length;

  view.rerender(<GridFixture {...nextProps} />);
  await infrastructure.settle();
  const next = readNodes(view.container);
  witness.observer.disconnect();
  expect(next.root).toBe(initial.root);
  expect(next.viewport).toBe(initial.viewport);
  expect(next.header).not.toBe(initial.header);
  expect(initial.header.isConnected).toBe(false);
  expect(next.header.getBoundingClientRect().height).toBe(60);
  expect(initial.header.getBoundingClientRect().height).toBe(0);
  expect(next.table === initial.table).toBe(
    initialProps.tableKey === nextProps.tableKey &&
      initialProps.tableViewportKey === nextProps.tableViewportKey,
  );
  expect(
    witness.records.some(
      (record) => record.type === "childList" && record.removedNodes.length > 0,
    ),
  ).toBe(true);
  expect(infrastructure.resizeObservers.length).toBe(resizeInstances);
  expect(owner.disconnectCount).toBe(0);

  expect
    .soft(
      next.overlay.style.getPropertyValue(headerProperty),
      "Replacement header geometry must publish after native child-list delivery, without rescue scroll/resize.",
    )
    .toBe("60px");
  expect
    .soft(
      owner.targets.has(next.header),
      "The current header must become a resize target.",
    )
    .toBe(true);
  expect
    .soft(
      owner.targets.has(initial.header),
      "A detached header must stop being retained as a resize target.",
    )
    .toBe(false);
  if (next.table !== initial.table) {
    expect
      .soft(
        owner.targets.has(next.table),
        "The current table must become a resize target.",
      )
      .toBe(true);
    expect
      .soft(
        owner.targets.has(initial.table),
        "A detached table must stop being retained as a resize target.",
      )
      .toBe(false);
  }
  if (next.tableViewport !== initial.tableViewport) {
    expect.soft(owner.targets.has(next.tableViewport)).toBe(true);
    expect.soft(owner.targets.has(initial.tableViewport)).toBe(false);
    expect.soft(owner.unobserved).toContain(initial.tableViewport);
  }

  await act(async () => {
    infrastructure.deliverResize(next.header);
    infrastructure.deliverResize(next.viewport);
    fireEvent.scroll(next.viewport);
  });
  await infrastructure.settle();
  expect
    .soft(
      next.overlay.style.getPropertyValue(headerProperty),
      "An ordinary subsequent viewport resize/scroll must not keep measuring a detached header.",
    )
    .toBe("60px");
  assertEnabled(next, 60);
  expect(owner.unobserved).toContain(initial.header);
  await act(async () => {
    expect(infrastructure.deliverResize(initial.header)).toBe(0);
    next.header.dataset.testHeight = "80";
    expect(infrastructure.deliverResize(next.header)).toBe(1);
  });
  await infrastructure.settle();
  assertEnabled(next, 80);
}

describe("DataGridScrollArea live child rebinding", () => {
  it.each(["both", "vertical"] as const)(
    "keyed table replacement (%s + sticky)",
    async (orientation) => {
      await checkReplacement(
        { orientation },
        { orientation, tableKey: "replacement-table", headerHeight: 60 },
      );
    },
  );

  it("keyed header replacement keeps its table and viewport", async () => {
    await checkReplacement(
      {},
      { headerKey: "replacement-header", headerHeight: 60 },
    );
  });

  it("keyed table viewport replacement releases every detached resize target", async () => {
    await checkReplacement(
      {},
      { tableViewportKey: "replacement-table-viewport", headerHeight: 60 },
    );
  });

  it("first late-node discovery must not strand a later keyed table", async () => {
    await checkReplacement(
      {},
      { tableKey: "replacement-after-late-table", headerHeight: 60 },
      true,
    );
  });

  it("table to empty to table rebinds without remounting the scroll area", async () => {
    const view = render(<GridFixture />);
    await infrastructure.settle();
    const initial = readNodes(view.container);
    const owner = assertEnabled(initial, 24);
    view.rerender(<GridFixture present={false} />);
    await infrastructure.settle();
    expect(initial.header.isConnected).toBe(false);
    expect
      .soft(
        owner.targets.has(initial.header),
        "Removal must release the detached header during the mounted lifetime.",
      )
      .toBe(false);
    expect.soft(owner.targets.has(initial.table)).toBe(false);
    expect.soft(owner.targets.has(initial.tableViewport)).toBe(false);
    expect
      .soft(initial.overlay.style.getPropertyValue(headerProperty))
      .toBe("0px");
    view.rerender(<GridFixture tableKey="returned-table" headerHeight={60} />);
    await infrastructure.settle();
    const returned = readNodes(view.container);
    expect(returned.root).toBe(initial.root);
    expect(returned.viewport).toBe(initial.viewport);
    assertEnabled(returned, 60);
  });
});

describe("DataGridScrollArea geometry and lifecycle compatibility", () => {
  it("observes only its container subtree and does not schedule geometry for unrelated children", async () => {
    const view = render(<GridFixture />);
    await infrastructure.settle();
    const nodes = readNodes(view.container);
    const container = nodes.root.parentElement!;
    const observer = infrastructure.mutationObservers.find((candidate) =>
      candidate.targets.has(container),
    );
    expect(observer).toBeDefined();
    expect(observer!.targets.get(container)).toEqual({
      childList: true,
      subtree: true,
    });
    const executedFrames = infrastructure.audit().executedFrames;
    await act(async () => {
      nodes.table
        .querySelector("td")!
        .append(document.createTextNode(" updated"));
      view.container.append(document.createElement("aside"));
      await Promise.resolve();
    });
    expect(
      observer!.delivered.some((record) => record.type === "childList"),
    ).toBe(true);
    expect(
      observer!.delivered.every((record) => container.contains(record.target)),
    ).toBe(true);
    expect(infrastructure.frames.size).toBe(0);
    expect(infrastructure.audit().executedFrames).toBe(executedFrames);
    assertEnabled(nodes, 24);
  });

  it.each([
    { orientation: "horizontal", sticky: true },
    { orientation: "both", sticky: false },
    { orientation: "vertical", sticky: false },
  ] as const)(
    "does not enable custom geometry for $orientation with sticky=$sticky",
    async (props) => {
      const view = render(<GridFixture {...props} />);
      await infrastructure.settle();
      const root = requireElement(
        view.container,
        '[data-slot="data-grid-scroll-area"]',
      );
      const header = requireElement(
        view.container,
        '[data-slot="data-grid-table"] thead',
      );
      expect(
        view.container.querySelector(
          '[style*="--data-grid-scrollbar-header-height"]',
        ),
      ).toBeNull();
      expect(
        infrastructure.resizeObservers.some((observer) =>
          observer.targets.has(header),
        ),
      ).toBe(false);
      expect(
        infrastructure.mutationObservers.some((observer) =>
          observer.targets.has(root.parentElement!),
        ),
      ).toBe(false);
    },
  );

  it("cancels enabled-mode work and releases subscriptions before enabling again", async () => {
    const view = render(<GridFixture />);
    await infrastructure.settle();
    const initial = readNodes(view.container);
    const owner = assertEnabled(initial, 24);
    const mutationOwner = infrastructure.mutationObservers.find((observer) =>
      observer.targets.has(initial.root.parentElement!),
    );
    expect(mutationOwner).toBeDefined();
    await act(async () => {
      infrastructure.deliverResize(initial.header);
    });
    expect(infrastructure.frames.size).toBe(1);
    const pendingFrame = [...infrastructure.frames.keys()][0]!;
    view.rerender(<GridFixture sticky={false} />);
    expect(infrastructure.frames.has(pendingFrame)).toBe(false);
    expect(owner.disconnectCount).toBe(1);
    expect(owner.targets.size).toBe(0);
    expect(mutationOwner!.disconnectCount).toBe(1);
    expect(mutationOwner!.targets.size).toBe(0);
    await infrastructure.settle();
    expect(
      view.container.querySelector(
        '[style*="--data-grid-scrollbar-header-height"]',
      ),
    ).toBeNull();
    view.rerender(
      <GridFixture tableKey="re-enabled-table" headerHeight={60} />,
    );
    await infrastructure.settle();
    const next = readNodes(view.container);
    expect(next.root).toBe(initial.root);
    expect(next.viewport).toBe(initial.viewport);
    expect(assertEnabled(next, 60)).not.toBe(owner);
  });

  it("requeries live nodes on scroll when MutationObserver is unavailable", async () => {
    vi.stubGlobal("MutationObserver", undefined);
    const view = render(<GridFixture />);
    await infrastructure.settle();
    const initial = readNodes(view.container);
    const owner = assertEnabled(initial, 24);
    view.rerender(<GridFixture tableKey="fallback-table" headerHeight={60} />);
    const next = readNodes(view.container);
    fireEvent.scroll(next.viewport);
    await infrastructure.settle();
    expect(assertEnabled(next, 60)).toBe(owner);
    expect(owner.targets.has(initial.header)).toBe(false);
    expect(owner.targets.has(initial.table)).toBe(false);
    expect(owner.unobserved).toContain(initial.header);
  });

  it.each(["both", "vertical"] as const)(
    "initial geometry, stable rerender, resize and scroll (%s + sticky)",
    async (orientation) => {
      const view = render(<GridFixture orientation={orientation} />);
      await infrastructure.settle();
      const initial = readNodes(view.container);
      const owner = assertEnabled(initial, 24);
      view.rerender(<GridFixture orientation={orientation} />);
      await infrastructure.settle();
      expect(readNodes(view.container).header).toBe(initial.header);
      expect(owner.disconnectCount).toBe(0);
      await act(async () => {
        initial.header.dataset.testHeight = "60";
        infrastructure.deliverResize(initial.header);
        infrastructure.deliverResize(initial.header);
        infrastructure.deliverResize(initial.viewport);
        fireEvent.scroll(initial.viewport);
      });
      expect(infrastructure.frames.size).toBe(1);
      await infrastructure.settle();
      assertEnabled(readNodes(view.container), 60);
    },
  );

  it("late initial table/header discovery uses native child-list records", async () => {
    const view = render(<GridFixture present={false} />);
    await infrastructure.settle();
    const discovery = infrastructure.mutationObservers.find((observer) =>
      [...observer.targets.values()].some(
        (options) => options.childList && options.subtree,
      ),
    );
    expect(discovery).toBeDefined();
    view.rerender(
      <GridFixture tableKey="first-late-table" headerHeight={60} />,
    );
    await infrastructure.settle();
    assertEnabled(readNodes(view.container), 60);
    expect(
      discovery!.delivered.some(
        (record) => record.type === "childList" && record.addedNodes.length > 0,
      ),
    ).toBe(true);
  });

  it.each([false, true])(
    "unmount cancels pending RAF, releases subscriptions and pairs passive listeners (StrictMode=%s)",
    async (strict) => {
      const fixture = <GridFixture />;
      const view = render(
        strict ? <StrictMode>{fixture}</StrictMode> : fixture,
      );
      await infrastructure.settle();
      const nodes = readNodes(view.container);
      const owner = assertEnabled(nodes, 24);
      if (strict) {
        expect(
          infrastructure.resizeObservers.some(
            (observer) =>
              observer !== owner &&
              observer.observed.includes(nodes.header) &&
              observer.disconnectCount > 0,
          ),
        ).toBe(true);
      }
      const passiveRegistrations =
        infrastructure.addedListeners.mock.calls.flatMap((args, index) => {
          const [type, handler, options] = args;
          return type === "scroll" &&
            infrastructure.addedListeners.mock.contexts[index] ===
              nodes.viewport &&
            typeof options === "object" &&
            options?.passive
            ? [handler]
            : [];
        });
      expect(passiveRegistrations.length).toBeGreaterThan(0);
      await act(async () => {
        infrastructure.deliverResize(nodes.header);
      });
      expect(infrastructure.frames.size).toBe(1);
      const cssBeforeUnmount = nodes.overlay.style.cssText;
      view.unmount();
      expect(owner.targets.size).toBe(0);
      expect(infrastructure.frames.size).toBe(0);
      for (const handler of passiveRegistrations) {
        expect(
          infrastructure.removedListeners.mock.calls.some(
            ([type, removed, capture], index) =>
              type === "scroll" &&
              removed === handler &&
              infrastructure.removedListeners.mock.contexts[index] ===
                nodes.viewport &&
              !capture,
          ),
        ).toBe(true);
      }
      await act(async () => {
        expect(infrastructure.deliverResize(nodes.header)).toBe(0);
        nodes.header.dataset.testHeight = "99";
        nodes.table.append(document.createElement("tbody"));
        fireEvent.scroll(nodes.viewport);
      });
      await infrastructure.settle();
      expect(nodes.overlay.style.cssText).toBe(cssBeforeUnmount);
      expect(infrastructure.frames.size).toBe(0);
    },
  );

  it("unmount before late discovery releases its still-active observer and pending frame", async () => {
    const view = render(<GridFixture present={false} />);
    const discovery = infrastructure.mutationObservers.find((observer) =>
      [...observer.targets.values()].some(
        (options) => options.childList && options.subtree,
      ),
    );
    expect(discovery).toBeDefined();
    expect(discovery!.targets.size).toBe(1);
    expect(infrastructure.frames.size).toBeGreaterThan(0);
    view.unmount();
    expect(discovery!.disconnectCount).toBe(1);
    expect(discovery!.targets.size).toBe(0);
    expect(infrastructure.frames.size).toBe(0);
  });
});
