'use client';
import { useState, useEffect } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { useTheme } from 'next-themes';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
export default function Header() {
  const { currentView, setView, birthDetails, userId } = useAyuAstroStore();
  const { theme, setTheme } = useTheme();
  const [needsMoodCheckIn, setNeedsMoodCheckIn] = useState(false);
  // Check if user has logged a mood today
  useEffect(() => {
    async function checkMoodToday() {
      if (!userId) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/mood/history?userId=${userId}&days=1`);
        if (res.ok) {
          const json = await res.json();
          const hasLoggedToday = json.data?.some(
            (entry: { createdAt: string }) => entry.createdAt.startsWith(today)
          );
          setNeedsMoodCheckIn(!hasLoggedToday);
        }
      } catch {
        // If API fails, show dot (better to remind than miss)
        setNeedsMoodCheckIn(true);
      }
    }
    checkMoodToday();
  }, [userId]);
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
            <Menu className="size-5 text-brown-700 dark:text-brown-500" />
          </button>
          <motion.button
            onClick={() => setView('insights')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Image src="/logo.svg" alt="AyuAstro" width={24} height={24} className="size-6" priority />
            <h1 className="animate-shimmer-text font-serif text-xl font-semibold tracking-wide">
              AyuAstro
            </h1>
            {/* "Nothing to Hide" tagline — more prominent */}
            <Badge className="hidden sm:flex text-[8px] font-bold tracking-[0.15em] text-gold-dark/70 dark:text-gold/60 bg-gold/10 dark:bg-gold/15 border-gold/20 px-2 py-0.5 uppercase">
              Nothing to Hide
            </Badge>
            {/* v2.0 badge */}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-dark dark:bg-gold/15 dark:text-gold">
              v2.0
            </span>
          </motion.button>
          <div className="flex items-center gap-1">
            {/* Theme Toggle — smooth morphing animation */}
            <button
              onClick={toggleTheme}
              className="flex size-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-brown-50 dark:hover:bg-brown-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))',
                    }}
                  >
                    <Sun className="size-5 text-gold" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Moon className="size-5 text-brown-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            {/* Profile Button — gold ring when user has unread mood entries */}
            <button
              onClick={() => setView('profile')}
              className={`relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50 dark:hover:bg-brown-800 ${
                needsMoodCheckIn && currentView !== 'mood' ? 'animate-gold-ring' : ''
              }`}
              aria-label="Profile"
            >
              {birthDetails?.name ? (
                <div className="flex size-8 items-center justify-center rounded-full bg-brown-700 text-xs font-medium text-white">
                  {birthDetails.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="size-5 text-brown-700 dark:text-brown-500" />
              )}
              {/* Notification dot for mood check-in */}
              <AnimatePresence>
                {needsMoodCheckIn && currentView !== 'mood' && (
                  <motion.span
                    key="mood-dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute top-0.5 right-0.5 flex size-2.5"
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-75 animate-ping" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-gold" style={{ boxShadow: '0 0 4px rgba(212,175,55,0.5)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
      {/* Gradient underline — gold to transparent (thinner 0.5px) */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          opacity: 0.35,
          height: '0.5px',
        }}
      />
    </motion.header>
  );
}
