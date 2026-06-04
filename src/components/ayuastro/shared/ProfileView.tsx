'use client';
import { useState, useEffect } from 'react';
import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Sun,
  Moon,
  Compass,
  Hash,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  FileText,
  Lock,
  BookHeart,
  Infinity as InfinityIcon,
  Wind,
  Share2,
  HelpCircle,
  Download,
  Settings,
  Mail,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';
const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
const ZODIAC_ELEMENTS: Record<string, { element: string; gradientFrom: string; gradientTo: string }> = {
  Aries: { element: 'Fire', gradientFrom: 'from-red-500/10', gradientTo: 'to-orange-500/5' },
  Taurus: { element: 'Earth', gradientFrom: 'from-green-600/10', gradientTo: 'to-emerald-500/5' },
  Gemini: { element: 'Air', gradientFrom: 'from-yellow-500/10', gradientTo: 'to-amber-400/5' },
  Cancer: { element: 'Water', gradientFrom: 'from-blue-400/10', gradientTo: 'to-cyan-400/5' },
  Leo: { element: 'Fire', gradientFrom: 'from-orange-500/10', gradientTo: 'to-amber-500/5' },
  Virgo: { element: 'Earth', gradientFrom: 'from-green-500/10', gradientTo: 'to-lime-500/5' },
  Libra: { element: 'Air', gradientFrom: 'from-pink-400/10', gradientTo: 'to-rose-400/5' },
  Scorpio: { element: 'Water', gradientFrom: 'from-purple-600/10', gradientTo: 'to-indigo-500/5' },
  Sagittarius: { element: 'Fire', gradientFrom: 'from-purple-500/10', gradientTo: 'to-violet-400/5' },
  Capricorn: { element: 'Earth', gradientFrom: 'from-gray-600/10', gradientTo: 'to-slate-500/5' },
  Aquarius: { element: 'Air', gradientFrom: 'from-cyan-500/10', gradientTo: 'to-teal-400/5' },
  Pisces: { element: 'Water', gradientFrom: 'from-teal-400/10', gradientTo: 'to-emerald-400/5' },
};
function getArchetype(traits: TraitScore[]): string {
  if (traits.length === 0) return 'The Seeker';
  const top = [...traits].sort((a, b) => b.score - a.score).slice(0, 3);
  const names = top.map((t) => t.name.toLowerCase());
  if (names.includes('empathy') && names.includes('trust')) return 'The Empathic Guardian';
  if (names.includes('empathy')) return 'The Deep Feeler';
  if (names.includes('resilience')) return 'The Resilient Anchor';
  if (names.includes('communication')) return 'The Expressive Bridge';
  if (names.includes('ambition')) return 'The Driven Architect';
  if (names.includes('intuition')) return 'The Intuitive Oracle';
  return 'The Reflective Seeker';
}
function getArchetypeEmoji(archetype: string): string {
  const map: Record<string, string> = {
    'The Empathic Guardian': '🛡️',
    'The Deep Feeler': '🌊',
    'The Resilient Anchor': '⚓',
    'The Expressive Bridge': '🌉',
    'The Driven Architect': '🏗️',
    'The Intuitive Oracle': '🔮',
    'The Reflective Seeker': '🪞',
  };
  return map[archetype] || '✨';
}
const COSMIC_AGE_DESCRIPTIONS: Record<number, string> = {
  1: 'The Pioneer Soul — eternally forging new paths across the cosmos',
  2: 'The Harmonic Soul — weaving connections between the stars',
  3: 'The Creative Soul — painting the universe with expression',
  4: 'The Architect Soul — building foundations that span galaxies',
  5: 'The Nomadic Soul — exploring every corner of the cosmic expanse',
  6: 'The Nurturing Soul — tending to the garden of the universe',
  7: 'The Mystic Soul — seeking truth beyond the veil of stars',
  8: 'The Sovereign Soul — commanding the cosmic tides of power',
  9: 'The Universal Soul — embracing all that the cosmos offers',
  11: 'The Illumined Soul — a channel for cosmic radiance',
  22: 'The Master Builder Soul — architect of cosmic dreams',
  33: 'The Christed Soul — pure compassion in cosmic form',
};
function getCosmicAge(lifePathNumber: number): { age: number; description: string } {
  const cosmicAge = lifePathNumber * 7 + 100;
  const description = COSMIC_AGE_DESCRIPTIONS[lifePathNumber] || COSMIC_AGE_DESCRIPTIONS[9];
  return { age: cosmicAge, description };
}
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
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

