"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@asym/ui/lib/utils";

import { Switch } from "../shadcn/switch";

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
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      ) : (
        <>
          <Sun className="size-4 text-muted-foreground" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
          <Moon className="size-4 text-muted-foreground" />
        </>
      )}
    </div>
  );
}
