'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { SERVICE_OPTIONS, BARBERS } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GoldDivider from '@/components/ui/GoldDivider';
import DateTimePicker from '@/components/ui/DateTimePicker';
import type { HoursMap } from '@/components/ui/DateTimePicker';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface BookingSectionProps {
  workingHours?: HoursMap;
  whatsappNumber?: string;
}

export default function BookingSection({ workingHours, whatsappNumber }: BookingSectionProps) {
  const t = useTranslations('booking');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots,  setBookedSlots]  = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  // Track current date for barber-change reload
  const currentDateRef = useRef<string>(new Date().toISOString().split('T')[0]);

  const fetchSlots = useCallback(async (date: string) => {
    currentDateRef.current = date;
    setBookedSlots([]);       // clear stale data immediately
    setLoadingSlots(true);
    try {
      const res  = await fetch(`/api/availability?date=${date}`);
      const data = (await res.json()) as { slots: { time: string; available: boolean }[] };
      // Extract unavailable slots to reuse existing DateTimePicker bookedSlots interface
      const booked = (data.slots ?? []).filter((s) => !s.available).map((s) => s.time);
      setBookedSlots(booked);
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Load slots for initial day on mount
  useEffect(() => {
    const today = new Date();
    void fetchSlots(today.toISOString().split('T')[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayChange = useCallback((date: string) => {
    setSelectedTime('');
    void fetchSlots(date);
  }, [fetchSlots]);

  const handleBarberChange = useCallback(() => {
    // Reload slots when barber changes to get fresh data
    if (currentDateRef.current) void fetchSlots(currentDateRef.current);
  }, [fetchSlots]);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSubmitError('');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name    = String(data.get('name')    ?? '').trim();
    const phone   = String(data.get('phone')   ?? '').trim();
    const service = String(data.get('service') ?? '').trim();
    const barber  = String(data.get('barber')  ?? '').trim();
    const note    = String(data.get('note')    ?? '').trim();

    if (!selectedDate || !selectedTime) {
      setSubmitError(t('errorSelectTime'));
      return;
    }
    if (!name || !phone) {
      setSubmitError(t('errorFillName'));
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName:  name,
          clientPhone: phone,
          date:        selectedDate,
          time:        selectedTime,
          notes:       note || null,
        }),
      });

      if (res.status === 409) {
        // Slot taken — reload fresh data
        await fetchSlots(selectedDate);
        setSelectedTime('');
        setSubmitError(t('errorSlotTaken'));
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setSubmitError(t('errorSave'));
        setSubmitting(false);
        return;
      }

      // Optimistically mark slot as booked
      setBookedSlots((prev) => [...prev, selectedTime]);

      const serviceLine = service ? `✂️ ${service}` : '';
      const barberLine  = barber  ? `💈 ${barber}`  : '';
      const noteLine    = note    ? `💬 ${note}`    : '';
      const waMsg = [
        t('waMessage', { name, phone, date: selectedDate, time: selectedTime }),
        serviceLine,
        barberLine,
        noteLine,
      ].filter(Boolean).join('\n');

      if (whatsappNumber) {
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`,
          '_blank',
          'noopener,noreferrer',
        );
      }

      form.reset();
      setSelectedDate('');
      setSelectedTime('');
    } catch {
      setSubmitError(t('errorNetwork'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="rezervacia" className="booking">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('sectionLabel')}</p>
        <h2 className="section-title">{t('sectionTitle')}</h2>
        <GoldDivider />
        <p className="section-subtitle">
          {t('sectionSubtitle')}
        </p>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={200}>
        <div className="booking__container">
          <form onSubmit={handleSubmit} className="booking__form">

            <div className="booking__form-row">
              <div>
                <label className="booking__label">{t('serviceLabel')}</label>
                <select name="service" required className="booking__select">
                  <option value="">{t('servicePlaceholder')}</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="booking__label">{t('barberLabel')}</label>
                <select
                  name="barber"
                  className="booking__select"
                  onChange={handleBarberChange}
                >
                  <option value="">{t('barberAny')}</option>
                  {BARBERS.map((barber) => (
                    <option key={barber} value={barber}>{barber}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="booking__label">{t('dateTimeLabel')}</label>
              <div className="booking__picker-wrap">
                <DateTimePicker
                  onSelect={handleDateTimeSelect}
                  onDayChange={handleDayChange}
                  bookedSlots={bookedSlots}
                  loading={loadingSlots}
                  workingHours={workingHours}
                />
              </div>
            </div>

            <div className="booking__form-row">
              <div>
                <label className="booking__label">{t('nameLabel')}</label>
                <input
                  type="text"
                  name="name"
                  placeholder={t('namePlaceholder')}
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('phonePlaceholder')}
                  required
                  className="booking__input"
                />
              </div>
            </div>

            <div>
              <label className="booking__label">{t('noteLabel')}</label>
              <textarea
                name="note"
                placeholder={t('notePlaceholder')}
                className="booking__textarea"
              />
            </div>

            {submitError && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                ⚠️ {submitError}
              </p>
            )}

            <div className="booking__actions">
              <button
                type="submit"
                className="booking__btn-wa booking__btn-full"
                disabled={submitting || loadingSlots}
              >
                <WhatsAppIcon size={18} />
                {submitting ? t('submitting') : t('submitBtn')}
              </button>
            </div>
          </form>

          <p className="booking__note">
            {t('footNote')}
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
