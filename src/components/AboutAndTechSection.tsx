import React from 'react';
import { motion } from 'motion/react';
import { Eye, ScanLine, Smile, Tv } from 'lucide-react';
import type { ClinicSettings } from '../types/clinic.ts';
import { SafeImage } from './SafeImage.tsx';

interface AboutAndTechSectionProps {
  settings: ClinicSettings;
}

const TECHNOLOGIES = [
  {
    icon: Tv,
    accent: 'bg-[#FBBF24] text-[#132347]',
    name: 'Кинотеатр с мультиками над креслом',
    spec: 'Любимые серии на потолочном экране',
    desc: 'Ребёнок смотрит «Синий трактор», «Три кота» или любимый мультфильм, пока доктор бережно заботится о зубках.',
  },
  {
    icon: ScanLine,
    accent: 'bg-[#38BDF8] text-[#132347]',
    name: 'Волшебная 3D-камера 3Shape TRIOS',
    spec: 'Цифровой скан без неприятных слепков',
    desc: 'Никакого пластилина во рту и рвотного рефлекса — камера быстро фотографирует зубки и показывает 3D-мультик на экране.',
  },
  {
    icon: Smile,
    accent: 'bg-[#34D399] text-[#132347]',
    name: 'Сладкая заморозка STA и маска ЗАКС',
    spec: 'Клубничный аромат и 0% боли',
    desc: 'Вкусный гель на десну перед компьютерной анестезией или расслабляющий кислородно-азотный коктейль полностью убирают волнение.',
  },
  {
    icon: Eye,
    accent: 'bg-[#FB7185] text-white',
    name: 'Детский микроскоп и мягкая гигиена',
    spec: 'Сохраняем максимум своих тканей зуба',
    desc: 'Многократное увеличение позволяет лечить кариес точечно и быстро, чтобы молочные зубы прослужили до самой смены.',
  },
];

export const AboutAndTechSection: React.FC<AboutAndTechSectionProps> = ({ settings }) => {
  return (
    <>
      {/* About & Play Lounge Spread */}
      <section
        id="about"
        className="relative py-16 md:py-24 bg-white border-b border-sky-100"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative pb-6 sm:pb-8"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-sky-200 bg-sky-50 aspect-[4/3] sm:aspect-[5/4] card-elevated">
                <SafeImage
                  src="/src/assets/images/kids_clinic_playroom_1795779157263.jpg"
                  alt="Игровая комната с деревянной горкой в клинике Первая Детская Стоматология"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Real Uploaded Clinic Signboard & Brand Logo Inset */}
              <div className="sm:absolute sm:bottom-0 sm:right-6 mt-4 sm:mt-0 rounded-2xl bg-white text-[#132347] border-2 border-sky-200 p-3 sm:w-[250px] shadow-[0_20px_44px_-12px_rgba(29,78,216,0.38)]">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-sky-100 bg-white">
                  <SafeImage
                    src="/assets/aistudio/photo_2026-11-27_15-18-34_550293ec.jpg"
                    alt="Логотип и вывеска клиники Первая Детская Стоматология"
                    className="w-full h-full object-cover object-[42%_14%]"
                  />
                </div>
                <p className="mt-2.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1D4ED8]">
                  Фирменный вход клиники
                </p>
                <p className="mt-0.5 font-display text-sm font-extrabold text-[#132347] leading-snug">
                  {settings.name} · Игровая зона с горкой
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#059669] mb-2">
                Пространство детства и доверия
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black text-[#132347] leading-[1.15] tracking-[-0.02em]">
                {settings.aboutTitle}
              </h2>
              <p className="mt-5 text-[15px] sm:text-base leading-[1.72] text-slate-700">
                {settings.aboutText}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/55 p-5">
                  <div className="text-lg font-extrabold text-[#1D4ED8]">
                    Подарок каждому ребёнку
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700">
                    Волшебный сундучок с игрушками, наклейками и дипломами храбрости
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5">
                  <div className="text-lg font-extrabold text-[#B45309]">
                    Уют для мамы и папы
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700">
                    Свежий кофе, комната пробуждения рядом и пропуск на паркинг
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies: Bright Royal Blue & Sky Pediatric Tech Stage */}
      <section
        id="tech"
        className="relative overflow-hidden py-16 md:py-28 bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0E7490] text-white"
      >
        <div
          className="absolute -top-24 right-1/4 w-[520px] h-[520px] rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(56,189,248,0.28) 55%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-2">
                  Технологии без страха и слёз
                </p>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black text-white leading-[1.15] tracking-[-0.02em]">
                  Оборудование, которое помогает дружить с детьми
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-sky-100 max-w-2xl">
                  Никаких пугающих звуков и неприятных ощущений — всё лечение проходит быстро, нежно и под любимые мультфильмы.
                </p>
              </div>

              <div className="space-y-3">
                {TECHNOLOGIES.map((tech, idx) => {
                  const Icon = tech.icon;
                  return (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-2xl border border-white/20 bg-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/15 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${tech.accent}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#FEF08A] font-extrabold">
                          <span>{tech.spec}</span>
                        </div>
                        <h3 className="mt-0.5 text-lg font-extrabold text-white">
                          {tech.name}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-sky-100">
                          {tech.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-end lg:min-h-[600px]">
              <div className="rounded-3xl overflow-hidden border-2 border-white/30 aspect-[16/10] bg-sky-900 card-dark-elevated">
                <SafeImage
                  src="/src/assets/images/kids_dentist_room_1795779157990.jpg"
                  alt="Яркий детский стоматологический кабинет с экраном для мультиков на потолке"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-xs font-medium text-sky-100">
                Светлые детские кабинеты с потолочным экраном для мультфильмов и нежной подсветкой
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
