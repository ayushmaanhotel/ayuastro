'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
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

// ─── Ripple Effect Component ─────────────────────────────────────────────────
function TabRipple({ x, y }: { x: number; y: number }) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0.4 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        background: 'radial-gradient(circle, rgba(212,175,55,0.3), transparent 70%)',
      }}
    />
  );
}

export default function BottomNav() {
  const { currentView, activeTab, setActiveTab, setView } = useAyuAstroStore();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; tabId: string }>>([]);
  const navRef = useRef<HTMLElement>(null);
  const [magneticOffsets, setMagneticOffsets] = useState<Record<string, number>>({});
  const [chatHintDismissed, setChatHintDismissed] = useState(false);

  // Check if user has previously interacted with chat
  useEffect(() => {
    const dismissed = localStorage.getItem('ayuastro-chat-hint-dismissed');
    if (dismissed === 'true') {
      setChatHintDismissed(true);
    }
  }, []);

  // Magnetic effect: move tab slightly toward mouse when nearby
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current) return;
    const mouseX = e.clientX;

    const newOffsets: Record<string, number> = {};
    tabs.forEach((tab) => {
      const tabEl = navRef.current?.querySelector(`[data-tab="${tab.id}"]`);
      if (!tabEl) return;
      const tabRect = tabEl.getBoundingClientRect();
      const tabCenterX = tabRect.left + tabRect.width / 2;
      const distance = mouseX - tabCenterX;
      const maxDistance = 80;
      const clamped = Math.max(-maxDistance, Math.min(maxDistance, distance));
      const normalized = clamped / maxDistance;
      // Move toward the mouse, max 4px
      const offset = -normalized * 4;
      newOffsets[tab.id] = offset;
    });
    setMagneticOffsets(newOffsets);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMagneticOffsets({});
  }, []);

  const visibleViews = ['insights', 'report', 'premium', 'wisdom', 'profile', 'sync', 'chat', 'mood', 'breathing', 'yogaDosha', 'compatibilityDetail', 'dashboard', 'calendar', 'cosmicSounds', 'settings'];
  if (!visibleViews.includes(currentView)) return null;

  const handleTabClick = (tab: typeof tabs[number], e?: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tab.id);
    setView(tab.view as 'insights' | 'chat' | 'sync' | 'wisdom' | 'profile');

    // Haptic feedback vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Silently fail - vibration not supported
      }
    }

    // Dismiss chat hint when chat tab is clicked
    if (tab.id === 'chat' && !chatHintDismissed) {
      setChatHintDismissed(true);
      localStorage.setItem('ayuastro-chat-hint-dismissed', 'true');
    }

    // Create ripple from tap point
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y, tabId: tab.id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass bottom-nav fixed bottom-0 left-0 right-0 z-50 dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
          const magneticX = magneticOffsets[tab.id] || 0;
          return (
            <motion.button
              key={tab.id}
              data-tab={tab.id}
              onClick={(e) => handleTabClick(tab, e)}
              animate={{ x: magneticX }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
              className={`tab-press relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all overflow-hidden ${
                isActive
                  ? 'text-brown-700 dark:text-gold'
                  : 'text-brown-300 hover:text-brown-500 dark:text-brown-300 dark:hover:text-brown-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Ripple effects from taps */}
              {ripples
                .filter((r) => r.tabId === tab.id)
                .map((ripple) => (
                  <TabRipple key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}

              {/* Hover glow background */}
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
                      <Icon className="size-5 transition-all" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Unread indicator dot on Chat tab for first-time users */}
                {tab.id === 'chat' && !chatHintDismissed && !isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 right-0.5 size-2.5 rounded-full bg-gold"
                    style={{ boxShadow: '0 0 4px 1px rgba(212,175,55,0.5)' }}
                  />
                )}

                {/* Glowing dot indicator — moves between tabs via layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="nav-glow-dot"
                    className="absolute -top-1 left-1/2 -translate-x-1/2"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <span
                      className="block h-1.5 w-1.5 rounded-full bg-gold"
                      style={{
                        boxShadow: '0 0 6px 2px rgba(212,175,55,0.5), 0 0 12px 4px rgba(212,175,55,0.2)',
                      }}
                    />
                  </motion.div>
                )}

                {/* Gold indicator line below icon */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold animate-glow-pulse"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-brown-700 dark:text-gold'
                    : ''
                }`}
                style={isActive ? { textShadow: '0 0 8px rgba(212, 175, 55, 0.4)' } : undefined}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
