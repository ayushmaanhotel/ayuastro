'use client';

import { useEffect, useState } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { AnimatePresence, motion } from 'framer-motion';

import Header from '@/components/ayuastro/shared/Header';
import BottomNav from '@/components/ayuastro/shared/BottomNav';
import CalculatingView from '@/components/ayuastro/shared/CalculatingView';
import ProfileView from '@/components/ayuastro/shared/ProfileView';
import WisdomView from '@/components/ayuastro/shared/WisdomView';
import LandingView from '@/components/ayuastro/landing/LandingView';
import OnboardingView from '@/components/ayuastro/onboarding/OnboardingView';
import InsightsView from '@/components/ayuastro/insights/InsightsView';
import SyncView from '@/components/ayuastro/sync/SyncView';
import ReportView from '@/components/ayuastro/report/ReportView';
import PremiumView from '@/components/ayuastro/premium/PremiumView';
import ChatView from '@/components/ayuastro/chat/ChatView';
import MoodTrackerView from '@/components/ayuastro/mood/MoodTrackerView';
import BreathingView from '@/components/ayuastro/wellness/BreathingView';
import YogaDoshaView from '@/components/ayuastro/insights/YogaDoshaView';
import CompatibilityDetailView from '@/components/ayuastro/sync/CompatibilityDetailView';
import TraitDashboardView from '@/components/ayuastro/dashboard/TraitDashboardView';
import CosmicCalendarView from '@/components/ayuastro/calendar/CosmicCalendarView';
import CosmicSoundsView from '@/components/ayuastro/wellness/CosmicSoundsView';
import ZodiacDeepDiveView from '@/components/ayuastro/zodiac/ZodiacDeepDiveView';
import GratitudeJournalView from '@/components/ayuastro/wellness/GratitudeJournalView';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const { currentView, birthDetails, astrologyData, setView, setActiveTab } = useAyuAstroStore();
  const [showShimmer, setShowShimmer] = useState(false);

  // If user has persisted data, redirect to insights
  useEffect(() => {
    if (birthDetails && astrologyData && currentView === 'landing') {
      setView('insights');
      setActiveTab('insights');
    }
  }, [birthDetails, astrologyData, currentView, setView, setActiveTab]);

  // Trigger shimmer when view changes
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setShowShimmer(true);
      const timer = setTimeout(() => setShowShimmer(false), 500);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'onboarding':
        return <OnboardingView />;
      case 'calculating':
        return <CalculatingView />;
      case 'insights':
        return <InsightsView />;
      case 'report':
        return <ReportView />;
      case 'premium':
        return <PremiumView />;
      case 'profile':
        return <ProfileView />;
      case 'sync':
        return <SyncView />;
      case 'chat':
        return <ChatView />;
      case 'mood':
        return <MoodTrackerView />;
      case 'breathing':
        return <BreathingView />;
      case 'dashboard':
        return <TraitDashboardView />;
      case 'calendar':
        return <CosmicCalendarView />;
      case 'cosmicSounds':
        return <CosmicSoundsView />;
      case 'zodiacDeepDive':
        return <ZodiacDeepDiveView />;
      case 'gratitudeJournal':
        return <GratitudeJournalView />;
      case 'yogaDosha':
        return <YogaDoshaView />;
      case 'compatibilityDetail': {
        const state = useAyuAstroStore.getState();
        return (
          <CompatibilityDetailView
            partnerSign={state.compatPartnerSign || 'Aries'}
            partnerName={state.compatPartnerName || undefined}
            overallScore={state.compatOverallScore}
            emotionalScore={state.compatEmotionalScore}
            communicationScore={state.compatCommunicationScore}
            trustScore={state.compatTrustScore}
          />
        );
      }
      case 'wisdom':
        return <WisdomView />;
      default:
        return <LandingView />;
    }
  };

  const showHeader = currentView !== 'landing' && currentView !== 'calculating';
  const showBottomNav = ['insights', 'report', 'premium', 'wisdom', 'profile', 'sync', 'chat', 'mood', 'breathing', 'yogaDosha', 'compatibilityDetail', 'dashboard', 'calendar', 'cosmicSounds', 'zodiacDeepDive', 'gratitudeJournal'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {showHeader && <Header />}

      <main className="flex-1 relative">
        {/* Gold shimmer line during transitions */}
        <AnimatePresence>
          {showShimmer && (
            <motion.div
              key="shimmer"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute top-0 left-0 right-0 h-[2px] z-50 origin-left"
              style={{
                background: 'linear-gradient(90deg, transparent, #D4AF37, #BF9B30, #D4AF37, transparent)',
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
