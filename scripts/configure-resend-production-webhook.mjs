#!/usr/bin/env node

import { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RESEND_API_BASE_URL = "https://api.resend.com";

export const DEFAULT_RESEND_WEBHOOK_ENDPOINT =
  "https://admin.asymmetric.al/api/email/webhooks/resend";

export const DEFAULT_RESEND_WEBHOOK_EVENTS = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
  "email.suppressed",
  "email.received",
];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

function normalizeEndpoint(value) {
  if (!isNonEmptyString(value)) {
    throw new Error("Resend webhook endpoint must be a non-empty URL.");
  }

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error(`Invalid Resend webhook endpoint URL: ${value}`);
  }

  parsed.hash = "";
  return parsed.toString();
}

export function parseEventSelection(value) {
  if (!isNonEmptyString(value)) {
    return [...DEFAULT_RESEND_WEBHOOK_EVENTS];
  }

  const events = [
    ...new Set(
      value
        .split(",")
        .map((event) => event.trim())
        .filter(Boolean),
    ),
  ];

  if (events.length === 0) {
    throw new Error("At least one Resend webhook event is required.");
  }

  return events;
}

export function normalizeWebhook(rawWebhook) {
  if (!rawWebhook || typeof rawWebhook !== "object") return null;
  if (
    !isNonEmptyString(rawWebhook.id) ||
    !isNonEmptyString(rawWebhook.endpoint)
  ) {
    return null;
  }

  return {
    id: rawWebhook.id,
    endpoint: normalizeEndpoint(rawWebhook.endpoint),
    events: Array.isArray(rawWebhook.events)
      ? rawWebhook.events.filter(isNonEmptyString)
      : [],
    status: isNonEmptyString(rawWebhook.status) ? rawWebhook.status : "unknown",
    signingSecret: isNonEmptyString(rawWebhook.signing_secret)
      ? rawWebhook.signing_secret
      : null,
  };
}

export function webhooksFromListPayload(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return rows.map(normalizeWebhook).filter(Boolean);
}

export function missingWebhookEvents(existingEvents, requiredEvents) {
  const existing = new Set(existingEvents ?? []);
  return requiredEvents.filter((event) => !existing.has(event));
}

export function mergeWebhookEvents(existingEvents, requiredEvents) {
  return [...new Set([...(existingEvents ?? []), ...requiredEvents])];
}

export function selectWebhookForEndpoint(webhooks, endpoint) {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const matches = webhooks.filter(
    (webhook) => webhook.endpoint === normalizedEndpoint,
  );

  if (matches.length === 0) {
    return { webhook: null, duplicateCount: 0 };
  }

  const webhook =
    matches.find((candidate) => candidate.status === "enabled") ?? matches[0];

  return {
    webhook,
    duplicateCount: Math.max(matches.length - 1, 0),
  };
}

export function validateSigningSecret(secret) {
  if (!isNonEmptyString(secret) || !secret.startsWith("whsec_")) {
    throw new Error(
      "Resend returned a webhook response without a valid whsec_ signing secret.",
    );
  }

  if (secret.includes("\n") || secret.includes("\r")) {
    throw new Error("Resend webhook signing secret must not contain newlines.");
  }

  return secret;
}

function headers(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatResendErrorBody(body) {
  if (!body) return "";
  if (typeof body === "string") return body;

  const message =
    body.message ??
    body.error?.message ??
    body.error ??
    body.name ??
    JSON.stringify(body);

  return typeof message === "string" ? message : JSON.stringify(message);
}

async function requestResend(fetchImpl, apiKey, pathname, options = {}) {
  const response = await fetchImpl(`${RESEND_API_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      ...headers(apiKey),
      ...(options.headers ?? {}),
    },
  });

  const body = await parseResponseBody(response);
  if (!response.ok) {
    const detail = formatResendErrorBody(body);
    throw new Error(
      `Resend API ${options.method ?? "GET"} ${pathname} failed with ${response.status}${
        detail ? `: ${detail}` : ""
      }`,
    );
  }

  return body;
}

async function listWebhooks(fetchImpl, apiKey) {
  return webhooksFromListPayload(
    await requestResend(fetchImpl, apiKey, "/webhooks"),
  );
}

async function retrieveWebhook(fetchImpl, apiKey, webhookId) {
  const webhook = normalizeWebhook(
    await requestResend(fetchImpl, apiKey, `/webhooks/${webhookId}`),
  );
  if (!webhook) {
    throw new Error(`Resend returned an invalid webhook for id ${webhookId}.`);
  }
  return webhook;
}

async function updateWebhook(fetchImpl, apiKey, webhook, events) {
  await requestResend(fetchImpl, apiKey, `/webhooks/${webhook.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      endpoint: webhook.endpoint,
      events,
      status: "enabled",
    }),
  });

  return retrieveWebhook(fetchImpl, apiKey, webhook.id);
}

async function createWebhook(fetchImpl, apiKey, endpoint, events) {
  const body = await requestResend(fetchImpl, apiKey, "/webhooks", {
    method: "POST",
    body: JSON.stringify({ endpoint, events }),
  });
  const responseObject = body && typeof body === "object" ? body : {};

  const webhook = normalizeWebhook({
    ...responseObject,
    endpoint,
    events,
    status: responseObject.status ?? "enabled",
  });

  if (!webhook) {
    throw new Error("Resend returned an invalid create webhook response.");
  }

  return webhook;
}

