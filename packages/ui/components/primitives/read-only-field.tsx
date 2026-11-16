import * as React from "react";

/**
 * A value people can see but not change here (such as a sign-in email the
 * organization manages), shown as text with a note on who can change it.
 */
export function ReadOnlyField({
  label,
  value,
  description,
}: {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
}) {
  const labelId = React.useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex flex-col gap-1.5"
    >
      <p
        id={labelId}
        className="text-sm leading-snug font-medium text-foreground"
      >
        {label}
      </p>
      <p className="text-sm break-all text-foreground">{value}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
