import { ApiHttpError, ensureJsonBody } from "@asym/api/shared/http-errors";
import { defaultRichTextValue } from "@payloadcms/richtext-lexical";
import { ValidationError } from "payload";
import { z } from "zod";

import { readEditingActor } from "./access/tenant-context";
import { actorCreate, actorFind, actorFindOne } from "./ports/actor-port";
import { findPageStarter } from "./starters";
import {
  openCoreSession,
  readFund,
  readMissionary,
} from "./tenancy/core-session";
import { CANONICAL_UUID } from "./tenancy/reference-guard";
import { normalizeWebAddressSegment as slugifySegment } from "./web-address";

import type {
  CmsRichTextValue,
  PageCreateFields,
} from "./create-from-template-payload-shapes";
import type { Endpoint, PayloadRequest } from "payload";

const bodySchema = z.object({
  starterKey: z.string().min(1),
  site: z.string().regex(CANONICAL_UUID).optional(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  missionaryId: z.string().regex(CANONICAL_UUID).optional(),
  fundId: z.string().regex(CANONICAL_UUID).optional(),
});

type ParsedBody = z.infer<typeof bodySchema>;

export const NO_PRESENTATION_MESSAGE =
  "This organization has no Site in Web Studio yet, so pages cannot be created.";
const NO_SESSION_MESSAGE =
  "Web Studio needs your signed-in session to check this reference. Sign in again and retry.";

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function createDefaultRichTextValue(): CmsRichTextValue {
  return { ...structuredClone(defaultRichTextValue) } as CmsRichTextValue;
}

async function chooseSite(
  req: PayloadRequest,
  requested: string | undefined,
): Promise<{ ok: true; site: string } | { ok: false; response: Response }> {
  const presentations = await actorFind(req, {
    collection: "site-presentations",
  });
  if (presentations.length === 0) {
    return {
      ok: false,
      response: jsonResponse({ error: NO_PRESENTATION_MESSAGE }, 409),
    };
  }
  if (!requested) {
    if (presentations.length === 1) {
      return { ok: true, site: String(presentations[0]!.id) };
    }
    return {
      ok: false,
      response: jsonResponse({ error: "Choose a Site for this page." }, 400),
    };
  }
  if (!presentations.some((presentation) => presentation.id === requested)) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Site is not in your organization" },
        403,
      ),
    };
  }
  return { ok: true, site: requested };
}

async function existingPage(
  req: PayloadRequest,
  field: "missionaryId" | "fundId",
  value: string,
) {
  return actorFindOne(req, {
    collection: "pages",
    draft: true,
    where: { [field]: { equals: value } },
  });
}

type Target =
  | {
      ok: true;
      fields: Pick<
        PageCreateFields,
        "title" | "slug" | "summary" | "missionaryId" | "fundId"
      >;
    }
  | { ok: false; response: Response };

async function resolveTarget(
  req: PayloadRequest,
  family: "standard" | "missionary" | "project",
  parsed: ParsedBody,
): Promise<Target> {
  if (family === "standard") {
    if (!parsed.title || !parsed.slug) {
      return {
        ok: false,
        response: jsonResponse({ error: "Enter a title and an address." }, 400),
      };
    }
    return {
      ok: true,
      fields: {
        title: parsed.title,
        slug: slugifySegment(parsed.slug),
      },
    };
  }
  const reference =
    family === "missionary" ? parsed.missionaryId : parsed.fundId;
  if (!reference) {
    return {
      ok: false,
      response: jsonResponse(
        {
          error:
            family === "missionary"
              ? "Choose a missionary for this page."
              : "Choose a fund for this page.",
        },
        400,
      ),
    };
  }
  const session = await openCoreSession(req);
  if (!session) {
    return {
      ok: false,
      response: jsonResponse({ error: NO_SESSION_MESSAGE }, 403),
    };
  }
  const field = family === "missionary" ? "missionaryId" : "fundId";
  if (family === "missionary") {
    const missionary = await readMissionary(session, reference);
    if (!missionary) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Missionary not found for tenant" },
          404,
        ),
      };
    }
    const duplicate = await existingPage(req, field, reference);
    if (duplicate) {
      return {
        ok: false,
        response: jsonResponse(
          {
            error: "A missionary page already exists for this missionary",
            existingId: String(duplicate.id),
          },
          409,
        ),
      };
    }
    return {
      ok: true,
      fields: {
        title: `${missionary.name} — Give`,
        slug:
          slugifySegment(`${missionary.name}-${reference.slice(0, 8)}`) ||
          slugifySegment(`give-${reference}`),
        missionaryId: reference,
      },
    };
  }
  const fund = await readFund(session, reference);
  if (!fund) {
    return {
      ok: false,
      response: jsonResponse({ error: "Fund not found for tenant" }, 404),
    };
  }
  const duplicate = await existingPage(req, field, reference);
  if (duplicate) {
    return {
      ok: false,
      response: jsonResponse(
        {
          error: "A project page already exists for this fund",
          existingId: String(duplicate.id),
        },
        409,
      ),
    };
  }
  const title = fund.name?.trim() || "Project page";
  return {
    ok: true,
    fields: {
      title,
      slug:
        slugifySegment(`${title}-${reference.slice(0, 8)}`) ||
        slugifySegment(reference),
      summary: fund.description,
      fundId: reference,
    },
  };
}

function refusalResponse(error: unknown): Response | null {
  if (error instanceof ValidationError) {
    const errors =
      (error.data as { errors?: Array<{ path?: string; message?: string }> })
        ?.errors ?? [];
    const slug = errors
      .filter((item) => item.path === "slug")
      .map((item) => item.message ?? "");
    return jsonResponse(
      {
        error: errors[0]?.message ?? error.message,
        ...(slug.length > 0 ? { fieldErrors: { slug } } : {}),
      },
      400,
    );
  }
  return null;
}

export const webStudioCreateFromTemplateEndpoint: Endpoint = {
  method: "post",
  path: "/web-studio/create-from-template",
  handler: async (req): Promise<Response> => {
    if (!readEditingActor(req)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    let parsed: ParsedBody;
    try {
      const json = await ensureJsonBody(req as Request);
      parsed = bodySchema.parse(json);
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 415)
        return jsonResponse({ errors: [{ message: error.message }] }, 415);
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    if (parsed.slug !== undefined && !slugifySegment(parsed.slug)) {
      const message = "Enter an address with at least one letter or number.";
      return jsonResponse(
        { error: message, fieldErrors: { slug: [message] } },
        400,
      );
    }

    const starter = findPageStarter(parsed.starterKey);
    if (!starter) {
      return jsonResponse({ error: "Starter not found" }, 404);
    }

    const site = await chooseSite(req, parsed.site);
    if (!site.ok) return site.response;

    const target = await resolveTarget(req, starter.family, parsed);
    if (!target.ok) return target.response;

    const data: PageCreateFields = {
      site: site.site,
      family: starter.family,
      summary: starter.summary || null,
      ...target.fields,
      templateKey: starter.key,
      layout: starter.layout(),
      content: createDefaultRichTextValue(),
      legacyContentFallback: true,
    };

    try {
      const doc = await actorCreate(req, {
        collection: "pages",
        data,
        draft: true,
      });
      return jsonResponse({ id: String(doc.id), collectionSlug: "pages" });
    } catch (error) {
      const response = refusalResponse(error);
      if (response) return response;
      throw error;
    }
  },
};
