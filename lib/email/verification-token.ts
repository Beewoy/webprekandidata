import { createHash, randomBytes } from "node:crypto";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function createVerificationToken() {
  return randomBytes(32).toString("base64url");
}

export function isVerificationToken(value: string) {
  return TOKEN_PATTERN.test(value);
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
