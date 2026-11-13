import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";

import { selectStates } from "./catalogue-inventory.mjs";
import { createModuleStates } from "./module-states.mjs";
import { setupPage } from "./setup-test-page.mjs";
import { createOptionalCrmStates } from "./workspace-catalogue-setups.mjs";
import {
  createStates as createWorkspaceStates,
  VIEWPORTS,
} from "./workspace-states.mjs";

const harnessDirectory = path.dirname(fileURLToPath(import.meta.url));
const dimensions = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 640, height: 900 },
  { width: 390, height: 844 },
];

function outputDirectory(context) {
  const directory = fs.mkdtempSync(
    path.join(harnessDirectory, ".harness-test-"),
  );
  context.after(() => {
    assert.equal(path.dirname(directory), harnessDirectory);
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function createState(name, widths = ["desktop"], options = {}) {
  return { area: "crm", name, widths, route: `/${name}`, ...options };
}

function giftFixture() {
  const donationId = "e0a15e46-a328-4b24-a921-681c12884ef6";
  return {
    captureMeta: {
      crmDrawerId: "margaret",
      crmDrawerName: "Margaret Okonkwo-Hale",
      contributionCorrectionId: donationId,
      contributionSheetId: "nikhil-split",
      contributionSheetDonor: "Nikhil",
    },
    details: {
      "GET /api/admin/crm/records/:recordId": {
        margaret: {
          donor: { id: "margaret" },
          giftHistory: [
            {
              shared: {
                donationId,
                amountCents: 100000,
                currencyCode: "USD",
                giftDate: "2026-11-01",
                designationSummary: { fundName: "Clean Water Initiative" },
              },
              inlineActions: {
                entries: [
                  {
                    actionType: "amount_correction",
                    available: false,
                    blockedReason: "Pending approval",
                  },
                  { actionType: "fund_correction", available: true },
                ],
              },
            },
          ],
        },
      },
      "GET /api/admin/contribution-operations/:contributionId": {
        [donationId]: {
          actionAvailability: [
            { actionType: "fund_correction", available: true },
          ],
        },
      },
    },
  };
}

function configureGiftPage(page, events, options = {}) {
  const shell = {
    testId: "contribution-operation-shell",
    visible: false,
    children: [
      {
        role: "heading",
        name: options.wrongForm ? "Refund gift" : "Correct fund designation",
      },
      { role: "combobox", name: "Destination fund" },
      { label: "Reason" },
      { role: "button", name: "Submit correction" },
    ],
  };
  const menu = {
    role: "menu",
    visible: false,
    children: [
      {
        role: "menuitem",
        name: "Correct gift amount Blocked Pending approval",
        disabled: true,
        attrs: { title: "Pending approval" },
      },
      {
        role: "menuitem",
        name: "Correct fund designation",
        onClick: () => {
          shell.visible = true;
        },
      },
      { role: "menuitem", name: "Pin row action" },
    ],
  };
  const fake = setupPage(
    [
      { text: "Margaret Okonkwo-Hale" },
      { role: "button", name: "More gift actions" },
      {
        role: "button",
        name: "More actions for $75.00 gift on Nov 1, 2026 to Clean Water Initiative",
      },
      {
        role: "button",
        name: "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
        onClick: () => {
          menu.visible = true;
        },
      },
      menu,
      shell,
    ],
    options,
  );
  for (const method of [
    "getByRole",
    "getByText",
    "getByLabel",
    "getByTestId",
    "locator",
  ]) {
    page[method] = fake[method];
  }
  events.push(fake.events);
}

async function runHarness(runner, directory, states, options = {}) {
  const events = options.events ?? [];
  const logs = [];
  let exitCode;
  const sandbox = createContext({
    console: Object.fromEntries(
      ["log", "warn", "error"].map((level) => [
        level,
        (...args) => logs.push({ level, message: args.join(" ") }),
      ]),
    ),
    process: {
      argv: ["node", runner, directory, ...(options.args ?? [])],
      env: {},
      exit: (code) => {
        exitCode = code;
      },
    },
  });
  const operation = (stage, detail = {}) => {
    const event = { stage, ...detail };
    events.push(event);
    options.operation?.(event);
  };
  const context = {
    request: {
      post: async () => ({ ok: () => true, status: () => 200 }),
    },
    async newPage() {
      let viewport = { width: 1440, height: 1000 };
      let route = "/";
      let search = "";
      const page = {
        async setViewportSize(size) {
          viewport = { ...size };
          operation("viewport", { viewport });
        },
        async goto(url) {
          const target = new URL(url);
          route = target.pathname;
          search = target.search;
          operation("navigation", { route, viewport });
        },
        url: () => `http://localhost:3030${route}${search}`,
        viewportSize: () => viewport,
        waitForLoadState: async () => {},
        waitForTimeout: async () => {},
        waitForFunction: async () => {},
        addStyleTag: async () => {},
        close: async () => operation("page close", { route, viewport }),
        screenshot: async (settings) =>
          operation(settings.fullPage ? "full screenshot" : "screenshot", {
            route,
            viewport,
          }),
        async evaluate(callback) {
          const body = { querySelectorAll: () => [] };
          sandbox.document = {
            body,
            documentElement: {
              scrollHeight: viewport.height,
              scrollWidth: viewport.width,
            },
            querySelector: (selector) => (selector === "main" ? body : null),
            querySelectorAll: () => [],
          };
          sandbox.window = { innerWidth: viewport.width, scrollTo() {} };
          sandbox.location = { pathname: route, search };
          const measured = await callback();
          if (measured && typeof measured === "object" && "path" in measured) {
            operation("measurement", { route, viewport });
          }
          return measured;
        },
      };
      options.configurePage?.(page);
      return page;
    },
  };
  class AxeBuilder {
    withTags() {
      return this;
    }
    exclude() {
      return this;
    }
    async analyze() {
      operation("axe");
      return { violations: [], incomplete: options.axeIncomplete ?? [] };
    }
  }
  const modules = {
    "node:crypto": crypto,
    "node:fs": { ...fs, ...options.fileSystem },
    "node:path": path,
    "@axe-core/playwright": { default: AxeBuilder },
    "playwright-core": {
      chromium: {
        async launch() {
          operation("launch");
          return {
            newContext: async () => context,
            close: async () => operation("browser close"),
          };
        },
      },
    },
    "./catalogue-inventory.mjs": { selectStates },
    "./fixture-preflight.mjs": {
      prepareFixtureBundle() {
        operation("preflight");
        return {
          bundle: options.fixtures ?? { captureMeta: {} },
          proof: { typecheck: "passed" },
        };
      },
    },
    "./fixtures/module-fixtures.mjs": { installModuleFixtures: async () => {} },
    "./fixtures/route-fixtures.mjs": {
      installApiFixtures: async (page, settings) =>
        options.installApiFixtures?.(page, settings),
    },
    "./module-states.mjs": {
      createModuleStates: () => options.moduleStates ?? [],
    },
    "./route-errors.mjs": {
      readRouteErrorHeadings: async () => options.routeErrors ?? [],
    },
    "./studio-fixtures.mjs": {
      installStudioFixtures: async () => {},
      resetStudioState: async () => operation("studio reset"),
    },
    "./workspace-catalogue-setups.mjs": {
      createOptionalCrmStates(bundle) {
        const optional = createOptionalCrmStates(bundle);
        operation("optional catalogue", { bundle, states: optional });
        return optional;
      },
    },
    "./workspace-states.mjs": {
      VIEWPORTS,
      bounded: async (promise) => promise,
      createStates: options.createStates ?? (() => states),
      missingSetups: options.missingSetups ?? [],
      setCurrentState: () => {},
      waitForStateReady: async () => {},
      waitForSettled: async () => {},
    },
  };
  const sourceModule = (name) =>
    new SourceTextModule(
      fs.readFileSync(path.join(harnessDirectory, name), "utf8"),
      { context: sandbox },
    );
  const entry = sourceModule(`${runner}-workspaces.mjs`);
  await entry.link((specifier) => {
    if (specifier === "./harness-results.mjs") {
      return sourceModule("harness-results.mjs");
    }
    assert(
      Object.hasOwn(modules, specifier),
      `Unexpected import: ${specifier}`,
    );
    const exports = modules[specifier];
    return new SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [name, value] of Object.entries(exports)) {
          this.setExport(name, value);
        }
      },
      { context: sandbox },
    );
  });
  await entry.evaluate();
  return { events, logs, exitCode };
}

