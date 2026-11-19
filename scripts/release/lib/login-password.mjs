// Login password verifiers for Supabase Auth, computed on the runner so the
// plain password never reaches the server, its statement log or argv (as the
// CMS role passwords' SCRAM verifiers, scram.mjs). Supabase Auth stores the
// hash in auth.users.encrypted_password and verifies an Argon2id PHC string as
// well as bcrypt (supabase/auth internal/crypto/password.go: `$argon2id$`,
// version 19, salt and hash in unpadded standard base64, m at most 1 GiB, t at
// most 20, p at most 16). Node computes Argon2id natively; it has no bcrypt.
import { argon2Sync, randomBytes } from "node:crypto";

// Printable ASCII without spaces. At most 72 bytes, so that the same password
// still works if Supabase Auth ever stores it again as bcrypt, which reads only
// the first 72 bytes.
const LOGIN_PASSWORD = /^[\x21-\x7e]{32,72}$/;

/** OWASP's Argon2id parameters: 19 MiB, two passes, one lane. */
export const ARGON2ID_PARAMETERS = Object.freeze({
  memory: 19456,
  passes: 2,
  parallelism: 1,
  tagLength: 32,
});

export function assertLoginPassword(password, name) {
  if (typeof password !== "string" || !LOGIN_PASSWORD.test(password)) {
    throw new Error(
      `${name} must be 32 to 72 printable ASCII characters without spaces.`,
    );
  }
}

const unpadded = (bytes) => bytes.toString("base64").replace(/=+$/, "");

/** The Argon2id PHC string Supabase Auth verifies `password` against. */
export function argon2idVerifier(password, { salt = randomBytes(16) } = {}) {
  assertLoginPassword(password, "The login password");
  const { memory, passes, parallelism, tagLength } = ARGON2ID_PARAMETERS;
  const hash = argon2Sync("argon2id", {
    message: password,
    nonce: salt,
    memory,
    passes,
    parallelism,
    tagLength,
  });
  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${unpadded(salt)}$${unpadded(hash)}`;
}
