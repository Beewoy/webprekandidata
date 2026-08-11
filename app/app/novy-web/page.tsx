import type { Metadata } from "next";
import { NewSiteForm } from "@/components/projects/new-site-form";

export const metadata: Metadata = { title: "Nový web" };

export default function NewSitePage() {
  return <NewSiteForm />;
}
