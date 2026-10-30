import { resolveEffectiveCapabilities as resolve } from "../../../packages/auth/capabilities/effective-capabilities";

import type { AuthenticatedContext } from "../../../packages/auth/context";

declare const auth: AuthenticatedContext;

export const fromAuth = resolve(auth); // error TS2345
