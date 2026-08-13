"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Mail, Menu, Monitor, Phone, RefreshCw, Smartphone, X } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { ContactForm } from "@/components/public-site/contact-form";
import { cn } from "@/lib/cn";
import type { SitePreviewData } from "@/lib/site-preview-model";
import { getReadableCampaignTextColor } from "@/lib/site-theme";
import { getCivicIconOption } from "@/lib/civic-icons";

type SitePreviewProps = {
  contactFormPreview?: boolean;
  data: SitePreviewData;
  publicMode?: boolean;
  siteId: string;
};

const APP_MOBILE_QUERY = "(max-width: 820px)";

function subscribeAppMobile(onStoreChange: () => void) {
  const media = window.matchMedia(APP_MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getAppMobileSnapshot() {
  return window.matchMedia(APP_MOBILE_QUERY).matches;
}

export function SitePreview({ contactFormPreview = false, data, publicMode = false, siteId }: SitePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const isAppMobile = useSyncExternalStore(subscribeAppMobile, getAppMobileSnapshot, () => true);
  const previewDevice = publicMode ? "desktop" : isAppMobile ? "mobile" : device;
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const articleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();
  const campaignStyle = {
    "--campaign-color": data.theme.color,
    "--campaign-on-color": getReadableCampaignTextColor(data.theme.color),
  } as CSSProperties;
  const activeGalleryItem = activeGalleryIndex === null ? null : data.gallery.items[activeGalleryIndex];
  const activePost = activePostId ? data.news.items.find((post) => post.id === activePostId) ?? null : null;
  const showMobileMenu = previewDevice === "mobile" && mobileMenuOpen;

  useEffect(() => {
    if (activeGalleryIndex === null) return;
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setActiveGalleryIndex(null);
      if (event.key === "ArrowLeft") setActiveGalleryIndex((current) => current === null ? null : (current - 1 + data.gallery.items.length) % data.gallery.items.length);
      if (event.key === "ArrowRight") setActiveGalleryIndex((current) => current === null ? null : (current + 1) % data.gallery.items.length);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeGalleryIndex, data.gallery.items.length]);

  useEffect(() => {
    if (!activePost) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = articleTriggerRef.current;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setActivePostId(null);
      if (event.key === "Tab") {
        event.preventDefault();
        document.querySelector<HTMLElement>(".article-modal__close")?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [activePost]);

  return (
    <div className={publicMode ? "public-site-shell" : "page-container page-container--wide"}>
      {publicMode && <a className="public-site-skip-link" href="#hlavny-obsah">Preskočiť na hlavný obsah</a>}
      {!publicMode && <PageHeading
        eyebrow="Kontrola webu"
        title="Náhľad"
        description="Náhľad používa aktuálne uložené texty z vášho konceptu."
        action={(
          <div className="preview-toolbar">
            {!isAppMobile && (
              <div className="preview-actions" role="group" aria-label="Veľkosť náhľadu">
                <button aria-pressed={device === "desktop"} className={cn("device-button", device === "desktop" && "device-button--active")} onClick={() => { setDevice("desktop"); setMobileMenuOpen(false); }} type="button"><Monitor size={17} /> Počítač</button>
                <button aria-pressed={device === "mobile"} className={cn("device-button", device === "mobile" && "device-button--active")} onClick={() => { setDevice("mobile"); setMobileMenuOpen(false); }} type="button"><Smartphone size={17} /> Mobil</button>
              </div>
            )}
            <button className="button button--secondary button--small" disabled={isRefreshing} onClick={() => startRefresh(() => router.refresh())} type="button"><RefreshCw className={isRefreshing ? "spin" : ""} size={15} /> {isRefreshing ? "Obnovujem…" : "Obnoviť"}</button>
          </div>
        )}
      />}

      <div className={cn("full-preview-stage", publicMode && "full-preview-stage--public")}>
        <div className={cn("full-preview-frame", publicMode && "full-preview-frame--public", !publicMode && previewDevice === "mobile" && "full-preview-frame--mobile")}>
          {!publicMode && <div className="full-preview-frame__bar"><i /><i /><i /><span>{data.address}</span><ExternalLink aria-hidden="true" size={15} /></div>}
          <div className="full-preview-viewport">
            <article className={cn("candidate-preview", `candidate-preview--${data.theme.template}`, publicMode && "candidate-preview--public", !publicMode && previewDevice === "mobile" && "candidate-preview--mobile")} id={publicMode ? "hlavny-obsah" : undefined} style={campaignStyle}>
              <header className="candidate-preview__header">
                <div className="candidate-preview__container candidate-preview__header-inner">
                  <a className="candidate-preview__brand" href="#uvod" onClick={() => setMobileMenuOpen(false)}>
                    <span
                      aria-label={data.media.logo?.altText}
                      className={data.media.logo ? "candidate-preview__logo candidate-preview__logo--image" : "candidate-preview__logo"}
                      role={data.media.logo ? "img" : undefined}
                      style={data.media.logo ? { backgroundImage: `url("${data.media.logo.url}")` } : undefined}
                    >{data.media.logo ? null : data.candidate.initials}</span>
                    <span><strong>{data.candidate.name}</strong><small>{data.candidate.position}{data.candidate.city ? ` · ${data.candidate.city}` : ""}</small></span>
                  </a>
                  <button
                    aria-expanded={showMobileMenu}
                    aria-label={showMobileMenu ? "Zavrieť navigáciu" : "Otvoriť navigáciu"}
                    className="candidate-preview__menu-button"
                    onClick={() => setMobileMenuOpen((current) => !current)}
                    type="button"
                  >
                    {showMobileMenu ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
                  </button>
                  <nav aria-label={publicMode ? "Navigácia webu kandidáta" : "Navigácia náhľadu"} className={showMobileMenu ? "candidate-preview__nav candidate-preview__nav--open" : "candidate-preview__nav"}>
                    <a href="#o-mne" onClick={() => setMobileMenuOpen(false)}>O mne</a>
                    <a href="#preco" onClick={() => setMobileMenuOpen(false)}>Prečo kandidujem</a>
                    <a href="#program" onClick={() => setMobileMenuOpen(false)}>Program</a>
                    {data.news.items.length > 0 && <a href="#aktuality" onClick={() => setMobileMenuOpen(false)}>Aktuality</a>}
                    {data.gallery.items.length > 0 && <a href="#galeria" onClick={() => setMobileMenuOpen(false)}>Galéria</a>}
                    <a className="candidate-preview__nav-cta" href="#kontakt" onClick={() => setMobileMenuOpen(false)}>Kontakt</a>
                  </nav>
                </div>
              </header>

              <section className="candidate-preview__hero" id="uvod">
                <div className="candidate-preview__container candidate-preview__hero-inner">
                  <div className="candidate-preview__hero-copy">
                    <p className="candidate-preview__eyebrow">{data.candidate.position}</p>
                    {data.candidate.politicalAffiliation && <p className="candidate-preview__affiliation">{data.candidate.politicalAffiliation}</p>}
                    <h1>
                      {data.hero.headlineBefore}
                      {data.hero.highlight && <em>{data.hero.highlight}</em>}
                      {data.hero.headlineAfter}
                    </h1>
                    <p className="candidate-preview__lead">{data.hero.subheadline}</p>
                    <div className="candidate-preview__hero-actions"><a href="#program">Môj program</a><a href="#kontakt">Napíšte mi</a></div>
                  </div>
                  <div
                    aria-label={data.media.hero ? undefined : `Miesto pre portrét: ${data.candidate.name}`}
                    className={data.media.hero ? "candidate-preview__portrait candidate-preview__portrait--image" : "candidate-preview__portrait"}
                    role={data.media.hero ? undefined : "img"}
                  >
                    {data.media.hero
                      ? <Image alt={data.media.hero.altText} fill sizes="(max-width: 760px) 280px, 420px" src={data.media.hero.url} unoptimized />
                      : <span>{data.candidate.initials}</span>}
                  </div>
                </div>
              </section>

              <section className="candidate-preview__section candidate-preview__about" id="o-mne">
                <div className="candidate-preview__container">
                  <div className="candidate-preview__section-heading"><p>{data.about.eyebrow}</p><h2>{data.about.headline}</h2></div>
                  <div className={data.media.about ? "candidate-preview__about-grid candidate-preview__about-grid--with-image" : "candidate-preview__about-grid"}>
                    {data.media.about && <div aria-label={data.media.about.altText} className="candidate-preview__about-photo" role="img" style={{ backgroundImage: `url("${data.media.about.url}")` }} />}
                    <div className="candidate-preview__rich-text" dangerouslySetInnerHTML={{ __html: data.about.bodyHtml }} />
                    <div className="candidate-preview__values">
                      {data.about.values.map((item, index) => {
                        const Icon = getCivicIconOption(item.icon).Icon;
                        return <article key={`${item.title}-${index}`}><span className="candidate-preview__item-icon"><Icon aria-hidden="true" size={19} /></span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>;
                      })}
                    </div>
                  </div>
                  {data.about.signature && <p className="candidate-preview__signature">{data.about.signature}</p>}
                </div>
              </section>

              <section className="candidate-preview__section candidate-preview__section--tinted" id="preco">
                <div className="candidate-preview__container">
                  <div className="candidate-preview__section-heading candidate-preview__section-heading--center"><p>{data.reasons.eyebrow}</p><h2>{data.reasons.headline}</h2><span>{data.reasons.intro}</span></div>
                  <div className="candidate-preview__card-grid">
                    {data.reasons.items.map((item, index) => {
                      const Icon = getCivicIconOption(item.icon).Icon;
                      return <article key={`${item.title}-${index}`}><span className="candidate-preview__item-icon"><Icon aria-hidden="true" size={21} /></span><h3>{item.title}</h3><p>{item.text}</p></article>;
                    })}
                  </div>
                </div>
              </section>

              <section className="candidate-preview__section" id="program">
                <div className="candidate-preview__container">
                  <div className="candidate-preview__section-heading"><p>{data.program.eyebrow}</p><h2>{data.program.headline}</h2><span>{data.program.intro}</span></div>
                  <div className="candidate-preview__program-list">
                    {data.program.items.map((item, index) => (
                      <article key={`${item.title}-${index}`}>
                        {(() => { const Icon = getCivicIconOption(item.icon).Icon; return <span className="candidate-preview__item-icon candidate-preview__program-icon"><Icon aria-hidden="true" size={20} /></span>; })()}
                        <div><h3>{item.title}</h3><p>{item.text}</p>{item.detailHtml && <div className="candidate-preview__rich-text candidate-preview__program-detail" dangerouslySetInnerHTML={{ __html: item.detailHtml }} />}</div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {data.news.items.length > 0 && (
                <section className="candidate-preview__section candidate-preview__news" id="aktuality">
                  <div className="candidate-preview__container">
                    <div className="candidate-preview__section-heading"><p>Aktuality</p><h2>Novinky z kampane</h2><span>Podujatia, stanoviská a dôležité informácie na jednom mieste.</span></div>
                    <div className="candidate-preview__news-grid">
                      {data.news.items.map((post) => (
                        <article className="candidate-preview__news-card" key={post.id}>
                          {post.cover && <Image alt={post.cover.altText} className="candidate-preview__news-cover" height={post.cover.height} src={post.cover.previewUrl} unoptimized width={post.cover.width} />}
                          <div>
                            <time dateTime={post.publishedAt}><CalendarDays aria-hidden="true" size={15} /> {new Intl.DateTimeFormat("sk-SK", { dateStyle: "long", timeZone: "Europe/Bratislava" }).format(new Date(post.publishedAt))}</time>
                            <h3>{post.title}</h3>
                            {post.excerpt && <p>{post.excerpt}</p>}
                            <button onClick={(event) => { articleTriggerRef.current = event.currentTarget; setActivePostId(post.id); }} type="button">Čítať článok <ArrowRight aria-hidden="true" size={16} /></button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {data.gallery.items.length > 0 && (
                <section className="candidate-preview__section candidate-preview__gallery" id="galeria">
                  <div className="candidate-preview__container">
                    <div className="candidate-preview__section-heading"><p>Galéria</p><h2>Život kampane</h2><span>Stretnutia, podujatia a momenty z nášho mesta.</span></div>
                    <div className="candidate-preview__gallery-grid">
                      {data.gallery.items.map((item, index) => (
                        <button aria-label={`Otvoriť fotografiu ${index + 1}${item.caption ? `: ${item.caption}` : ""}`} key={item.id} onClick={() => setActiveGalleryIndex(index)} type="button">
                          <Image alt={item.altText} height={item.height} src={item.previewUrl} unoptimized width={item.width} />
                          {item.caption && <span>{item.caption}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="candidate-preview__contact" id="kontakt">
                <div className="candidate-preview__container">
                  <div className="candidate-preview__contact-heading">
                    <p className="candidate-preview__eyebrow">Kontakt</p>
                    <h2>Ozvite sa mi</h2>
                    <span>
                      {data.contact.formEnabled
                        ? "Máte otázku alebo podnet? Napíšte mi."
                        : "Máte otázku alebo podnet? Napíšte mi e-mail."}
                    </span>
                  </div>
                  <div className={`candidate-preview__contact-grid${data.contact.formEnabled ? "" : " candidate-preview__contact-grid--links-only"}`}>
                    <div className="candidate-preview__contact-links">
                      {data.contact.email && (
                        <a className="candidate-preview__mailto-cta" href={`mailto:${data.contact.email}`}>
                          <Mail size={20} />
                          <span>
                            <small>Napísať e-mail</small>
                            {data.contact.email}
                          </span>
                        </a>
                      )}
                      {data.contact.phone && <a href={`tel:${data.contact.phone.replace(/[^+\d]/g, "")}`}><Phone size={20} /><span><small>Telefón</small>{data.contact.phone}</span></a>}
                      {data.contact.facebook && <a href={data.contact.facebook} rel="noreferrer" target="_blank">Facebook <ExternalLink size={16} /></a>}
                      {data.contact.instagram && <a href={data.contact.instagram} rel="noreferrer" target="_blank">Instagram <ExternalLink size={16} /></a>}
                    </div>
                    {data.contact.formEnabled && <ContactForm preview={!publicMode || contactFormPreview} siteId={siteId} />}
                  </div>
                </div>
              </section>

              <footer className="candidate-preview__footer">
                <div className="candidate-preview__container candidate-preview__footer-inner">
                  <div><strong>{data.candidate.name}</strong><span>{data.candidate.position} · {data.candidate.city}</span></div>
                  <a href="https://webprekandidata.sk" rel="noreferrer" target="_blank">Vytvorené cez WebPreKandidata.sk <ExternalLink aria-hidden="true" size={14} /></a>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </div>

      {activePost && (
        <div aria-label={`Článok: ${activePost.title}`} aria-modal="true" className="article-modal" onClick={() => setActivePostId(null)} role="dialog">
          <article className="article-modal__dialog" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Zavrieť článok" autoFocus className="article-modal__close" onClick={() => setActivePostId(null)} type="button"><X size={21} /></button>
            {activePost.cover && <Image alt={activePost.cover.altText} className="article-modal__cover" height={activePost.cover.height} src={activePost.cover.previewUrl} unoptimized width={activePost.cover.width} />}
            <div className="article-modal__content">
              <time dateTime={activePost.publishedAt}><CalendarDays aria-hidden="true" size={14} /> {new Intl.DateTimeFormat("sk-SK", { dateStyle: "long", timeZone: "Europe/Bratislava" }).format(new Date(activePost.publishedAt))}</time>
              <h2>{activePost.title}</h2>
              {activePost.excerpt && <p className="article-modal__lead">{activePost.excerpt}</p>}
              <div className="candidate-preview__rich-text article-modal__body" dangerouslySetInnerHTML={{ __html: activePost.bodyHtml }} />
            </div>
          </article>
        </div>
      )}

      {activeGalleryItem && activeGalleryIndex !== null && (
        <div aria-label="Náhľad fotografie" aria-modal="true" className="gallery-lightbox" onClick={() => setActiveGalleryIndex(null)} role="dialog">
          <div className="gallery-lightbox__dialog" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Zavrieť galériu" autoFocus className="gallery-lightbox__close" onClick={() => setActiveGalleryIndex(null)} type="button"><X size={22} /></button>
            {data.gallery.items.length > 1 && <button aria-label="Predchádzajúca fotografia" className="gallery-lightbox__previous" onClick={() => setActiveGalleryIndex((activeGalleryIndex - 1 + data.gallery.items.length) % data.gallery.items.length)} type="button"><ChevronLeft size={25} /></button>}
            <Image alt={activeGalleryItem.altText} height={activeGalleryItem.height} src={activeGalleryItem.previewUrl} unoptimized width={activeGalleryItem.width} />
            {data.gallery.items.length > 1 && <button aria-label="Nasledujúca fotografia" className="gallery-lightbox__next" onClick={() => setActiveGalleryIndex((activeGalleryIndex + 1) % data.gallery.items.length)} type="button"><ChevronRight size={25} /></button>}
            <div className="gallery-lightbox__caption"><span>{activeGalleryIndex + 1} / {data.gallery.items.length}</span>{activeGalleryItem.caption && <strong>{activeGalleryItem.caption}</strong>}</div>
          </div>
        </div>
      )}

      {!publicMode && <p className="preview-revision" aria-live="polite">Zobrazená verzia konceptu: {data.revision}. Zmeny sa načítajú po automatickom uložení a obnovení náhľadu.</p>}
      {!publicMode && <div className="preview-footer"><Link className="button button--secondary" href={`/app/web/${siteId}/zakladne-udaje`}><ArrowLeft size={17} /> Upraviť obsah</Link><Link className="button button--primary" href={`/app/web/${siteId}/publikovanie`}>Pokračovať k zverejneniu <ExternalLink size={17} /></Link></div>}
    </div>
  );
}
