export const TWENTY_BATCH_SIZE = 60;
export const TWENTY_RATE_LIMIT_RPM = 100;

type TwentyMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD";
type QueryValue = string | number | boolean | null | undefined;

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const SAFE_METHODS = new Set<TwentyMethod>(["GET", "HEAD"]);

export interface TwentyCoreClientOptions {
  apiBaseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  rateLimitRpm?: number;
}

export interface TwentyRequestOptions {
  method: TwentyMethod;
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  idempotencyKey?: string;
  retry?: {
    retries?: number;
  };
  signal?: AbortSignal;
}

export interface TwentyBatchCreateOptions {
  objectName: string;
  records: Array<Record<string, unknown>>;
  idempotencyKeyPrefix: string;
}

export class TwentyApiError extends Error {
  readonly status: number;
  readonly responseBody: unknown;

  constructor(message: string, status: number, responseBody: unknown) {
    super(message);
    this.name = "TwentyApiError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

class MinuteRateLimiter {
  private readonly requestTimestamps: number[] = [];

  constructor(private readonly maxRequestsPerMinute: number) {}

  async waitForSlot(): Promise<void> {
    if (this.maxRequestsPerMinute <= 0) {
      return;
    }

    const now = Date.now();
    const cutoff = now - 60_000;
    while (
      this.requestTimestamps.length > 0 &&
      this.requestTimestamps[0]! <= cutoff
    ) {
      this.requestTimestamps.shift();
    }

    if (this.requestTimestamps.length < this.maxRequestsPerMinute) {
      this.requestTimestamps.push(now);
      return;
    }

    const waitMs = this.requestTimestamps[0]! + 60_000 - now;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return this.waitForSlot();
  }
}

function normalizeBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
}

function buildUrl(
  apiBaseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const url = new URL(path.replace(/^\/+/, ""), normalizeBaseUrl(apiBaseUrl));

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function redactErrorBody(body: unknown): unknown {
  if (body === null || typeof body !== "object") {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map(redactErrorBody);
  }

  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      /authorization|token|secret|api.?key|password/i.test(key)
        ? "[redacted]"
        : redactErrorBody(value),
    ]),
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export class TwentyCoreClient {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly limiter: MinuteRateLimiter;

  constructor(options: TwentyCoreClientOptions) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.limiter = new MinuteRateLimiter(
      options.rateLimitRpm ?? TWENTY_RATE_LIMIT_RPM,
    );
  }

  async request<TResponse = unknown>(
    options: TwentyRequestOptions,
  ): Promise<TResponse> {
    const method = options.method.toUpperCase() as TwentyMethod;
    const safeMethod = SAFE_METHODS.has(method);
    const retries = options.retry?.retries ?? (safeMethod ? 2 : 0);

    if (!safeMethod && retries > 0 && !options.idempotencyKey) {
      throw new Error(
        "Twenty non-idempotent retries require an idempotency key.",
      );
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await this.limiter.waitForSlot();
        const response = await this.fetchOnce(method, options);
        const body = await parseResponseBody(response);

        if (response.ok) {
          return body as TResponse;
        }

        if (attempt < retries && TRANSIENT_STATUS_CODES.has(response.status)) {
          continue;
        }

        throw new TwentyApiError(
          `Twenty API request failed with status ${response.status}`,
          response.status,
          redactErrorBody(body),
        );
      } catch (error) {
        lastError = error;
        if (
          error instanceof TwentyApiError ||
          isAbortError(error) ||
          attempt >= retries
        ) {
          throw error;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Twenty API request failed.");
  }

  async listRecords<TRecord = unknown>(
    objectName: string,
    query?: Record<string, QueryValue>,
  ): Promise<TRecord> {
    return this.request<TRecord>({
      method: "GET",
      path: `/${objectName}`,
      query,
    });
  }

  async batchCreateRecords(
    options: TwentyBatchCreateOptions,
  ): Promise<unknown[]> {
    const results: unknown[] = [];

    for (
      let index = 0;
      index < options.records.length;
      index += TWENTY_BATCH_SIZE
    ) {
      const chunk = options.records.slice(index, index + TWENTY_BATCH_SIZE);
      results.push(
        await this.request({
          method: "POST",
          path: `/${options.objectName}/batch`,
          body: {
            records: chunk,
          },
          idempotencyKey: `${options.idempotencyKeyPrefix}:${index / TWENTY_BATCH_SIZE}`,
          retry: {
            retries: 2,
          },
        }),
      );
    }

    return results;
  }

  private async fetchOnce(
    method: TwentyMethod,
    options: TwentyRequestOptions,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const abortListener = () => controller.abort();
    options.signal?.addEventListener("abort", abortListener, { once: true });

    const headers = new Headers(options.headers);
    headers.set("authorization", `Bearer ${this.apiKey}`);
    headers.set("accept", "application/json");
    headers.set("content-type", "application/json");
    if (options.idempotencyKey) {
      headers.set("idempotency-key", options.idempotencyKey);
    }

    try {
      return await this.fetchImpl(
        buildUrl(this.apiBaseUrl, options.path, options.query),
        {
          method,
          headers,
          body:
            options.body === undefined
              ? undefined
              : JSON.stringify(options.body),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abortListener);
    }
  }
}
