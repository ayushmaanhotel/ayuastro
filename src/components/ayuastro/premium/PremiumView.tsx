'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Eye,
  CheckCircle2,
  Shield,
  ArrowRight,
  Quote,
  Lock,
  Smartphone,
  Diamond,
  Copy,
  Check,
  Clock,
  Upload,
  QrCode,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const benefits = [
  'Comprehensive 14-trait emotional intelligence analysis with depth scoring',
  'Premium sections: Hidden Strengths, Blind Spots, Money Psychology, Life Patterns',
  'Lifetime access to your full profile with periodic cosmic updates',
];

const BENEFIT_ICONS = [
  { icon: Lock, label: 'Lifetime Access', emoji: '🔒' },
  { icon: Smartphone, label: 'Works Everywhere', emoji: '📱' },
  { icon: Diamond, label: 'One-Time Payment', emoji: '💎' },
];

const PREMIUM_SECTIONS = [
  { title: 'Hidden Strengths', description: 'Uncover untapped powers and hidden gifts from your 12th house placements', icon: '✨' },
  { title: 'Emotional Blind Spots', description: 'See the patterns you can\'t see — self-worth, boundaries, and over-giving', icon: '👁' },
  { title: 'Money Psychology', description: 'Transform your financial trajectory by understanding 2nd house patterns', icon: '💰' },
  { title: 'Recurring Life Patterns', description: 'Break free from karmic cycles and understand your life\'s repeating themes', icon: '🔄' },
];

// ─── Testimonials ────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    text: 'The premium report revealed patterns I had been living with for decades without understanding. The money psychology section alone was worth it — I finally see why I keep repeating the same financial cycles.',
    name: 'Ananya S.',
    initial: 'A',
    rating: 5,
    badge: 'Verified Seeker',
  },
  {
    text: 'I was skeptical at first, but the emotional blind spots section was incredibly accurate. It helped me understand why my relationships kept hitting the same walls. Truly eye-opening.',
    name: 'Rahul M.',
    initial: 'R',
    rating: 5,
    badge: 'Deep Explorer',
  },
  {
    text: 'The Vedic astrology insights combined with behavioral science made this feel different from anything else. It\'s not vague — it\'s specific, actionable, and deeply personal.',
    name: 'Priya K.',
    initial: 'P',
    rating: 5,
    badge: 'Premium Member',
  },
];

// ─── Animated Star Rating ────────────────────────────────────────────────────

function AnimatedStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.div
          key={s}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: s <= rating ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
          transition={{ duration: 0.4, delay: s * 0.12, ease: 'easeOut' }}
        >
          <Star className="size-4 fill-gold text-gold" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Countdown Timer with SVG Ring ──────────────────────────────────────────

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, diff };
  }, []);

  const [dayProgress, setDayProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const tl = calculateTimeLeft();
      setTimeLeft(tl);
      // Progress: how much of the day has elapsed (0 = start, 1 = end)
      const totalMs = 24 * 60 * 60 * 1000;
      setDayProgress(1 - tl.diff / totalMs);
    };
    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calculateTimeLeft]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // SVG ring
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - dayProgress * circumference;

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Circular SVG progress ring */}
      <div className="relative size-20">
        <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-brown-100 dark:text-brown-50/20"
          />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-gold"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-brown-400 dark:text-brown-300">
            {Math.round(dayProgress * 100)}%
          </span>
        </div>
      </div>

      <div className="text-left">
        <p className="text-xs text-brown-400 dark:text-brown-500 mb-1">Launch Price Ends In:</p>
        <p
          className={`font-mono text-lg font-bold tracking-wider ${timeLeft.hours < 1 ? 'text-red-500 dark:text-red-400' : 'text-gold-dark dark:text-gold'}`}
          style={timeLeft.hours < 1 ? { textShadow: '0 0 12px rgba(239,68,68,0.4)' } : undefined}
        >
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </p>
      </div>
    </div>
  );
}

// ─── Payment Step Type ─────────────────────────────────────────────────────

type PaymentStep = 'qr' | 'form' | 'pending';

// ─── Payment Step Indicator Component ──────────────────────────────────────

