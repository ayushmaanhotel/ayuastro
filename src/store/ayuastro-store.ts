import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// View types for the single-page app
export type AppView = 'landing' | 'onboarding' | 'calculating' | 'insights' | 'report' | 'premium' | 'profile' | 'wisdom' | 'sync' | 'chat' | 'mood' | 'breathing' | 'yogaDosha' | 'compatibilityDetail' | 'dashboard' | 'calendar' | 'cosmicSounds' | 'zodiacDeepDive' | 'gratitudeJournal' | 'zodiacGame' | 'nakshatraDeepDive' | 'comprehensiveKundali';
export type OnboardingStep = 'name' | 'birth' | 'relationship' | 'questionnaire' | 'preview' | 'complete';
export type BottomNavTab = 'insights' | 'chat' | 'sync' | 'wisdom' | 'profile';

export interface BirthDetails {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender: string;
  relationshipStatus: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  answer: string;
  category: 'emotional' | 'social' | 'behavioral' | 'relational';
  score: number; // 1-5 Likert scale
}

export interface TraitScore {
  name: string;
  label: string;
  score: number;
  description: string;
}

export interface ReportSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  traits: string[];
  insightLevel: 'free' | 'premium';
}

export interface AstrologyInfo {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  currentDasha: string;
  yogas: string[];
  doshas: string[];
  planetaryPositions: Record<string, { sign: string; degree: number; house: number; retrograde: boolean }>;
}

export interface NumerologyInfo {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  lifePathDesc: string;
  destinyDesc: string;
  soulUrgeDesc: string;
}

interface AyuAstroState {
  // App navigation
  currentView: AppView;
  previousView: AppView | null;
  activeTab: BottomNavTab;
  onboardingStep: OnboardingStep;

  // User data
  userId: string | null;
  birthDetails: BirthDetails | null;
  questionnaireAnswers: QuestionnaireAnswer[];

  // Computed data (from backend)
  astrologyData: AstrologyInfo | null;
  numerologyData: NumerologyInfo | null;
  traitScores: TraitScore[];
  reportSections: ReportSection[];
  reportSummary: string;

  // Compatibility detail data
  compatPartnerSign: string | null;
  compatPartnerName: string | null;
  compatOverallScore: number;
  compatEmotionalScore: number;
  compatCommunicationScore: number;
  compatTrustScore: number;

  // UI state
  isLoading: boolean;
  loadingMessage: string;
  hasPaid: boolean;
  error: string | null;
  reportLoading: boolean;

  // Actions
  setView: (view: AppView) => void;
  setActiveTab: (tab: BottomNavTab) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setBirthDetails: (details: Partial<BirthDetails>) => void;
  addQuestionnaireAnswer: (answer: QuestionnaireAnswer) => void;
  setQuestionnaireAnswers: (answers: QuestionnaireAnswer[]) => void;
  setAstrologyData: (data: AstrologyInfo) => void;
  setNumerologyData: (data: NumerologyInfo) => void;
  setTraitScores: (scores: TraitScore[]) => void;
  setReportSections: (sections: ReportSection[]) => void;
  setReportSummary: (summary: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setHasPaid: (paid: boolean) => void;
  setError: (error: string | null) => void;
  setUserId: (id: string) => void;
  setReportLoading: (loading: boolean) => void;
  resetKundaliData: () => void;
  setCompatDetail: (data: { partnerSign: string; partnerName?: string; overall: number; emotional: number; communication: number; trust: number }) => void;
  reset: () => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = ['name', 'birth', 'relationship', 'questionnaire', 'preview', 'complete'];

const initialState = {
  currentView: 'landing' as AppView,
  previousView: null as AppView | null,
  activeTab: 'insights' as BottomNavTab,
  onboardingStep: 'name' as OnboardingStep,
  userId: null as string | null,
  birthDetails: null as BirthDetails | null,
  questionnaireAnswers: [] as QuestionnaireAnswer[],
  astrologyData: null as AstrologyInfo | null,
  numerologyData: null as NumerologyInfo | null,
  traitScores: [] as TraitScore[],
  reportSections: [] as ReportSection[],
  reportSummary: '',
  compatPartnerSign: null as string | null,
  compatPartnerName: null as string | null,
  compatOverallScore: 0,
  compatEmotionalScore: 0,
  compatCommunicationScore: 0,
  compatTrustScore: 0,
  isLoading: false,
  loadingMessage: '',
  hasPaid: false,
  error: null as string | null,
  reportLoading: false,
};

export const useAyuAstroStore = create<AyuAstroState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setView: (view) => set((state) => ({ previousView: state.currentView, currentView: view })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setBirthDetails: (details) =>
        set((state) => ({
          birthDetails: { ...state.birthDetails, ...details } as BirthDetails,
        })),
      addQuestionnaireAnswer: (answer) =>
        set((state) => ({
          questionnaireAnswers: [
            ...state.questionnaireAnswers.filter((a) => a.questionId !== answer.questionId),
            answer,
          ],
        })),
      setQuestionnaireAnswers: (answers) => set({ questionnaireAnswers: answers }),
      setAstrologyData: (data) => set({ astrologyData: data }),
      setNumerologyData: (data) => set({ numerologyData: data }),
      setTraitScores: (scores) => set({ traitScores: scores }),
      setReportSections: (sections) => set({ reportSections: sections }),
      setReportSummary: (summary) => set({ reportSummary: summary }),
      setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
      setHasPaid: (paid) => set({ hasPaid: paid }),
      setError: (error) => set({ error }),
      setUserId: (id) => set({ userId: id }),
      setReportLoading: (loading) => set({ reportLoading: loading }),
      resetKundaliData: () => set({
        astrologyData: null,
        numerologyData: null,
        traitScores: [],
        reportSections: [],
        reportSummary: '',
        reportLoading: false,
        userId: null,
      }),
      setCompatDetail: (data) => set({
        compatPartnerSign: data.partnerSign,
        compatPartnerName: data.partnerName || null,
        compatOverallScore: data.overall,
        compatEmotionalScore: data.emotional,
        compatCommunicationScore: data.communication,
        compatTrustScore: data.trust,
      }),
      reset: () => {
        // Clear persisted storage first to ensure clean slate
        try {
          localStorage.removeItem('ayuastro-storage');
        } catch {
          // Ignore storage errors (e.g. private browsing)
        }
        // Then set state to initial values — this also triggers persist to save clean state
        set(initialState);
      },

      nextOnboardingStep: () => {
        const { onboardingStep } = get();
        const currentIndex = ONBOARDING_STEPS.indexOf(onboardingStep);
        if (currentIndex < ONBOARDING_STEPS.length - 1) {
          set({ onboardingStep: ONBOARDING_STEPS[currentIndex + 1] });
        }
      },

      prevOnboardingStep: () => {
        const { onboardingStep } = get();
        const currentIndex = ONBOARDING_STEPS.indexOf(onboardingStep);
        if (currentIndex > 0) {
          set({ onboardingStep: ONBOARDING_STEPS[currentIndex - 1] });
        }
      },
    }),
    {
      name: 'ayuastro-storage',
      partialize: (state) => ({
        userId: state.userId,
        birthDetails: state.birthDetails,
        questionnaireAnswers: state.questionnaireAnswers,
        astrologyData: state.astrologyData,
        numerologyData: state.numerologyData,
        traitScores: state.traitScores,
        reportSections: state.reportSections,
        reportSummary: state.reportSummary,
        hasPaid: state.hasPaid,
        currentView: state.currentView,
        activeTab: state.activeTab,
        onboardingStep: state.onboardingStep,
        reportLoading: state.reportLoading,
      }),
    }
  )
);
