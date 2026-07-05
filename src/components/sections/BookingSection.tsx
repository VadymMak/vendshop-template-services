'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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

  const [services,          setServices]          = useState<{ id: string; nameKey: string; duration: number; price: number }[]>([]);
  const [masters,           setMasters]           = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedMasterId,  setSelectedMasterId]  = useState('');
  const [dataLoading,       setDataLoading]       = useState(true);

  // Track current date for master-change reload
  const currentDateRef = useRef<string>(new Date().toISOString().split('T')[0]);

  // Load services and masters in parallel on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.ok ? r.json() : { services: [] }),
      fetch('/api/masters').then(r => r.ok ? r.json() : { masters: [] }),
    ]).then(([svcData, mstData]) => {
      setServices((svcData as { services: typeof services }).services ?? []);
      setMasters((mstData as { masters: typeof masters }).masters ?? []);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, []);

  const fetchSlots = useCallback(async (date: string, masterId?: string, serviceId?: string) => {
    currentDateRef.current = date;
    setBookedSlots([]);
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({ date });
      if (masterId)  params.set('masterId',  masterId);
      if (serviceId) params.set('serviceId', serviceId);
      const res  = await fetch(`/api/availability?${params.toString()}`);
      const data = (await res.json()) as { slots: { time: string; available: boolean }[] };
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
    void fetchSlots(date, selectedMasterId, selectedServiceId);
  }, [fetchSlots, selectedMasterId, selectedServiceId]);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSubmitError('');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name  = String(data.get('name')  ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const note  = String(data.get('note')  ?? '').trim();

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
          serviceId:   selectedServiceId || null,
          masterId:    selectedMasterId  || null,
        }),
      });

      if (res.status === 409) {
        await fetchSlots(selectedDate, selectedMasterId, selectedServiceId);
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

      const selectedService = services.find(s => s.id === selectedServiceId);
      const selectedMaster  = masters.find(m => m.id === selectedMasterId);
      const serviceLine = selectedService ? `✂️ ${selectedService.nameKey}` : '';
      const barberLine  = selectedMaster  ? `💈 ${selectedMaster.name}`     : '';
      const noteLine    = note            ? `💬 ${note}`                     : '';
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
      setSelectedServiceId('');
      setSelectedMasterId('');
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
                <select
                  name="service"
                  required
                  className="booking__select"
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    if (selectedDate) void fetchSlots(selectedDate, selectedMasterId, e.target.value);
                  }}
                >
                  <option value="">{dataLoading ? t('loading') : t('servicePlaceholder')}</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.nameKey}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="booking__label">{t('barberLabel')}</label>
                <select
                  name="barber"
                  className="booking__select"
                  onChange={(e) => {
                    const masterId = e.target.value;
                    setSelectedMasterId(masterId);
                    if (selectedDate) void fetchSlots(selectedDate, masterId, selectedServiceId);
                  }}
                >
                  <option value="">{dataLoading ? t('loading') : t('barberAny')}</option>
                  {masters.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
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
