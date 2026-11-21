"use client";

import { EVE_ADMIN_MEMORY_CATEGORIES } from "@asym/api/eve/admin-memory";
import { ownApiFetch } from "@asym/database/own-api";
import {
  useLocaleFormat,
  type DateInput,
} from "@asym/lib/hooks/use-locale-format";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { Brain, History, Search, ShieldBan } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { EveSectionEmpty } from "./section-states";

import type {
  EveAdminMemoryAdminView,
  EveAdminMemoryCategory,
  EveAdminMemoryEntry,
} from "@asym/api/eve/admin-memory/types";

interface ResponseBody extends EveAdminMemoryAdminView {
  requestId: string;
}
interface EntryMutationIntent {
  entryId: string;
  expectedVersion: number;
}
type Mutation =
  | {
      method: "POST";
      body: {
        category: EveAdminMemoryCategory;
        content: string;
        title: string;
      };
    }
  | {
      method: "PATCH";
      body: {
        action: "edit";
        category: EveAdminMemoryCategory;
        content: string;
        entryId: string;
        expectedVersion: number;
        title: string;
      };
    }
  | {
      method: "PATCH";
      body: {
        action: "set_auto_save";
        category: EveAdminMemoryCategory;
        enabled: boolean;
      };
    }
  | { method: "DELETE"; body: { entryId: string; expectedVersion: number } };

const QUERY_KEY = ["admin", "eve", "admin-memory"] as const;
const LABELS: Record<EveAdminMemoryCategory, string> = {
  preference: "Preferences",
  project_context: "Project context",
  decision: "Decisions",
};

async function requestMemory(input?: Mutation): Promise<ResponseBody> {
  const response = await ownApiFetch(
    "/api/admin/eve/admin-memory",
    input
      ? {
          method: input.method,
          credentials: "same-origin",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(input.body),
        }
      : { credentials: "same-origin", headers: { accept: "application/json" } },
  );
  const { ok, body } = await readJsonBody<
    ResponseBody & { error?: string; mutation?: { exclusions?: string[] } }
  >(response);
  if (!ok) {
    const exclusions = body?.mutation?.exclusions?.join(", ");
    throw new Error(
      exclusions
        ? `Not stored: ${exclusions}.`
        : (body?.error ?? "Could not update private Eve memory."),
    );
  }
  if (!body) throw new Error("Private Eve memory returned no response.");
  return body;
}

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function deletedEntryFocusTarget(entryId: string) {
  return (
    document.getElementById(`memory-entry-${entryId}-title`) ??
    document.getElementById("memory-search")
  );
}

interface MemoryFieldErrors {
  title?: string;
  content?: string;
}

function memoryFieldErrors(title: string, content: string): MemoryFieldErrors {
  return {
    title: title.trim() ? undefined : "Enter a title.",
    content: content.trim() ? undefined : "Enter the advisory context.",
  };
}

