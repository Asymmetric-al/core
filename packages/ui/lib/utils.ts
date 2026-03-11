import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', { 'opacity-50': disabled })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
