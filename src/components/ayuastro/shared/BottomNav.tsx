'use client';

import { useAyuAstroStore, type BottomNavTab } from '@/store/ayuastro-store';
import { Sparkles, Users, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs: { id: BottomNavTab; label: string; icon: React.ElementType; view: string }[] = [
  { id: 'insights', label: 'Insights', icon: Sparkles, view: 'insights' },
  { id: 'sync', label: 'Sync', icon: Users, view: 'insights' },
  { id: 'wisdom', label: 'Wisdom', icon: BookOpen, view: 'wisdom' },
  { id: 'profile', label: 'Profile', icon: User, view: 'profile' },
];

export default function BottomNav() {
  const { currentView, activeTab, setActiveTab, setView } = useAyuAstroStore();

  const visibleViews = ['insights', 'report', 'premium', 'wisdom', 'profile'];
  if (!visibleViews.includes(currentView)) return null;

  const handleTabClick = (tab: typeof tabs[number]) => {
    setActiveTab(tab.id);
    setView(tab.view as 'insights' | 'wisdom' | 'profile');
  };

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-brown-100/50"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-all ${
                isActive
                  ? 'text-brown-700'
                  : 'text-brown-300 hover:text-brown-500'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`size-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-brown-700' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
