// @vitest-environment jsdom

import "./ui-sdk-strict";

import { execFileSync } from "node:child_process";

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { act, StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AgentBridge,
  getAgentBridge,
  type AgentBridgeHandle,
  type AgentPermission,
} from "../../../../../../packages/ui/components/primitives/agent-bridge";
import { Rating } from "../../../../../../packages/ui/components/primitives/rating";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "../../../../../../packages/ui/components/primitives/sortable-list";
import { Switch } from "../../../../../../packages/ui/components/shadcn/switch";

// Counts loads of the SDK's agent entry and the bridges it creates. The real
// module still does the work.
const sdk = vi.hoisted(() => ({ loads: 0, bridges: 0 }));
vi.mock(
  "../../../../../../packages/ui/node_modules/@ui-sdk/react/dist/agent.js",
  async (importOriginal) => {
    sdk.loads += 1;
    const actual = await importOriginal<{
      createAgent: (...args: unknown[]) => unknown;
    }>();
    return {
      ...actual,
      createAgent: (...args: unknown[]) => {
        sdk.bridges += 1;
        return actual.createAgent(...args);
      },
    };
  },
);

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type Step = { ref: string; action: string; args?: unknown[] };
type Tool = { name: string; execute: (input: unknown) => Promise<unknown> };

const RATE: AgentPermission[] = [
  { component: "rating", actions: ["setValue"] },
];
const TOOL_NAMES = ["act", "query", "snapshot"];

afterEach(() => {
  cleanup();
  delete (document as { modelContext?: unknown }).modelContext;
});

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

async function run(steps: Step[]) {
  const bridge = await getAgentBridge();
  let result!: Awaited<ReturnType<AgentBridgeHandle["act"]>>;
  await act(async () => {
    result = await bridge.act({ steps });
  });
  return result;
}

const labelled = (bridge: AgentBridgeHandle, label: string) =>
  bridge.snapshot().filter((entry) => entry.label === label);

const score = (label: string) =>
  within(screen.getByRole("radiogroup", { name: label }))
    .getByRole("radio", { checked: true })
    .getAttribute("aria-label");

// What UI SDK 0.1.0-beta.17 calls: `document.modelContext.registerTool(tool,
// { signal })`, which returns a promise. Aborting the signal removes the tool.
function mockWebMcp() {
  const tools = new Map<string, Tool>();
  const registerTool = vi.fn(
    (tool: Tool, options?: { signal?: AbortSignal }) => {
      tools.set(tool.name, tool);
      options?.signal?.addEventListener("abort", () => {
        tools.delete(tool.name);
      });
      return Promise.resolve();
    },
  );
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: { registerTool },
  });
  const call = async (name: string, input: unknown) => {
    let result: unknown;
    await act(async () => {
      result = await tools.get(name)!.execute(input);
    });
    return result;
  };
  return { tools, registerTool, call, names: () => [...tools.keys()].sort() };
}

// jsdom and Playwright's Chromium have no `document.modelContext`. Every
// WebMCP test here runs against the mock above: it proves Core's wiring, not
// that a browser agent can use it.

