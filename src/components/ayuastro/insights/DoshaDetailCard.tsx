'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  Shield,
  Sparkles,
  Heart,
  Flame,
  Eye,
  Lightbulb,
} from 'lucide-react';

// ─── Dosha Data ───────────────────────────────────────────────────────────────

interface DoshaInfo {
  id: string;
  name: string;
  severity: 'Serious' | 'Moderate' | 'Mild';
  whatItMeans: string;
  howItAffects: string;
  remedies: string[];
  silverLining: string;
}

const DOSHA_DATA: DoshaInfo[] = [
  {
    id: 'mangal',
    name: 'Mangal Dosha',
    severity: 'Serious',
    whatItMeans:
      'Mars is in your 1st, 2nd, 4th, 7th, 8th, or 12th house. This creates a pattern of aggression, impatience, and conflict in close relationships.',
    howItAffects:
      'You may struggle with anger, dominance in relationships, and difficulty compromising. Marriage can be delayed or turbulent. The fire of Mars doesn\'t ask permission — it acts. In relationships, this means you often push when you should listen.',
    remedies: [
      'Practice the 10-second rule before reacting in anger.',
      'Channel Mars energy through physical exercise — it needs an outlet.',
      'Chant "Om Mangalaya Namaha" on Tuesdays.',
      'Consider red coral only after consulting a qualified astrologer.',
    ],
    silverLining:
      'Your Mars energy, when channeled, gives you incredible drive, courage, and the ability to fight for what\'s right. Many successful leaders have this dosha. Your passion is not a flaw — it\'s fuel that needs direction.',
  },
  {
    id: 'kaal-sarp',
    name: 'Kaal Sarp Dosha',
    severity: 'Serious',
    whatItMeans:
      'All planets are between Rahu and Ketu. This creates a pattern of sudden ups and downs, feeling stuck despite efforts, and karmic lessons repeating.',
    howItAffects:
      'Life feels like a rollercoaster. Success comes and then slips away. You may feel a sense of unfulfillment even when things are going well. Progress feels like two steps forward, one step back — consistently.',
    remedies: [
      'Visit a Rahu-Ketu temple on Amavasya (new moon) if possible.',
      'Practice gratitude journaling daily — it grounds you.',
      'Focus on one thing at a time — scattered energy is your enemy.',
      'Chant "Om Rahuve Namaha" and "Om Ketuve Namaha".',
    ],
    silverLining:
      'People with Kaal Sarp Dosha often have deep spiritual insight and the ability to transform themselves completely. Your struggles give you wisdom others lack. You understand pain in a way that makes you an extraordinary healer.',
  },
  {
    id: 'pitra',
    name: 'Pitra Dosha',
    severity: 'Moderate',
    whatItMeans:
      'Sun-Rahu conjunction or 9th house affliction. This suggests ancestral karma affecting your life path — particularly career and relationships with authority figures.',
    howItAffects:
      'You may face obstacles in career progression despite hard work. Relationships with father or authority figures may be strained. A sense of carrying a burden that isn\'t entirely yours. Things that should be easy feel harder than they should be.',
    remedies: [
      'Perform Shradh ceremonies for ancestors.',
      'Respect and care for elders — this isn\'t just tradition, it\'s energetic repair.',
      'Donate to charity on Sundays.',
      'Practice forgiveness — holding grudges amplifies this dosha.',
    ],
    silverLining:
      'Pitra Dosha gives you a deep sense of responsibility and the ability to break generational patterns. You have the power to heal not just yourself but your family line. You\'re the one who stops the cycle.',
  },
  {
    id: 'nadi',
    name: 'Nadi Dosha',
    severity: 'Serious',
    whatItMeans:
      'Same Nadi as partner in matchmaking. In Vedic astrology, this is considered serious for marriage compatibility as it may affect health of offspring.',
    howItAffects:
      'This is primarily a compatibility concern, not a personal flaw. If both partners have the same Nadi, traditional astrology suggests potential health concerns for children. It does not affect your individual personality or life path directly.',
    remedies: [
      'This dosha is about compatibility, not you individually — don\'t internalize it.',
      'If matched, consider Nadi Dosha Nivaran puja before marriage.',
      'Focus on health and wellness as a couple — proactive care matters more.',
      'Modern view: genetics and health screening matter more than Nadi matching.',
    ],
    silverLining:
      'Awareness of this dosha means you\'ll be more proactive about health and family planning, which is actually responsible. Being informed is always better than being ignorant.',
  },
  {
    id: 'grahan',
    name: 'Grahan Dosha',
    severity: 'Moderate',
    whatItMeans:
      'Sun or Moon conjunct Rahu or Ketu. Eclipse energy shadows your confidence (Sun) or emotional stability (Moon). This creates periods of self-doubt and emotional turbulence.',
    howItAffects:
      'If Sun is affected: confidence comes and goes. You may struggle with authority or self-identity. If Moon is affected: emotional stability fluctuates. Anxiety and overthinking are patterns you know well.',
    remedies: [
      'Chant Gayatri Mantra 108 times daily for spiritual protection.',
      'Donate wheat, jaggery, and copper on Sundays (for Sun affliction).',
      'Donate rice, milk, and silver on Mondays (for Moon affliction).',
      'Perform Grahan Shanti Puja during eclipse periods.',
    ],
    silverLining:
      'Grahan Dosha gives you extraordinary sensitivity to energy and the unseen. Many psychics, healers, and artists have this placement. Your turbulence is the price of your perception.',
  },
  {
    id: 'shrapit',
    name: 'Shrapit Dosha',
    severity: 'Moderate',
    whatItMeans:
      'Saturn-Rahu conjunction or mutual aspect. This indicates karmic debts from past actions creating obstacles and delays in the current life.',
    howItAffects:
      'Obstacles seem to appear from nowhere. Progress is delayed even when you do everything right. There\'s a recurring feeling of "why is this so hard for me?" — and it\'s not your imagination.',
    remedies: [
      'Chant "Om Sham Shanicharaya Namah" and "Om Raahave Namaha" 108 times daily.',
      'Light a mustard oil lamp for Saturn and burn camphor for Rahu on Saturdays.',
      'Recite Hanuman Chalisa daily for protection from the Saturn-Rahu combination.',
      'Donate black sesame seeds, iron, and blankets on Saturdays.',
    ],
    silverLining:
      'Shrapit Dosha creates extraordinary patience and resilience. You\'ve learned to persist when others quit. This dosha often produces people who achieve success later in life — but when it comes, it\'s unshakeable.',
  },
];