test("capture persists a completed viewport before the next viewport fails", async (context) => {
  const directory = outputDirectory(context);
  const metricsFile = path.join(directory, "page-metrics.json");
  const events = [];
  await assert.rejects(
    runHarness(
      "capture",
      directory,
      [createState("first", ["desktop", "intermediate"])],
      {
        args: ["crm"],
        events,
        operation(event) {
          if (event.stage === "screenshot" && event.viewport.width === 1024) {
            throw new Error("simulated viewport timeout");
          }
        },
      },
    ),
    /simulated viewport timeout/,
  );
  assert(events.some((event) => event.stage === "browser close"));
  assert(
    fs.existsSync(metricsFile),
    "completed metrics must survive interruption",
  );
  const metrics = JSON.parse(fs.readFileSync(metricsFile, "utf8"));
  assert.deepEqual(Object.keys(metrics), ["first"]);
  assert.deepEqual(Object.keys(metrics.first), ["desktop"]);
  assert.equal(metrics.first.desktop.path, "/first");
});

test("checker measures all declared widths at capture dimensions before navigation and after setup", async (context) => {
  const directory = outputDirectory(context);
  const { events, exitCode } = await runHarness(
    "check",
    directory,
    [
      createState(
        "all-widths",
        VIEWPORTS.map((viewport) => viewport.name),
        {
          setup: (page) => page.setViewportSize({ width: 777, height: 555 }),
        },
      ),
    ],
    { args: ["crm"] },
  );
  assert.equal(exitCode, 0);
  const checks = JSON.parse(
    fs.readFileSync(path.join(directory, "workspace-checks.json"), "utf8"),
  );
  assert.deepEqual(
    checks.map((check) => check.viewport),
    ["desktop", "intermediate", "small-tablet", "mobile"],
  );
  for (const stage of ["navigation", "measurement"]) {
    assert.deepEqual(
      events
        .filter((event) => event.stage === stage)
        .map((event) => event.viewport),
      dimensions,
    );
  }
});