// The bridge is one per document and cannot be unloaded, so these tests run
// first and in this order.
describe("AgentBridge loads the SDK bridge only on demand, once per document", () => {
  it("loads no SDK agent code while the browser has no WebMCP and nobody asks for the bridge", async () => {
    expect("modelContext" in document).toBe(false);
    const view = render(
      <StrictMode>
        <AgentBridge allow={RATE} />
      </StrictMode>,
    );
    await settle();
    expect(view.container.innerHTML).toBe("");
    expect(sdk).toEqual({ loads: 0, bridges: 0 });

    // A `modelContext` without the registration function is not WebMCP.
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {},
    });
    render(<AgentBridge allow={RATE} />);
    await settle();
    expect(sdk).toEqual({ loads: 0, bridges: 0 });
  });

  it("loads it for a browser with WebMCP (mocked), and finds controls that rendered before it", async () => {
    const webMcp = mockWebMcp();
    render(
      <StrictMode>
        <Rating aria-label="Rendered first" defaultValue={4} />
        <AgentBridge allow={RATE} />
      </StrictMode>,
    );

    await waitFor(() => expect(webMcp.names()).toEqual(TOOL_NAMES));
    expect(sdk).toEqual({ loads: 1, bridges: 1 });
    expect(await webMcp.call("snapshot", {})).toEqual([
      expect.objectContaining({ label: "Rendered first", value: "4" }),
    ]);
  });

  it("hands every caller that one bridge, across mounts and a module reload", async () => {
    const [first, second] = await Promise.all([
      getAgentBridge(),
      getAgentBridge(),
    ]);
    expect(second).toBe(first);

    render(
      <StrictMode>
        <AgentBridge allow={RATE} />
        <AgentBridge allow={[]} />
      </StrictMode>,
    );
    await settle();
    expect(await getAgentBridge()).toBe(first);

    // Hot reload evaluates the module again; the document keeps its bridge.
    vi.resetModules();
    const reloaded =
      await import("../../../../../../packages/ui/components/primitives/agent-bridge");
    expect(reloaded.getAgentBridge).not.toBe(getAgentBridge);
    expect(await reloaded.getAgentBridge()).toBe(first);
    expect(sdk.bridges).toBe(1);
  });

  it("renders no markup on the server and creates no bridge there", () => {
    // A DOM-free process: the path Next.js takes for the shell's server render.
    const output = execFileSync(
      "bun",
      [
        "-e",
        `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { AgentBridge, getAgentBridge } from "./packages/ui/components/primitives/agent-bridge.tsx";
        const html = renderToString(React.createElement(AgentBridge, { allow: [{ component: "rating", actions: ["setValue"] }] }));
        const bridge = await getAgentBridge().then(() => "created", () => "refused");
        console.log(JSON.stringify({ html, bridge }));
      `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(JSON.parse(output.trim())).toEqual({ html: "", bridge: "refused" });
  });
});

describe("AgentBridge reads the page", () => {
  it("lists a named rating with its value and actions, and no Base UI control", async () => {
    render(
      <>
        <Rating aria-label="Visit quality" defaultValue={3} />
        <Switch aria-label="Notify the team" />
      </>,
    );
    const bridge = await getAgentBridge();

    expect(labelled(bridge, "Visit quality")).toEqual([
      {
        ref: expect.stringMatching(/^c\d+$/),
        component: "rating",
        label: "Visit quality",
        value: "3",
        max: 5,
        actions: ["setValue"],
      },
    ]);
    // The documented limit: the bridge sees UI SDK components only.
    expect(
      screen.getByRole("switch", { name: "Notify the team" }),
    ).toBeTruthy();
    expect(labelled(bridge, "Notify the team")).toEqual([]);
    expect(await bridge.query({ text: "Notify the team" })).toEqual([]);
    expect(await bridge.query({ kind: "switch" })).toEqual([]);
  });

  it("keeps what sits under data-agent-hidden out of snapshot, query and act", async () => {
    render(
      <>
        <AgentBridge allow={RATE} />
        <section data-agent-hidden>
          <Rating aria-label="Private appraisal" defaultValue={2} />
        </section>
      </>,
    );
    const bridge = await getAgentBridge();

    expect(labelled(bridge, "Private appraisal")).toEqual([]);
    expect(await bridge.query({ text: "Private appraisal" })).toEqual([]);
    const result = await run([
      { ref: "Private appraisal", action: "setValue", args: [5] },
    ]);
    expect(result.ok).toBe(false);
    expect(score("Private appraisal")).toBe("2 stars");
  });

  it("redacts a value under data-agent-secret, which an agent may still set", async () => {
    render(
      <>
        <AgentBridge allow={RATE} />
        <section data-agent-secret>
          <Rating aria-label="Sealed vote" defaultValue={2} />
        </section>
      </>,
    );
    const bridge = await getAgentBridge();
    expect(labelled(bridge, "Sealed vote")).toMatchObject([
      { value: "[redacted]" },
    ]);

    const result = await run([
      { ref: "Sealed vote", action: "setValue", args: [4] },
    ]);

    expect(result.ok, result.error?.message).toBe(true);
    expect(score("Sealed vote")).toBe("4 stars");
    expect(result.steps[0]?.changes).toMatchObject([{ value: "[redacted]" }]);
    expect(labelled(bridge, "Sealed vote")).toMatchObject([
      { value: "[redacted]" },
    ]);
  });

  it("truncates a page of more than 100 components and still finds the rest by label", async () => {
    render(
      <>
        {Array.from({ length: 105 }, (_, index) => (
          <Rating
            key={index}
            aria-label={`Row ${index + 1}`}
            defaultValue={1}
          />
        ))}
      </>,
    );
    const bridge = await getAgentBridge();

    const snapshot = bridge.snapshot();
    expect(snapshot).toHaveLength(101);
    expect(snapshot.at(-1)).toEqual({
      ref: "more",
      component: "more",
      more: expect.any(Number),
      use: "query",
      actions: [],
    });
    expect(snapshot.at(-1)?.more).toBeGreaterThanOrEqual(5);
    expect(labelled(bridge, "Row 1")).toHaveLength(1);
    expect(labelled(bridge, "Row 105")).toEqual([]);
    expect(await bridge.query({ text: "Row 105" })).toEqual([
      expect.objectContaining({
        component: "rating",
        label: "Row 105",
        value: "1",
        actions: ["setValue"],
      }),
    ]);
  });

  it("remembers a control that left the page as offPage, and refuses to act on it", async () => {
    const view = render(
      <>
        <AgentBridge allow={RATE} />
        <Rating aria-label="Departing mark" defaultValue={3} />
      </>,
    );
    const bridge = await getAgentBridge();
    expect(labelled(bridge, "Departing mark")).toHaveLength(1);

    view.rerender(<AgentBridge allow={RATE} />);

    const result = await run([
      { ref: "Departing mark", action: "setValue", args: [5] },
    ]);
    expect(result.ok).toBe(false);
    // UI SDK 0.1.0-beta.17 keeps the control's last state, with no actions.
    const remembered = {
      ref: expect.stringMatching(/^c\d+$/),
      component: "rating",
      label: "Departing mark",
      value: "3",
      offPage: true,
      actions: [],
    };
    expect(await bridge.query({ text: "Departing mark" })).toEqual([
      remembered,
    ]);
    await waitFor(() =>
      expect(labelled(bridge, "Departing mark")).toEqual([remembered]),
    );
  });
});

