"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  Circle,
  ExternalLink,
  HelpCircle,
  Menu,
  PanelLeftClose,
  UserRound,
  X,
} from "lucide-react";
import { SupportDialog } from "@/components/app-shell/support-dialog";
import { cn } from "@/lib/cn";
import type { SiteSummary } from "@/lib/data/sites";
import { getPlanLabel, PlanBadge } from "@/components/ui/plan-badge";
import type { SiteSectionStatusMap } from "@/lib/site-section-status";
import { contentSections, overviewItem, publishSections, type SiteSection } from "@/lib/site-sections";

type AppShellProps = {
  site: SiteSummary;
  sectionStatuses: SiteSectionStatusMap;
  children: ReactNode;
};

const statusLabels = { complete: "Dokončené", started: "Rozpracované", empty: "Nezačaté" } as const;

function StatusIcon({ status }: { status: SiteSection["status"] }) {
  if (status === "complete") return <Check size={13} aria-hidden="true" />;
  if (status === "started") return <span className="status-dot status-dot--started" aria-hidden="true" />;
  return <Circle size={9} aria-hidden="true" />;
}

function SectionLink({ section, siteId, onNavigate }: { section: SiteSection; siteId: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const href = `/app/web/${siteId}/${section.slug}`;
  const active = pathname === href;
  const Icon = section.icon;

  return (
    <Link href={href} className={cn("side-link", active && "side-link--active")} onClick={onNavigate} aria-current={active ? "page" : undefined}>
      <Icon size={18} strokeWidth={1.8} />
      <span>{section.label}</span>
      <span className={cn("side-status", `side-status--${section.status}`)} title={statusLabels[section.status]}><StatusIcon status={section.status} /><span className="sr-only">{statusLabels[section.status]}</span></span>
    </Link>
  );
}

function SidebarContent({
  site,
  sectionStatuses,
  onNavigate,
  onOpenSupport,
}: {
  site: SiteSummary;
  sectionStatuses: SiteSectionStatusMap;
  onNavigate?: () => void;
  onOpenSupport: () => void;
}) {
  const siteId = site.id;
  const pathname = usePathname();
  const overviewHref = `/app/web/${siteId}`;
  const OverviewIcon = overviewItem.icon;

  return (
    <>
      <div className="brand-row">
        <Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" height={30} priority style={{ height: "auto", width: 150 }} width={150} />
        <PlanBadge plan={site.planCode} />
      </div>

      <nav className="sidebar-nav" aria-label="Hlavná navigácia editora">
        <div className="nav-group">
          <p className="nav-label">Váš web</p>
          <Link href={overviewHref} className={cn("side-link", pathname === overviewHref && "side-link--active")} onClick={onNavigate}>
            <OverviewIcon size={18} strokeWidth={1.8} />
            <span>Prehľad</span>
          </Link>
          {contentSections.map((section) => <SectionLink key={section.slug} section={{ ...section, status: sectionStatuses[section.slug] ?? section.status }} siteId={siteId} onNavigate={onNavigate} />)}
        </div>

        <div className="nav-group">
          <p className="nav-label">Zverejnenie</p>
          {publishSections.map((section) => <SectionLink key={section.slug} section={{ ...section, status: sectionStatuses[section.slug] ?? section.status }} siteId={siteId} onNavigate={onNavigate} />)}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="side-link side-link--button" type="button" onClick={onOpenSupport}>
          <HelpCircle size={18} />
          <span>Pomoc a podpora</span>
        </button>
        <Link className="account-button" href="/app" onClick={onNavigate}>
          <span className="account-avatar"><UserRound size={17} /></span>
          <span><strong>{site.candidateName}</strong><small>{site.internalName}</small></span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </>
  );
}

export function AppShell({ site, sectionStatuses, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const siteId = site.id;
  const isPublished = site.status === "published";
  const isSuspended = site.status === "suspended";
  const bannerLabel = isPublished ? "Web je verejný" : isSuspended ? "Web pozastavený" : site.planCode ? `${getPlanLabel(site.planCode)} aktívny` : "Skúšobná verzia";
  const bannerText = isPublished
    ? "Návštevníci vidia poslednú zverejnenú verziu. Nové úpravy zostávajú v koncepte."
    : isSuspended
      ? "Verejný web je dočasne skrytý. Kedykoľvek ho môžete obnoviť."
      : site.planCode
        ? "Váš balík je aktivovaný. Web zatiaľ nie je verejný."
        : "Váš web zatiaľ nie je verejný. Obsah môžete pokojne dopĺňať.";

  const openSupport = () => {
    setMenuOpen(false);
    setSupportOpen(true);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Editor webu">
        <SidebarContent site={site} sectionStatuses={sectionStatuses} onOpenSupport={openSupport} />
      </aside>

      <header className="mobile-header">
        <button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Otvoriť menu"><Menu size={22} /></button>
        <span className="mobile-brand"><Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" height={28} priority style={{ height: "auto", maxWidth: "38vw", width: 142 }} width={142} /><PlanBadge plan={site.planCode} /></span>
        <Link className="icon-button" href={`/app/web/${siteId}/nahlad`} aria-label="Zobraziť náhľad"><ExternalLink size={19} /></Link>
      </header>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigácia">
          <button className="drawer-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Zavrieť menu" />
          <aside className="drawer-panel">
            <button className="drawer-close icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Zavrieť menu"><X size={22} /></button>
            <SidebarContent
              site={site}
              sectionStatuses={sectionStatuses}
              onNavigate={() => setMenuOpen(false)}
              onOpenSupport={openSupport}
            />
          </aside>
        </div>
      )}

      <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} />

      <main className="app-main">
        <div className="desktop-topbar">
          <span className="topbar-project"><PanelLeftClose size={17} /> {site.internalName}</span>
          <Link className="button button--secondary button--small" href={`/app/web/${siteId}/nahlad`}><ExternalLink size={16} /> Náhľad webu</Link>
        </div>
        <div className={cn("trial-banner", site.planCode && "trial-banner--active")}>
          <span>{bannerLabel}</span>
          <p>{bannerText}</p>
          {isPublished
            ? <Link href={`/${site.slug}`} target="_blank">Otvoriť verejný web <ExternalLink size={14} /></Link>
            : <Link href={`/app/web/${siteId}/publikovanie`}>{isSuspended ? "Spravovať web" : site.planCode ? "Dokončiť zverejnenie" : "Zverejniť web"} <ChevronRight size={15} /></Link>}
        </div>
        {children}
      </main>
    </div>
  );
}
