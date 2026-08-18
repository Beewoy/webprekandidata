import Link from "next/link";
import { CampaignTemplatePreview, type CampaignTemplatePreviewContent } from "@/components/editor/campaign-template-preview";
import { ScaledTemplatePreview } from "@/components/marketing/scaled-template-preview";
import { demoTemplateCatalog, getDemoSitePreview } from "@/lib/demo/sample-site";
import { defaultCampaignTheme } from "@/lib/site-theme";

function getDemoTemplatePreviewContent(): CampaignTemplatePreviewContent {
  const preview = getDemoSitePreview(defaultCampaignTheme.template);

  return {
    candidateName: preview.candidate.name,
    candidateSubtitle: [preview.candidate.position, preview.candidate.city].filter(Boolean).join(" · "),
    cta: "Môj program",
    eyebrow: preview.candidate.position,
    headlineAfter: preview.hero.headlineAfter,
    headlineBefore: preview.hero.headlineBefore,
    heroImage: preview.media.hero,
    highlight: preview.hero.highlight,
    initials: preview.candidate.initials,
    logoImage: preview.media.logo,
    subheadline: preview.hero.subheadline,
  };
}

export function TemplateShowcaseCards({ titleTag: TitleTag = "h2" }: { titleTag?: "h2" | "h3" }) {
  const content = getDemoTemplatePreviewContent();

  return (
    <div className="template-showcase__grid">
      {demoTemplateCatalog.map((item) => (
        <Link
          aria-label={`Otvoriť ukážku šablóny ${item.name}`}
          className={item.badge ? "template-showcase__card template-showcase__card--new" : "template-showcase__card"}
          href={`/ukazka/${item.slug}`}
          key={item.slug}
        >
          <ScaledTemplatePreview>
            <CampaignTemplatePreview catalog color={defaultCampaignTheme.color} content={content} template={item.id} />
          </ScaledTemplatePreview>
          <div className="template-showcase__copy">
            {item.badge ? <span className="template-showcase__badge">{item.badge}</span> : null}
            <TitleTag>{item.name}</TitleTag>
            <p>{item.shortDescription}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function LandingTemplateShowcase() {
  return (
    <section className="section template-showcase" id="sablony" aria-labelledby="template-showcase-title">
      <div className="section-heading template-showcase__heading">
        <p className="eyebrow"><span /> Vzhľad vašej kampane</p>
        <h2 id="template-showcase-title">Vyberte si zo štyroch profesionálnych šablón.</h2>
        <p>Každá má vlastný charakter, no všetky obsahujú rovnaké sekcie a automaticky sa prispôsobia mobilu aj počítaču.</p>
      </div>
      <TemplateShowcaseCards titleTag="h3" />
      <Link className="template-showcase__cta" href="/sablony">
        Vyskúšať šablóny v náhľade <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