describe("AgentBridge acts under Core's allowlist", () => {
  it("runs an allowed action as the agent and shows it on the page", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <AgentBridge allow={RATE} />
        <Rating
          aria-label="Call quality"
          defaultValue={3}
          onValueChange={onValueChange}
        />
      </>,
    );

    const result = await run([
      { ref: "Call quality", action: "setValue", args: [5] },
    ]);

    expect(result.ok, result.error?.message).toBe(true);
    expect(score("Call quality")).toBe("5 stars");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ source: "agent" }),
    );
    expect(result.steps[0]?.changes).toEqual([
      { component: "rating", label: "Call quality", key: "value", value: "5" },
    ]);
  });

  it("keeps the old value when the consumer cancels, and reports the refusal", async () => {
    render(
      <>
        <AgentBridge allow={RATE} />
        <Rating
          aria-label="Meal quality"
          defaultValue={3}
          onValueChange={(_value, details) => {
            if (details.source === "agent") details.cancel();
          }}
        />
      </>,
    );
    const bridge = await getAgentBridge();

    const result = await run([
      { ref: "Meal quality", action: "setValue", args: [1] },
    ]);

    expect(score("Meal quality")).toBe("3 stars");
    // A cancelled setValue now fails the step with the unchanged value.
    expect(result.ok).toBe(false);
    expect(result.error?.message).toMatch(/didn't take: it is still "3"/);
    expect(result.steps).toEqual([]);
    expect(labelled(bridge, "Meal quality")).toMatchObject([{ value: "3" }]);
  });

  it("refuses out-of-bounds numeric values and malformed steps without changing controls", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <AgentBridge allow={RATE} />
        <Rating
          aria-label="Bounded mark"
          defaultValue={3}
          onValueChange={onValueChange}
        />
      </>,
    );

    const outOfRange = await run([
      { ref: "Bounded mark", action: "setValue", args: [6] },
    ]);
    expect(outOfRange.ok).toBe(false);
    expect(outOfRange.error?.message).toMatch(/from 1 to 5|not 6/);
    expect(score("Bounded mark")).toBe("3 stars");
    expect(onValueChange).not.toHaveBeenCalled();

    const bridge = await getAgentBridge();
    const malformed = await bridge.act({
      steps: [
        { ref: "Bounded mark", action: "setValue", args: [5] },
        {
          ref: "Bounded mark",
          action: "setValue",
          value: 4,
        } as unknown as { ref: string; action: string; args?: unknown[] },
      ],
    });
    expect(malformed.ok).toBe(false);
    expect(malformed.steps).toEqual([]);
    expect(malformed.error?.message).toMatch(/No step ran/);
    expect(score("Bounded mark")).toBe("3 stars");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("refuses an action unless one entry names its component, action and label", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <AgentBridge
          allow={[
            {
              component: "rating",
              label: "Listed mark",
              actions: ["setValue"],
            },
            { component: "sortable-list", actions: ["setValue"] },
            { component: "rating", actions: ["move"] },
          ]}
        />
        <Rating aria-label="Listed mark" defaultValue={2} />
        <Rating
          aria-label="Unlisted mark"
          defaultValue={2}
          onValueChange={onValueChange}
        />
      </>,
    );

    const refused = await run([
      { ref: "Unlisted mark", action: "setValue", args: [5] },
    ]);
    expect(refused.ok).toBe(false);
    expect(refused.steps).toEqual([]);
    expect(score("Unlisted mark")).toBe("2 stars");
    expect(onValueChange).not.toHaveBeenCalled();

    const allowed = await run([
      { ref: "Listed mark", action: "setValue", args: [5] },
    ]);
    expect(allowed.ok, allowed.error?.message).toBe(true);
    expect(score("Listed mark")).toBe("5 stars");
  });

  it("refuses everything without an allowlist, and again once the mount is gone", async () => {
    const view = render(<Rating aria-label="Open mark" defaultValue={2} />);
    const rate = (stars: number) =>
      run([{ ref: "Open mark", action: "setValue", args: [stars] }]);

    expect((await rate(5)).ok).toBe(false);
    expect(score("Open mark")).toBe("2 stars");

    view.rerender(
      <>
        <Rating aria-label="Open mark" defaultValue={2} />
        <AgentBridge allow={[]} />
      </>,
    );
    expect((await rate(5)).ok).toBe(false);
    expect(score("Open mark")).toBe("2 stars");

    view.rerender(
      <>
        <Rating aria-label="Open mark" defaultValue={2} />
        <AgentBridge allow={RATE} />
      </>,
    );
    expect((await rate(4)).ok).toBe(true);
    expect(score("Open mark")).toBe("4 stars");

    view.rerender(<Rating aria-label="Open mark" defaultValue={2} />);
    expect((await rate(1)).ok).toBe(false);
    expect(score("Open mark")).toBe("4 stars");
  });
});

