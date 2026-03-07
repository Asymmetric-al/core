import type {
  CollectionBeforeValidateHook,
  PayloadRequest,
  TypeWithID,
  Where,
} from "payload";

function getRelationshipId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return null;
}

async function findExistingDocument(
  req: PayloadRequest,
  collection: "navigation" | "pages",
  where: Where,
) {
  return req.payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  });
}

export const assertUniquePageSlugWithinTenant: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const tenantId = getRelationshipId(data?.tenant);
  const slug =
    typeof data?.slug === "string" && data.slug.trim().length > 0
      ? data.slug.trim()
      : null;

  if (!tenantId || !slug) {
    return data;
  }

  const where: Where = {
    and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }],
  };

  const originalId =
    operation === "update" && originalDoc
      ? getRelationshipId((originalDoc as TypeWithID).id)
      : null;
  if (originalId) {
    (where.and as NonNullable<Where["and"]>).push({
      id: { not_equals: originalId },
    });
  }

  const existing = await findExistingDocument(req, "pages", where);
  if (existing.docs.length > 0) {
    throw new Error(
      `This tenant already uses the slug "${slug}" for another page.`,
    );
  }

  return data;
};

export const assertSingleNavigationPerTenant: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const tenantId = getRelationshipId(data?.tenant);
  if (!tenantId) {
    return data;
  }

  const existing = await findExistingDocument(req, "navigation", {
    tenant: {
      equals: tenantId,
    },
  });

  const originalId =
    operation === "update" && originalDoc
      ? getRelationshipId((originalDoc as TypeWithID).id)
      : null;

  if (
    existing.docs.some((doc) => normalizeDocId(doc) !== originalId)
  ) {
    throw new Error(
      "A tenant can only have a single navigation document.",
    );
  }

  return data;
};

function normalizeDocId(doc: TypeWithID) {
  const id = getRelationshipId(doc.id);
  return id ?? null;
}
