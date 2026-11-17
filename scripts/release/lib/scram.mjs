// SCRAM-SHA-256 verifiers, computed on the runner so the plain password never
// reaches the server, its statement log or argv (what psql's \password does).
// RFC 5802 / RFC 7677; PostgreSQL accepts the verifier in ALTER ROLE.
import { createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";

// Printable ASCII only, so SASLprep is the identity and the server derives the
// same key the client does.
const PASSWORD = /^[\x21-\x7e]{32,256}$/;

export function assertRolePassword(password, name) {
  if (typeof password !== "string" || !PASSWORD.test(password)) {
    throw new Error(
      `${name} must be 32 to 256 printable ASCII characters without spaces.`,
    );
  }
}

export function scramSha256Verifier(
  password,
  { salt = randomBytes(16), iterations = 4096 } = {},
) {
  assertRolePassword(password, "The role password");
  const salted = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const clientKey = createHmac("sha256", salted).update("Client Key").digest();
  const storedKey = createHash("sha256").update(clientKey).digest();
  const serverKey = createHmac("sha256", salted).update("Server Key").digest();
  return `SCRAM-SHA-256$${iterations}:${salt.toString("base64")}$${storedKey.toString("base64")}:${serverKey.toString("base64")}`;
}
