import { useEffect, useRef, useState } from 'react';
import { DEFAULT_CLINIC_CONTENT } from './data/defaultClinicData.ts';
import type { ClinicContent } from './types/clinic.ts';
import { Preloader } from './components/Preloader.tsx';
import { OfflineIndicator } from './components/PWAInstallButton.tsx';
import { DynamicAtmosphere } from './components/DynamicAtmosphere.tsx';
import { DentalAnatomy3DStage } from './components/DentalAnatomy3DStage.tsx';
import { Header } from './components/Header.tsx';
import { HeroAnatomyStory } from './components/HeroAnatomyStory.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { TreatmentJourneyAndFaqSection } from './components/TreatmentJourneyAndFaqSection.tsx';
import { AboutAndTechSection } from './components/AboutAndTechSection.tsx';
import { DoctorsSection } from './components/DoctorsSection.tsx';
import { BeforeAfterSlider } from './components/BeforeAfterSlider.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { BookingSection } from './components/BookingSection.tsx';
import { FooterAndMap } from './components/FooterAndMap.tsx';
import { MobileBottomBar } from './components/MobileBottomBar.tsx';
import { FloatingConcierge } from './components/FloatingConcierge.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';

export default function App() {
  const [content, setContent] = useState<ClinicContent>(DEFAULT_CLINIC_CONTENT);
  const [view, setView] = useState<'site' | 'admin'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#admin' ? 'admin' : 'site'
  );
  const [prefilledService, setPrefilledService] = useState<string | undefined>();
  const [prefilledDoctor, setPrefilledDoctor] = useState<string | undefined>();
  const [bookingTrigger, setBookingTrigger] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const globalProgressRef = useRef<number>(0);
  const highlightLayerRef = useRef<number>(-1);
  const [activeLayer, setActiveLayer] = useState<number>(-1);
  const [scrollStageLabel, setScrollStageLabel] = useState<string>('01 · Крепкая эмаль зубика');

  const handleHighlightLayer = (idx: number) => {
    highlightLayerRef.current = idx;
    setActiveLayer(idx);
  };

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    if (view !== 'site') return;

    const updateGlobalScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      globalProgressRef.current = ratio;

      let nextLabel = '01 · Крепкая эмаль зубика';
      if (ratio >= 0.84) {
        nextLabel = '06 · Здоровая счастливая улыбка';
      } else if (ratio >= 0.64) {
        nextLabel = '05 · Полная 3D-схема зубика';
      } else if (ratio >= 0.45) {
        nextLabel = '04 · Защитный слой и корешок';
      } else if (ratio >= 0.25) {
        nextLabel = '03 · Живое сердечко зубика';
      } else if (ratio >= 0.08) {
        nextLabel = '02 · Заглянем внутрь зуба';
      }
      setScrollStageLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };

    window.addEventListener('scroll', updateGlobalScroll, { passive: true });
    window.addEventListener('resize', updateGlobalScroll, { passive: true });
    updateGlobalScroll();
    return () => {
      window.removeEventListener('scroll', updateGlobalScroll);
      window.removeEventListener('resize', updateGlobalScroll);
    };
  }, [view]);

  useEffect(() => {
    let active = true;
    fetch('/api/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ClinicContent | null) => {
        if (active && data && data.settings) {
          setContent(data);
        }
      })
      .catch(() => {
        // Use embedded fallback data when offline
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === '#admin' ? 'admin' : 'site');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (view === 'admin') {
      document.title = `Панель администратора — ${content.settings.name}`;
    } else {
      document.title = `${content.settings.name} — Детская стоматология в Бишкеке`;
    }
  }, [view, content.settings.name]);

  const scrollToBooking = (serviceTitle?: string, doctorName?: string) => {
    if (serviceTitle) setPrefilledService(serviceTitle);
    if (doctorName) setPrefilledDoctor(doctorName);
    setBookingTrigger((prev) => prev + 1);
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAdmin = () => {
    window.location.hash = 'admin';
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const closeAdmin = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setView('site');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  if (view === 'admin') {
    return (
      <>
        <OfflineIndicator />
        <AdminPanel
          content={content}
          onContentSaved={(next) => setContent(next)}
          onExit={closeAdmin}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-[#132347]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Preloader />
      <OfflineIndicator />
      <DynamicAtmosphere />

      {/* Full-Page Photorealistic 3D Dental Anatomy & Spatial Crystal Stage */}
      <DentalAnatomy3DStage
        progressRef={globalProgressRef}
        highlightLayerRef={highlightLayerRef}
      />

      {/* Bright Bottom-Left Scroll Phase Telemetry on Desktop */}
      <div className="hidden lg:flex fixed bottom-6 left-8 z-30 items-center px-3.5 py-2 rounded-xl bg-[#1D4ED8] border-2 border-[#FBBF24]/60 shadow-lg text-xs font-extrabold text-white pointer-events-none">
        <span className="text-[#FEF08A] tabular-nums">{scrollStageLabel}</span>
      </div>

      <Header
        clinicName={content.settings.name}
        phone={content.settings.phone}
        phoneHref={content.settings.phoneHref}
        address={content.settings.address}
        onBookClick={() => scrollToBooking()}
        onOpenAdmin={openAdmin}
      />

      <main className="flex-1">
        <HeroAnatomyStory
          settings={content.settings}
          activeLayer={activeLayer}
          onHighlightLayer={handleHighlightLayer}
          onBookClick={() => scrollToBooking()}
          onOpenChat={() => setChatOpen(true)}
        />

        <ServicesSection
          services={content.services}
          onSelectServiceForBooking={(title) => scrollToBooking(title, undefined)}
        />

        <TreatmentJourneyAndFaqSection
          onBookClick={() => scrollToBooking()}
          onOpenChat={() => setChatOpen(true)}
        />

        <AboutAndTechSection settings={content.settings} />

        <DoctorsSection
          doctors={content.doctors}
          onSelectDoctorForBooking={(doctorName) => scrollToBooking(undefined, doctorName)}
        />

        <BeforeAfterSlider
          cases={content.cases}
          onBookSimilar={(caseTitle) => scrollToBooking(caseTitle, undefined)}
        />

        <ReviewsSection reviews={content.reviews} />

        <BookingSection
          services={content.services}
          doctors={content.doctors}
          prefilledService={prefilledService}
          prefilledDoctor={prefilledDoctor}
          bookingTrigger={bookingTrigger}
        />
      </main>

      <FooterAndMap settings={content.settings} onOpenAdmin={openAdmin} />

      <MobileBottomBar
        phoneHref={content.settings.phoneHref}
        onBookClick={() => scrollToBooking()}
        onOpenChat={() => setChatOpen((prev) => !prev)}
      />

      <FloatingConcierge
        phone={content.settings.phone}
        phoneHref={content.settings.phoneHref}
        isOpen={chatOpen}
        onToggle={setChatOpen}
        onBookFromChat={() => scrollToBooking()}
      />
    </div>
  );
}