for (const stage of [
  "navigation",
  "full screenshot",
  "measurement",
  "page close",
]) {
  test(`capture retains only completed pairs when ${stage} fails`, async (context) => {
    const directory = outputDirectory(context);
    await assert.rejects(
      runHarness(
        "capture",
        directory,
        [
          createState("completed"),
          createState("unfinished", ["desktop", "mobile"], { full: true }),
        ],
        {
          args: ["crm"],
          operation(event) {
            if (event.route === "/unfinished" && event.stage === stage) {
              throw new Error(`simulated ${stage} failure`);
            }
          },
        },
      ),
      new RegExp(`simulated ${stage} failure`),
    );
    const saved = JSON.parse(
      fs.readFileSync(path.join(directory, "page-metrics.json"), "utf8"),
    );
    assert.deepEqual(Object.keys(saved.completed), ["desktop"]);
    if (stage === "page close") {
      assert.deepEqual(Object.keys(saved.unfinished), ["desktop", "mobile"]);
    } else {
      assert(!Object.hasOwn(saved, "unfinished"));
    }
  });
}

test("a later axe failure preserves completed checks without inventing an unfinished check", async (context) => {
  const directory = outputDirectory(context);
  let scans = 0;
  await assert.rejects(
    runHarness(
      "check",
      directory,
      [createState("first", ["desktop", "mobile"])],
      {
        args: ["crm"],
        operation(event) {
          if (event.stage === "axe" && ++scans === 2) {
            throw new Error("simulated axe timeout");
          }
        },
      },
    ),
    /simulated axe timeout/,
  );
  const saved = JSON.parse(
    fs.readFileSync(path.join(directory, "workspace-checks.json"), "utf8"),
  );
  assert.deepEqual(
    saved.map((result) => `${result.state}@${result.viewport}`),
    ["first@desktop"],
  );
});

