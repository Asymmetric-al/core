// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TENANT = "00000000-0000-4000-8000-00000000000a";
const ROW = "00000000-0000-4000-8000-000000000201";

const testState = vi.hoisted(() => ({
  scopeForSend: { kind: "unscoped" } as
    | {
        kind: "scoped";
        scope: {
          userId: string;
          tenantId: string;
          assignmentId: string;
          addressPrefix: string;
        };
      }
    | { kind: "unscoped" }
    | { kind: "retired" },
  scopeReads: 0,
}));

vi.mock("@asym/database/document-scope", () => ({
  readDocumentScopeForSend: () => {
    testState.scopeReads += 1;
    return testState.scopeForSend;
  },
}));

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({
    role: "admin",
    tenant: { id: TENANT, name: "Give Hope", slug: "give-hope" },
    user: {
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      tenantId: TENANT,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/crm/donors",
}));

vi.mock("@asym/ui/components/shadcn/sheet", async () => {
  const ReactModule = await import("react");
  const SheetContext = ReactModule.createContext<{
    onOpenChange: (open: boolean) => void;
    open: boolean;
  } | null>(null);

  return {
    Sheet: ({
      children,
      onOpenChange,
      open,
    }: React.PropsWithChildren<{
      onOpenChange: (open: boolean) => void;
      open: boolean;
    }>) => (
      <SheetContext.Provider value={{ onOpenChange, open }}>
        {children}
      </SheetContext.Provider>
    ),
    SheetTrigger: ({ render: trigger }: { render: React.ReactElement }) => {
      const sheet = ReactModule.useContext(SheetContext);
      return ReactModule.cloneElement(trigger, {
        onClick: () => sheet?.onOpenChange(true),
      } as React.HTMLAttributes<HTMLElement>);
    },
    SheetContent: ({ children }: React.PropsWithChildren) => {
      const sheet = ReactModule.useContext(SheetContext);
      return sheet?.open ? <aside>{children}</aside> : null;
    },
    SheetHeader: ({ children }: React.PropsWithChildren) => (
      <header>{children}</header>
    ),
    SheetTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
    SheetDescription: ({ children }: React.PropsWithChildren) => (
      <p>{children}</p>
    ),
  };
});

import { EveGlobalPanel } from "../../../apps/admin/app/eve/global-panel";
import { eveRequestScopeHeaders } from "../../../apps/admin/app/eve/request-scope";

const SCOPED = {
  kind: "scoped" as const,
  scope: {
    userId: "user-1",
    tenantId: TENANT,
    assignmentId: ROW,
    addressPrefix: `/${TENANT}~development`,
  },
};

interface SentRequest {
  readonly method: string;
  readonly path: string;
  readonly tenant: string | null;
  readonly assignment: string | null;
}

type StreamAnswer = (
  signal: AbortSignal | null | undefined,
) => ReadableStream<Uint8Array> | Response;

const encoder = new TextEncoder();

function lines(...events: object[]): string {
  return events.map((event) => `${JSON.stringify(event)}\n`).join("");
}

function finishedStream(continuationToken: string): StreamAnswer {
  return () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            lines({ type: "session.waiting", data: { continuationToken } }),
          ),
        );
        controller.close();
      },
    });
}

function openStream(
  onOpen: (controller: ReadableStreamDefaultController<Uint8Array>) => void,
): StreamAnswer {
  return (signal) =>
    new ReadableStream({
      start(controller) {
        signal?.addEventListener("abort", () =>
          controller.error(new DOMException("aborted", "AbortError")),
        );
        onOpen(controller);
      },
    });
}

function fakeService(streams: StreamAnswer[]) {
  const sent: SentRequest[] = [];
  let sessions = 0;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = new URL(String(input), "https://admin.example.test");
      const headers = new Headers(init.headers);
      const method = (init.method ?? "GET").toUpperCase();
      sent.push({
        method,
        path: `${url.pathname}${url.search}`,
        tenant: headers.get("x-asym-tenant"),
        assignment: headers.get("x-asym-assignment"),
      });
      if (method === "POST" && url.pathname === "/eve/v1/session") {
        sessions += 1;
        return Response.json(
          {
            sessionId: `session-${sessions}`,
            continuationToken: `token-${sessions}`,
          },
          { status: 202 },
        );
      }
      if (method === "POST" && url.pathname.endsWith("/cancel")) {
        return Response.json({
          ok: true,
          sessionId: url.pathname.split("/")[4],
          status: "accepted",
        });
      }
      if (method === "POST") {
        return Response.json({
          sessionId: url.pathname.split("/")[4],
          continuationToken: "token-follow-up",
        });
      }
      const stream = streams.shift();
      if (!stream) throw new Error(`no stream answer for ${url.pathname}`);
      const answer = stream(init.signal);
      if (answer instanceof Response) {
        return answer;
      }
      return new Response(answer, {
        status: 200,
        headers: { "content-type": "application/x-ndjson" },
      });
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, sent };
}

function openPanel() {
  render(<EveGlobalPanel placement="header" />);
  fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
}

