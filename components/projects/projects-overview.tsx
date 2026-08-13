import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, CirclePlus, Globe2, LogOut, MapPin } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { EmailVerificationBanner } from "@/components/account/email-verification-banner";
import type { EmailVerificationStatus } from "@/lib/data/account";
import type { SiteSummary } from "@/lib/data/sites";
import { WelcomeDialog } from "@/components/projects/welcome-dialog";
import { PlanBadge } from "@/components/ui/plan-badge";
import { getPlatformSiteLabel } from "@/lib/domains/platform";

const statusLabels: Record<SiteSummary["status"], string> = {
  draft: "Koncept",
  ready: "Pripravený",
  payment_pending: "Čaká na platbu",
  published: "Zverejnený",
  suspended: "Pozastavený",
  archived: "Archivovaný",
};

type ProjectsOverviewProps = {
  sites: SiteSummary[];
  verification: EmailVerificationStatus;
  emailNotice?: string;
  showWelcome?: boolean;
};

export function ProjectsOverview({ sites, verification, emailNotice, showWelcome = false }: ProjectsOverviewProps) {
  return (
    <main className="projects-shell">
      <header className="projects-header">
        <Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" width={190} height={38} priority />
        <form action={logoutAction}><button className="button button--secondary button--small" type="submit"><LogOut size={16} /> Odhlásiť sa</button></form>
      </header>
      <div className="projects-container">
        <Suspense fallback={null}>
          <EmailVerificationBanner
            email={verification.email}
            notice={emailNotice}
            verified={verification.verified}
          />
        </Suspense>

        <div className="projects-title">
          <div><p className="eyebrow">Vaše projekty</p><h1>Weby kandidátov</h1><p>Vyberte projekt, v ktorom chcete pokračovať, alebo vytvorte nový web.</p></div>
          <Link className="button button--primary" href="/app/novy-web"><CirclePlus size={18} /> Nový web</Link>
        </div>

        <div className="project-grid">
          {sites.map((site) => (
            <Link className="project-card" href={`/app/web/${site.id}`} key={site.id}>
              <div className="project-card__visual"><PlanBadge plan={site.planCode} /><span className="project-card__initials">{site.candidateName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><i>{statusLabels[site.status]}</i></div>
              <div className="project-card__body">
                <p>{site.internalName}</p><h2>{site.candidateName}</h2>
                <div className="project-meta"><span><MapPin size={14} />{site.locality}</span><span><Globe2 size={14} />{getPlatformSiteLabel(site.slug)}</span></div>
                <div className="project-card__footer"><span><CalendarDays size={14} /> Upravené nedávno</span><strong>Otvoriť editor <ArrowRight size={16} /></strong></div>
              </div>
            </Link>
          ))}

          <Link className="project-card project-card--new" href="/app/novy-web">
            <span><CirclePlus size={25} /></span><h2>Vytvoriť ďalší web</h2><p>Nový projekt pripravíte za pár minút.</p>
          </Link>
        </div>
      </div>
      {showWelcome && <WelcomeDialog defaultName={verification.fullName} />}
    </main>
  );
}
