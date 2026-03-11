import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { ApiHttpError } from "../shared/http-errors";

const ENCRYPTION_VERSION = "v1";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const rawSecret = process.env.RESEND_ENCRYPTION_KEY;
  if (!rawSecret) {
    throw new ApiHttpError(
      503,
      "RESEND_ENCRYPTION_KEY is required for tenant API key persistence.",
    );
  }

  return createHash("sha256").update(rawSecret).digest();
}

export function encryptResendApiKey(plainApiKey: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainApiKey, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptResendApiKey(encryptedApiKey: string): string {
  const [version, ivEncoded, authTagEncoded, payloadEncoded] =
    encryptedApiKey.split(":");

  if (
    version !== ENCRYPTION_VERSION ||
    !ivEncoded ||
    !authTagEncoded ||
    !payloadEncoded
  ) {
    throw new ApiHttpError(500, "Stored tenant API key format is invalid.");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(ivEncoded, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64url"));

  try {
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payloadEncoded, "base64url")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new ApiHttpError(500, "Stored tenant API key decryption failed.");
  }
}
