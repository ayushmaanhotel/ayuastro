import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// View types for the single-page app
export type AppView = 'landing' | 'onboarding' | 'calculating' | 'insights' | 'report' | 'premium' | 'profile' | 'wisdom' | 'store' | 'sync' | 'chat' | 'mood' | 'breathing' | 'yogaDosha' | 'compatibilityDetail' | 'dashboard' | 'calendar' | 'cosmicSounds' | 'zodiacDeepDive' | 'gratitudeJournal' | 'zodiacGame' | 'nakshatraDeepDive' | 'comprehensiveKundali' | 'settings';
export type OnboardingStep = 'name' | 'birth' | 'relationship' | 'questionnaire' | 'preview' | 'complete';
export type BottomNavTab = 'insights' | 'chat' | 'sync' | 'store' | 'profile';

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

export type CalculationMethod = 'swiss-ephemeris' | 'meeus-fallback';

export interface PlanetaryPositionInfo {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
  isCombust?: boolean;
}

export interface AstrologyInfo {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  currentDasha: string;
  yogas: string[];
  doshas: string[];
  /** Which calculation engine produced this data */
  calculationMethod: CalculationMethod;
  planetaryPositions: Record<string, PlanetaryPositionInfo>;
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

  // Auth state
  isLoggedIn: boolean;
  authEmail: string | null;
  authPhone: string | null;
  language: 'en' | 'hi' | 'hinglish';
  vedicLevel: 'standard' | 'detailed' | 'hinglish';
  dailyHoroscopeNotif: boolean;
  moodRemindersNotif: boolean;

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
  setAuthState: (data: { isLoggedIn: boolean; authEmail?: string | null; authPhone?: string | null }) => void;
  setLanguage: (lang: 'en' | 'hi' | 'hinglish') => void;
  setVedicLevel: (level: 'standard' | 'detailed' | 'hinglish') => void;
  setDailyHoroscopeNotif: (enabled: boolean) => void;
  setMoodRemindersNotif: (enabled: boolean) => void;
  loginUser: (userId: string, email?: string, phone?: string) => void;
  logoutUser: () => void;
  reset: () => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = ['name', 'birth', 'relationship', 'questionnaire', 'preview', 'complete'];

// ─── Data Normalization ──────────────────────────────────────────────────────

const ZODIAC_SIGNS_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/**
 * Normalize astrology data to ensure all planetary positions have consistent fields.
 *
 * This function ensures that every planet entry in `planetaryPositions` has:
 * - `sign` (string zodiac sign name)
 * - `degree` (number 0-30)
 * - `house` (number 1-12) — recalculated from signIndex if missing
 * - `retrograde` (boolean)
 * - `nakshatra` (string)
 * - `nakshatraPada` (number 1-4)
 * - `isCombust` (boolean)
 *
 * It also ensures `calculationMethod` defaults to 'meeus-fallback' if not set.
 *
 * @param data - Raw AstrologyInfo from the backend
 * @returns Normalized AstrologyInfo with all fields guaranteed present
 */
function normalizeAstrologyData(data: AstrologyInfo): AstrologyInfo {
  if (!data) return data;

  const ascSignIndex = ZODIAC_SIGNS_LIST.indexOf(data.ascendant as typeof ZODIAC_SIGNS_LIST[number]);

  const normalizedPositions: Record<string, PlanetaryPositionInfo> = {};

  for (const [planetKey, pos] of Object.entries(data.planetaryPositions || {})) {
    if (!pos) continue;

    // Calculate house from sign relative to ascendant if missing
    let house = pos.house;
    if (house === undefined || house === null || isNaN(house)) {
      const planetSignIndex = ZODIAC_SIGNS_LIST.indexOf(pos.sign as typeof ZODIAC_SIGNS_LIST[number]);
      if (planetSignIndex >= 0 && ascSignIndex >= 0) {
        house = ((planetSignIndex - ascSignIndex) % 12 + 12) % 12 + 1;
      } else {
        house = 1; // Fallback — should not happen with valid data
      }
    }

    // Ensure house is in valid range 1-12
    house = Math.max(1, Math.min(12, Math.round(house)));

    normalizedPositions[planetKey] = {
      sign: pos.sign || 'Aries',
      degree: typeof pos.degree === 'number' && !isNaN(pos.degree) ? pos.degree : 0,
      house,
      retrograde: pos.retrograde ?? false,
      nakshatra: pos.nakshatra ?? 'Ashwini',
      nakshatraPada: pos.nakshatraPada ?? 1,
      isCombust: pos.isCombust ?? false,
    };
  }

  return {
    sunSign: data.sunSign || 'Aries',
    moonSign: data.moonSign || 'Aries',
    ascendant: data.ascendant || 'Aries',
    nakshatra: data.nakshatra || 'Ashwini',
    currentDasha: data.currentDasha || 'Unknown',
    yogas: data.yogas || [],
    doshas: data.doshas || [],
    calculationMethod: data.calculationMethod || 'meeus-fallback',
    planetaryPositions: normalizedPositions,
  };
}

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
  isLoggedIn: false,
  authEmail: null as string | null,
  authPhone: null as string | null,
  language: 'en' as 'en' | 'hi' | 'hinglish',
  vedicLevel: 'standard' as 'standard' | 'detailed' | 'hinglish',
  dailyHoroscopeNotif: true,
  moodRemindersNotif: true,
};

export const useAyuAstroStore = create<AyuAstroState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Data Normalization ────────────────────────────────────────────────

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
      setAstrologyData: (data) => set({ astrologyData: normalizeAstrologyData(data) }),
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
        birthDetails: null,
        questionnaireAnswers: [],
        currentView: 'landing',
        onboardingStep: 'name',
        isLoading: false,
        loadingMessage: '',
        error: null,
        isLoggedIn: false,
        authEmail: null,
        authPhone: null,
        language: 'en',
        vedicLevel: 'standard',
        dailyHoroscopeNotif: true,
        moodRemindersNotif: true,
      }),
      setCompatDetail: (data) => set({
        compatPartnerSign: data.partnerSign,
        compatPartnerName: data.partnerName || null,
        compatOverallScore: data.overall,
        compatEmotionalScore: data.emotional,
        compatCommunicationScore: data.communication,
        compatTrustScore: data.trust,
      }),
      setAuthState: (data) => set({
        isLoggedIn: data.isLoggedIn,
        authEmail: data.authEmail !== undefined ? data.authEmail : get().authEmail,
        authPhone: data.authPhone !== undefined ? data.authPhone : get().authPhone,
      }),
      setLanguage: (lang) => set({ language: lang }),
      setVedicLevel: (level) => set({ vedicLevel: level }),
      setDailyHoroscopeNotif: (enabled) => set({ dailyHoroscopeNotif: enabled }),
      setMoodRemindersNotif: (enabled) => set({ moodRemindersNotif: enabled }),
      loginUser: (userId, email, phone) => set({
        userId,
        isLoggedIn: true,
        authEmail: email ?? null,
        authPhone: phone ?? null,
      }),
      logoutUser: () => set({
        isLoggedIn: false,
        authEmail: null,
        authPhone: null,
        userId: null,
        // Keep onboarding data intact
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
        isLoggedIn: state.isLoggedIn,
        authEmail: state.authEmail,
        authPhone: state.authPhone,
        language: state.language,
        vedicLevel: state.vedicLevel,
        dailyHoroscopeNotif: state.dailyHoroscopeNotif,
        moodRemindersNotif: state.moodRemindersNotif,
      }),
    }
  )
);
