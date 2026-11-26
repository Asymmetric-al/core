export interface BrowserStores {
  local: Array<[string, string | null]>;
  session: Array<[string, string | null]>;
  cookie: string;
  databases: unknown[];
  unreadable: string[];
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
  const unreadable: string[] = [];
  const readDatabase = (name: string) =>
    new Promise<void>((resolve) => {
      const refuse = (what: string) => {
        unreadable.push(what);
        resolve();
      };
      let opened: IDBOpenDBRequest;
      try {
        opened = indexedDB.open(name);
      } catch {
        refuse(name);
        return;
      }
      opened.onerror = () => refuse(name);
      opened.onsuccess = () => {
        const db = opened.result;
        const stores = Array.from(db.objectStoreNames);
        if (stores.length === 0) {
          db.close();
          databases.push({ name, stores: [] });
          resolve();
          return;
        }
        let tx: IDBTransaction;
        try {
          tx = db.transaction(stores, "readonly");
        } catch {
          db.close();
          refuse(name);
          return;
        }
        const result: Record<string, unknown> = {};
        let remaining = stores.length;
        const done = () => {
          remaining -= 1;
          if (remaining > 0) return;
          db.close();
          databases.push({ name, result });
          resolve();
        };
        for (const store of stores) {
          const all = tx.objectStore(store).getAll();
          all.onsuccess = () => {
            result[store] = all.result;
            done();
          };
          all.onerror = () => {
            unreadable.push(`${name}/${store}`);
            done();
          };
        }
      };
    });
  let listed: IDBDatabaseInfo[] | null = null;
  try {
    if (typeof indexedDB.databases === "function") {
      listed = await indexedDB.databases();
    }
  } catch {
    listed = null;
  }
  if (listed === null) unreadable.push("indexedDB");
  for (const info of listed ?? []) {
    if (info.name) await readDatabase(info.name);
    else unreadable.push("indexedDB/(no name)");
  }
  return {
    local: entries(window.localStorage),
    session: entries(window.sessionStorage),
    cookie: document.cookie,
    databases,
    unreadable,
  };
}
