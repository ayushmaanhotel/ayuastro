'use client';

import { useEffect } from 'react';
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
import ReportView from '@/components/ayuastro/report/ReportView';
import PremiumView from '@/components/ayuastro/premium/PremiumView';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Home() {
  const { currentView, birthDetails, astrologyData, setView, setActiveTab } = useAyuAstroStore();

  // If user has persisted data, redirect to insights
  useEffect(() => {
    if (birthDetails && astrologyData && currentView === 'landing') {
      setView('insights');
      setActiveTab('insights');
    }
  }, [birthDetails, astrologyData, currentView, setView, setActiveTab]);

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
      case 'wisdom':
        return <WisdomView />;
      default:
        return <LandingView />;
    }
  };

  const showHeader = currentView !== 'landing' && currentView !== 'calculating';
  const showBottomNav = ['insights', 'report', 'premium', 'wisdom', 'profile'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {showHeader && <Header />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
