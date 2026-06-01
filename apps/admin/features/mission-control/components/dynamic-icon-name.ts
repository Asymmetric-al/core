export function pascalToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

export function resolveDynamicIconKebabName(
  name: string,
  importKeys: Record<string, unknown>,
): string | null {
  if (name in importKeys) {
    return name;
  }

  const converted = pascalToKebab(name);
  if (converted in importKeys) {
    return converted;
  }

  return null;
}
