import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrandLogo } from './BrandLogo.tsx';

export const Preloader: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    return !isReduced && !isMobile;
  });

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 600);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-gradient-to-br from-[#1D4ED8] via-[#0284C7] to-[#0D9488] pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <BrandLogo variant="stacked" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
