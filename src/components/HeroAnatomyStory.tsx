import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Phone } from 'lucide-react';
import type { ClinicSettings } from '../types/clinic.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeroAnatomyStoryProps {
  settings: ClinicSettings;
  activeLayer: number;
  onHighlightLayer: (idx: number) => void;
  onBookClick: () => void;
  onOpenChat: () => void;
}

const ANATOMY_LAYERS = [
  {
    index: '01',
    badgeClass: 'bg-[#38BDF8] text-[#132347]',
    activeClass: 'bg-white/15 border-[#38BDF8]',
    spec: 'Самый крепкий щит зубика',
    title: 'Сияющая детская эмаль',
    desc: 'Природная броня защищает молочный и постоянный зуб от микробов. Мы укрепляем её вкусными минеральными гелями и герметиками.',
  },
  {
    index: '02',
    badgeClass: 'bg-[#FBBF24] text-[#132347]',
    activeClass: 'bg-white/15 border-[#FBBF24]',
    spec: 'Тёплая упругая подушечка',
    title: 'Мягкий слой дентина',
    desc: 'У детей дентин нежнее, чем у взрослых, поэтому важно находить кариес на самой ранней стадии и лечить бережно под увеличением.',
  },
  {
    index: '03',
    badgeClass: 'bg-[#FB7185] text-[#132347]',
    activeClass: 'bg-white/15 border-[#FB7185]',
    spec: 'Живое сердечко внутри зуба',
    title: 'Пульпа и питание зубика',
    desc: 'Отвечает за рост и здоровье зуба. Наши детские врачи бережно сохраняют живую пульпу даже при глубоком кариесе без боли.',
  },
  {
    index: '04',
    badgeClass: 'bg-[#34D399] text-[#132347]',
    activeClass: 'bg-white/15 border-[#34D399]',
    spec: 'Финишная защита и правильный прикус',
    title: 'Детская коронка и здоровый корешок',
    desc: 'Если молочный зуб сильно разрушен, ставим лёгкий защитный колпачок, чтобы зуб достоял до смены, а постоянный вырос ровным.',
  },
];

const TRUST_FACTS = [
  {
    metric: '0%',
    unit: 'слёз',
    unitColor: 'text-[#FBBF24]',
    label: 'Игровая адаптация',
    detail: 'Знакомимся с кабинетом в игре, без принуждения и удержания',
  },
  {
    metric: '10+',
    unit: 'лет',
    unitColor: 'text-[#34D399]',
    label: 'Добрые детские врачи',
    detail: 'Специалисты по детской психологии и бережному лечению',
  },
  {
    metric: '100%',
    unit: 'мультики',
    unitColor: 'text-[#38BDF8]',
    label: 'Кинотеатр на потолке',
    detail: 'Любимые мультфильмы во время всего приёма прямо над креслом',
  },
  {
    metric: '1',
    unit: 'подарок',
    unitColor: 'text-[#FB7185]',
    label: 'Волшебный сундучок',
    detail: 'Каждый маленький герой выбирает игрушку после визита',
  },
];

const KIDS_HIGHLIGHTS = [
  'Мультики на потолке',
  'Игровая с горкой',
  'Сладкая заморозка',
  'Подарок из сундучка',
];

