'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { useTheme } from 'next-themes';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  const { currentView, setView, birthDetails } = useAyuAstroStore();
  const { theme, setTheme } = useTheme();

  if (currentView === 'landing' || currentView === 'calculating') return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="border-b border-brown-100/50 dark:border-brown-100/30 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] bg-white/72 dark:bg-[#1A1412]/72"
      >
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <button
            onClick={() => setView('insights')}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50 dark:hover:bg-brown-800"
            aria-label="Menu"
          >
            <Menu className="size-5 text-brown-700 dark:text-brown-300" />
          </button>

          <motion.button
            onClick={() => setView('insights')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Image src="/logo.svg" alt="AyuAstro" width={24} height={24} className="size-6" />
            <h1
              className="font-serif text-xl font-semibold tracking-wide text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              AyuAstro
            </h1>
          </motion.button>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex size-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-brown-50 dark:hover:bg-brown-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === 'dark' ? 180 : 0,
                  scale: 1,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  filter: theme === 'dark'
                    ? 'drop-shadow(0 0 8px rgba(212,175,55,0.5))'
                    : 'none',
                }}
              >
                {theme === 'dark' ? (
                  <Sun className="size-5 text-gold" />
                ) : (
                  <Moon className="size-5 text-brown-700" />
                )}
              </motion.div>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setView('profile')}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50 dark:hover:bg-brown-800"
              aria-label="Profile"
            >
              {birthDetails?.name ? (
                <div className="flex size-8 items-center justify-center rounded-full bg-brown-700 text-xs font-medium text-white">
                  {birthDetails.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="size-5 text-brown-700 dark:text-brown-300" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Gradient underline — gold to transparent */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          opacity: 0.5,
        }}
      />
    </motion.header>
  );
}
