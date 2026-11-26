import { afterEach, describe, expect, it, vi } from "vitest";

import { readBrowserStores } from "../../e2e/helpers/browser-stores";

type StoreSpec = { rows: unknown[]; fails?: boolean };
type DatabaseSpec = { fails?: boolean; stores: Record<string, StoreSpec> };

function fakeStorage(items: Record<string, string>) {
  const keys = Object.keys(items);
  return {
    get length() {
      return keys.length;
    },
    key: (index: number) => keys[index] ?? null,
    getItem: (key: string) => items[key] ?? null,
  };
}

function settle<T>(fails: boolean | undefined, result: T) {
  const request: {
    result?: T;
    onsuccess: null | (() => void);
    onerror: null | (() => void);
  } = { onsuccess: null, onerror: null };
  queueMicrotask(() => {
    if (fails) {
      request.onerror?.();
      return;
    }
    request.result = result;
    request.onsuccess?.();
  });
  return request;
}

function fakeIndexedDb(databases: Record<string, DatabaseSpec>) {
  return {
    databases: async () =>
      Object.keys(databases).map((name) => ({ name, version: 1 })),
    open: (name: string) => {
      const spec = databases[name]!;
      return settle(spec.fails, {
        objectStoreNames: Object.keys(spec.stores),
        transaction: () => ({
          objectStore: (store: string) => ({
            getAll: () =>
              settle(spec.stores[store]!.fails, spec.stores[store]!.rows),
          }),
        }),
        close: () => undefined,
      });
    },
  };
}

function browser(indexedDb: unknown) {
  vi.stubGlobal("indexedDB", indexedDb);
  vi.stubGlobal("window", {
    localStorage: fakeStorage({ theme: "dark" }),
    sessionStorage: fakeStorage({}),
  });
  vi.stubGlobal("document", { cookie: "seen=1" });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AL-2675 WP2c part 2a, F4: the journey's read of the browser's stores", () => {
  it("names a database that cannot be opened as unreadable", async () => {
    browser(
      fakeIndexedDb({
        broken: { fails: true, stores: {} },
        fine: { stores: { rows: { rows: [{ a: 1 }] } } },
      }),
    );
    expect((await readBrowserStores()).unreadable).toEqual(["broken"]);
  });

  it("names a store whose rows cannot be read as unreadable, and keeps the rows it could read", async () => {
    browser(
      fakeIndexedDb({
        app: {
          stores: {
            secrets: { rows: [], fails: true },
            settings: { rows: [{ key: "x" }] },
          },
        },
      }),
    );
    const stores = await readBrowserStores();
    expect(stores.unreadable).toEqual(["app/secrets"]);
    expect(JSON.stringify(stores.databases)).toContain('"key":"x"');
  });

  it("passes an empty database and an empty store, and returns everything it read", async () => {
    browser(
      fakeIndexedDb({
        empty: { stores: {} },
        app: { stores: { rows: { rows: [] } } },
      }),
    );
    const stores = await readBrowserStores();
    expect(stores.unreadable).toEqual([]);
    expect(stores.local).toEqual([["theme", "dark"]]);
    expect(stores.cookie).toBe("seen=1");
    expect(stores.databases).toHaveLength(2);
  });

  it("names IndexedDB itself as unreadable when the browser cannot list its databases", async () => {
    browser({ open: () => undefined });
    expect((await readBrowserStores()).unreadable).toEqual(["indexedDB"]);
    browser({
      databases: async () => {
        throw new Error("denied");
      },
      open: () => undefined,
    });
    expect((await readBrowserStores()).unreadable).toEqual(["indexedDB"]);
  });
});
