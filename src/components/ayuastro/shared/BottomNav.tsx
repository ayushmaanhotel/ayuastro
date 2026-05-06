'use client';

import { useAyuAstroStore, type BottomNavTab } from '@/store/ayuastro-store';
import { Sparkles, Users, BookOpen, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs: { id: BottomNavTab; label: string; icon: React.ElementType; view: string }[] = [
  { id: 'insights', label: 'Insights', icon: Sparkles, view: 'insights' },
  { id: 'sync', label: 'Sync', icon: Users, view: 'sync' },
  { id: 'report', label: 'Report', icon: FileText, view: 'report' },
  { id: 'wisdom', label: 'Wisdom', icon: BookOpen, view: 'wisdom' },
  { id: 'profile', label: 'Profile', icon: User, view: 'profile' },
];

export default function BottomNav() {
  const { currentView, activeTab, setActiveTab, setView } = useAyuAstroStore();

  const visibleViews = ['insights', 'report', 'premium', 'wisdom', 'profile', 'sync'];
  if (!visibleViews.includes(currentView)) return null;

  const handleTabClick = (tab: typeof tabs[number]) => {
    setActiveTab(tab.id);
    setView(tab.view as 'insights' | 'sync' | 'report' | 'wisdom' | 'profile');
  };

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-brown-100/50 dark:border-brown-100/30"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`tab-press flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all ${
                isActive
                  ? 'text-brown-700 dark:text-gold'
                  : 'text-brown-300 hover:text-brown-500 dark:text-brown-300 dark:hover:text-brown-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isActive ? 'active' : 'inactive'}
                    initial={{ scale: isActive ? 0.8 : 1 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: isActive ? 1.2 : 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Icon className={`size-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                  </motion.div>
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold animate-glow-pulse"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? 'text-brown-700 dark:text-gold'
                    : ''
                }`}
                style={isActive ? { textShadow: '0 0 8px rgba(212, 175, 55, 0.3)' } : undefined}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
