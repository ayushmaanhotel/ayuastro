'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Menu, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  const { currentView, setView, birthDetails } = useAyuAstroStore();

  if (currentView === 'landing' || currentView === 'calculating') return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass sticky top-0 z-50 w-full border-b border-brown-100/50"
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <button
          onClick={() => setView('insights')}
          className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50"
          aria-label="Menu"
        >
          <Menu className="size-5 text-brown-700" />
        </button>

        <button
          onClick={() => setView('insights')}
          className="flex items-center gap-2"
        >
          <Image src="/logo.svg" alt="AyuAstro" width={24} height={24} className="size-6" />
          <h1
            className="font-serif text-xl font-semibold tracking-wide text-brown-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            AyuAstro
          </h1>
        </button>

        <button
          onClick={() => setView('profile')}
          className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50"
          aria-label="Profile"
        >
          {birthDetails?.name ? (
            <div className="flex size-8 items-center justify-center rounded-full bg-brown-700 text-xs font-medium text-white">
              {birthDetails.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className="size-5 text-brown-700" />
          )}
        </button>
      </div>
    </motion.header>
  );
}
