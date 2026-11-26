import { openCoreSession, readFund, readMissionary } from "./core-session";
import { CANONICAL_UUID, idOf } from "./reference-guard";
import { isServicePortRequest } from "../ports/service-port";

import type { FieldRefusal } from "./refusal";
import type { DocumentRule } from "./tenant-scoped";
import type { CollectionBeforeOperationHook, PayloadRequest } from "payload";

export const PAGE_FAMILIES = ["standard", "missionary", "project"] as const;
export type PageFamily = (typeof PAGE_FAMILIES)[number];

const NO_SESSION =
  "Web Studio needs your signed-in session to check this reference. Sign in again and retry.";

const DRAFT_WRITE = Symbol("asym.cms.page-draft-write");

export const refusePublishedStatus: DocumentRule = ({ data, req }) =>
  data._status === "published" && !isServicePortRequest(req)
    ? [
        {
          path: "_status",
          message: "Publishing is not available in Web Studio yet.",
        },
      ]
    : [];

export const recordPageWriteMode: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation === "update" || operation === "restoreVersion") {
    const { draft, unpublishAllLocales } = args as {
      draft?: unknown;
      unpublishAllLocales?: unknown;
    };
    (req.context as Record<PropertyKey, unknown>)[DRAFT_WRITE] =
      (draft === true || draft === "true") &&
      !payloadFlagIsSet(unpublishAllLocales);
  }
  return args;
};

function payloadFlagIsSet(value: unknown): boolean {
  return typeof value === "string" ? value === "true" : Boolean(value);
}

function isDraftWrite(req: PayloadRequest): boolean {
  return (req.context as Record<PropertyKey, unknown>)[DRAFT_WRITE] === true;
}

export const refuseLiveWrite: DocumentRule = ({ operation, req }) =>
  operation === "update" && !isServicePortRequest(req) && !isDraftWrite(req)
    ? [
        {
          path: "_status",
          message:
            "Web Studio saves changes to a page as a draft until publishing is available.",
        },
      ]
    : [];

export const pageKeepsSiteRule: DocumentRule = ({
  data,
  operation,
  originalDoc,
}) =>
  operation === "update" &&
  data.site !== undefined &&
  idOf(data.site) !== idOf(originalDoc?.site)
    ? [{ path: "site", message: "A page stays on the Site it was made for." }]
    : [];

const isSet = (value: unknown) => value !== null && value !== undefined;

export const pageFamilyRule: DocumentRule = async ({
  merged,
  operation,
  originalDoc,
  req,
}) => {
  const refusals: FieldRefusal[] = [];
  const family = merged.family ?? "standard";
  const missionaryId = merged.missionaryId;
  const fundId = merged.fundId;
  if (!PAGE_FAMILIES.includes(family as PageFamily)) {
    return [{ path: "family", message: "Choose a page family." }];
  }
  const needs = {
    missionaryId: family === "missionary",
    fundId: family === "project",
  };
  for (const [path, required] of Object.entries(needs)) {
    const value = merged[path];
    if (required && !isSet(value)) {
      refusals.push({
        path,
        message: "This page family needs this reference.",
      });
    } else if (!required && isSet(value)) {
      refusals.push({
        path,
        message: "This page family does not take this reference.",
      });
    } else if (
      required &&
      (typeof value !== "string" || !CANONICAL_UUID.test(value))
    ) {
      refusals.push({ path, message: "Must be a valid UUID reference." });
    }
  }
  if (refusals.length > 0) return refusals;
  const changed = (path: "missionaryId" | "fundId") =>
    operation === "create" || merged[path] !== originalDoc?.[path];
  const checks: Array<"missionaryId" | "fundId"> = [];
  if (family === "missionary" && changed("missionaryId")) {
    checks.push("missionaryId");
  }
  if (family === "project" && changed("fundId")) checks.push("fundId");
  if (checks.length === 0) return refusals;
  const session = await openCoreSession(req);
  if (!session) {
    return checks.map((path) => ({ path, message: NO_SESSION }));
  }
  if (checks.includes("missionaryId")) {
    const missionary = await readMissionary(session, missionaryId as string);
    if (!missionary) {
      refusals.push({
        path: "missionaryId",
        message: "Missionary not found in this organization.",
      });
    }
  }
  if (checks.includes("fundId")) {
    const fund = await readFund(session, fundId as string);
    if (!fund) {
      refusals.push({
        path: "fundId",
        message: "Fund not found in this organization.",
      });
    }
  }
  return refusals;
};
