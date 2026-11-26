import type { APIRequestContext, Request } from "@playwright/test";

export type Read = {
  where: string;
  named: boolean;
  text: string | null;
  reason: string;
  readAgain?: boolean;
};

const NOT_REPLAYED = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "cookie",
  "host",
]);

function isRouteDataTheRouterAborted(request: Request, failure: string) {
  const headers = request.headers();
  return (
    request.method() === "GET" &&
    failure === "net::ERR_ABORTED" &&
    !request.isNavigationRequest() &&
    request.resourceType() === "fetch" &&
    headers.rsc === "1" &&
    headers["next-router-prefetch"] === undefined
  );
}

export async function readFailedRequest(
  api: APIRequestContext,
  request: Request,
  where: string,
  named: boolean,
): Promise<Read> {
  const failure = request.failure()?.errorText ?? "failed";
  if (!named || !isRouteDataTheRouterAborted(request, failure)) {
    return { where, named, text: null, reason: failure };
  }
  try {
    const sent = await request.allHeaders();
    const headers = Object.fromEntries(
      Object.entries(sent).filter(
        ([name]) => !name.startsWith(":") && !NOT_REPLAYED.has(name),
      ),
    );
    const response = await api.get(request.url(), {
      headers,
      maxRedirects: 0,
    });
    if (response.status() !== 200) {
      return {
        where,
        named: true,
        text: null,
        reason: `${failure}; read again: ${response.status()}`,
      };
    }
    const body = (await response.body()).toString("utf8");
    return {
      where,
      named: true,
      text: `${JSON.stringify(response.headers())}\n${body}`,
      reason: "",
      readAgain: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message.split("\n")[0]! : "";
    return {
      where,
      named: true,
      text: null,
      reason: `${failure}; read again: ${message}`,
    };
  }
}
