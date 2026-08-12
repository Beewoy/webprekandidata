import "server-only";

import Stripe from "stripe";
import type { PaidPlanCode } from "@/lib/payments/plans";

export { assertCheckoutAmountMatchesPlan } from "@/lib/payments/plans";

let stripeClient: Stripe | null = null;

export function isSellerConfigured() {
  return Boolean(
    process.env.SELLER_NAME?.trim()
    && process.env.SELLER_ADDRESS?.trim()
    && process.env.SELLER_ICO?.trim()
    && process.env.SELLER_DIC?.trim()
    && process.env.SELLER_EMAIL?.trim(),
  );
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY
    && process.env.STRIPE_WEBHOOK_SECRET
    && process.env.STRIPE_PRICE_BASIC
    && process.env.STRIPE_PRICE_PLUS
    && isSellerConfigured()
    && process.env.LEGAL_DOCUMENTS_APPROVED === "true",
  );
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe nie je nakonfigurovaný.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function getStripePriceId(planCode: PaidPlanCode): string {
  const priceId = planCode === "basic"
    ? process.env.STRIPE_PRICE_BASIC
    : process.env.STRIPE_PRICE_PLUS;
  if (!priceId) {
    throw new Error(`Chýba Stripe Price ID pre balík ${planCode}.`);
  }
  return priceId;
}

export function getSellerSnapshot() {
  return {
    name: process.env.SELLER_NAME?.trim() || "Ing. Tibor Antal",
    address: process.env.SELLER_ADDRESS?.trim() || "",
    ico: process.env.SELLER_ICO?.trim() || "",
    dic: process.env.SELLER_DIC?.trim() || "",
    email: process.env.SELLER_EMAIL?.trim() || "",
  };
}
