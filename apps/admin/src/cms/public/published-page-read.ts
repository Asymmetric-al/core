import {
  normalizePublicCmsLookupValue,
  normalizePublicCmsPageSlug,
} from "@asym/lib/cms/public-page";
import { NextResponse } from "next/server";

import { createPayloadPublishedContentReader } from "./published-content-reader";
import { toPublicRequestContext } from "./resolve-tenant";

import type {
  PublicCmsPageDescriptor,
  PublicCmsPageReadResult,
} from "@asym/lib/cms/public-page";
import type { Payload } from "payload";

/**
 * Route adapter over the public-content choke-point
 * (`./published-content-reader`, issue #523). It translates the shipped
 * public route descriptors into reader queries and reader results into the
 * exact JSON/status contract the donor app consumes — it performs no Payload
 * read of its own (the sole-entry lint enforces that).
 */

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

type ReaderQueryShape = {
  pageType: string;
  key: string;
  emptyError?: string;
};

export async function readPublishedPageLike({
  payload,
  tenant,
  descriptor,
}: ReadPublishedPageLikeOptions): Promise<PublicCmsPageReadResult> {
  const queryShape = descriptorToQueryShape(descriptor);

  if (!queryShape.key) {
    return {
      status: "bad-request",
      statusCode: 400,
      error: queryShape.emptyError ?? "Page identifier required",
    };
  }

  const reader = createPayloadPublishedContentReader(payload);
  const result = await reader.getPublishedPage(toPublicRequestContext(tenant), {
    pageType: queryShape.pageType,
    key: queryShape.key,
  });

  switch (result.status) {
    case "found":
      return {
        status: "found",
        statusCode: 200,
        page: result.page,
        tenant: result.tenant,
      };
    case "bad-request":
      return { status: "bad-request", statusCode: 400, error: result.error };
    case "not-found":
      return { status: "not-found", statusCode: 404, error: "Page not found" };
    case "unavailable":
      return { status: "unavailable", statusCode: 503, error: result.error };
  }
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
): ReaderQueryShape {
  switch (descriptor.kind) {
    case "page":
      return {
        pageType: "page",
        key: normalizePublicCmsPageSlug(descriptor.slugSegments),
      };
    case "missionary-giving-page":
      return {
        pageType: "missionary-giving-page",
        key: normalizePublicCmsLookupValue(descriptor.missionaryId),
        emptyError: "Missionary id required",
      };
    case "project-page":
      return {
        pageType: "project-page",
        key: normalizePublicCmsLookupValue(descriptor.slug),
        emptyError: "Slug required",
      };
  }
}
