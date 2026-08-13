import "server-only";

import nodemailer from "nodemailer";
import { getAppUrl } from "@/lib/env";

type VerificationEmail = {
  email: string;
  fullName: string;
  token: string;
};

type CandidateContactEmail = {
  candidateName: string;
  message: string;
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  senderPhone?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSmtpConfig() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;

  if (!user || !pass) {
    throw new Error("Brevo SMTP nie je nakonfigurované.");
  }

  return { user, pass };
}

function createTransporter() {
  const { user, pass } = getSmtpConfig();
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail({ email, fullName, token }: VerificationEmail) {
  const verificationUrl = new URL("/auth/overit-email", getAppUrl());
  verificationUrl.searchParams.set("token", token);

  const transporter = createTransporter();

  const safeName = escapeHtml(fullName || "");
  const safeUrl = escapeHtml(verificationUrl.toString());

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    to: email,
    subject: "Overte svoj e-mail – Web pre kandidáta",
    text: [
      `Dobrý deň${fullName ? `, ${fullName}` : ""},`,
      "",
      "váš účet je už aktívny. Kliknutím na nasledujúci odkaz overíte svoju e-mailovú adresu:",
      verificationUrl.toString(),
      "",
      "Odkaz platí 24 hodín. Ak ste si účet nevytvorili, túto správu môžete ignorovať.",
    ].join("\n"),
    html: `
      <div style="background:#f7f9fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#17212d">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8ef;border-radius:16px;padding:32px">
          <div style="font-size:20px;font-weight:800;color:#163b65;margin-bottom:24px">WebPreKandidata.sk</div>
          <h1 style="font-size:26px;line-height:1.2;margin:0 0 14px">Overte svoj e-mail</h1>
          <p style="font-size:15px;line-height:1.65;color:#465468;margin:0 0 12px">Dobrý deň${safeName ? `, ${safeName}` : ""},</p>
          <p style="font-size:15px;line-height:1.65;color:#465468;margin:0 0 24px">Váš účet je už aktívny. Overením adresy nám potvrdíte, že tento e-mail patrí vám.</p>
          <a href="${safeUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 20px;border-radius:10px">Overiť e-mail</a>
          <p style="font-size:12px;line-height:1.55;color:#7c8ba1;margin:24px 0 0">Odkaz platí 24 hodín. Ak ste si účet nevytvorili, túto správu môžete ignorovať.</p>
        </div>
      </div>
    `,
  });
}

export async function sendCandidateContactEmail({
  candidateName,
  message,
  recipientEmail,
  senderEmail,
  senderName,
  senderPhone,
}: CandidateContactEmail) {
  const transporter = createTransporter();
  const headerCandidateName = candidateName.replace(/[\r\n]+/g, " ").trim();
  const headerSenderName = senderName.replace(/[\r\n]+/g, " ").trim();
  const safeCandidateName = escapeHtml(candidateName);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
  const safeSenderEmail = escapeHtml(senderEmail);
  const safeSenderName = escapeHtml(senderName);
  const safeSenderPhone = senderPhone ? escapeHtml(senderPhone) : "Neuvedený";

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    replyTo: { name: headerSenderName, address: senderEmail },
    to: recipientEmail,
    subject: `Nová správa z webu – ${headerCandidateName}`,
    text: [
      `Nová správa z kontaktného formulára webu ${candidateName}`,
      "",
      `Meno: ${senderName}`,
      `E-mail: ${senderEmail}`,
      `Telefón: ${senderPhone || "Neuvedený"}`,
      "",
      "Správa:",
      message,
      "",
      "Na správu môžete odpovedať priamo cez tlačidlo Odpovedať vo svojom e-mailovom klientovi.",
    ].join("\n"),
    html: `
      <div style="background:#f7f9fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#17212d">
        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8ef;border-radius:16px;padding:32px">
          <div style="font-size:19px;font-weight:800;color:#163b65;margin-bottom:24px">${safeCandidateName}</div>
          <h1 style="font-size:25px;line-height:1.25;margin:0 0 22px">Nová správa z webu</h1>
          <div style="background:#f7f9fb;border:1px solid #e2e8ef;border-radius:12px;padding:18px;margin-bottom:22px">
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Meno:</strong> ${safeSenderName}</p>
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>E-mail:</strong> ${safeSenderEmail}</p>
            <p style="font-size:14px;line-height:1.6;margin:0"><strong>Telefón:</strong> ${safeSenderPhone}</p>
          </div>
          <div style="font-size:15px;line-height:1.7;color:#303d4f">${safeMessage}</div>
          <p style="font-size:12px;line-height:1.55;color:#7c8ba1;margin:24px 0 0">Na správu môžete odpovedať priamo cez tlačidlo Odpovedať vo svojom e-mailovom klientovi.</p>
        </div>
      </div>
    `,
  });
}

