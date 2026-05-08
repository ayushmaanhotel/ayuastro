'use client';

import { useState, useEffect } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Sun,
  Moon,
  Bell,
  Globe,
  Shield,
  Download,
  Trash2,
  Info,
  Heart,
  RotateCcw,
  Sparkles,
  Eye,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SettingsView() {
  const {
    birthDetails,
    astrologyData,
    reset,
    setView,
    userId,
    resetKundaliData,
    setOnboardingStep,
    setBirthDetails,
  } = useAyuAstroStore();
  const { theme, setTheme } = useTheme();

  // Preferences from localStorage
  const [dailyHoroscope, setDailyHoroscope] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('ayuastro-prefs');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (typeof prefs.dailyHoroscope === 'boolean') setDailyHoroscope(prefs.dailyHoroscope);
        if (typeof prefs.moodReminders === 'boolean') setMoodReminders(prefs.moodReminders);
        if (prefs.language === 'en' || prefs.language === 'hi') setLanguage(prefs.language);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        'ayuastro-prefs',
        JSON.stringify({ dailyHoroscope, moodReminders, language })
      );
    } catch {
      // ignore storage errors
    }
  }, [dailyHoroscope, moodReminders, language]);

  const handleExportData = async () => {
    if (!userId) {
      cosmicToast.warning('No user data found', 'Please complete onboarding first');
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch(`/api/user/export?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Export failed');
      }
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ayuastro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      cosmicToast.success('Data Exported! ✦', 'Your cosmic data has been downloaded');
    } catch (err) {
      cosmicToast.warning('Export Failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = () => {
    reset();
    setView('landing');
    cosmicToast.cosmic('Data Deleted ✦', 'All your data has been removed');
  };

  const handleResetAllData = () => {
    reset();
    setView('landing');
    cosmicToast.cosmic('Reset Complete ✦', 'Starting fresh — your cosmic journey awaits');
  };

  const handleCreateNewKundali = () => {
    const savedName = birthDetails?.name || '';
    resetKundaliData();
    setBirthDetails({ name: savedName });
    setOnboardingStep('birth');
    setView('onboarding');
    cosmicToast.cosmic('New Kundali ✦', 'Enter new birth details — your name is saved');
  };

  const handleEditProfile = () => {
    const savedName = birthDetails?.name || '';
    resetKundaliData();
    setBirthDetails({ name: savedName });
    setOnboardingStep('name');
    setView('onboarding');
    cosmicToast.cosmic('Edit Profile ✦', 'Update your details');
  };

  return (
    <div className="bg-cream dark:bg-[#1A1412] px-4 py-6 pb-24">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-lg space-y-6"
      >
        {/* Header with Back Button */}
        <motion.div variants={staggerItem} className="flex items-center gap-3">
          <button
            onClick={() => setView('profile')}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-brown-50 dark:hover:bg-brown-800"
            aria-label="Back to profile"
          >
            <ArrowLeft className="size-5 text-brown-700 dark:text-brown-300" />
          </button>
          <div>
            <h1
              className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Settings
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">Manage your AyuAstro experience</p>
          </div>
        </motion.div>

        {/* ─── Account Section ─────────────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <User className="size-5 text-gold" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20">
                      <span className="text-sm font-semibold text-brown-700 dark:text-brown-300">
                        {birthDetails?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-900 dark:text-brown-100">
                        {birthDetails?.name || 'Not set'}
                      </p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">Display Name</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Birth Details Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-brown-50 dark:bg-brown-50/20 p-2.5">
                    <Calendar className="size-3.5 text-brown-400 dark:text-brown-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-brown-400">DOB</p>
                      <p className="text-xs font-medium text-brown-900 dark:text-brown-100 truncate">
                        {birthDetails?.dateOfBirth || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-brown-50 dark:bg-brown-50/20 p-2.5">
                    <Clock className="size-3.5 text-brown-400 dark:text-brown-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-brown-400">TOB</p>
                      <p className="text-xs font-medium text-brown-900 dark:text-brown-100 truncate">
                        {birthDetails?.timeOfBirth || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-brown-50 dark:bg-brown-50/20 p-2.5">
                    <MapPin className="size-3.5 text-brown-400 dark:text-brown-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-brown-400">POB</p>
                      <p className="text-xs font-medium text-brown-900 dark:text-brown-100 truncate">
                        {birthDetails?.placeOfBirth || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="w-full border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 dark:hover:bg-gold/10"
                >
                  <Settings className="mr-2 size-3.5" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Preferences Section ──────────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Sparkles className="size-5 text-gold" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20">
                      {theme === 'dark' ? (
                        <Moon className="size-4 text-gold" />
                      ) : (
                        <Sun className="size-4 text-brown-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-900 dark:text-brown-100">Dark Mode</p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">
                        {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Daily Horoscope Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20">
                      <Bell className="size-4 text-brown-500 dark:text-brown-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-900 dark:text-brown-100">Daily Horoscope</p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">Get daily cosmic guidance</p>
                    </div>
                  </div>
                  <Switch
                    checked={dailyHoroscope}
                    onCheckedChange={setDailyHoroscope}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Mood Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20">
                      <Heart className="size-4 text-brown-500 dark:text-brown-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-900 dark:text-brown-100">Mood Reminders</p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">Daily mood check-in nudge</p>
                    </div>
                  </div>
                  <Switch
                    checked={moodReminders}
                    onCheckedChange={setMoodReminders}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Language Preference */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20">
                      <Globe className="size-4 text-brown-500 dark:text-brown-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-900 dark:text-brown-100">Language</p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">
                        {language === 'en' ? 'English' : 'Hindi'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        language === 'en'
                          ? 'bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border border-gold/30'
                          : 'text-brown-400 dark:text-brown-500 hover:bg-brown-50 dark:hover:bg-brown-50/20'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('hi')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        language === 'hi'
                          ? 'bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border border-gold/30'
                          : 'text-brown-400 dark:text-brown-500 hover:bg-brown-50 dark:hover:bg-brown-50/20'
                      }`}
                    >
                      हिं
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Privacy & Data Section ───────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Shield className="size-5 text-gold" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Export My Data */}
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  variant="outline"
                  className="w-full border-brown-200 dark:border-brown-100/30 text-brown-700 dark:text-brown-200 hover:bg-brown-50 dark:hover:bg-brown-50/20 justify-start"
                >
                  <Download className="mr-2 size-4" />
                  {isExporting ? 'Exporting...' : 'Export My Data'}
                </Button>

                {/* Delete My Data */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete My Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-[#2A2018] border-brown-200 dark:border-brown-100/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-brown-900 dark:text-brown-100 font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Delete All Your Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-brown-500 dark:text-brown-300">
                        This will permanently remove all your birth details, astrological data, reports, and mood entries. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-brown-200 dark:border-brown-100/30 text-brown-700 dark:text-brown-200">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteData}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Privacy Info */}
                <div className="flex items-start gap-2.5 rounded-lg bg-sage-muted/20 dark:bg-sage-muted/10 p-3">
                  <Shield className="size-4 text-sage-dark dark:text-sage mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-brown-900 dark:text-brown-100">Your data is private</p>
                    <p className="text-[11px] text-brown-400 dark:text-brown-500 leading-relaxed mt-0.5">
                      Birth details and responses are encrypted and never shared with third parties. We believe your cosmic data is as personal as your medical records.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── About Section ────────────────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Info className="size-5 text-gold" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* App Version */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brown-700 dark:text-brown-300">App Version</span>
                  <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/15 dark:text-gold border-0 text-xs">
                    v2.0
                  </Badge>
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* "Nothing to Hide" tagline */}
                <div className="text-center py-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 dark:bg-gold/10 border border-gold/15 dark:border-gold/20">
                    <Eye className="size-4 text-gold-dark dark:text-gold" />
                    <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold-dark dark:text-gold">
                      Nothing to Hide
                    </span>
                  </div>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-2 leading-relaxed max-w-xs mx-auto">
                    AyuAstro promises brutally honest, no-sugarcoating analysis. We don&apos;t flatter — we reveal. Your emotional truth deserves nothing less.
                  </p>
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Built with love */}
                <div className="text-center">
                  <p className="text-xs text-brown-400 dark:text-brown-500">
                    Built with <span className="text-red-500">♥</span> by <span className="font-semibold text-brown-700 dark:text-brown-200">Ayush</span>
                  </p>
                </div>

                <Separator className="bg-brown-100 dark:bg-brown-100/20" />

                {/* Links */}
                <div className="space-y-2">
                  <button
                    onClick={() => cosmicToast.info('Coming Soon', 'Terms of Service page coming soon')}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg text-sm text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/20 transition-colors"
                  >
                    <span>Terms of Service</span>
                    <ExternalLink className="size-3.5 text-brown-300 dark:text-brown-500" />
                  </button>
                  <button
                    onClick={() => cosmicToast.info('Coming Soon', 'Privacy Policy page coming soon')}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg text-sm text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/20 transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <ExternalLink className="size-3.5 text-brown-300 dark:text-brown-500" />
                  </button>
                  <button
                    onClick={() => cosmicToast.info('Support', 'Email us at support@ayuastro.com')}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg text-sm text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/20 transition-colors"
                  >
                    <span>Support</span>
                    <ExternalLink className="size-3.5 text-brown-300 dark:text-brown-500" />
                  </button>
                </div>

                {/* Social Links Placeholder */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => cosmicToast.info('Social', 'Follow us on Instagram @ayuastro')}
                    className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 text-brown-500 dark:text-brown-400 hover:bg-gold/10 dark:hover:bg-gold/20 hover:text-gold-dark dark:hover:text-gold transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </button>
                  <button
                    onClick={() => cosmicToast.info('Social', 'Follow us on X @ayuastro')}
                    className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 text-brown-500 dark:text-brown-400 hover:bg-gold/10 dark:hover:bg-gold/20 hover:text-gold-dark dark:hover:text-gold transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>
                  <button
                    onClick={() => cosmicToast.info('Social', 'Join our community!')}
                    className="flex size-9 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 text-brown-500 dark:text-brown-400 hover:bg-gold/10 dark:hover:bg-gold/20 hover:text-gold-dark dark:hover:text-gold transition-colors"
                    aria-label="Discord"
                  >
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Danger Zone Section ──────────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5 border-l-4 border-l-red-400 dark:border-l-red-500 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
                <Trash2 className="size-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-xs text-brown-400 dark:text-brown-500 mb-2">
                  These actions are irreversible. Please be certain.
                </p>

                {/* Reset All Data */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start"
                    >
                      <RotateCcw className="mr-2 size-4" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-[#2A2018] border-brown-200 dark:border-brown-100/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-brown-900 dark:text-brown-100 font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Reset All Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-brown-500 dark:text-brown-300">
                        This will erase everything and take you back to the beginning. All your analysis, reports, and mood entries will be lost forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-brown-200 dark:border-brown-100/30 text-brown-700 dark:text-brown-200">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetAllData}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Create New Kundali */}
                <Button
                  onClick={handleCreateNewKundali}
                  variant="outline"
                  className="w-full border-brown-200 dark:border-brown-100/30 text-brown-700 dark:text-brown-200 hover:bg-brown-50 dark:hover:bg-brown-50/20 justify-start"
                >
                  <Sparkles className="mr-2 size-4" />
                  Create New Kundali
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
