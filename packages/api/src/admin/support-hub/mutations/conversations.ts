import { supportHubAdapter } from "../adapter";
import {
  addPrivateNoteSchema,
  assignConversationSchema,
  sendReplySchema,
  setConversationPrioritySchema,
  setConversationStatusSchema,
  snoozeConversationSchema,
  toggleConversationLabelSchema,
  unsnoozeConversationSchema,
} from "../schemas";

import type {
  AddPrivateNoteInput,
  AssignConversationInput,
  SendReplyInput,
  SetConversationPriorityInput,
  SetConversationStatusInput,
  SnoozeConversationInput,
  ToggleConversationLabelInput,
  UnsnoozeConversationInput,
} from "../adapter";

/**
 * Conversation-side mutations. Each entry parses the input schema (so the
 * route handler can rely on a typed payload), then delegates to the
 * adapter. Reply + private-note are isolated in the messages adapter
 * surface; everything else lives on the conversation surface.
 */

export async function assignSupportConversation(
  input: AssignConversationInput,
) {
  const parsed = assignConversationSchema.parse(input);
  return supportHubAdapter.conversations.assign(parsed);
}

export async function setSupportConversationStatus(
  input: SetConversationStatusInput,
) {
  const parsed = setConversationStatusSchema.parse(input);
  return supportHubAdapter.conversations.setStatus(parsed);
}

export async function setSupportConversationPriority(
  input: SetConversationPriorityInput,
) {
  const parsed = setConversationPrioritySchema.parse(input);
  return supportHubAdapter.conversations.setPriority(parsed);
}

export async function snoozeSupportConversation(
  input: SnoozeConversationInput,
) {
  const parsed = snoozeConversationSchema.parse(input);
  return supportHubAdapter.conversations.snooze(parsed);
}

export async function unsnoozeSupportConversation(
  input: UnsnoozeConversationInput,
) {
  const parsed = unsnoozeConversationSchema.parse(input);
  return supportHubAdapter.conversations.unsnooze(parsed);
}

export async function toggleSupportConversationLabel(
  input: ToggleConversationLabelInput,
) {
  const parsed = toggleConversationLabelSchema.parse(input);
  return supportHubAdapter.conversations.toggleLabel(parsed);
}

export async function sendSupportReply(input: SendReplyInput) {
  const parsed = sendReplySchema.parse(input);
  return supportHubAdapter.messages.sendReply(parsed);
}

export async function addSupportPrivateNote(input: AddPrivateNoteInput) {
  const parsed = addPrivateNoteSchema.parse(input);
  return supportHubAdapter.messages.addPrivateNote(parsed);
}
