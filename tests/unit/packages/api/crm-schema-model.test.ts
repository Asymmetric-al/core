import { describe, expect, it } from "vitest";

import {
  CRM_SCHEMA_MANAGEMENT_PATH,
  TWENTY_OBJECT_MODEL,
  getTwentyObjectDefinition,
} from "../../../../packages/api/src/crm/schema/twenty-object-model";

describe("Twenty CRM object model", () => {
  it("chooses Metadata API as the production schema management path", () => {
    expect(CRM_SCHEMA_MANAGEMENT_PATH.path).toBe("metadata_api");
    expect(CRM_SCHEMA_MANAGEMENT_PATH.productionReady).toBe(true);
    expect(CRM_SCHEMA_MANAGEMENT_PATH.rejectedPath).toBe("twenty_app_manifest");
  });

  it("models CRM objects without mirroring the entire Asym database", () => {
    const objectNames = TWENTY_OBJECT_MODEL.map((object) => object.namePlural);

    expect(objectNames).toEqual(
      expect.arrayContaining([
        "people",
        "companies",
        "churches",
        "households",
        "tasks",
        "notes",
        "ministryActivities",
        "relationshipCommitments",
      ]),
    );
    expect(objectNames).not.toEqual(
      expect.arrayContaining([
        "payments",
        "receipts",
        "refunds",
        "statements",
        "reconciliationRecords",
      ]),
    );
  });

  it("distinguishes relationship commitments from payment truth", () => {
    const pledgeObject = getTwentyObjectDefinition("relationshipCommitments");

    expect(pledgeObject.fields.map((field) => field.name)).toEqual(
      expect.arrayContaining([
        "asymPledgeId",
        "commitmentAmountCents",
        "frequency",
        "commitmentStatus",
      ]),
    );
    expect(pledgeObject.fields.map((field) => field.name)).not.toEqual(
      expect.arrayContaining([
        "stripeSubscriptionId",
        "paymentMethodId",
        "totalPaid",
      ]),
    );
  });
});
