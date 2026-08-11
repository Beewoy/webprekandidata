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
