"use client";

import { registerClientSessionCleanup } from "@asym/auth/client-session";
import { useAuth } from "@asym/auth/use-auth";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { ReactNode } from "react";

export type RetainedDraftOwner = {
  userId: string;
  tenantId: string;
  contextId: string;
};

type DraftEntry<Value> = { value: Value; revision: number; dirty: boolean };
type DraftUpdateOptions = { dirty?: boolean };
type DraftSaveOptions = { automatic?: boolean };
export type RetainedDraftSave<Value> = DraftEntry<Value> & {
  resource: string;
  automatic: boolean;
  isCurrent: () => boolean;
  canDispatch: () => boolean;
};

class DraftStore {
  private entries = new Map<string, DraftEntry<unknown>>();
  private saves = new Set<RetainedDraftSave<unknown>>();
  private generations = new Map<string, number>();
  private unreadable = new Set<string>();
  private unwritable = new Set<string>();
  private automaticBlocked = new Set<string>();
  private listeners = new Set<() => void>();
  private version = 0;
  private sequence = 0;
  private epoch = 0;
  private active: boolean;
  private writable = true;

  constructor(private owned: boolean) {
    this.active = owned;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getVersion = () => this.version;
  isActive = () => this.active;
  canRead = (resource: string) => this.active && !this.unreadable.has(resource);
  canWrite = (resource: string) =>
    this.active &&
    this.writable &&
    !this.unreadable.has(resource) &&
    !this.unwritable.has(resource);
  canAutosave = (resource: string) =>
    this.canWrite(resource) && !this.automaticBlocked.has(resource);
  isDirty = (resource: string) => this.entries.get(resource)?.dirty ?? false;
  hasWork = () =>
    [...this.entries.values()].some((entry) => entry.dirty) ||
    this.saves.size > 0;
  private publish() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }

  activate() {
    this.active = this.owned;
  }
  close = () => {
    this.active = false;
    this.epoch += 1;
    this.entries.clear();
    this.saves.clear();
    this.publish();
  };
  captureCleanup = () => {
    const epoch = this.epoch;
    return () => {
      if (epoch !== this.epoch) return false;
      this.close();
      return true;
    };
  };
  setWritable(writable: boolean) {
    if (writable === this.writable) return;
    if (!writable)
      for (const resource of this.entries.keys()) {
        this.automaticBlocked.add(resource);
        this.generations.set(
          resource,
          (this.generations.get(resource) ?? 0) + 1,
        );
      }
    this.writable = writable;
    this.publish();
  }
  read<Value>(resource: string) {
    if (!this.active || this.unreadable.has(resource)) return null;
    return (
      (this.entries.get(resource) as DraftEntry<Value> | undefined) ?? null
    );
  }
  update<Value>(
    resource: string,
    value: Value,
    options: DraftUpdateOptions = {},
  ) {
    if (!this.canWrite(resource)) return;
    const dirty = options.dirty ?? true;
    this.entries.set(resource, { value, revision: ++this.sequence, dirty });
    if (dirty) this.automaticBlocked.delete(resource);
    this.publish();
  }
  discard(resource: string) {
    if (!this.active) return;
    this.entries.delete(resource);
    this.generations.set(resource, (this.generations.get(resource) ?? 0) + 1);
    this.publish();
  }
  revoke(resource: string, read: boolean) {
    if (!this.active) return;
    this.unwritable.add(resource);
    this.automaticBlocked.add(resource);
    if (read) {
      this.discard(resource);
      this.unreadable.add(resource);
      for (const save of this.saves)
        if (save.resource === resource) this.saves.delete(save);
    } else {
      this.generations.set(resource, (this.generations.get(resource) ?? 0) + 1);
    }
    this.publish();
  }
  beginSave<Value>(
    resource: string,
    options: DraftSaveOptions = {},
  ): RetainedDraftSave<Value> | null {
    const entry = this.read<Value>(resource);
    if (
      !entry ||
      !this.canWrite(resource) ||
      (options.automatic && !this.canAutosave(resource))
    )
      return null;
    if (
      !options.automatic &&
      [...this.saves].some(
        (save) =>
          save.resource === resource && !save.automatic && save.isCurrent(),
      )
    )
      return null;
    const epoch = this.epoch;
    const generation = this.generations.get(resource);
    const save = {
      ...entry,
      resource,
      automatic: options.automatic ?? false,
      isCurrent: () =>
        this.active &&
        epoch === this.epoch &&
        generation === this.generations.get(resource) &&
        !this.unreadable.has(resource),
      canDispatch: () => save.isCurrent() && this.canWrite(resource),
    };
    this.saves.add(save);
    this.publish();
    return save;
  }
  finishSave<Value>(
    save: RetainedDraftSave<Value>,
    saved: boolean,
    rebase?: (value: Value) => Value,
    options: { retain?: boolean } = {},
  ) {
    if (!this.saves.delete(save)) return false;
    const current = this.read<Value>(save.resource);
    const matches =
      saved && save.isCurrent() && current?.revision === save.revision;
    if (matches && options.retain)
      this.entries.set(save.resource, {
        ...current,
        value: rebase ? rebase(current.value) : current.value,
        dirty: false,
      });
    else if (matches) this.entries.delete(save.resource);
    else if (saved && save.isCurrent() && current)
      this.entries.set(save.resource, {
        ...current,
        value: rebase ? rebase(current.value) : current.value,
        dirty: true,
      });
    this.publish();
    return matches;
  }
  isSaving(resource: string) {
    return [...this.saves].some(
      (save) => save.resource === resource && save.isCurrent(),
    );
  }
}

