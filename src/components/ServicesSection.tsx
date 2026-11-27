import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ChevronDown, X } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '../types/clinic.ts';
import { SafeImage } from './SafeImage.tsx';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceForBooking: (serviceTitle: string) => void;
}

const CATEGORIES: Array<'Все' | ServiceCategory> = [
  'Все',
  'Профилактика',
  'Лечение',
  'Прикус',
  'Во сне',
];

const CARD_ACCENTS = [
  'text-[#0284C7]',
  'text-[#059669]',
  'text-[#D97706]',
  'text-[#E11D48]',
  'text-[#7C3AED]',
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<'Все' | ServiceCategory>('Все');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(services[0]?.id ?? null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filtered =
    activeCategory === 'Все'
      ? services
      : services.filter((s) => s.category === activeCategory);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((s) => s.id === expandedMobileId)) {
      setExpandedMobileId(filtered[0].id);
    }
  }, [activeCategory, filtered, expandedMobileId]);

  useEffect(() => {
    if (!selectedService) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedService(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedService]);

  const flagship = filtered[0];
  const restServices = filtered.slice(1);

  return (
    <section
      id="services"
      className="relative py-16 md:py-28 bg-white border-b border-sky-100"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#0284C7] mb-2">
              Направления и понятные цены
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-[#132347]">
              Забота о молочных и постоянных зубках
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-sky-50 border border-sky-200 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1D4ED8] text-white shadow-sm'
                      : 'text-[#132347] hover:bg-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Asymmetric Showcase: Left 4-col Breathing Zone for Floating 3D Tooth + Right 8-col Bento */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 hidden lg:flex flex-col justify-between min-h-[520px] pt-2 pointer-events-none">
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/90 p-5 max-w-[260px] space-y-2 shadow-xs">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#0284C7]">
                Игровая 3D-экскурсия
              </p>
              <p className="text-sm text-[#132347] leading-relaxed">
                Слева зуб раскрывается по слоям, чтобы ребёнок увидел, как работает защитная эмаль и «сердечко» зубика.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Flagship Horizontal Split Feature Card */}
            {flagship && (
              <motion.article
                key={flagship.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredId(flagship.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedService(flagship)}
                className="group rounded-3xl border-2 border-sky-200 bg-white overflow-hidden grid grid-cols-12 cursor-pointer card-elevated card-elevated-hover hover:border-[#0284C7]"
              >
                <div className="col-span-6 relative min-h-[290px] overflow-hidden bg-sky-50">
                  <SafeImage
                    src={flagship.beforeImage}
                    alt={`${flagship.title} — в клинике`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      hoveredId === flagship.id ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <SafeImage
                    src={flagship.afterImage}
                    alt={`${flagship.title} — счастливая улыбка`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                      hoveredId === flagship.id ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#132347]/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-bold">
                    <span>{hoveredId === flagship.id ? 'Счастливый результат' : 'Наведите для просмотра'}</span>
                    <span className="tabular-nums text-[#FBBF24]">{flagship.duration}</span>
                  </div>
                </div>

                <div className="col-span-6 p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-extrabold text-[#D97706]">Хит для малышей · 01</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold">{flagship.category}</span>
                    </div>
                    <h3 className="mt-2.5 text-2xl font-extrabold text-[#132347] group-hover:text-[#1D4ED8] transition-colors">
                      {flagship.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {flagship.shortDesc}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-sky-100 flex items-center justify-between">
                    <span className="font-display text-lg font-black text-[#1D4ED8] tabular-nums">
                      {flagship.price}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#132347] group-hover:text-[#0284C7]">
                      <span>Подробнее</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Compact Playful Cards Grid */}
            {restServices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {restServices.map((service, idx) => {
                  const isHovered = hoveredId === service.id;
                  const accentText = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                  return (
                    <motion.article
                      key={service.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      onMouseEnter={() => setHoveredId(service.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedService(service)}
                      className="group rounded-3xl border border-sky-200 bg-white p-5 flex flex-col justify-between cursor-pointer card-elevated card-elevated-hover hover:border-[#0284C7]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className={`font-extrabold ${accentText}`}>0{idx + 2}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold">{service.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{service.duration}</span>
                          </div>
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-sky-50 border border-sky-200 shrink-0 relative">
                            <SafeImage
                              src={isHovered ? service.afterImage : service.beforeImage}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <h3 className="mt-3 text-lg font-extrabold text-[#132347] group-hover:text-[#1D4ED8] transition-colors">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700">
                          {service.shortDesc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                        <span className="text-sm font-black text-[#1D4ED8] tabular-nums">
                          {service.price}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-[#0284C7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Crisp Accordion */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.map((service, idx) => {
            const isOpen = expandedMobileId === service.id;
            const accentText = CARD_ACCENTS[idx % CARD_ACCENTS.length];
            return (
              <div
                key={service.id}
                className="rounded-2xl border border-sky-200 bg-white overflow-hidden card-elevated"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMobileId(isOpen ? null : service.id)}
                  className="w-full px-4 py-4 min-h-[60px] flex items-center justify-between gap-3 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className={`font-extrabold ${accentText}`}>0{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-extrabold text-[#1D4ED8] tabular-nums">{service.price}</span>
                    </div>
                    <h3 className="mt-1 text-base font-extrabold text-[#132347] truncate">
                      {service.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0284C7] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-2 border-t border-sky-100 space-y-4">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-sky-50">
                      <SafeImage
                        src={service.afterImage}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {service.fullDesc}
                    </p>
                    <p className="text-xs font-bold text-[#059669]">
                      Результат: {service.outcome}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectServiceForBooking(service.title)}
                        className="flex-1 min-h-[44px] rounded-xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold cursor-pointer"
                      >
                        Записаться
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className="min-h-[44px] px-4 rounded-xl border border-[#1D4ED8] bg-white text-xs font-bold text-[#1D4ED8] cursor-pointer"
                      >
                        Детали
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          onClick={() => setSelectedService(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#132347]/65 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white border border-sky-200 overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col"
          >
            <div className="relative aspect-[16/9] bg-sky-50 shrink-0">
              <SafeImage
                src={selectedService.afterImage}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-[#1D4ED8]/90 text-white flex items-center justify-center hover:bg-[#1D4ED8] cursor-pointer"
                aria-label="Закрыть окно услуги"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-extrabold text-[#0284C7]">{selectedService.category}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{selectedService.duration}</span>
                <span aria-hidden="true">·</span>
                <span className="font-black text-[#1D4ED8] tabular-nums">{selectedService.price}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#132347]">
                {selectedService.title}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                {selectedService.fullDesc}
              </p>
              <div className="rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24]">
                  Что получит ребёнок
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedService.outcome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const title = selectedService.title;
                  setSelectedService(null);
                  onSelectServiceForBooking(title);
                }}
                className="w-full min-h-[48px] rounded-2xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold hover:bg-[#FDE047] transition-colors cursor-pointer"
              >
                Записаться на «{selectedService.title}»
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
