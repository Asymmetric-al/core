import type { FieldRefusal } from "./refusal";
import type { CollectionSlug, Field, PayloadRequest } from "payload";

export const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const FIELD_TARGETS = new Set(["site-presentations", "media", "pages"]);
const STAMPED_FIELDS = new Set(["createdBy", "updatedBy"]);

export type Reference = {
  path: string;
  relationTo: string;
  id: string;
};

type Collected = { references: Reference[]; refusals: FieldRefusal[] };

type FieldLike = Field & {
  name?: string;
  type: string;
  fields?: Field[];
  tabs?: Array<{ name?: string; fields: Field[] }>;
  blocks?: Array<{ slug: string; fields: Field[] }>;
  blockReferences?: Array<string | { slug: string; fields: Field[] }>;
  relationTo?: string | string[];
  hasMany?: boolean;
};

type BlockLike = { slug: string; fields: Field[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (
    isRecord(value) &&
    (typeof value.id === "string" || typeof value.id === "number")
  ) {
    return String(value.id);
  }
  return null;
}

function pushRelation(
  out: Collected,
  path: string,
  relationTo: string | string[] | undefined,
  value: unknown,
) {
  if (value === null || value === undefined) return;
  if (Array.isArray(relationTo)) {
    if (!isRecord(value) || typeof value.relationTo !== "string") {
      out.refusals.push({ path, message: "This reference is not valid." });
      return;
    }
    pushRelation(out, path, value.relationTo, value.value);
    return;
  }
  const id = idOf(value);
  if (!relationTo || id === null) {
    out.refusals.push({ path, message: "This reference is not valid." });
    return;
  }
  if (!FIELD_TARGETS.has(relationTo)) {
    out.refusals.push({ path, message: "This reference is not allowed." });
    return;
  }
  out.references.push({ path, relationTo, id });
}

function findBlock(
  field: FieldLike,
  blockType: unknown,
  configBlocks: readonly BlockLike[],
): BlockLike | null {
  if (typeof blockType !== "string") return null;
  const inline = (field.blocks ?? []).find((block) => block.slug === blockType);
  if (inline) return inline;
  for (const reference of field.blockReferences ?? []) {
    const slug = typeof reference === "string" ? reference : reference.slug;
    if (slug !== blockType) continue;
    if (typeof reference !== "string") return reference;
    return configBlocks.find((block) => block.slug === slug) ?? null;
  }
  return null;
}

function collectFields(
  fields: readonly Field[],
  data: unknown,
  prefix: string,
  out: Collected,
  configBlocks: readonly BlockLike[],
) {
  const values = isRecord(data) ? data : {};
  for (const raw of fields) {
    const field = raw as FieldLike;
    const name = typeof field.name === "string" ? field.name : null;
    if (!name) {
      if (field.type === "tabs") {
        for (const tab of field.tabs ?? []) {
          if (tab.name) {
            collectFields(
              tab.fields,
              values[tab.name],
              `${prefix}${tab.name}.`,
              out,
              configBlocks,
            );
          } else {
            collectFields(tab.fields, values, prefix, out, configBlocks);
          }
        }
      } else if (field.fields) {
        collectFields(field.fields, values, prefix, out, configBlocks);
      }
      continue;
    }
    if (prefix === "" && STAMPED_FIELDS.has(name)) continue;
    const value = values[name];
    const path = `${prefix}${name}`;
    switch (field.type) {
      case "relationship":
      case "upload":
        if (Array.isArray(value)) {
          value.forEach((item, index) =>
            pushRelation(out, `${path}.${index}`, field.relationTo, item),
          );
        } else {
          pushRelation(out, path, field.relationTo, value);
        }
        break;
      case "array":
        if (Array.isArray(value)) {
          value.forEach((row, index) =>
            collectFields(
              field.fields ?? [],
              row,
              `${path}.${index}.`,
              out,
              configBlocks,
            ),
          );
        }
        break;
      case "group":
        collectFields(field.fields ?? [], value, `${path}.`, out, configBlocks);
        break;
      case "blocks":
        if (Array.isArray(value)) {
          value.forEach((row, index) => {
            const block = findBlock(
              field,
              isRecord(row) ? row.blockType : null,
              configBlocks,
            );
            if (!block) {
              out.refusals.push({
                path: `${path}.${index}`,
                message: "This section type is not allowed.",
              });
              return;
            }
            collectFields(
              block.fields,
              row,
              `${path}.${index}.`,
              out,
              configBlocks,
            );
          });
        }
        break;
      default:
        break;
    }
  }
}

function isLexicalState(
  value: unknown,
): value is { root: Record<string, unknown> } {
  return (
    isRecord(value) &&
    isRecord(value.root) &&
    Array.isArray(value.root.children)
  );
}

function visitNode(node: unknown, path: string, out: Collected) {
  if (!isRecord(node)) return;
  const fields = isRecord(node.fields) ? node.fields : null;
  switch (node.type) {
    case "upload":
      out.refusals.push({
        path,
        message: "Rich text links media as a reference, never as an upload.",
      });
      break;
    case "relationship": {
      const id = idOf(node.value);
      if (node.relationTo !== "media" || id === null) {
        out.refusals.push({
          path,
          message: "Rich text may reference only this organization's media.",
        });
      } else {
        out.references.push({ path, relationTo: "media", id });
      }
      break;
    }
    case "link":
    case "autolink": {
      const doc = fields?.doc;
      if (
        fields?.linkType === "internal" ||
        (doc !== undefined && doc !== null)
      ) {
        const id = isRecord(doc) ? idOf(doc.value) : null;
        if (!isRecord(doc) || doc.relationTo !== "pages" || id === null) {
          out.refusals.push({
            path,
            message: "An internal link may point only at a page of this Site.",
          });
        } else {
          out.references.push({ path, relationTo: "pages", id });
        }
      }
      break;
    }
    case "block":
    case "inlineBlock":
      out.refusals.push({
        path,
        message: "This rich-text element is not allowed.",
      });
      break;
    default:
      if ("relationTo" in node || (fields && "doc" in fields)) {
        out.refusals.push({
          path,
          message: "This rich-text reference is not allowed.",
        });
      }
      break;
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((child, index) =>
      visitNode(child, `${path}.children.${index}`, out),
    );
  }
}

function walkData(value: unknown, path: string, out: Collected) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkData(item, path ? `${path}.${index}` : String(index), out),
    );
    return;
  }
  if (!isRecord(value)) return;
  if (isLexicalState(value)) {
    visitNode(value.root, path ? `${path}.root` : "root", out);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    walkData(item, path ? `${path}.${key}` : key, out);
  }
}

