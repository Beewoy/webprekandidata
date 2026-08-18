import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { getReadableCampaignTextColor, type CampaignTemplateId } from "@/lib/site-theme";

type PreviewImage = {
  altText: string;
  url: string;
};

export type CampaignTemplatePreviewContent = {
  candidateName: string;
  candidateSubtitle: string;
  cta: string;
  eyebrow: string;
  headlineAfter: string;
  headlineBefore: string;
  heroImage?: PreviewImage;
  highlight: string;
  initials: string;
  logoImage?: PreviewImage;
  subheadline: string;
};

type CampaignTemplatePreviewProps = {
  catalog?: boolean;
  color: string;
  compact?: boolean;
  content?: CampaignTemplatePreviewContent;
  dashboard?: boolean;
  template: CampaignTemplateId;
};

const exampleContent: CampaignTemplatePreviewContent = {
  candidateName: "Martin Novák",
  candidateSubtitle: "Kandidát na primátora Trnavy",
  cta: "Spoznajte môj program",
  eyebrow: "Spoločne tvoríme mesto",
  headlineAfter: "",
  headlineBefore: "Spoločne pre ",
  highlight: "lepšiu Trnavu",
  initials: "MN",
  subheadline: "Mesto, ktoré počúva ľudí a premieňa dobré nápady na výsledky.",
};

export function CampaignTemplatePreview({ catalog = false, color, compact = false, content = exampleContent, dashboard = false, template }: CampaignTemplatePreviewProps) {
  const isDecorative = catalog || compact || dashboard;

  return (
    <div
      aria-hidden={isDecorative || undefined}
      className={cn(
        "template-preview",
        `template-preview--${template}`,
        compact && "template-preview--compact",
        dashboard && "template-preview--dashboard",
        catalog && "template-preview--catalog",
      )}
      style={{ "--campaign-color": color, "--campaign-on-color": getReadableCampaignTextColor(color) } as CSSProperties}
    >
      <header className="template-preview__nav">
        <span className={cn("template-preview__logo", content.logoImage && "template-preview__logo--image")}>
          {content.logoImage
            ? <Image alt={isDecorative ? "" : content.logoImage.altText} fill sizes="28px" src={content.logoImage.url} unoptimized />
            : content.initials}
        </span>
        <span className="template-preview__identity">
          <strong>{content.candidateName}</strong>
          <small>{content.candidateSubtitle}</small>
        </span>
        <span className="template-preview__links">O mne&nbsp;&nbsp; Program&nbsp;&nbsp; Kontakt</span>
      </header>

      <div className="template-preview__hero">
        <div className="template-preview__copy">
          <small>{content.eyebrow}</small>
          <h3>
            {content.headlineBefore}<em>{content.highlight}</em>{content.headlineAfter}
          </h3>
          <p>{content.subheadline}</p>
          <span className="template-preview__cta">{content.cta}</span>
        </div>
        <div className={cn("template-preview__portrait", content.heroImage && "template-preview__portrait--image")}>
          {content.heroImage
            ? (
                <Image
                  alt={isDecorative ? "" : content.heroImage.altText}
                  fill
                  sizes={catalog ? "420px" : dashboard ? "96px" : "235px"}
                  src={content.heroImage.url}
                  style={template === "vision" ? { objectPosition: "center top" } : undefined}
                  unoptimized
                />
              )
            : <span>{content.initials}</span>}
        </div>
      </div>

      <div className="template-preview__section">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
