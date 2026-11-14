"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button-component";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ReceiptView, type ReceiptSource } from "./controls";
import {
  ApiError,
  api,
  keys,
  useChat,
  useConversation,
  type ControlState,
} from "./data";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  LoadingRows,
  LongText,
  Mono,
  Panel,
  RunButton,
  StatusBadge,
  TextList,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import {
  describeAction,
  type ChatView,
  type ControlOutcome,
  type ControlReceipt,
  type ProposedOperation,
} from "../lib/factory";

type Conversation = ChatView["conversations"][number];
type Message = Conversation["messages"][number];
type EndState = "PR_READY" | "MERGED";

const QUESTION_MAX = 2000;
const REPLY_WINDOW_MS = 10 * 60_000;
/** Ask outcomes after which Samson's reply is expected to be recorded. */
const STARTED: ReadonlySet<ControlOutcome> = new Set([
  "started",
  "requested",
  "applied",
  "already-applied",
]);
const END_STATES: readonly EndState[] = ["PR_READY", "MERGED"];
const END_STATE_LABELS: Record<EndState, string> = {
  PR_READY: "PR ready",
  MERGED: "Merged",
};

// ---------------------------------------------------------------------------
// The in-flight turn. It lives in component state only: it is not a record.
// The conversation document gains the operator's question and Samson's reply
// together, when the core-answer run's record step finishes.
// ---------------------------------------------------------------------------

type TurnBase = {
  attempt: number;
  requestId: string | null;
  /** The conversation the question was sent to (null starts a new one). */
  conversation: string | null;
  /** The conversation the server answered with. */
  resolved: string | null;
  question: string;
  sentAt: string;
  /** Edited after an unconfirmed send: the request id is no longer reused. */
  discarded: boolean;
};

type Turn = TurnBase &
  (
    | { phase: "sending" }
    | { phase: "sent"; receipt: ControlReceipt }
    | { phase: "error"; message: string; transport: boolean }
  );

type Attempt = Pick<
  TurnBase,
  "requestId" | "conversation" | "resolved" | "question"
>;

function baseOf(turn: Turn): TurnBase {
  const {
    attempt,
    requestId,
    conversation,
    resolved,
    question,
    sentAt,
    discarded,
  } = turn;
  return {
    attempt,
    requestId,
    conversation,
    resolved,
    question,
    sentAt,
    discarded,
  };
}

/** An unconfirmed send that may be repeated with the same request id. */
function retryable(turn: Turn) {
  if (turn.discarded || !turn.requestId) return false;
  if (turn.phase === "error") return turn.transport;
  return (
    turn.phase === "sent" &&
    (turn.receipt.outcome === "unknown" || turn.receipt.outcome === "failed")
  );
}

/** Whether Samson may still record a reply for this turn. */
function mayReply(turn: Turn) {
  if (!turn.requestId) return false;
  if (turn.phase === "sent")
    return (
      turn.receipt.outcome !== "refused" && turn.receipt.outcome !== "failed"
    );
  return turn.phase === "error" && turn.transport;
}

function hasReply(
  messages: readonly { role: string; request?: string | null }[] | undefined,
  requestId: string | null,
) {
  return Boolean(
    requestId &&
    messages?.some(
      (message) => message.role === "samson" && message.request === requestId,
    ),
  );
}

function turnState(turn: Turn): ControlState {
  switch (turn.phase) {
    case "sending":
      return {
        phase: "running",
        requestId: turn.requestId,
        startedAt: turn.sentAt,
      };
    case "sent":
      return { phase: "done", receipt: turn.receipt };
    case "error":
      return {
        phase: "error",
        requestId: turn.requestId,
        message: turn.message,
        transport: turn.transport,
      };
  }
}

function failure(error: unknown, fallback: string) {
  return {
    message: error instanceof Error ? error.message : fallback,
    transport:
      error instanceof ApiError &&
      (error.status === null || error.status >= 500),
  };
}

