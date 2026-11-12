import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { DefaultEditView } from "@payloadcms/ui";
import { AccountView } from "@payloadcms/ui/views/Account";

import { StudioLayout } from "./studio-layout";
import "./studio-stock-views.css";

import type { AdminViewServerProps, DocumentViewClientProps } from "payload";
import type { ComponentType } from "react";

/*
 * Payload's AccountView renders its fallback form with no client props
 * (RenderServerComponent's `clientProps` default, `{}`); the form reads the
 * document from the provider AccountView sets up. Typed the way it is called.
 */
const AccountForm = DefaultEditView as ComponentType<
  Partial<DocumentViewClientProps>
>;

type StudioAccountViewProps = AdminViewServerProps & {
  /** Set only when Payload's AccountView renders this as its edit form. */
  doc?: unknown;
};

/**
 * Payload `admin.components.views.account`. Payload renders this component
 * twice on `/web-studio/account`: first as the whole route view, then again
 * from inside its own AccountView (with `doc`) as the account form. It has to
 * stay a server component so the route call receives the page data.
 *
 * The route call frames Payload's AccountView (data, permissions, document
 * context and the preferences section) in Studio chrome; the inner call keeps
 * Payload's stock form. Payload's own document header is hidden under
 * `data-web-studio-native-document` (payloadStyles.css), so "Account" is the
 * one page title.
 */
export function StudioAccountView(props: StudioAccountViewProps) {
  if (props.doc !== undefined) {
    return <AccountForm />;
  }

  return (
    <div data-web-studio-native-document="">
      <StudioLayout sectionLabel="Account" contentAs="div">
        <PageShell
          title="Account"
          description="Your sign-in details and Web Studio preferences."
          density="compact"
        >
          <div className="overflow-clip rounded-xl border bg-card shadow-sm">
            <AccountView {...props} />
          </div>
        </PageShell>
      </StudioLayout>
    </div>
  );
}
