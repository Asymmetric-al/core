import { ValidationError } from "payload";

import type { PayloadRequest } from "payload";

export type FieldRefusal = { path: string; message: string };

export function refuse(
  req: PayloadRequest,
  collection: string,
  errors: FieldRefusal[],
): never {
  throw new ValidationError({ collection, errors }, req.t);
}
