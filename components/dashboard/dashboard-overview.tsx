import Link from "next/link";
import { AlertCircle, ArrowRight, Check, Globe2, Sparkles } from "lucide-react";
import { CampaignTemplatePreview, type CampaignTemplatePreviewContent } from "@/components/editor/campaign-template-preview";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { PlanBadge } from "@/components/ui/plan-badge";
import { contentSections } from "@/lib/site-sections";
import { calculateProgress, getProgressLabel } from "@/lib/site-progress";
import type { SiteSummary } from "@/lib/data/sites";
import type { SitePreviewData } from "@/lib/site-preview-model";
import type { SiteSectionStatusMap } from "@/lib/site-section-status";

type DashboardOverviewProps = {
  onboardingPartial?: boolean;
  preview: SitePreviewData;
  sectionStatuses: SiteSectionStatusMap;
  site: SiteSummary;
};

export function DashboardOverview({ site, preview, sectionStatuses, onboardingPartial = false }: DashboardOverviewProps) {
  const siteId = site.id;
  const sections = contentSections.map((section) => ({ ...section, status: sectionStatuses[section.slug] ?? section.status }));
  const progress = calculateProgress(sections.map((item) => item.status));
  const nextItems = sections.filter((item) => item.status !== "complete").slice(0, 4);
  const previewContent: CampaignTemplatePreviewContent = {
    candidateName: preview.candidate.name,
    candidateSubtitle: [preview.candidate.position, preview.candidate.city].filter(Boolean).join(" · "),
    cta: "Môj program",
    eyebrow: preview.candidate.position,
    headlineAfter: preview.hero.headlineAfter,
    headlineBefore: preview.hero.headlineBefore,
    heroImage: preview.media.hero ? { altText: preview.media.hero.altText, url: preview.media.hero.url } : undefined,
    highlight: preview.hero.highlight,
    initials: preview.candidate.initials,
    logoImage: preview.media.logo ? { altText: preview.media.logo.altText, url: preview.media.logo.url } : undefined,
    subheadline: preview.hero.subheadline,
  };

  return (
    <div className="page-container page-container--wide">
      {onboardingPartial && (
        <div className="form-message form-message--error onboarding-partial-notice" role="alert">
          <AlertCircle size={18} />
          <span>Web sme vytvorili, ale navrhnuté texty sa nepodarilo uložiť. Doplňte ich v jednotlivých sekciách editora.</span>
        </div>
      )}
      <PageHeading eyebrow="Váš volebný web" title={`Dobrý deň, ${site.candidateName.split(" ")[0]}`} description="Tu vidíte, čo je hotové a čo ešte treba doplniť pred zverejnením." />

      <section className="progress-hero" aria-labelledby="progress-title">
        <div className="progress-hero__copy">
          <div className="progress-hero__icon"><Sparkles size={24} /></div>
          <div>
            <p className="eyebrow">{getProgressLabel(progress)}</p>
            <h2 id="progress-title">Váš web je hotový na {progress} %</h2>
            <p>Najdôležitejší základ už máte. Pokračujte obsahom, ktorý voličom vysvetlí váš program.</p>
          </div>
        </div>
        <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties} aria-label={`${progress} percent`}>
          <span>{progress}<small>%</small></span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Odporúčaný postup</p><h2>Pokračujte týmito krokmi</h2></div>
            <span className="panel-counter">{nextItems.length} úlohy</span>
          </div>
          <div className="task-list">
            {nextItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link className="task-row" href={`/app/web/${siteId}/${item.slug}`} key={item.slug}>
                  <span className="task-order">{index + 1}</span>
                  <span className="task-icon"><Icon size={18} /></span>
                  <span className="task-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                  <StatusPill status={item.status} />
                  <ArrowRight className="task-arrow" size={18} />
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="panel website-card">
          <div className="website-card__preview">
            <div className="preview-browser"><i /><i /><i /><span>{preview.address}</span></div>
            <CampaignTemplatePreview color={preview.theme.color} content={previewContent} dashboard template={preview.theme.template} />
          </div>
          <div className="website-card__body">
            <div className="website-card__badges"><span className="website-state"><span /> Koncept</span><PlanBadge plan={site.planCode} /></div>
            <h2>{site.slug}</h2>
            <p>Adresa bude dostupná po zverejnení.</p>
            <div className="website-card__actions">
              <Link className="button button--secondary" href={`/app/web/${siteId}/nahlad`}><Globe2 size={17} /> Náhľad</Link>
              <Link className="button button--primary" href={`/app/web/${siteId}/publikovanie`}>Zverejniť <ArrowRight size={17} /></Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="tip-card">
        <span className="tip-card__icon"><Check size={17} /></span>
        <div><strong>Zmeny uložíte tlačidlom Uložiť</strong><p>Pri vypĺňaní uvidíte stav neuložených zmien. Pred prechodom do inej sekcie vás upozorníme, ak ste ešte neuložili.</p></div>
      </section>
    </div>
  );
}
