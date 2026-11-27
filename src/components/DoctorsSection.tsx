import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DoctorItem } from '../types/clinic.ts';
import { SafeImage } from './SafeImage.tsx';

interface DoctorsSectionProps {
  doctors: DoctorItem[];
  onSelectDoctorForBooking: (doctorName: string) => void;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  doctors,
  onSelectDoctorForBooking,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;
    const distance = Math.min(container.clientWidth * 0.8, 380) * dir;
    container.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <section
      id="doctors"
      className="relative py-16 md:py-24 bg-white border-b border-sky-100"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#0284C7] mb-2">
              Команда зубных фей и волшебников
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-[#132347]">
              Добрые детские стоматологи
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="w-11 h-11 rounded-2xl border-2 border-sky-200 bg-white text-[#1D4ED8] flex items-center justify-center hover:border-[#1D4ED8] transition-colors cursor-pointer shadow-xs"
              aria-label="Предыдущий врач"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="w-11 h-11 rounded-2xl border-2 border-sky-200 bg-white text-[#1D4ED8] flex items-center justify-center hover:border-[#1D4ED8] transition-colors cursor-pointer shadow-xs"
              aria-label="Следующий врач"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-4"
        >
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="group snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[calc(33.333%-16px)] flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[3/4] rounded-3xl bg-sky-50 border-2 border-sky-200 overflow-hidden card-elevated">
                  <SafeImage
                    src={doctor.image}
                    alt={`${doctor.name} — ${doctor.role}`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#102A6B] via-[#102A6B]/65 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-[11px] font-extrabold text-[#FBBF24] flex items-center gap-2">
                      <span>{doctor.specialtyTag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums text-white">{doctor.experience}</span>
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      {doctor.name}
                    </h3>
                    <p className="text-xs text-sky-100">{doctor.role}</p>
                  </div>
                </div>

                <div className="pt-4 px-1">
                  <p className="text-xs font-bold text-[#0284C7] leading-relaxed">
                    {doctor.education}
                  </p>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                    {doctor.bio}
                  </p>
                </div>
              </div>

              <div className="pt-4 px-1">
                <button
                  type="button"
                  onClick={() => onSelectDoctorForBooking(doctor.name)}
                  className="w-full min-h-[46px] rounded-2xl border-2 border-[#1D4ED8] bg-white text-[#1D4ED8] text-sm font-extrabold hover:bg-[#1D4ED8] hover:text-white transition-colors cursor-pointer"
                >
                  Записаться к врачу
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