const DraftContext = createContext<DraftStore | null>(null);

function OwnedDraftProvider({
  children,
  owned,
  writable,
}: {
  children: ReactNode;
  owned: boolean;
  writable: boolean;
}) {
  const [store] = useState(() => new DraftStore(owned));
  useLayoutEffect(() => {
    store.setWritable(writable);
  }, [store, writable]);
  useLayoutEffect(() => {
    store.activate();
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    let listening = false;
    const sync = () => {
      const needed = store.hasWork();
      if (needed === listening) return;
      listening = needed;
      if (needed) window.addEventListener("beforeunload", warn);
      else window.removeEventListener("beforeunload", warn);
    };
    const unsubscribe = store.subscribe(sync);
    const unregister = registerClientSessionCleanup(store.captureCleanup);
    sync();
    return () => {
      store.close();
      unsubscribe();
      unregister();
      window.removeEventListener("beforeunload", warn);
    };
  }, [store]);
  return <DraftContext value={store}>{children}</DraftContext>;
}

export function RetainedDraftProvider({
  children,
  owner,
  writable = true,
}: {
  children: ReactNode;
  owner: RetainedDraftOwner | null;
  writable?: boolean;
}) {
  const key = owner
    ? JSON.stringify([owner.userId, owner.tenantId, owner.contextId])
    : "signed-out";
  return (
    <OwnedDraftProvider key={key} owned={owner !== null} writable={writable}>
      {children}
    </OwnedDraftProvider>
  );
}

export function SessionRetainedDraftProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  // Identity scopes memory; route/API policies own access. A base profile role
  // cannot establish portal permissions, which also come from memberships.
  const owner =
    !loading && user && profile?.tenant_id
      ? { userId: user.id, tenantId: profile.tenant_id, contextId: profile.id }
      : null;
  return (
    <RetainedDraftProvider owner={owner}>{children}</RetainedDraftProvider>
  );
}

export function useRetainedDraft<Value>(resource: string) {
  const store = useContext(DraftContext);
  if (!store)
    throw new Error("Retained drafts require a root RetainedDraftProvider");
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const update = useCallback(
    (value: Value, options?: DraftUpdateOptions) =>
      store.update(resource, value, options),
    [store, resource],
  );
  const read = useCallback(
    () => store.read<Value>(resource)?.value ?? null,
    [store, resource],
  );
  const discard = useCallback(() => store.discard(resource), [store, resource]);
  const beginSave = useCallback(
    (options?: DraftSaveOptions) => store.beginSave<Value>(resource, options),
    [store, resource],
  );
  const finishSave = useCallback(
    (
      save: RetainedDraftSave<Value>,
      saved: boolean,
      rebase?: (value: Value) => Value,
      options?: { retain?: boolean },
    ) => store.finishSave(save, saved, rebase, options),
    [store],
  );
  const revokeWrite = useCallback(
    () => store.revoke(resource, false),
    [store, resource],
  );
  const revokeRead = useCallback(
    () => store.revoke(resource, true),
    [store, resource],
  );
  const isCurrent = useCallback(
    () => store.canRead(resource),
    [store, resource],
  );
  return {
    value: read(),
    read,
    update,
    discard,
    beginSave,
    finishSave,
    revokeWrite,
    revokeRead,
    dirty: store.isDirty(resource),
    canRead: store.canRead(resource),
    canWrite: store.canWrite(resource),
    canAutosave: store.canAutosave(resource),
    isCurrent,
    isSaving: store.isSaving(resource),
  };
}
