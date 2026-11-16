import assert from "node:assert/strict";
import test from "node:test";

import { setupPage } from "./setup-test-page.mjs";
import * as catalogue from "./workspace-states.mjs";

const giftId = "e0a15e46-a328-4b24-a921-681c12884ef6";
const role = (value, name, options = {}) => ({ role: value, name, ...options });

function bundleFixture() {
  const shared = {
    donationId: giftId,
    amountCents: 100000,
    currencyCode: "USD",
    giftDate: "2026-11-01",
    designationSummary: { fundName: "Clean Water Initiative" },
  };
  return {
    captureMeta: {
      crmDrawerId: "margaret",
      crmDrawerName: "Margaret Okonkwo-Hale",
      contributionCorrectionId: giftId,
      contributionSheetId: "nikhil-split",
      contributionSheetDonor: "Nikhil",
    },
    details: {
      "GET /api/admin/crm/records/:recordId": {
        margaret: {
          donor: { id: "margaret" },
          giftHistory: [
            {
              id: "other",
              shared: { ...shared, donationId: "other", amountCents: 7500 },
            },
            {
              id: giftId,
              shared,
              inlineActions: {
                entries: [
                  {
                    actionType: "amount_correction",
                    available: false,
                    blockedReason: "Pending approval",
                    nextStep: null,
                  },
                  { actionType: "fund_correction", available: true },
                ],
              },
            },
          ],
        },
      },
      "GET /api/admin/contribution-operations/:contributionId": {
        [giftId]: {
          actionAvailability: [
            { actionType: "fund_correction", available: true },
          ],
        },
      },
    },
  };
}

function giftPage(options = {}) {
  const shell = {
    testId: "contribution-operation-shell",
    visible: false,
    children: [
      role(
        "heading",
        options.wrongForm ? "Refund gift" : "Correct fund designation",
      ),
      role("combobox", "Destination fund"),
      { label: "Reason" },
    ],
  };
  const menu = role("menu", "", {
    visible: false,
    children: [
      role("menuitem", "Correct gift amount Blocked Pending approval", {
        disabled: true,
        attrs: { title: "Pending approval" },
      }),
      role("menuitem", "Correct fund designation", {
        disabled: options.blocked,
        onClick() {
          shell.visible = true;
        },
      }),
      role("menuitem", "Pin row action"),
    ],
  });
  const expected = role(
    "button",
    "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
    {
      onClick() {
        menu.visible = true;
      },
    },
  );
  const page = setupPage(
    [
      { text: "Margaret Okonkwo-Hale" },
      role(
        "button",
        "More actions for $75.00 gift on Nov 1, 2026 to Clean Water Initiative",
      ),
      ...(options.missingTarget ? [] : [expected]),
      role("button", "More gift actions"),
      menu,
      shell,
    ],
    { noEffects: options.noEffects },
  );
  page.url = () =>
    `http://fixture.invalid/crm?donor=${options.wrongDonor ? "someone-else" : "margaret"}`;
  return { page, menu };
}

test("R09: real gift-specific accessible target opens only the anchored gift menu", async () => {
  const bundle = bundleFixture();
  const state = catalogue
    .createStates(bundle.captureMeta, bundle)
    .find((entry) => entry.name === "crm-gift-row-menu");
  const { page, menu } = giftPage();
  await state.setup(page);
  assert.deepEqual(
    page.events
      .filter((event) => event.action === "click")
      .map((event) => event.target),
    [
      "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
    ],
  );
  assert.equal(menu.children[0].disabled, true);
  assert.equal(menu.children[0].attrs.title, "Pending approval");
  menu.children[0].attrs.title = "Invented reason";
  await assert.rejects(state.setup(page), /blocked reason changed/);
  for (const options of [
    { missingTarget: true },
    { noEffects: true },
    { wrongDonor: true },
  ]) {
    await assert.rejects(
      state.setup(giftPage(options).page),
      /crm-gift-row-menu: setup unqualified/,
    );
  }
  await assert.rejects(
    catalogue
      .createStates(bundle.captureMeta)
      .find((entry) => entry.name === state.name)
      .setup(giftPage().page),
    /fixture bundle/i,
  );
});

test("R10: unavailable Hub entrypoint never becomes CRM or underlying detail evidence", async () => {
  const bundle = bundleFixture();
  const state = catalogue
    .createStates(bundle.captureMeta, bundle)
    .find((entry) => entry.name === "contribution-fund-correction");
  const { page } = giftPage();
  await assert.rejects(state.setup(page), /Hub.*entrypoint.*NOT_EXERCISED/i);
  assert.equal(page.events.length, 0);
  assert(
    catalogue.UNAVAILABLE_WORKSPACE_WORKFLOWS?.some(
      (entry) =>
        entry.name === state.name &&
        entry.status === "NOT_EXERCISED" &&
        entry.equivalentWorkflow === false,
    ),
  );
});

test("R10: optional CRM form validates membership and availability before producing a state", async () => {
  assert.equal(typeof catalogue.createOptionalCrmStates, "function");
  const bundle = bundleFixture();
  const [state] = catalogue.createOptionalCrmStates(bundle);
  assert.deepEqual(
    {
      name: state.name,
      area: state.area,
      widths: state.widths,
      full: state.full,
      freshPerWidth: state.freshPerWidth,
      dialog: state.dialog,
      studioLookups: state.studioLookups,
    },
    {
      name: "crm-fund-correction",
      area: "crm",
      widths: ["desktop", "mobile"],
      full: false,
      freshPerWidth: true,
      dialog: true,
      studioLookups: true,
    },
  );
  assert.equal(state.route(), "/crm?donor=margaret");
  assert.equal(state.operationContext.donationId, giftId);
  assert.equal(state.operationContext.sourceSurface, "donor_crm_record");
  for (const width of [1440, 390]) {
    const { page } = giftPage();
    page.viewportSize = () => ({ width, height: 844 });
    await state.setup(page);
    assert.deepEqual(
      page.events
        .filter((event) => event.action === "click")
        .map((event) => event.target),
      [
        "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
        "Correct fund designation",
      ],
    );
    assert(!page.events.some((event) => event.action === "fill"));
  }
  for (const options of [
    { blocked: true },
    { noEffects: true },
    { wrongForm: true },
    { missingTarget: true },
    { wrongDonor: true },
  ]) {
    await assert.rejects(
      state.setup(giftPage(options).page),
      /crm-fund-correction: setup unqualified/,
    );
  }
  for (const change of [
    (value) => {
      delete value.details[
        "GET /api/admin/contribution-operations/:contributionId"
      ][giftId];
    },
    (value) => {
      value.details["GET /api/admin/contribution-operations/:contributionId"][
        giftId
      ].actionAvailability[0].available = false;
    },
    (value) => {
      value.details[
        "GET /api/admin/crm/records/:recordId"
      ].margaret.giftHistory.pop();
    },
    (value) => {
      value.captureMeta.crmDrawerId = "other-donor";
    },
    (value) => {
      value.captureMeta.contributionCorrectionId = "nikhil-split";
    },
  ]) {
    const invalid = bundleFixture();
    change(invalid);
    assert.throws(
      () => catalogue.createOptionalCrmStates(invalid),
      /fixture|eligible|anchor/i,
    );
  }
  assert(
    !catalogue
      .createStates(bundle.captureMeta, bundle)
      .some((entry) => entry.name === state.name),
  );
});
