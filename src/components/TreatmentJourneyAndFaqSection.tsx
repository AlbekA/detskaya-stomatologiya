import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

interface TreatmentJourneyAndFaqSectionProps {
  onBookClick: () => void;
  onOpenChat: () => void;
}

const TREATMENT_STEPS = [
  {
    step: '01',
    title: 'Знакомство в игровой и 3D-сканер',
    duration: 'Первые 15 мин',
    comfort: 'Деревянная горка, раскраски и знакомство с врачом в игре',
    summary:
      'Вместо ожидания в больничном коридоре малыш играет в светлом холле, а потом знакомится с «волшебной камерой», которая делает 3D-фото зубок на экран без неприятных слепков.',
    deliverable: 'Тёплая дружба с доктором и 3D-снимок на экране',
  },
  {
    step: '02',
    title: 'Понятный план для мамы и папы',
    duration: 'В день визита',
    comfort: 'Честная смета без скрытых доплат',
    summary:
      'Детский стоматолог показывает родителям каждый зубик на большом экране, объясняет, где нужна профилактика, а где лечение, и фиксирует точную стоимость.',
    deliverable: 'Понятный маршрут лечения и точная цена',
  },
  {
    step: '03',
    title: 'Сладкая «заморозка» и мультик на потолке',
    duration: 'Подготовка · 5 мин',
    comfort: 'Ягодный гель перед уколом или маска с закисью азота',
    summary:
      'Ребёнок выбирает любимый мультфильм на экране над креслом. На десну наносим сладкое «варенье», чтобы малыш вообще не почувствовал компьютерную анестезию.',
    deliverable: 'Полный комфорт, улыбка и 0% слёз',
  },
  {
    step: '04',
    title: 'Бережное лечение с весёлым «пылесосиком»',
    duration: '25–40 мин',
    comfort: 'Цветная или белая пломбочка, мини-щётка-вертушка',
    summary:
      'Врач в игровой форме «прогоняет микробов» и ставит прочную красивую пломбу. Малыш может сам выбрать цвет пломбы на молочный зуб или идеально белый оттенок.',
    deliverable: 'Здоровый зубик, защищённый от кариеса',
  },
  {
    step: '05',
    title: 'Подарок из сундучка и диплом героя',
    duration: 'Финал визита',
    comfort: 'Игрушка, наклейки и вкусная зубная паста',
    summary:
      'После приёма ребёнок открывает волшебный сундучок с игрушками, получает грамоту за смелость и уходит домой в отличном настроении.',
    deliverable: 'Любимая игрушка и желание вернуться снова',
  },
];

type FaqCategory = 'Все' | 'Страх и адаптация' | 'Сон и заморозка' | 'Молочные зубки';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'Все'>;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-fear',
    category: 'Страх и адаптация',
    question: 'Что делать, если ребёнок уже боится стоматологов и плачет при входе в кабинет?',
    answer:
      'На первом визите мы никогда не лечим «через силу». Врач знакомится с малышом в игровой форме, даёт потрогать воздушную палочку-ветерок, катает на кресле и включает мультик. Обычно уже на втором визите дети сами открывают рот.',
  },
  {
    id: 'faq-milk-teeth',
    category: 'Молочные зубки',
    question: 'Зачем лечить молочные зубы, если они всё равно скоро выпадут?',
    answer:
      'Под каждым молочным зубом уже формируется зачаток постоянного. Невылеченный кариес может повредить постоянный зуб, вызвать боль, флюс и нарушить правильный прикус. Гораздо проще и быстрее вылечить кариес на раннем этапе.',
  },
  {
    id: 'faq-zaks',
    category: 'Сон и заморозка',
    question: 'Безопасна ли маска с закисью азота (ЗАКС) и лечение во сне (Севоран)?',
    answer:
      'Да, оба метода сертифицированы в детской стоматологии по всему миру. Закись азота с кислородом просто расслабляет ребёнка и полностью выветривается через 5 минут обычного дыхания. Севоран применяется при большом объёме лечения под контролем детского анестезиолога.',
  },
  {
    id: 'faq-age',
    category: 'Страх и адаптация',
    question: 'С какого возраста лучше приводить малыша на первый осмотр?',
    answer:
      'Оптимально — около 1 года, когда появились первые зубки, или сразу после знакомства с щёткой. Профилактические визиты каждые 4–6 месяцев позволяют привыкнуть к врачу и вырасти вообще без единого кариеса.',
  },
  {
    id: 'faq-fissures',
    category: 'Молочные зубки',
    question: 'Что такое герметизация фиссур и больно ли это ребёнку?',
    answer:
      'Это быстрая и абсолютно безболезненная процедура без сверления! Врач очищает жевательный зуб мягкой щёточкой и запечатывает глубокие бороздки жидким защитным герметиком, который не даёт застревать сладостям и снижает риск кариеса на 90%.',
  },
  {
    id: 'faq-price',
    category: 'Сон и заморозка',
    question: 'Можно ли оплатить лечение во сне или ортодонтию в рассрочку?',
    answer:
      'Да, для родителей доступна беспроцентная рассрочка 0% на срок до 12 месяцев и поэтапная оплата, а также пакет документов для оформления налогового вычета 13%.',
  },
];