export function collectReferences(
  fields: readonly Field[],
  document: Record<string, unknown>,
  configBlocks: readonly BlockLike[] = [],
): Collected {
  const out: Collected = { references: [], refusals: [] };
  collectFields(fields, document, "", out, configBlocks);
  const { createdBy: _createdBy, updatedBy: _updatedBy, ...content } = document;
  walkData(content, "", out);
  return out;
}

type Target = { id: string; tenant: unknown; site: unknown };

async function readTargets(
  req: PayloadRequest,
  relationTo: string,
  ids: string[],
  asActor: boolean,
): Promise<Map<string, Target>> {
  const found = new Map<string, Target>();
  const valid = [...new Set(ids)].filter((id) => CANONICAL_UUID.test(id));
  if (valid.length === 0) return found;
  const { docs } = await req.payload.find({
    collection: relationTo as CollectionSlug,
    depth: 0,
    limit: 0,
    overrideAccess: !asActor,
    pagination: false,
    req,
    where: { id: { in: valid } },
  });
  for (const doc of docs as unknown as Array<Record<string, unknown>>) {
    found.set(String(doc.id), {
      id: String(doc.id),
      tenant: doc.tenant,
      site: idOf(doc.site),
    });
  }
  return found;
}

const MESSAGES: Record<string, string> = {
  "site-presentations": "Choose a Site of this organization.",
  media: "Choose media of this organization.",
  pages: "Choose a page of this organization's Site.",
};

export async function checkReferences(
  req: PayloadRequest,
  references: readonly Reference[],
  scope: { tenant: string; site: string | null; asActor: boolean },
): Promise<FieldRefusal[]> {
  const refusals: FieldRefusal[] = [];
  const byCollection = new Map<string, Reference[]>();
  for (const reference of references) {
    const list = byCollection.get(reference.relationTo) ?? [];
    list.push(reference);
    byCollection.set(reference.relationTo, list);
  }
  for (const [relationTo, list] of byCollection) {
    const targets = await readTargets(
      req,
      relationTo,
      list.map((reference) => reference.id),
      scope.asActor,
    );
    for (const reference of list) {
      const target = targets.get(reference.id);
      const sameTenant = target !== undefined && target.tenant === scope.tenant;
      const sameSite =
        relationTo !== "pages" ||
        (scope.site !== null && target?.site === scope.site);
      if (!sameTenant || !sameSite) {
        refusals.push({
          path: reference.path,
          message: MESSAGES[relationTo] ?? "This reference is not allowed.",
        });
      }
    }
  }
  return refusals;
}
