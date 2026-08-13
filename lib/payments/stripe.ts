import "server-only";

import Stripe from "stripe";
import { evaluateLegalLaunchGate } from "../legal/launch-gate";
import {
  getSellerSnapshot as getLegalSellerSnapshot,
  isSellerIdentityComplete,
} from "../legal/seller";
import type { PaidPlanCode } from "./plans";

export { assertCheckoutAmountMatchesPlan } from "./plans";

let stripeClient: Stripe | null = null;

export function isSellerConfigured() {
  return isSellerIdentityComplete();
}

export function isStripeConfigured() {
  const legalGate = evaluateLegalLaunchGate({ requireDocumentsApproved: true });
  return Boolean(
    process.env.STRIPE_SECRET_KEY
    && process.env.STRIPE_WEBHOOK_SECRET
    && process.env.STRIPE_PRICE_BASIC
    && process.env.STRIPE_PRICE_PLUS
    && isSellerConfigured()
    && legalGate.ok,
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
  return getLegalSellerSnapshot();
}
