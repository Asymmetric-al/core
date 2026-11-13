import {
  clickRequired,
  named,
  qualifiedSetup,
  shown,
} from "./catalogue-setups.mjs";

const GIFT_ID = "e0a15e46-a328-4b24-a921-681c12884ef6";

export const UNAVAILABLE_WORKSPACE_WORKFLOWS = [
  {
    name: "contribution-fund-correction",
    status: "NOT_EXERCISED",
    equivalentWorkflow: false,
    reason:
      "Hub correction entrypoint is unavailable; underlying detail is not correction-form evidence.",
  },
];

export function giftAnchor(meta, bundle, requireCorrection = false) {
  if (
    !bundle?.details ||
    bundle.captureMeta?.crmDrawerId !== meta.crmDrawerId
  ) {
    throw new Error("Gift setup requires its current bound fixture bundle");
  }
  if (meta.contributionCorrectionId !== GIFT_ID || !meta.crmDrawerName)
    throw new Error("Expected gift fixture anchor changed");
  const donor =
    bundle.details["GET /api/admin/crm/records/:recordId"]?.[meta.crmDrawerId];
  const matches =
    donor?.giftHistory?.filter(
      (gift) =>
        (gift.shared?.donationId ?? gift.donationId ?? gift.id) === GIFT_ID,
    ) ?? [];
  if (donor?.donor?.id !== meta.crmDrawerId || matches.length !== 1)
    throw new Error("Gift fixture donor membership is absent or ambiguous");
  const gift = matches[0];
  const shared = gift.shared;
  if (
    !shared ||
    !Number.isSafeInteger(shared.amountCents) ||
    !shared.currencyCode ||
    !shared.designationSummary?.fundName
  ) {
    throw new Error("Gift fixture display anchor is incomplete");
  }
  if (requireCorrection) {
    const detail =
      bundle.details[
        "GET /api/admin/contribution-operations/:contributionId"
      ]?.[GIFT_ID];
    if (
      !detail?.actionAvailability?.some(
        (entry) =>
          entry.actionType === "fund_correction" && entry.available === true,
      )
    ) {
      throw new Error(
        "Anchored fixture gift is not eligible for fund correction",
      );
    }
  }
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: shared.currencyCode,
  }).format(shared.amountCents / 100);
  const date = shared.giftDate
    ? new Date(
        shared.giftDate.includes("T")
          ? shared.giftDate
          : `${shared.giftDate}T00:00:00`,
      )
    : null;
  if (date && Number.isNaN(date.getTime()))
    throw new Error("Gift fixture date is invalid");
  const formattedDate = date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    : null;
  const label = `${amount} gift${formattedDate ? ` on ${formattedDate}` : ""} to ${shared.designationSummary.fundName}`;
  return {
    donationId: GIFT_ID,
    donorId: meta.crmDrawerId,
    donorName: meta.crmDrawerName,
    label,
    entries: gift.inlineActions?.entries ?? [],
  };
}

export async function openGiftMenu(page, anchor) {
  const url = new URL(page.url());
  if (
    url.pathname !== "/crm" ||
    url.searchParams.get("donor") !== anchor.donorId
  )
    throw new Error("Wrong anchored donor route");
  await shown(page.getByText(anchor.donorName, { exact: true }).first());
  await clickRequired(
    named(page, "button", `More actions for ${anchor.label}`),
  );
  const menu = page.getByRole("menu");
  await shown(menu);
  for (const title of [
    "Correct gift amount",
    "Correct fund designation",
    "Pin row action",
  ]) {
    await shown(
      menu.getByRole("menuitem", { name: new RegExp(`^${title}(?:\\s|$)`) }),
    );
  }
  for (const [type, title] of [
    ["amount_correction", "Correct gift amount"],
    ["fund_correction", "Correct fund designation"],
  ]) {
    const expected = anchor.entries.find((entry) => entry.actionType === type);
    if (!expected) continue;
    const item = menu.getByRole("menuitem", {
      name: new RegExp(`^${title}(?:\\s|$)`),
    });
    if ((await item.isEnabled()) !== expected.available)
      throw new Error(`${title}: fixture availability changed`);
    if (!expected.available) {
      const explanation = [expected.blockedReason, expected.nextStep]
        .filter(Boolean)
        .join(". ");
      if (!explanation || (await item.getAttribute("title")) !== explanation)
        throw new Error(`${title}: blocked reason changed`);
    }
  }
  return menu;
}

export const giftMenuSetup = (meta, bundle) =>
  qualifiedSetup("crm-gift-row-menu", async (page) =>
    openGiftMenu(page, giftAnchor(meta, bundle)),
  );

export async function unavailableHubCorrection() {
  throw new Error(
    "Hub correction entrypoint: NOT_EXERCISED; CRM form coverage is separate and opt-in",
  );
}

export function createOptionalCrmStates(bundle) {
  const meta = bundle?.captureMeta ?? {};
  const anchor = giftAnchor(meta, bundle, true);
  return [
    {
      name: "crm-fund-correction",
      area: "crm",
      route: () => `/crm?donor=${anchor.donorId}`,
      widths: ["desktop", "mobile"],
      full: false,
      freshPerWidth: true,
      dialog: true,
      studioLookups: true,
      ready: () => anchor.donorName,
      operationContext: {
        sourceSurface: "donor_crm_record",
        donationId: anchor.donationId,
        donorId: anchor.donorId,
      },
      comparison: "OPTIONAL_ADDITIVE_NO_EQUIVALENT_HUB_ENTRYPOINT",
      setup: qualifiedSetup("crm-fund-correction", async (page) => {
        giftAnchor(meta, bundle, true);
        const menu = await openGiftMenu(page, anchor);
        await clickRequired(
          named(menu, "menuitem", "Correct fund designation"),
        );
        const shell = page.getByTestId("contribution-operation-shell");
        await shown(shell);
        await shown(named(shell, "heading", "Correct fund designation"));
        await shown(named(shell, "combobox", "Destination fund"));
        await shown(shell.getByLabel("Reason", { exact: true }));
      }),
    },
  ];
}
