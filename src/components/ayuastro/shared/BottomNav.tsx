'use client';

import { useAyuAstroStore, type BottomNavTab } from '@/store/ayuastro-store';
import { Sparkles, Users, BookOpen, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs: { id: BottomNavTab; label: string; icon: React.ElementType; view: string }[] = [
  { id: 'insights', label: 'Insights', icon: Sparkles, view: 'insights' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, view: 'chat' },
  { id: 'sync', label: 'Sync', icon: Users, view: 'sync' },
  { id: 'wisdom', label: 'Wisdom', icon: BookOpen, view: 'wisdom' },
  { id: 'profile', label: 'Profile', icon: User, view: 'profile' },
];

export default function BottomNav() {
  const { currentView, activeTab, setActiveTab, setView } = useAyuAstroStore();

  const visibleViews = ['insights', 'report', 'premium', 'wisdom', 'profile', 'sync', 'chat', 'mood', 'breathing', 'yogaDosha', 'compatibilityDetail', 'dashboard', 'calendar'];
  if (!visibleViews.includes(currentView)) return null;

  const handleTabClick = (tab: typeof tabs[number]) => {
    setActiveTab(tab.id);
    setView(tab.view as 'insights' | 'chat' | 'sync' | 'wisdom' | 'profile');
  };

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass bottom-nav fixed bottom-0 left-0 right-0 z-50 dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]"
    >
      {/* Gradient top border — gold to transparent */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          opacity: 0.5,
        }}
      />
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`tab-press relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all overflow-hidden ${
                isActive
                  ? 'text-brown-700 dark:text-gold'
                  : 'text-brown-300 hover:text-brown-500 dark:text-brown-300 dark:hover:text-brown-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* CSS-only ripple effect on press */}
              <span className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle at center, rgba(212,175,55,0.08), transparent 70%)' }} />
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isActive ? 'active' : 'inactive'}
                    initial={{ scale: isActive ? 0.92 : 1 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: isActive ? 1.1 : 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <Icon className={`size-5 transition-all ${isActive ? '' : ''}`} />
                    </motion.div>
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
