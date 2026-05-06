'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
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
    return { hours, minutes, seconds };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calculateTimeLeft]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="text-center">
      <p className="text-xs text-brown-400 mb-1">Launch Price Ends In:</p>
      <p className="font-mono text-lg font-bold text-gold-dark dark:text-gold tracking-wider">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </p>
    </div>
  );
}

export default function PremiumView() {
  const { setView, setHasPaid, birthDetails } = useAyuAstroStore();

  const handleUnlock = () => {
    // In a real app, this would integrate with a payment gateway
    setHasPaid(true);
    setView('report');
  };

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Hero */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="text-center">
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Unlock Your Deep Emotional Intelligence
          </h1>
          <p className="text-sm text-brown-400 leading-relaxed">
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
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-white dark:bg-white/5 p-3 text-center">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-semibold text-brown-700 dark:text-brown-300 leading-tight">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="size-4 fill-gold text-gold" />
            ))}
          </div>
          <p className="text-sm font-semibold text-brown-900">4.9/5</p>
          <p className="text-xs text-brown-400">Trusted Seeker Rating</p>
        </motion.div>

        {/* Premium Visual Report Card Preview */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-premium zodiac-corner relative premium-card shimmer overflow-hidden animate-border-shimmer">
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10">
                  <Eye className="size-6 text-gold" />
                </div>
                <div>
                  <h3
                    className="font-serif text-lg font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Premium Visual Report
                  </h3>
                  <p className="text-xs text-brown-400">
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
                      i < 3 ? 'bg-sage-muted/50 dark:bg-sage-muted/30 text-brown-700' : 'bg-gold/5 text-brown-400'
                    }`}
                  >
                    <div
                      className={`size-1.5 rounded-full ${
                        i < 3 ? 'bg-sage-dark' : 'bg-gold'
                      }`}
                    />
                    {section}
                    {i >= 3 && (
                      <Badge className="ml-auto bg-gold/10 text-gold-dark border-0 text-[10px] px-1.5 py-0">
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
              className="font-serif text-lg font-bold text-brown-900 text-center mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What You&apos;ll Unlock
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PREMIUM_SECTIONS.map((section, i) => (
                <div key={i} className="glass-light rounded-xl p-4 text-center relative overflow-hidden group hover:shadow-md transition-shadow">
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
          <Card className="glass-light border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-brown-900 mb-4">What you will unlock</h3>
              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-sage-dark mt-0.5" />
                    <p className="text-sm text-brown-600 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="glass-premium zodiac-corner relative border-0 shadow-sm text-center animate-border-shimmer">
            <CardContent className="relative p-6">
              {/* Countdown Timer */}
              <CountdownTimer />

              <div className="mt-3 mb-2">
                <span className="text-lg text-brown-300 dark:text-brown-500 line-through">₹1,499</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <motion.span
                  className="font-serif text-5xl font-bold text-brown-900 animate-float"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ₹499
                </motion.span>
              </div>
              <p className="mt-1 text-xs text-brown-400">One-time payment</p>

              <Badge className="mt-3 bg-sage-muted text-sage-dark border-0 text-xs font-medium">
                One-time unlock. Lifetime access.
              </Badge>

              <Separator className="my-5 bg-brown-100 dark:bg-brown-100/30" />

              <Button
                onClick={handleUnlock}
                size="lg"
                className="w-full bg-brown-700 py-6 text-base font-medium text-white hover:bg-brown-800"
              >
                Get Full Deep Intelligence Report
                <ArrowRight className="ml-2 size-4" />
              </Button>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-brown-400">
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
        </motion.div>

        {/* Testimonial */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="glass-light border-0 shadow-sm">
            <CardContent className="p-6 relative">
              <span className="absolute top-4 left-5 text-4xl text-gold/15 dark:text-gold/10 font-serif leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>&ldquo;</span>
              <Quote className="size-8 text-brown-100 dark:text-brown-50/30 mb-2" />
              <p className="text-sm leading-relaxed text-brown-600 italic mb-3">
                &ldquo;The premium report revealed patterns I had been living with for decades
                without understanding. The money psychology section alone was worth it — I finally
                see why I keep repeating the same financial cycles.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/50 text-xs font-semibold text-brown-600">
                  A
                </div>
                <div>
                  <p className="text-xs font-medium text-brown-900">Ananya S.</p>
                  <p className="text-[10px] text-brown-400">Verified Seeker</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
