'use client';

import { useState, type FormEvent } from 'react';
import { SERVICE_OPTIONS, BARBERS, WHATSAPP_NUMBER } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GoldDivider from '@/components/ui/GoldDivider';
import DateTimePicker from '@/components/ui/DateTimePicker';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const name    = String(data.get('name')    ?? '').trim();
    const phone   = String(data.get('phone')   ?? '').trim();
    const service = String(data.get('service') ?? '').trim();
    const barber  = String(data.get('barber')  ?? '').trim();
    const note    = String(data.get('note')    ?? '').trim();

    const date = selectedDate ?? '';
    const time = selectedTime ?? '';

    const lines = [
      `📅 *Rezervácia — Kate Barber Studio*`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 ${name}  📞 ${phone}`,
      `✂️ ${service}`,
      barber ? `💈 ${barber}` : '',
      `📆 ${date}  🕐 ${time}`,
      note ? `💬 ${note}` : '',
      `━━━━━━━━━━━━━━━━━━`,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <section id="rezervacia" className="booking">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Rezervácia</p>
        <h2 className="section-title">Zarezervujte si termín</h2>
        <GoldDivider />
        <p className="section-subtitle">
          Vyplňte formulár — otvoríme WhatsApp s vašimi údajmi.
        </p>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={200}>
        <div className="booking__container">
          <form onSubmit={handleSubmit} className="booking__form">

            <div className="booking__form-row">
              <div>
                <label className="booking__label">Služba</label>
                <select name="service" required className="booking__select">
                  <option value="">Vyberte službu...</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="booking__label">Barber</label>
                <select name="barber" className="booking__select">
                  <option value="">Bez preferencie</option>
                  {BARBERS.map((barber) => (
                    <option key={barber} value={barber}>{barber}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="booking__label">Vyberte deň a čas</label>
              <div className="booking__picker-wrap">
                <DateTimePicker onSelect={handleDateTimeSelect} />
              </div>
            </div>

            <div className="booking__form-row">
              <div>
                <label className="booking__label">Meno</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Vaše meno"
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label">Telefón</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+421 9XX XXX XXX"
                  required
                  className="booking__input"
                />
              </div>
            </div>

            <div>
              <label className="booking__label">Poznámka (nepovinné)</label>
              <textarea
                name="note"
                placeholder="Špeciálne požiadavky alebo poznámky..."
                className="booking__textarea"
              />
            </div>

            <div className="booking__actions">
              <button type="submit" className="booking__btn-wa booking__btn-full">
                <WhatsAppIcon size={18} />
                Odoslať cez WhatsApp
              </button>
            </div>
          </form>

          <p className="booking__note">
            Po kliknutí sa otvorí WhatsApp s vyplnenými údajmi. Odpovedáme do 30 minút.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
