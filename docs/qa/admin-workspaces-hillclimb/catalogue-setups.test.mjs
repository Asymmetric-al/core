import assert from "node:assert/strict";
import test from "node:test";

import { createModuleStates } from "./module-states.mjs";
import { setupPage } from "./setup-test-page.mjs";

const state = (name) => {
  const entry = createModuleStates().find((item) => item.name === name);
  assert(entry, `Missing catalogue state: ${name}`);
  assert.equal(typeof entry.setup, "function", `Missing strict setup: ${name}`);
  return entry;
};
const text = (value, options = {}) => ({ text: value, ...options });
const role = (value, name, options = {}) => ({ role: value, name, ...options });

function staffPage(mode = "loaded", options = {}) {
  const dana = text("Dana Reyes");
  const naomi = text("Naomi Achterberg");
  const row = role("row", "Dana Reyes", { selector: "tbody tr" });
  const otherRow = role("row", "Naomi Achterberg", { selector: "tbody tr" });
  const noResults = text("No matching staff accounts", { visible: false });
  const hint = text("Try a different name, email or role.", { visible: false });
  const search = role("searchbox", "Search people", {
    value: "",
    onFill(value) {
      dana.visible = value === "Dana Reyes";
      naomi.visible = false;
      row.visible = dana.visible;
      otherRow.visible = false;
      noResults.visible = value === "catalogue-no-staff-match";
      hint.visible = noResults.visible;
    },
  });
  if (mode !== "loaded") {
    dana.visible = false;
    naomi.visible = false;
  }
  return setupPage(
    [
      role("heading", "Staff directory"),
      text("Roles are read-only here."),
      search,
      dana,
      naomi,
      row,
      otherRow,
      noResults,
      hint,
      text(
        mode === "error"
          ? "Could not load staff"
          : mode === "empty"
            ? "No staff accounts found"
            : "Loading staff",
        { visible: mode !== "loaded" },
      ),
    ],
    options,
  );
}

test("R03: staff search and no-results each start from a loaded authorized directory", async () => {
  for (const [name, query] of [
    ["admin-staff-search", "Dana Reyes"],
    ["admin-staff-no-results", "catalogue-no-staff-match"],
  ]) {
    const page = staffPage();
    await state(name).setup(page);
    assert.deepEqual(
      page.events.filter((event) => event.action !== "wait"),
      [{ action: "fill", target: "Search people", value: query }],
    );
    for (const mode of ["pending", "error", "empty", "non-admin"]) {
      const unavailable = staffPage(mode);
      await assert.rejects(state(name).setup(unavailable));
      assert(!unavailable.events.some((event) => event.action === "fill"));
    }
    await assert.rejects(
      state(name).setup(staffPage("loaded", { noEffects: true })),
    );
  }
});

test("R05: fresh desktop and mobile Care plan use their actual responsive controls", async () => {
  assert.equal(state("care-profile-plan").freshPerWidth, true);
  for (const width of [1440, 390]) {
    const description = text(
      "Goals and contact schedules the care team is working on.",
      { visible: false },
    );
    const goal = { label: "Add a goal", visible: false };
    const panel = role("tabpanel", "Care plan", {
      visible: false,
      children: [description, goal],
    });
    const tab = role("tab", "Care plan", {
      visible: width !== 390,
      attrs: { "aria-selected": "false" },
      onClick() {
        tab.attrs["aria-selected"] = "true";
        panel.visible = true;
        description.visible = true;
        goal.visible = true;
      },
    });
    const option = role("option", "Care plan", {
      visible: false,
      onClick() {
        panel.visible = true;
        description.visible = true;
        goal.visible = true;
      },
    });
    const combo = role("combobox", "Profile section", {
      visible: width === 390,
      onClick() {
        option.visible = true;
      },
    });
    const entries = [tab, combo, option, panel];
    const page = setupPage(entries, { width });
    await state("care-profile-plan").setup(page);
    assert.deepEqual(
      page.events
        .filter((event) => event.action === "click")
        .map((event) => event.target),
      width === 390 ? ["Profile section", "Care plan"] : ["Care plan"],
    );
    panel.visible = false;
    await assert.rejects(
      state("care-profile-plan").setup(
        setupPage(entries, { width, noEffects: true }),
      ),
    );
  }
});

