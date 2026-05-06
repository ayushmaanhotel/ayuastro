'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Hash, Heart, Star, ArrowRight, Eye, Shield, ChevronDown } from 'lucide-react';

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
    bg: 'bg-white dark:bg-white/5',
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
    bg: 'bg-white dark:bg-white/5',
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

export default function LandingView() {
  const { setView } = useAyuAstroStore();

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={stagger}
        className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-sage/[0.05] blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-brown-200/20 blur-2xl" />
          {/* Subtle zodiac symbols floating */}
          {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((symbol, i) => (
            <motion.span
              key={i}
              className="absolute text-brown-200/30 text-xl select-none"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                y: Math.random() * 600,
              }}
              animate={{
                y: [null, -20, 0],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {symbol}
            </motion.span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Pill Badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <Badge className="border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
              Intelligence Meets Intuition
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif hero-title mb-6 max-w-xl text-4xl font-bold leading-[1.15] text-brown-900 sm:text-5xl md:text-6xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover the hidden{' '}
            <span className="text-gold-gradient">emotional patterns</span>{' '}
            shaping your relationships
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeInUp}
            className="mb-10 max-w-md mx-auto text-base leading-relaxed text-brown-400 sm:text-lg"
          >
            AyuAstro combines Vedic astrology, numerology, and behavioral science
            to reveal the emotional architecture you were born with.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => setView('onboarding')}
              size="lg"
              className="bg-brown-700 px-8 text-base font-medium text-white hover:bg-brown-800 shadow-lg shadow-brown-700/20 transition-all hover:shadow-xl hover:shadow-brown-700/30 hover:-translate-y-0.5"
            >
              Start Free Analysis
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              onClick={() => setView('onboarding')}
              variant="outline"
              size="lg"
              className="border-brown-200 px-8 text-base font-medium text-brown-700 hover:bg-brown-50 transition-all hover:-translate-y-0.5"
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
              <span className="text-xs text-brown-400">Encrypted & Private</span>
            </div>
            <div className="h-3 w-px bg-brown-200" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-3 fill-gold text-gold" />
              ))}
              <span className="ml-1 text-xs font-medium text-brown-500">4.9/5</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="size-5 text-brown-300" />
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
              className="font-serif text-2xl font-bold text-brown-900 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Not Another Horoscope App
            </h2>
            <p className="text-sm text-brown-400">
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
                <Card className={`border-0 shadow-sm ${feature.bg} transition-shadow hover:shadow-md`}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${feature.iconBg}`}>
                      <Icon className={`size-5 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3
                        className="font-serif text-base font-semibold text-brown-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-brown-400">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Trust Metrics */}
      <section className="px-6 pb-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-lg"
        >
          <div className="grid grid-cols-3 gap-4">
            {trustMetrics.map((metric, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-brown-100/50 dark:border-brown-100/30"
              >
                <p
                  className="font-serif text-2xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {metric.value}
                </p>
                <p className="text-xs text-brown-400 mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Social Proof - Testimonial */}
      <section className="px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-lg"
        >
          <Card className="border-0 shadow-sm bg-white dark:bg-white/5 p-2">
            <CardContent className="p-5">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p
                className="font-serif text-sm italic leading-relaxed text-brown-700 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                &ldquo;The clarity I received completely shifted my understanding of my recurring relationship patterns.
                It felt less like a reading and more like a profound psychological unblocking.&rdquo;
              </p>
              <p className="text-xs text-brown-400 font-medium tracking-wider">— VERIFIED SEEKER</p>
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
            className="font-serif text-xl font-bold text-brown-900 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to meet yourself?
          </h2>
          <p className="text-sm text-brown-400 mb-6">
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
          <p className="mt-4 text-xs text-brown-300">Free analysis. No credit card required.</p>
        </motion.div>
      </section>
    </div>
  );
}
