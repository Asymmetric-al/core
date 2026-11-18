import { AgentBridge } from "@asym/ui/components/primitives/agent-bridge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@asym/ui/components/shadcn/card";
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import { RootProviders } from "@payloadcms/ui";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { getRootLayoutData } from "@payloadcms/ui/layouts/Root/getRootLayoutData";
import { headers as nextHeaders } from "next/headers";
import Link from "next/link";
import { connection } from "next/server";
import {
  createPayloadRequest,
  executeAuthStrategies,
  getAccessResults,
  getLocalI18n,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from "payload";
import "@/src/styles/payloadStyles.css";

import { importMap } from "./web-studio/importMap";

import type { PayloadRequest, ServerFunctionClient } from "payload";

import {
  assertPayloadDatabaseConfiguration,
  PayloadDatabaseConfigurationError,
} from "@/src/cms/payload-database-config";
import { NextRouterAdapter } from "@/src/cms/payload-next-router-adapter";
import { requireWebStudioAccess } from "@/src/cms/web-studio-access";
import { webStudioServerFunctions } from "@/src/cms/web-studio-server-functions";
import { WEB_STUDIO_AGENT_PERMISSIONS } from "@/src/cms-ui/web-studio/agent-permissions";
import { WebStudioDocument } from "@/src/cms-ui/web-studio/shell/web-studio-document";

type Props = {
  children: React.ReactNode;
};

type PayloadConfig = Awaited<typeof config>;

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";

  try {
    return await handleServerFunctions({
      ...args,
      config,
      importMap,
      // form-state without document locks (council C3; document-locks.ts).
      serverFunctions: webStudioServerFunctions,
    });
  } catch (cause: unknown) {
    const name =
      typeof args === "object" &&
      args !== null &&
      "name" in args &&
      typeof (args as { name: unknown }).name === "string"
        ? (args as { name: string }).name
        : "unknown";

    // Payload UI catches server-function failures and does `console.error(_err)`.
    // A rejection with `undefined` surfaces as a useless "undefined" in the Next overlay.
    if (cause === undefined) {
      throw new Error(
        `[Payload] Server function "${name}" failed: rejection was undefined (often dev-only: streaming / Turbopack / aborted RSC). Check the dev server terminal for the underlying stack.`,
      );
    }

    throw cause;
  }
};

/**
 * Block: the Payload admin resolves auth, access rules and nav preferences
 * before it can render `children` at all, so there is nothing to lift into a
 * static shell — a boundary here would only produce an empty one.
 */
export const instant = false;

/** The shell can never hold segment data here, so don't spend a prefetch on it. */
export const prefetch = "force-disabled";

export default async function PayloadLayout({ children }: Props) {
  // Web Studio has no static shell; reach request time before rendering Payload.
  await connection();
  return (
    <>
      <PayloadEmbeddedLayout>{children}</PayloadEmbeddedLayout>
      {/* Web Studio renders outside Mission Control's shell, so it mounts
          its own agent bridge: one per document, granting only a move in the
          View menu's column order. */}
      <AgentBridge allow={WEB_STUDIO_AGENT_PERMISSIONS} />
    </>
  );
}

async function PayloadEmbeddedLayout({ children }: Props) {
  // `(payload)` deliberately stays outside `(app)`: Payload's import-map
  // generator only resolves `app/(payload)/<adminRoute>/`, so moving this group
  // breaks `generate:importmap`. That means the `(app)` layout's gate does not
  // cover these routes. Web Studio works in the organization its signed
  // cookie selects (plan 5.2): `proxy.ts` decides that before the page shell,
  // and this gate decides it again, from the person's live staff rows, and
  // gives the document the tenant and row it is rendered for.
  const gatePathname =
    (await nextHeaders()).get("x-asym-pathname") ?? "/web-studio";
  const access = await requireWebStudioAccess(gatePathname);

  try {
    assertPayloadDatabaseConfiguration();
  } catch (cause) {
    if (cause instanceof PayloadDatabaseConfigurationError) {
      console.error(cause);
      return <WebStudioDatabaseConfigurationError />;
    }

    throw cause;
  }

  const headerStore = await nextHeaders();
  const parsedCookies = parseCookies(headerStore);
  const payload = await getPayload({
    config,
    cron: true,
    importMap,
  });
  const languageCode = getRequestLanguage({
    config: payload.config,
    cookies: parsedCookies,
    headers: headerStore,
  });
  const i18n = await getLocalI18n({
    config: payload.config,
    language: languageCode,
  });
  const { responseHeaders, user } = await executeAuthStrategies({
    headers: headerStore,
    payload,
  });
  const req = await createPayloadRequest({
    payload,
    req: {
      headers: headerStore,
      host: headerStore.get("host") ?? undefined,
      i18n,
      responseHeaders,
      user,
    },
  });
  const permissions = await getAccessResults({ req });
  const data = await getRootLayoutData({
    cookies: parsedCookies,
    importMap,
    permissions,
    req,
    user: req.user,
  });

  return (
    <RootProviders
      RouterAdapter={NextRouterAdapter}
      data={data}
      serverFunction={serverFunction}
    >
      {/* eslint-disable-next-line shadcn/no-inline-styles -- TODO(integrate-design-system-lint): Payload requires this CSS layer order before its providers render. */}
      <style>@layer payload-default, payload;</style>
      <WebStudioDocument
        scope={access.scope}
        organization={access.organization}
      >
        {renderPayloadProviders({
          children,
          permissions,
          req,
        })}
      </WebStudioDocument>
    </RootProviders>
  );
}

function WebStudioDatabaseConfigurationError() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            Web Studio
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Web Studio can’t open right now
          </h1>
          <CardDescription>
            Web Studio needs a setup change before it can open. Ask your
            administrator to check the setup, then try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link className={buttonVariants()} href="/web-studio">
            Try again
          </Link>
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Back to Mission Control
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function renderPayloadProviders({
  children,
  permissions,
  req,
}: {
  children: React.ReactNode;
  permissions: Awaited<ReturnType<typeof getAccessResults>>;
  req: PayloadRequest;
}) {
  const providers = req.payload.config.admin.components?.providers;
  if (!Array.isArray(providers) || providers.length === 0) {
    return children;
  }

  return renderNestedPayloadProviders({
    children,
    permissions,
    providers,
    req,
  });
}

function renderNestedPayloadProviders({
  children,
  permissions,
  providers,
  req,
}: {
  children: React.ReactNode;
  permissions: Awaited<ReturnType<typeof getAccessResults>>;
  providers: NonNullable<PayloadConfig["admin"]["components"]>["providers"];
  req: PayloadRequest;
}): React.ReactNode {
  if (!providers?.length) {
    return children;
  }

  return RenderServerComponent({
    clientProps: {
      children:
        providers.length > 1
          ? renderNestedPayloadProviders({
              children,
              permissions,
              providers: providers.slice(1),
              req,
            })
          : children,
    },
    Component: providers[0],
    importMap,
    serverProps: {
      i18n: req.i18n,
      payload: req.payload,
      permissions,
      user: req.user,
    },
  });
}