// ─── Severity Styles ──────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { border: string; badge: string; icon: React.ElementType }> = {
  Serious: {
    border: 'border-l-red-500 dark:border-l-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    icon: AlertTriangle,
  },
  Moderate: {
    border: 'border-l-orange-400 dark:border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    icon: Flame,
  },
  Mild: {
    border: 'border-l-yellow-400 dark:border-l-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Eye,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface DoshaDetailCardProps {
  doshas: string[]; // List of dosha names present in the chart
}

export default function DoshaDetailCard({ doshas }: DoshaDetailCardProps) {
  const [expandedDoshas, setExpandedDoshas] = useState<Record<string, boolean>>({});

  // Filter to only show doshas that are present
  const activeDoshas = DOSHA_DATA.filter(d =>
    doshas.some(userDosha =>
      userDosha.toLowerCase().includes(d.id) ||
      d.name.toLowerCase().includes(userDosha.toLowerCase().replace(' dosha', '').replace(' dosh', ''))
    )
  );

  // If no doshas match from the list, show all detected doshas with generic info
  const displayDoshas = activeDoshas.length > 0
    ? activeDoshas
    : doshas.length > 0
      ? doshas.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          severity: 'Moderate' as const,
          whatItMeans: `${name} is detected in your birth chart. This indicates specific challenges in certain life areas.`,
          howItAffects: 'This dosha creates patterns of difficulty in specific areas of life. The exact effects depend on the planetary positions involved.',
          remedies: ['Consult a qualified Vedic astrologer for personalized remedies.', 'Practice mindfulness and self-awareness daily.', 'Chant mantras associated with the planets involved.'],
          silverLining: 'Every dosha carries a hidden gift. The challenge you face builds strength that others lack.',
        }))
      : [];

  // If no doshas at all, show a clean bill message
  if (displayDoshas.length === 0) {
    return (
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sage via-sage-dark to-sage" />
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sage-muted/50">
              <Shield className="size-5 text-sage-dark" />
            </div>
            <div>
              <h3
                className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Dosha Analysis
              </h3>
              <p className="text-xs text-brown-500 dark:text-brown-400">No doshas detected</p>
            </div>
          </div>
          <div className="bg-sage-muted/20 dark:bg-sage/10 rounded-lg p-4">
            <p className="text-sm text-sage-dark dark:text-sage leading-relaxed">
              Good news — your chart is relatively free of major doshas. This doesn&apos;t mean life is perfect, but it means you don&apos;t have the specific karmic patterns that doshas create. Consider this a genuine advantage.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleDosha = (id: string) => {
    setExpandedDoshas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400" />
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="size-5 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h3
                className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Dosha Analysis
              </h3>
              <p className="text-xs text-brown-500 dark:text-brown-400">
                {displayDoshas.length} {displayDoshas.length === 1 ? 'dosha' : 'doshas'} detected
              </p>
            </div>
          </div>
          <Badge className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 border-0 text-[9px] px-2 py-0.5 tracking-wider uppercase flex items-center gap-1">
            <Eye className="size-2.5" />
            Brutally Honest
          </Badge>
        </div>

        {/* Dosha Cards */}
        <div className="space-y-3">
          {displayDoshas.map((dosha, index) => {
            const severityStyle = SEVERITY_STYLES[dosha.severity] || SEVERITY_STYLES.Moderate;
            const SeverityIcon = severityStyle.icon;
            const isExpanded = expandedDoshas[dosha.id] || false;

            return (
              <motion.div
                key={dosha.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`border-l-4 ${severityStyle.border} bg-white dark:bg-brown-900/30 rounded-r-lg overflow-hidden`}>
                  {/* Dosha Header */}
                  <div className="p-3 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className="font-serif text-sm font-bold text-brown-900 dark:text-brown-100"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {dosha.name}
                        </h4>
                        <Badge className={`${severityStyle.badge} border-0 text-[9px] px-1.5 py-0 tracking-wider uppercase flex items-center gap-0.5`}>
                          <SeverityIcon className="size-2.5" />
                          {dosha.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                        {dosha.whatItMeans}
                      </p>
                    </div>
                  </div>

                  {/* Collapsible Sections */}
                  <Collapsible open={isExpanded} onOpenChange={() => toggleDosha(dosha.id)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-[11px] text-brown-500 dark:text-brown-400 hover:text-brown-700 dark:hover:text-brown-200 px-3 py-1.5 h-auto rounded-none border-t border-brown-100 dark:border-brown-800"
                      >
                        {isExpanded ? 'Hide details' : 'Show details'}
                        <ChevronDown className={`size-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-3">
                              {/* How It Affects You */}
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <AlertTriangle className="size-3 text-red-400" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
                                    How It Affects You
                                  </span>
                                </div>
                                <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed pl-4">
                                  {dosha.howItAffects}
                                </p>
                              </div>

                              {/* Remedies */}
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Sparkles className="size-3 text-gold-dark dark:text-gold" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
                                    Practical Remedies
                                  </span>
                                </div>
                                <ul className="space-y-1 pl-4">
                                  {dosha.remedies.map((remedy, i) => (
                                    <li key={i} className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed flex items-start gap-1.5">
                                      <span className="text-gold-dark dark:text-gold mt-0.5 shrink-0 text-[8px]">✦</span>
                                      {remedy}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Silver Lining */}
                              <div className="bg-sage-muted/20 dark:bg-sage/10 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Lightbulb className="size-3 text-sage-dark dark:text-sage" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sage-dark dark:text-sage">
                                    The Good News
                                  </span>
                                </div>
                                <p className="text-xs text-sage-dark dark:text-sage leading-relaxed">
                                  {dosha.silverLining}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
