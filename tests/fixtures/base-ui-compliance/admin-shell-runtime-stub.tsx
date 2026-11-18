import React from "react";

export function useQuery() {
  return { data: [], isPending: false, isError: false };
}

export function usePathname() {
  return "/web-studio/missionaries";
}

export function useSearchParams() {
  return new URLSearchParams(location.search);
}

export function useRouter() {
  return { push: (href: string) => location.assign(href) };
}

export function useMC() {
  return {
    role: "admin",
    user: { id: "fixture-admin" },
    tenant: { id: "fixture-tenant", name: "Fixture", slug: "fixture" },
  };
}

type EveFixtureStatus = "ready" | "submitted" | "streaming";

type EveFixtureMessage = {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
};

type EveFixtureControl = {
  /** Moves the turn in flight to its next status: submitted, streaming, ready. */
  advance: () => void;
};

declare global {
  interface Window {
    eveFixture?: EveFixtureControl;
  }
}

const EVE_FIXTURE_PARTIAL_REPLY = "Fixture reply is streaming";
const EVE_FIXTURE_FINAL_REPLY =
  "Fixture reply is streaming. Fixture reply finished.";

// A sent turn moves like eve's store (ready, submitted, streaming, ready), but
// each step waits for the spec, so a check can observe every status in turn.
const pendingSteps: (() => void)[] = [];
let queuedSteps = 0;

function nextStep() {
  if (queuedSteps > 0) {
    queuedSteps -= 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => pendingSteps.push(resolve));
}

window.eveFixture = {
  advance: () => {
    const step = pendingSteps.shift();
    if (step) step();
    else queuedSteps += 1;
  },
};

function textMessage(
  id: string,
  role: EveFixtureMessage["role"],
  text: string,
): EveFixtureMessage {
  return { id, role, parts: [{ type: "text", text }] };
}

export function useEveAgent() {
  const [turn, setTurn] = React.useState<{
    status: EveFixtureStatus;
    messages: EveFixtureMessage[];
  }>(() => {
    const parameters = new URLSearchParams(location.search);
    return {
      status: parameters.has("busy") ? "streaming" : "ready",
      messages: parameters.has("messages")
        ? Array.from({ length: 12 }, (_, index) =>
            textMessage(
              "fixture-assistant-message-" + index,
              "assistant",
              index === 0
                ? "Fixture assistant transcript remains readable."
                : "Fixture assistant reply " + (index + 1) + ".",
            ),
          )
        : [],
    };
  });
  const inFlight = React.useRef(false);
  const turnCount = React.useRef(0);

  const send = React.useCallback(async ({ message }: { message?: string }) => {
    // Like eve, reject a second turn while one is in flight.
    if (inFlight.current) throw new Error("A turn is already in flight.");
    inFlight.current = true;
    turnCount.current += 1;
    const userId = "fixture-user-" + turnCount.current;
    const replyId = "fixture-reply-" + turnCount.current;
    setTurn((current) => ({
      status: "submitted",
      messages: [
        ...current.messages,
        textMessage(userId, "user", message ?? ""),
      ],
    }));
    await nextStep();
    setTurn((current) => ({
      status: "streaming",
      messages: [
        ...current.messages,
        textMessage(replyId, "assistant", EVE_FIXTURE_PARTIAL_REPLY),
      ],
    }));
    await nextStep();
    setTurn((current) => ({
      status: "ready",
      messages: current.messages.map((item) =>
        item.id === replyId
          ? textMessage(replyId, "assistant", EVE_FIXTURE_FINAL_REPLY)
          : item,
      ),
    }));
    inFlight.current = false;
  }, []);

  return {
    status: turn.status,
    data: { messages: turn.messages },
    send,
    reset: () => {},
    stop: () => {},
  };
}

export function useAuth() {
  return { user: { email: "fixture@example.test" } };
}

const payloadConfig = {
  config: {
    serverURL: "",
    routes: { admin: "/admin", api: "/api" },
    admin: { routes: { account: "/account", logout: "/logout" } },
  },
};

export function useConfig() {
  return payloadConfig;
}

export const toast = {
  success: () => {},
  error: () => {},
  info: () => {},
};

const preferences = {
  getPreference: async () => undefined,
  setPreference: async () => {},
};

export function usePreferences() {
  return preferences;
}

export function Link(props: React.ComponentProps<"a">) {
  return <a {...props} />;
}
