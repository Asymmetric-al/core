import { NextResponse } from "next/server";

import { parseAdminCrmParams } from "./query";
import { listAdminCrmRecords } from "./service";
import { listAdminCrmTagOptions } from "./tags";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, request, requestId, sessionClient }) => {
    try {
      const params = parseAdminCrmParams(new URL(request.url).searchParams);
      return NextResponse.json(
        await listAdminCrmRecords(sessionClient, auth.tenantId, params),
      );
    } catch (error) {
      return toErrorResponse(error, "Failed to load CRM records.", requestId);
    }
  },
  { capability: "admin.crm.manage" },
);

export const GET_TAG_OPTIONS = withOperation(
  async ({ auth, requestId, sessionClient }) => {
    try {
      const tags = await listAdminCrmTagOptions(sessionClient, auth.tenantId);
      return NextResponse.json({ tags });
    } catch (error) {
      return toErrorResponse(error, "Failed to load CRM tags.", requestId);
    }
  },
  { capability: "admin.crm.manage" },
);
