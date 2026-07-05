import { getTranslations } from 'next-intl/server';
import type { StoreConfig, WorkingHours, DayHours } from '@/lib/store-config';

interface FooterProps {
  config: StoreConfig;
  locale?: string;
  legalEnabled?: boolean;
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function formatFooterHours(
  wh: WorkingHours,
  dayNames: Record<string, string>,
  closedLabel: string,
): { label: string; hours: string }[] {
  const result: { label: string; hours: string }[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    const h = wh[day] as DayHours;
    if (!h) { result.push({ label: dayNames[day] ?? day, hours: closedLabel }); i++; continue; }
    let j = i + 1;
    while (j < DAY_ORDER.length) {
      const next = wh[DAY_ORDER[j]] as DayHours;
      if (next && next.open === h.open && next.close === h.close) j++; else break;
    }
    const label = j - i > 1
      ? `${dayNames[day]} – ${dayNames[DAY_ORDER[j - 1]]}`
      : (dayNames[day] ?? day);
    result.push({ label, hours: `${h.open} – ${h.close}` });
    i = j;
  }
  return result;
}

export default async function Footer({ config, locale, legalEnabled }: FooterProps) {
  const { name, presence, whatsappLinks } = config;
  const currentYear = new Date().getFullYear();
  const showLegal = locale === 'de' && legalEnabled;

  const [tFooter, tDays] = await Promise.all([
    getTranslations('footer'),
    getTranslations('days'),
  ]);

  const dayNames: Record<string, string> = {
    mon: tDays('mon'), tue: tDays('tue'), wed: tDays('wed'),
    thu: tDays('thu'), fri: tDays('fri'), sat: tDays('sat'), sun: tDays('sun'),
  };
  const closedLabel = tDays('closed');

  const phoneHref = presence.phone ? `tel:${presence.phone.replace(/\s/g, '')}` : undefined;
  const emailHref = presence.email ? `mailto:${presence.email}` : undefined;
  const hoursRows = presence.openingHours
    ? formatFooterHours(presence.openingHours, dayNames, closedLabel)
    : [];
  const fullAddress = [
    presence.address,
    [presence.postalCode, presence.city].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');

  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Col 1 — Brand */}
        <div className="footer__brand">
          <p className="footer__logo">{name}</p>
          {presence.city && (
            <p className="footer__tagline">
              {tFooter('servicesTagline', { city: presence.city })}
            </p>
          )}
          <div className="footer__socials">
            {presence.instagram && (
              <a href={presence.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="footer__social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
            )}
            {presence.facebook && (
              <a href={presence.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="footer__social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            )}
            <a href={whatsappLinks.general} target="_blank" rel="noopener" aria-label="WhatsApp" className="footer__social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div className="footer__col">
          <h4 className="footer__heading">{tFooter('servicesNavTitle')}</h4>
          <ul className="footer__links">
            <li><a href="#sluzby">{tFooter('navServices')}</a></li>
            <li><a href="#galeria">{tFooter('navGallery')}</a></li>
            <li><a href="#tim">{tFooter('navTeam')}</a></li>
            <li><a href="#recenzie">{tFooter('navReviews')}</a></li>
            <li><a href="#o-nas">{tFooter('navAbout')}</a></li>
            <li><a href="#rezervacia">{tFooter('navBooking')}</a></li>
          </ul>
        </div>

        {/* Col 3 — Hours */}
        <div className="footer__col">
          <h4 className="footer__heading">{tFooter('servicesHoursTitle')}</h4>
          {hoursRows.length > 0 ? (
            <ul className="footer__hours">
              {hoursRows.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <span className={row.hours === closedLabel ? 'footer__closed' : undefined}>
                    {row.hours}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>—</p>
          )}
        </div>

        {/* Col 4 — Contact */}
        <div className="footer__col">
          <h4 className="footer__heading">{tFooter('contactTitle')}</h4>
          <ul className="footer__contact">
            {fullAddress && (
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {fullAddress}
              </li>
            )}
            {presence.phone && phoneHref && (
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.1 11.77a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <a href={phoneHref}>{presence.phone}</a>
              </li>
            )}
            {presence.email && emailHref && (
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href={emailHref}>{presence.email}</a>
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p>{tFooter('allRightsReserved', { year: currentYear, name })}</p>
        <p className="footer__bottom-links">
          <a href="#">{tFooter('privacyPolicy')}</a>
          <span>·</span>
          <a href="#">{tFooter('termsOfService')}</a>
          {showLegal && (
            <>
              <span>·</span>
              <a href={`/${locale}/impressum`}>Impressum</a>
              <span>·</span>
              <a href={`/${locale}/datenschutz`}>Datenschutz</a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