test("R06: Export must become enabled before click and a real native menu must open", async () => {
  const menu = role("menu", "", {
    visible: false,
    children: [
      role("menuitem", "Test render with sample data"),
      role("menuitem", "Export as JSON"),
    ],
  });
  const trigger = role("button", "Export", {
    disabled: true,
    onClick() {
      menu.visible = true;
    },
  });
  const entries = [
    trigger,
    role("button", "Save"),
    text("Native editor"),
    menu,
  ];
  const page = setupPage(entries, {
    beforeWait(description) {
      if (description === "button:Export") trigger.disabled = false;
    },
  });
  await state("pdf-export-menu").setup(page);
  const clickIndex = page.events.findIndex((event) => event.action === "click");
  assert(
    page.events
      .slice(0, clickIndex)
      .some(
        (event) =>
          event.action === "wait" &&
          event.target === "button:Export" &&
          event.timeout === 120000,
      ),
  );
  assert.deepEqual(
    page.events.filter((event) => event.action === "click"),
    [{ action: "click", target: "Export" }],
  );
  trigger.disabled = true;
  menu.visible = false;
  const neverReady = setupPage(entries);
  await assert.rejects(state("pdf-export-menu").setup(neverReady));
  assert(!neverReady.events.some((event) => event.action === "click"));
  trigger.disabled = false;
  await assert.rejects(
    state("pdf-export-menu").setup(setupPage(entries, { noEffects: true })),
  );
});

test("R06: PDF studio readiness failure is fatal at setup, not only a warning-only settled hook", async () => {
  await assert.rejects(
    state("pdf-studio").setup(
      setupPage([role("button", "Save", { disabled: true })]),
    ),
  );
});

test("R05: missing mobile option, disabled trigger and wrong Care content cannot qualify", async () => {
  for (const failure of [
    "missing",
    "disabled",
    "missing-option",
    "wrong-panel",
  ]) {
    const panel = role("tabpanel", "Overview", {
      visible: false,
      children: [text("Care plan")],
    });
    const option = role("option", "Care plan", {
      visible: false,
      onClick() {
        panel.visible = true;
      },
    });
    const trigger = role("combobox", "Profile section", {
      disabled: failure === "disabled",
      onClick() {
        option.visible = true;
      },
    });
    const entries = [
      panel,
      ...(failure === "missing" ? [] : [trigger]),
      ...(failure === "missing-option" ? [] : [option]),
    ];
    const page = setupPage(entries, { width: 390 });
    await assert.rejects(
      state("care-profile-plan").setup(page),
      /setup unqualified/,
    );
    if (failure === "missing" || failure === "disabled")
      assert(!page.events.some((event) => event.action === "click"));
  }
});

test("R06: native menu requires enabled native items and rejects a wrong engine menu", async () => {
  for (const failure of ["disabled-native", "disabled-json", "wrong-engine"]) {
    const menu = role("menu", "", {
      visible: false,
      children:
        failure === "wrong-engine"
          ? [
              role("menuitem", "Export as PDF"),
              role("menuitem", "Export as HTML Ctrl+E"),
            ]
          : [
              role("menuitem", "Test render with sample data", {
                disabled: failure === "disabled-native",
              }),
              role("menuitem", "Export as JSON Ctrl+E", {
                disabled: failure === "disabled-json",
              }),
            ],
    });
    const trigger = role("button", "Export", {
      onClick() {
        menu.visible = true;
      },
    });
    await assert.rejects(
      state("pdf-export-menu").setup(
        setupPage([text("Native editor"), trigger, menu]),
      ),
      /setup unqualified/,
    );
  }
});

test("R04: unconnected Mobilize and Events assert their real messages and links without navigation", async () => {
  for (const [name, entries, link] of [
    [
      "mobilize-unconnected",
      [role("heading", "Mobilize"), text("Pipeline not connected yet")],
      role("link", "Manage locations", {
        attrs: { href: "/mobilize/locations" },
      }),
    ],
    [
      "events-unconnected",
      [
        role("heading", "Events"),
        role("heading", "Events is not connected yet"),
        text(
          "Donors who give appear in CRM; event attendance and registration totals are not available here yet.",
        ),
      ],
      role("link", "Open CRM", { attrs: { href: "/crm" } }),
    ],
  ]) {
    const page = setupPage([...entries, link]);
    await state(name).setup(page);
    assert(!page.events.some((event) => event.action === "click"));
    await assert.rejects(state(name).setup(setupPage([link])));
    link.attrs.href = "/wrong";
    await assert.rejects(state(name).setup(setupPage([...entries, link])));
  }
});

test("R04: follow-ups require the loaded populated fixture, disclosure and actual contribution links", async () => {
  const entries = [
    role("heading", "Tasks"),
    role("heading", "Needs attention"),
    text(
      "Follow-ups raised by Mission Control. Open the linked record to resolve the underlying issue. Team to-dos are no longer available here.",
    ),
    text(
      "Showing up to 100 most recently seen open follow-ups. Counts below cover this list; older items may not be shown. Retired issues are excluded.",
    ),
    text(
      "Receipt email bounced for Priscilla Adeyemi ($75.00, Okafor Family Support).",
    ),
    role("link", "Open contribution", {
      attrs: { href: "/contributions/fixture-gift" },
    }),
  ];
  const page = setupPage(entries);
  await state("tasks-follow-ups").setup(page);
  assert(!page.events.some((event) => event.action !== "wait"));
  for (const unavailable of [
    [role("status", "Loading follow-ups")],
    [text("Couldn’t load follow-ups")],
    entries.slice(0, 4),
    entries.slice(0, 5),
  ])
    await assert.rejects(
      state("tasks-follow-ups").setup(setupPage(unavailable)),
    );
});

