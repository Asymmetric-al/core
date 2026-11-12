import { brandConfig } from "@asym/config/site";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
        {brandConfig.shortName}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-black text-foreground">
          {brandConfig.name}
        </span>
        <span className="mt-1 text-xs font-semibold text-muted-foreground">
          Web Studio
        </span>
      </div>
    </div>
  );
}
