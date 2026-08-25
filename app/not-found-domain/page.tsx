import type { Metadata } from "next";
import { PlatformNotFound } from "@/components/marketing/platform-not-found";

export const metadata: Metadata = {
  title: "Doména nie je pripojená",
  description:
    "Táto adresa nie je aktívne prepojená s publikovaným kandidátskym webom na WebPreKandidata.sk.",
  robots: { index: false, follow: false },
};

export default function NotFoundDomainPage() {
  return <PlatformNotFound variant="domain" />;
}
