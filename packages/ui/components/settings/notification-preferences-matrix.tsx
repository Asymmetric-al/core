// Adapted from ReUI Pro settings-11/notification-preferences.tsx (base-maia).
// Commercial source permission and provenance: docs/guides/development/reui-source-license.md.
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";

import type { ReactNode } from "react";

export interface NotificationChannel {
  id: string;
  label: ReactNode;
}

export interface NotificationPreferenceRow {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  controls: readonly ReactNode[];
}

export interface NotificationPreferencesMatrixProps {
  channels: readonly NotificationChannel[];
  rows: readonly NotificationPreferenceRow[];
  caption?: ReactNode;
}

export function NotificationPreferencesMatrix({
  channels,
  rows,
  caption,
}: NotificationPreferencesMatrixProps) {
  return (
    <Table>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Notification</TableHead>
          {channels.map((channel) => (
            <TableHead key={channel.id} scope="col">
              <div className="text-center">{channel.label}</div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <th
              scope="row"
              className="px-2 py-3 text-left align-middle font-normal"
            >
              <div className="flex min-w-40 max-w-sm items-start gap-3 whitespace-normal">
                {row.icon ? <span className="shrink-0">{row.icon}</span> : null}
                <div className="min-w-0 space-y-1">
                  <div className="font-medium">{row.title}</div>
                  {row.description ? (
                    <div className="text-muted-foreground text-sm">
                      {row.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </th>
            {channels.map((channel, index) => (
              <TableCell key={channel.id}>
                <div className="flex justify-center">{row.controls[index]}</div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
