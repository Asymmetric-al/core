"use client";

import {
  DocumentScopeProvider,
  type DocumentScope,
} from "@asym/database/document-scope";

import { PathSegmentBoundary } from "./tenant-navigation";

import type { ReactNode } from "react";

const DONOR_PORTAL_PATH = "/donor-dashboard";

export function PortalSegmentBoundary({ children }: { children: ReactNode }) {
  return (
    <PathSegmentBoundary segment={DONOR_PORTAL_PATH}>
      {children}
    </PathSegmentBoundary>
  );
}

export function PortalDocument({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  return (
    <DocumentScopeProvider scope={scope} segment={DONOR_PORTAL_PATH}>
      <span
        hidden
        data-tenant-scope={scope.tenantId}
        data-tenant-assignment={scope.assignmentId}
      />
      {children}
    </DocumentScopeProvider>
  );
}
