import { createHmac } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const TOTP_STEP_MS = 30_000;

export function base32(secret: string): Buffer {
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of secret.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) throw new Error("the TOTP secret is not base32");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }
  return Buffer.from(bytes);
}

export function totpStep(at = Date.now()): number {
  return Math.floor(at / TOTP_STEP_MS);
}

export function totp(secret: string, at = Date.now()): string {
  const step = Buffer.alloc(8);
  step.writeBigUInt64BE(BigInt(totpStep(at)));
  const mac = createHmac("sha1", base32(secret)).update(step).digest();
  const offset = mac[mac.length - 1]! & 0x0f;
  const code =
    ((mac[offset]! & 0x7f) << 24) |
    (mac[offset + 1]! << 16) |
    (mac[offset + 2]! << 8) |
    mac[offset + 3]!;
  return String(code % 1_000_000).padStart(6, "0");
}
