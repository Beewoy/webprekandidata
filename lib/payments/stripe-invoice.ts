import type Stripe from "stripe";
import type { PaidPlanCode } from "./plans";

type BuyerSnapshot = {
  city: string;
  companyName: string;
  country: string;
  email: string;
  fullName: string;
  ico: string;
  postalCode: string;
  street: string;
};

type SellerSnapshot = {
  dic: string;
  ico: string;
  vatPayer?: boolean;
  icDph?: string | null;
};

type CheckoutMetadata = {
  order_id: string;
  order_number: string;
  plan_code: PaidPlanCode;
  site_id: string;
  user_id: string;
};

export function buildStripeCustomerParams(
  buyer: BuyerSnapshot,
  orderId: string,
): Stripe.CustomerCreateParams {
  return {
    email: buyer.email,
    name: buyer.companyName || buyer.fullName,
    address: {
      line1: buyer.street,
      postal_code: buyer.postalCode,
      city: buyer.city,
      country: buyer.country,
    },
    metadata: {
      order_id: orderId,
      ...(buyer.ico ? { ico: buyer.ico } : {}),
    },
  };
}

function buildInvoiceFooter(seller: SellerSnapshot) {
  const vatLine = seller.vatPayer && seller.icDph
    ? `Platiteľ DPH, IČ DPH: ${seller.icDph}`
    : "Nie sme platiteľom DPH";
  return [
    `IČO dodávateľa: ${seller.ico}`,
    `DIČ dodávateľa: ${seller.dic}`,
    vatLine,
  ].join("\n");
}

export function buildCheckoutSessionParams(input: {
  buyer: BuyerSnapshot;
  cancelUrl: string;
  customerId: string;
  integrationIdentifier: string;
  metadata: CheckoutMetadata;
  priceId: string;
  seller: SellerSnapshot;
  successUrl: string;
}): Stripe.Checkout.SessionCreateParams {
  const customFields: Stripe.Checkout.SessionCreateParams.InvoiceCreation.InvoiceData.CustomField[] = [
    { name: "Číslo objednávky", value: input.metadata.order_number },
  ];
  if (input.buyer.ico) {
    customFields.push({ name: "IČO", value: input.buyer.ico });
  }

  const invoiceData: Stripe.Checkout.SessionCreateParams.InvoiceCreation.InvoiceData = {
    metadata: input.metadata,
    footer: buildInvoiceFooter(input.seller),
    custom_fields: customFields,
  };

  return {
    mode: "payment",
    integration_identifier: input.integrationIdentifier,
    customer: input.customerId,
    client_reference_id: input.metadata.order_id,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: input.metadata,
    payment_intent_data: {
      metadata: input.metadata,
    },
    invoice_creation: {
      enabled: true,
      invoice_data: invoiceData,
    },
  };
}
