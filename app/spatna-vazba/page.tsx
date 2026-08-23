import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackPage } from "@/components/feedback/feedback-page";

export const metadata: Metadata = {
  title: "Spätná väzba",
  robots: { index: false, follow: false },
};

export default function FeedbackRoutePage() {
  return (
    <FeedbackPage
      title="Ako sa vám tvorilo s WebPreKandidata.sk?"
      intro="Zaberie to približne minútu. Vaša spätná väzba nám pomôže zlepšiť editor, šablóny aj podporu pre ďalších kandidátov."
    >
      <FeedbackForm />
    </FeedbackPage>
  );
}
