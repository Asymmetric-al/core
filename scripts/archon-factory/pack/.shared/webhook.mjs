#!/usr/bin/env node
// Server-owned starts for factory workflows. A Standard Webhooks v1 delivery
// to the engine's own source endpoint makes the server commit the receipt and
// start the run under its trigger host, with the binding's resource admission.
// The delivery id is the dedup key: replaying it with the same body starts
// nothing new; reusing it with a different body is refused (409).
//
//   webhook.mjs fire <select|deliver|answer|analyze|probe> --delivery-id <key> [--body '<json>']
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { verifyNativeIdentity } from "./identity.mjs";
import { deliveryKey } from "./workitem.mjs";

export const SOURCES = {
  select: "core-factory-select",
  deliver: "core-factory-deliver",
  answer: "core-factory-answer",
  analyze: "core-factory-analyze",
  probe: "core-factory-probe",
};

export function readSigningSecret(file) {
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith("CORE_FACTORY_SIGNING_SECRET="));
  const secret = line?.slice("CORE_FACTORY_SIGNING_SECRET=".length).trim();
  if (!secret?.startsWith("whsec_"))
    throw new Error("Factory signing secret is missing or malformed");
  return secret;
}

export function signDelivery({ secret, deliveryId, timestamp, payload }) {
  const key = Buffer.from(secret.slice("whsec_".length), "base64");
  if (key.length < 24) throw new Error("Factory signing key is too short");
  return `v1,${createHmac("sha256", key).update(`${deliveryId}.${timestamp}.${payload}`).digest("base64")}`;
}

export async function fireWebhook({
  config,
  workflow,
  deliveryId,
  body = {},
  fetchImpl = fetch,
  now = () => Date.now(),
  secret,
}) {
  const source = SOURCES[workflow];
  if (!source) throw new Error(`Unknown factory workflow ${workflow}`);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:@-]{2,190}$/.test(deliveryId ?? ""))
    throw new Error("A stable delivery id is required");
  const payload = JSON.stringify(body);
  const timestamp = Math.floor(now() / 1000);
  const signature = signDelivery({
    secret: secret ?? readSigningSecret(config.webhooks.secretFile),
    deliveryId,
    timestamp,
    payload,
  });
  let response;
  try {
    response = await fetchImpl(
      `http://127.0.0.1:${config.archon.port}/webhooks/sources/${source}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "webhook-id": deliveryId,
          "webhook-timestamp": String(timestamp),
          "webhook-signature": signature,
        },
        body: payload,
      },
    );
  } catch (error) {
    // The engine may or may not have committed the receipt; the same delivery
    // id makes a later retry safe.
    return {
      ok: false,
      outcome: "unknown",
      status: null,
      detail: String(error.message ?? error),
    };
  }
  const text = await response.text();
  let receipt = null;
  try {
    receipt = JSON.parse(text);
  } catch {}
  return {
    ok: response.status === 200,
    outcome:
      response.status === 200
        ? "accepted"
        : response.status === 409
          ? "conflict"
          : "refused",
    status: response.status,
    receipt,
    detail: response.status === 200 ? null : text.slice(0, 400),
  };
}

// Starts the next delivery round of an observed work item. Admission, record's
// successor and the intake sweep all key it by assignment, next round and the
// item's revision, so a start that was refused or never claimed is not
// deduplicated forever once the item changes.
export async function fireRound({
  config,
  value,
  revision,
  verifyIdentity = verifyNativeIdentity,
  ...options
}) {
  await verifyIdentity({
    config,
    owner: value.assignment.owner,
    expectedDigest: value.assignment.profileDigest,
  });
  const deliveryId = deliveryKey(value, revision);
  const fired = await fireWebhook({
    config,
    workflow: "deliver",
    deliveryId,
    body: { issue: String(value.issue), assignment: value.assignment.id },
    ...options,
  });
  return { deliveryId, ...fired };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [command, workflow] = process.argv.slice(2);
  const flag = (name) => {
    const index = process.argv.indexOf(`--${name}`);
    return index > 0 ? process.argv[index + 1] : undefined;
  };
  if (command !== "fire") {
    console.error(
      "usage: webhook.mjs fire <workflow> --delivery-id <key> [--body <json>]",
    );
    process.exit(64);
  }
  const deliveryId =
    flag("delivery-id") === "tick"
      ? `${workflow}-tick-${new Date().toISOString().slice(0, 16)}`
      : flag("delivery-id");
  fireWebhook({
    config: loadConfig(),
    workflow,
    deliveryId,
    body: flag("body") ? JSON.parse(flag("body")) : {},
  })
    .then((result) => {
      console.log(JSON.stringify({ deliveryId, ...result }));
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      console.log(
        JSON.stringify({ ok: false, deliveryId, error: error.message }),
      );
      process.exitCode = 1;
    });
}
