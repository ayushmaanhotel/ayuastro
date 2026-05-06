'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Eye, CheckCircle2, Shield, ArrowRight, Quote, Lock, Smartphone, Diamond, Sparkles } from 'lucide-react';

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

export default function PremiumView() {
  const { setView, setHasPaid, birthDetails } = useAyuAstroStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    // In a real app, this would integrate with a payment gateway
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

        {/* Pricing */}
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

              <Button
                onClick={handleUnlock}
                size="lg"
                className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 py-6 text-base font-medium text-white hover:bg-brown-800 dark:hover:bg-gold-light"
              >
                Get Full Deep Intelligence Report
                <ArrowRight className="ml-2 size-4" />
              </Button>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-brown-400 dark:text-brown-500">
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
                  <span>Instant Access</span>
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
      </div>
    </div>
  );
}
