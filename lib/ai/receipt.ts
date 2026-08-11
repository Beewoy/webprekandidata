import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

type AiReceiptPayload = {
  userId: string;
  promptFingerprint: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  expiresAt: number;
};

function getSigningKey() {
  return process.env.AI_AUDIT_HMAC_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OPENAI_API_KEY;
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function fingerprintAiPrompt(summary: string) {
  const key = getSigningKey();
  if (!key) return null;
  return createHmac("sha256", key).update(summary).digest("hex");
}

export function createAiReceipt(payload: Omit<AiReceiptPayload, "expiresAt">) {
  const key = getSigningKey();
  if (!key) return undefined;
  const encoded = Buffer.from(JSON.stringify({ ...payload, expiresAt: Date.now() + 30 * 60 * 1000 })).toString("base64url");
  return `${encoded}.${sign(encoded, key)}`;
}

export function verifyAiReceipt(receipt: string | undefined, userId: string, summary: string): AiReceiptPayload | null {
  const key = getSigningKey();
  if (!key || !receipt) return null;
  const [encoded, signature] = receipt.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded, key));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AiReceiptPayload;
    const fingerprint = fingerprintAiPrompt(summary);
    if (!fingerprint || payload.userId !== userId || payload.promptFingerprint !== fingerprint || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