const PAYMENT_STEPS: { key: PaymentStep; label: string; shortLabel: string; icon: typeof QrCode }[] = [
  { key: 'qr', label: 'Scan & Pay', shortLabel: 'Scan', icon: QrCode },
  { key: 'form', label: 'Submit Details', shortLabel: 'Submit', icon: Upload },
  { key: 'pending', label: 'Verification', shortLabel: 'Verify', icon: CheckCircle2 },
];

function PaymentStepIndicator({ currentStep }: { currentStep: PaymentStep }) {
  const stepOrder: PaymentStep[] = ['qr', 'form', 'pending'];
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-5" role="navigation" aria-label="Payment steps">
      {PAYMENT_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-sage-muted border-sage-dark dark:bg-sage/20 dark:border-sage'
                    : isCurrent
                      ? 'bg-gold/15 border-gold dark:bg-gold/20 dark:border-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      : 'bg-brown-50 dark:bg-brown-50/20 border-brown-200 dark:border-brown-100/30'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, delay: 0.05 }}
                    >
                      <Check className="size-4 text-sage-dark dark:text-sage" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StepIcon className={`size-4 ${
                        isCurrent ? 'text-gold-dark dark:text-gold' : 'text-brown-300 dark:text-brown-500'
                      }`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className={`text-[9px] font-medium leading-tight text-center ${
                isCompleted
                  ? 'text-sage-dark dark:text-sage'
                  : isCurrent
                    ? 'text-gold-dark dark:text-gold font-semibold'
                    : 'text-brown-300 dark:text-brown-500'
              }`}>
                {step.shortLabel}
              </span>
            </div>

            {/* Connector Line */}
            {i < PAYMENT_STEPS.length - 1 && (
              <div className="step-connector mx-1.5 sm:mx-3 mb-4" aria-hidden="true">
                <motion.div
                  className="h-0.5 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < currentIndex ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
                  style={{
                    width: i < currentIndex ? '100%' : '0%',
                    background: i < currentIndex
                      ? 'linear-gradient(90deg, #81C784, #D4AF37)'
                      : 'transparent',
                  }}
                />
                <div
                  className="h-0.5 w-8 sm:w-14 rounded-full"
                  style={{
                    background: i < currentIndex
                      ? 'transparent'
                      : 'rgba(188, 170, 164, 0.3)',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PremiumView() {
  const { setView, setHasPaid, birthDetails, userId } = useAyuAstroStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Payment flow state
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('qr');
  const [upiCopied, setUpiCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer' | 'other'>('upi');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check for existing pending verification on mount
  useEffect(() => {
    const checkExistingStatus = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/payment/status?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setHasPaid(true);
            setView('report');
          } else if (data.status === 'pending') {
            setPaymentStep('pending');
          }
        }
      } catch {
        // silently ignore — user can still proceed with manual flow
      }
    };
    checkExistingStatus();
  }, [userId, setHasPaid, setView]);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText('9532013475@kotakbank');
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    } catch {
      // Fallback: select from a temporary input
      const tempInput = document.createElement('input');
      tempInput.value = '9532013475@kotakbank';
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    }
  };

  const handleSubmitVerification = async () => {
    if (!transactionId.trim()) {
      setSubmitError('Please enter your Transaction ID / UTR Number');
      return;
    }
    if (!userId) {
      setSubmitError('User ID not found. Please restart onboarding.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          transactionId: transactionId.trim(),
          paymentMethod,
          screenshotUrl: screenshotFile ? screenshotFile.name : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please try again.');
        return;
      }

      setPaymentStep('pending');
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!userId) return;
    setIsCheckingStatus(true);

    try {
      const res = await fetch(`/api/payment/status?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setHasPaid(true);
          setView('report');
        }
        // If still pending, just keep showing pending state
      }
    } catch {
      // silently ignore
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDemoSkip = () => {
    setHasPaid(true);
    setView('report');
  };

  return (
    <div className="bg-cream dark:bg-[#1A1412] px-4 py-6 pb-24 relative overflow-hidden">
      {/* Floating gold particle effects — 10 floating dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[0,1,2,3,4,5,6,7,8,9].map(p => (
          <motion.div
            key={p}
            className="absolute rounded-full bg-gold/20 dark:bg-gold/15"
            style={{
              width: 3 + (p % 4),
              height: 3 + (p % 4),
              left: `${5 + (p * 9) % 90}%`,
              top: `${10 + (p * 11) % 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (p % 2 === 0 ? 8 : -8), 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + p * 0.6,
              repeat: Infinity,
              delay: p * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-lg space-y-6 relative z-10">
        {/* Hero */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="text-center">
          {/* Limited Time Badge with pulsing red dot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-4"
          >
            <span className="flex size-2">
              <span className="animate-pulse-red absolute inline-flex size-2 rounded-full bg-red-500" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">Limited Time Offer</span>
          </motion.div>

          <h1
            className="font-serif text-3xl font-bold text-brown-900 dark:text-brown-100 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Unlock Your Deep Emotional Intelligence
          </h1>
          <p className="text-sm text-brown-400 dark:text-brown-500 leading-relaxed">
            Gain profound clarity about your emotional patterns, hidden strengths, and the karmic
            cycles shaping your life decisions.
          </p>
        </motion.div>

        {/* Benefit Icons Grid */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.02 }}>
          <div className="grid grid-cols-3 gap-3">
            {BENEFIT_ICONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-white dark:bg-white/5 p-3 text-center card-lift">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-semibold text-brown-700 dark:text-brown-300 leading-tight">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Rating with animated stars */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="text-center">
          <div className="flex items-center justify-center gap-0.5 mb-1">
            <AnimatedStars rating={5} />
          </div>
          <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">4.9/5</p>
          <p className="text-xs text-brown-400 dark:text-brown-500">Trusted Seeker Rating</p>
        </motion.div>

        {/* Premium Visual Report Card Preview */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-premium zodiac-corner relative premium-card shimmer overflow-hidden animate-border-shimmer">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10 dark:bg-gold/15">
                  <Eye className="size-6 text-gold" />
                </div>
                <div>
                  <h3
                    className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Premium Visual Report
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500">
                    {birthDetails?.name || 'Your'} Deep Intelligence Analysis
                  </p>
                </div>
              </div>

              {/* Preview sections list */}
              <div className="space-y-2">
                {[
                  'Emotional Personality',
                  'Relationship Style',
                  'Communication Patterns',
                  'Hidden Strengths',
                  'Emotional Blind Spots',
                  'Money Psychology',
                  'Recurring Life Patterns',
                ].map((section, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      i < 3 ? 'bg-sage-muted/50 dark:bg-sage-muted/30 text-brown-700 dark:text-brown-300' : 'bg-gold/5 dark:bg-gold/10 text-brown-400 dark:text-brown-400'
                    }`}
                  >
                    <div
                      className={`size-1.5 rounded-full ${
                        i < 3 ? 'bg-sage-dark' : 'bg-gold'
                      }`}
                    />
                    {section}
                    {i >= 3 && (
                      <Badge className="ml-auto bg-gold/10 text-gold-dark dark:text-gold border-0 text-[10px] px-1.5 py-0">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What You'll Unlock Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.12 }}>
          <div className="space-y-3">
            <h3
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 text-center mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What You&apos;ll Unlock
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PREMIUM_SECTIONS.map((section, i) => (
                <div key={i} className="glass-light rounded-xl p-4 text-center relative overflow-hidden group card-lift hover:shadow-md transition-shadow">
                  <div className="absolute top-2 right-2">
                    <Lock className="size-3.5 text-gold/40 group-hover:text-gold/70 transition-colors" />
                  </div>
                  <span className="text-2xl mb-2 block">{section.icon}</span>
                  <p className="text-xs font-semibold text-brown-900 dark:text-brown-100 mb-1">{section.title}</p>
                  <p className="text-[10px] text-brown-400 dark:text-brown-300 leading-tight">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="glass-light border-0 shadow-sm dark:bg-white/5">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-brown-900 dark:text-brown-100 mb-4">What you will unlock</h3>
              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-sage-dark dark:text-sage mt-0.5" />
                    <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Pricing + QR Payment Section ─────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }} style={{ willChange: 'transform' }}>
          <div className="relative">
            {/* Rotating golden border using conic-gradient */}
            <div
              className="absolute -inset-[2px] rounded-xl animate-[spin_6s_linear_infinite] opacity-60"
              style={{
                background: 'conic-gradient(from 0deg, #B8960C, #D4AF37, #F0C14B, #D4AF37, #B8960C, transparent, #B8960C)',
              }}
            />
            <Card className="glass-premium zodiac-corner relative border-0 shadow-sm text-center animate-border-shimmer z-10">
              <CardContent className="relative p-6">
                {/* Most Popular badge with shimmer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gold text-white border-0 text-[10px] px-3 py-1 shimmer font-semibold tracking-wider uppercase">
                    Most Popular
                  </Badge>
                </div>
              {/* Countdown Timer with SVG Ring */}
              <CountdownTimer />

              <div className="mt-3 mb-2">
                <span className="text-lg text-brown-300 dark:text-brown-500 line-through">₹1,499</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <motion.span
                  className="font-serif text-5xl font-bold text-brown-900 dark:text-brown-100 animate-float"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ₹499
                </motion.span>
              </div>
              <p className="mt-1 text-xs text-brown-400 dark:text-brown-500">One-time payment</p>

              <Badge className="mt-3 bg-sage-muted text-sage-dark dark:text-sage dark:bg-sage-muted/30 border-0 text-xs font-medium">
                One-time unlock. Lifetime access.
              </Badge>

              <Separator className="my-5 bg-brown-100 dark:bg-brown-100/20" />

              {/* ─── Payment Step Indicator ─────────────────────────────── */}
              <PaymentStepIndicator currentStep={paymentStep} />

              {/* Payment Steps Info Tooltip */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Info className="size-3 text-brown-300 dark:text-brown-500" />
                <p className="text-[10px] text-brown-300 dark:text-brown-500 leading-relaxed">
                  Complete all 3 steps to unlock your premium report. Payment is verified manually within 5–10 minutes.
                </p>
              </div>

              {/* ─── QR Code Payment Flow ────────────────────────────────── */}
              <AnimatePresence mode="wait">
                {paymentStep === 'qr' && (
                  <motion.div
                    key="qr-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* QR Code Section Header */}
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <QrCode className="size-5 text-gold" />
                      <h3
                        className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Scan to Pay
                      </h3>
                    </div>

                    {/* QR Code Image — Premium Decorative Border */}
                    <div className="flex justify-center">
                      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-gold/30 via-gold-light/20 to-gold-dark/30 dark:from-gold/25 dark:via-gold-light/15 dark:to-gold-dark/25 animate-border-shimmer">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-gold/10 via-transparent to-gold/10 blur-md pointer-events-none" aria-hidden="true" />
                        <div className="relative rounded-xl overflow-hidden border border-gold/10 dark:border-gold/20 p-3 bg-white dark:bg-white/10 shadow-lg">
                          <img
                            src="/payment-qr.jpg"
                            alt="UPI Payment QR Code for AyuAstro Premium Report"
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                          />
                          {/* Gold shimmer overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Powered by Kotak 811 */}
                    <p className="text-center text-[10px] text-brown-300 dark:text-brown-500 mt-2 flex items-center justify-center gap-1">
                      <Shield className="size-2.5" />
                      Powered by Kotak 811
                    </p>

                    {/* Payment Details */}
                    <div className="space-y-3 bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-brown-100 dark:border-brown-100/20">
                      {/* Payee Name */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brown-400 dark:text-brown-500">Payee Name</span>
                        <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">AYUSH UPADHYAY</span>
                      </div>

                      <Separator className="bg-brown-100/50 dark:bg-brown-100/10" />

                      {/* UPI ID with Copy Button */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-brown-400 dark:text-brown-500">UPI ID</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-semibold text-brown-900 dark:text-brown-100 bg-brown-50 dark:bg-brown-50/10 px-2 py-0.5 rounded">
                            9532013475@kotakbank
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyUpi}
                            className="h-7 w-7 p-0 hover:bg-gold/10 dark:hover:bg-gold/20 transition-colors"
                            aria-label="Copy UPI ID"
                          >
                            {upiCopied ? (
                              <Check className="size-3.5 text-sage-dark dark:text-sage" />
                            ) : (
                              <Copy className="size-3.5 text-brown-400 dark:text-brown-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-brown-100/50 dark:bg-brown-100/10" />

                      {/* Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brown-400 dark:text-brown-500">Amount</span>
                        <span className="text-sm font-bold text-gold-dark dark:text-gold">₹499</span>
                      </div>
                    </div>

                    {/* Copy UPI ID Button */}
                    <Button
                      onClick={handleCopyUpi}
                      variant="outline"
                      className="w-full border-gold/30 dark:border-gold/40 text-brown-700 dark:text-gold hover:bg-gold/10 dark:hover:bg-gold/20 py-5"
                    >
                      {upiCopied ? (
                        <>
                          <Check className="mr-2 size-4 text-sage-dark dark:text-sage" />
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 size-4" />
                          Copy UPI ID
                        </>
                      )}
                    </Button>

                    {/* Continue to Verification */}
                    <Button
                      onClick={() => setPaymentStep('form')}
                      size="lg"
                      className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 py-6 text-base font-medium text-white hover:bg-brown-800 dark:hover:bg-gold-light"
                    >
                      I&apos;ve Made the Payment
                      <ArrowRight className="ml-2 size-4" />
                    </Button>

                    <p className="text-[10px] text-brown-400 dark:text-brown-500 leading-relaxed">
                      After completing payment via UPI, Bank Transfer, or any method, click above to submit your transaction details for verification.
                    </p>
                  </motion.div>
                )}

                {paymentStep === 'form' && (
                  <motion.div
                    key="form-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Form Header */}
                    <div className="text-center mb-1">
                      <h3
                        className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Verify Your Payment
                      </h3>
                      <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">
                        Enter your payment details below for manual verification
                      </p>
                    </div>

                    {/* Transaction ID / UTR Number */}
                    <div className="space-y-2 text-left">
                      <Label htmlFor="transactionId" className="text-sm font-medium text-brown-700 dark:text-brown-300">
                        Transaction ID / UTR Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="transactionId"
                        placeholder="e.g. 432156789012"
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          setSubmitError(null);
                        }}
                        className="bg-white dark:bg-white/5 border-brown-200 dark:border-brown-100/30 focus-visible:border-gold dark:focus-visible:border-gold focus-visible:ring-gold/20"
                      />
                      <p className="text-[10px] text-brown-400 dark:text-brown-500">
                        Find this in your UPI app or bank statement after payment
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2 text-left">
                      <Label className="text-sm font-medium text-brown-700 dark:text-brown-300">
                        Payment Method <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(val: string) => setPaymentMethod(val as 'upi' | 'bank_transfer' | 'other')}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-white/5 border-brown-200 dark:border-brown-100/30">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#2A2018] border-brown-200 dark:border-brown-100/30">
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Screenshot Upload (optional) */}
                    <div className="space-y-2 text-left">
                      <Label className="text-sm font-medium text-brown-700 dark:text-brown-300">
                        Payment Screenshot <span className="text-[10px] text-brown-400 dark:text-brown-500">(optional)</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 border-dashed border-brown-200 dark:border-brown-100/30 text-brown-500 dark:text-brown-400 hover:bg-gold/5 dark:hover:bg-gold/10"
                          onClick={() => document.getElementById('screenshot-input')?.click()}
                        >
                          <Upload className="size-4 mr-2" />
                          {screenshotFile ? screenshotFile.name.substring(0, 20) : 'Choose File'}
                        </Button>
                        {screenshotFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-brown-400 hover:text-red-500"
                            onClick={() => setScreenshotFile(null)}
                          >
                            Remove
                          </Button>
                        )}
                        <input
                          id="screenshot-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setScreenshotFile(file);
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-brown-400 dark:text-brown-500">
                        Helps speed up verification
                      </p>
                    </div>

                    {/* Error Message */}
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3"
                      >
                        <AlertCircle className="size-4 text-red-500 dark:text-red-400 shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-400">{submitError}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitVerification}
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 py-6 text-base font-medium text-white hover:bg-brown-800 dark:hover:bg-gold-light disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit for Verification
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>

                    {/* Back to QR */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentStep('qr')}
                      className="text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300"
                    >
                      ← Back to QR Code
                    </Button>
                  </motion.div>
                )}

                {paymentStep === 'pending' && (
                  <motion.div
                    key="pending-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Pending Header */}
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/40"
                      >
                        <Clock className="size-8 text-amber-500 dark:text-amber-400" />
                      </motion.div>

                      <h3
                        className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Verification Pending
                      </h3>

                      <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40 text-xs font-medium px-3 py-1">
                        <Clock className="size-3 mr-1.5" />
                        Under Review
                      </Badge>
                    </div>

                    {/* Status Message */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                      <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                        We&apos;re verifying your payment. This usually takes <strong>5–10 minutes</strong>. You&apos;ll get access once verified.
                      </p>
                    </div>

                    {/* Check Status Button */}
                    <Button
                      onClick={handleCheckStatus}
                      size="lg"
                      disabled={isCheckingStatus}
                      className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 py-6 text-base font-medium text-white hover:bg-brown-800 dark:hover:bg-gold-light disabled:opacity-50"
                    >
                      {isCheckingStatus ? (
                        <>
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 size-4" />
                          Check Status
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-brown-400 dark:text-brown-500 leading-relaxed">
                      You can close this page and come back later. Your verification request is saved securely.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-3 text-[10px] text-brown-400 dark:text-brown-500">
                <div className="flex items-center gap-1 hover:scale-105 transition-transform">
                  <Shield className="size-3" />
                  <span>SSL Secured</span>
                </div>
                <span className="text-brown-200 dark:text-brown-100/30">•</span>
                <div className="flex items-center gap-1 hover:scale-105 transition-transform">
                  <CheckCircle2 className="size-3" />
                  <span>7-Day Guarantee</span>
                </div>
                <span className="text-brown-200 dark:text-brown-100/30">•</span>
                <div className="flex items-center gap-1 hover:scale-105 transition-transform">
                  <Lock className="size-3" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </motion.div>

        {/* What People Say — Rotating Testimonials */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="space-y-4">
            <h3
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 text-center"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What People Say
            </h3>

            <Card className="glass-light border-0 shadow-sm dark:bg-white/5 relative overflow-hidden">
              <CardContent className="p-6 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="absolute top-4 left-5 text-4xl text-gold/15 dark:text-gold/10 font-serif leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>&ldquo;</span>
                    <Quote className="size-8 text-brown-100 dark:text-brown-50/30 mb-2" />
                    <p className="text-sm leading-relaxed text-brown-600 dark:text-brown-300 italic mb-3">
                      &ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/50 text-xs font-semibold text-brown-600 dark:text-brown-300">
                        {TESTIMONIALS[activeTestimonial].initial}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brown-900 dark:text-brown-100">{TESTIMONIALS[activeTestimonial].name}</p>
                        <p className="text-[10px] text-brown-400 dark:text-brown-500">{TESTIMONIALS[activeTestimonial].badge}</p>
                      </div>
                      <div className="ml-auto">
                        <AnimatedStars rating={TESTIMONIALS[activeTestimonial].rating} />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`size-2 rounded-full transition-all duration-300 ${
                        i === activeTestimonial
                          ? 'bg-gold w-4'
                          : 'bg-brown-200 dark:bg-brown-100/30 hover:bg-brown-300 dark:hover:bg-brown-100/50'
                      }`}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Demo: Skip Payment Link */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }} className="text-center">
          <button
            onClick={handleDemoSkip}
            className="text-[10px] text-brown-300 dark:text-brown-500 hover:text-brown-500 dark:hover:text-brown-300 underline underline-offset-2 transition-colors"
          >
            Demo: Skip Payment (for testing)
          </button>
        </motion.div>
      </div>
    </div>
  );
}
