// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RenderServerComponent } from "../../../../apps/admin/node_modules/@payloadcms/ui/dist/elements/RenderServerComponent/index.js";

import type { ComponentType, ReactNode } from "react";

/*
 * `/web-studio/account` renders the configured `views.account` component
 * twice: once as the whole route view (no `doc`), and again from inside
 * Payload's AccountView as its edit form (with `doc`), where Payload's
 * document context exists. Rendering Payload's form outside that context
 * crashed the route in round 12 while a component-only test passed, so these
 * tests go through Payload's own RenderServerComponent and import map entry.
 */

const root = process.cwd();
const adminDir = path.join(root, "apps/admin");
const payloadUiDir = path.join(adminDir, "node_modules/@payloadcms/ui/dist");

const payloadConfigSource = readFileSync(
  path.join(adminDir, "payload.config.ts"),
  "utf8",
);
const accountComponentPath = payloadConfigSource.match(
  /account:\s*{\s*Component:\s*"([^"]+)"/,
)?.[1];

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => {
    const React = await import("react");
    const actual =
      await importOriginal<
        typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
      >();
    const DocumentInfoContext = React.createContext<{
      docConfig: { fields: unknown[] };
    } | null>(null);
    function DefaultEditView() {
      // Payload's form reads the collection config from DocumentInfoProvider;
      // outside it this is the TypeError the round 12 route threw.
      const info = React.useContext(DocumentInfoContext);
      return (
        <main>
          <form data-testid="account-form">
            {info!.docConfig.fields.length} account fields
          </form>
        </main>
      );
    }
    return { ...actual, DefaultEditView, DocumentInfoContext };
  },
);

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/views/Account/index.js",
  async () => {
    const client =
      (await import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")) as unknown as {
        DefaultEditView: ComponentType;
        DocumentInfoContext: React.Context<{
          docConfig: { fields: unknown[] };
        } | null>;
      };
    // The shape of Payload's AccountView (dist/views/Account/index.js): a
    // document provider, Payload's document header, then the configured
    // account component as the edit form with `doc` in its server props.
    function AccountView(props: {
      initPageResult: {
        req: {
          payload: {
            config: {
              admin: {
                components: { views: { account: { Component: string } } };
              };
            };
            importMap: Record<string, unknown>;
          };
        };
      };
      user: { email: string };
    }) {
      const { payload } = props.initPageResult.req;
      return (
        <client.DocumentInfoContext.Provider
          value={{ docConfig: { fields: ["email", "role"] } }}
        >
          <h1 className="doc-header__title">{props.user.email}</h1>
          {
            RenderServerComponent({
              Component:
                payload.config.admin.components.views.account.Component,
              Fallback: client.DefaultEditView,
              importMap: payload.importMap as never,
              serverProps: {
                ...props,
                doc: { email: props.user.email },
                hasPublishedDoc: false,
                routeSegments: [],
              },
            }) as ReactNode
          }
        </client.DocumentInfoContext.Provider>
      );
    }
    return { AccountView };
  },
);

vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar",
  () => ({ StudioTopBar: () => <header>Studio header</header> }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail",
  () => ({ StudioNavRail: () => <nav /> }),
);

afterEach(cleanup);

async function renderAccountRoute() {
  if (!accountComponentPath) throw new Error("No account view configured");
  const [file, exportName] = accountComponentPath.split("#");
  const module = (await import(
    /* @vite-ignore */ path.join(adminDir, file!)
  )) as Record<string, ComponentType>;
  const importMap = { [accountComponentPath]: module[exportName!] };
  const initPageResult = {
    req: {
      payload: {
        config: {
          admin: {
            components: {
              views: { account: { Component: accountComponentPath } },
            },
          },
        },
        importMap,
      },
    },
  };
  // What Payload's Root view passes a custom one-segment view: client props
  // plus server props, and no `doc`.
  const view = RenderServerComponent({
    clientProps: { viewType: "account" },
    Component: accountComponentPath,
    importMap: importMap as never,
    serverProps: {
      initPageResult,
      params: { segments: ["account"] },
      searchParams: {},
      user: { email: "staff@example.org" },
    },
  }) as ReactNode;
  return render(<>{view}</>);
}

describe("Web Studio account route", () => {
  it("registers a server view, so Payload passes it the page data", () => {
    expect(accountComponentPath).toBe(
      "/src/cms-ui/web-studio/shell/studio-account-view.tsx#StudioAccountView",
    );
    const source = readFileSync(
      path.join(
        adminDir,
        "src/cms-ui/web-studio/shell/studio-account-view.tsx",
      ),
      "utf8",
    );
    expect(source).not.toMatch(/^["']use client["']/m);
  });

  it("renders Payload's account form inside the Studio shell", async () => {
    await renderAccountRoute();

    expect(
      screen.getByRole("heading", { name: "Account", level: 1 }),
    ).toBeTruthy();
    expect(
      screen.getByText("Your sign-in details and Web Studio preferences."),
    ).toBeTruthy();
    expect(screen.getByTestId("account-form").textContent).toBe(
      "2 account fields",
    );
    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(document.querySelectorAll("[data-web-studio-shell]")).toHaveLength(
      1,
    );
    // Payload's own header (the email) is hidden by payloadStyles.css under
    // the native-document marker, leaving one page title.
    expect(
      document
        .querySelector(".doc-header__title")
        ?.closest("[data-web-studio-native-document]"),
    ).toBeTruthy();
  });

  it("still matches how the installed Payload renders the account form", () => {
    const accountView = readFileSync(
      path.join(payloadUiDir, "views/Account/index.js"),
      "utf8",
    );
    expect(accountView).toMatch(
      /Component: config\.admin\?\.components\?\.views\?\.account\?\.Component,\s*Fallback: DefaultEditView/,
    );
    expect(accountView).toMatch(/serverProps: {\s*doc: data,/);
  });
});

it("keeps the main landmark for ordinary Studio pages", async () => {
  const { StudioLayout } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout");
  render(
    <StudioLayout>
      <p>Studio work</p>
    </StudioLayout>,
  );
  expect(screen.getByRole("main").textContent).toContain("Studio work");
});
