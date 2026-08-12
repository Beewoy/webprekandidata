import { AlertTriangle, Info } from "lucide-react";
import { getDomainRegistrarGuide } from "@/lib/domains/registrar-guide";

export function DomainDnsGuide({ hostname }: { hostname: string }) {
  const guide = getDomainRegistrarGuide(hostname);

  return (
    <div className="domain-dns-guide">
      {guide.apexAaaaWarning && (
        <div className="info-box info-box--warning">
          <AlertTriangle size={18} />
          <span>
            <strong>Dôležité pre root doménu</strong>
            <small>{guide.apexAaaaWarning}</small>
          </span>
        </div>
      )}

      <div className="info-box">
        <Info size={18} />
        <span>
          <strong>Ako nastaviť DNS u registrátora</strong>
          <small>{guide.emailRecordsNote}</small>
        </span>
      </div>

      <ol className="domain-dns-guide__steps">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
