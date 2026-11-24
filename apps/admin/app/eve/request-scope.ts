import { readDocumentScopeForSend } from "@asym/database/document-scope";
import { requestScopeHeaders } from "@asym/database/request-scope-headers";

export class EveDocumentScopeRetiredError extends Error {
  constructor() {
    super("The page's organization scope is retired, so Eve sent nothing.");
    this.name = "EveDocumentScopeRetiredError";
  }
}

export function eveRequestScopeHeaders(): Record<string, string> {
  const state = readDocumentScopeForSend();
  if (state.kind === "retired") {
    throw new EveDocumentScopeRetiredError();
  }
  return requestScopeHeaders(state.kind === "scoped" ? state.scope : null);
}
