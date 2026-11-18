import { cloneElement, isValidElement } from "react";

import type { ReactElement, ReactNode } from "react";

/**
 * The missionary shell exactly as `apps/missionary/app/layout.tsx` composes
 * it (council round 1, A24): the layout's own `MissionaryLayoutShell`, with
 * its workspace slot replaced by what the layout's own gate renders for a
 * workspace page, `TenantDocument` around `MissionaryWorkspaceChrome` around
 * the page. A test that builds the slot by hand would pass even if the
 * layout stopped wiring in the chrome; this one fails.
 *
 * The gate is an async server component, so it is resolved once, before the
 * tests render. The test file mocks what it reads: `next/headers` (a
 * workspace address in `x-asym-pathname`), `@asym/auth/context`,
 * `@asym/auth/tenant-server` (the scope below), `@asym/ui/fonts` and
 * `@asym/database/supabase/config`.
 */

export const LAYOUT_TENANT = "00000000-0000-0000-0000-000000000001";
export const LAYOUT_PREFIX = `/${LAYOUT_TENANT}`;
export const LAYOUT_SCOPE = {
  userId: "00000000-0000-4000-8000-0000000e2e40",
  tenantId: LAYOUT_TENANT,
  assignmentId: "00000000-0000-4000-8000-0000000e2e41",
  addressPrefix: LAYOUT_PREFIX,
};

function nameOf(element: ReactElement): string | undefined {
  const type = element.type as { name?: string } | string;
  return typeof type === "function"
    ? (type as { name?: string }).name
    : undefined;
}

/** The first element in a tree whose component is called `name`. */
function findElement(node: unknown, name: string): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, name);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  if (nameOf(node) === name) return node;
  for (const value of Object.values(
    (node.props ?? {}) as Record<string, unknown>,
  )) {
    const found = findElement(value, name);
    if (found) return found;
  }
  return null;
}

function expectComposed<T>(value: T | null, what: string): T {
  if (!value) throw new Error(`app/layout.tsx no longer composes ${what}`);
  return value;
}

export async function shellFromLayout(): Promise<
  (children: ReactNode) => ReactElement
> {
  const { default: RootLayout } =
    await import("../../../../apps/missionary/app/layout");
  const page = <i data-layout-page />;
  const shell = expectComposed(
    findElement(RootLayout({ children: page }), "MissionaryLayoutShell"),
    "MissionaryLayoutShell",
  );
  const shellProps = shell.props as { children: unknown; workspace: unknown };
  if (shellProps.children !== page) {
    throw new Error("app/layout.tsx no longer hands the page to the shell");
  }
  const gate = expectComposed(
    findElement(shellProps.workspace, "MissionaryWorkspace"),
    "the workspace gate in the shell's workspace slot",
  );
  const rendered = await (
    gate.type as (props: unknown) => Promise<ReactElement>
  )(gate.props);
  if (nameOf(rendered) !== "TenantDocument") {
    throw new Error("the workspace gate no longer renders TenantDocument");
  }
  const chrome = expectComposed(
    findElement(
      (rendered.props as { children: unknown }).children,
      "MissionaryWorkspaceChrome",
    ),
    "MissionaryWorkspaceChrome inside the document scope",
  );
  if ((chrome.props as { children: unknown }).children !== page) {
    throw new Error("the workspace chrome no longer wraps the page");
  }
  return (children) =>
    cloneElement(
      shell,
      {
        workspace: cloneElement(
          rendered,
          {},
          cloneElement(chrome, {}, children),
        ),
      },
      children,
    );
}
