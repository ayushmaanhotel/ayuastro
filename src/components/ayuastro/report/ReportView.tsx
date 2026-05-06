'use client';

import { useAyuAstroStore, type ReportSection } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  User,
  Sparkles,
  Eye,
  Shield,
  DollarSign,
  Repeat,
  Lock,
  ArrowRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  message: MessageCircle,
  user: User,
  sparkles: Sparkles,
  eye: Eye,
  shield: Shield,
  dollar: DollarSign,
  repeat: Repeat,
};

const DEFAULT_FREE_SECTIONS: ReportSection[] = [
  {
    id: 'emotional-personality',
    title: 'Emotional Personality',
    icon: 'heart',
    content:
      'Your emotional world is rich and layered. With a Moon in Pisces, you process feelings with extraordinary depth, often absorbing the emotional climate of any room you enter. This sensitivity is your superpower when channeled through creative or healing work, but requires conscious boundaries to prevent overwhelm.',
    traits: ['Empathy', 'Emotional Awareness', 'Intuition'],
    insightLevel: 'free',
  },
  {
    id: 'relationship-style',
    title: 'Relationship Style',
    icon: 'user',
    content:
      'You approach relationships as sacred contracts — seeking depth over breadth. Your attachment pattern leans toward secure-anxious, meaning you crave closeness but may intermittently need space to process. Partners who honor both your depth and your need for solitude will thrive with you.',
    traits: ['Trust Capacity', 'Loyalty', 'Harmony Seeking'],
    insightLevel: 'free',
  },
  {
    id: 'communication-patterns',
    title: 'Communication Patterns',
    icon: 'message',
    content:
      'Your communication style is nuanced — you often say less than you feel. With Mercury influencing your 7th house, you listen more than you speak, but when you do articulate, your words carry unusual weight. You are most articulate in writing or one-on-one settings where you feel emotionally safe.',
    traits: ['Communication', 'Patience', 'Intuition'],
    insightLevel: 'free',
  },
];

const DEFAULT_PREMIUM_SECTIONS: ReportSection[] = [
  {
    id: 'hidden-strengths',
    title: 'Hidden Strengths',
    icon: 'sparkles',
    content:
      'Beneath your conscious awareness lies a reservoir of untapped power. Your 12th house placements suggest strengths in spiritual practice, behind-the-scenes leadership, and creative vision that emerges during solitude. These hidden gifts often surface during life transitions.',
    traits: ['Creativity', 'Resilience', 'Intuition'],
    insightLevel: 'premium',
  },
  {
    id: 'emotional-blind-spots',
    title: 'Emotional Blind Spots',
    icon: 'eye',
    content:
      'Your blind spots center around self-worth and boundary enforcement. While you can see others clearly, you may minimize your own needs, especially in intimate relationships. This pattern, rooted in your Saturn placement, often manifests as over-giving followed by emotional withdrawal.',
    traits: ['Independence', 'Discipline', 'Trust Capacity'],
    insightLevel: 'premium',
  },
  {
    id: 'money-psychology',
    title: 'Money Psychology',
    icon: 'dollar',
    content:
      'Your relationship with money is emotionally charged. You tend to view financial security as emotional security, leading to either conservative saving patterns or compensatory spending during emotional dips. Understanding your 2nd house patterns can transform your financial trajectory.',
    traits: ['Discipline', 'Resilience', 'Leadership'],
    insightLevel: 'premium',
  },
  {
    id: 'recurring-patterns',
    title: 'Recurring Life Patterns',
    icon: 'repeat',
    content:
      'Your karmic patterns reveal a recurring theme of entering situations where you are undervalued, only to eventually claim your worth and exit transformed. This Saturn-Rahu dynamic plays out in careers, relationships, and self-perception cycles roughly every 7 years.',
    traits: ['Adaptability', 'Patience', 'Loyalty'],
    insightLevel: 'premium',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ReportView() {
  const { reportSections, hasPaid, setView } = useAyuAstroStore();

  const freeSections = reportSections.filter((s) => s.insightLevel === 'free').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'free')
    : DEFAULT_FREE_SECTIONS;

  const premiumSections = reportSections.filter((s) => s.insightLevel === 'premium').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'premium')
    : DEFAULT_PREMIUM_SECTIONS;

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Deep Intelligence Report
          </h1>
          <p className="text-sm text-brown-400">
            A comprehensive analysis of your emotional architecture.
          </p>
        </motion.div>

        {/* Free Sections */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brown-400">
            Unlocked Insights
          </h2>
          {freeSections.map((section, i) => {
            const Icon = ICON_MAP[section.icon] || Sparkles;
            return (
              <motion.div
                key={section.id}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-sage-muted">
                        <Icon className="size-4 text-sage-dark" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-brown-600 mb-3">
                      {section.content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {section.traits.map((trait, ti) => (
                        <Badge
                          key={ti}
                          className="bg-brown-50 text-brown-600 border-0 text-xs"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Premium Sections */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Premium Insights
          </h2>
          {premiumSections.map((section, i) => {
            const Icon = ICON_MAP[section.icon] || Sparkles;
            const isLocked = !hasPaid;
            return (
              <motion.div
                key={section.id}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: 0.1 * (i + freeSections.length) }}
              >
                <Card className={`border-0 shadow-sm ${isLocked ? 'bg-white' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
                        <Icon className="size-4 text-gold-dark" />
                      </div>
                      {section.title}
                      {isLocked && <Lock className="ml-auto size-4 text-gold" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLocked ? (
                      <div className="relative">
                        <div className="blur-[6px] select-none">
                          <p className="text-sm leading-relaxed text-brown-600 mb-3">
                            {section.content}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40">
                          <Lock className="size-5 text-gold mb-2" />
                          <p className="text-xs font-medium text-brown-700 mb-2">
                            Unlock to reveal
                          </p>
                          <Button
                            onClick={() => setView('premium')}
                            size="sm"
                            className="bg-brown-700 text-white hover:bg-brown-800"
                          >
                            Get Full Report
                            <ArrowRight className="ml-1 size-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed text-brown-600 mb-3">
                          {section.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {section.traits.map((trait, ti) => (
                            <Badge
                              key={ti}
                              className="bg-gold/10 text-gold-dark border-0 text-xs"
                            >
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
