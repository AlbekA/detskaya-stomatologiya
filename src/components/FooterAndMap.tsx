import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Crosshair,
  ExternalLink,
  Layers,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ClinicSettings } from '../types/clinic.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { SafeImage } from './SafeImage.tsx';

interface FooterAndMapProps {
  settings: ClinicSettings;
  onOpenAdmin: () => void;
}

const CLINIC_POSITION = {
  lat: 42.851321,
  lng: 74.611319,
};

interface InteractiveMapContentProps {
  settings: ClinicSettings;
  mapType: 'roadmap' | 'hybrid';
  onToggleMapType: (next: 'roadmap' | 'hybrid') => void;
}

const InteractiveMapContent: React.FC<InteractiveMapContentProps> = ({
  settings,
  mapType,
  onToggleMapType,
}) => {
  const map = useMap();
  const loadingStatus = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  const handleZoomDelta = (delta: number) => {
    if (!map) return;
    const current = map.getZoom() ?? 16;
    const next = Math.max(11, Math.min(20, current + delta));
    map.setZoom(next);
  };

  const handleCenterClinic = () => {
    if (!map) return;
    map.panTo(CLINIC_POSITION);
    map.setZoom(16);
    setInfoOpen(true);
  };

  if (
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    loadingStatus === APILoadingStatus.FAILED
  ) {
    return (
      <div className="h-[340px] sm:h-[380px] w-full bg-[#102A6B] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <MapPin className="w-8 h-8 text-[#FBBF24]" />
        <p className="font-display text-base font-extrabold text-white">
          {settings.name} · {settings.city}
        </p>
        <p className="text-xs sm:text-sm text-sky-100 max-w-md">{settings.address}</p>
        <a
          href="https://www.google.com/maps/search/?api=1&query=42.851321,74.611319"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-[42px] px-5 rounded-xl bg-[#FBBF24] text-[#132347] text-xs font-extrabold hover:bg-[#FDE047] transition-colors"
        >
          <span>Открыть карту в Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Map Header Controls */}
      <div className="px-4 py-3 border-b border-white/20 bg-[#143382] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#0F245C] p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => onToggleMapType('roadmap')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-[#FBBF24] text-[#132347]'
                : 'text-sky-100 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Карта улиц</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleMapType('hybrid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mapType === 'hybrid'
                ? 'bg-[#FBBF24] text-[#132347]'
                : 'text-sky-100 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Спутник</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCenterClinic}
            className="h-9 px-3 rounded-xl border border-white/25 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:border-[#FBBF24] transition-colors cursor-pointer"
            title="Центрировать на клинике"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span className="hidden sm:inline">К клинике</span>
          </button>
          <button
            type="button"
            onClick={() => handleZoomDelta(-1)}
            className="w-9 h-9 rounded-xl border border-white/25 flex items-center justify-center text-sky-100 hover:text-white hover:border-white/60 cursor-pointer"
            aria-label="Уменьшить масштаб карты"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoomDelta(1)}
            className="w-9 h-9 rounded-xl border border-white/25 flex items-center justify-center text-sky-100 hover:text-white hover:border-white/60 cursor-pointer"
            aria-label="Увеличить масштаб карты"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explicit Sized Container for Google Map */}
      <div className="relative h-[340px] sm:h-[380px] w-full bg-[#102A6B]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={CLINIC_POSITION}
          defaultZoom={16}
          mapTypeId={mapType}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          streetViewControl={true}
          mapTypeControl={false}
          fullscreenControl={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <AdvancedMarker
            ref={markerRef}
            position={CLINIC_POSITION}
            onClick={() => setInfoOpen((prev) => !prev)}
            title={`${settings.name} — ${settings.address}`}
          >
            <Pin
              background="#FBBF24"
              borderColor="#1D4ED8"
              glyphColor="#132347"
              scale={1.25}
            />
          </AdvancedMarker>

          {infoOpen && marker && (
            <InfoWindow
              anchor={marker}
              maxWidth={270}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-1 text-[#132347] space-y-1.5 font-sans">
                <p className="font-extrabold text-sm text-[#1D4ED8]">{settings.name}</p>
                <p className="text-xs text-slate-700 leading-snug">{settings.address}</p>
                <p className="text-[11px] font-bold text-[#059669]">{settings.hours}</p>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=42.851321,74.611319"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1D4ED8] underline hover:text-[#0284C7]"
                  >
                    <span>Построить маршрут</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export const FooterAndMap: React.FC<FooterAndMapProps> = ({ settings, onOpenAdmin }) => {
  const [mapsApiKey, setMapsApiKey] = useState<string>(() => {
    return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  });
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');

  useEffect(() => {
    if (mapsApiKey) return;
    let active = true;
    fetch('/api/maps-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { apiKey?: string } | null) => {
        if (active && data?.apiKey) {
          setMapsApiKey(data.apiKey);
        }
      })
      .catch(() => {
        // Fallback link renders cleanly when key is unavailable
      });
    return () => {
      active = false;
    };
  }, [mapsApiKey]);

  return (
    <footer
      id="map"
      className="relative bg-[#102A6B] text-white pt-16 pb-24 md:pb-12 border-t border-sky-400/25"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/20">
          {/* Contact Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FBBF24] mb-3">
                Как нас найти
              </p>
              <BrandLogo variant="header" clinicName={settings.name} />
              <div className="mt-4 flex items-center gap-3.5 rounded-2xl bg-white/10 border border-white/20 p-2.5 max-w-md">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-white/40">
                  <SafeImage
                    src="/assets/aistudio/photo_2026-11-27_15-18-34_550293ec.jpg"
                    alt={`Вывеска ${settings.name}`}
                    className="w-full h-full object-cover object-[42%_14%]"
                  />
                </div>
                <p className="text-xs sm:text-sm leading-snug text-sky-100">
                  Уютная детская стоматология с игровой комнатой, мультиками и бережными врачами в Бишкеке.
                </p>
              </div>

              <div className="mt-7 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FBBF24] shrink-0 mt-1" />
                  <div>
                    <p className="font-extrabold text-white">{settings.city}</p>
                    <p className="text-sky-100">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#34D399] shrink-0" />
                  <a
                    href={settings.phoneHref}
                    className="font-extrabold text-white hover:text-[#FBBF24] transition-colors tabular-nums"
                  >
                    {settings.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sky-100 hover:text-[#FBBF24] transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=42.851321,74.611319"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl bg-[#FBBF24] text-[#132347] text-xs font-extrabold hover:bg-[#FDE047] transition-colors"
                >
                  <span>Маршрут в Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://yandex.ru/maps/?text=Бишкек%20улица%20Байтик%20Баатыра%2017/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl border border-white/30 text-xs font-bold text-white hover:border-[#FBBF24] transition-colors"
                >
                  <span>Яндекс Карты</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FBBF24]" />
                </a>
                <PWAInstallButton variant="dark" />
              </div>
            </div>
          </div>

          {/* Real Interactive Google Map */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border-2 border-white/25 bg-[#102A6B] overflow-hidden shadow-[0_24px_56px_-18px_rgba(19,35,71,0.65)]">
              {mapsApiKey ? (
                <APIProvider
                  apiKey={mapsApiKey}
                  language="ru"
                  region="KG"
                  libraries={['marker']}
                >
                  <InteractiveMapContent
                    settings={settings}
                    mapType={mapType}
                    onToggleMapType={setMapType}
                  />
                </APIProvider>
              ) : (
                <div className="h-[340px] sm:h-[380px] w-full bg-[#102A6B] flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <MapPin className="w-8 h-8 text-[#FBBF24]" />
                  <p className="font-display text-base font-extrabold text-white">
                    {settings.name} · {settings.city}
                  </p>
                  <p className="text-xs sm:text-sm text-sky-100 max-w-md">
                    {settings.address}
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=42.851321,74.611319"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 rounded-xl bg-[#FBBF24] text-[#132347] text-xs font-extrabold hover:bg-[#FDE047] transition-colors"
                  >
                    <span>Открыть на Google Картах</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal & Admin Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-sky-200">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} {settings.name}. Все права защищены.</p>
            <p>{settings.license}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white font-semibold">{settings.hours}</span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl border border-white/25 text-sky-100 hover:text-white hover:border-[#FBBF24] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Панель администратора</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