export const TreatmentJourneyAndFaqSection: React.FC<TreatmentJourneyAndFaqSectionProps> = ({
  onBookClick,
  onOpenChat,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('Все');
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);

  const currentStep = TREATMENT_STEPS[activeStepIdx] ?? TREATMENT_STEPS[0];
  const visibleFaqs =
    faqCategory === 'Все' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === faqCategory);

  const handleCategoryChange = (cat: FaqCategory) => {
    setFaqCategory(cat);
    const nextList = cat === 'Все' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === cat);
    if (nextList.length > 0 && !nextList.some((item) => item.id === openFaqId)) {
      setOpenFaqId(nextList[0].id);
    }
  };

  return (
    <section id="journey" className="relative">
      {/* PART A: Vibrant Royal Sky-Blue 5-Step Child Visit Adventure */}
      <div className="relative py-16 md:py-24 bg-gradient-to-br from-[#1D4ED8] via-[#0284C7] to-[#0F766E] text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-2">
                Как проходит приём в клинике
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-black tracking-[-0.02em] text-white leading-tight">
                5 весёлых шагов от игровой горки до подарка
              </h2>
            </div>
            <p className="text-sm text-sky-100 max-w-md">
              Мы превратили визит к стоматологу в доброе приключение, где малыш чувствует себя главным героем.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Stepper Tabs */}
            <div className="lg:col-span-6 space-y-2.5">
              {TREATMENT_STEPS.map((item, idx) => {
                const active = idx === activeStepIdx;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`w-full text-left rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                      active
                        ? 'bg-white text-[#132347] border-white shadow-[0_18px_40px_-14px_rgba(19,35,71,0.38)]'
                        : 'bg-white/12 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className={`font-display text-sm font-black px-3 py-1.5 rounded-xl shrink-0 tabular-nums ${
                          active
                            ? 'bg-[#FBBF24] text-[#132347]'
                            : 'bg-white/20 text-[#FEF08A]'
                        }`}
                      >
                        {item.step}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold ${
                            active ? 'text-[#0284C7]' : 'text-sky-100'
                          }`}
                        >
                          {item.duration}
                        </p>
                        <h3 className="text-base sm:text-lg font-extrabold truncate">{item.title}</h3>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        active ? 'text-[#1D4ED8] translate-x-0.5' : 'text-sky-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Active Step Detail Panel */}
            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-3xl border border-white/30 bg-[#102A6B]/75 backdrop-blur-xs p-6 sm:p-8 lg:p-10 flex flex-col justify-between card-dark-elevated">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/20">
                    <span className="font-display text-3xl sm:text-4xl font-black text-[#FBBF24] tabular-nums">
                      Шаг {currentStep.step}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white">
                      <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>{currentStep.duration}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-snug">
                    {currentStep.title}
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-sky-50">
                    {currentStep.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#34D399]">
                        Забота и комфорт
                      </p>
                      <p className="mt-1.5 text-xs sm:text-sm font-medium text-white">
                        {currentStep.comfort}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FBBF24]">
                        Итог для ребёнка
                      </p>
                      <p className="mt-1.5 text-xs sm:text-sm font-medium text-white flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                        <span>{currentStep.deliverable}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={onBookClick}
                    className="min-h-[48px] px-6 rounded-2xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold hover:bg-[#FDE047] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Записаться на первый визит
                  </button>
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="min-h-[48px] px-5 rounded-2xl border border-white/35 text-white text-sm font-bold hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Уточнить в чате
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PART B: Pure White Parent FAQ */}
      <div className="relative z-10 py-16 md:py-24 bg-white border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#059669] mb-2">
                  Частые вопросы родителей
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-[-0.02em] text-[#132347] leading-tight">
                  Спокойные ответы на все переживания мам и пап
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                  Рассказываем про адаптацию малышей, безопасность закиси азота, лечение молочных зубов и мягкую анестезию.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['Все', 'Страх и адаптация', 'Сон и заморозка', 'Молочные зубки'] as FaqCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        faqCategory === cat
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                          : 'bg-sky-50/70 text-[#132347] border-sky-200 hover:border-[#0284C7]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-[#0284C7] to-[#0D9488] text-white p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-2.5 text-[#FEF08A] text-xs font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Помощник для родителей 24/7</span>
                </div>
                <p className="text-sm text-white/95 leading-relaxed">
                  Ребёнок боится или нужен совет по возрасту? Напишите в наш чат — подскажем, с какого приёма лучше начать.
                </p>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="w-full min-h-[46px] rounded-xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold hover:bg-[#FDE047] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Задать вопрос в чате</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {visibleFaqs.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 transition-colors ${
                      isOpen
                        ? 'border-[#0284C7] bg-sky-50/35 shadow-sm'
                        : 'border-sky-100 bg-white hover:border-sky-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                      aria-expanded={isOpen}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                          {item.category}
                        </span>
                        <h3 className="mt-1 text-base sm:text-lg font-extrabold text-[#132347]">
                          {item.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#1D4ED8] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-[15px] leading-relaxed text-slate-700 border-t border-sky-100">
                        <p className="pt-3">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
