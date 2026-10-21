export async function runFixtureCleanup(
  operations,
  { timeoutMs = 16_000 } = {},
) {
  const failures = [];
  for (const { label, run } of operations) {
    let timer;
    let expired = false;
    try {
      await Promise.race([
        Promise.resolve().then(run),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            expired = true;
            reject(new Error("Fixture cleanup deadline"));
          }, timeoutMs);
        }),
      ]);
    } catch {
      // Retain only repository-owned labels, never provider errors or identities.
      failures.push({ label, reason: expired ? "timeout" : "failed" });
    } finally {
      clearTimeout(timer);
    }
  }
  return failures;
}

export function isDeniedSelfRoleUpdate(result, persistedRole) {
  const denied = result.error
    ? result.status === 403 &&
      result.error.code === "42501" &&
      result.data === null
    : result.status === 200 &&
      Array.isArray(result.data) &&
      result.data.length === 0;
  return denied && persistedRole === "donor";
}