function useTurn(scope: string, select: (id: string | null) => void) {
  const client = useQueryClient();
  const [turn, setTurn] = useState<Turn | null>(null);
  const busy = useRef(false);
  const attempts = useRef(0);

  const deliver = useCallback(
    async (input: Attempt): Promise<ControlReceipt | null> => {
      if (busy.current) return null;
      busy.current = true;
      attempts.current += 1;
      const attempt = attempts.current;
      const update = (next: (current: Turn) => Turn) =>
        setTurn((current) =>
          current?.attempt === attempt ? next(current) : current,
        );
      setTurn({
        ...input,
        attempt,
        sentAt: new Date().toISOString(),
        discarded: false,
        phase: "sending",
      });
      let requestId = input.requestId;
      try {
        if (!requestId) {
          const minted = (await api<{ requestId: string }>("request-ids", {}))
            .requestId;
          requestId = minted;
          update((current) => ({ ...current, requestId: minted }));
        }
        const result = await api<{
          conversation: string;
          receipt: ControlReceipt;
        }>("chat/ask", {
          requestId,
          conversation: input.conversation,
          question: input.question,
        });
        update((current) => ({
          ...baseOf(current),
          resolved: result.conversation,
          phase: "sent",
          receipt: result.receipt,
        }));
        select(result.conversation);
        return result.receipt;
      } catch (error) {
        const { message, transport } = failure(
          error,
          "The message was not confirmed.",
        );
        update((current) => ({
          ...baseOf(current),
          phase: "error",
          message,
          transport,
        }));
        return null;
      } finally {
        busy.current = false;
        void client.invalidateQueries({ queryKey: keys.chat(scope) });
      }
    },
    [client, scope, select],
  );

  const discard = useCallback(
    () =>
      setTurn((current) =>
        current && retryable(current)
          ? { ...current, discarded: true }
          : current,
      ),
    [],
  );

  return {
    turn,
    send: (question: string, conversation: string | null) =>
      deliver({ requestId: null, conversation, resolved: null, question }),
    /** Resend exactly the same question, conversation and request id. */
    retry: async () => {
      if (!turn || !retryable(turn)) return;
      await deliver({
        requestId: turn.requestId,
        conversation: turn.conversation,
        resolved: turn.resolved,
        question: turn.question,
      });
    },
    discard,
  };
}

// ---------------------------------------------------------------------------
// Applying a recorded proposal. The server re-reads the proposal and runs the
// matching control with a deterministic request id, so a retry or a repeated
// Apply is idempotent ("already-applied").
// ---------------------------------------------------------------------------

type ApplyRequest = {
  conversation: string;
  message: string;
  priority?: number;
  endState?: EndState;
  confirmed?: boolean;
};

function useApply(scope: string) {
  const client = useQueryClient();
  const [state, setState] = useState<ControlState>({ phase: "idle" });
  const last = useRef<ApplyRequest | null>(null);
  const busy = useRef(false);

  const send = useCallback(
    async (request: ApplyRequest) => {
      if (busy.current) return;
      busy.current = true;
      last.current = request;
      setState({
        phase: "running",
        requestId: null,
        startedAt: new Date().toISOString(),
      });
      try {
        const receipt = await api<ControlReceipt>("chat/apply", request);
        setState({ phase: "done", receipt });
      } catch (error) {
        setState({
          phase: "error",
          requestId: null,
          ...failure(error, "The proposal was not applied."),
        });
      } finally {
        busy.current = false;
        void client.invalidateQueries({ queryKey: [scope] });
      }
    },
    [client, scope],
  );

  const retry = useCallback(
    () => (last.current ? send(last.current) : Promise.resolve()),
    [send],
  );

  return {
    state,
    apply: send,
    retry,
    canRetry:
      (state.phase === "error" && state.transport) ||
      (state.phase === "done" &&
        (state.receipt.outcome === "unknown" ||
          state.receipt.outcome === "failed")),
  };
}

function issueLabel(issue: number) {
  return issue > 0 ? `#${issue}` : "(no issue named)";
}

function describeOperation(
  operation: ProposedOperation,
  currentEnd: string | null,
): string {
  switch (operation.kind) {
    case "hold":
    case "release":
    case "retry":
    case "reopen":
      return operation.issue > 0
        ? describeAction({
            kind: "issue",
            issue: operation.issue,
            action: operation.kind,
          })
        : `${operation.kind[0].toUpperCase()}${operation.kind.slice(1)} issue ${issueLabel(operation.issue)}`;
    case "assign-scope": {
      const issues = operation.issues.length
        ? operation.issues.map((issue) => `#${issue}`).join(", ")
        : "(no issues named)";
      const end =
        operation.endState !== "unchanged"
          ? operation.endState
          : currentEnd
            ? `${currentEnd} (current end state)`
            : "an end state you choose";
      return `Assign scope ${issues} → ${end}`;
    }
    case "reprioritize":
      return `Reprioritize issue ${issueLabel(operation.issue)}`;
    default:
      return describeAction({ kind: "factory", action: operation.kind });
  }
}

