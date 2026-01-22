"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { cn } from "@asym/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
  className?: string;
}

export function ThemeToggle({
  collapsed = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2",
        collapsed && "justify-center px-2",
        className,
      )}
    >
      {collapsed ? (
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      ) : (
        <>
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </>
      )}
    </div>
  );
}