type SupportEmail = {
  accountEmail?: string | null;
  message: string;
  recipientEmails: readonly string[];
  replyEmail: string;
  userId: string;
};

export function isBrevoSmtpConfigured() {
  return Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY);
}

export async function sendSupportEmail({
  accountEmail,
  message,
  recipientEmails,
  replyEmail,
  userId,
}: SupportEmail) {
  const transporter = createTransporter();
  const headerReplyEmail = replyEmail.replace(/[\r\n]+/g, " ").trim();
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
  const safeReplyEmail = escapeHtml(replyEmail);
  const safeAccountEmail = accountEmail ? escapeHtml(accountEmail) : null;
  const safeUserId = escapeHtml(userId);

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    replyTo: headerReplyEmail,
    to: [...recipientEmails],
    subject: "Žiadosť o podporu – WebPreKandidata.sk",
    text: [
      "Nová žiadosť o podporu z dashboardu",
      "",
      `Odpovedný e-mail: ${replyEmail}`,
      accountEmail && accountEmail !== replyEmail ? `Účet: ${accountEmail}` : null,
      `ID používateľa: ${userId}`,
      "",
      "Správa:",
      message,
      "",
      "Na správu môžete odpovedať priamo cez tlačidlo Odpovedať vo svojom e-mailovom klientovi.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
    html: `
      <div style="background:#f7f9fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#17212d">
        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8ef;border-radius:16px;padding:32px">
          <div style="font-size:19px;font-weight:800;color:#163b65;margin-bottom:24px">WebPreKandidata.sk</div>
          <h1 style="font-size:25px;line-height:1.25;margin:0 0 22px">Žiadosť o podporu</h1>
          <div style="background:#f7f9fb;border:1px solid #e2e8ef;border-radius:12px;padding:18px;margin-bottom:22px">
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Odpovedný e-mail:</strong> ${safeReplyEmail}</p>
            ${safeAccountEmail && accountEmail !== replyEmail ? `<p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Účet:</strong> ${safeAccountEmail}</p>` : ""}
            <p style="font-size:14px;line-height:1.6;margin:0"><strong>ID používateľa:</strong> ${safeUserId}</p>
          </div>
          <div style="font-size:15px;line-height:1.7;color:#303d4f">${safeMessage}</div>
          <p style="font-size:12px;line-height:1.55;color:#7c8ba1;margin:24px 0 0">Na správu môžete odpovedať priamo cez tlačidlo Odpovedať vo svojom e-mailovom klientovi.</p>
        </div>
      </div>
    `,
  });
}

type OrderConfirmationEmail = {
  invoiceUrl?: string | null;
  orderNumber: string;
  planLabel: string;
  priceLabel: string;
  publishingUrl: string;
  recipientEmail: string;
  recipientName?: string | null;
  siteLabel: string;
};

