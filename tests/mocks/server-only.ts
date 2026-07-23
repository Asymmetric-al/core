/**
 * Vitest runs in Node — a server context — so the `server-only` marker
 * package (which throws when bundled into a client component) is a no-op
 * here, mirroring how Next.js treats server modules at runtime.
 */
export {};