for (const runner of ["capture", "check"]) {
  const fileName =
    runner === "capture" ? "page-metrics.json" : "workspace-checks.json";

  test(`${runner} binds the preflight fixture bundle to the real gift-menu setup`, async (context) => {
    const directory = outputDirectory(context);
    const fixtures = giftFixture();
    const setupEvents = [];
    let fixtureInstallations = 0;
    const { events, exitCode } = await runHarness(runner, directory, [], {
      args: ["crm", "crm-gift-row-menu"],
      fixtures,
      createStates: createWorkspaceStates,
      configurePage: (page) => configureGiftPage(page, setupEvents),
      installApiFixtures(page, settings) {
        assert.equal(settings.bundle, fixtures);
        fixtureInstallations += 1;
      },
    });
    assert.equal(exitCode, 0);
    assert.equal(fixtureInstallations, 1);
    assert.deepEqual(
      setupEvents
        .flat()
        .filter((event) => event.action === "click")
        .map((event) => event.target),
      [
        "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
      ],
    );
    assert.equal(
      events.filter((event) => event.stage === "measurement").length,
      1,
    );
    const saved = JSON.parse(
      fs.readFileSync(path.join(directory, fileName), "utf8"),
    );
    const result =
      runner === "capture" ? saved["crm-gift-row-menu"].desktop : saved[0];
    assert.equal(result.path, "/crm?donor=margaret");
  });

  test(`${runner} explicitly opts into the eligible CRM correction at fresh desktop/mobile widths`, async (context) => {
    const directory = outputDirectory(context);
    const fixtures = giftFixture();
    const setupEvents = [];
    const { events, exitCode } = await runHarness(runner, directory, [], {
      args: [" crm ", " crm-fund-correction "],
      fixtures,
      createStates: createWorkspaceStates,
      configurePage: (page) => configureGiftPage(page, setupEvents),
      installApiFixtures(page, settings) {
        assert.equal(settings.bundle, fixtures);
      },
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(
      events
        .filter((event) => event.stage === "measurement")
        .map((event) => event.viewport),
      [dimensions[0], dimensions[3]],
    );
    assert.equal(setupEvents.length, 2);
    for (const actions of setupEvents) {
      assert.deepEqual(
        actions
          .filter((event) => event.action === "click")
          .map((event) => event.target),
        [
          "More actions for $1,000.00 gift on Nov 1, 2026 to Clean Water Initiative",
          "Correct fund designation",
        ],
      );
      for (const target of [
        "testId:contribution-operation-shell",
        "heading:Correct fund designation",
        "combobox:Destination fund",
        "label:Reason",
      ]) {
        assert(
          actions.some(
            (event) => event.action === "wait" && event.target === target,
          ),
        );
      }
    }
    const optional = events.find(
      (event) => event.stage === "optional catalogue",
    );
    assert.equal(optional.bundle, fixtures);
    assert.deepEqual(optional.states[0].operationContext, {
      sourceSurface: "donor_crm_record",
      donationId: fixtures.captureMeta.contributionCorrectionId,
      donorId: fixtures.captureMeta.crmDrawerId,
    });
    const saved = JSON.parse(
      fs.readFileSync(path.join(directory, fileName), "utf8"),
    );
    assert.deepEqual(
      runner === "capture"
        ? Object.keys(saved)
        : [...new Set(saved.map((entry) => entry.state))],
      ["crm-fund-correction"],
    );
  });

  for (const failure of ["donor membership", "correction eligibility"]) {
    test(`${runner} rejects optional CRM correction with invalid ${failure} before launch or output writes`, async (context) => {
      const directory = outputDirectory(context);
      const fixtures = giftFixture();
      if (failure === "donor membership") {
        fixtures.details[
          "GET /api/admin/crm/records/:recordId"
        ].margaret.donor.id = "someone-else";
      } else {
        fixtures.details[
          "GET /api/admin/contribution-operations/:contributionId"
        ][
          fixtures.captureMeta.contributionCorrectionId
        ].actionAvailability[0].available = false;
      }
      const events = [];
      await assert.rejects(
        runHarness(runner, directory, [], {
          args: ["crm", "crm-fund-correction"],
          fixtures,
          events,
          createStates: createWorkspaceStates,
        }),
        failure === "donor membership"
          ? /Gift fixture donor membership/
          : /not eligible for fund correction/,
      );
      assert(!events.some((event) => event.stage === "launch"));
      assert.deepEqual(fs.readdirSync(directory), []);
    });
  }

  test(`${runner} does not construct optional CRM states for an area-only request`, async (context) => {
    const directory = outputDirectory(context);
    const { events, exitCode } = await runHarness(
      runner,
      directory,
      [createState("selected")],
      {
        args: ["crm"],
      },
    );
    assert.equal(exitCode, 0);
    assert(!events.some((event) => event.stage === "optional catalogue"));
    assert.deepEqual(
      events
        .filter((event) => event.stage === "navigation")
        .map((event) => event.route),
      ["/selected"],
    );
  });

  for (const [args, reason] of [
    [
      ["contributions", "crm-fund-correction"],
      /Named state is outside selected areas/,
    ],
    [
      ["crm", "crm-fund-correction,crm-fund-correction"],
      /Duplicate state selection/,
    ],
    [["crm", "crm-fund-correction,"], /Empty state selection/],
    [
      ["crm", "crm-fund-correction,unknown"],
      /Unknown or retired state: unknown/,
    ],
  ]) {
    test(`${runner} validates explicit optional CLI selection ${JSON.stringify(args)} before launch or output writes`, async (context) => {
      const directory = outputDirectory(context);
      const events = [];
      await assert.rejects(
        runHarness(runner, directory, [], {
          args,
          fixtures: giftFixture(),
          events,
          createStates: createWorkspaceStates,
        }),
        reason,
      );
      assert(!events.some((event) => event.stage === "launch"));
      assert.deepEqual(fs.readdirSync(directory), []);
    });
  }

  test(`${runner} does not reset unselected Studio states in a named CRM batch`, async (context) => {
    const directory = outputDirectory(context);
    const { events, exitCode } = await runHarness(
      runner,
      directory,
      [
        createState("selected"),
        createState("studio-unselected", ["desktop"], { area: "studio" }),
      ],
      { args: ["crm,studio", "selected"] },
    );
    assert.equal(exitCode, 0);
    assert(!events.some((event) => event.stage === "studio reset"));
  });

  for (const includeOptional of [false, true]) {
    test(`${runner} retains the unavailable Hub denominator${includeOptional ? " alongside an optional CRM request" : ""}`, async (context) => {
      const directory = outputDirectory(context);
      const events = [];
      const setupEvents = [];
      await assert.rejects(
        runHarness(runner, directory, [], {
          args: [
            includeOptional ? "contributions,crm" : "contributions",
            `completed,contribution-fund-correction${includeOptional ? ",crm-fund-correction" : ""}`,
          ],
          fixtures: giftFixture(),
          events,
          createStates(meta, bundle) {
            const states = createWorkspaceStates(meta, bundle);
            const hub = states.find(
              (state) => state.name === "contribution-fund-correction",
            );
            assert.deepEqual(hub.widths, ["desktop", "mobile"]);
            assert.equal(
              hub.qualification,
              "NOT_EXERCISED_UNAVAILABLE_HUB_ENTRYPOINT",
            );
            return [
              createState("completed", ["desktop"], { area: "contributions" }),
              ...states,
            ];
          },
          configurePage: (page) => configureGiftPage(page, setupEvents),
        }),
        /Hub correction entrypoint: NOT_EXERCISED/,
      );
      const saved = JSON.parse(
        fs.readFileSync(path.join(directory, fileName), "utf8"),
      );
      assert.deepEqual(
        runner === "capture"
          ? Object.keys(saved)
          : saved.map((entry) => entry.state),
        ["completed"],
      );
      assert.deepEqual(
        events
          .filter((event) => event.stage === "measurement")
          .map((event) => event.route),
        ["/completed"],
      );
      assert(!setupEvents.flat().some((event) => event.action === "click"));
      assert(events.some((event) => event.stage === "browser close"));
    });
  }

  for (const failure of [
    "gift membership",
    "ineffective menu",
    "wrong correction form",
  ]) {
    test(`${runner} retains completed pairs when the bound ${failure} setup fails`, async (context) => {
      const directory = outputDirectory(context);
      const fixtures = giftFixture();
      const events = [];
      const setupEvents = [];
      const name =
        failure === "gift membership"
          ? "crm-gift-row-menu"
          : "crm-fund-correction";
      if (failure === "gift membership") {
        fixtures.details[
          "GET /api/admin/crm/records/:recordId"
        ].margaret.donor.id = "someone-else";
      }
      await assert.rejects(
        runHarness(runner, directory, [], {
          args: ["crm", `completed,${name}`],
          fixtures,
          events,
          createStates: (meta, bundle) => [
            createState("completed"),
            ...createWorkspaceStates(meta, bundle),
          ],
          configurePage: (page) =>
            configureGiftPage(page, setupEvents, {
              noEffects: failure === "ineffective menu",
              wrongForm: failure === "wrong correction form",
            }),
        }),
        new RegExp(`${name}: setup unqualified \\(${name}@desktop\\)`),
      );
      const saved = JSON.parse(
        fs.readFileSync(path.join(directory, fileName), "utf8"),
      );
      assert.deepEqual(
        runner === "capture"
          ? Object.keys(saved)
          : saved.map((entry) => entry.state),
        ["completed"],
      );
      assert.deepEqual(
        events
          .filter((event) => event.stage === "measurement")
          .map((event) => event.route),
        ["/completed"],
      );
      assert.equal(
        events.filter((event) => event.stage === "screenshot").length,
        runner === "capture" ? 1 : 0,
      );
      assert.equal(
        events.filter((event) => event.stage === "axe").length,
        runner === "check" ? 1 : 0,
      );
      assert(
        !setupEvents
          .flat()
          .some((event) => event.target === "Submit correction"),
      );
      assert(events.some((event) => event.stage === "browser close"));
    });
  }

  for (const [states, reason] of [
    [[], /Empty catalogue/],
    [
      [createState("duplicate"), createState("duplicate")],
      /Duplicate state: duplicate/,
    ],
  ]) {
    test(`${runner} rejects invalid catalogue ${reason.source} before launch or output writes`, async (context) => {
      const directory = outputDirectory(context);
      const events = [];
      await assert.rejects(
        runHarness(runner, directory, states, { args: ["crm"], events }),
        reason,
      );
      assert(!events.some((event) => event.stage === "launch"));
      assert.deepEqual(fs.readdirSync(directory), []);
    });
  }

  test(`${runner} preserves existing evidence and proof when CLI validation fails`, async (context) => {
    const directory = outputDirectory(context);
    const previous = new Map([
      [fileName, "existing evidence must not be read or replaced"],
      ["fixture-proof.json", "previous proof must not be replaced"],
    ]);
    for (const [name, contents] of previous)
      fs.writeFileSync(path.join(directory, name), contents);
    const events = [];
    await assert.rejects(
      runHarness(runner, directory, [createState("selected")], {
        args: ["crm", "selected,unknown"],
        events,
      }),
      /Unknown or retired state: unknown/,
    );
    assert(!events.some((event) => event.stage === "launch"));
    assert.deepEqual(
      fs.readdirSync(directory).sort(),
      [...previous.keys()].sort(),
    );
    for (const [name, contents] of previous)
      assert.equal(
        fs.readFileSync(path.join(directory, name), "utf8"),
        contents,
      );
  });

  for (const [args, reason] of [
    [[""], /Empty area selection/],
    [["  "], /Empty area selection/],
    [["crm,"], /Empty area selection/],
    [["crm, crm"], /Duplicate area selection/],
    [["crm,unknown"], /Unknown or retired area: unknown/],
    [["crm", ""], /Empty state selection/],
    [["crm", "  "], /Empty state selection/],
    [["crm", "selected,"], /Empty state selection/],
    [["crm", "selected, selected"], /Duplicate state selection/],
    [["crm", "selected,unknown"], /Unknown or retired state: unknown/],
    [
      ["crm", "admin-team-create"],
      /Unknown or retired state: admin-team-create/,
    ],
    [["crm", "other-area"], /Named state is outside selected areas/],
    [["crm", "selected,other-area"], /Named state is outside selected areas/],
  ]) {
    test(`${runner} rejects invalid CLI selection ${JSON.stringify(args)} before launch or output writes`, async (context) => {
      const directory = outputDirectory(context);
      const events = [];
      await assert.rejects(
        runHarness(
          runner,
          directory,
          [
            createState("selected"),
            createState("other-area", ["desktop"], { area: "contributions" }),
          ],
          { args, events },
        ),
        reason,
      );
      assert(!events.some((event) => event.stage === "launch"));
      assert.deepEqual(fs.readdirSync(directory), []);
    });
  }

  test(`${runner} keeps comma-separated area/state batches and previously measured pairs`, async (context) => {
    const directory = outputDirectory(context);
    const file = path.join(directory, fileName);
    const retained = {
      path: "/previous-mobile",
      unexpectedRouteErrorHeadings: [],
    };
    fs.writeFileSync(
      file,
      JSON.stringify(
        runner === "capture"
          ? {
              selected: { desktop: { path: "/outdated" }, mobile: retained },
              untouched: { desktop: retained },
            }
          : [
              { state: "selected", viewport: "desktop", path: "/outdated" },
              { state: "selected", viewport: "mobile", ...retained },
              { state: "untouched", viewport: "desktop", ...retained },
            ],
      ),
    );
    const { events, exitCode } = await runHarness(
      runner,
      directory,
      [
        createState("selected"),
        createState("unselected"),
        createState("wrong-area", ["desktop"], { area: "contributions" }),
      ],
      {
        args: [" crm , tools ", " selected , module "],
        moduleStates: [
          createState("module", ["small-tablet"], { area: "tools" }),
        ],
      },
    );
    assert.equal(exitCode, 0);
    assert.deepEqual(
      events
        .filter((event) => event.stage === "measurement")
        .map((event) => [
          event.route,
          event.viewport.width,
          event.viewport.height,
        ]),
      [
        ["/selected", 1440, 1000],
        ["/module", 640, 900],
      ],
    );
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    const pairs =
      runner === "capture"
        ? Object.entries(saved).flatMap(([state, widths]) =>
            Object.entries(widths).map(([viewport, result]) => ({
              state,
              viewport,
              ...result,
            })),
          )
        : saved;
    assert.deepEqual(
      pairs.map((result) => `${result.state}@${result.viewport}`).sort(),
      [
        "module@small-tablet",
        "selected@desktop",
        "selected@mobile",
        "untouched@desktop",
      ],
    );
    assert.equal(
      pairs.find(
        (result) =>
          result.state === "selected" && result.viewport === "desktop",
      ).path,
      "/selected",
    );
    assert.equal(
      pairs.find(
        (result) => result.state === "selected" && result.viewport === "mobile",
      ).path,
      retained.path,
    );
  });

  test(`${runner} preserves the legacy default areas`, async (context) => {
    const directory = outputDirectory(context);
    const { events, exitCode } = await runHarness(
      runner,
      directory,
      ["crm", "contributions", "studio", "tools"].map((area) =>
        createState(`${area}-default`, ["desktop"], { area }),
      ),
    );
    assert.equal(exitCode, 0);
    assert.deepEqual(
      events
        .filter((event) => event.stage === "navigation")
        .map((event) => event.route),
      ["/crm-default", "/contributions-default", "/studio-default"],
    );
    assert.equal(events[0].stage, "preflight");
    assert.equal(events[1].stage, "launch");
    assert(!events.some((event) => event.stage === "optional catalogue"));
  });

  test(`${runner} stops before launch or evidence writes when mandatory preflight fails`, async (context) => {
    const directory = outputDirectory(context);
    const events = [];
    await assert.rejects(
      runHarness(runner, directory, [createState("first")], {
        events,
        operation(event) {
          if (event.stage === "preflight")
            throw new Error("fixture contract drift");
        },
      }),
      /fixture contract drift/,
    );
    assert.deepEqual(
      events.map((event) => event.stage),
      ["preflight"],
    );
    assert.deepEqual(fs.readdirSync(directory), []);
  });

  test(`${runner} does not publish an empty success record when the first navigation fails`, async (context) => {
    const directory = outputDirectory(context);
    await assert.rejects(
      runHarness(runner, directory, [createState("first")], {
        args: ["crm"],
        operation(event) {
          if (event.stage === "navigation")
            throw new Error("simulated initial timeout");
        },
      }),
      /simulated initial timeout/,
    );
    assert(!fs.existsSync(path.join(directory, fileName)));
  });

  test(`${runner} rejects malformed saved evidence rather than overwriting it`, async (context) => {
    const directory = outputDirectory(context);
    const file = path.join(directory, fileName);
    fs.writeFileSync(file, "{interrupted previous JSON");
    await assert.rejects(
      runHarness(runner, directory, [createState("first")], { args: ["crm"] }),
      { name: "SyntaxError" },
    );
    assert.equal(fs.readFileSync(file, "utf8"), "{interrupted previous JSON");
    assert(!fs.readdirSync(directory).some((name) => name.endsWith(".tmp")));
  });

  test(`${runner} records route errors, skips setup, and exits unsuccessfully`, async (context) => {
    const directory = outputDirectory(context);
    const { exitCode, logs } = await runHarness(
      runner,
      directory,
      [
        createState("crm-records", ["desktop"], {
          setup: () => assert.fail("route errors must skip setup"),
          settled: () => assert.fail("route errors must skip setup settling"),
        }),
      ],
      { args: ["crm"], routeErrors: ["This page couldn’t load"] },
    );
    assert.equal(exitCode, 1);
    assert(
      logs.some(
        (entry) =>
          entry.level === "error" &&
          entry.message.includes("unexpected route error"),
      ),
    );
    const saved = JSON.parse(
      fs.readFileSync(path.join(directory, fileName), "utf8"),
    );
    const result =
      runner === "capture" ? saved["crm-records"].desktop : saved[0];
    assert.deepEqual(result.unexpectedRouteErrorHeadings, [
      "This page couldn’t load",
    ]);
    if (runner === "check") assert.equal(result.keyboard, null);
  });

  for (const failure of ["write", "rename"]) {
    test(`${runner} preserves prior JSON and propagates ${failure} failures`, async (context) => {
      const directory = outputDirectory(context);
      const file = path.join(directory, fileName);
      const previous =
        runner === "capture"
          ? '{"retained":{"desktop":{"path":"/old"}}}'
          : '[{"state":"retained","viewport":"desktop","path":"/old"}]';
      fs.writeFileSync(file, previous);
      let staged = false;
      await assert.rejects(
        runHarness(runner, directory, [createState("first")], {
          args: ["crm"],
          fileSystem: {
            writeFileSync(target, value, settings) {
              if (target.endsWith(".tmp")) {
                staged = true;
                assert.equal(path.dirname(target), directory);
                assert.equal(settings.flag, "wx");
                assert.equal(settings.flush, true);
                assert.equal(fs.readFileSync(file, "utf8"), previous);
                fs.writeFileSync(target, value, settings);
                if (failure === "write")
                  throw new Error("simulated write failure");
              } else {
                fs.writeFileSync(target, value, settings);
              }
            },
            renameSync(source, target) {
              assert.equal(target, file);
              assert.doesNotThrow(() =>
                JSON.parse(fs.readFileSync(source, "utf8")),
              );
              throw new Error("simulated rename failure");
            },
          },
        }),
        new RegExp(`simulated ${failure} failure`),
      );
      assert(staged, "evidence must be staged and flushed before replacement");
      assert.equal(fs.readFileSync(file, "utf8"), previous);
      assert(!fs.readdirSync(directory).some((name) => name.endsWith(".tmp")));
    });
  }
}

test("checker retains axe incomplete IDs instead of treating them as a clean scan", async (context) => {
  const directory = outputDirectory(context);
  await runHarness("check", directory, [createState("first")], {
    args: ["crm"],
    axeIncomplete: [{ id: "color-contrast", nodes: [{}, {}] }],
  });
  const saved = JSON.parse(
    fs.readFileSync(path.join(directory, "workspace-checks.json"), "utf8"),
  );
  assert.deepEqual(saved[0].axe.incompleteIds, ["color-contrast:2"]);
});

for (const runner of ["capture", "check"]) {
  for (const failure of [
    "missing",
    "hidden",
    "disabled",
    "click-rejected",
    "wrong-panel",
    "readiness-timeout",
    "settled-timeout",
  ]) {
    test(`R02: ${runner} preserves prior evidence and rejects ${failure} without publishing the wrong state`, async (context) => {
      const directory = outputDirectory(context);
      const events = [];
      const name = failure === "settled-timeout" ? "pdf-studio" : "home-search";
      const real = createModuleStates().find((entry) => entry.name === name);
      const dialog = {
        role: "dialog",
        name:
          failure === "wrong-panel"
            ? "Other dialog"
            : "Mission Control navigation",
        visible: false,
        children: [{ role: "combobox", name: "Search Mission Control pages" }],
      };
      const trigger = {
        role: "button",
        name: "Open Mission Control search",
        visible: failure !== "hidden",
        disabled: failure === "disabled",
        onClick() {
          if (failure === "click-rejected") throw new Error("Click rejected");
          dialog.visible = true;
        },
      };
      const fake = setupPage(failure === "missing" ? [] : [trigger, dialog], {
        beforeWait() {
          if (failure === "readiness-timeout" || failure === "settled-timeout")
            throw new Error(`${failure}: deadline`);
        },
      });
      const failed = {
        ...real,
        area: "crm",
        route: "/unqualified",
        widths: ["desktop"],
      };
      await assert.rejects(
        runHarness(runner, directory, [createState("completed"), failed], {
          args: ["crm"],
          events,
          configurePage(page) {
            Object.assign(page, {
              getByRole: fake.getByRole,
              locator: fake.locator,
            });
          },
        }),
        new RegExp(`${name}: setup unqualified`),
      );
      const file =
        runner === "capture" ? "page-metrics.json" : "workspace-checks.json";
      const saved = JSON.parse(
        fs.readFileSync(path.join(directory, file), "utf8"),
      );
      assert.deepEqual(
        runner === "capture"
          ? Object.keys(saved)
          : saved.map((entry) => entry.state),
        ["completed"],
      );
      assert(
        !events.some(
          (event) =>
            event.route === "/unqualified" &&
            ["measurement", "screenshot", "full screenshot"].includes(
              event.stage,
            ),
        ),
      );
      assert.equal(
        events.filter((event) => event.stage === "axe").length,
        runner === "check" ? 1 : 0,
      );
      assert(events.some((event) => event.stage === "browser close"));
    });
  }

  test(`R05: ${runner} runs Care plan freshly at each original viewport before measurement`, async (context) => {
    const directory = outputDirectory(context);
    const events = [];
    const controls = [];
    const real = createModuleStates().find(
      (entry) => entry.name === "care-profile-plan",
    );
    const state = {
      ...real,
      area: "crm",
      route: "/care-plan",
      setup: async (page) => {
        const width = page.viewportSize().width;
        const panel = {
          role: "tabpanel",
          name: "Care plan",
          visible: false,
          children: [
            {
              text: "Goals and contact schedules the care team is working on.",
            },
            { label: "Add a goal" },
          ],
        };
        const tab = {
          role: "tab",
          name: "Care plan",
          visible: width >= 640,
          attrs: { "aria-selected": "false" },
          onClick() {
            tab.attrs["aria-selected"] = "true";
            panel.visible = true;
          },
        };
        const option = {
          role: "option",
          name: "Care plan",
          visible: false,
          onClick() {
            panel.visible = true;
          },
        };
        const combo = {
          role: "combobox",
          name: "Profile section",
          visible: width < 640,
          onClick() {
            option.visible = true;
          },
        };
        const fake = setupPage([tab, combo, option, panel], { width });
        await real.setup(fake);
        controls.push({
          width,
          actions: fake.events
            .filter((event) => event.action === "click")
            .map((event) => event.target),
        });
        events.push({
          stage: "state postcondition",
          viewport: page.viewportSize(),
        });
      },
    };
    await runHarness(runner, directory, [state], { args: ["crm"], events });
    assert.deepEqual(controls, [
      { width: 1440, actions: ["Care plan"] },
      { width: 390, actions: ["Profile section", "Care plan"] },
    ]);
    assert.equal(
      events.filter((event) => event.stage === "navigation").length,
      2,
    );
    for (const width of [1440, 390]) {
      const stages = events
        .filter((event) => event.viewport?.width === width)
        .map((event) => event.stage);
      assert(stages.indexOf("viewport") < stages.indexOf("navigation"));
      assert(
        stages.indexOf("navigation") < stages.indexOf("state postcondition"),
      );
      assert(
        stages.indexOf("state postcondition") < stages.indexOf("measurement"),
      );
    }
    if (runner === "capture") {
      assert.equal(
        events.filter((event) => event.stage === "screenshot").length,
        2,
      );
      assert.equal(
        events.filter((event) => event.stage === "full screenshot").length,
        2,
      );
    }
  });
}
