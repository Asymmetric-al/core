/**
 * Ministry Update engagement — persistence boundary.
 *
 * {@link EngagementTransport} is the only seam between the engagement module
 * and the network. The real HTTP transport talks to the
 * `/api/posts/[id]/{like|prayer|fire|comments}` routes; the memory transport
 * is a drop-in fake for tests and stories. Interactive engagement UI is
 * always transport-backed — there is deliberately no way to render an
 * interactive reaction whose toggle does not go through a transport.
 *
 * Server-safe: no React imports (uses global `fetch` only at call time).
 */

import type { ReactionKind, ReactionState } from "./normalize";

/** Machine-readable failure categories for engagement persistence. */
export type EngagementErrorCode =
  | "unauthenticated"
  | "not_found"
  | "unavailable";

/**
 * Error thrown by engagement transports.
 *
 * `code` maps HTTP outcomes to product language: 401 → `"unauthenticated"`,
 * 404 → `"not_found"`, network failures and 5xx (plus any other unexpected
 * status) → `"unavailable"`. `retryable` is `true` only when trying again
 * later could plausibly succeed (network failures and 5xx).
 */
export class EngagementError extends Error {
  /** Failure category. */
  readonly code: EngagementErrorCode;
  /** Whether retrying later could plausibly succeed. */
  readonly retryable: boolean;
  /** Original HTTP status, when the failure came from a response. */
  readonly status?: number;

  constructor(
    code: EngagementErrorCode,
    message: string,
    options: { retryable?: boolean; status?: number; cause?: unknown } = {},
  ) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = "EngagementError";
    this.code = code;
    this.retryable = options.retryable ?? false;
    if (options.status !== undefined) {
      this.status = options.status;
    }
  }
}

/** Author shape for a Ministry Update comment (profile join on the wire). */
export interface UpdateCommentAuthor {
  /** Profile id of the comment author. */
  id: string;
  /** Author first name. */
  first_name: string;
  /** Author last name. */
  last_name: string;
  /** Author avatar URL, when set. */
  avatar_url: string | null;
}

/** One comment on a Ministry Update. */
export interface UpdateComment {
  /** Comment id. */
  id: string;
  /** Comment body text. */
  content: string;
  /** ISO timestamp the comment was created. */
  created_at: string;
  /** Comment author. */
  user: UpdateCommentAuthor;
}

/**
 * Persistence seam for Ministry Update engagement.
 *
 * All methods reject with {@link EngagementError} (or the original
 * `AbortError` when a signal fires). Implementations must be safe to call
 * concurrently for different `(updateId, kind)` pairs; the engagement hook
 * guarantees at most one in-flight `setReaction` per pair.
 */
export interface EngagementTransport {
  /**
   * Persist the viewer's desired reaction state. `active: true` adds the
   * reaction (HTTP POST), `active: false` removes it (HTTP DELETE).
   * Resolves `{ applied: false }` when the server was already in the desired
   * state — callers keep their optimistic value in that case.
   */
  setReaction(
    updateId: string,
    kind: ReactionKind,
    active: boolean,
    signal?: AbortSignal,
  ): Promise<{ applied: boolean }>;
  /** List the comments for an update, oldest first. */
  listComments(
    updateId: string,
    signal?: AbortSignal,
  ): Promise<UpdateComment[]>;
  /**
   * Add a comment. Resolves `{ persisted: false }` when the server accepted
   * the request without storing it (read-only demo no-op) — callers keep the
   * optimistic comment client-side in that case.
   */
  addComment(
    updateId: string,
    content: string,
  ): Promise<{ persisted: boolean }>;
}

