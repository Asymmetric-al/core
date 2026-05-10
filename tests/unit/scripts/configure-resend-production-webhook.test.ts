import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_RESEND_WEBHOOK_ENDPOINT,
  DEFAULT_RESEND_WEBHOOK_EVENTS,
  appendGithubEnvSecret,
  configureResendWebhook,
  mergeWebhookEvents,
  missingWebhookEvents,
  normalizeWebhook,
  parseEventSelection,
  selectWebhookForEndpoint,
  validateSigningSecret,
  webhooksFromListPayload,
} from "../../../scripts/configure-resend-production-webhook.mjs";

function makeResponse(body: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === null ? "" : JSON.stringify(body)),
  } as Response;
}

function makeFetch(routes: Record<string, unknown[]>) {
  const calls: Array<{ method: string; path: string; body?: unknown }> = [];

  const fetchImpl = async (url: string, init: RequestInit = {}) => {
    const parsed = new URL(url);
    const method = init.method ?? "GET";
    const key = `${method} ${parsed.pathname}`;
    const bodies = routes[key];
    if (!bodies || bodies.length === 0) {
      throw new Error(`Unexpected request: ${key}`);
    }

    calls.push({
      method,
      path: parsed.pathname,
      body:
        typeof init.body === "string" && init.body
          ? JSON.parse(init.body)
          : undefined,
    });

    const body = bodies.shift();
    return makeResponse(body);
  };

  return { fetchImpl, calls };
}

