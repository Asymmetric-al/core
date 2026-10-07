// Adapted from ReUI Pro settings-7/settings-card.tsx (base-maia).
// Commercial source permission and provenance: docs/guides/development/reui-source-license.md.
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

import type { ReactNode } from "react";

export interface SettingsCardProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <CardFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