/** The wire uses "like"; the product language uses "love". */
const REACTION_ENDPOINT: Record<ReactionKind, string> = {
  love: "like",
  prayer: "prayer",
  fire: "fire",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function errorFromStatus(status: number): EngagementError {
  if (status === 401) {
    return new EngagementError(
      "unauthenticated",
      "Sign in to react to updates.",
      {
        retryable: false,
        status,
      },
    );
  }
  if (status === 404) {
    return new EngagementError("not_found", "This update no longer exists.", {
      retryable: false,
      status,
    });
  }
  return new EngagementError(
    "unavailable",
    "Engagement is temporarily unavailable.",
    { retryable: status >= 500, status },
  );
}

/** Same-origin fetch that maps failures onto {@link EngagementError}. */
async function requestJson(path: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new EngagementError("unavailable", "Network request failed.", {
      retryable: true,
      cause: error,
    });
  }
  if (!response.ok) {
    throw errorFromStatus(response.status);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Defensive mapping from a raw comments row (flat row + profile join). */
function toUpdateComment(row: unknown, index: number): UpdateComment {
  const record = isRecord(row) ? row : {};
  const user = isRecord(record.user) ? record.user : {};
  return {
    id: typeof record.id === "string" ? record.id : `comment-${index}`,
    content: typeof record.content === "string" ? record.content : "",
    created_at:
      typeof record.created_at === "string"
        ? record.created_at
        : new Date(0).toISOString(),
    user: {
      id: typeof user.id === "string" ? user.id : "unknown",
      first_name: typeof user.first_name === "string" ? user.first_name : "",
      last_name: typeof user.last_name === "string" ? user.last_name : "",
      avatar_url: typeof user.avatar_url === "string" ? user.avatar_url : null,
    },
  };
}

function reactionPath(updateId: string, kind: ReactionKind): string {
  return `/api/posts/${encodeURIComponent(updateId)}/${REACTION_ENDPOINT[kind]}`;
}

function commentsPath(updateId: string): string {
  return `/api/posts/${encodeURIComponent(updateId)}/comments`;
}

/**
 * Production transport: same-origin fetch against the posts API routes.
 *
 * - `setReaction` → `POST`/`DELETE /api/posts/:id/{like|prayer|fire}`
 *   (`love` maps to the `like` endpoint) and reads `{ success, applied }`.
 * - `listComments` → `GET /api/posts/:id/comments` and reads `{ comments }`.
 * - `addComment` → `POST /api/posts/:id/comments`; the current read-only demo
 *   route answers `{ success: true, readOnlyDemo: true }`, which surfaces
 *   here as `{ persisted: false }`.
 */
export const httpEngagementTransport: EngagementTransport = {
  async setReaction(updateId, kind, active, signal) {
    const body = await requestJson(reactionPath(updateId, kind), {
      method: active ? "POST" : "DELETE",
      signal,
    });
    const applied = isRecord(body) && body.applied === true;
    return { applied };
  },

  async listComments(updateId, signal) {
    const body = await requestJson(commentsPath(updateId), {
      method: "GET",
      signal,
    });
    const rows =
      isRecord(body) && Array.isArray(body.comments) ? body.comments : [];
    return rows.map(toUpdateComment);
  },

  async addComment(updateId, content) {
    const body = await requestJson(commentsPath(updateId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const persisted =
      isRecord(body) && body.success === true && body.readOnlyDemo !== true;
    return { persisted };
  },
};

/** Per-update seed data for {@link createMemoryEngagementTransport}. */
export interface MemoryEngagementSeedEntry {
  /** Initial love state (missing fields default to `0`/`false`). */
  love?: Partial<ReactionState>;
  /** Initial prayer state. */
  prayer?: Partial<ReactionState>;
  /** Initial fire state. */
  fire?: Partial<ReactionState>;
  /** Initial comment list. */
  comments?: readonly UpdateComment[];
}

/** Seed map for the memory transport, keyed by update id. */
export type MemoryEngagementSeed = Readonly<
  Record<string, MemoryEngagementSeedEntry>
>;

/** One recorded call on the memory transport. */
export interface MemoryTransportCall {
  /** Transport method name. */
  method: "setReaction" | "listComments" | "addComment";
  /** The arguments the method was invoked with. */
  args: unknown[];
}

/** Memory transport surface: the transport plus its test affordances. */
export interface MemoryEngagementTransport extends EngagementTransport {
  /** Every call made against this transport, in order. */
  calls: MemoryTransportCall[];
  /**
   * Queue a failure for the next transport call (any method). Each call to
   * `failNext` fails exactly one future transport call, FIFO. Defaults to a
   * retryable `"unavailable"` {@link EngagementError} when no error is given.
   */
  failNext(error?: unknown): void;
}

interface MemoryRoom {
  reactions: Record<ReactionKind, ReactionState>;
  comments: UpdateComment[];
}

function seedReaction(seed: Partial<ReactionState> | undefined): ReactionState {
  return {
    count: Math.max(0, seed?.count ?? 0),
    mine: seed?.mine ?? false,
  };
}

/**
 * In-memory {@link EngagementTransport} fake for tests and stories.
 *
 * Behaves like the real API: `setReaction` resolves `{ applied: false }`
 * when the room is already in the desired state, `addComment` appends and
 * resolves `{ persisted: true }`, and `listComments` returns seeded plus
 * added comments. Records every call in `calls` and supports queued
 * failures via `failNext`.
 */
export function createMemoryEngagementTransport(
  seed?: MemoryEngagementSeed,
): MemoryEngagementTransport {
  const rooms = new Map<string, MemoryRoom>();
  const failures: unknown[] = [];
  let commentSequence = 0;

  function room(updateId: string): MemoryRoom {
    let existing = rooms.get(updateId);
    if (!existing) {
      const entry = seed?.[updateId];
      existing = {
        reactions: {
          love: seedReaction(entry?.love),
          prayer: seedReaction(entry?.prayer),
          fire: seedReaction(entry?.fire),
        },
        comments: [...(entry?.comments ?? [])],
      };
      rooms.set(updateId, existing);
    }
    return existing;
  }

  function recordAndMaybeFail(
    method: MemoryTransportCall["method"],
    args: unknown[],
  ): void {
    transport.calls.push({ method, args });
    if (failures.length > 0) {
      throw failures.shift();
    }
  }

  const transport: MemoryEngagementTransport = {
    calls: [],

    failNext(error) {
      failures.push(
        error ??
          new EngagementError("unavailable", "Simulated transport failure.", {
            retryable: true,
          }),
      );
    },

    async setReaction(updateId, kind, active, signal) {
      recordAndMaybeFail("setReaction", [updateId, kind, active, signal]);
      const reaction = room(updateId).reactions[kind];
      const applied = reaction.mine !== active;
      if (applied) {
        reaction.mine = active;
        reaction.count = Math.max(0, reaction.count + (active ? 1 : -1));
      }
      return { applied };
    },

    async listComments(updateId, signal) {
      recordAndMaybeFail("listComments", [updateId, signal]);
      return [...room(updateId).comments];
    },

    async addComment(updateId, content) {
      recordAndMaybeFail("addComment", [updateId, content]);
      commentSequence += 1;
      const comment: UpdateComment = {
        id: `memory-comment-${commentSequence}`,
        content,
        created_at: new Date().toISOString(),
        user: {
          id: "memory-viewer",
          first_name: "You",
          last_name: "",
          avatar_url: null,
        },
      };
      room(updateId).comments.push(comment);
      return { persisted: true };
    },
  };

  return transport;
}
