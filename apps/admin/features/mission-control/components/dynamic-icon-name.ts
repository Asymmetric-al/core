export function pascalToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

export function resolveDynamicIconKebabName<T extends Record<string, unknown>>(
  name: string,
  importKeys: T,
): Extract<keyof T, string> | null {
  if (name in importKeys) {
    return name as Extract<keyof T, string>;
  }

  const converted = pascalToKebab(name);
  if (converted in importKeys) {
    return converted as Extract<keyof T, string>;
  }

  return null;
}
