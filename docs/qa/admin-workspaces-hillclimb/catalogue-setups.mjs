const SETUP_TIMEOUT = 30000;

export const named = (page, role, name) =>
  page.getByRole(role, { name, exact: true });
export const shown = (locator) =>
  locator.waitFor({ state: "visible", timeout: SETUP_TIMEOUT });
export const hidden = (locator) =>
  locator.waitFor({ state: "hidden", timeout: SETUP_TIMEOUT });

export async function clickRequired(locator) {
  await shown(locator);
  if (!(await locator.isEnabled()))
    throw new Error("Required trigger is disabled");
  await locator.click({ timeout: SETUP_TIMEOUT });
}

export async function selected(page, locator, attribute = "aria-selected") {
  await shown(locator.and(page.locator(`[${attribute}="true"]`)));
}

export function qualifiedSetup(name, setup) {
  return async (page) => {
    try {
      return await setup(page);
    } catch (cause) {
      const width = page.viewportSize?.()?.width;
      const viewport =
        {
          1440: "desktop",
          1024: "intermediate",
          640: "small-tablet",
          390: "mobile",
        }[width] ?? `width-${width ?? "unknown"}`;
      throw new Error(
        `${name}: setup unqualified (${name}@${viewport}): ${cause.message}`,
        { cause },
      );
    }
  };
}

export async function loadedStaff(page) {
  await shown(named(page, "heading", "Staff directory"));
  await shown(
    page.getByText("Roles are read-only here.", { exact: false }).first(),
  );
  const search = named(page, "searchbox", "Search people");
  await shown(search);
  if ((await search.inputValue()) !== "")
    throw new Error("Staff setup requires an independent unfiltered directory");
  await shown(page.getByText("Dana Reyes", { exact: true }).first());
  await shown(page.getByText("Naomi Achterberg", { exact: true }).first());
  await hidden(page.getByText("Could not load staff", { exact: true }));
  await hidden(page.getByText("No staff accounts found", { exact: true }));
  await hidden(
    page.getByRole("button", {
      name: /^(Create team|New team|Manage Executive Leadership)$/i,
    }),
  );
  return search;
}

export async function filterStaff(page, noResults = false) {
  const search = await loadedStaff(page);
  await search.fill(noResults ? "catalogue-no-staff-match" : "Dana Reyes");
  await hidden(page.getByText("Naomi Achterberg", { exact: true }).first());
  if (noResults) {
    await shown(page.getByText("No matching staff accounts", { exact: true }));
    await shown(
      page.getByText("Try a different name, email or role.", { exact: true }),
    );
    await hidden(page.getByText("Dana Reyes", { exact: true }).first());
  } else {
    await shown(page.getByText("Dana Reyes", { exact: true }).first());
    if (
      (await page.locator("tbody tr").and(page.locator(":visible")).count()) !==
      1
    ) {
      throw new Error("Staff search must show only Dana's data row");
    }
  }
}

export async function openCarePlan(page) {
  const mobile = page.viewportSize()?.width < 640;
  if (mobile) {
    await clickRequired(named(page, "combobox", "Profile section"));
    await clickRequired(named(page, "option", "Care plan"));
  } else {
    const tab = named(page, "tab", "Care plan");
    await clickRequired(tab);
    await selected(page, tab);
  }
  const panel = named(page, "tabpanel", "Care plan");
  await shown(panel);
  await shown(
    panel.getByText(
      "Goals and contact schedules the care team is working on.",
      { exact: true },
    ),
  );
  await shown(panel.getByLabel("Add a goal", { exact: true }));
}

export async function openPdfExport(page) {
  const trigger = named(page, "button", "Export");
  await trigger
    .and(page.locator(":enabled"))
    .waitFor({ state: "visible", timeout: 120000 });
  await clickRequired(trigger);
  const menu = page.getByRole("menu");
  await shown(menu);
  if (await page.getByText("Native editor", { exact: true }).isVisible()) {
    const render = named(menu, "menuitem", "Test render with sample data");
    const json = menu.getByRole("menuitem", {
      name: /^Export as JSON(?:\s|$)/,
    });
    for (const item of [render, json]) {
      await shown(item);
      if (!(await item.isEnabled()))
        throw new Error("Native export menu item is disabled");
    }
    return "native-menu";
  }
  await shown(page.getByText("Classic editor", { exact: true }));
  const pdf = menu.getByRole("menuitem", {
    name: "Export as PDF",
    exact: false,
  });
  await shown(pdf);
  const html = menu.getByRole("menuitem", { name: /^Export as HTML(?:\s|$)/ });
  await shown(html);
  if (!(await html.isEnabled()))
    throw new Error("HTML export menu item is disabled");
  if (await pdf.isEnabled()) return "unlayer-menu";
  const noteId = await pdf.getAttribute("aria-describedby");
  if (!noteId || !/^[\w:.-]+$/.test(noteId))
    throw new Error("Blocked PDF item lacks its actual explanation");
  const note = page
    .getByRole("note")
    .filter({ has: page.locator(`[id="${noteId}"]`) });
  await shown(
    note.getByText(
      "Free mode can't make PDFs: Unlayer only exports PDFs on a paid plan. Export as HTML still works.",
      { exact: true },
    ),
  );
  return "unlayer-free-menu";
}

