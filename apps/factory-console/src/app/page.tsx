import { connection } from "next/server";
import { Suspense } from "react";

import { Console } from "../components/console";
import { consoleScope } from "../lib/contracts";
import { configuration } from "../server/security";

async function ScopedConsole() {
  await connection();
  const config = configuration();
  const scope = consoleScope({
    instance: config.storeId,
    operator: config.owner,
    codebase: config.codebaseId,
  });
  return <Console key={scope} scope={scope} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={<p role="status">Loading the private owner Console…</p>}
    >
      <ScopedConsole />
    </Suspense>
  );
}
