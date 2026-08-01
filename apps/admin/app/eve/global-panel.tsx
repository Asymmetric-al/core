"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { Button } from "@asym/ui/components/shadcn/button";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useEveAgent } from "eve/react";
import { Bot, RotateCcw, Send, Sparkles, Square } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

import { buildEvePageContext, prepareEveSend } from "./page-context";

const MAX_MESSAGE_LENGTH = 2_000;

function EveConversation() {
  const pathname = usePathname();
  const { tenant } = useMC();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const pageContext = buildEvePageContext({
    panelOpen: open,
    pathname,
    tenant,
  });
  const agent = useEveAgent({
    prepareSend: prepareEveSend(pageContext),
  });
  const busy = agent.status === "streaming" || agent.status === "submitted";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage || busy) {
      return;
    }

    setMessage("");
    try {
      await agent.send({ message: nextMessage });
    } catch {
      // The hook owns the fail-closed error state. Do not surface internal
      // runtime or authorization details in the global panel.
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            className="fixed right-5 bottom-20 z-40 size-12 rounded-full shadow-lg"
            size="icon"
            aria-label="Open Eve assistant"
            data-testid="eve-global-trigger"
          >
            <Sparkles aria-hidden="true" className="size-5" />
          </Button>
        }
      />
      <SheetContent
        aria-describedby="eve-global-description"
        className="w-full gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot aria-hidden="true" className="size-5" />
            Eve
          </SheetTitle>
          <SheetDescription id="eve-global-description">
            Governed assistance for {pageContext.pageIdentity}. Eve receives
            only this page category and your selected organization—not records,
            payment details, table rows, or form values.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div
            className="flex min-h-full flex-col gap-3 py-4"
            aria-live="polite"
            aria-busy={busy}
          >
            {agent.data.messages.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Ask for help understanding this screen or planning your next
                governed action. Eve cannot execute tools from this panel yet.
              </div>
            ) : null}
            {agent.data.messages.map((item) => {
              const text = item.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");
              if (!text) {
                return null;
              }

              return (
                <article
                  key={item.id}
                  className={
                    item.role === "user"
                      ? "ml-8 rounded-lg bg-primary p-3 text-sm text-primary-foreground"
                      : "mr-8 rounded-lg bg-muted p-3 text-sm text-foreground"
                  }
                >
                  <span className="sr-only">
                    {item.role === "user" ? "You" : "Eve"}:
                  </span>
                  <p className="whitespace-pre-wrap">{text}</p>
                </article>
              );
            })}
            {agent.status === "error" ? (
              <p role="alert" className="text-sm text-destructive">
                Eve could not complete that request. The runtime failed closed;
                try again or contact an administrator.
              </p>
            ) : null}
          </div>
        </ScrollArea>

        <form className="border-t p-4" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="eve-global-message">
            Message Eve
          </label>
          <Textarea
            id="eve-global-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={3}
            disabled={busy}
            placeholder="Ask Eve about this page…"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {message.length.toLocaleString()} /{" "}
              {MAX_MESSAGE_LENGTH.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={agent.reset}
                disabled={busy}
                aria-label="Start a new Eve session"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
              </Button>
              {busy ? (
                <Button type="button" variant="outline" onClick={agent.stop}>
                  <Square aria-hidden="true" className="size-4" />
                  Detach
                </Button>
              ) : (
                <Button type="submit" disabled={!message.trim()}>
                  <Send aria-hidden="true" className="size-4" />
                  Send
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function EveGlobalPanel() {
  const { role, user } = useMC();

  // MCProvider keeps role at "admin" after sign-out while clearing user.
  // Require both so the panel is absent outside authenticated admin contexts.
  if (!user || role !== "admin") {
    return null;
  }

  return <EveConversation />;
}
