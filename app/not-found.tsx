import type { Metadata } from "next";
import { PlatformNotFound } from "@/components/marketing/platform-not-found";

export const metadata: Metadata = {
  title: "Stránka sa nenašla",
  description:
    "Táto adresa na WebPreKandidata.sk neexistuje, alebo kandidátsky web nie je verejne zverejnený.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <PlatformNotFound variant="missing" />;
}