/** Problems the server would refuse anyway, shown before anyone presses Apply. */
function proposalProblem(operation: ProposedOperation) {
  switch (operation.kind) {
    case "hold":
    case "release":
    case "retry":
    case "reopen":
    case "reprioritize":
      return operation.issue > 0
        ? null
        : "The proposal names no issue, so it cannot be applied.";
    case "assign-scope":
      return operation.issues.length
        ? null
        : "The proposal names no issues, so it cannot be applied.";
    default:
      return null;
  }
}

function parsePriority(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,3}$/.test(trimmed)) return null;
  const priority = Number(trimmed);
  return priority <= 100 ? priority : null;
}

function previewOf(conversation: Conversation) {
  const first =
    conversation.messages.find((message) => message.role === "operator") ??
    conversation.messages[0];
  const text = (first?.text ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "Empty conversation";
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function Chat({ active: shown }: { active: boolean }) {
  const { scope, paused, now, authority, authorityReason } = useConsole();
  const client = useQueryClient();
  const threadHeading = useId();
  const [choice, setChoice] = useState<{ id: string | null } | null>(null);
  const [draft, setDraft] = useState("");
  const select = useCallback((id: string | null) => setChoice({ id }), []);
  const turns = useTurn(scope, select);
  const { turn } = turns;

  const sentMs = turn ? Date.parse(turn.sentAt) : Number.NaN;
  const timedOut = Boolean(
    turn &&
    turn.phase !== "sending" &&
    now > 0 &&
    Number.isFinite(sentMs) &&
    now - sentMs > REPLY_WINDOW_MS,
  );
  const target = turn ? (turn.resolved ?? turn.conversation) : null;
  const watching = Boolean(turn && target && mayReply(turn));

  // Fast polling only while the awaited reply is not listed yet; no polling
  // at all while the tab is hidden and nothing is pending.
  const chat = useChat(scope, paused, !shown && !watching, (data) =>
    Boolean(
      turn &&
      watching &&
      !timedOut &&
      !hasReply(
        data?.conversations.find((entry) => entry.id === target)?.messages,
        turn.requestId,
      ),
    ),
  );
  const view = chat.data ?? null;
  const conversations = view?.conversations ?? [];
  const selectedId = choice ? choice.id : (conversations[0]?.id ?? null);
  const selected =
    conversations.find((entry) => entry.id === selectedId) ?? null;
  const listed = Boolean(
    turn &&
    hasReply(
      conversations.find((entry) => entry.id === target)?.messages,
      turn.requestId,
    ),
  );

  const reply = useConversation(
    scope,
    target,
    watching && !listed && !timedOut && !paused,
  );
  const replyRecorded = Boolean(
    turn && !listed && hasReply(reply.data?.doc?.messages, turn.requestId),
  );
  useEffect(() => {
    if (replyRecorded)
      void client.invalidateQueries({ queryKey: keys.chat(scope) });
  }, [replyRecorded, client, scope]);

  const active = turn && !listed ? turn : null;
  const sending = turn?.phase === "sending";
  const waiting = Boolean(
    active?.phase === "sent" && STARTED.has(active.receipt.outcome),
  );
  const unconfirmed = Boolean(active && retryable(active) && !replyRecorded);
  const pending =
    sending || unconfirmed || ((waiting || replyRecorded) && !timedOut);

  const blockedReason = !authority
    ? (authorityReason ?? "No current observation authorizes sending.")
    : chat.isPending
      ? "Reading Samson's conversations…"
      : chat.isError
        ? "Samson's conversations could not be read; retry the read before sending."
        : sending
          ? "Sending to Samson…"
          : unconfirmed
            ? "The previous message is unconfirmed. Retry it with the same request id, or edit the text to send it as a new request."
            : pending
              ? "Waiting for Samson's recorded reply to the previous message."
              : null;

  const submit = async () => {
    const question = draft.trim();
    if (!question || blockedReason) return;
    const receipt = await turns.send(question, selectedId);
    if (receipt && STARTED.has(receipt.outcome))
      setDraft((current) => (current.trim() === question ? "" : current));
  };

  const source: ReceiptSource | null = active
    ? {
        state: turnState(active),
        canRetry: unconfirmed && authority && !sending,
        retry: turns.retry,
      }
    : null;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {chat.isError ? (
        <ChatError
          message={chat.error.message}
          observedAt={view?.observedAt ?? null}
          fetching={chat.isFetching}
          retry={() => void chat.refetch()}
        />
      ) : null}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0">
          <ConversationsPanel
            view={view}
            loading={chat.isPending}
            selectedId={selectedId}
            onSelect={select}
          />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <Panel
            title="Samson"
            id={threadHeading}
            description={
              selectedId ? (
                <>
                  Conversation <Mono>{selectedId}</Mono>
                </>
              ) : (
                "New conversation. Nothing is recorded until Samson's reply is."
              )
            }
          >
            {!authority ? (
              <Unavailable title="Samson chat is disconnected">
                <p>{authorityReason}</p>
                <p className="mt-1 text-xs">
                  Sending and Apply stay disabled until a current observation is
                  read. Recorded conversations remain visible as history.
                </p>
              </Unavailable>
            ) : null}
            {chat.isPending ? (
              <LoadingRows label="Loading the conversation…" rows={2} />
            ) : (
              <Thread conversation={selected} selectedId={selectedId} />
            )}
            {active && source ? (
              target === selectedId ? (
                <PendingTurn
                  turn={active}
                  source={source}
                  waiting={waiting}
                  unconfirmed={unconfirmed}
                  replyRecorded={replyRecorded}
                  timedOut={timedOut}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3 text-sm">
                  <p className="min-w-0">
                    A message to Samson is still waiting in another
                    conversation.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => select(target)}
                  >
                    Show the waiting message
                  </Button>
                </div>
              )
            ) : null}
            {view ? <Answering view={view} /> : null}
            <Composer
              draft={draft}
              sending={sending}
              blockedReason={blockedReason}
              onDraft={(value) => {
                setDraft(value);
                turns.discard();
              }}
              onSubmit={() => void submit()}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ChatError({
  message,
  observedAt,
  fetching,
  retry,
}: {
  message: string;
  observedAt: string | null;
  fetching: boolean;
  retry: () => void;
}) {
  return (
    <ErrorNote>
      <p className="font-medium">
        Samson&apos;s conversations are unavailable: {message}
      </p>
      <p className="mt-1 text-xs">
        {observedAt ? (
          <>
            Anything shown is the last successful read, from{" "}
            <When value={observedAt} />.{" "}
          </>
        ) : null}
        Sending is disabled until a read succeeds.
      </p>
      <div className="mt-3">
        <Button size="sm" variant="outline" disabled={fetching} onClick={retry}>
          <RefreshCw aria-hidden="true" />
          Retry reading conversations
        </Button>
      </div>
    </ErrorNote>
  );
}

function ConversationsPanel({
  view,
  loading,
  selectedId,
  onSelect,
}: {
  view: ChatView | null;
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const heading = useId();
  return (
    <Panel
      title="Conversations"
      id={heading}
      description={
        view ? (
          <>
            Read <When value={view.observedAt} /> (
            <Ago value={view.observedAt} />)
          </>
        ) : (
          "Not read yet"
        )
      }
      action={
        <Button
          size="sm"
          variant="outline"
          aria-current={selectedId === null ? "true" : undefined}
          onClick={() => onSelect(null)}
        >
          <MessageSquarePlus aria-hidden="true" />
          New conversation
        </Button>
      }
    >
      {loading ? (
        <LoadingRows label="Loading Samson's conversations…" />
      ) : !view ? (
        <EmptyNote>Samson&apos;s conversations have not been read.</EmptyNote>
      ) : view.conversations.length ? (
        <ul
          aria-label="Conversations with Samson"
          className="flex min-w-0 flex-col gap-1"
        >
          {view.conversations.map((conversation) => {
            const current = conversation.id === selectedId;
            return (
              <li key={conversation.id} className="min-w-0">
                <Button
                  variant={current ? "secondary" : "ghost"}
                  className="w-full"
                  aria-current={current ? "true" : undefined}
                  onClick={() => onSelect(conversation.id)}
                >
                  <span className="flex min-w-0 grow items-center justify-between gap-2 text-left">
                    <span className="truncate">{previewOf(conversation)}</span>
                    <span className="shrink-0 text-xs">
                      {conversation.updatedAt ? (
                        <Ago value={conversation.updatedAt} />
                      ) : (
                        "no messages"
                      )}
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col gap-1">
          <EmptyNote>No conversations yet.</EmptyNote>
          <EmptyNote>Send Samson a message to start one.</EmptyNote>
        </div>
      )}
      {view?.malformed.length ? (
        <ErrorNote>
          <p className="font-medium">Some conversations could not be read</p>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
            {view.malformed.map((entry) => (
              <li key={entry.name} className="break-words">
                <Mono>{entry.name}</Mono>: {entry.reason}
              </li>
            ))}
          </ul>
        </ErrorNote>
      ) : null}
    </Panel>
  );
}

function Thread({
  conversation,
  selectedId,
}: {
  conversation: Conversation | null;
  selectedId: string | null;
}) {
  if (!conversation?.messages.length)
    return (
      <EmptyNote>
        {selectedId
          ? "No messages are recorded in this conversation yet. A question and Samson's reply are recorded together when the turn finishes."
          : "Ask Samson about the factory. The question and Samson's reply are recorded together when the turn finishes."}
      </EmptyNote>
    );
  return (
    <ol
      aria-label="Conversation with Samson"
      className="flex min-w-0 flex-col gap-3"
    >
      {conversation.messages.map((message, index) => (
        <MessageItem
          key={`${message.role}-${message.request ?? `${index}-${message.at}`}`}
          conversation={conversation.id}
          message={message}
        />
      ))}
    </ol>
  );
}

function MessageItem({
  conversation,
  message,
}: {
  conversation: string;
  message: Message;
}) {
  const operator = message.role === "operator";
  return (
    <li
      className={`flex min-w-0 flex-col gap-2 rounded-lg border p-3 ${operator ? "bg-background" : "bg-card"}`}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-medium">{operator ? "You" : "Samson"}</span>
        <span className="text-xs text-muted-foreground">
          <When value={message.at} />
        </span>
      </p>
      {message.failed ? (
        <div>
          <StatusBadge
            value="failed"
            label="Samson could not answer this turn"
          />
        </div>
      ) : null}
      <LongText>{message.text}</LongText>
      {message.sources?.length ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Sources</p>
          <TextList items={message.sources} />
        </div>
      ) : null}
      {!operator && message.run ? (
        <p className="break-words text-xs text-muted-foreground">
          Answered in run <RunButton run={message.run} />
        </p>
      ) : null}
      {!operator && message.operation ? (
        <Proposal
          conversation={conversation}
          message={message}
          operation={message.operation}
        />
      ) : null}
    </li>
  );
}

function Proposal({
  conversation,
  message,
  operation,
}: {
  conversation: string;
  message: Message;
  operation: ProposedOperation;
}) {
  const { scope, snapshot, authority, authorityReason } = useConsole();
  const control = useApply(scope);
  const heading = useId();
  const [priority, setPriority] = useState("");
  const [endState, setEndState] = useState<EndState | null>(null);
  const [confirming, setConfirming] = useState(false);

  const factory =
    snapshot?.factory.state === "available" ? snapshot.factory.data : null;
  const description = describeOperation(
    operation,
    factory?.scope?.endState ?? null,
  );
  const destructive = operation.kind === "stop" || operation.kind === "drain";
  const needsPriority = operation.kind === "reprioritize";
  const needsEndState =
    operation.kind === "assign-scope" &&
    operation.endState === "unchanged" &&
    factory !== null &&
    !factory.scope;
  const priorityValue = parsePriority(priority);
  const request = message.request ?? null;

  let missing: string | null = proposalProblem(operation);
  if (!request)
    missing =
      "This turn has no request id, so the Console cannot apply its proposal.";
  else if (!missing && needsPriority && priorityValue === null)
    missing = "Enter a priority from 0 to 100 to apply.";
  else if (!missing && needsEndState && !endState)
    missing = "Choose an end state to apply.";

  const running = control.state.phase === "running";
  const reason = !authority
    ? (authorityReason ?? "No current observation authorizes Apply.")
    : missing;
  const blocked = running || reason !== null;
  const applied = message.applied;
  // Older than the target's retained request history: it may already be
  // applied, so applying asks for an explicit confirmation.
  const unknown = applied?.recorded === null;
  const confirmFirst = destructive || unknown;
  if (confirming && blocked && !running) setConfirming(false);

  const go = (confirmed: boolean) => {
    if (!request) return;
    void control.apply({
      conversation,
      message: request,
      ...(needsPriority && priorityValue !== null
        ? { priority: priorityValue }
        : {}),
      ...(needsEndState && endState ? { endState } : {}),
      ...(confirmed ? { confirmed: true } : {}),
    });
  };

  return (
    <section
      aria-labelledby={heading}
      className="flex min-w-0 flex-col gap-3 rounded-lg border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={heading} className="text-sm font-medium">
          Proposed operation
        </h3>
        {applied?.recorded ? (
          <StatusBadge
            value="completed"
            label="Applied (recorded in factory state)"
          />
        ) : unknown ? (
          <StatusBadge
            value="INCONCLUSIVE"
            label="Unknown: may already be applied"
          />
        ) : (
          <StatusBadge value="pending" label="Not applied" />
        )}
      </div>
      <p className="break-words text-sm font-medium">{description}</p>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">
          Samson&apos;s reason
        </p>
        <LongText>{operation.reason}</LongText>
      </div>
      {applied?.recorded ? (
        <p className="break-words text-xs text-muted-foreground">
          The factory records request <Mono>{applied.requestId}</Mono>. Applying
          it again is idempotent.
        </p>
      ) : unknown ? (
        <p className="text-xs text-muted-foreground">
          This turn is older than the request history the factory keeps (its
          last 20 requests), so the Console cannot tell whether it was applied.
          Applying asks you to confirm first.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Nothing happens until you press Apply. The Console never applies a
          proposal on its own.
        </p>
      )}
      {needsPriority ? (
        <PriorityField
          value={priority}
          invalid={priority.trim() !== "" && priorityValue === null}
          onChange={setPriority}
        />
      ) : null}
      {needsEndState ? (
        <EndStateField value={endState} onChange={setEndState} />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant={destructive ? "destructive" : "default"}
          disabled={blocked}
          focusableWhenDisabled
          title={reason ?? undefined}
          aria-label={`Apply: ${description}`}
          onClick={() => {
            if (blocked) return;
            if (confirmFirst) setConfirming(true);
            else go(false);
          }}
        >
          {running ? <Spinner aria-hidden="true" /> : null}
          Apply
        </Button>
        {!authority ? (
          <span className="sr-only">Unavailable: {reason}</span>
        ) : missing && !running ? (
          <p className="min-w-0 text-xs text-muted-foreground">{missing}</p>
        ) : null}
      </div>
      <ReceiptView
        control={{
          state: control.state,
          canRetry: control.canRetry && authority,
          retry: control.retry,
        }}
      />
      {confirmFirst ? (
        <AlertDialog open={confirming && !blocked} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{description}?</AlertDialogTitle>
              <AlertDialogDescription>
                {unknown
                  ? "The factory no longer retains enough request history to show whether this proposal was already applied. Applying it again runs the control now. "
                  : ""}
                Samson proposed this. Applying it runs the factory control with
                your explicit confirmation. It never discards work, but it
                changes what the factory does next.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep things as they are</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={blocked}
                onClick={() => {
                  setConfirming(false);
                  if (blocked) return;
                  go(true);
                }}
              >
                Confirm: {description}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </section>
  );
}

function PriorityField({
  value,
  invalid,
  onChange,
}: {
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const hint = useId();
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Priority (0–100)</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        required
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={hint}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id={hint} className="text-xs text-muted-foreground">
        {invalid
          ? "Enter a whole number from 0 to 100."
          : "Required. Samson proposes the change; you choose the value."}
      </p>
    </div>
  );
}

function EndStateField({
  value,
  onChange,
}: {
  value: EndState | null;
  onChange: (value: EndState | null) => void;
}) {
  const id = useId();
  const hint = useId();
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Select<EndState>
        items={END_STATE_LABELS}
        value={value}
        required
        onValueChange={(next) => onChange(next)}
      >
        <SelectControlLabel>End state</SelectControlLabel>
        <SelectTrigger id={id} className="w-full" aria-describedby={hint}>
          <SelectValue placeholder="Choose an end state" />
        </SelectTrigger>
        <SelectContent>
          {END_STATES.map((option) => (
            <SelectItem key={option} value={option}>
              {END_STATE_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p id={hint} className="text-xs text-muted-foreground">
        Required: there is no current scope, so an unchanged end state has
        nothing to keep.
      </p>
    </div>
  );
}

function PendingTurn({
  turn,
  source,
  waiting,
  unconfirmed,
  replyRecorded,
  timedOut,
}: {
  turn: Turn;
  source: ReceiptSource;
  waiting: boolean;
  unconfirmed: boolean;
  replyRecorded: boolean;
  timedOut: boolean;
}) {
  const { selectTab } = useConsole();
  const late = (waiting || unconfirmed) && timedOut && !replyRecorded;
  const refused = turn.phase === "sent" && turn.receipt.outcome === "refused";
  const rejected = turn.phase === "error" && !unconfirmed && !turn.discarded;
  return (
    <section
      aria-label="Message not yet recorded"
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-dashed p-3"
    >
      <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-medium">You</span>
        <span className="text-xs text-muted-foreground">
          Sent <When value={turn.sentAt} /> · not recorded yet
        </span>
      </p>
      <LongText>{turn.question}</LongText>
      {replyRecorded ? (
        <p role="status" className="text-sm text-muted-foreground">
          Samson&apos;s reply is recorded. Refreshing the conversation…
        </p>
      ) : waiting && !timedOut ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" />
          Waiting for Samson&apos;s recorded reply…
        </p>
      ) : null}
      {late ? (
        <div className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
          <p>
            No reply is recorded yet, 10 minutes after sending. Nothing is
            resent automatically.
          </p>
          <p className="break-words">
            Check the core-answer run in{" "}
            <Button variant="link" size="sm" onClick={() => selectTab("runs")}>
              Open Agents &amp; runs
            </Button>
          </p>
        </div>
      ) : null}
      {unconfirmed ? (
        <p className="text-sm">
          It is not confirmed that Samson received this message. Retrying reuses
          the same request id, so it cannot start a second turn. Editing the
          message discards that id.
        </p>
      ) : null}
      {turn.discarded ? (
        <p className="text-sm text-muted-foreground">
          The message was edited, so this request id is discarded. The next send
          uses a new one.
        </p>
      ) : null}
      {refused ? (
        <p className="text-sm">
          Samson did not take this turn. You can change the message and send it
          again.
        </p>
      ) : null}
      {rejected ? (
        <p className="text-sm">
          Nothing is confirmed as sent. You can send the message again with a
          new request id.
        </p>
      ) : null}
      <ReceiptView control={source} />
    </section>
  );
}

function Answering({ view }: { view: ChatView }) {
  if (!view.answering.length && !view.answeringError) return null;
  return (
    <div className="flex flex-col gap-2">
      {view.answering.length ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 text-sm">
          <ul
            aria-label="Samson runs in progress"
            className="flex flex-col gap-1"
          >
            {view.answering.map((run) => (
              <li key={run.runId} className="break-words">
                Samson is answering (run <RunButton run={run.runId} />) since{" "}
                <Ago value={run.startedAt} /> <StatusBadge value={run.status} />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            These are engine runs of core-answer. The engine does not say which
            conversation each one answers.
          </p>
        </div>
      ) : null}
      {view.answeringError ? (
        <p className="break-words text-xs text-muted-foreground">
          Samson&apos;s engine runs could not be read: {view.answeringError}
        </p>
      ) : null}
    </div>
  );
}

function Composer({
  draft,
  sending,
  blockedReason,
  onDraft,
  onSubmit,
}: {
  draft: string;
  sending: boolean;
  blockedReason: string | null;
  onDraft: (value: string) => void;
  onSubmit: () => void;
}) {
  const id = useId();
  const help = useId();
  const counter = useId();
  return (
    <form
      className="flex min-w-0 flex-col gap-3 border-t pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>Message to Samson</Label>
        <Textarea
          id={id}
          value={draft}
          rows={3}
          maxLength={QUESTION_MAX}
          readOnly={sending}
          aria-describedby={`${help} ${counter}`}
          onChange={(event) => onDraft(event.target.value)}
        />
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <p id={help} className="min-w-0">
            Samson can propose one operation. Nothing happens until you press
            Apply.
          </p>
          <p id={counter}>
            {draft.length}/{QUESTION_MAX}
            <span className="sr-only"> characters</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={!draft.trim() || blockedReason !== null}
        >
          {sending ? (
            <Spinner aria-hidden="true" />
          ) : (
            <Send aria-hidden="true" />
          )}
          Send to Samson
        </Button>
        {blockedReason ? (
          <p className="min-w-0 text-xs text-muted-foreground">
            {blockedReason}
          </p>
        ) : null}
      </div>
    </form>
  );
}