describe("AgentBridge asks a person about data-agent-confirm steps", () => {
  const publish = [{ ref: "Published review", action: "setValue", args: [5] }];

  it("refuses the step when the app supplied no confirm callback", async () => {
    render(
      <>
        <AgentBridge allow={RATE} />
        <section data-agent-confirm="Publishes the review to donors">
          <Rating aria-label="Published review" defaultValue={2} />
        </section>
      </>,
    );
    const bridge = await getAgentBridge();
    expect(labelled(bridge, "Published review")).toMatchObject([
      { confirm: "Publishes the review to donors" },
    ]);

    expect((await run(publish)).ok).toBe(false);
    expect(score("Published review")).toBe("2 stars");
  });

  it("refuses the step when the person says no, and runs it when they say yes", async () => {
    let answer = false;
    const confirm = vi.fn(() => Promise.resolve(answer));
    render(
      <>
        <AgentBridge allow={RATE} confirm={confirm} />
        <section data-agent-confirm="Publishes the review to donors">
          <Rating aria-label="Published review" defaultValue={2} />
        </section>
      </>,
    );

    expect((await run(publish)).ok).toBe(false);
    expect(score("Published review")).toBe("2 stars");

    answer = true;
    const approved = await run(publish);
    expect(approved.ok, approved.error?.message).toBe(true);
    expect(score("Published review")).toBe("5 stars");

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(confirm).toHaveBeenLastCalledWith("Publishes the review to donors", {
      request: {
        ref: expect.stringMatching(/^c\d+$/),
        component: "rating",
        label: "Published review",
        action: "setValue",
        args: [5],
        confirm: "Publishes the review to donors",
      },
      signal: expect.any(AbortSignal),
    });
  });

  it("never asks the person about a step the allowlist refuses", async () => {
    const confirm = vi.fn(() => Promise.resolve(true));
    render(
      <>
        <AgentBridge allow={[]} confirm={confirm} />
        <section data-agent-confirm="Publishes the review to donors">
          <Rating aria-label="Published review" defaultValue={2} />
        </section>
      </>,
    );

    expect((await run(publish)).ok).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
    expect(score("Published review")).toBe("2 stars");
  });
});

