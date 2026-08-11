import { z } from "zod";
import { isPlatformHostname } from "../domains/platform";
import { isValidHostname, normalizeHostname } from "../domains/hostname";

export const attachCustomDomainSchema = z.object({
  hostname: z.string().trim().min(3, "Zadajte doménu.").max(253, "Doména je príliš dlhá."),
  siteId: z.string().uuid("Neplatný projekt."),
}).superRefine((value, ctx) => {
  const hostname = normalizeHostname(value.hostname);
  if (!isValidHostname(hostname)) {
    ctx.addIssue({ code: "custom", message: "Zadajte platnú doménu, napríklad martin-novak.sk.", path: ["hostname"] });
    return;
  }
  if (isPlatformHostname(hostname)) {
    ctx.addIssue({ code: "custom", message: "Táto adresa je rezervovaná pre platformu.", path: ["hostname"] });
  }
});

export const domainIdActionSchema = z.object({
  domainId: z.string().uuid("Neplatná doména."),
  siteId: z.string().uuid("Neplatný projekt."),
});
