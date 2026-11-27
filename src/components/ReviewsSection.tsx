import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { ReviewItem } from '../types/clinic.ts';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const featured = reviews[0];
  const secondary = reviews.slice(1);

  const scrollReviews = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.min(el.clientWidth * 0.85, 420) * dir, behavior: 'smooth' });
  };

  return (
    <section
      id="reviews"
      className="relative py-16 md:py-24 bg-white border-b border-sky-100"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#E11D48] mb-2">
              Отзывы мам, пап и маленьких пациентов
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-[#132347]">
              Почему родители рекомендуют нас друзьям
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollReviews(-1)}
              className="w-11 h-11 rounded-2xl border-2 border-sky-200 bg-white text-[#1D4ED8] flex items-center justify-center hover:border-[#1D4ED8] transition-colors cursor-pointer shadow-xs"
              aria-label="Предыдущий отзыв"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollReviews(1)}
              className="w-11 h-11 rounded-2xl border-2 border-sky-200 bg-white text-[#1D4ED8] flex items-center justify-center hover:border-[#1D4ED8] transition-colors cursor-pointer shadow-xs"
              aria-label="Следующий отзыв"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Parent Quote — Vibrant Royal Sky-Teal Card */}
        {featured && (
          <div className="mb-10 lg:mb-12 rounded-3xl bg-gradient-to-br from-[#1D4ED8] via-[#0284C7] to-[#0D9488] text-white p-7 sm:p-10 lg:p-12 card-dark-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-1.5 text-[#FBBF24] mb-4" aria-label={`Оценка ${featured.rating} из 5`}>
                  {Array.from({ length: featured.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-sky-100">
                    {featured.service}
                  </span>
                </div>
                <blockquote className="text-lg sm:text-2xl lg:text-[26px] font-bold leading-[1.4] text-white">
                  «{featured.outcomeText}»
                </blockquote>
              </div>
              <div className="lg:col-span-4 lg:border-l lg:border-white/25 lg:pl-8 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24]">
                  С чем пришли
                </p>
                <p className="text-sm text-sky-50">{featured.beforeNote}</p>
                <div className="pt-3">
                  <p className="font-display text-base font-extrabold text-white">
                    {featured.patientName}
                  </p>
                  <p className="text-xs text-sky-200">{featured.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crisp Bright Quote Stream */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-4"
        >
          {(secondary.length > 0 ? secondary : reviews).map((review, idx) => (
            <div
              key={review.id}
              className="snap-start shrink-0 w-[86%] sm:w-[60%] lg:w-[calc(33.333%-16px)]"
            >
              <article
                className={`h-full rounded-3xl border-2 bg-white p-6 flex flex-col justify-between card-elevated ${
                  idx % 2 === 0 ? 'border-sky-200' : 'border-emerald-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-1 text-[#F59E0B]"
                      aria-label={`Оценка ${review.rating} из 5`}
                    >
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{review.date}</span>
                  </div>

                  <p className="mt-4 text-xs font-bold text-[#0284C7]">
                    Ситуация: {review.beforeNote}
                  </p>

                  <blockquote className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#132347] font-medium">
                    «{review.outcomeText}»
                  </blockquote>
                </div>

                <div className="mt-6 pt-4 border-t border-sky-100">
                  <p className="font-extrabold text-sm text-[#132347]">
                    {review.patientName}
                  </p>
                  <p className="text-xs font-bold text-[#059669] mt-0.5">
                    {review.service}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
