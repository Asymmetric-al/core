import { brandConfig } from "@asym/config/site";

export function Icon() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
      {brandConfig.shortName}
    </span>
  );
}
