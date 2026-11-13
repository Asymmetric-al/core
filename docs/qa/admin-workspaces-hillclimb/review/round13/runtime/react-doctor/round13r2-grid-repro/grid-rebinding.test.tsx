import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useTable } from "../../../../../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import {
  DataGrid,
  dataGridFeatures,
} from "@asym/ui/components/reui/data-grid/data-grid";
import { DataGridScrollArea } from "@asym/ui/components/reui/data-grid/data-grid-scroll-area";

import { installDomInfrastructure } from "./dom-infrastructure";

import type { DataGridColumnDef } from "../../../../../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import type { DataGridScrollAreaOrientation } from "@asym/ui/components/reui/data-grid/data-grid-scroll-area";
import type { DomInfrastructure } from "./dom-infrastructure";

type Person = { id: string; name: string };
const rows: Person[] = [{ id: "one", name: "Actual table engine row" }];
const columns: DataGridColumnDef<Person>[] = [{ accessorKey: "name" }];
const tableOptions = { features: dataGridFeatures, data: rows, columns };
const stickyLayout = { headerSticky: true };
const headerProperty = "--data-grid-scrollbar-header-height";

type FixtureProps = {
  orientation?: DataGridScrollAreaOrientation;
  present?: boolean;
  tableKey?: string;
  headerKey?: string;
  headerHeight?: number;
};

function GridFixture({
  orientation = "both",
  present = true,
  tableKey = "initial-table",
  headerKey = "initial-header",
  headerHeight = 24,
}: FixtureProps) {
  const table = useTable(tableOptions);
  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      tableLayout={stickyLayout}
    >
      <DataGridScrollArea orientation={orientation}>
        {present ? (
          <div data-slot="data-grid-table-viewport">
            <table key={tableKey} data-slot="data-grid-table">
              <thead
                key={headerKey}
                data-repro-height={headerHeight}
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
    console.log("POST_UNMOUNT", JSON.stringify(audit));
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
    initialProps.tableKey === nextProps.tableKey,
  );
  expect(
    witness.records.some(
      (record) => record.type === "childList" && record.removedNodes.length > 0,
    ),
  ).toBe(true);
  expect(infrastructure.resizeObservers.length).toBe(resizeInstances);
  expect(owner.disconnectCount).toBe(0);

  console.log(
    "REBIND_OBSERVATION",
    JSON.stringify({
      orientation: nextProps.orientation ?? "both",
      tableReplaced: next.table !== initial.table,
      nativeChildListRecords: witness.records.length,
      expectedHeader: "60px",
      actualHeader: next.overlay.style.getPropertyValue(headerProperty),
      oldHeaderConnected: initial.header.isConnected,
      oldHeaderStillObserved: owner.targets.has(initial.header),
      newHeaderObserved: owner.targets.has(next.header),
      oldTableStillObserved: owner.targets.has(initial.table),
      newTableObserved: owner.targets.has(next.table),
    }),
  );

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

  await act(async () => {
    infrastructure.deliverResize(next.header);
    infrastructure.deliverResize(next.viewport);
    fireEvent.scroll(next.viewport);
  });
  await infrastructure.settle();
  console.log(
    "RESCUE_PROBE",
    JSON.stringify({
      expectedHeader: "60px",
      actualHeader: next.overlay.style.getPropertyValue(headerProperty),
      newHeaderDeliveryCount: owner.targets.has(next.header)
        ? owner.deliveryCount
        : 0,
    }),
  );
  expect
    .soft(
      next.overlay.style.getPropertyValue(headerProperty),
      "An ordinary subsequent viewport resize/scroll must not keep measuring a detached header.",
    )
    .toBe("60px");
}

describe("REBIND public enabled-mode child identity contract", () => {
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
    view.rerender(<GridFixture tableKey="returned-table" headerHeight={60} />);
    await infrastructure.settle();
    const returned = readNodes(view.container);
    expect(returned.root).toBe(initial.root);
    expect(returned.viewport).toBe(initial.viewport);
    console.log(
      "EMPTY_RETURN",
      JSON.stringify({
        expectedHeader: "60px",
        actualHeader: returned.overlay.style.getPropertyValue(headerProperty),
        oldHeaderStillObserved: owner.targets.has(initial.header),
        newHeaderObserved: owner.targets.has(returned.header),
      }),
    );
    expect
      .soft(returned.overlay.style.getPropertyValue(headerProperty))
      .toBe("60px");
    expect.soft(owner.targets.has(returned.header)).toBe(true);
    expect.soft(owner.targets.has(returned.table)).toBe(true);
  });
});

describe("CHARACTERIZE enabled mode and ordinary cleanup separately", () => {
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
        initial.header.dataset.reproHeight = "60";
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

  it("late initial table/header discovery uses real mutation records and then disconnects", async () => {
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
    expect(discovery!.disconnectCount).toBe(1);
    expect(discovery!.targets.size).toBe(0);
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
        nodes.header.dataset.reproHeight = "99";
        nodes.table.append(document.createElement("tbody"));
        fireEvent.scroll(nodes.viewport);
      });
      await infrastructure.settle();
      expect(nodes.overlay.style.cssText).toBe(cssBeforeUnmount);
      expect(infrastructure.frames.size).toBe(0);
      console.log(
        "CLEANUP_CHARACTERIZATION",
        JSON.stringify({
          strict,
          passiveRegistrations: passiveRegistrations.length,
          ...infrastructure.audit(),
        }),
      );
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
