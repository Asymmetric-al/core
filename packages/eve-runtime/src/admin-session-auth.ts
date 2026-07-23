import {
  authorizeEveAdminRouteRequest,
  claimEveSessionFromAuthSnapshot,
  EveRouteAuthError,
  toEveSessionAuthSnapshot,
} from "@asym/api/eve/session-ownership";
import {
  ForbiddenError,
  UnauthenticatedError,
  type AuthFn,
} from "eve/channels/auth";

import type { EveChannelEvents } from "eve/channels/eve";

function isLoopbackVerificationRequest(request: Request): boolean {
  if (process.argv[2] !== "eval") {
    return false;
  }

  const hostname = new URL(request.url).hostname;
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "::1" ||
    hostname.startsWith("127.")
  );
}

export const adminEveRouteAuth: AuthFn<Request> = async (request) => {
  // Preserve #425's offline deterministic eval without trusting Host alone.
  // Eve runs local evals in this process with the `eval` CLI command, and the
  // following localDev() authenticator independently rechecks loopback.
  if (isLoopbackVerificationRequest(request)) {
    return null;
  }

  try {
    const identity = await authorizeEveAdminRouteRequest(request);
    return toEveSessionAuthSnapshot(identity);
  } catch (error) {
    if (!(error instanceof EveRouteAuthError)) {
      throw error;
    }

    if (error.status === 401) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "A verified admin session is required.",
      });
    }

    throw new ForbiddenError({
      message:
        error.status === 503
          ? "Eve session authorization is unavailable."
          : "The current admin does not own this Eve session.",
    });
  }
};

export const adminEveSessionEvents: EveChannelEvents = {
  async "turn.started"(_data, _channel, context) {
    await claimEveSessionFromAuthSnapshot({
      auth: context.session.auth.current,
      sessionId: context.session.id,
    });
  },
};