// ─── Auth Form Component ─────────────────────────────────────────────────────

type AuthMode = 'signup' | 'signin';
type ContactMethod = 'email' | 'phone';

function AuthCard({ onAuthSuccess }: { onAuthSuccess: (userId: string, email?: string, phone?: string) => void }) {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Signin fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPhone, setSigninPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (!signupName.trim() || signupName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (contactMethod === 'email' && !signupEmail.trim()) {
      setError('Email is required');
      return;
    }
    if (contactMethod === 'phone' && !signupPhone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const body: Record<string, string> = {
        name: signupName.trim(),
        password: signupPassword,
      };
      if (contactMethod === 'email') body.email = signupEmail.trim();
      if (contactMethod === 'phone') body.phone = signupPhone.trim();

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Signup failed. Please try again.');
        return;
      }

      cosmicToast.success('Welcome to AyuAstro! ✦', 'Your cosmic account has been created');
      onAuthSuccess(data.userId, data.email, data.phone);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async () => {
    setError(null);
    if (contactMethod === 'email' && !signinEmail.trim()) {
      setError('Email is required');
      return;
    }
    if (contactMethod === 'phone' && !signinPhone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!signinPassword) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      const body: Record<string, string> = { password: signinPassword };
      if (contactMethod === 'email') body.email = signinEmail.trim();
      if (contactMethod === 'phone') body.phone = signinPhone.trim();

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      cosmicToast.cosmic('Welcome back! ✦', `Signed in as ${data.name || 'Seeker'}`);
      onAuthSuccess(data.userId, data.email, data.phone);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setError(null);
    setMode(mode === 'signup' ? 'signin' : 'signup');
  };

  const switchContactMethod = () => {
    setError(null);
    setContactMethod(contactMethod === 'email' ? 'phone' : 'email');
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden relative">
      {/* Gold accent border at top */}
      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-gold/10 dark:bg-gold/15 border border-gold/20">
              {mode === 'signup' ? (
                <User className="size-6 text-gold" />
              ) : (
                <LogIn className="size-6 text-gold" />
              )}
            </div>
          </div>
          <h3 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-600">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">
            {mode === 'signup'
              ? 'Save your cosmic journey & access it anywhere'
              : 'Sign in to continue your cosmic exploration'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-xs font-medium text-brown-700 dark:text-brown-400 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Contact method toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-brown-700 dark:text-brown-400">
                  {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <button
                  type="button"
                  onClick={switchContactMethod}
                  className="text-[11px] text-gold-dark dark:text-gold hover:underline font-medium"
                >
                  Use {contactMethod === 'email' ? 'phone' : 'email'} instead
                </button>
              </div>
              <div className="relative">
                {contactMethod === 'email' ? (
                  <>
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={mode === 'signup' ? signupEmail : signinEmail}
                      onChange={(e) => mode === 'signup' ? setSignupEmail(e.target.value) : setSigninEmail(e.target.value)}
                      className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
                    />
                  </>
                ) : (
                  <>
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mode === 'signup' ? signupPhone : signinPhone}
                      onChange={(e) => mode === 'signup' ? setSignupPhone(e.target.value) : setSigninPhone(e.target.value)}
                      className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="text-xs font-medium text-brown-700 dark:text-brown-400 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  value={mode === 'signup' ? signupPassword : signinPassword}
                  onChange={(e) => mode === 'signup' ? setSignupPassword(e.target.value) : setSigninPassword(e.target.value)}
                  className="pl-10 pr-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-300 dark:text-brown-500 hover:text-gold dark:hover:text-gold transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-2.5"
                >
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              onClick={mode === 'signup' ? handleSignup : handleSignin}
              disabled={isLoading}
              className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light font-semibold"
            >
              {isLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mr-2"
                >
                  <Sparkles className="size-4" />
                </motion.span>
              ) : mode === 'signup' ? (
                <User className="mr-2 size-4" />
              ) : (
                <LogIn className="mr-2 size-4" />
              )}
              {isLoading
                ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </Button>

            {/* Switch mode link */}
            <p className="text-center text-xs text-brown-400 dark:text-brown-500 mt-2">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={switchMode} className="text-gold-dark dark:text-gold font-semibold hover:underline">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={switchMode} className="text-gold-dark dark:text-gold font-semibold hover:underline">
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ─── Account Status Card (Logged In) ─────────────────────────────────────────

function AccountStatusCard({
  isLoggedIn,
  authEmail,
  authPhone,
  userId,
  memberSince,
  onSignOut,
  onEditProfile,
}: {
  isLoggedIn: boolean;
  authEmail: string | null;
  authPhone: string | null;
  userId: string | null;
  memberSince: string;
  onSignOut: () => void;
  onEditProfile: () => void;
}) {
  const contactDisplay = authEmail || authPhone || '—';

  return (
    <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
          <Sparkles className="size-5 text-gold" />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Logged in badge */}
        {isLoggedIn && (
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Signed in as {contactDisplay}
            </span>
          </div>
        )}

        {/* Account details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              {authEmail ? <Mail className="size-3 text-brown-400" /> : <Phone className="size-3 text-brown-400" />}
              <p className="text-[10px] uppercase tracking-wider text-brown-400">
                {authEmail ? 'Email' : 'Phone'}
              </p>
            </div>
            <p className="text-xs font-semibold text-brown-900 dark:text-brown-600 truncate">
              {contactDisplay}
            </p>
          </div>
          <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="size-3 text-brown-400" />
              <p className="text-[10px] uppercase tracking-wider text-brown-400">Member Since</p>
            </div>
            <p className="text-xs font-semibold text-brown-900 dark:text-brown-600">{memberSince}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={onEditProfile}
            variant="outline"
            size="sm"
            className="flex-1 border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 text-xs"
          >
            <Edit className="mr-1.5 size-3.5" />
            Edit Profile
          </Button>
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className="text-brown-400 dark:text-brown-500 hover:text-red-600 dark:hover:text-red-400 text-xs"
          >
            <LogOut className="mr-1.5 size-3.5" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Profile Edit Form ────────────────────────────────────────────────────────

function ProfileEditForm({
  currentName,
  currentEmail,
  currentPhone,
  userId,
  onCancel,
  onSave,
}: {
  currentName: string;
  currentEmail: string | null;
  currentPhone: string | null;
  userId: string | null;
  onCancel: () => void;
  onSave: (name: string, email: string, phone: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail || '');
  const [phone, setPhone] = useState(currentPhone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, string> = { userId: userId!, name: name.trim() };
      if (email.trim()) body.email = email.trim();
      if (phone.trim()) body.phone = phone.trim();

      const res = await fetch('/api/auth/profile-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      cosmicToast.success('Profile Updated! ✦', 'Your changes have been saved');
      onSave(data.user.name, data.user.email, data.user.phone);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
            <Edit className="size-5 text-gold" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-brown-700 dark:text-brown-400 mb-1.5 block">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-brown-700 dark:text-brown-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-brown-700 dark:text-brown-400 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-500" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="pl-10 bg-cream dark:bg-cream-dark border-brown-200 dark:border-brown-100/30 focus:border-gold dark:focus:border-gold text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-500"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-2.5"
              >
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light text-xs"
            >
              {isSaving ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mr-1.5"
                >
                  <Sparkles className="size-3.5" />
                </motion.span>
              ) : (
                <Save className="mr-1.5 size-3.5" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="border-brown-200 dark:border-brown-100/30 text-brown-500 dark:text-brown-400 hover:bg-brown-50 dark:hover:bg-brown-50/20 text-xs"
            >
              <X className="mr-1 size-3.5" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main ProfileView ─────────────────────────────────────────────────────────

export default function ProfileView() {
  const {
    birthDetails, astrologyData, numerologyData, traitScores, hasPaid,
    reportSections, reset, setView, userId, resetKundaliData, setOnboardingStep,
    setBirthDetails, reportLoading, isLoggedIn, authEmail, authPhone,
    loginUser, logoutUser,
  } = useAyuAstroStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [memberSince, setMemberSince] = useState<string>('—');

  // Fetch member since date from profile API
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetch(`/api/auth/profile?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user?.createdAt) {
            const date = new Date(data.user.createdAt);
            setMemberSince(date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }));
          }
        })
        .catch(() => {
          // Silently fail — member since is non-critical
        });
    }
  }, [isLoggedIn, userId]);

  const handleAuthSuccess = (newUserId: string, email?: string, phone?: string) => {
    loginUser(newUserId, email, phone);
  };

  const handleSignOut = () => {
    logoutUser();
    setIsEditing(false);
    cosmicToast.info('Signed Out ✦', 'You have been signed out successfully');
  };

  const handleProfileSave = (name: string, email: string, phone: string) => {
    // Update store with new profile data
    loginUser(userId!, email || undefined, phone || undefined);
    if (birthDetails) {
      setBirthDetails({ name });
    }
    setIsEditing(false);
  };

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
  const handleReset = () => {
    cosmicToast.cosmic('Starting fresh ✦', 'Your cosmic journey awaits anew');
    reset();
    setView('landing');
  };
  const handleCreateNewKundali = () => {
    const savedName = birthDetails?.name || '';
    resetKundaliData();
    setBirthDetails({ name: savedName });
    setOnboardingStep('birth');
    setView('onboarding');
    cosmicToast.cosmic('New Kundali ✦', 'Enter new birth details — your name is saved');
  };
  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';
  const signInfo = ZODIAC_ELEMENTS[sunSign];
  const archetype = getArchetype(traitScores);
  const archetypeEmoji = getArchetypeEmoji(archetype);
  // Trait highlights
  const sortedTraits = [...traitScores].sort((a, b) => b.score - a.score);
  const top3 = sortedTraits.slice(0, 3);
  const bottom3 = sortedTraits.slice(-3).reverse();
  // Cosmic Score: average of top 5 traits
  const top5 = sortedTraits.slice(0, 5);
  const cosmicScore = top5.length > 0
    ? Math.round(top5.reduce((sum, t) => sum + t.score, 0) / top5.length)
    : 0;
  // Account stats
  const analysisDate = birthDetails?.dateOfBirth || '—';
  const questionsAnswered = 8;
  const sectionsUnlocked = hasPaid ? reportSections.length : reportSections.filter(s => s.insightLevel === 'free').length;

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-lg space-y-6"
      >
        {/* ── Account Creation Card (shown when NOT logged in) ── */}
        {!isLoggedIn && (
          <motion.div variants={staggerItem}>
            <AuthCard onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {/* ── Account Status Card (shown when LOGGED IN) ── */}
        {isLoggedIn && (
          <motion.div variants={staggerItem}>
            <AccountStatusCard
              isLoggedIn={isLoggedIn}
              authEmail={authEmail}
              authPhone={authPhone}
              userId={userId}
              memberSince={memberSince}
              onSignOut={handleSignOut}
              onEditProfile={() => setIsEditing(true)}
            />
          </motion.div>
        )}

        {/* ── Profile Edit Mode ── */}
        <AnimatePresence>
          {isEditing && (
            <motion.div variants={staggerItem}>
              <ProfileEditForm
                currentName={birthDetails?.name || ''}
                currentEmail={authEmail}
                currentPhone={authPhone}
                userId={userId}
                onCancel={() => setIsEditing(false)}
                onSave={handleProfileSave}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cosmic Identity Card */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-md overflow-hidden relative">
            {/* Radial gradient glow behind card */}
            <div className="absolute -inset-4 bg-radial-[at_50%_30%] from-gold/10 to-transparent pointer-events-none blur-xl" aria-hidden="true" />
            <div className={`relative bg-gradient-to-br ${signInfo?.gradientFrom || 'from-gold/10'} ${signInfo?.gradientTo || 'to-brown-100/5'} dark:from-gold/5 dark:to-brown-50/5 p-6`}>
              {/* Decorative zodiac pattern */}
              <div className="absolute top-2 right-3 text-gold/10 text-xs tracking-[0.5em] leading-relaxed select-none">
                <div>♈ ♉ ♊ ♋</div>
                <div>♌ ♍ ♎ ♏</div>
                <div>♐ ♑ ♒ ♓</div>
              </div>
              <div className="absolute bottom-2 left-3 text-gold/10 text-xs tracking-[0.5em] leading-relaxed select-none">
                <div>☉ ☽ ☿ ♀</div>
                <div>♂ ♃ ♄ ♅</div>
              </div>
              {/* Decorative border */}
              <div className="absolute inset-2 border border-gold/10 rounded-xl pointer-events-none" />
              <div className="relative text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-white/60 border-2 border-gold/20">
                    <span className="text-4xl">{ZODIAC_ICONS[sunSign]}</span>
                  </div>
                </div>
                <h1
                  className="font-serif text-2xl font-bold text-brown-900"
                >
                  {birthDetails?.name || 'Seeker'}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg">{archetypeEmoji}</span>
                  <p
                    className="font-serif text-sm font-semibold text-gold-dark"
                  >
                    {archetype}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-gold/15 mx-auto mb-1">
                      <Sun className="size-4 text-gold" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Sun</p>
                    <p className="text-xs font-semibold text-brown-900">{sunSign}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-brown-200 mx-auto mb-1">
                      <Moon className="size-4 text-brown-400" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Moon</p>
                    <p className="text-xs font-semibold text-brown-900">{moonSign}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-sage/20 mx-auto mb-1">
                      <Compass className="size-4 text-brown-500" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Asc</p>
                    <p className="text-xs font-semibold text-brown-900">{ascendant}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        {/* Cosmic Score Section */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {/* SVG Progress Ring */}
                <div className="relative mb-4">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                    <defs>
                      <linearGradient id="cosmicScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B8960C" />
                        <stop offset="50%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#F0C14B" />
                      </linearGradient>
                    </defs>
                    {/* Background circle */}
                    <circle
                      cx="100" cy="100" r="85"
                      fill="none"
                      stroke="rgba(93,64,55,0.08)"
                      strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="100" cy="100" r="85"
                      fill="none"
                      stroke="url(#cosmicScoreGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 85}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - (cosmicScore / 100)) }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                    <motion.span
                      className="text-gold-gradient font-serif text-5xl font-bold"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    >
                      {cosmicScore}
                    </motion.span>
                    <span className="text-xs text-brown-400 dark:text-brown-500 mt-1">/100</span>
                  </div>
                </div>
                {/* Score label */}
                <h3
                  className="font-serif text-lg font-semibold text-brown-900 dark:text-brown-600 mb-1 text-center"
                >
                  Your Cosmic Score: {cosmicScore}/100
                </h3>
                {/* What this means tooltip */}
                <div className="flex items-center gap-1.5 mb-4">
                  <p className="text-xs text-brown-400 dark:text-brown-500">
                    Based on your top 5 emotional traits
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-brown-300 hover:text-gold dark:text-brown-500 dark:hover:text-gold transition-colors" aria-label="What does this score mean?">
                          <HelpCircle className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px] bg-white dark:bg-brown-800 text-brown-700 dark:text-brown-400 text-xs border border-gold/10">
                        <p>Your Cosmic Score reflects the overall alignment of your top emotional traits. A higher score indicates stronger self-awareness and emotional harmony across key dimensions of your personality.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* Share Score Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cosmicToast.info('Cosmic Score shared! ✦', `My Cosmic Score is ${cosmicScore}/100`)}
                  className="border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 text-xs"
                >
                  <Share2 className="size-3.5 mr-1.5" />
                  Share Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Trait Highlights */}
        {traitScores.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                  <BarChart3 className="size-5 text-gold" />
                  Trait Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Top 3 Traits */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="size-3.5 text-sage-dark" />
                    <span className="text-xs font-semibold text-sage-dark uppercase tracking-wider">Strongest Traits</span>
                  </div>
                  <div className="space-y-2">
                    {top3.map((trait, i) => (
                      <div key={trait.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brown-700 w-24 truncate">{trait.label || trait.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-sage-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                            className="h-full rounded-full bg-sage"
                          />
                        </div>
                        <span className="text-xs font-semibold text-sage-dark w-8 text-right">{Math.round(trait.score)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-3 bg-brown-100" />
                {/* Bottom 3 Traits */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingDown className="size-3.5 text-gold-dark" />
                    <span className="text-xs font-semibold text-gold-dark uppercase tracking-wider">Growth Areas</span>
                  </div>
                  <div className="space-y-2">
                    {bottom3.map((trait, i) => (
                      <div key={trait.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brown-700 w-24 truncate">{trait.label || trait.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-gold/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gold"
                          />
                        </div>
                        <span className="text-xs font-semibold text-gold-dark w-8 text-right">{Math.round(trait.score)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Birth Details */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <User className="size-5 text-brown-500" />
                Birth Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Date of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.dateOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Time of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.timeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Place of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.placeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                {birthDetails?.relationshipStatus && (
                  <div className="flex items-center gap-3">
                    <Heart className="size-4 text-brown-300" />
                    <div>
                      <p className="text-xs text-brown-400">Relationship Status</p>
                      <p className="text-sm font-medium text-brown-900">
                        {birthDetails.relationshipStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Astrology Summary */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <Moon className="size-5 text-gold" />
                Vedic Astrology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Sun className="mx-auto mb-1 size-4 text-gold" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Sun</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.sunSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Moon className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Moon</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.moonSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Compass className="mx-auto mb-1 size-4 text-brown-500" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Ascendant</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.ascendant || '—'}
                  </p>
                </div>
              </div>
              {astrologyData?.nakshatra && (
                <>
                  <Separator className="my-3 bg-brown-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brown-400">Nakshatra</p>
                      <p className="text-sm font-medium text-brown-900">{astrologyData.nakshatra}</p>
                    </div>
                    {astrologyData.currentDasha && (
                      <div className="text-right">
                        <p className="text-xs text-brown-400">Current Dasha</p>
                        <p className="text-sm font-medium text-brown-900">{astrologyData.currentDasha}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              {astrologyData?.yogas && astrologyData.yogas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Yogas</p>
                  <div className="flex flex-wrap gap-1">
                    {astrologyData.yogas.map((yoga, i) => (
                      <Badge key={i} className="bg-sage-muted text-sage-dark border-0 text-xs">
                        {yoga}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Numerology Summary */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <Hash className="size-5 text-gold" />
                Numerology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Life Path</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                  >
                    {numerologyData?.lifePathNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Destiny</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                  >
                    {numerologyData?.destinyNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Soul Urge</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                  >
                    {numerologyData?.soulUrgeNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Personality</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                  >
                    {numerologyData?.personalityNumber || '—'}
                  </p>
                </div>
              </div>
              {numerologyData?.lifePathDesc && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Life Path Description</p>
                  <p className="text-sm text-brown-600 leading-relaxed">
                    {numerologyData.lifePathDesc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Payment Status Section */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg overflow-hidden">
            <div className={`h-1 ${hasPaid ? 'bg-gradient-to-r from-gold via-gold-light to-gold-dark' : 'bg-gradient-to-r from-brown-200 via-brown-300 to-brown-200'}`} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                {hasPaid ? (
                  <Star className="size-5 text-gold" />
                ) : (
                  <Lock className="size-5 text-brown-400" />
                )}
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPaid ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/10 dark:bg-gold/15 border border-gold/20">
                    <Star className="size-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border border-gold/20 dark:border-gold/15 text-xs font-semibold px-3 py-1">
                      Premium Member ✓
                    </Badge>
                    <p className="text-xs text-brown-400 dark:text-brown-500 mt-1.5">
                      Full access to all premium sections and reports unlocked.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border border-brown-200 dark:border-brown-100/30">
                      <Lock className="size-5 text-brown-300 dark:text-brown-500" />
                    </div>
                    <div className="flex-1">
                      <Badge className="bg-brown-50 dark:bg-brown-50/20 text-brown-400 dark:text-brown-500 border border-brown-200 dark:border-brown-100/30 text-xs font-medium px-3 py-1">
                        Free Plan
                      </Badge>
                      <p className="text-xs text-brown-400 dark:text-brown-500 mt-1.5">
                        Upgrade to unlock all premium sections and deep analysis.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setView('premium')}
                      size="sm"
                      className="flex-1 bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light text-xs"
                    >
                      <Star className="mr-1.5 size-3.5" />
                      Upgrade to Premium
                    </Button>
                    <Button
                      onClick={() => setView('premium')}
                      variant="ghost"
                      size="sm"
                      className="text-brown-400 dark:text-brown-500 hover:text-gold-dark dark:hover:text-gold text-xs"
                    >
                      Verify Payment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Account Stats */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <Sparkles className="size-5 text-gold" />
                Account Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <FileText className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Analysis</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-600">{analysisDate !== '—' ? 'Complete' : 'Pending'}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <BarChart3 className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Questions</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-600">{questionsAnswered}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  {hasPaid ? (
                    <Star className="mx-auto mb-1 size-4 text-gold" />
                  ) : (
                    <Lock className="mx-auto mb-1 size-4 text-brown-300" />
                  )}
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Unlocked</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-600">{sectionsUnlocked}/{reportSections.length || 7}</p>
                </div>
              </div>
              {!hasPaid && (
                <div className="mt-3">
                  <Button
                    onClick={() => setView('premium')}
                    variant="outline"
                    size="sm"
                    className="w-full border-gold/30 text-gold-dark hover:bg-gold/5"
                  >
                    <Star className="mr-1 size-3.5" />
                    Unlock All Sections
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Mood Journal Card */}
        <motion.div variants={staggerItem} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="card-hover border-0 shadow-md bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(139,111,71,0.12)]"
            onClick={() => setView('mood')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-brown-50/20 border border-gold/20">
                  <BookHeart className="size-6 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-semibold text-brown-900 dark:text-brown-600"
                   >
                    Mood Journal
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5">
                    Track your emotional patterns
                  </p>
                </div>
                <span className="text-2xl">🤩</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Breathing & Meditation Card */}
        <motion.div variants={staggerItem} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="card-hover border-0 shadow-md bg-gradient-to-br from-sage-muted/15 to-gold/10 dark:from-sage-muted/10 dark:to-gold/5 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(139,111,71,0.12)]"
            onClick={() => setView('breathing')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-brown-50/20 border border-sage/20">
                  <Wind className="size-6 text-sage-dark dark:text-sage" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-semibold text-brown-900 dark:text-brown-600"
                   >
                    Breathing & Meditation
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5">
                    Find your cosmic calm
                  </p>
                </div>
                <span className="text-2xl">🌬️</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Cosmic Age Card */}
        {numerologyData?.lifePathNumber && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md overflow-hidden bg-white dark:bg-white/[0.08] transition-all hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                  <InfinityIcon className="size-5 text-gold" />
                  Cosmic Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const cosmicAge = getCosmicAge(numerologyData.lifePathNumber);
                  return (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span
                          className="text-gold-gradient font-serif text-5xl font-bold"
                        >
                          {cosmicAge.age}
                        </span>
                        <span className="text-sm text-brown-400 dark:text-brown-500">cosmic<br/>years</span>
                      </div>
                      <p className="text-sm text-brown-500 dark:text-brown-500 leading-relaxed mt-2">
                        {cosmicAge.description}
                      </p>
                      <p className="text-[10px] text-brown-300 dark:text-brown-600 mt-2">
                        Based on Life Path {numerologyData.lifePathNumber} — your soul has traversed {cosmicAge.age} cosmic years of evolution
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Decorative section divider */}
        <div className="section-divider">
          <span className="text-gold text-lg zodiac-glow">✦</span>
        </div>
        {/* Settings Card */}
        <motion.div variants={staggerItem} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="card-hover border-0 shadow-md bg-gradient-to-br from-brown-50/80 to-gold/5 dark:from-brown-50/10 dark:to-gold/5 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(139,111,71,0.12)]"
            onClick={() => setView('settings')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-brown-50/20 border border-brown-200/50 dark:border-brown-100/30">
                  <Settings className="size-6 text-brown-600 dark:text-brown-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-semibold text-brown-900 dark:text-brown-600"
                   >
                    Settings
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5">
                    Theme, preferences, privacy & more
                  </p>
                </div>
                <span className="text-2xl">⚙️</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Create New Kundali Button — prominent */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={handleCreateNewKundali}
            className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light"
          >
            <Sparkles className="mr-2 size-4" />
            Create New Kundali
          </Button>
        </motion.div>
        {/* Export My Data Button */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 disabled:opacity-50"
          >
            {isExporting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block mr-2"
              >
                <Sparkles className="size-4" />
              </motion.span>
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </motion.div>
        {/* Report Loading Indicator */}
        {reportLoading && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md bg-gradient-to-r from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gold/10">
                    <Sparkles className="size-4 text-gold animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brown-900 dark:text-brown-600">AI Report Generating...</p>
                    <p className="text-xs text-brown-400 dark:text-brown-500">Your personalized report is being written in the background</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Start Over — with shake on hover */}
        <motion.div variants={staggerItem}>
          <motion.div
            whileHover={{ x: [0, -3, 3, -3, 3, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-brown-200 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
            >
              <RotateCcw className="mr-2 size-4" />
              Start Over
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
