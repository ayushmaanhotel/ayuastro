'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const MESSAGES = [
  'Mapping your cosmic blueprint...',
  'Calculating planetary positions...',
  'Analyzing emotional patterns...',
  'Generating your intelligence report...',
];

export default function CalculatingView() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [symbolIndex, setSymbolIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    const symInterval = setInterval(() => {
      setSymbolIndex((prev) => (prev + 1) % ZODIAC_SYMBOLS.length);
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(symInterval);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      {/* Zodiac ring animation */}
      <div className="relative mb-12 flex size-56 items-center justify-center">
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
          className="font-serif text-center text-lg text-brown-700"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Subtle progress indicator */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-brown-100">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 10, ease: 'linear' }}
          className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
        />
      </div>
    </div>
  );
}
