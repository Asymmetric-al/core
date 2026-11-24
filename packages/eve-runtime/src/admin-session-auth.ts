import {
  authorizeEveAdminRouteRequest,
  claimEveSessionFromAuthSnapshot,
  EveRouteAuthError,
  toEveSessionAuthSnapshot,
} from "@asym/api/eve/session-ownership";
import {
  mutationMediaType,
  trustedMutationSource,
} from "@asym/auth/request-headers";
import {
  ForbiddenError,
  UnauthenticatedError,
  type AuthFn,
} from "eve/channels/auth";

import type {
  HttpRouteDefinition,
  RouteDefinition,
  SendFn,
} from "eve/channels";
import type { EveChannel, EveChannelEvents } from "eve/channels/eve";

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

// Every write method (fix check M3). Eve 0.25.1's client sends
// `content-type: application/json` on each POST, the bodyless cancel call
// included, so a cookie-carrying write needs no empty-write exception.
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const adminEveRouteAuth: AuthFn<Request> = async (request) => {
  if (
    WRITE_METHODS.has(request.method) &&
    request.headers.has("cookie") &&
    (!trustedMutationSource(request) ||
      mutationMediaType(request) !== "application/json")
  ) {
    throw new ForbiddenError({
      message: "Eve session writes require same-origin JSON.",
    });
  }

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

const SESSION_CREATE_ROUTE_PATH = "/eve/v1/session";
const SESSION_CONTINUE_ROUTE_PATH = "/eve/v1/session/:sessionId";

function wrapRouteForSessionClaim(
  route: HttpRouteDefinition,
  claimAlways: boolean,
): HttpRouteDefinition {
  const originalHandler = route.handler;
  return {
    ...route,
    handler(request, args) {
      const originalSend = args.send;
      const send: SendFn = async (input, options) => {
        const session = await originalSend(input, options);
        if (claimAlways || session.id !== args.params.sessionId) {
          await claimEveSessionFromAuthSnapshot({
            auth: options.auth,
            sessionId: session.id,
          });
        }
        return session;
      };
      return originalHandler(request, {
        ...args,
        send,
      });
    },
  };
}

export function withAdminSessionCreationClaim(channel: EveChannel): EveChannel {
  const routes: readonly RouteDefinition[] = channel.routes.map((route) => {
    if (route.transport === "websocket" || route.method !== "POST") {
      return route;
    }
    if (route.path === SESSION_CREATE_ROUTE_PATH) {
      return wrapRouteForSessionClaim(route, true);
    }
    if (route.path === SESSION_CONTINUE_ROUTE_PATH) {
      return wrapRouteForSessionClaim(route, false);
    }
    return route;
  });

  return {
    ...channel,
    routes,
  };
}
