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

export function useEveAgent() {
  const parameters = new URLSearchParams(location.search);
  return {
    status: parameters.has("busy") ? "streaming" : "idle",
    data: {
      messages: parameters.has("messages")
        ? Array.from({ length: 12 }, (_, index) => ({
            id: "fixture-assistant-message-" + index,
            role: "assistant",
            parts: [
              {
                type: "text",
                text:
                  index === 0
                    ? "Fixture assistant transcript remains readable."
                    : "Fixture assistant reply " + (index + 1) + ".",
              },
            ],
          }))
        : [],
    },
    send: async () => {},
    reset: () => {},
    stop: () => {},
  };
}

export function useAuth() {
  return { user: { email: "fixture@example.test" } };
}

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