describe("configure Resend production webhook helpers", () => {
  it("parses default and explicit event selections", () => {
    expect(parseEventSelection("")).toEqual(DEFAULT_RESEND_WEBHOOK_EVENTS);
    expect(
      parseEventSelection("email.sent, email.sent, email.received"),
    ).toEqual(["email.sent", "email.received"]);
  });

  it("normalizes list payloads from Resend", () => {
    expect(
      webhooksFromListPayload({
        object: "list",
        data: [
          {
            id: "hook_1",
            endpoint: "https://admin.asymmetric.al/api/email/webhooks/resend",
            status: "enabled",
            events: ["email.sent"],
          },
          { id: "", endpoint: "https://example.test" },
        ],
      }),
    ).toEqual([
      {
        id: "hook_1",
        endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
        status: "enabled",
        events: ["email.sent"],
        signingSecret: null,
      },
    ]);
  });

  it("selects an enabled webhook for the exact endpoint and reports duplicates", () => {
    const selected = selectWebhookForEndpoint(
      [
        normalizeWebhook({
          id: "disabled",
          endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
          status: "disabled",
          events: [],
        })!,
        normalizeWebhook({
          id: "enabled",
          endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
          status: "enabled",
          events: [],
        })!,
      ],
      DEFAULT_RESEND_WEBHOOK_ENDPOINT,
    );

    expect(selected.webhook?.id).toBe("enabled");
    expect(selected.duplicateCount).toBe(1);
  });

  it("computes missing and merged event sets without dropping existing events", () => {
    expect(
      missingWebhookEvents(["email.sent"], ["email.sent", "email.opened"]),
    ).toEqual(["email.opened"]);
    expect(
      mergeWebhookEvents(["email.sent"], ["email.sent", "email.opened"]),
    ).toEqual(["email.sent", "email.opened"]);
  });

  it("validates Resend signing secrets before writing them anywhere", () => {
    expect(validateSigningSecret("whsec_valid")).toBe("whsec_valid");
    expect(() => validateSigningSecret("not-valid")).toThrow(/whsec_/);
    expect(() => validateSigningSecret("whsec_valid\nBAD=value")).toThrow(
      /newlines/,
    );
  });

  it("appends GitHub env lines without exposing values in output", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "resend-webhook-test-"));
    const githubEnvPath = path.join(dir, "github-env");

    try {
      expect(
        appendGithubEnvSecret({
          githubEnvPath,
          name: "RESEND_WEBHOOK_SECRET",
          value: "whsec_secret",
        }),
      ).toBe(true);
      expect(readFileSync(githubEnvPath, "utf8")).toBe(
        "RESEND_WEBHOOK_SECRET=whsec_secret\n",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("configureResendWebhook", () => {
  it("dry-runs a missing webhook without creating it or exporting secrets", async () => {
    const { fetchImpl, calls } = makeFetch({
      "GET /webhooks": [{ object: "list", data: [] }],
    });
    const result = await configureResendWebhook({
      apiKey: "re_test",
      dryRun: true,
      fetchImpl,
      stdout: { write: () => true } as NodeJS.WriteStream,
    });

    expect(result).toMatchObject({
      action: "would_create",
      endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
      webhookId: null,
      wroteGithubEnv: false,
    });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      "GET /webhooks",
    ]);
  });

  it("creates a missing webhook and exports the returned signing secret", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "resend-webhook-test-"));
    const githubEnvPath = path.join(dir, "github-env");
    const output: string[] = [];
    const { fetchImpl, calls } = makeFetch({
      "GET /webhooks": [{ object: "list", data: [] }],
      "POST /webhooks": [
        {
          id: "hook_created",
          signing_secret: "whsec_created",
        },
      ],
    });

    try {
      const result = await configureResendWebhook({
        apiKey: "re_test",
        fetchImpl,
        githubEnvPath,
        stdout: {
          write: (value: string) => output.push(value),
        } as NodeJS.WriteStream,
      });

      expect(result).toMatchObject({
        action: "created",
        webhookId: "hook_created",
        wroteGithubEnv: true,
      });
      expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
        "GET /webhooks",
        "POST /webhooks",
      ]);
      expect(calls[1].body).toEqual({
        endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
        events: DEFAULT_RESEND_WEBHOOK_EVENTS,
      });
      expect(output).toEqual(["::add-mask::whsec_created\n"]);
      expect(readFileSync(githubEnvPath, "utf8")).toBe(
        "RESEND_WEBHOOK_SECRET=whsec_created\n",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("updates an existing disabled webhook with missing events before retrieving its secret", async () => {
    const { fetchImpl, calls } = makeFetch({
      "GET /webhooks": [
        {
          object: "list",
          data: [
            {
              id: "hook_existing",
              endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
              status: "disabled",
              events: ["email.sent"],
            },
          ],
        },
      ],
      "PATCH /webhooks/hook_existing": [
        { object: "webhook", id: "hook_existing" },
      ],
      "GET /webhooks/hook_existing": [
        {
          id: "hook_existing",
          endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
          status: "enabled",
          events: ["email.sent", "email.received"],
          signing_secret: "whsec_existing",
        },
      ],
    });

    const result = await configureResendWebhook({
      apiKey: "re_test",
      events: ["email.sent", "email.received"],
      fetchImpl,
      stdout: { write: () => true } as NodeJS.WriteStream,
    });

    expect(result).toMatchObject({
      action: "updated",
      webhookId: "hook_existing",
      wroteGithubEnv: false,
    });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      "GET /webhooks",
      "PATCH /webhooks/hook_existing",
      "GET /webhooks/hook_existing",
    ]);
    expect(calls[1].body).toEqual({
      endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
      events: ["email.sent", "email.received"],
      status: "enabled",
    });
  });

  it("reuses an existing enabled webhook and retrieves its signing secret", async () => {
    const { fetchImpl, calls } = makeFetch({
      "GET /webhooks": [
        {
          object: "list",
          data: [
            {
              id: "hook_existing",
              endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
              status: "enabled",
              events: DEFAULT_RESEND_WEBHOOK_EVENTS,
            },
          ],
        },
      ],
      "GET /webhooks/hook_existing": [
        {
          id: "hook_existing",
          endpoint: DEFAULT_RESEND_WEBHOOK_ENDPOINT,
          status: "enabled",
          events: DEFAULT_RESEND_WEBHOOK_EVENTS,
          signing_secret: "whsec_existing",
        },
      ],
    });

    const result = await configureResendWebhook({
      apiKey: "re_test",
      fetchImpl,
      stdout: { write: () => true } as NodeJS.WriteStream,
    });

    expect(result).toMatchObject({
      action: "reused",
      webhookId: "hook_existing",
    });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      "GET /webhooks",
      "GET /webhooks/hook_existing",
    ]);
  });
});
