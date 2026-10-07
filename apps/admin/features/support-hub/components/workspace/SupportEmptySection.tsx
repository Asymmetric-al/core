"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import * as React from "react";

interface SupportEmptySectionProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Quiet empty state used across the settings + reports surfaces. Relies on
 * tokens + borders (no loud colors) to stay on-brand with the Maia language.
 */
export function SupportEmptySection({
  icon,
  title,
  description,
  action,
  className,
}: SupportEmptySectionProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        {icon ? (
          <EmptyMedia variant="icon" aria-hidden="true">
            {icon}
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
