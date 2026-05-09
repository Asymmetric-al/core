export const supportHubRoutes = {
  home: "/support",
  tickets: "/support/tickets",
  newTicket: "/support/tickets/new",
  contacts: "/support/contacts",
  macros: "/support/macros",
  knowledge: "/support/knowledge",
  ticket: (id: string) => `/support/tickets/${encodeURIComponent(id)}`,
} as const;