export async function sendOrderConfirmationEmail({
  invoiceUrl,
  orderNumber,
  planLabel,
  priceLabel,
  publishingUrl,
  recipientEmail,
  recipientName,
  siteLabel,
}: OrderConfirmationEmail) {
  const transporter = createTransporter();
  const appUrl = getAppUrl().replace(/\/$/, "");
  const termsUrl = `${appUrl}/obchodne-podmienky`;
  const privacyUrl = `${appUrl}/ochrana-sukromia`;
  const complaintsUrl = `${appUrl}/reklamacny-poriadok`;
  const scopeText =
    "Objednaný balík zahŕňa vytvorenie kampaňového webu, jeho hosting, HTTPS certifikát a prístup k správe obsahu do 31. 12. 2026, bez automatického predĺženia. Konkrétny rozsah funkcií závisí od zvoleného balíka (Basic / Plus) podľa popisu na platforme a v obchodných podmienkach.";

  const safeName = recipientName ? escapeHtml(recipientName) : "";
  const safeOrderNumber = escapeHtml(orderNumber);
  const safePlan = escapeHtml(planLabel);
  const safePrice = escapeHtml(priceLabel);
  const safeSite = escapeHtml(siteLabel);
  const safePublishingUrl = escapeHtml(publishingUrl);
  const safeInvoiceUrl = invoiceUrl ? escapeHtml(invoiceUrl) : null;
  const safeTermsUrl = escapeHtml(termsUrl);
  const safePrivacyUrl = escapeHtml(privacyUrl);
  const safeComplaintsUrl = escapeHtml(complaintsUrl);
  const safeScopeText = escapeHtml(scopeText);

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    to: recipientEmail,
    subject: `Potvrdenie objednávky ${orderNumber} – Web pre kandidáta`,
    text: [
      `Dobrý deň${recipientName ? `, ${recipientName}` : ""},`,
      "",
      "ďakujeme za objednávku. Balík je aktívny.",
      "",
      `Číslo objednávky: ${orderNumber}`,
      `Balík: ${planLabel}`,
      `Suma: ${priceLabel}`,
      `Web: ${siteLabel}`,
      "",
      scopeText,
      "",
      `Pokračovať k zverejneniu: ${publishingUrl}`,
      invoiceUrl ? `Doklad: ${invoiceUrl}` : "Doklad (ak je k dispozícii) nájdete v sekcii Publikovanie.",
      "",
      "Právne dokumenty:",
      `Obchodné podmienky: ${termsUrl}`,
      `Ochrana súkromia: ${privacyUrl}`,
      `Reklamačný poriadok: ${complaintsUrl}`,
      "",
      "Web pre kandidáta",
    ].join("\n"),
    html: `
      <div style="background:#f7f9fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#17212d">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8ef;border-radius:16px;padding:32px">
          <div style="font-size:20px;font-weight:800;color:#163b65;margin-bottom:24px">WebPreKandidata.sk</div>
          <h1 style="font-size:26px;line-height:1.2;margin:0 0 14px">Potvrdenie objednávky</h1>
          <p style="font-size:15px;line-height:1.65;color:#465468;margin:0 0 12px">Dobrý deň${safeName ? `, ${safeName}` : ""},</p>
          <p style="font-size:15px;line-height:1.65;color:#465468;margin:0 0 22px">Ďakujeme za objednávku. Balík je aktívny.</p>
          <div style="background:#f7f9fb;border:1px solid #e2e8ef;border-radius:12px;padding:18px;margin-bottom:22px">
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Číslo objednávky:</strong> ${safeOrderNumber}</p>
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Balík:</strong> ${safePlan}</p>
            <p style="font-size:14px;line-height:1.6;margin:0 0 6px"><strong>Suma:</strong> ${safePrice}</p>
            <p style="font-size:14px;line-height:1.6;margin:0"><strong>Web:</strong> ${safeSite}</p>
          </div>
          <p style="font-size:13px;line-height:1.65;color:#465468;margin:0 0 22px">${safeScopeText}</p>
          <a href="${safePublishingUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 20px;border-radius:10px">Pokračovať k zverejneniu</a>
          ${safeInvoiceUrl
            ? `<p style="font-size:13px;line-height:1.55;margin:18px 0 0"><a href="${safeInvoiceUrl}" style="color:#0f766e;font-weight:600">Otvoriť doklad</a></p>`
            : `<p style="font-size:12px;line-height:1.55;color:#7c8ba1;margin:18px 0 0">Doklad (ak je k dispozícii) nájdete v sekcii Publikovanie.</p>`}
          <p style="font-size:12px;line-height:1.55;color:#7c8ba1;margin:24px 0 0">
            <a href="${safeTermsUrl}" style="color:#0f766e;text-decoration:none">Obchodné podmienky</a>
            &nbsp;·&nbsp;
            <a href="${safePrivacyUrl}" style="color:#0f766e;text-decoration:none">Ochrana súkromia</a>
            &nbsp;·&nbsp;
            <a href="${safeComplaintsUrl}" style="color:#0f766e;text-decoration:none">Reklamačný poriadok</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWithdrawalMagicLinkEmail(input: {
  link: string;
  orderNumber: string;
  recipientEmail: string;
}) {
  const transporter = createTransporter();
  const safeLink = escapeHtml(input.link);
  const safeOrder = escapeHtml(input.orderNumber);

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    to: input.recipientEmail,
    subject: `Odstúpenie od zmluvy – objednávka ${input.orderNumber}`,
    text: [
      "Dobrý deň,",
      "",
      `pre objednávku ${input.orderNumber} môžete dokončiť odstúpenie cez tento odkaz (platí 24 hodín):`,
      input.link,
      "",
      "Ak ste o odkaz nežiadali, tento e-mail ignorujte.",
      "",
      "Web pre kandidáta",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#17212d;line-height:1.6">
        <p>Dobrý deň,</p>
        <p>pre objednávku <strong>${safeOrder}</strong> dokončite odstúpenie cez bezpečný odkaz (platí 24 hodín):</p>
        <p><a href="${safeLink}" style="color:#0f766e;font-weight:700">Odstúpiť od zmluvy tu</a></p>
        <p style="color:#7c8ba1;font-size:13px">Ak ste o odkaz nežiadali, tento e-mail ignorujte.</p>
      </div>
    `,
  });
}

