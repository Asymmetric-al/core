import { RetainedDraftProvider } from "@asym/ui/hooks";
import { render, renderHook } from "@testing-library/react";
import { Fragment } from "react";

import type { RenderHookOptions, RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export const draftTestOwner = {
  userId: "test-user",
  tenantId: "test-tenant",
  contextId: "test-profile",
};

export function DraftTestProvider({ children }: { children: ReactNode }) {
  return (
    <RetainedDraftProvider owner={draftTestOwner}>
      {children}
    </RetainedDraftProvider>
  );
}

export function renderWithDrafts(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { ...options, wrapper: DraftTestProvider });
}

export function renderDraftHook<Result, Props>(
  callback: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
) {
  const Wrapper = options?.wrapper ?? Fragment;
  return renderHook(callback, {
    ...options,
    wrapper: ({ children }) => (
      <DraftTestProvider>
        <Wrapper>{children}</Wrapper>
      </DraftTestProvider>
    ),
  });
}