function sendMessage(text: string) {
  fireEvent.change(screen.getByLabelText("Message Eve"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

async function turnEnds() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Send" })).toBeTruthy(),
  );
}

const unhandled: unknown[] = [];
function recordUnhandled(reason: unknown) {
  unhandled.push(reason);
}

describe("the Eve panel's requests through the real eve client", () => {
  beforeEach(() => {
    setPlatform("other");
    testState.scopeForSend = SCOPED;
    testState.scopeReads = 0;
    unhandled.length = 0;
    process.on("unhandledRejection", recordUnhandled);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    process.off("unhandledRejection", recordUnhandled);
  });

  it("names the selected row on the create, the stream, its reconnect, a follow-up, and a send after Detach and reset", async () => {
    let followUpStream!: ReadableStreamDefaultController<Uint8Array>;
    const { sent } = fakeService([
      openStream((controller) => {
        controller.enqueue(
          encoder.encode(lines({ type: "session.started", data: {} })),
        );
        setTimeout(() => controller.error(new Error("terminated")), 10);
      }),
      finishedStream("token-2"),
      openStream((controller) => {
        followUpStream = controller;
      }),
      finishedStream("token-3"),
    ]);
    openPanel();

    sendMessage("First question");
    await turnEnds();

    sendMessage("Follow-up question");
    await waitFor(() => expect(followUpStream).toBeDefined());
    const beforeDetach = sent.length;
    fireEvent.click(screen.getByRole("button", { name: "Detach" }));
    await turnEnds();
    expect(sent).toHaveLength(beforeDetach);

    fireEvent.click(
      screen.getByRole("button", { name: "Start a new Eve session" }),
    );
    expect(sent).toHaveLength(beforeDetach);
    sendMessage("After reset");
    await turnEnds();

    expect(sent.map(({ method, path }) => `${method} ${path}`)).toEqual([
      "POST /eve/v1/session",
      "GET /eve/v1/session/session-1/stream",
      "GET /eve/v1/session/session-1/stream?startIndex=1",
      "POST /eve/v1/session/session-1",
      "GET /eve/v1/session/session-1/stream?startIndex=2",
      "POST /eve/v1/session",
      "GET /eve/v1/session/session-2/stream",
    ]);
    for (const request of sent) {
      expect(request, `${request.method} ${request.path}`).toMatchObject({
        tenant: TENANT,
        assignment: ROW,
      });
    }
    expect(screen.queryByRole("alert")).toBeNull();
    expect(unhandled).toEqual([]);
  });

  it("names the selected row on a cancel, which Detach never sends", async () => {
    const { Client } =
      await import("../../../apps/admin/node_modules/eve/dist/src/client/index.js");
    const { sent } = fakeService([]);

    const result = await new Client({
      headers: eveRequestScopeHeaders,
      host: "",
    })
      .session({
        sessionId: "session-9",
        continuationToken: "token-9",
        streamIndex: 0,
      })
      .cancel();

    expect(result).toEqual({ sessionId: "session-9", status: "accepted" });
    expect(sent).toEqual([
      {
        method: "POST",
        path: "/eve/v1/session/session-9/cancel",
        tenant: TENANT,
        assignment: ROW,
      },
    ]);
  });

  it("shows the fail-closed alert without retrying when its own new session stream answers 403", async () => {
    const { sent } = fakeService([
      () =>
        Response.json(
          {
            code: "forbidden",
            error: "The current admin does not own this Eve session.",
            ok: false,
          },
          { status: 403 },
        ),
    ]);
    openPanel();

    sendMessage("First message");
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Eve could not complete that request. The runtime failed closed; try again or contact an administrator.",
      ),
    );
    await turnEnds();

    expect(sent.map(({ method, path }) => `${method} ${path}`)).toEqual([
      "POST /eve/v1/session",
      "GET /eve/v1/session/session-1/stream",
    ]);
    const resetButton = screen.getByRole("button", {
      name: "Start a new Eve session",
    }) as HTMLButtonElement;
    expect(resetButton.disabled).toBe(false);
    expect(unhandled).toEqual([]);
  });
});

describe("the Eve panel from a document whose scope is retired", () => {
  beforeEach(() => {
    setPlatform("other");
    testState.scopeForSend = SCOPED;
    testState.scopeReads = 0;
    unhandled.length = 0;
    process.on("unhandledRejection", recordUnhandled);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    process.off("unhandledRejection", recordUnhandled);
  });

  function fakeClockFromHere() {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  }

  async function quietMinute() {
    const reads = testState.scopeReads;
    expect(vi.isFakeTimers()).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    vi.useRealTimers();
    expect(testState.scopeReads).toBe(reads);
  }

  it("sends nothing for a message, and shows the panel's failure", async () => {
    testState.scopeForSend = { kind: "retired" };
    const { fetchMock } = fakeService([]);
    openPanel();

    fakeClockFromHere();
    sendMessage("Anyone there?");
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    await quietMinute();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(testState.scopeReads).toBe(1);
    expect(unhandled).toEqual([]);
  });

  it("sends nothing when Detach is pressed after the scope is retired", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const { fetchMock } = fakeService([
      openStream((controller) => {
        stream = controller;
      }),
    ]);
    openPanel();
    sendMessage("Long question");
    await waitFor(() => expect(stream).toBeDefined());
    const callsBefore = fetchMock.mock.calls.length;

    testState.scopeForSend = { kind: "retired" };
    fakeClockFromHere();
    fireEvent.click(screen.getByRole("button", { name: "Detach" }));
    await turnEnds();
    await quietMinute();

    expect(fetchMock.mock.calls.length).toBe(callsBefore);
    expect(unhandled).toEqual([]);
  });

  it("does not reconnect a dropped stream once the scope is retired, and stops trying", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const { fetchMock } = fakeService([
      openStream((controller) => {
        stream = controller;
      }),
    ]);
    openPanel();
    sendMessage("Long question");
    await waitFor(() => expect(stream).toBeDefined());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const readsBefore = testState.scopeReads;

    testState.scopeForSend = { kind: "retired" };
    fakeClockFromHere();
    act(() => {
      stream.enqueue(
        encoder.encode(lines({ type: "session.started", data: {} })),
      );
      stream.error(new Error("terminated"));
    });
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    await quietMinute();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(testState.scopeReads).toBe(readsBefore + 1);
    expect(unhandled).toEqual([]);
  });
});
