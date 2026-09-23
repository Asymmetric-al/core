import { cn, type ClassValue } from "./utils";

type BaseUIClassName<State> = string | ((state: State) => string | undefined);

export function mergeBaseUIClassName(
  baseClassName: ClassValue,
  className?: string,
): string;
export function mergeBaseUIClassName<State>(
  baseClassName: ClassValue,
  className: (state: State) => string | undefined,
): (state: State) => string;
export function mergeBaseUIClassName<State>(
  baseClassName: ClassValue,
  className?: BaseUIClassName<State>,
): string | ((state: State) => string);
/** Preserve Base UI's state callback while merging caller styles after defaults. */
export function mergeBaseUIClassName<State>(
  baseClassName: ClassValue,
  className?: BaseUIClassName<State>,
): string | ((state: State) => string) {
  if (typeof className === "function") {
    return (state) => cn(baseClassName, className(state));
  }
  return cn(baseClassName, className);
}
