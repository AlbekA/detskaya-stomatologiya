import React from 'react';
import { Calendar, MessageCircle, Phone } from 'lucide-react';

interface MobileBottomBarProps {
  phoneHref: string;
  onBookClick: () => void;
  onOpenChat: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  phoneHref,
  onBookClick,
  onOpenChat,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] border-t border-white/25 pb-safe shadow-[0_-10px_28px_rgba(29,78,216,0.28)]">
      <div className="h-14 px-3 flex items-center justify-between gap-2">
        <a
          href={phoneHref}
          className="min-w-[44px] min-h-[44px] px-3 rounded-xl border border-white/30 bg-white/15 text-white flex items-center justify-center gap-1.5 text-xs font-bold active:scale-[0.97] transition-transform"
          aria-label="Позвонить в детскую клинику"
        >
          <Phone className="w-4 h-4 text-[#FDE047]" />
          <span>Позвонить</span>
        </a>

        <button
          type="button"
          onClick={onBookClick}
          className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#FBBF24] text-[#132347] flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-md active:scale-[0.98] transition-transform cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#132347]" />
          <span>Записать ребёнка</span>
        </button>

        <button
          type="button"
          onClick={onOpenChat}
          className="min-w-[44px] min-h-[44px] px-3 rounded-xl border border-white/30 bg-white/15 text-white flex items-center justify-center active:scale-[0.97] transition-transform cursor-pointer"
          aria-label="Открыть помощник для родителей"
        >
          <MessageCircle className="w-4 h-4 text-[#FDE047]" />
        </button>
      </div>
    </div>
  );
};
