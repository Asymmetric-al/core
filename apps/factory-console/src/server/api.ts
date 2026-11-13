import { z } from "zod";

import { BackendError, readLimited } from "./archon";
import { StateUnavailable } from "./state";
import { controlActionSchema, CONVERSATION_PATTERN } from "../lib/factory";
import {
  EVIDENCE_CATEGORIES,
  HISTORY_KINDS,
  LEDGER_PAGE_LIMIT,
} from "../lib/ledger";

import type { Factory } from "./factory";

const requestId = z.string().min(8).max(128);

const bodies = {
  control: z
    .object({
      requestId,
      action: controlActionSchema,
      confirmed: z.boolean().optional(),
    })
    .strict(),
  ask: z
    .object({
      requestId,
      conversation: z.string().regex(CONVERSATION_PATTERN).nullable(),
      question: z.string().min(1).max(2000),
    })
    .strict(),
  apply: z
    .object({
      conversation: z.string().regex(CONVERSATION_PATTERN),
      message: z.string().min(8).max(128),
      priority: z.number().int().min(0).max(100).optional(),
      endState: z.enum(["PR_READY", "MERGED"]).optional(),
      confirmed: z.boolean().optional(),
    })
    .strict(),
};

const page = {
  offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  limit: z.coerce.number().int().min(1).max(LEDGER_PAGE_LIMIT).default(50),
  q: z.string().trim().max(200).optional(),
};

/** Query parameters of one History or Checks & reviews page. */
const ledgerQuery = z.discriminatedUnion("view", [
  z
    .object({
      view: z.literal("history"),
      ...page,
      kind: z.enum(HISTORY_KINDS).optional(),
    })
    .strict(),
  z
    .object({
      view: z.literal("evidence"),
      ...page,
      category: z.enum(EVIDENCE_CATEGORIES).optional(),
      currency: z.enum(["current", "superseded", "all"]).optional(),
    })
    .strict(),
]);

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

async function body(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 40_000)
    throw new BackendError("Request too large", 413);
  const text = await readLimited(request.body, 40_000);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BackendError("Invalid Console JSON", 400);
  }
}

/**
 * The Console BFF. `authorize` has already run (Basic auth, exact origin and
 * host, same-origin for writes); every path below is an explicit capability.
 */
export async function dispatch(
  request: Request,
  factory: Factory,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname
    .slice("/api/console/".length)
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
  const [head, second, third] = path;
  try {
    if (request.method === "GET") {
      if (path.length === 1 && head === "snapshot") {
        const offset = Number(url.searchParams.get("offset") ?? "0");
        if (!Number.isInteger(offset) || offset < 0 || offset > 100_000)
          throw new BackendError("Invalid page offset", 400);
        return json(await factory.snapshot(offset));
      }
      if (path.length === 2 && head === "issues") {
        const issue = Number(second);
        if (!/^[1-9][0-9]{0,7}$/.test(second ?? ""))
          throw new BackendError("Invalid issue number", 400);
        return json(await factory.issue(issue));
      }
      if (path.length === 2 && head === "runs")
        return json(await factory.runDetail(second ?? ""));
      if (path.length === 3 && head === "runs" && third === "artifacts")
        return json(await factory.runArtifacts(second ?? ""));
      if (path.length === 1 && head === "chat")
        return json(await factory.chat());
      if (path.length === 2 && head === "chat")
        return json(await factory.conversation(second));
      if (path.length === 1 && head === "ledger")
        return json(
          await factory.ledger(
            ledgerQuery.parse(Object.fromEntries(url.searchParams)),
          ),
        );
      if (path.length === 1 && head === "performance")
        return json(await factory.performance());
      if (path.length === 2 && head === "analysis")
        return json(await factory.report(second));
      throw new BackendError("Unavailable Console capability", 404);
    }
    if (request.method === "POST") {
      if (path.length === 1 && head === "request-ids") {
        return json({ requestId: factory.mintRequestId() });
      }
      const parsed = await body(request);
      if (path.length === 1 && head === "controls") {
        const input = bodies.control.parse(parsed);
        return json(
          await factory.execute(input.action, input.requestId, {
            confirmed: input.confirmed === true,
          }),
        );
      }
      if (path.length === 2 && head === "chat" && second === "ask") {
        const input = bodies.ask.parse(parsed);
        return json(
          await factory.ask(
            input.requestId,
            input.conversation,
            input.question,
          ),
        );
      }
      if (path.length === 2 && head === "chat" && second === "apply") {
        const input = bodies.apply.parse(parsed);
        return json(
          await factory.apply(
            input.conversation,
            input.message,
            { priority: input.priority, endState: input.endState },
            input.confirmed === true,
          ),
        );
      }
      throw new BackendError(
        "Unavailable Console operation; no fallback is performed",
        404,
      );
    }
    throw new BackendError("Method not allowed", 405);
  } catch (error) {
    if (error instanceof BackendError)
      return json({ error: error.message }, error.status);
    if (error instanceof StateUnavailable)
      return json({ error: error.message }, 503);
    if (error instanceof z.ZodError)
      return json({ error: "Invalid Console request" }, 400);
    return json(
      {
        error:
          "Console unavailable. Reconcile configuration and backend health.",
      },
      503,
    );
  }
}
