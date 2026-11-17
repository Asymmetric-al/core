import React from "react";
import { createRoot } from "react-dom/client";

import { SUPPORT_COMPOSER_USER } from "./support-composer-identity-stub";
// eslint-disable-next-line no-restricted-imports -- Browser fixture sends from the actual Support composer with a seeded agent.
import { ConversationComposer } from "../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer";
// eslint-disable-next-line no-restricted-imports -- The composer reports failed sends through this provider, as in the inbox.
import { SupportFailureRecoveryProvider } from "../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery";
// eslint-disable-next-line no-restricted-imports -- The cache is seeded under the keys the composer's hooks read.
import { supportHubQueryKeys } from "../../../apps/admin/features/support-hub/lib/query-keys";
import { Toaster } from "../../../packages/ui/components/shadcn/sonner";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

import type {
  SupportAssignee,
  SupportConversation,
} from "@asym/database/hooks";

import "virtual:base-ui-styles";

const STAMP = "2026-11-10T15:00:00.000Z";

// The signed-in user's agent record: the same email makes them the author.
const agent: SupportAssignee = {
  id: "agent-avery",
  name: SUPPORT_COMPOSER_USER.name,
  email: SUPPORT_COMPOSER_USER.email,
  avatarUrl: null,
  title: "Donor care",
};

const conversation = {
  id: "conversation-composer",
  tenantId: "00000000-0000-0000-0000-000000000001",
  inboxId: "inbox-care",
  subject: "Receipt for my March gift",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactEmail: "grace@example.test",
  externalContactName: "Grace Park",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: STAMP,
  lastMessageAt: STAMP,
  lastCustomerMessageAt: STAMP,
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 1,
  slaPolicyId: null,
  createdAt: STAMP,
  updatedAt: STAMP,
} as unknown as SupportConversation;

// What the composer's hooks read, seeded so the page makes no request until
// a send: the spec answers the requests from there on.
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
client.setQueryData(supportHubQueryKeys.agents, [agent]);
client.setQueryData(supportHubQueryKeys.cannedResponses, []);
client.setQueryData(
  supportHubQueryKeys.conversation(conversation.id),
  conversation,
);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <SupportFailureRecoveryProvider>
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
        <h1 className="text-xl font-semibold">Support composer</h1>
        <ConversationComposer conversation={conversation} />
      </main>
    </SupportFailureRecoveryProvider>
    <Toaster />
  </QueryClientProvider>,
);
