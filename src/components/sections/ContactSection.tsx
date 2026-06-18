import { Fragment } from 'react';
import { CONTACT, HOURS, WHATSAPP_LINKS } from '@/lib/constants';
import GoldDivider from '@/components/ui/GoldDivider';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ContactSection() {
  return (
    <section id="kontakt" className="contact">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Kontakt</p>
        <h2 className="section-title">Kde nás nájdete</h2>
        <GoldDivider />
      </ScrollReveal>

      <div className="contact-grid">
        <ScrollReveal direction="left" delay={100}>
          <div className="contact-info">
            <div>
              <p className="contact-item-label">Adresa</p>
              <p className="contact-item-value contact-item-value--pre">
                {CONTACT.address}
              </p>
            </div>

            <div>
              <p className="contact-item-label">Kontakt</p>
              <p className="contact-item-value">
                <a href={CONTACT.phoneHref} className="contact-link">{CONTACT.phone}</a>
                <br />
                <a href={CONTACT.emailHref} className="contact-link">{CONTACT.email}</a>
              </p>
            </div>

            <div>
              <p className="contact-item-label">Otváracie hodiny</p>
              <div className="contact-hours-grid">
                {HOURS.map((row) => (
                  <Fragment key={row.day}>
                    <span className="contact-hours-day">{row.day}</span>
                    <span className="contact-hours-time">{row.time}</span>
                  </Fragment>
                ))}
              </div>
            </div>

            <a
              href={WHATSAPP_LINKS.location}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-wa-btn"
            >
              <WhatsAppIcon size={18} />
              Napíšte nám
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={200}>
          <iframe
            src={CONTACT.mapSrc}
            className="contact-map"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa Kate Barber Studio"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
