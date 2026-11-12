"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";

export default function ConsoleError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Console view unavailable</h1>
      <p role="alert">
        No control outcome or delivery conclusion is confirmed by this page.
        Reload, then read the factory state again before acting. Controls are
        never resent automatically.
      </p>
      <div>
        <Button variant="outline" onClick={reset}>
          Reload Console view
        </Button>
      </div>
    </main>
  );
}
