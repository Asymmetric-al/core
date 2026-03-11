import { getTenantContext } from "../access/tenant-context";

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

export const logCmsChangeAudit: CollectionAfterChangeHook = async (args) => {
  const { collection, doc, operation, previousDoc, req } = args;
  const context = getTenantContext(req);

  const changedPublishState =
    previousDoc?._status !== doc?._status && doc?._status === "published";

  req.payload.logger.info({
    event: "cms.collection.change",
    collection: collection.slug,
    changedPublishState,
    operation,
    role: context.role,
    tenantId: context.tenantId,
    userId: context.userId,
    docId: doc.id,
  });

  return doc;
};

export const logCmsDeleteAudit: CollectionAfterDeleteHook = async (args) => {
  const { collection, doc, req } = args;
  const context = getTenantContext(req);

  req.payload.logger.info({
    event: "cms.collection.delete",
    collection: collection.slug,
    role: context.role,
    tenantId: context.tenantId,
    userId: context.userId,
    docId: doc.id,
  });

  return doc;
};
