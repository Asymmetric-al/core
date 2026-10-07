"use client";

import {
  BookmarkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import {
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
  useEffect,
  useRef,
} from "react";

import { cn } from "@asym/ui/lib/utils";

import { countActiveFilters, createEmptyFilterState } from "./types";
import { Button } from "../../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { Input } from "../../input";
import { Label } from "../../label";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { Textarea } from "../../textarea";

import type { AdvancedFilterState, SavedFilter } from "./types";

interface SavedFiltersProps {
  savedFilters: SavedFilter[];
  currentFilter: AdvancedFilterState;
  onApplyFilter: (filter: AdvancedFilterState) => void;
  onSaveFilter: (name: string, description?: string) => void;
  onDeleteFilter: (id: string) => void;
  onUpdateFilter: (id: string, name: string, description?: string) => void;
  onSetDefault: (id: string | null) => void;
  className?: string;
}

export function SavedFilters({
  savedFilters,
  currentFilter,
  onApplyFilter,
  onSaveFilter,
  onDeleteFilter,
  onUpdateFilter,
  onSetDefault,
  className,
}: SavedFiltersProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const editNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingFilter) return;
    editNameInputRef.current?.focus();
  }, [editingFilter]);

  const activeCount = countActiveFilters(currentFilter);
  savedFilters.find((f) => f.isDefault);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    onSaveFilter(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    setSaveDialogOpen(false);
  }, [name, description, onSaveFilter]);

  const handleUpdate = useCallback(() => {
    if (!editingFilter || !name.trim()) return;
    onUpdateFilter(
      editingFilter.id,
      name.trim(),
      description.trim() || undefined,
    );
    setEditingFilter(null);
    setName("");
    setDescription("");
  }, [editingFilter, name, description, onUpdateFilter]);

  const handleStartEdit = useCallback((filter: SavedFilter) => {
    setEditingFilter(filter);
    setName(filter.name);
    setDescription(filter.description ?? "");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingFilter(null);
    setName("");
    setDescription("");
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger
          aria-label="Saved Views"
          render={
            <Button variant="outline" size="default">
              <BookmarkIcon className="size-4" />
              <span className="hidden sm:inline">Saved Views</span>
              {savedFilters.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {savedFilters.length}
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-72" align="start">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm font-medium">Saved Views</span>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={activeCount === 0}
                    >
                      <PlusIcon className="size-3" />
                      Save current
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save View</DialogTitle>
                    <DialogDescription>
                      Save your current filter configuration as a named view.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Active donors this month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this view shows..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setSaveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                      Save View
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {savedFilters.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No saved views yet.
                <br />
                Apply filters and save them for quick access.
              </div>
            ) : (
              <div className="space-y-0.5">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                  >
                    {editingFilter?.id === filter.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          aria-label="Rename saved view"
                          ref={editNameInputRef}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleUpdate}
                          aria-label="Confirm rename"
                        >
                          <CheckIcon className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleCancelEdit}
                          aria-label="Cancel rename"
                        >
                          <Trash2Icon className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onApplyFilter(filter.filter)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {filter.name}
                            </span>
                            {filter.isDefault && (
                              <span className="text-xs text-muted-foreground">
                                (default)
                              </span>
                            )}
                          </div>
                          {filter.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {filter.description}
                            </p>
                          )}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Open actions"
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontalIcon className="size-3" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onApplyFilter(filter.filter)}
                            >
                              Apply
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStartEdit(filter)}
                            >
                              <PencilIcon className="size-3 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onSetDefault(
                                  filter.isDefault ? null : filter.id,
                                )
                              }
                            >
                              {filter.isDefault
                                ? "Remove default"
                                : "Set as default"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteFilter(filter.id)}
                              variant="destructive"
                            >
                              <Trash2Icon className="size-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeCount > 0 && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplyFilter(createEmptyFilterState())}
                  className="w-full"
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface UseSavedFiltersOptions {
  storageKey: string;
  onApply?: (filter: AdvancedFilterState) => void;
}

const EMPTY_SAVED_FILTERS: SavedFilter[] = [];
const savedFiltersCache = new Map<
  string,
  { raw: string | null; filters: SavedFilter[] }
>();
const savedFiltersListeners = new Map<string, Set<() => void>>();

function createLocalStorageSubscribe(key: string) {
  return (callback: () => void) => {
    const listeners = savedFiltersListeners.get(key) ?? new Set<() => void>();
    listeners.add(callback);
    savedFiltersListeners.set(key, listeners);
    const handler = (e: StorageEvent) => {
      if (e.key === key || e.key === null) callback();
    };
    window.addEventListener("storage", handler);
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) savedFiltersListeners.delete(key);
      window.removeEventListener("storage", handler);
    };
  };
}

function getLocalStorageSnapshot(key: string): SavedFilter[] {
  try {
    const stored = localStorage.getItem(key);
    const cached = savedFiltersCache.get(key);
    if (cached?.raw === stored) return cached.filters;
    let filters = EMPTY_SAVED_FILTERS;
    try {
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) filters = parsed as SavedFilter[];
    } catch {
      // An unreadable saved view does not prevent using the table.
    }
    savedFiltersCache.set(key, { raw: stored, filters });
    return filters;
  } catch {
    return EMPTY_SAVED_FILTERS;
  }
}

function getServerSnapshot(): SavedFilter[] {
  return EMPTY_SAVED_FILTERS;
}

export function useSavedFilters({
  storageKey,
  onApply,
}: UseSavedFiltersOptions) {
  const fullKey = `saved-filters-${storageKey}`;

  const subscribe = useCallback(
    (callback: () => void) => createLocalStorageSubscribe(fullKey)(callback),
    [fullKey],
  );

  const getSnapshot = useCallback(
    () => getLocalStorageSnapshot(fullKey),
    [fullKey],
  );

  const savedFilters = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const persistFilters = useCallback(
    (filters: SavedFilter[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(fullKey, JSON.stringify(filters));
        for (const listener of savedFiltersListeners.get(fullKey) ?? [])
          listener();
      }
    },
    [fullKey],
  );

  const saveFilter = useCallback(
    (
      currentFilter: AdvancedFilterState,
      name: string,
      description?: string,
    ) => {
      const newFilter: SavedFilter = {
        id: crypto.randomUUID(),
        name,
        description,
        filter: currentFilter,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      persistFilters([...savedFilters, newFilter]);
    },
    [savedFilters, persistFilters],
  );

  const deleteFilter = useCallback(
    (id: string) => {
      persistFilters(savedFilters.filter((f) => f.id !== id));
    },
    [savedFilters, persistFilters],
  );

  const updateFilter = useCallback(
    (id: string, name: string, description?: string) => {
      persistFilters(
        savedFilters.map((f) =>
          f.id === id ? { ...f, name, description, updatedAt: new Date() } : f,
        ),
      );
    },
    [savedFilters, persistFilters],
  );

  const setDefault = useCallback(
    (id: string | null) => {
      persistFilters(
        savedFilters.map((f) => ({
          ...f,
          isDefault: f.id === id,
        })),
      );
    },
    [savedFilters, persistFilters],
  );

  const applyFilter = useCallback(
    (filter: AdvancedFilterState) => {
      onApply?.(filter);
    },
    [onApply],
  );

  const defaultFilter = useMemo(() => {
    return savedFilters.find((f) => f.isDefault)?.filter ?? null;
  }, [savedFilters]);

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    updateFilter,
    setDefault,
    applyFilter,
    defaultFilter,
  };
}
