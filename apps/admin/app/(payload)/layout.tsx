import config from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import "@/src/styles/payloadStyles.css";

import { importMap } from "./web-studio/importMap";

import type { ServerFunctionClient } from "payload";

type Props = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";

  try {
    return await handleServerFunctions({
      ...args,
      config,
      importMap,
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

export default function PayloadLayout({ children }: Props) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
