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
        ? [
            {
              id: "fixture-assistant-message",
              role: "assistant",
              parts: [
                {
                  type: "text",
                  text: "Fixture assistant transcript remains readable.",
                },
              ],
            },
          ]
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
