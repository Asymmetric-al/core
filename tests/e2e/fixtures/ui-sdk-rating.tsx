import { Rating } from "@asym/ui/components/primitives/rating";
import { Button } from "@asym/ui/components/shadcn/button";
import React, { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";

declare global {
  interface Window {
    __recoverableErrors?: string[];
  }
}

// Imports the shared wrapper exactly as a dashboard does. The spec renders this
// on the server first, then hydrates that HTML in a real browser.
export function App() {
  const [score, setScore] = useState<number | null>(3);
  const [submitted, setSubmitted] = useState("none");

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 bg-background p-6 text-foreground">
      <Button type="button" variant="outline">
        Before rating
      </Button>
      <form
        aria-label="Visit feedback"
        className="flex flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(
            String(new FormData(event.currentTarget).get("visit") ?? "none"),
          );
        }}
      >
        <p id="visit-label" className="text-sm font-medium">
          How was the visit?
        </p>
        <Rating
          aria-labelledby="visit-label"
          name="visit"
          defaultValue={3}
          onValueChange={(value) => setScore(value)}
        />
        <output aria-label="Current score">{score ?? "none"}</output>
        <Button type="submit">Send rating</Button>
      </form>
      <output aria-label="Submitted score">{submitted}</output>
      <span data-testid="warning-reference" className="text-warning">
        Filled star token
      </span>
      <span data-testid="muted-reference" className="text-muted-foreground">
        Empty star token
      </span>
    </main>
  );
}

if (typeof document !== "undefined") {
  hydrateRoot(document.getElementById("root")!, <App />, {
    onRecoverableError: (error) => {
      (window.__recoverableErrors ??= []).push(String(error));
    },
  });
}