async function requireLink(page, name, href) {
  const link = named(page, "link", name);
  await shown(link);
  if ((await link.getAttribute("href")) !== href)
    throw new Error(`${name}: wrong destination`);
}

export async function unconnectedMobilize(page) {
  await shown(named(page, "heading", "Mobilize"));
  await shown(page.getByText("Pipeline not connected yet", { exact: true }));
  await requireLink(page, "Manage locations", "/mobilize/locations");
}

export async function unconnectedEvents(page) {
  await shown(named(page, "heading", "Events"));
  await shown(named(page, "heading", "Events is not connected yet"));
  await shown(
    page.getByText(
      "Donors who give appear in CRM; event attendance and registration totals are not available here yet.",
      { exact: true },
    ),
  );
  await requireLink(page, "Open CRM", "/crm");
}

export async function loadedFollowUps(page) {
  await shown(named(page, "heading", "Tasks"));
  await shown(named(page, "heading", "Needs attention"));
  await shown(page.getByText(/Team to-dos are no longer available here\./));
  await shown(
    page.getByText(
      "Showing up to 100 most recently seen open follow-ups. Counts below cover this list; older items may not be shown. Retired issues are excluded.",
      { exact: true },
    ),
  );
  await shown(
    page
      .getByText(
        "Receipt email bounced for Priscilla Adeyemi ($75.00, Okafor Family Support).",
        { exact: true },
      )
      .first(),
  );
  const link = named(page, "link", "Open contribution").first();
  await shown(link);
  if (
    !/^\/contributions\/[^/?#]+$/.test((await link.getAttribute("href")) ?? "")
  ) {
    throw new Error("Populated follow-ups must link to contributions");
  }
  await hidden(named(page, "status", "Loading follow-ups"));
  await hidden(page.getByText("Couldn’t load follow-ups", { exact: true }));
  await hidden(
    page.getByRole("button", {
      name: /^(New mission task|New task|Send year-end tax receipts)/i,
    }),
  );
}

export const SUPPORTED_SETUPS = {
  "home-search": async (page) => {
    await clickRequired(named(page, "button", "Open Mission Control search"));
    const dialog = named(page, "dialog", "Mission Control navigation");
    await shown(dialog);
    await shown(named(dialog, "combobox", "Search Mission Control pages"));
  },
  "home-profile-menu": async (page) => {
    await clickRequired(named(page, "button", "Open profile menu"));
    const menu = page.getByRole("menu");
    await shown(menu);
    await shown(named(menu, "menuitem", "Sign out"));
  },
  "home-mobile-nav": async (page) => {
    await clickRequired(
      page.getByRole("button", { name: /^toggle sidebar$/i }),
    );
    const dialog = named(page, "dialog", "Sidebar");
    await shown(dialog);
    await shown(named(dialog, "button", "Close sidebar"));
  },
  "care-profile-thread": async (page) => {
    const tab = named(page, "tab", "Care thread");
    await clickRequired(tab);
    await selected(page, tab);
    const panel = named(page, "tabpanel", "Care thread");
    await shown(panel);
    await shown(panel.getByLabel("Care thread update", { exact: true }));
  },
  "locations-list": async (page) => {
    const tab = named(page, "tab", "List");
    await clickRequired(tab);
    await selected(page, tab);
    const panel = named(page, "tabpanel", "List");
    await shown(panel);
    await shown(named(panel, "searchbox", "Search locations"));
  },
  "locations-add": async (page) => {
    await clickRequired(named(page, "button", "Add location"));
    const dialog = named(page, "dialog", "Add location");
    await shown(dialog);
    for (const label of ["Title", "Latitude", "Longitude"]) {
      await shown(dialog.getByLabel(label, { exact: true }));
    }
  },
  "support-table": async (page) => {
    const button = named(page, "button", "Table");
    const current = await button.isVisible();
    const trigger = current ? button : named(page, "radio", "Table");
    await clickRequired(trigger);
    await selected(page, trigger, current ? "aria-pressed" : "aria-checked");
    await shown(page.getByRole("table"));
  },
  "automations-failing": async (page) => {
    await clickRequired(named(page, "button", "Show the 1 failing rule"));
    await shown(named(page, "button", "Show all rules"));
    await shown(
      page.getByText("giving.failed-card-follow-up", { exact: true }).first(),
    );
    for (const name of [
      "giving.thank-you-email",
      "care.check-in-reminder",
      "mobilize.applicant-welcome",
      "giving.year-end-statement",
      "crm.duplicate-review",
    ]) {
      await hidden(page.getByText(name, { exact: true }).first());
    }
    if (
      (await page.locator("tbody tr").and(page.locator(":visible")).count()) !==
      1
    ) {
      throw new Error(
        "Expected only failing rule-2 (two failed runs), not multiple failing rules",
      );
    }
  },
};
