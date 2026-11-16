import { timingSafeEqual } from "node:crypto";

export type Configuration = ReturnType<typeof configuration>;

export function configuration(
  env: Record<string, string | undefined> = process.env,
) {
  const required = (key: string) => {
    const value = env[key]?.trim();
    if (!value) throw new Error(`Missing ${key}`);
    return value;
  };
  const origin = new URL(required("CONSOLE_ORIGIN"));
  const backend = new URL(required("ARCHON_URL"));
  for (const url of [origin, backend]) {
    if (
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        "Only explicit loopback HTTP origins are supported; use an authenticated SSH tunnel",
      );
    }
  }
  const password = required("CONSOLE_PASSWORD");
  if (password.length < 24)
    throw new Error("CONSOLE_PASSWORD must contain at least 24 characters");
  const owner = required("CONSOLE_OWNER");
  if (owner.includes(":")) throw new Error("Invalid owner alias");
  return {
    origin: origin.origin,
    backend: backend.origin,
    owner,
    password,
    codebaseId: required("ARCHON_CODEBASE_ID"),
    storeId: required("ARCHON_STORE_ID"),
  };
}

export function authorize(
  request: Request,
  config: Configuration,
): Response | null {
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(
    `Basic ${Buffer.from(`${config.owner}:${config.password}`).toString("base64")}`,
  );
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return Response.json(
      { error: "Owner authentication required" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Core Console", charset="UTF-8"',
          "Cache-Control": "no-store",
        },
      },
    );
  }
  const expectedOrigin = new URL(config.origin);
  const internalUrl = new URL(request.url);
  const host = request.headers.get("host") ?? internalUrl.host;
  if (
    host !== expectedOrigin.host ||
    internalUrl.protocol !== expectedOrigin.protocol ||
    internalUrl.port !== expectedOrigin.port ||
    !["localhost", "127.0.0.1", "[::1]"].includes(internalUrl.hostname) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return Response.json(
      { error: "Unexpected Console origin" },
      { status: 403 },
    );
  }
  if (
    !["GET", "HEAD"].includes(request.method) &&
    request.headers.get("origin") !== config.origin
  ) {
    return Response.json(
      { error: "Same-origin action required" },
      { status: 403 },
    );
  }
  return null;
}
