import {
  normalizePublicCmsLookupValue,
  normalizePublicCmsPageSlug,
} from "@asym/lib/cms/public-page";
import { NextResponse } from "next/server";

import { MISSIONARY_GIVING_PAGES_SLUG, PROJECT_PAGES_SLUG } from "../constants";
import { serializePublishedPageLike } from "./serialize-published-page";

import type {
  PublicCmsPageDescriptor,
  PublicCmsPageReadResult,
} from "@asym/lib/cms/public-page";
import type { Payload } from "payload";

type TenantDoc = {
  id: number | string;
  slug?: string | null;
};

type PublicCmsPayloadClient = Pick<Payload, "find">;

type ReadPublishedPageLikeOptions = {
  payload: PublicCmsPayloadClient;
  tenant: TenantDoc;
  descriptor: PublicCmsPageDescriptor;
};

type QueryShape = {
  collection:
    | "pages"
    | typeof MISSIONARY_GIVING_PAGES_SLUG
    | typeof PROJECT_PAGES_SLUG;
  field: "slug" | "missionaryId";
  value: string;
  emptyError?: string;
};

export async function readPublishedPageLike({
  payload,
  tenant,
  descriptor,
}: ReadPublishedPageLikeOptions): Promise<PublicCmsPageReadResult> {
  const queryShape = descriptorToQueryShape(descriptor);

  if (!queryShape.value) {
    return {
      status: "bad-request",
      statusCode: 400,
      error: queryShape.emptyError ?? "Page identifier required",
    };
  }

  const pageQuery = await payload.find({
    collection: queryShape.collection,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    sort: "-updatedAt",
    where: {
      and: [
        { tenant: { equals: tenant.id } },
        { [queryShape.field]: { equals: queryShape.value } },
        { _status: { equals: "published" } },
      ],
    },
  });

  const doc = pageQuery.docs[0];
  if (!doc) {
    return {
      status: "not-found",
      statusCode: 404,
      error: "Page not found",
    };
  }

  return {
    status: "found",
    statusCode: 200,
    page: serializePublishedPageLike(doc as unknown as Record<string, unknown>),
    tenant: {
      slug: tenant.slug ?? null,
    },
  };
}

export function publicCmsPublishedPageResponse(
  result: PublicCmsPageReadResult,
) {
  if (result.status === "found") {
    return NextResponse.json({
      page: result.page,
      tenant: result.tenant,
    });
  }

  return NextResponse.json(
    { error: result.error },
    { status: result.statusCode },
  );
}

function descriptorToQueryShape(
  descriptor: PublicCmsPageDescriptor,
): QueryShape {
  switch (descriptor.kind) {
    case "page":
      return {
        collection: "pages",
        field: "slug",
        value: normalizePublicCmsPageSlug(descriptor.slugSegments),
      };
    case "missionary-giving-page":
      return {
        collection: MISSIONARY_GIVING_PAGES_SLUG,
        field: "missionaryId",
        value: normalizePublicCmsLookupValue(descriptor.missionaryId),
        emptyError: "Missionary id required",
      };
    case "project-page":
      return {
        collection: PROJECT_PAGES_SLUG,
        field: "slug",
        value: normalizePublicCmsLookupValue(descriptor.slug),
        emptyError: "Slug required",
      };
  }
}
