export { DOCUMENT_PURPOSE_CATALOG } from "./catalog";
export {
  DocumentPurposeContractError,
  UnknownDocumentPurposeError,
  assertDocumentPurposeContract,
  getDocumentPurposeContract,
  isDocumentPurposeId,
  listDocumentPurposeContracts,
} from "./lookup";
export {
  DOCUMENT_PURPOSE_SERIALIZER_VERSION,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  digestDocumentPurposeValue,
  getDocumentPurposeCatalogDigest,
} from "./serialization";
export {
  createFailClosedQualificationPort,
  createStaticQualificationPort,
  resolvePurposeAvailability,
  type ResolvePurposeAvailabilityInput,
} from "./availability";
export {
  admitDocumentPurpose,
  type DocumentPurposeAdmissionResult,
} from "./admission";
export {
  validateDocumentPurposeCatalog,
  validateDocumentPurposeContractShape,
} from "./validation";
export * from "./types";
