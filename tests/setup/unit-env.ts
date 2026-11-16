import { beforeEach } from "vitest";

import { repositoryGitEnvironment } from "../../scripts/git/environment.mjs";

/**
 * Git hooks export checkout-local variables (`git rev-parse --local-env-vars`,
 * e.g. GIT_DIR from a linked worktree). Clear them for every test so temp-repo
 * helpers cannot write into the launching checkout (#2526).
 */
const repositoryEnvironment = repositoryGitEnvironment(process.env);
for (const name of Object.keys(process.env)) {
  if (!Object.hasOwn(repositoryEnvironment, name)) delete process.env[name];
}

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

beforeEach(() => {
  if (typeof MouseEvent !== "undefined") {
    globalThis.PointerEvent ??= MouseEvent as typeof PointerEvent;
  }

  if (typeof Element !== "undefined") {
    Element.prototype.getAnimations ??= function getAnimations() {
      return [];
    };
  }
});
