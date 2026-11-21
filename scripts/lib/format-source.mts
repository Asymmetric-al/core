import path from "node:path";

export class SourceFormatError extends Error {}

export async function formatSource(
  file: string,
  source: string,
  profile: "trusted" | "managed",
): Promise<string> {
  if (profile !== "trusted" && profile !== "managed")
    throw new SourceFormatError("Unknown formatter profile");
  const filename = path.resolve(
    import.meta.dirname,
    "../..",
    path.basename(file),
  );
  try {
    const { format } = await import("oxfmt");
    const { trustedOptions } = await import("./format-options.mts");
    const options =
      profile === "managed"
        ? { ...trustedOptions, sortPackageJson: false }
        : trustedOptions;
    const { code, errors } = await format(filename, source, options);
    if (
      profile === "managed" &&
      errors.length === 1 &&
      errors[0]?.message.startsWith("Unsupported file type: ")
    )
      return source;
    if (errors.length)
      throw new Error(errors.map((error) => error.message).join("; "));
    return code;
  } catch (cause) {
    throw new SourceFormatError(
      `Oxfmt failed for ${file}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