function EntryEditor({
  entry,
  pending,
  saving,
  onSave,
  onCancel,
}: {
  entry: EveAdminMemoryEntry;
  pending: boolean;
  saving: boolean;
  onSave: (input: {
    category: EveAdminMemoryCategory;
    content: string;
    title: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [category, setCategory] = useState(entry.category);
  const [showErrors, setShowErrors] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleId = `memory-title-${entry.id}`;
  const contentId = `memory-content-${entry.id}`;
  const errors: MemoryFieldErrors = showErrors
    ? memoryFieldErrors(title, content)
    : {};

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <form
      noValidate
      className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const missing = memoryFieldErrors(title, content);
        if (missing.title || missing.content) {
          setShowErrors(true);
          (missing.title ? titleRef : contentRef).current?.focus();
          return;
        }
        onSave({ category, title, content });
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="min-w-0 md:flex-1">
          <Label htmlFor={titleId}>Title</Label>
          <Input
            ref={titleRef}
            id={titleId}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
          />
          {errors.title ? (
            <FieldError id={`${titleId}-error`} className="mt-2">
              {errors.title}
            </FieldError>
          ) : null}
        </div>
        <div className="md:w-56 md:shrink-0">
          <Select<EveAdminMemoryCategory>
            items={LABELS}
            value={category}
            onValueChange={(value) => {
              if (value !== null) setCategory(value);
            }}
          >
            <SelectControlLabel>Category</SelectControlLabel>
            <SelectTrigger
              id={`memory-category-${entry.id}`}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVE_ADMIN_MEMORY_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={contentId}>Advisory context</Label>
        <Textarea
          ref={contentRef}
          id={contentId}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          maxLength={4000}
          aria-invalid={errors.content ? true : undefined}
          aria-describedby={errors.content ? `${contentId}-error` : undefined}
        />
        {errors.content ? (
          <FieldError id={`${contentId}-error`} className="mt-2">
            {errors.content}
          </FieldError>
        ) : null}
      </div>
      <div className="flex gap-2">
        {/* A disabled submit Button is natively disabled and drops focus, so it
            is a plain button while pending; both branches keep one DOM node. */}
        {pending ? (
          <Button
            type="button"
            size="sm"
            focusableWhenDisabled={saving}
            disabled
          >
            Save new version
          </Button>
        ) : (
          <Button type="submit" size="sm">
            Save new version
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function EveAdminMemoryPanel() {
  const client = useQueryClient();
  const { formatDateTime } = useLocaleFormat();
  const [queryText, setQueryText] = useState("");
  const [showDeleted, setShowDeleted] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<EveAdminMemoryCategory>("preference");
  const [editingIntent, setEditingIntent] = useState<EntryMutationIntent>();
  const [deleteIntent, setDeleteIntent] = useState<EntryMutationIntent>();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => requestMemory(),
    staleTime: 15_000,
    refetchInterval: 15_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: requestMemory,
    onSuccess(data, variables) {
      client.setQueryData(QUERY_KEY, data);
      if (variables?.method === "PATCH" && variables.body.action === "edit") {
        setEditingIntent(undefined);
      }
      if (variables?.method === "DELETE") {
        setDeleteIntent(undefined);
      }
      if (variables?.method === "POST") {
        setTitle("");
        setContent("");
      }
    },
  });
  const normalizedQuery = queryText.trim().toLowerCase();
  const entries = (query.data?.entries ?? []).filter(
    (entry) =>
      (showDeleted || !entry.isDeleted) &&
      (!normalizedQuery ||
        `${entry.title} ${entry.content}`
          .toLowerCase()
          .includes(normalizedQuery)),
  );

  return (
    <section className="space-y-6" aria-labelledby="eve-memory-title">
      <MemoryProfileSection
        mutation={mutation}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        content={content}
        setContent={setContent}
      />

      <p
        aria-live="polite"
        aria-atomic="true"
        className={
          mutation.isIdle || mutation.isError
            ? "sr-only"
            : "text-sm text-muted-foreground"
        }
      >
        {mutation.isPending
          ? "Saving private memory change…"
          : mutation.isSuccess
            ? "Private memory change saved."
            : ""}
      </p>

      <MemoryCategorySettings query={query} mutation={mutation} />

      <MemoryEntriesSection
        queryText={queryText}
        setQueryText={setQueryText}
        setShowDeleted={setShowDeleted}
        showDeleted={showDeleted}
        query={query}
        entries={entries}
        editingIntent={editingIntent}
        mutation={mutation}
        setEditingIntent={setEditingIntent}
        formatDateTime={formatDateTime}
        setDeleteIntent={setDeleteIntent}
        deleteIntent={deleteIntent}
      />

      <MemoryControlsSection query={query} formatDateTime={formatDateTime} />
    </section>
  );
}

function MemoryProfileSection({
  mutation,
  title,
  setTitle,
  category,
  setCategory,
  content,
  setContent,
}: {
  mutation: UseMutationResult<
    ResponseBody,
    Error,
    Mutation | undefined,
    unknown
  >;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  category: "preference" | "project_context" | "decision";
  setCategory: Dispatch<
    SetStateAction<"preference" | "project_context" | "decision">
  >;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const errors: MemoryFieldErrors = showErrors
    ? memoryFieldErrors(title, content)
    : {};
  const adding = mutation.isPending && mutation.variables?.method === "POST";

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2} id="eve-memory-title">
          <span className="flex items-center gap-2">
            <Brain aria-hidden="true" className="size-5" />
            Private admin memory
          </span>
        </CardTitle>
        <CardDescription>
          Human-controlled advisory context for your preferences, project
          context, and decisions. It is not connected to autonomous runtime
          context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <ShieldBan aria-hidden="true" className="size-4" />
          <AlertTitle>Sensitive data is never memory</AlertTitle>
          <AlertDescription>
            Secrets, credentials, payment data, private keys, one-time codes,
            donor or customer PII, and sensitive tenant facts are rejected
            before storage. Rejected values are not copied into audit logs.
          </AlertDescription>
        </Alert>
        {mutation.error ? (
          <Alert variant="destructive">
            <AlertTitle>Memory was not changed</AlertTitle>
            <AlertDescription>{mutation.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <form
          noValidate
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (mutation.isPending) return;
            const missing = memoryFieldErrors(title, content);
            if (missing.title || missing.content) {
              setShowErrors(true);
              (missing.title ? titleRef : contentRef).current?.focus();
              return;
            }
            setShowErrors(false);
            mutation.mutate({
              method: "POST",
              body: { title, content, category },
            });
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="min-w-0 md:flex-1">
              <Label htmlFor="new-memory-title">Title</Label>
              <Input
                ref={titleRef}
                id="new-memory-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={
                  errors.title ? "new-memory-title-error" : undefined
                }
              />
              {errors.title ? (
                <FieldError id="new-memory-title-error" className="mt-2">
                  {errors.title}
                </FieldError>
              ) : null}
            </div>
            <div className="md:w-56 md:shrink-0">
              <Select<EveAdminMemoryCategory>
                items={LABELS}
                value={category}
                onValueChange={(value) => {
                  if (value !== null) setCategory(value);
                }}
              >
                <SelectControlLabel>Category</SelectControlLabel>
                <SelectTrigger id="new-memory-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVE_ADMIN_MEMORY_CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="new-memory-content">Advisory context</Label>
            <Textarea
              ref={contentRef}
              id="new-memory-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={4000}
              rows={4}
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={
                errors.content ? "new-memory-content-error" : undefined
              }
            />
            {errors.content ? (
              <FieldError id="new-memory-content-error" className="mt-2">
                {errors.content}
              </FieldError>
            ) : null}
          </div>
          {/* A disabled submit Button is natively disabled and drops focus, so
              it is a plain button while pending; both branches keep one DOM node. */}
          {mutation.isPending ? (
            <Button type="button" focusableWhenDisabled={adding} disabled>
              Add private memory
            </Button>
          ) : (
            <Button type="submit">Add private memory</Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function MemoryCategorySettings({
  query,
  mutation,
}: {
  query: UseQueryResult<ResponseBody, Error>;
  mutation: UseMutationResult<
    ResponseBody,
    Error,
    Mutation | undefined,
    unknown
  >;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          Automatic save controls
        </CardTitle>
        <CardDescription>
          Category controls are ready, but every automatic save also remains
          fail-closed behind Eve’s disabled release gate. Disabling a category
          retains existing entries and history.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {(query.data?.settings ?? []).map((setting) => (
          <div
            key={setting.category}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="text-sm font-medium">{LABELS[setting.category]}</p>
              <p className="text-xs text-muted-foreground">
                {setting.autoSaveEnabled
                  ? "Allowed by category"
                  : "Disabled by you"}
              </p>
            </div>
            <Button
              size="sm"
              variant={setting.autoSaveEnabled ? "outline" : "secondary"}
              aria-label={`${setting.autoSaveEnabled ? "Disable" : "Enable"} automatic save: ${LABELS[setting.category]}`}
              focusableWhenDisabled={
                mutation.isPending &&
                mutation.variables?.method === "PATCH" &&
                mutation.variables.body.action === "set_auto_save" &&
                mutation.variables.body.category === setting.category
              }
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  method: "PATCH",
                  body: {
                    action: "set_auto_save",
                    category: setting.category,
                    enabled: !setting.autoSaveEnabled,
                  },
                })
              }
            >
              {setting.autoSaveEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MemoryEntriesSection({
  queryText,
  setQueryText,
  setShowDeleted,
  showDeleted,
  query,
  entries,
  editingIntent,
  mutation,
  setEditingIntent,
  formatDateTime,
  setDeleteIntent,
  deleteIntent,
}: {
  queryText: string;
  setQueryText: Dispatch<SetStateAction<string>>;
  setShowDeleted: Dispatch<SetStateAction<boolean>>;
  showDeleted: boolean;
  query: UseQueryResult<ResponseBody, Error>;
  entries: EveAdminMemoryEntry[];
  editingIntent: EntryMutationIntent | undefined;
  mutation: UseMutationResult<
    ResponseBody,
    Error,
    Mutation | undefined,
    unknown
  >;
  setEditingIntent: Dispatch<SetStateAction<EntryMutationIntent | undefined>>;
  formatDateTime: (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  setDeleteIntent: Dispatch<SetStateAction<EntryMutationIntent | undefined>>;
  deleteIntent: EntryMutationIntent | undefined;
}) {
  const editFocusRef = useRef<string | undefined>(undefined);
  const deleteFocusRef = useRef<string | undefined>(undefined);

  // The editor and the deleted row's buttons unmount with focus inside them; restore it only when it fell to <body>.
  useEffect(() => {
    const focusIsLost =
      !document.activeElement || document.activeElement === document.body;
    const editEntryId = editFocusRef.current;
    if (editEntryId && editingIntent?.entryId !== editEntryId) {
      editFocusRef.current = undefined;
      if (focusIsLost) {
        document.getElementById(`memory-entry-${editEntryId}-edit`)?.focus();
      }
    }
    const deleteEntryId = deleteFocusRef.current;
    if (!deleteEntryId) return;
    const deleted = query.data?.entries.find(
      (entry) => entry.id === deleteEntryId,
    );
    if (deleted && !deleted.isDeleted) return;
    deleteFocusRef.current = undefined;
    if (focusIsLost) deletedEntryFocusTarget(deleteEntryId)?.focus();
  }, [editingIntent, query.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          Current memory
        </CardTitle>
        <CardDescription>
          Search, inspect, edit, or delete your private entries. Deleted rows
          remain visible during their separate retention window.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label className="sr-only" htmlFor="memory-search">
              Search private memory
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="memory-search"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Search title or context"
              />
            </InputGroup>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeleted((value) => !value)}
          >
            {showDeleted ? "Hide deleted" : "Show deleted"}
          </Button>
        </div>
        {query.isLoading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading private memory…</span>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}
        {query.error ? (
          <Alert variant="destructive">
            <AlertTitle>Memory unavailable</AlertTitle>
            <AlertDescription>{query.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {query.isSuccess && entries.length === 0 ? (
          <EveSectionEmpty
            title="No matching private memory."
            description="Try a different filter or add a private memory."
          />
        ) : null}
        <ul className="divide-y">
          {entries.map((entry) => (
            <li key={entry.id} className="space-y-3 py-4">
              {editingIntent?.entryId === entry.id ? (
                <EntryEditor
                  entry={entry}
                  pending={mutation.isPending}
                  saving={
                    mutation.isPending &&
                    mutation.variables?.method === "PATCH" &&
                    mutation.variables.body.action === "edit" &&
                    mutation.variables.body.entryId === entry.id
                  }
                  onCancel={() => {
                    editFocusRef.current = entry.id;
                    setEditingIntent(undefined);
                  }}
                  onSave={(values) => {
                    editFocusRef.current = entry.id;
                    mutation.mutate(
                      {
                        method: "PATCH",
                        body: {
                          action: "edit",
                          entryId: editingIntent.entryId,
                          expectedVersion: editingIntent.expectedVersion,
                          ...values,
                        },
                      },
                      {
                        onError: () => {
                          editFocusRef.current = undefined;
                        },
                      },
                    );
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div
                      id={`memory-entry-${entry.id}-title`}
                      tabIndex={-1}
                      className="flex items-center gap-2 outline-none"
                    >
                      <p className="font-medium">{entry.title}</p>
                      <Badge variant="outline">{LABELS[entry.category]}</Badge>
                      {entry.isDeleted ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {entry.content}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Version {entry.version} · {entry.source.replace("_", " ")}{" "}
                      · {formatDateTime(entry.updatedAt, TIMESTAMP_FORMAT)}
                    </p>
                  </div>
                  {!entry.isDeleted ? (
                    <div className="flex gap-2">
                      <Button
                        id={`memory-entry-${entry.id}-edit`}
                        size="sm"
                        variant="outline"
                        aria-label={`Edit: ${entry.title}`}
                        onClick={() =>
                          setEditingIntent({
                            entryId: entry.id,
                            expectedVersion: entry.version,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          disabled={mutation.isPending}
                          onClick={() =>
                            setDeleteIntent({
                              entryId: entry.id,
                              expectedVersion: entry.version,
                            })
                          }
                          render={
                            <Button
                              id={`memory-entry-${entry.id}-delete`}
                              size="sm"
                              variant="destructive"
                              aria-label={`Delete: ${entry.title}`}
                              focusableWhenDisabled={
                                mutation.isPending &&
                                mutation.variables?.method === "DELETE" &&
                                mutation.variables.body.entryId === entry.id
                              }
                            >
                              Delete
                            </Button>
                          }
                        />
                        <AlertDialogContent
                          finalFocus={() =>
                            document.getElementById(
                              `memory-entry-${entry.id}-delete`,
                            )
                              ? true
                              : (deletedEntryFocusTarget(entry.id) ?? true)
                          }
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete “{entry.title}”?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              The current entry will be marked deleted
                              immediately. Its immutable versions remain
                              inspectable under the separate memory-history
                              retention policy.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteIntent(undefined)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={mutation.isPending}
                              onClick={() => {
                                if (
                                  mutation.isPending ||
                                  deleteIntent?.entryId !== entry.id
                                ) {
                                  return;
                                }
                                deleteFocusRef.current = entry.id;
                                mutation.mutate(
                                  {
                                    method: "DELETE",
                                    body: {
                                      entryId: deleteIntent.entryId,
                                      expectedVersion:
                                        deleteIntent.expectedVersion,
                                    },
                                  },
                                  {
                                    onError: () => {
                                      deleteFocusRef.current = undefined;
                                    },
                                  },
                                );
                              }}
                            >
                              Confirm delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MemoryControlsSection({
  query,
  formatDateTime,
}: {
  query: UseQueryResult<ResponseBody, Error>;
  formatDateTime: (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          <span className="flex items-center gap-2">
            <History aria-hidden="true" className="size-5" />
            Immutable history
          </span>
        </CardTitle>
        <CardDescription>
          Created, edited, and deleted versions are recorded separately from run
          logs so the retention policy can evolve independently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isSuccess && query.data.history.length === 0 ? (
          <EveSectionEmpty
            title="No memory history yet."
            description="Saved changes will appear here."
          />
        ) : (
          <ul className="divide-y">
            {query.data?.history.map((record) => (
              <li key={record.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{record.title}</p>
                  <Badge variant="outline">v{record.version}</Badge>
                  <Badge variant="secondary">{record.action}</Badge>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {record.content}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {LABELS[record.category]} ·{" "}
                  {formatDateTime(record.changedAt, TIMESTAMP_FORMAT)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
