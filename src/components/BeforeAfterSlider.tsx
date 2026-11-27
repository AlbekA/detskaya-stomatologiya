import React, { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import type { BeforeAfterCase } from '../types/clinic.ts';
import { SafeImage } from './SafeImage.tsx';

interface BeforeAfterSliderProps {
  cases: BeforeAfterCase[];
  onBookSimilar: (caseTitle: string) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  cases,
  onBookSimilar,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [splitPercent, setSplitPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const activeCase = cases[selectedIdx] ?? cases[0];

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPercent(Math.max(4, Math.min(96, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  if (!activeCase) return null;

  return (
    <section
      id="cases"
      className="relative py-16 md:py-24 bg-white border-b border-sky-100"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#059669] mb-2">
              Истории счастливых улыбок
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-[#132347]">
              Как малыши становятся храбрыми героями
            </h2>
          </div>

          {cases.length > 1 && (
            <div className="flex items-center gap-1.5 p-1.5 bg-sky-50 border border-sky-200 rounded-2xl overflow-x-auto no-scrollbar">
              {cases.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(idx);
                    setSplitPercent(50);
                  }}
                  className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    idx === selectedIdx
                      ? 'bg-[#1D4ED8] text-white shadow-sm'
                      : 'text-[#132347] hover:bg-white'
                  }`}
                >
                  История 0{idx + 1}: {item.category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-2.5 bg-gradient-to-br from-[#1D4ED8] to-[#0284C7] card-elevated">
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-sky-100 select-none cursor-ew-resize"
                style={{ touchAction: 'none' }}
                role="region"
                aria-label="Интерактивное сравнение До и После"
              >
                <SafeImage
                  src={activeCase.afterImage}
                  alt={`${activeCase.title} — После`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                    WebkitClipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                  }}
                >
                  <SafeImage
                    src={activeCase.beforeImage}
                    alt={`${activeCase.title} — Знакомство`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#1D4ED8]/90 text-white text-xs font-bold pointer-events-none">
                  В гостях у клиники
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-[#FBBF24] text-[#132347] text-xs font-extrabold pointer-events-none">
                  Счастливая улыбка
                </div>

                <div
                  className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_14px_rgba(19,35,71,0.45)] pointer-events-none"
                  style={{ left: `${splitPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FBBF24] text-[#132347] border-2 border-white shadow-xl flex items-center justify-center">
                    <MoveHorizontal className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-600">
                Потяните бегунок влево или вправо
              </span>
              <input
                type="range"
                min={4}
                max={96}
                value={Math.round(splitPercent)}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                aria-label="Сравнение в процентах"
                className="w-32 accent-[#1D4ED8] cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0284C7] text-white p-6 sm:p-8 card-dark-elevated">
              <div>
                <div className="text-xs text-sky-100 flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-[#FBBF24]">{activeCase.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold text-white">{activeCase.duration}</span>
                </div>

                <h3 className="mt-3 font-display text-xl sm:text-2xl font-extrabold tracking-[-0.015em] text-white leading-snug">
                  {activeCase.title}
                </h3>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-sky-50">
                  {activeCase.description}
                </p>

                <div className="mt-6 pt-5 border-t border-white/20">
                  <p className="text-xs text-sky-200">Детский врач</p>
                  <p className="mt-1 text-sm font-extrabold text-white">
                    {activeCase.doctor}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onBookSimilar(activeCase.title)}
                  className="w-full min-h-[48px] rounded-2xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold hover:bg-[#FDE047] transition-colors cursor-pointer"
                >
                  Записаться на адаптацию
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