const supportedHooks = [
  [
    "home-search",
    "button",
    "Open Mission Control search",
    () =>
      role("dialog", "Mission Control navigation", {
        children: [role("combobox", "Search Mission Control pages")],
      }),
  ],
  [
    "home-profile-menu",
    "button",
    "Open profile menu",
    () => role("menu", "", { children: [role("menuitem", "Sign out")] }),
  ],
  [
    "home-mobile-nav",
    "button",
    "Toggle Sidebar",
    () =>
      role("dialog", "Sidebar", {
        children: [role("button", "Close sidebar")],
      }),
  ],
  [
    "care-profile-thread",
    "tab",
    "Care thread",
    () =>
      role("tabpanel", "Care thread", {
        children: [{ label: "Care thread update" }],
      }),
  ],
  [
    "locations-list",
    "tab",
    "List",
    () =>
      role("tabpanel", "List", {
        children: [role("searchbox", "Search locations")],
      }),
  ],
  [
    "locations-add",
    "button",
    "Add location",
    () =>
      role("dialog", "Add location", {
        children: [
          { label: "Title" },
          { label: "Latitude" },
          { label: "Longitude" },
        ],
      }),
  ],
  ["support-table", "button", "Table", () => role("table", "Conversations")],
  [
    "automations-failing",
    "button",
    "Show the 1 failing rule",
    () =>
      role("group", "filtered", {
        children: [
          role("button", "Show all rules"),
          text("giving.failed-card-follow-up"),
          role("row", "giving.failed-card-follow-up", { selector: "tbody tr" }),
        ],
      }),
  ],
];

for (const [name, triggerRole, triggerName, makeResult] of supportedHooks) {
  test(`R07: ${name} requires its real positive postcondition and rejects missing, disabled or ineffective actions`, async () => {
    const build = (failure) => {
      const result = makeResult();
      result.visible = false;
      const trigger = role(triggerRole, triggerName, {
        visible: failure !== "missing",
        disabled: failure === "disabled",
        attrs: { "aria-selected": "false", "aria-pressed": "false" },
        onClick() {
          result.visible = true;
          trigger.attrs["aria-selected"] = "true";
          trigger.attrs["aria-pressed"] = "true";
        },
      });
      return setupPage([trigger, result], {
        noEffects: failure === "ineffective",
      });
    };
    const page = build();
    await state(name).setup(page);
    assert.deepEqual(
      page.events.filter((event) => event.action === "click"),
      [{ action: "click", target: triggerName }],
    );
    for (const failure of ["missing", "disabled", "ineffective"]) {
      await assert.rejects(
        state(name).setup(build(failure)),
        undefined,
        `${name}: ${failure}`,
      );
    }
  });
}

test("R06: Unlayer menu distinguishes enabled PDF from free mode with a real associated explanation", async () => {
  const noteText =
    "Free mode can't make PDFs: Unlayer only exports PDFs on a paid plan. Export as HTML still works.";
  for (const free of [false, true]) {
    const note = role("note", "", {
      children: [text(noteText, { attrs: { id: "export-note" } })],
    });
    const pdf = role("menuitem", "Export as PDF", {
      disabled: free,
      attrs: { "aria-describedby": free ? "export-note" : null },
    });
    const menu = role("menu", "", {
      visible: false,
      children: [pdf, role("menuitem", "Export as HTML Ctrl+E")],
    });
    const trigger = role("button", "Export", {
      onClick() {
        menu.visible = true;
      },
    });
    const entries = [
      text("Classic editor"),
      trigger,
      menu,
      ...(free ? [note] : []),
    ];
    const page = setupPage(entries);
    assert.equal(
      await state("pdf-export-menu").setup(page),
      free ? "unlayer-free-menu" : "unlayer-menu",
    );
    assert.deepEqual(
      page.events.filter((event) => event.action === "click"),
      [{ action: "click", target: "Export" }],
    );
    if (free) {
      note.visible = false;
      await assert.rejects(state("pdf-export-menu").setup(setupPage(entries)));
      note.visible = true;
      pdf.attrs["aria-describedby"] = null;
      await assert.rejects(state("pdf-export-menu").setup(setupPage(entries)));
    }
  }
});
