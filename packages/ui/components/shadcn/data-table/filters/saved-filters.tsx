"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import {
  BookmarkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import { cn } from "@asym/ui/lib/utils";
import { Button } from "../../button";
import { Input } from "../../input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../popover";
import { Textarea } from "../../textarea";
import { Label } from "../../label";
import type { AdvancedFilterState, SavedFilter } from "./types";
import { countActiveFilters, createEmptyFilterState } from "./types";

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

  const activeCount = countActiveFilters(currentFilter);
  const defaultFilter = savedFilters.find((f) => f.isDefault);

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
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
            <BookmarkIcon className="size-4" />
            <span className="hidden sm:inline">Saved Views</span>
            {savedFilters.length > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {savedFilters.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm font-medium">Saved Views</span>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={activeCount === 0}
                  >
                    <PlusIcon className="size-3" />
                    Save current
                  </Button>
                </DialogTrigger>
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
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={handleUpdate}
                        >
                          <CheckIcon className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={handleCancelEdit}
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
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontalIcon className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
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
                              className="text-destructive"
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
                  className="w-full h-8 text-xs"
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

function createLocalStorageSubscribe(key: string) {
  return (callback: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) callback();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  };
}

function getLocalStorageSnapshot(key: string): SavedFilter[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): SavedFilter[] {
  return [];
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
  const [, forceUpdate] = useState(0);

  const persistFilters = useCallback(
    (filters: SavedFilter[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(fullKey, JSON.stringify(filters));
        forceUpdate((v) => v + 1);
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
