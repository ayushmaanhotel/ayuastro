'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Brain, Hash, Heart, Star, ArrowRight, Eye, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};
const features = [
  {
    icon: Sparkles,
    title: 'Vedic Astrology + AI',
    description: 'Your kundali, interpreted by emotional intelligence — not generic horoscopes',
    bg: 'bg-white dark:bg-white/[0.08]',
    iconBg: 'bg-gradient-to-br from-gold/20 to-gold/5',
    iconColor: 'text-gold-dark',
  },
  {
    icon: Brain,
    title: 'Behavioral Science',
    description: 'Questionnaire-driven trait mapping backed by psychological patterns',
    bg: 'bg-sage-muted/60 dark:bg-sage-muted/30',
    iconBg: 'bg-gradient-to-br from-sage-dark/20 to-sage/10',
    iconColor: 'text-sage-dark',
  },
  {
    icon: Hash,
    title: 'Numerology Fusion',
    description: 'Numbers reveal what words cannot — your name, your date, your code',
    bg: 'bg-white dark:bg-white/[0.08]',
    iconBg: 'bg-gradient-to-br from-brown-700/15 to-brown-500/5',
    iconColor: 'text-brown-700',
  },
  {
    icon: Heart,
    title: 'Emotional Pattern AI',
    description: 'Not predictions. Pattern recognition. The architecture beneath your reactions.',
    bg: 'bg-sage-muted/60 dark:bg-sage-muted/30',
    iconBg: 'bg-gradient-to-br from-brown-400/20 to-brown-300/10',
    iconColor: 'text-brown-500',
  },
];
const trustMetrics = [
  { label: 'Reports Generated', value: '50K+' },
  { label: 'Emotional Accuracy', value: '94%' },
  { label: 'Seeker Rating', value: '4.9/5' },
];
const testimonials = [
  {
    quote: "The clarity I received completely shifted my understanding of my recurring relationship patterns. It felt less like a reading and more like a profound psychological unblocking.",
    name: 'Meera K.',
    zodiac: 'Pisces',
    initial: 'M',
  },
  {
    quote: "I was skeptical at first, but the emotional accuracy was uncanny. The numerology section alone gave me insights years of therapy hadn't uncovered.",
    name: 'Arjun S.',
    zodiac: 'Scorpio',
    initial: 'A',
  },
  {
    quote: "Finally, an astrology tool that doesn't give generic advice. This felt like it was written specifically for my emotional DNA.",
    name: 'Priya M.',
    zodiac: 'Cancer',
    initial: 'P',
  },
];
const howItWorksSteps = [
  {
    number: 1,
    icon: '🔮',
    title: 'Share Your Birth Details',
    description: 'Your date, time, and place of birth unlock your cosmic coordinates',
  },
  {
    number: 2,
    icon: '🧠',
    title: 'Answer Behavioral Questions',
    description: '8 carefully crafted questions reveal your emotional patterns',
  },
  {
    number: 3,
    icon: '✨',
    title: 'Receive Your Deep Intelligence Report',
    description: 'AI synthesizes Vedic astrology, numerology, and behavioral science into your emotional blueprint',
  },
];
const faqItems = [
  {
    question: 'How accurate is the analysis?',
    answer: 'AyuAstro uses deterministic Vedic astrology calculations (Swiss Ephemeris-grade), Pythagorean numerology, and behavioral science to create a multi-source emotional profile with 94% reported accuracy.',
  },
  {
    question: 'Is my data private and secure?',
    answer: "Absolutely. Your birth details and responses are encrypted and never shared. We believe your cosmic data is as personal as your medical records.",
  },
  {
    question: "What's the difference between free and premium?",
    answer: 'The free analysis includes your emotional personality, relationship style, and communication patterns. Premium unlocks hidden strengths, emotional blind spots, money psychology, and recurring life patterns.',
  },
  {
    question: 'Can I retake the analysis?',
    answer: 'Yes! You can restart anytime from your profile. However, your core astrological data (based on birth details) remains constant — only your behavioral responses may change over time.',
  },
  {
    question: 'Is this based on real astrology?',
    answer: 'We use Vedic (Jyotish) astrology with Lahiri ayanamsa — the same system used by professional Jyotishis in India. Our calculations are deterministic and astronomically grounded, not random daily horoscopes.',
  },
];
// Star-field: fixed positions for ~20 tiny dots
const starPositions = [
  { x: 5, y: 8, delay: 0 }, { x: 12, y: 22, delay: 0.5 }, { x: 20, y: 5, delay: 1.2 },
  { x: 28, y: 35, delay: 0.3 }, { x: 35, y: 12, delay: 1.8 }, { x: 42, y: 45, delay: 0.7 },
  { x: 50, y: 18, delay: 1.5 }, { x: 55, y: 55, delay: 0.2 }, { x: 62, y: 8, delay: 2.0 },
  { x: 68, y: 38, delay: 0.9 }, { x: 75, y: 15, delay: 1.3 }, { x: 80, y: 48, delay: 0.4 },
  { x: 88, y: 25, delay: 1.7 }, { x: 92, y: 60, delay: 0.6 }, { x: 15, y: 68, delay: 1.1 },
  { x: 38, y: 72, delay: 0.8 }, { x: 58, y: 65, delay: 1.9 }, { x: 72, y: 78, delay: 0.1 },
  { x: 85, y: 70, delay: 1.4 }, { x: 48, y: 85, delay: 0.5 },
];
// ─── Count-Up Animation Component ─────────────────────────────────────────────
function CountUpValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    // Parse numeric part from value like "50K+", "94%", "4.9/5"
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) return;
    const target = parseFloat(numericMatch[0]);
    const suffix = value.replace(numericMatch[0], '');
    const isFloat = numericMatch[0].includes('.');
    const steps = 30;
    const stepDuration = 25;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      const progress = current / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * eased;
      setDisplay(isFloat ? `${currentVal.toFixed(1)}${suffix}` : `${Math.round(currentVal)}${suffix}`);
      if (current >= steps) {
        clearInterval(interval);
        setDisplay(value);
      }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display}</>;
}
export default function LandingView() {
  const { setView } = useAyuAstroStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [trustCounted, setTrustCounted] = useState(false);
  const [heroOffsetY, setHeroOffsetY] = useState(0);
  // Parallax effect
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const contentY = useTransform(scrollY, [0, 1000], [0, 50]);
  const decorY = useTransform(scrollY, [0, 1000], [0, 300]);
  // Subtle parallax on hero text via scroll event
  useEffect(() => {
    const handleScroll = () => {
      setHeroOffsetY(window.scrollY * 0.3);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const goToTestimonial = useCallback((index: number) => {
    setActiveTestimonial(index);
  }, []);
  return (
    <div className="min-h-screen bg-cream dark:bg-brown-900">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulseOrb {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes conic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .star-dot {
          animation: twinkle 3s ease-in-out infinite;
        }
        .glowing-orb {
          animation: pulseOrb 6s ease-in-out infinite;
        }
        .conic-border-spin {
          animation: conic-spin 3s linear infinite;
        }
      `}</style>
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={stagger}
        className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center overflow-hidden"
      >
        {/* Star-field background */}
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ y: bgY }}
        >
          {starPositions.map((star, i) => (
            <div
              key={`star-${i}`}
              className="star-dot absolute rounded-full bg-gold/60 dark:bg-gold/40"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: '3px',
                height: '3px',
                animationDelay: `${star.delay}s`,
                animationDuration: `${2.5 + (i % 3)}s`,
              }}
            />
          ))}
          {/* Glowing orb behind hero text */}
          <div
            className="glowing-orb absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(191,155,48,0.2) 0%, rgba(191,155,48,0.05) 40%, transparent 70%)',
            }}
          />
          {/* Existing background decorations (slower due to parallax) */}
          <motion.div style={{ y: decorY }} className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-3xl" />
          <motion.div style={{ y: decorY }} className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-sage/[0.05] blur-2xl" />
          <motion.div style={{ y: decorY }} className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-brown-200/20 dark:bg-brown-600/10 blur-2xl" />
        </motion.div>
        {/* Content (foreground - moves at different parallax speed) */}
        <motion.div className="relative z-10" style={{ y: contentY }}>
          {/* Pill Badge with pulsing "New" badge */}
          <motion.div variants={fadeInUp} className="mb-8 flex items-center justify-center gap-2">
            <Badge className="border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
              Intelligence Meets Intuition
            </Badge>
            <Badge className="bg-gold text-white text-[9px] px-2 py-0.5 font-bold tracking-wider uppercase animate-pulse shadow-sm">
              New
            </Badge>
          </motion.div>
          {/* Main Heading with gradient text */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif hero-title mb-6 max-w-xl text-4xl font-bold leading-[1.15] sm:text-5xl md:text-6xl"
            style={{ transform: `translateY(${heroOffsetY}px)` }}
          >
            <span className="text-gradient-gold">Discover</span>{' '}
            the hidden{' '}
            <span className="text-gold-gradient">emotional patterns</span>{' '}
            shaping your relationships
          </motion.h1>
          {/* "Nothing to Hide" tagline — bold and prominent */}
          <motion.div variants={fadeInUp} className="mb-4">
            <Badge className="border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 px-6 py-2 text-[12px] font-bold tracking-[0.3em] text-gold-dark dark:text-gold uppercase shadow-sm shadow-gold/10">
              ✦ Nothing to Hide ✦
            </Badge>
          </motion.div>
          {/* Subtext */}
          <motion.p
            variants={fadeInUp}
            className="mb-10 max-w-md mx-auto text-base leading-relaxed text-brown-400 dark:text-brown-500 sm:text-lg"
          >
            AyuAstro combines Vedic astrology, numerology, and behavioral science
            to reveal the emotional architecture you were born with. No sugarcoating. Just truth.
          </motion.p>
          {/* Social Proof Badge */}
          <motion.div variants={fadeInUp} className="mb-4 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-sage-dark" />
            <span className="text-xs font-medium text-brown-500 dark:text-brown-500">
              Trusted by 50,000+ seekers
            </span>
          </motion.div>
          {/* CTAs with animated gradient border */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="relative group">
              {/* Animated conic gradient border */}
              <div className="absolute -inset-[2px] rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="conic-border-spin absolute inset-0"
                  style={{
                    background: 'conic-gradient(from 0deg, #D4AF37, #F0C14B, #B8960C, #D4AF37)',
                  }}
                />
              </div>
              <Button
                onClick={() => setView('onboarding')}
                size="lg"
                className="relative bg-brown-700 px-8 text-base font-medium text-white hover:bg-brown-800 shadow-lg shadow-brown-700/20 transition-all hover:shadow-xl hover:shadow-brown-700/30 hover:-translate-y-0.5 animate-breathe-glow"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
            <Button
              onClick={() => setView('onboarding')}
              variant="outline"
              size="lg"
              className="border-brown-200 dark:border-brown-600 px-8 text-base font-medium text-brown-700 dark:text-brown-400 hover:bg-brown-50 dark:hover:bg-brown-800 transition-all hover:-translate-y-0.5"
            >
              <Eye className="mr-2 size-4" />
              View Sample Insight
            </Button>
          </motion.div>
          {/* Trust indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-6 text-center"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="size-4 text-sage-dark" />
              <span className="text-xs text-brown-400 dark:text-brown-500">Encrypted & Private</span>
            </div>
            <div className="h-3 w-px bg-brown-200 dark:bg-brown-600" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-3 fill-gold text-gold" />
              ))}
              <span className="ml-1 text-xs font-medium text-brown-500 dark:text-brown-500">4.9/5</span>
            </div>
          </motion.div>
        </motion.div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="size-5 text-brown-300 dark:text-brown-500" />
        </motion.div>
      </motion.section>
      {/* Feature Cards */}
      <section className="px-6 pb-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="mx-auto max-w-lg space-y-4"
        >
          <motion.div variants={fadeInUp} className="mb-8 text-center">
            <h2
              className="font-serif text-2xl font-bold text-brown-900 dark:text-cream mb-2"
            >
              Not Another Horoscope App
            </h2>
            <p className="text-sm text-brown-400 dark:text-brown-500">
              Three systems. One intelligence. Your emotional truth.
            </p>
          </motion.div>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className={`glass-light border-0 shadow-sm ${feature.bg} transition-shadow hover:shadow-md dark:border dark:border-brown-700/30 animate-card-enter`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${feature.iconBg}`}>
                      <Icon className={`size-5 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3
                        className="font-serif text-base font-semibold text-brown-900 dark:text-cream"
                      >
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-brown-400 dark:text-brown-500">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
      {/* How It Works Section */}
      <section className="px-6 pb-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="mx-auto max-w-lg"
        >
          <motion.div variants={fadeInUp} className="mb-8 text-center">
            <h2
              className="font-serif text-2xl font-bold text-brown-900 dark:text-cream mb-2"
            >
              How It Works
            </h2>
            <p className="text-sm text-brown-400 dark:text-brown-500">
              Three steps to your emotional blueprint
            </p>
          </motion.div>
          <div className="relative">
            {/* Connecting dotted line */}
            <div className="absolute left-6 top-8 bottom-8 w-px border-l-2 border-dashed border-gold/30 dark:border-gold/20 hidden sm:block" />
            <div className="space-y-6">
              {howItWorksSteps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="relative flex items-start gap-5"
                >
                  {/* Number badge */}
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 dark:from-gold/30 dark:to-gold/10 border-2 border-gold/30">
                    <span className="font-serif text-lg font-bold text-gold-dark dark:text-gold">
                      {step.number}
                    </span>
                  </div>
                  {/* Content card */}
                  <Card className="flex-1 border-0 shadow-sm bg-white dark:bg-white/[0.08] dark:border dark:border-brown-700/30">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{step.icon}</span>
                        <h3
                          className="font-serif text-base font-semibold text-brown-900 dark:text-cream"
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-brown-400 dark:text-brown-500">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
      {/* Trust Metrics */}
      <section className="px-6 pb-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          onViewportEnter={() => setTrustCounted(true)}
          className="mx-auto max-w-lg"
        >
          <div className="grid grid-cols-3 gap-4">
            {trustMetrics.map((metric, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-4 rounded-2xl bg-white/60 dark:bg-white/[0.08] border border-brown-100/50 dark:border-brown-700/30"
              >
                <p
                  className="font-serif text-2xl font-bold text-brown-900 dark:text-cream"
                >
                  {trustCounted ? <CountUpValue value={metric.value} /> : metric.value}
                </p>
                <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
      {/* Testimonials Carousel */}
      <section className="px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-lg"
        >
          <div className="mb-6 text-center">
            <h2
              className="font-serif text-2xl font-bold text-brown-900 dark:text-cream mb-2"
            >
              What Seekers Say
            </h2>
            <p className="text-sm text-brown-400 dark:text-brown-500">
              Real experiences from our community
            </p>
          </div>
          <Card className="glass-light border-0 shadow-sm dark:border dark:border-brown-700/30 p-2 min-h-[200px]">
            <CardContent className="p-5 relative overflow-hidden">
              {/* Decorative gold quote mark */}
              <span className="absolute top-3 left-4 text-5xl text-gold/10 dark:text-gold/5 font-serif leading-none select-none pointer-events-none">&ldquo;</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p
                    className="font-serif text-sm italic leading-relaxed text-brown-700 dark:text-brown-400 mb-4"
                  >
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-brown-200/30 dark:from-gold/30 dark:to-brown-600/30">
                      <span className="text-xs font-bold text-gold-dark dark:text-gold">
                        {testimonials[activeTestimonial].initial}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brown-700 dark:text-brown-400">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-[10px] text-brown-400 dark:text-brown-600">
                        {testimonials[activeTestimonial].zodiac}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goToTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeTestimonial
                    ? 'w-6 bg-gold'
                    : 'w-2 bg-brown-200 dark:bg-brown-600 hover:bg-brown-300 dark:hover:bg-brown-500'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </section>
      {/* FAQ Accordion Section */}
      <section className="px-6 pb-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="mx-auto max-w-lg"
        >
          <motion.div variants={fadeInUp} className="mb-6 text-center">
            <h2
              className="font-serif text-2xl font-bold text-brown-900 dark:text-cream mb-2"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-brown-400 dark:text-brown-500">
              Everything you need to know before your analysis
            </p>
          </motion.div>
          <Card className="border-0 shadow-sm bg-white dark:bg-white/[0.08] dark:border dark:border-brown-700/30 p-2">
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                  >
                    <AccordionItem
                      value={`faq-${i}`}
                      className="border-brown-100 dark:border-brown-700/40"
                    >
                      <AccordionTrigger className="text-sm font-semibold text-brown-900 dark:text-cream hover:text-gold-dark dark:hover:text-gold hover:no-underline py-4">
                        <span className="flex items-center gap-2 text-left">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold-dark dark:text-gold">
                            {i + 1}
                          </span>
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-brown-500 dark:text-brown-500 leading-relaxed pl-7">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </section>
      {/* Bottom CTA */}
      <section className="px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-serif text-xl font-bold text-brown-900 dark:text-cream mb-2"
          >
            Ready to meet yourself?
          </h2>
          <p className="text-sm text-brown-400 dark:text-brown-500 mb-6">
            Your emotional intelligence report is waiting.
          </p>
          <Button
            onClick={() => setView('onboarding')}
            size="lg"
            className="bg-brown-700 px-10 text-base font-medium text-white hover:bg-brown-800 shadow-lg shadow-brown-700/20 transition-all hover:shadow-xl hover:shadow-brown-700/30 hover:-translate-y-0.5"
          >
            Begin Your Deep Intelligence Analysis
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <p className="mt-4 text-xs text-brown-300 dark:text-brown-500">Free analysis. No credit card required.</p>
        </motion.div>
      </section>
    </div>
  );
}
