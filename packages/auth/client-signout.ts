export interface ServerSignOutResult {
  ok: boolean;
  message?: string;
}

function normalizeSignOutMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }
  return "Unable to sign out. Please try again.";
}

/**
 * Attempts server-side sign-out first so auth cookies are invalidated safely.
 * Returns `{ ok: false }` when server sign-out cannot be confirmed.
 */
export async function signOutOnServer(): Promise<ServerSignOutResult> {
  try {
    const response = await fetch("/api/auth/signout", { method: "POST" });
    if (response.ok) {
      return { ok: true };
    }

    const payload = await response.json().catch(() => null);
    const message = normalizeSignOutMessage(payload);
    console.error("[auth] server signout failed", {
      status: response.status,
      message,
    });
    return { ok: false, message };
  } catch (error) {
    console.error("[auth] server signout request failed", error);
    return { ok: false, message: "Unable to sign out. Please try again." };
  }
}
