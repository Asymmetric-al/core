/** Static defaults only. A consuming resolver must still prove actor and row authority. */
export const CATEGORY_ORDER = [
  "public",
  "contact",
  "internal",
  "financial",
  "care",
  "security",
] as const;
export type SensitivityCategory = (typeof CATEGORY_ORDER)[number];

export const INITIAL_SURFACES = [
  "mission_control",
  "donor",
  "missionary",
  "public",
  "export",
] as const;
/** Extensible text registry; unknown surfaces are blind until explicitly admitted. */
export type Surface = string;
export type InitialSurface = (typeof INITIAL_SURFACES)[number];
export type FieldPolicyOperations = Readonly<{
  visible: boolean;
  editable: boolean;
  exportable: boolean;
}>;
export type CategoryDefaults = Readonly<{
  surfaces: Readonly<Record<InitialSurface, FieldPolicyOperations>>;
  auditRead: boolean;
  requiresReason: boolean;
  /** True means this category has no default admission on narrow/export surfaces. */
  neverNarrow: boolean;
}>;

const denied: FieldPolicyOperations = Object.freeze({
  visible: false,
  editable: false,
  exportable: false,
});
const readOnly: FieldPolicyOperations = Object.freeze({
  visible: true,
  editable: false,
  exportable: false,
});
const readExport: FieldPolicyOperations = Object.freeze({
  visible: true,
  editable: false,
  exportable: true,
});
const manage: FieldPolicyOperations = Object.freeze({
  visible: true,
  editable: true,
  exportable: false,
});
const manageExport: FieldPolicyOperations = Object.freeze({
  visible: true,
  editable: true,
  exportable: true,
});

function defaults(
  surfaces: CategoryDefaults["surfaces"],
  auditRead: boolean,
  requiresReason: boolean,
  neverNarrow: boolean,
): CategoryDefaults {
  return Object.freeze({
    surfaces: Object.freeze(surfaces),
    auditRead,
    requiresReason,
    neverNarrow,
  });
}
const restricted = {
  mission_control: manage,
  donor: denied,
  missionary: denied,
  public: denied,
  export: denied,
};
export const SENSITIVITY_DEFAULTS: Readonly<
  Record<SensitivityCategory, CategoryDefaults>
> = Object.freeze({
  public: defaults(
    {
      mission_control: manageExport,
      donor: readExport,
      missionary: readExport,
      public: readExport,
      export: readExport,
    },
    false,
    false,
    false,
  ),
  contact: defaults(
    {
      mission_control: manageExport,
      donor: manage,
      missionary: manage,
      public: denied,
      export: denied,
    },
    false,
    false,
    false,
  ),
  internal: defaults({ ...restricted }, false, false, true),
  financial: defaults(
    {
      mission_control: manageExport,
      donor: readOnly,
      missionary: readOnly,
      public: denied,
      export: denied,
    },
    false,
    true,
    false,
  ),
  care: defaults({ ...restricted }, true, true, true),
  security: defaults({ ...restricted }, true, true, true),
});

export function isSensitivityCategory(
  value: unknown,
): value is SensitivityCategory {
  return CATEGORY_ORDER.some((category) => category === value);
}
export function isInitialSurface(value: string): value is InitialSurface {
  return INITIAL_SURFACES.some((surface) => surface === value);
}
export function defaultPolicyFor(
  category: SensitivityCategory,
  surface: Surface,
): FieldPolicyOperations {
  return isSensitivityCategory(category) && isInitialSurface(surface)
    ? SENSITIVITY_DEFAULTS[category].surfaces[surface]
    : denied;
}