describe("AgentBridge and the sortable list", () => {
  const FRUIT: Record<string, string> = {
    apple: "Apple",
    pear: "Pear",
    plum: "Plum",
  };
  const rows = () =>
    screen
      .getAllByRole("listitem")
      .map((item) => item.querySelector(":scope > span")?.textContent);

  it("lists a named list with its move action and reorders it as the agent", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <AgentBridge
          allow={[{ component: "sortable-list", actions: ["move"] }]}
        />
        <SortableList
          aria-label="Macro actions"
          defaultValue={["apple", "pear", "plum"]}
          onValueChange={onValueChange}
        >
          {({ order }) =>
            order.map((key) => (
              <SortableListItem key={key} value={key} label={FRUIT[key]}>
                <SortableListHandle aria-label={`Reorder ${FRUIT[key]}`} />
                <span>{FRUIT[key]}</span>
              </SortableListItem>
            ))
          }
        </SortableList>
        <Rating aria-label="Macro score" defaultValue={2} />
      </>,
    );
    const bridge = await getAgentBridge();
    expect(labelled(bridge, "Macro actions")).toMatchObject([
      {
        component: "sortable-list",
        value: ["apple", "pear", "plum"],
        actions: ["move"],
      },
    ]);

    const result = await run([
      { ref: "Macro actions", action: "move", args: ["plum", 0] },
    ]);

    expect(result.ok, result.error?.message).toBe(true);
    expect(rows()).toEqual(["Plum", "Apple", "Pear"]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(
      ["plum", "apple", "pear"],
      expect.objectContaining({ source: "agent" }),
    );

    // Mission Control's allowlist: the reorder, and nothing else on the page.
    const rating = await run([
      { ref: "Macro score", action: "setValue", args: [5] },
    ]);
    expect(rating.ok).toBe(false);
    expect(score("Macro score")).toBe("2 stars");
  });

  it("fails a move that names no row or no position, and changes nothing", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <AgentBridge
          allow={[{ component: "sortable-list", actions: ["move"] }]}
        />
        <SortableList
          aria-label="Macro actions"
          defaultValue={["apple", "pear", "plum"]}
          onValueChange={onValueChange}
        >
          {({ order }) =>
            order.map((key) => (
              <SortableListItem key={key} value={key} label={FRUIT[key]}>
                <SortableListHandle aria-label={`Reorder ${FRUIT[key]}`} />
                <span>{FRUIT[key]}</span>
              </SortableListItem>
            ))
          }
        </SortableList>
      </>,
    );
    await getAgentBridge();
    for (const args of [
      ["kiwi", 0],
      ["plum", 1.5],
      ["plum", -1],
      ["plum", 3],
    ]) {
      const result = await run([
        { ref: "Macro actions", action: "move", args },
      ]);
      expect(result.ok, JSON.stringify(args)).toBe(false);
      expect(result.error?.message).toMatch(/row|position/i);
    }
    expect(rows()).toEqual(["Apple", "Pear", "Plum"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("hands confirm the move as UI SDK resolved it for a definePrimitive component", async () => {
    const confirm = vi.fn(() => Promise.resolve(true));
    render(
      <>
        <AgentBridge
          allow={[{ component: "sortable-list", actions: ["move"] }]}
          confirm={confirm}
        />
        <section data-agent-confirm="Changes the order donors see">
          <SortableList
            aria-label="Donor steps"
            defaultValue={["apple", "pear", "plum"]}
          >
            {({ order }) =>
              order.map((key) => (
                <SortableListItem key={key} value={key} label={FRUIT[key]}>
                  <SortableListHandle aria-label={`Reorder ${FRUIT[key]}`} />
                  <span>{FRUIT[key]}</span>
                </SortableListItem>
              ))
            }
          </SortableList>
        </section>
      </>,
    );

    const result = await run([
      { ref: "Donor steps", action: "move", args: ["pear", 2] },
    ]);

    expect(result.ok, result.error?.message).toBe(true);
    expect(rows()).toEqual(["Apple", "Plum", "Pear"]);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith("Changes the order donors see", {
      request: {
        ref: expect.stringMatching(/^c\d+$/),
        component: "sortable-list",
        label: "Donor steps",
        action: "move",
        args: ["pear", 2],
        confirm: "Changes the order donors see",
      },
      signal: expect.any(AbortSignal),
    });
  });

  // Mission Control's macro editor: each row shows its type and value as
  // separate text, so two rows can read the same and their text runs together.
  const ACTIONS: Record<string, { type: string; value: string }> = {
    first: { type: "Add label", value: "Urgent" },
    second: { type: "Add label", value: "Billing" },
    third: { type: "Snooze", value: "" },
    fourth: { type: "Add label", value: "Urgent" },
  };
  const KEYS = Object.keys(ACTIONS);
  const actionLabel = (key: string) =>
    `Action ${KEYS.indexOf(key) + 1}: ${ACTIONS[key].type} ${ACTIONS[key].value}`.trim();

  function MacroRows({
    onValueChange,
    labelled = true,
  }: {
    onValueChange?: (value: string[], details: { source: string }) => void;
    labelled?: boolean;
  }) {
    return (
      <>
        <AgentBridge
          allow={[{ component: "sortable-list", actions: ["move"] }]}
        />
        <SortableList
          aria-label="Macro actions"
          defaultValue={KEYS}
          onValueChange={onValueChange}
        >
          {({ order }) =>
            order.map((key) => (
              <SortableListItem
                key={key}
                value={key}
                label={labelled ? actionLabel(key) : undefined}
              >
                <SortableListHandle
                  aria-label={`Reorder ${actionLabel(key)}`}
                />
                <span>{ACTIONS[key].type}</span>
                <span>{ACTIONS[key].value}</span>
              </SortableListItem>
            ))
          }
        </SortableList>
      </>
    );
  }

  const macroItems = async () => {
    const bridge = await getAgentBridge();
    const [list] = labelled(bridge, "Macro actions");
    return list?.items;
  };
  const shownTypes = () =>
    screen
      .getAllByRole("listitem")
      .map((item) => item.querySelector(":scope > span")?.textContent);

  it("names each row by its label in snapshot, query and act, not by its text run together", async () => {
    const onValueChange = vi.fn();
    render(<MacroRows onValueChange={onValueChange} />);
    const bridge = await getAgentBridge();
    const labels = KEYS.map((key) => ({ value: key, label: actionLabel(key) }));

    // People still see each row's own text; only agents read the labels.
    expect(
      Array.from(
        screen.getAllByRole("listitem")[1].querySelectorAll(":scope > span"),
        (text) => text.textContent,
      ),
    ).toEqual(["Add label", "Billing"]);
    expect(screen.getAllByRole("listitem")[1].getAttribute("aria-label")).toBe(
      null,
    );
    expect(await macroItems()).toEqual(labels);

    let byText: unknown;
    let byList: unknown;
    await act(async () => {
      byText = await bridge.query({ text: "Billing" });
      byList = await bridge.query({ within: "Macro actions" });
    });
    expect(byText).toMatchObject([
      {
        label: "Macro actions",
        items: [{ value: "second", label: "Action 2: Add label Billing" }],
      },
    ]);
    expect(byList).toMatchObject([{ label: "Macro actions", items: labels }]);

    // A name read from the snapshot is one `move` takes.
    const [, billing] = (await macroItems())!;
    const result = await run([
      { ref: "Macro actions", action: "move", args: [billing.label, 0] },
    ]);

    expect(result.ok, result.error?.message).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith(
      ["second", "first", "third", "fourth"],
      expect.objectContaining({ source: "agent" }),
    );
    expect(await macroItems()).toEqual([
      labels[1],
      labels[0],
      labels[2],
      labels[3],
    ]);
  });

  it("refuses a move by a row's run-together text and names the rows it takes", async () => {
    const onValueChange = vi.fn();
    render(<MacroRows onValueChange={onValueChange} />);
    await getAgentBridge();

    const result = await run([
      { ref: "Macro actions", action: "move", args: ["Add labelBilling", 0] },
    ]);

    expect(result.ok).toBe(false);
    expect(result.error?.message).toBe(
      'No row "Add labelBilling". Rows: "Action 1: Add label Urgent", "Action 2: Add label Billing", "Action 3: Snooze", "Action 4: Add label Urgent".',
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("names a row without a label by the text people see, as screen readers hear it", async () => {
    render(<MacroRows labelled={false} />);

    const items = await macroItems();
    expect(items).toEqual([
      { value: "first", label: "Add labelUrgent" },
      { value: "second", label: "Add labelBilling" },
      { value: "third", label: "Snooze" },
      { value: "fourth", label: "Add labelUrgent" },
    ]);
    // That text is a name `move` takes.
    const result = await run([
      { ref: "Macro actions", action: "move", args: ["Snooze", 0] },
    ]);
    expect(result.ok, result.error?.message).toBe(true);
    expect(shownTypes()).toEqual([
      "Snooze",
      "Add label",
      "Add label",
      "Add label",
    ]);
  });
});

describe("AgentBridge and WebMCP (mocked document.modelContext)", () => {
  it("registers the SDK's three tools once, under StrictMode and with two mounts", async () => {
    const webMcp = mockWebMcp();
    render(
      <StrictMode>
        <AgentBridge allow={RATE} />
        <AgentBridge allow={[]} />
      </StrictMode>,
    );

    await waitFor(() => expect(webMcp.names()).toEqual(TOOL_NAMES));
    await settle();
    expect(webMcp.registerTool).toHaveBeenCalledTimes(3);
    expect(sdk.bridges).toBe(1);
  });

  it("applies the same allowlist to a registered tool call, which changes the page", async () => {
    const webMcp = mockWebMcp();
    render(
      <>
        <AgentBridge
          allow={[
            {
              component: "rating",
              label: "Browser mark",
              actions: ["setValue"],
            },
          ]}
        />
        <Rating aria-label="Browser mark" defaultValue={2} />
        <Rating aria-label="Guarded mark" defaultValue={2} />
      </>,
    );
    await waitFor(() => expect(webMcp.names()).toEqual(TOOL_NAMES));

    expect(
      await webMcp.call("act", {
        steps: [{ ref: "Browser mark", action: "setValue", args: [5] }],
      }),
    ).toMatchObject({ ok: true });
    expect(score("Browser mark")).toBe("5 stars");

    expect(
      await webMcp.call("act", {
        steps: [{ ref: "Guarded mark", action: "setValue", args: [5] }],
      }),
    ).toMatchObject({ ok: false, steps: [] });
    expect(score("Guarded mark")).toBe("2 stars");

    expect(await webMcp.call("query", { text: "Browser mark" })).toEqual([
      expect.objectContaining({ label: "Browser mark", value: "5" }),
    ]);
  });

  it("asks the person once about a marked step that a tool call makes", async () => {
    const webMcp = mockWebMcp();
    const confirm = vi.fn(() => Promise.resolve(true));
    render(
      <>
        <AgentBridge allow={RATE} confirm={confirm} />
        <section data-agent-confirm="Publishes the browser tally">
          <Rating aria-label="Browser tally" defaultValue={2} />
        </section>
      </>,
    );
    await waitFor(() => expect(webMcp.names()).toEqual(TOOL_NAMES));

    await webMcp.call("act", {
      steps: [{ ref: "Browser tally", action: "setValue", args: [3] }],
    });

    expect(score("Browser tally")).toBe("3 stars");
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it("removes the tools when the last mount leaves, and registers none for a mount that already left", async () => {
    const webMcp = mockWebMcp();
    const first = render(<AgentBridge allow={RATE} />);
    const second = render(<AgentBridge allow={RATE} />);
    await waitFor(() => expect(webMcp.names()).toEqual(TOOL_NAMES));

    first.unmount();
    await settle();
    expect(webMcp.names()).toEqual(TOOL_NAMES);

    second.unmount();
    expect(webMcp.names()).toEqual([]);
    expect(webMcp.registerTool).toHaveBeenCalledTimes(3);

    webMcp.registerTool.mockClear();
    render(<AgentBridge allow={RATE} />).unmount();
    await settle();
    expect(webMcp.registerTool).not.toHaveBeenCalled();
    expect(webMcp.names()).toEqual([]);
  });
});
