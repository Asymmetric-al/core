"use client";

import { EVE_ADMIN_MEMORY_CATEGORIES } from "@asym/api/eve/admin-memory";
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
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, History, Search, ShieldBan } from "lucide-react";
import { useState } from "react";

import type {
  EveAdminMemoryAdminView,
  EveAdminMemoryCategory,
  EveAdminMemoryEntry,
} from "@asym/api/eve/admin-memory/types";

interface ResponseBody extends EveAdminMemoryAdminView {
  requestId: string;
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
  const response = await fetch(
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
  const body = (await response.json().catch(() => null)) as
    | (ResponseBody & { error?: string; mutation?: { exclusions?: string[] } })
    | null;
  if (!response.ok) {
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function EntryEditor({
  entry,
  pending,
  onSave,
  onCancel,
}: {
  entry: EveAdminMemoryEntry;
  pending: boolean;
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
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <div>
          <Label htmlFor={`memory-title-${entry.id}`}>Title</Label>
          <Input
            id={`memory-title-${entry.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`memory-category-${entry.id}`}>Category</Label>
          <select
            id={`memory-category-${entry.id}`}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as EveAdminMemoryCategory)
            }
          >
            {EVE_ADMIN_MEMORY_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor={`memory-content-${entry.id}`}>Advisory context</Label>
        <Textarea
          id={`memory-content-${entry.id}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending || !title.trim() || !content.trim()}
          onClick={() => onSave({ category, title, content })}
        >
          Save new version
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function EveAdminMemoryPanel() {
  const client = useQueryClient();
  const [queryText, setQueryText] = useState("");
  const [showDeleted, setShowDeleted] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<EveAdminMemoryCategory>("preference");
  const [editingId, setEditingId] = useState<string>();
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
      setEditingId(undefined);
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
      <Card>
        <CardHeader>
          <CardTitle id="eve-memory-title" className="flex items-center gap-2">
            <Brain aria-hidden="true" className="size-5" />
            Private admin memory
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
          <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
            <div>
              <Label htmlFor="new-memory-title">Title</Label>
              <Input
                id="new-memory-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="new-memory-category">Category</Label>
              <select
                id="new-memory-category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as EveAdminMemoryCategory)
                }
              >
                {EVE_ADMIN_MEMORY_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="new-memory-content">Advisory context</Label>
            <Textarea
              id="new-memory-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={4000}
              rows={4}
            />
          </div>
          <Button
            disabled={mutation.isPending || !title.trim() || !content.trim()}
            onClick={() =>
              mutation.mutate({
                method: "POST",
                body: { title, content, category },
              })
            }
          >
            Add private memory
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic save controls</CardTitle>
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
                <p className="text-sm font-medium">
                  {LABELS[setting.category]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {setting.autoSaveEnabled
                    ? "Allowed by category"
                    : "Disabled by you"}
                </p>
              </div>
              <Button
                size="sm"
                variant={setting.autoSaveEnabled ? "outline" : "secondary"}
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

      <Card>
        <CardHeader>
          <CardTitle>Current memory</CardTitle>
          <CardDescription>
            Search, inspect, edit, or delete your private entries. Deleted rows
            remain visible during their separate retention window.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-2.5 size-4 text-muted-foreground"
              />
              <Label className="sr-only" htmlFor="memory-search">
                Search private memory
              </Label>
              <Input
                id="memory-search"
                className="pl-9"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Search title or context"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleted((value) => !value)}
            >
              {showDeleted ? "Hide deleted" : "Show deleted"}
            </Button>
          </div>
          {query.isLoading ? (
            <div className="space-y-2">
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
          {!query.isLoading && entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No matching private memory.
            </p>
          ) : null}
          <ul className="divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="space-y-3 py-4">
                {editingId === entry.id ? (
                  <EntryEditor
                    entry={entry}
                    pending={mutation.isPending}
                    onCancel={() => setEditingId(undefined)}
                    onSave={(values) =>
                      mutation.mutate({
                        method: "PATCH",
                        body: {
                          action: "edit",
                          entryId: entry.id,
                          expectedVersion: entry.version,
                          ...values,
                        },
                      })
                    }
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.title}</p>
                          <Badge variant="outline">
                            {LABELS[entry.category]}
                          </Badge>
                          {entry.isDeleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {entry.content}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Version {entry.version} ·{" "}
                          {entry.source.replace("_", " ")} ·{" "}
                          {formatTime(entry.updatedAt)}
                        </p>
                      </div>
                      {!entry.isDeleted ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(entry.id)}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button size="sm" variant="destructive">
                                  Delete
                                </Button>
                              }
                            />
                            <AlertDialogContent>
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
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() =>
                                    mutation.mutate({
                                      method: "DELETE",
                                      body: {
                                        entryId: entry.id,
                                        expectedVersion: entry.version,
                                      },
                                    })
                                  }
                                >
                                  Confirm delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History aria-hidden="true" className="size-5" />
            Immutable history
          </CardTitle>
          <CardDescription>
            Created, edited, and deleted versions are recorded separately from
            run logs so the retention policy can evolve independently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(query.data?.history.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              No memory history yet.
            </p>
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
                    {LABELS[record.category]} · {formatTime(record.changedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
