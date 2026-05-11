/**
 * Dev-only diagnostics for noisy Next.js / Turbopack overlays:
 * `unhandledRejection: undefined` often follows a real failure (e.g. Payload DB
 * ECONNREFUSED) or an aborted RSC stream. The reason is lost before the client.
 */
process.on("unhandledRejection", (reason) => {
  if (reason !== undefined) return;
  console.error(
    "[@asym/admin] unhandledRejection: reason was `undefined`. If Web Studio shows Postgres errors, fix PAYLOAD_DATABASE_URI / SUPABASE_DB_URL or run local Postgres (e.g. supabase start -> 127.0.0.1:54322). Otherwise check the dev server terminal for the first thrown error above this line.",
  );
});

export {};
