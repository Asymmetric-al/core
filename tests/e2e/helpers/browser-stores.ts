export interface BrowserStores {
  local: Array<[string, string | null]>;
  session: Array<[string, string | null]>;
  cookie: string;
  databases: unknown[];
}

export async function readBrowserStores(): Promise<BrowserStores> {
  const entries = (storage: Storage) => {
    const out: Array<[string, string | null]> = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key !== null) out.push([key, storage.getItem(key)]);
    }
    return out;
  };
  const databases: unknown[] = [];
  if (typeof indexedDB.databases === "function") {
    for (const info of await indexedDB.databases()) {
      if (!info.name) continue;
      databases.push(
        await new Promise<unknown>((resolve) => {
          const opened = indexedDB.open(info.name!);
          opened.onerror = () => resolve({ name: info.name, error: true });
          opened.onsuccess = () => {
            const db = opened.result;
            const stores = Array.from(db.objectStoreNames);
            if (stores.length === 0) {
              db.close();
              resolve({ name: info.name, stores: [] });
              return;
            }
            const tx = db.transaction(stores, "readonly");
            const result: Record<string, unknown> = {};
            let remaining = stores.length;
            for (const store of stores) {
              const all = tx.objectStore(store).getAll();
              const done = () => {
                remaining -= 1;
                if (remaining === 0) {
                  db.close();
                  resolve({ name: info.name, result });
                }
              };
              all.onsuccess = () => {
                result[store] = all.result;
                done();
              };
              all.onerror = done;
            }
          };
        }),
      );
    }
  }
  return {
    local: entries(window.localStorage),
    session: entries(window.sessionStorage),
    cookie: document.cookie,
    databases,
  };
}