export function appendGithubEnvSecret({ githubEnvPath, name, value }) {
  if (!isNonEmptyString(githubEnvPath)) return false;
  if (!/^[A-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid GitHub env variable name: ${name}`);
  }

  appendFileSync(githubEnvPath, `${name}=${value}\n`, "utf8");
  return true;
}

export async function configureResendWebhook({
  apiKey,
  endpoint = DEFAULT_RESEND_WEBHOOK_ENDPOINT,
  events = DEFAULT_RESEND_WEBHOOK_EVENTS,
  dryRun = false,
  githubEnvPath = null,
  fetchImpl = globalThis.fetch,
  stdout = process.stdout,
} = {}) {
  if (!isNonEmptyString(apiKey) || !apiKey.startsWith("re_")) {
    throw new Error("RESEND_API_KEY is required and must start with re_.");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required.");
  }

  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const requiredEvents = [...new Set(events)];
  const webhooks = await listWebhooks(fetchImpl, apiKey);
  const { webhook, duplicateCount } = selectWebhookForEndpoint(
    webhooks,
    normalizedEndpoint,
  );

  if (!webhook) {
    if (dryRun) {
      return {
        action: "would_create",
        endpoint: normalizedEndpoint,
        events: requiredEvents,
        duplicateCount,
        webhookId: null,
        wroteGithubEnv: false,
      };
    }

    const created = await createWebhook(
      fetchImpl,
      apiKey,
      normalizedEndpoint,
      requiredEvents,
    );
    const signingSecret = validateSigningSecret(created.signingSecret);
    stdout.write(`::add-mask::${signingSecret}\n`);

    return {
      action: "created",
      endpoint: created.endpoint,
      events: created.events,
      duplicateCount,
      webhookId: created.id,
      wroteGithubEnv: appendGithubEnvSecret({
        githubEnvPath,
        name: "RESEND_WEBHOOK_SECRET",
        value: signingSecret,
      }),
    };
  }

  const missingEvents = missingWebhookEvents(webhook.events, requiredEvents);
  const needsUpdate = webhook.status !== "enabled" || missingEvents.length > 0;
  const mergedEvents = mergeWebhookEvents(webhook.events, requiredEvents);

  if (dryRun) {
    return {
      action: needsUpdate ? "would_update" : "would_reuse",
      endpoint: webhook.endpoint,
      events: needsUpdate ? mergedEvents : webhook.events,
      duplicateCount,
      missingEvents,
      webhookId: webhook.id,
      status: webhook.status,
      wroteGithubEnv: false,
    };
  }

  const configured = needsUpdate
    ? await updateWebhook(fetchImpl, apiKey, webhook, mergedEvents)
    : await retrieveWebhook(fetchImpl, apiKey, webhook.id);

  const signingSecret = validateSigningSecret(configured.signingSecret);
  stdout.write(`::add-mask::${signingSecret}\n`);

  return {
    action: needsUpdate ? "updated" : "reused",
    endpoint: configured.endpoint,
    events: configured.events,
    duplicateCount,
    missingEvents,
    webhookId: configured.id,
    status: configured.status,
    wroteGithubEnv: appendGithubEnvSecret({
      githubEnvPath,
      name: "RESEND_WEBHOOK_SECRET",
      value: signingSecret,
    }),
  };
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    endpoint:
      process.env.RESEND_WEBHOOK_ENDPOINT || DEFAULT_RESEND_WEBHOOK_ENDPOINT,
    events: DEFAULT_RESEND_WEBHOOK_EVENTS,
    githubEnvPath: process.env.GITHUB_ENV || null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--endpoint") {
      args.endpoint = argv.at(index + 1) ?? args.endpoint;
      index += 1;
    } else if (arg === "--events") {
      args.events = parseEventSelection(argv.at(index + 1) ?? "");
      index += 1;
    } else if (arg === "--github-env") {
      args.githubEnvPath = argv.at(index + 1) ?? args.githubEnvPath;
      index += 1;
    } else if (arg === "--no-github-env") {
      args.githubEnvPath = null;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/configure-resend-production-webhook.mjs [options]

Creates or updates the production Resend webhook and exports its signing secret
for the current GitHub Actions job without printing the secret value.

Options:
  --dry-run              Inspect Resend and print the planned action only
  --endpoint <url>       Webhook URL. Default: ${DEFAULT_RESEND_WEBHOOK_ENDPOINT}
  --events <events>      Comma-separated Resend events. Default: production set
  --github-env <path>    File to append RESEND_WEBHOOK_SECRET to. Default: GITHUB_ENV
  --no-github-env        Do not append to a GitHub env file
  -h, --help             Show this help
`);
}

function printResult(result) {
  const eventList = result.events.join(", ");
  console.log(
    `${result.action} Resend webhook for ${result.endpoint}${
      result.webhookId ? ` (id ${result.webhookId})` : ""
    }.`,
  );
  console.log(`Configured events: ${eventList}`);

  if (result.duplicateCount > 0) {
    console.log(
      `Warning: ${result.duplicateCount} duplicate webhook endpoint match(es) also exist in Resend.`,
    );
  }

  if (result.wroteGithubEnv) {
    console.log(
      "RESEND_WEBHOOK_SECRET was masked and exported to the GitHub Actions job environment.",
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  try {
    const result = await configureResendWebhook({
      apiKey: process.env.RESEND_API_KEY,
      endpoint: args.endpoint,
      events: args.events,
      dryRun: args.dryRun,
      githubEnvPath: args.githubEnvPath,
    });
    printResult(result);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  await main();
}
