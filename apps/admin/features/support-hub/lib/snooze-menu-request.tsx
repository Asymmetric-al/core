"use client";
import * as React from "react";
interface SnoozeMenuRequest {
  requestedId: string | null;
  request: (id: string) => void;
  clear: () => void;
}
const Context = React.createContext<SnoozeMenuRequest | null>(null);
export function SupportSnoozeMenuRequestProvider({
  children,
  selectedConversationId,
}: {
  children: React.ReactNode;
  selectedConversationId: string | null;
}) {
  const [requestState, setRequestState] = React.useState<{
    selection: string | null;
    requestedId: string | null;
  }>({ selection: selectedConversationId, requestedId: null });
  if (requestState.selection !== selectedConversationId)
    setRequestState({ selection: selectedConversationId, requestedId: null });
  const value: SnoozeMenuRequest = {
    requestedId:
      requestState.selection === selectedConversationId
        ? requestState.requestedId
        : null,
    request: (id) =>
      setRequestState({ selection: selectedConversationId, requestedId: id }),
    clear: () =>
      setRequestState({ selection: selectedConversationId, requestedId: null }),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSupportSnoozeMenuRequest() {
  return React.useContext(Context);
}