export async function sendWithdrawalConfirmationEmail(input: {
  confirmedAtIso: string;
  orderNumber: string;
  recipientEmail: string;
  recipientName?: string | null;
  refundAmountLabel: string;
  withdrawalId: string;
}) {
  const transporter = createTransporter();
  const confirmedLocal = new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Bratislava",
  }).format(new Date(input.confirmedAtIso));

  const safeName = input.recipientName ? escapeHtml(input.recipientName) : "";
  const safeOrder = escapeHtml(input.orderNumber);
  const safeId = escapeHtml(input.withdrawalId);
  const safeAmount = escapeHtml(input.refundAmountLabel);
  const safeWhen = escapeHtml(confirmedLocal);

  await transporter.sendMail({
    from: { name: "Web pre kandidáta", address: "noreply@webprekandidata.sk" },
    to: input.recipientEmail,
    subject: `Potvrdenie odstúpenia – ${input.orderNumber}`,
    text: [
      `Dobrý deň${input.recipientName ? `, ${input.recipientName}` : ""},`,
      "",
      "prijali sme vaše odstúpenie od zmluvy.",
      "",
      `Identifikátor žiadosti: ${input.withdrawalId}`,
      `Objednávka: ${input.orderNumber}`,
      `Dátum a čas potvrdenia (Europe/Bratislava): ${confirmedLocal}`,
      `Výška vrátenia: ${input.refundAmountLabel}`,
      "",
      "Vrátenie platby vykonáme najneskôr do 14 dní rovnakým platobným prostriedkom.",
      "",
      "Web pre kandidáta",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#17212d;line-height:1.6">
        <p>Dobrý deň${safeName ? `, ${safeName}` : ""},</p>
        <p>prijali sme vaše odstúpenie od zmluvy.</p>
        <ul>
          <li>Identifikátor žiadosti: <strong>${safeId}</strong></li>
          <li>Objednávka: <strong>${safeOrder}</strong></li>
          <li>Dátum a čas: <strong>${safeWhen}</strong></li>
          <li>Výška vrátenia: <strong>${safeAmount}</strong></li>
        </ul>
        <p>Vrátenie platby vykonáme najneskôr do 14 dní rovnakým platobným prostriedkom.</p>
      </div>
    `,
  });
}
