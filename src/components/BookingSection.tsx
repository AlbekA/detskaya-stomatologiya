import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Gift, ShieldCheck } from 'lucide-react';
import type { DoctorItem, ServiceItem } from '../types/clinic.ts';

interface BookingSectionProps {
  services: ServiceItem[];
  doctors: DoctorItem[];
  prefilledService?: string;
  prefilledDoctor?: string;
  bookingTrigger?: number;
}

function formatRussianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  let clean = digits;
  if (clean.startsWith('8') || clean.startsWith('7')) {
    clean = clean.slice(1);
  }
  clean = clean.slice(0, 10);
  let out = '+7';
  if (clean.length > 0) out += ` (${clean.slice(0, 3)}`;
  if (clean.length >= 3) out += ')';
  if (clean.length > 3) out += ` ${clean.slice(3, 6)}`;
  if (clean.length > 6) out += `-${clean.slice(6, 8)}`;
  if (clean.length > 8) out += `-${clean.slice(8, 10)}`;
  return out;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  services,
  doctors,
  prefilledService,
  prefilledDoctor,
  bookingTrigger = 0,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(prefilledService || services[0]?.title || 'Первый визит-знакомство и адаптация');
  const [doctor, setDoctor] = useState(prefilledDoctor || 'Любой детский стоматолог');
  const [preferredDate, setPreferredDate] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const minDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (prefilledService) setService(prefilledService);
  }, [prefilledService]);

  useEffect(() => {
    if (prefilledDoctor) setDoctor(prefilledDoctor);
  }, [prefilledDoctor]);

  useEffect(() => {
    if (bookingTrigger > 0) {
      setSubmittedId(null);
      setError('');
    }
  }, [bookingTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Пожалуйста, укажите имя родителя и ребёнка.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) {
      setError('Пожалуйста, введите полный номер телефона (+7 ...).');
      return;
    }
    if (preferredDate && preferredDate < minDate) {
      setError('Пожалуйста, выберите сегодняшнюю или будущую дату визита.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          service,
          doctor,
          preferredDate,
          comment: comment.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; booking?: { id: string } };
      if (!res.ok) {
        setError(data.error || 'Не удалось отправить заявку. Попробуйте еще раз.');
      } else {
        setSubmittedId(data.booking?.id || 'ok');
        setName('');
        setPhone('');
        setPreferredDate('');
        setComment('');
      }
    } catch {
      setError('Сетевая ошибка при отправке заявки. Позвоните нам по телефону.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="booking"
      className="relative overflow-hidden py-16 md:py-28 bg-gradient-to-br from-[#1D4ED8] via-[#0284C7] to-[#0F766E] text-white"
    >
      <div
        className="absolute top-0 right-1/4 w-[480px] h-[480px] rounded-full opacity-35 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(251,191,36,0.38) 0%, rgba(52,211,153,0.22) 55%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-2">
                Запись онлайн за 30 секунд
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-white leading-[1.15]">
                Запишитесь на добрый приём без слёз
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-sky-50">
                Заботливый администратор позвонит через 10 минут, подберёт удобное окошко, узнает любимый мультик ребёнка и закажет пропуск на парковку.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-white/40 bg-white text-[#132347] p-6 sm:p-8 shadow-[0_28px_64px_-15px_rgba(19,35,71,0.45)]">
              {submittedId ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-[#132347]">
                    Заявка принята!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 max-w-md mx-auto">
                    Координатор клиники «Первая Детская Стоматология» скоро свяжется с вами, чтобы подтвердить время и подготовить подарок для юного гостя.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedId(null)}
                    className="mt-2 inline-flex items-center justify-center min-h-[44px] px-6 rounded-2xl border-2 border-[#1D4ED8] text-sm font-extrabold text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors cursor-pointer"
                  >
                    Записать ещё одного ребёнка
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking-name" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Имя родителя и возраст ребёнка *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например, Анна (Миша, 5 лет)"
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      />
                    </div>

                    <div>
                      <label htmlFor="booking-phone" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Телефон родителя *
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatRussianPhone(e.target.value))}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] placeholder:text-slate-400 tabular-nums focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking-service" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Повод обращения
                      </label>
                      <select
                        id="booking-service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      >
                        <option value="Первый визит-знакомство и адаптация">Первый визит-знакомство и адаптация</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="booking-doctor" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Детский врач
                      </label>
                      <select
                        id="booking-doctor"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      >
                        <option value="Любой детский стоматолог">Любой детский стоматолог</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking-date" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Удобная дата
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        min={minDate}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] tabular-nums focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-comment" className="block text-xs font-extrabold text-[#132347] mb-1.5">
                        Любимый мультик или пожелания
                      </label>
                      <input
                        id="booking-comment"
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Например, «Три кота» и время после 16:00"
                        className="w-full min-h-[46px] px-4 rounded-xl border border-sky-200 bg-white text-sm text-[#132347] placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] shadow-xs"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs sm:text-sm text-rose-800"
                    >
                      {error}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="touch-ripple min-h-[50px] px-8 py-3 rounded-2xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold hover:bg-[#FDE047] disabled:opacity-60 active:scale-[0.98] transition-all cursor-pointer shadow-[0_12px_28px_-10px_rgba(245,158,11,0.45)]"
                    >
                      {submitting ? 'Отправка заявки...' : 'Записать ребёнка'}
                    </button>
                    <p className="text-[11px] text-slate-600 leading-snug sm:max-w-[230px]">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end lg:min-h-[540px] space-y-4">
            <div className="rounded-3xl border border-white/25 bg-[#102A6B]/70 backdrop-blur-xs p-5 flex items-start gap-3.5 card-dark-elevated">
              <Clock className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-white">Игровая и приём без очередей</p>
                <p className="mt-1 text-xs sm:text-sm text-sky-100 leading-relaxed">
                  Приходите на 10 минут раньше, чтобы малыш успел скатиться с горки и познакомиться с администратором.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/25 bg-[#102A6B]/70 backdrop-blur-xs p-5 flex items-start gap-3.5 card-dark-elevated">
              <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-white">Бережная адаптация без слёз</p>
                <p className="mt-1 text-xs sm:text-sm text-sky-100 leading-relaxed">
                  Никакого удержания — врач сначала подружится с ребёнком и покажет всё в игре.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/25 bg-[#102A6B]/70 backdrop-blur-xs p-5 flex items-start gap-3.5 card-dark-elevated">
              <Gift className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-white">Сюрприз после каждого визита</p>
                <p className="mt-1 text-xs sm:text-sm text-sky-100 leading-relaxed">
                  Игрушка из волшебного сундучка и именной диплом храброго улыбающегося героя.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
