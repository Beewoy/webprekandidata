/**
 * Merchant identity for LB-01. Defaults are owner-locked (2026-08-13).
 * Env vars override when set; do not invent register/VAT values beyond these defaults.
 */

export type SellerIdentityData = {
  name: string;
  address: string;
  ico: string;
  dic: string;
  email: string;
  phone: string;
  registerName: string;
  registrationAuthority: string;
  registrationNumber: string;
  vatPayer: boolean;
  icDph: string | null;
  supervisoryAuthorityName: string;
  supervisoryAuthorityAddress: string;
  supervisoryAuthorityEmail: string;
  arsEmail: string;
};

const DEFAULTS: SellerIdentityData = {
  name: "Ing. Tibor Antal",
  address: "Jána Stanislava 3085/37, 841 05 Bratislava – Karlova Ves, Slovensko",
  ico: "50640259",
  dic: "1075966881",
  email: "ahoj@beewoy.sk",
  phone: "+421 948 473 255",
  registerName: "Živnostenský register Slovenskej republiky",
  registrationAuthority: "Okresný úrad Bratislava",
  registrationNumber: "110-253321",
  vatPayer: false,
  icDph: null,
  supervisoryAuthorityName: "Slovenská obchodná inšpekcia — Ústredný inšpektorát",
  supervisoryAuthorityAddress: "Bajkalská 21/A, P. O. BOX 29, 827 99 Bratislava",
  supervisoryAuthorityEmail: "podnety@soi.sk",
  arsEmail: "ars@soi.sk",
};

function envOrDefault(key: string, fallback: string) {
  const value = process.env[key]?.trim();
  return value || fallback;
}

function parseVatPayer(): boolean {
  const raw = process.env.SELLER_VAT_PAYER?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return DEFAULTS.vatPayer;
}

export function getSellerIdentity(): SellerIdentityData {
  const vatPayer = parseVatPayer();
  const icDph = process.env.SELLER_IC_DPH?.trim() || null;
  return {
    name: envOrDefault("SELLER_NAME", DEFAULTS.name),
    address: envOrDefault("SELLER_ADDRESS", DEFAULTS.address),
    ico: envOrDefault("SELLER_ICO", DEFAULTS.ico),
    dic: envOrDefault("SELLER_DIC", DEFAULTS.dic),
    email: envOrDefault("SELLER_EMAIL", DEFAULTS.email),
    phone: envOrDefault("SELLER_PHONE", DEFAULTS.phone),
    registerName: envOrDefault("SELLER_REGISTER", DEFAULTS.registerName),
    registrationAuthority: envOrDefault(
      "SELLER_REGISTRATION_AUTHORITY",
      DEFAULTS.registrationAuthority,
    ),
    registrationNumber: envOrDefault(
      "SELLER_REGISTRATION_NUMBER",
      DEFAULTS.registrationNumber,
    ),
    vatPayer,
    icDph: vatPayer ? icDph : null,
    supervisoryAuthorityName: envOrDefault(
      "SELLER_SUPERVISORY_NAME",
      DEFAULTS.supervisoryAuthorityName,
    ),
    supervisoryAuthorityAddress: envOrDefault(
      "SELLER_SUPERVISORY_ADDRESS",
      DEFAULTS.supervisoryAuthorityAddress,
    ),
    supervisoryAuthorityEmail: envOrDefault(
      "SELLER_SUPERVISORY_EMAIL",
      DEFAULTS.supervisoryAuthorityEmail,
    ),
    arsEmail: envOrDefault("SELLER_ARS_EMAIL", DEFAULTS.arsEmail),
  };
}

/** True when resolved identity has all LB-01 required fields. */
export function isSellerIdentityComplete(identity = getSellerIdentity()) {
  const required = [
    identity.name,
    identity.address,
    identity.ico,
    identity.dic,
    identity.email,
    identity.phone,
    identity.registerName,
    identity.registrationAuthority,
    identity.registrationNumber,
    identity.supervisoryAuthorityName,
    identity.supervisoryAuthorityAddress,
    identity.supervisoryAuthorityEmail,
  ];
  if (required.some((value) => !value.trim())) return false;
  if (identity.vatPayer && !identity.icDph?.trim()) return false;
  return true;
}

export function getSellerIdentityIssues(identity = getSellerIdentity()) {
  const issues: string[] = [];
  if (!identity.name.trim()) issues.push("missing seller name");
  if (!identity.address.trim()) issues.push("missing seller address");
  if (!identity.ico.trim()) issues.push("missing seller IČO");
  if (!identity.dic.trim()) issues.push("missing seller DIČ");
  if (!identity.email.trim()) issues.push("missing seller email");
  if (!identity.phone.trim()) issues.push("missing seller phone");
  if (!identity.registerName.trim()) issues.push("missing seller register");
  if (!identity.registrationAuthority.trim()) issues.push("missing seller registration authority");
  if (!identity.registrationNumber.trim()) issues.push("missing seller registration number");
  if (!identity.supervisoryAuthorityName.trim()) issues.push("missing supervisory authority name");
  if (!identity.supervisoryAuthorityAddress.trim()) {
    issues.push("missing supervisory authority address");
  }
  if (!identity.supervisoryAuthorityEmail.trim()) {
    issues.push("missing supervisory authority email");
  }
  if (identity.vatPayer && !identity.icDph?.trim()) issues.push("missing seller IČ DPH");
  return issues;
}

/** Snapshot stored on orders / invoices — no secrets. */
export function getSellerSnapshot() {
  const identity = getSellerIdentity();
  return {
    name: identity.name,
    address: identity.address,
    ico: identity.ico,
    dic: identity.dic,
    email: identity.email,
    phone: identity.phone,
    registerName: identity.registerName,
    registrationAuthority: identity.registrationAuthority,
    registrationNumber: identity.registrationNumber,
    vatPayer: identity.vatPayer,
    icDph: identity.icDph,
    supervisoryAuthorityName: identity.supervisoryAuthorityName,
    supervisoryAuthorityAddress: identity.supervisoryAuthorityAddress,
    supervisoryAuthorityEmail: identity.supervisoryAuthorityEmail,
    arsEmail: identity.arsEmail,
  };
}

export function formatVatStatusLabel(identity = getSellerIdentity()) {
  if (identity.vatPayer && identity.icDph) {
    return `Platiteľ DPH, IČ DPH: ${identity.icDph}`;
  }
  return "Nie je platiteľ DPH";
}
