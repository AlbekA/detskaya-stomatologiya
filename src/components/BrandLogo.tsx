import React from 'react';

interface BrandLogoProps {
  variant?: 'header' | 'mobile' | 'footer' | 'stacked';
  clinicName?: string;
  className?: string;
}

export const ThreeTeethEmblem: React.FC<{ className?: string }> = ({ className = 'w-12 h-7' }) => (
  <svg viewBox="0 0 96 54" fill="none" className={className} aria-hidden="true">
    {/* Left Lime-Green Smiling Tooth */}
    <g transform="rotate(-7 20 28)">
      <path
        d="M12 13C7.8 13 5.5 17 6.2 22.8C7.1 29.8 10.6 39 14.2 39C16.2 39 17.5 32.8 19.6 32.8C21.7 32.8 23 39 25 39C28.6 39 32.1 29.8 33 22.8C33.7 17 31.4 13 27.2 13C24 13 21.8 15 19.6 15C17.4 15 15.2 13 12 13Z"
        fill="#65D018"
      />
      {/* Cute yellow corner cap */}
      <path d="M6.6 18.2C7.4 14.2 10.2 12.6 13.6 13.2L8.4 19.4Z" fill="#FDE047" />
      {/* Eyes & smile */}
      <path d="M13.8 21.2C14.5 20 16 20 16.7 21.2" stroke="#1A2E05" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22.2 21.2C22.9 20 24.4 20 25.1 21.2" stroke="#1A2E05" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 25.2C16.8 28.4 22.2 28.4 24.5 25.2" stroke="#1A2E05" strokeWidth="1.7" strokeLinecap="round" />
    </g>

    {/* Center Sunny-Yellow Winged Tooth Fairy */}
    <g>
      {/* Left & Right Fairy Wings */}
      <path
        d="M34 19C28.5 17.5 25.5 20.5 26.8 24.2C27.5 26 30.5 27.2 33.8 26.5Z"
        fill="#FEF9C3"
        stroke="#F59E0B"
        strokeWidth="0.9"
      />
      <path
        d="M62 19C67.5 17.5 70.5 20.5 69.2 24.2C68.5 26 65.5 27.2 62.2 26.5Z"
        fill="#FEF9C3"
        stroke="#F59E0B"
        strokeWidth="0.9"
      />
      <path
        d="M39.5 10C34.8 10 32.3 14.4 33 20.8C34 28.6 38 38.5 41.8 38.5C44 38.5 45.6 31.8 48 31.8C50.4 31.8 52 38.5 54.2 38.5C58 38.5 62 28.6 63 20.8C63.7 14.4 61.2 10 56.5 10C53 10 50.5 12.2 48 12.2C45.5 12.2 43 10 39.5 10Z"
        fill="#FACC15"
      />
      {/* Eyes & smile */}
      <path d="M41.5 19.2C42.3 17.8 44 17.8 44.8 19.2" stroke="#422006" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M51.2 19.2C52 17.8 53.7 17.8 54.5 19.2" stroke="#422006" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M42.8 23.6C45.2 26.8 50.8 26.8 53.2 23.6" stroke="#422006" strokeWidth="1.8" strokeLinecap="round" />
    </g>

    {/* Right Berry-Magenta Tooth with Red Bow */}
    <g transform="rotate(7 76 28)">
      <path
        d="M69 13C64.8 13 62.5 17 63.2 22.8C64.1 29.8 67.6 39 71.2 39C73.2 39 74.5 32.8 76.6 32.8C78.7 32.8 80 39 82 39C85.6 39 89.1 29.8 90 22.8C90.7 17 88.4 13 84.2 13C81 13 78.8 15 76.6 15C74.4 15 72.2 13 69 13Z"
        fill="#BE185D"
      />
      {/* Cute Red Bow */}
      <path d="M76.5 13.4L72 10.5V15.5L76.5 13.4Z" fill="#EF4444" />
      <path d="M76.5 13.4L81 10.5V15.5L76.5 13.4Z" fill="#EF4444" />
      <circle cx="76.5" cy="13.2" r="1.4" fill="#FCA5A5" />
      {/* Eyes & joyful smile */}
      <path d="M70.8 21.2C71.5 20 73 20 73.7 21.2" stroke="#4A0426" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M79.2 21.2C79.9 20 81.4 20 82.1 21.2" stroke="#4A0426" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M72.5 24.8C74.2 28.2 79 28.2 80.7 24.8Z"
        fill="#4A0426"
      />
    </g>
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  clinicName = 'Первая Детская Стоматология',
  className = '',
}) => {
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        <div className="px-4 py-2 rounded-2xl bg-white shadow-lg border border-sky-100">
          <ThreeTeethEmblem className="w-24 h-14" />
        </div>
        <div className="mt-3 flex flex-col items-center leading-[0.95] font-display uppercase tracking-tight">
          <span className="text-2xl font-black text-[#84CC16] drop-shadow-xs">ПЕРВАЯ</span>
          <span className="text-xl font-black text-white mt-0.5">ДЕТСКАЯ</span>
          <span className="text-xs font-extrabold tracking-[0.14em] text-sky-100 mt-1">
            СТОМАТОЛОГИЯ
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <span className={`inline-flex items-center gap-2 select-none ${className}`}>
        <span className="px-1.5 py-0.5 rounded-lg bg-white shadow-xs shrink-0 flex items-center justify-center">
          <ThreeTeethEmblem className="w-9 h-5" />
        </span>
        <span className="flex flex-col leading-[1.02] font-display text-left">
          <span className="text-[11px] font-black uppercase tracking-wide text-[#BEF264]">
            Первая
          </span>
          <span className="text-[12px] font-extrabold text-white whitespace-nowrap">
            Детская Стоматология
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <span className="px-2 py-1 rounded-xl bg-white shadow-sm border border-white/60 shrink-0 flex items-center justify-center">
        <ThreeTeethEmblem className="w-11 h-6" />
      </span>
      <span className="flex flex-col leading-[1.04] font-display text-left">
        <span className="text-[11px] lg:text-xs font-black uppercase tracking-wider text-[#BEF264]">
          Первая
        </span>
        <span className="text-sm lg:text-[15px] font-extrabold text-white whitespace-nowrap">
          {clinicName.replace(/^Первая\s+/i, '') || 'Детская Стоматология'}
        </span>
      </span>
    </span>
  );
};
