process.env.SKIP_ENV_VALIDATION ??= "1";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "example-anon-key";
process.env.PAYLOAD_SECRET = "unit-test-payload-secret";

/** Prevent CMS/auth unit tests from opening real Supabase when .env.local sets a service role key. */
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

const localStorageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);

if (!localStorageDescriptor || "get" in localStorageDescriptor) {
  const storage = new Map<string, string>();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: true,
    value: {
      get length() {
        return storage.size;
      },
      clear() {
        storage.clear();
      },
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      key(index: number) {
        return Array.from(storage.keys())[index] ?? null;
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      setItem(key: string, value: string) {
        storage.set(key, String(value));
      },
    },
  });
}
