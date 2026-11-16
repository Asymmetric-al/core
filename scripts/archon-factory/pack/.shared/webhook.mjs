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
  // Delivery has one source per lane: core-factory-deliver-<lane>.
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

// The engine starts one run at a time for runs that share a resource and a
// folder, whatever the resource's capacity. Each delivery lane is therefore
// its own single-run resource, so different issues' rounds can run side by
// side. An issue keeps the lane recorded on its work item at admission
// (freeLane in workitem.mjs); one issue's rounds never overlap, because a
// round starts only after the previous one recorded.

// The lane one round starts on. It is a function of the work item alone, so
// every start of one round (one delivery id) reaches the same lane: the same
// id sent to two lanes would start two runs. A work item admitted before
// lanes were recorded, or recording a lane this installation does not have,
// takes one fixed lane by its issue number. Two live issues on one lane (a
// blocked issue retried after a newer one took its lane) only take turns.
export function deliveryLane(item, lanes) {
  const count = Number.isSafeInteger(lanes) && lanes > 0 ? lanes : 1;
  const { lane, issue } = item;
  if (Number.isSafeInteger(lane) && lane >= 1 && lane <= count) return lane;
  return (Math.abs(Math.trunc(Number(issue) || 0)) % count) + 1;
}

export async function fireWebhook({
  config,
  workflow,
  deliveryId,
  body = {},
  fetchImpl = fetch,
  now = () => Date.now(),
  secret,
  lane = 1,
}) {
  if (!SOURCES[workflow])
    throw new Error(`Unknown factory workflow ${workflow}`);
  const source =
    workflow === "deliver" ? `${SOURCES.deliver}-${lane}` : SOURCES[workflow];
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
  const lane = deliveryLane(value, config.limits?.admittedIssues ?? 2);
  const fired = await fireWebhook({
    config,
    workflow: "deliver",
    lane,
    deliveryId,
    body: { issue: String(value.issue), assignment: value.assignment.id },
    ...options,
  });
  return { deliveryId, lane, ...fired };
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