export const HeroAnatomyStory: React.FC<HeroAnatomyStoryProps> = ({
  settings,
  activeLayer,
  onHighlightLayer,
  onBookClick,
  onOpenChat,
}) => {
  const [pinnedLayer, setPinnedLayer] = useState<number>(-1);

  const handleLayerEnter = (idx: number) => {
    onHighlightLayer(idx);
  };

  const handleLayerLeave = () => {
    onHighlightLayer(pinnedLayer);
  };

  const handleLayerClick = (idx: number) => {
    const next = pinnedLayer === idx ? -1 : idx;
    setPinnedLayer(next);
    onHighlightLayer(next);
  };

  return (
    <section id="top" className="relative bg-white">
      {/* Mobile Open 3D Stage Window */}
      <div className="lg:hidden h-[36dvh] min-h-[240px] w-full pointer-events-none" aria-hidden="true" />

      {/* BLOCK 1: Cheerful Pediatric Hero Proposition */}
      <div className="relative z-10 lg:min-h-[calc(100vh-5rem)] flex items-center pt-2 pb-16 lg:py-16">
        {/* Desktop Cheerful Playful Orbit framing the 3D Tooth on right */}
        <div
          className="hidden lg:flex absolute inset-y-0 right-0 w-[48%] items-center justify-center pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="relative w-[460px] h-[460px] rounded-full border-2 border-sky-200/80 flex items-center justify-center">
            <div className="w-[360px] h-[360px] rounded-full border-2 border-dashed border-[#F59E0B]/45 flex items-center justify-center">
              <div className="w-[240px] h-[240px] rounded-full border border-emerald-200/80" />
            </div>
            <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-white text-[11px] font-extrabold tracking-wide text-[#0284C7] border border-sky-200">
              Волшебный 3D-зубик · 0% боли
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 relative">
          <div className="lg:w-[54%] space-y-6 bg-white/95 lg:bg-transparent rounded-2xl p-5 sm:p-6 lg:p-0 border border-sky-100 lg:border-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-wide uppercase text-[#0284C7]">
              <span>{settings.name}</span>
              <span className="text-amber-400" aria-hidden="true">·</span>
              <span className="text-[#059669]">{settings.city}</span>
              <span className="text-amber-400" aria-hidden="true">·</span>
              <span className="text-[#132347] font-semibold normal-case tracking-normal">{settings.hours}</span>
            </div>

            <h1 className="font-display text-[28px] sm:text-[42px] lg:text-[48px] font-black leading-[1.1] tracking-[-0.02em] text-[#132347]">
              {settings.heroTitle}
            </h1>

            <p className="text-[15px] sm:text-base lg:text-[17px] leading-[1.68] text-slate-700 max-w-xl">
              {settings.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onBookClick}
                className="touch-ripple inline-flex items-center justify-center gap-2.5 min-h-[54px] px-7 py-3.5 rounded-2xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold shadow-[0_14px_30px_-8px_rgba(245,158,11,0.48)] hover:bg-[#FDE047] active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Записать ребёнка</span>
                <ArrowRight className="w-4 h-4 text-[#132347]" />
              </button>

              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center justify-center gap-2 min-h-[54px] px-6 py-3.5 rounded-2xl border-2 border-[#1D4ED8] bg-white text-[#1D4ED8] text-sm font-extrabold hover:bg-[#1D4ED8] hover:text-white active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Спросить детского помощника
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-700">
              <a
                href={settings.phoneHref}
                className="inline-flex items-center gap-2 font-extrabold text-[#1D4ED8] hover:text-[#0284C7] transition-colors min-h-[40px]"
              >
                <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="tabular-nums">{settings.phone}</span>
              </a>
              <PWAInstallButton variant="light" />
              <a
                href="#anatomy-layers"
                className="hidden lg:inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#1D4ED8] transition-colors"
              >
                <span>Листайте — заглянем внутрь зубика в 3D</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#0284C7]" />
              </a>
            </div>

            {/* Cheerful Pediatric Highlights Strip */}
            <div className="pt-4 border-t border-sky-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#0284C7]">
              {KIDS_HIGHLIGHTS.map((item) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Vibrant Royal Cobalt-Sky Interactive Tooth Explorer */}
      <div
        id="anatomy-layers"
        className="relative z-10 py-16 lg:py-24 border-t border-sky-100"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10">
          <div className="lg:w-[50%] bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0369A1] text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky-300/30 card-dark-elevated">
            <div className="mb-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-2">
                Играем и узнаём вместе с ребёнком
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-white leading-tight">
                Что внутри здорового зубика?
              </h2>
              <p className="mt-3 text-sm text-sky-100 leading-relaxed">
                Нажимайте на любой слой — 3D-зубик справа раскроется и подсветит нужную часть, чтобы малышу было интересно и не страшно.
              </p>
            </div>

            <div className="space-y-3">
              {ANATOMY_LAYERS.map((layer, idx) => {
                const isActive = activeLayer === idx;
                return (
                  <button
                    key={layer.index}
                    type="button"
                    onMouseEnter={() => handleLayerEnter(idx)}
                    onMouseLeave={handleLayerLeave}
                    onFocus={() => handleLayerEnter(idx)}
                    onBlur={handleLayerLeave}
                    onClick={() => handleLayerClick(idx)}
                    aria-pressed={pinnedLayer === idx}
                    className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isActive
                        ? `${layer.activeClass} translate-x-1 shadow-lg`
                        : 'bg-white/10 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold tabular-nums shrink-0 shadow-sm ${layer.badgeClass}`}
                    >
                      {layer.index}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#FEF08A]">{layer.spec}</p>
                      <h3 className="mt-0.5 text-base sm:text-lg font-extrabold text-white">
                        {layer.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-sky-100">
                        {layer.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 3: Vibrant Multi-Accent Kids Trust Band */}
      <div className="relative z-10 py-14 lg:py-20 bg-gradient-to-r from-[#173B8F] via-[#0284C7] to-[#0F766E] text-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-2">
                Стандарты заботы о малышах
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] text-white">
                Почему дети любят ходить к нам
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 max-w-sm">
              Тёплая игровая атмосфера, адаптированные детские материалы и внимательные врачи рядом на каждом шаге.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/25 rounded-3xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-white/20 bg-white/10">
            {TRUST_FACTS.map((fact) => (
              <div key={fact.label} className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5 font-display text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums">
                    <span>{fact.metric}</span>
                    <span className={`text-lg sm:text-xl font-extrabold ${fact.unitColor}`}>
                      {fact.unit}
                    </span>
                  </div>
                  <div className="mt-2.5 text-sm font-extrabold text-white">
                    {fact.label}
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-sky-100">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
