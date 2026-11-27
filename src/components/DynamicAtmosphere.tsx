import React, { useEffect, useState } from 'react';

export const DynamicAtmosphere: React.FC = () => {
  const [scrollRatio, setScrollRatio] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setScrollRatio(ratio);
      rafId = 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const shiftX = (scrollRatio * 34 - 17).toFixed(1);
  const shiftY = (scrollRatio * 24 - 12).toFixed(1);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute -top-36 -right-28 w-[640px] h-[640px] rounded-full opacity-75 blur-3xl transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${shiftX}%, ${shiftY}%, 0)`,
          background:
            'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(52,211,153,0.14) 48%, transparent 74%)',
        }}
      />
      <div
        className="absolute top-1/3 -left-32 w-[560px] h-[560px] rounded-full opacity-65 blur-3xl transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${-Number(shiftX)}%, ${Number(shiftY) * 0.6}%, 0)`,
          background:
            'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(251,113,133,0.12) 52%, transparent 75%)',
        }}
      />
      <div
        className="absolute -bottom-44 right-1/4 w-[620px] h-[620px] rounded-full opacity-60 blur-3xl transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${Number(shiftX) * 0.5}%, ${-Number(shiftY)}%, 0)`,
          background:
            'radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(14,165,233,0.12) 50%, transparent 74%)',
        }}
      />
    </div>
  );
};
