import React, { useEffect, useState } from 'react';
import { Menu, Phone, ShieldCheck, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  clinicName: string;
  phone: string;
  phoneHref: string;
  address: string;
  onBookClick: () => void;
  onOpenAdmin: () => void;
}

const NAV_LINKS = [
  { href: '#services', label: 'Услуги' },
  { href: '#journey', label: 'Как проходит визит' },
  { href: '#doctors', label: 'Детские врачи' },
  { href: '#cases', label: 'Истории улыбок' },
  { href: '#map', label: 'Карта' },
];

export const Header: React.FC<HeaderProps> = ({
  clinicName,
  phone,
  phoneHref,
  address,
  onBookClick,
  onOpenAdmin,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const handleNavClick = (href: string) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#0D9488] text-white shadow-[0_10px_30px_rgba(2,132,199,0.28)]">
        {/* Desktop 3-Zone Top Bar Contract */}
        <div className="hidden md:flex max-w-7xl mx-auto px-5 lg:px-10 h-20 items-center justify-between gap-4">
          <a
            href="#top"
            className="inline-flex items-center whitespace-nowrap shrink-0 group transition-transform duration-300 hover:scale-[1.02]"
            aria-label={clinicName}
          >
            <BrandLogo variant="header" clinicName={clinicName} />
          </a>

          <nav className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-semibold text-white/95">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1.5 hover:text-[#FEF08A] transition-colors whitespace-nowrap shrink-0 after:absolute after:left-0 after:bottom-0 after:h-[2.5px] after:w-0 after:rounded-full after:bg-[#FBBF24] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onBookClick}
              className="px-5 lg:px-6 py-2.5 min-h-[42px] rounded-xl bg-[#FBBF24] text-[#132347] text-xs lg:text-sm font-extrabold hover:bg-[#FDE047] active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_8px_22px_rgba(251,191,36,0.38)]"
            >
              Записаться
            </button>
          </div>
        </div>

        {/* Mobile Compact 56px Top App Bar */}
        <div className="flex md:hidden h-14 px-3 items-center justify-between">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white active:bg-white/15 cursor-pointer"
            aria-label="Открыть меню навигации"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="#top"
            className="inline-flex items-center whitespace-nowrap"
            aria-label={clinicName}
          >
            <BrandLogo variant="mobile" clinicName={clinicName} />
          </a>

          <a
            href={phoneHref}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#FEF08A] active:bg-white/15"
            aria-label={`Позвонить в клинику ${phone}`}
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Mobile Slide-Over Menu Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#132347]/55 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 w-[84%] max-w-xs h-full bg-gradient-to-b from-[#1D4ED8] via-[#0284C7] to-[#0F766E] text-white flex flex-col justify-between p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/20">
                <BrandLogo variant="mobile" clinicName={clinicName} />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white/90 hover:text-white cursor-pointer"
                  aria-label="Закрыть меню"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-3 py-3 min-h-[44px] rounded-xl text-base font-bold text-white hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/20 space-y-3">
                <a
                  href={phoneHref}
                  className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-bold text-white hover:bg-white/15"
                >
                  <Phone className="w-4 h-4 text-[#FBBF24] shrink-0" />
                  <span className="tabular-nums">{phone}</span>
                </a>
                <p className="px-3 text-xs text-white/85 leading-relaxed">{address}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/20">
              <PWAInstallButton variant="dark" className="w-full" />
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onBookClick();
                }}
                className="w-full min-h-[46px] rounded-xl bg-[#FBBF24] text-[#132347] text-sm font-extrabold cursor-pointer hover:bg-[#FDE047] transition-colors"
              >
                Записаться на прием
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenAdmin();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white/85 hover:text-white cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
                Панель администратора
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
