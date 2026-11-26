import { ApiHttpError, ensureJsonBody } from "@asym/api/shared/http-errors";
import { z } from "zod";

import { readEditingActor } from "./access/tenant-context";
import { deleteMediaRecord, registerMediaRecord } from "./ports/service-port";
import { openCoreSession, readMediaCustody } from "./tenancy/core-session";

import type { Endpoint, PayloadRequest } from "payload";

const HEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const assetId = z
  .string()
  .regex(HEX_UUID)
  .transform((value) => value.toLowerCase());

const optionalText = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform((value) => value || null);

const registerSchema = z
  .object({
    assetId,
    alt: z.string().trim().min(1).max(500),
    credit: optionalText,
    folder: optionalText,
  })
  .strict();

const removeSchema = z.object({ assetId }).strict();

const NO_SESSION_MESSAGE =
  "Web Studio needs your signed-in session to check this file. Sign in again and retry.";
const UNREADABLE_MESSAGE =
  "The media library could not read this file just now. Try again.";
const ANOTHER_ORGANIZATION = /belongs to another organization/;

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

type Parsed<T> = { ok: true; value: T } | { ok: false; response: Response };

async function readBody<T>(
  req: PayloadRequest,
  schema: z.ZodType<T>,
): Promise<Parsed<T>> {
  try {
    const raw = await ensureJsonBody(req as unknown as Request);
    return { ok: true, value: schema.parse(raw) };
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 415) {
      return {
        ok: false,
        response: json({ errors: [{ message: error.message }] }, 415),
      };
    }
    return {
      ok: false,
      response: json({ error: "Invalid request body" }, 400),
    };
  }
}

export const webStudioMediaRegisterEndpoint: Endpoint = {
  method: "post",
  path: "/web-studio/media/register",
  handler: async (req): Promise<Response> => {
    const actor = readEditingActor(req);
    if (!actor) return json({ error: "Forbidden" }, 403);
    const body = await readBody(req, registerSchema);
    if (!body.ok) return body.response;
    const session = await openCoreSession(req);
    if (!session) return json({ error: NO_SESSION_MESSAGE }, 403);
    const custody = await readMediaCustody(session, body.value.assetId);
    if (custody.kind === "unreadable") {
      return json({ error: UNREADABLE_MESSAGE }, 503);
    }
    if (custody.kind === "missing") {
      return json(
        { error: "No file with this id is in this organization." },
        404,
      );
    }
    if (custody.asset.status === "uploading") {
      return json({ error: "The file has not finished uploading." }, 409);
    }
    if (custody.asset.status !== "ready") {
      return json(
        { error: "No file with this id is in this organization." },
        404,
      );
    }
    try {
      const doc = await registerMediaRecord(req.payload, {
        id: custody.asset.id,
        tenantId: actor.tenantId,
        alt: body.value.alt,
        credit: body.value.credit,
        folder: body.value.folder,
      });
      return json({ id: String(doc.id) });
    } catch (error) {
      if (error instanceof Error && ANOTHER_ORGANIZATION.test(error.message)) {
        return json(
          { error: "This file is in another organization's library." },
          409,
        );
      }
      throw error;
    }
  },
};

export const webStudioMediaRemoveEndpoint: Endpoint = {
  method: "post",
  path: "/web-studio/media/remove",
  handler: async (req): Promise<Response> => {
    const actor = readEditingActor(req);
    if (!actor) return json({ error: "Forbidden" }, 403);
    const body = await readBody(req, removeSchema);
    if (!body.ok) return body.response;
    const session = await openCoreSession(req);
    if (!session) return json({ error: NO_SESSION_MESSAGE }, 403);
    const custody = await readMediaCustody(session, body.value.assetId);
    if (custody.kind === "unreadable") {
      return json({ error: UNREADABLE_MESSAGE }, 503);
    }
    if (custody.kind === "found" && custody.asset.status !== "deleted") {
      return json({ error: "Delete the stored file first." }, 409);
    }
    try {
      await deleteMediaRecord(req.payload, body.value.assetId, actor.tenantId);
      return json({ id: body.value.assetId });
    } catch (error) {
      if (error instanceof Error && ANOTHER_ORGANIZATION.test(error.message)) {
        return json(
          { error: "No media with this id is in this organization." },
          404,
        );
      }
      throw error;
    }
  },
};
