import React, { useState } from 'react';
import { Download, Share, X, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface PWAInstallButtonProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'light',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const baseStyles =
    variant === 'dark'
      ? 'border border-white/30 text-white hover:bg-white/15'
      : 'border border-sky-200 text-[#132347] hover:border-[#1D4ED8] hover:bg-sky-50';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${baseStyles} ${className}`}
      >
        <Download className="w-4 h-4 text-[#FBBF24]" />
        Установить приложение
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${baseStyles} ${className}`}
        >
          <Share className="w-4 h-4 text-[#0D9488]" />
          Добавить на экран iPhone
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#102A6B]/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-pwa-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-[#132347] shadow-2xl border-2 border-sky-200">
              <div className="flex items-center justify-between">
                <h3 id="ios-pwa-title" className="text-xl font-extrabold">
                  Установка на iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-[#1D4ED8] cursor-pointer"
                  aria-label="Закрыть инструкцию"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
                <li>1. Нажмите кнопку «Поделиться» в нижней панели Safari.</li>
                <li>2. Пролистайте список вниз и выберите «На экран «Домой»».</li>
                <li>3. Нажмите «Добавить» — иконка «Первая Детская» появится рядом с приложениями.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[46px] rounded-xl bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-[#1D4ED8] border border-[#FBBF24]/60 px-4 py-2 text-xs font-semibold text-white shadow-xl"
    >
      <WifiOff className="w-4 h-4 text-[#FDE047]" />
      <span>Автономный режим — доступны кэшированные данные клиники</span>
    </div>
  );
};
