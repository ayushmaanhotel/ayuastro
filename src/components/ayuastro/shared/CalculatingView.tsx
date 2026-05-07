'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { cosmicToast } from '@/lib/toast';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const MESSAGES = [
  'Mapping your cosmic blueprint...',
  'Calculating planetary positions...',
  'Analyzing emotional patterns...',
];

const STEPS = [
  { label: 'Mapping Stars', delay: 0 },
  { label: 'Analyzing Numbers', delay: 1000 },
  { label: 'Scoring Traits', delay: 2000 },
];

const CALCULATION_TIMEOUT = 30000; // 30 seconds

export default function CalculatingView() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);

    const symInterval = setInterval(() => {
      setSymbolIndex((prev) => (prev + 1) % ZODIAC_SYMBOLS.length);
    }, 300);

    // Activate steps sequentially — fast since quick-calculate is <2s
    const stepTimers = STEPS.map((step) =>
      setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, step.delay)
    );

    return () => {
      clearInterval(msgInterval);
      clearInterval(symInterval);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  // Timeout safety: if still on calculating view after 30s, redirect to insights
  useEffect(() => {
    const timeout = setTimeout(() => {
      const store = useAyuAstroStore.getState();
      if (store.currentView === 'calculating') {
        store.setView('insights');
        store.setLoading(false);
        cosmicToast.info('Taking longer than expected', 'Your data is being processed — you can explore in the meantime');
      }
    }, CALCULATION_TIMEOUT);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      {/* Zodiac ring animation with particles */}
      <div className="relative mb-12 flex size-56 items-center justify-center">
        {/* CSS-only particle effect - floating dots */}
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold/60 animate-particle"
            style={{
              width: 4 + (i % 3),
              height: 4 + (i % 3),
              left: `${30 + (i * 12) % 50}%`,
              top: `${50 + (i * 8) % 30}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${2.5 + (i % 3) * 0.5}s`,
            }}
          />
        ))}

        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {ZODIAC_SYMBOLS.map((symbol, i) => {
            const angle = (i * 360) / ZODIAC_SYMBOLS.length;
            const radius = 100;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <span
                key={i}
                className={`absolute text-lg transition-all duration-300 ${
                  i === symbolIndex ? 'text-gold scale-125 zodiac-glow' : 'text-brown-300'
                }`}
                style={{
                  left: `calc(50% + ${x}px - 12px)`,
                  top: `calc(50% + ${y}px - 12px)`,
                }}
              >
                {symbol}
              </span>
            );
          })}
        </motion.div>

        {/* Inner pulsing circle */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(212, 175, 55, 0.1)',
              '0 0 40px rgba(212, 175, 55, 0.3)',
              '0 0 20px rgba(212, 175, 55, 0.1)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex size-20 items-center justify-center rounded-full bg-white dark:bg-card shadow-lg"
        >
          <motion.span
            key={symbolIndex}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-3xl text-gold"
          >
            {ZODIAC_SYMBOLS[symbolIndex]}
          </motion.span>
        </motion.div>
      </div>

      {/* Progress messages */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="font-serif text-center text-lg text-brown-700 dark:text-brown-300"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Subtle progress indicator — shorter duration now */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-brown-100 dark:bg-brown-100/30">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
          className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
        />
      </div>

      {/* Step indicators — 3 steps now (no "Writing Your Report" since that's async) */}
      <div className="mt-6 flex items-center gap-4">
        {STEPS.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0.4 }}
              animate={{
                opacity: isActive ? 1 : 0.4,
                scale: isCurrent ? 1.05 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              <div
                className={`flex size-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isActive
                    ? 'border-gold bg-gold text-white'
                    : 'border-brown-200 dark:border-brown-100 bg-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="size-2 rounded-full bg-white"
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-500 text-center leading-tight max-w-[64px] ${
                  isActive
                    ? 'text-gold-dark dark:text-gold'
                    : 'text-brown-300 dark:text-brown-300'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
