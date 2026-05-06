'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Moon, Star, Clock, Brain, BookOpen } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const wisdomCards = [
  {
    icon: Moon,
    title: 'Understanding Your Moon Sign',
    category: 'Vedic Astrology',
    description:
      'In Vedic astrology, the Moon sign (Rashi) reveals your emotional nature — how you process feelings, seek comfort, and react under stress. Unlike the Sun sign which represents your outward identity, the Moon sign holds the key to your inner world. It governs your instincts, habits, and subconscious patterns that silently direct your choices.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Star,
    title: 'What is Nakshatra?',
    category: 'Vedic Astrology',
    description:
      'Nakshatras are 27 lunar mansions that divide the zodiac into finer segments of 13°20\' each. Your birth Nakshatra reveals your deepest psychological tendencies, your life purpose (dharma), and your karmic inheritance. It is far more specific than your sign — think of it as the difference between knowing your city and knowing your exact address in the cosmos.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: Clock,
    title: 'Vimshottari Dasha Explained',
    category: 'Vedic Astrology',
    description:
      'The Vimshottari Dasha system is Vedic astrology\'s most powerful timing technique. It maps your life into planetary periods, each ruled by a different planet. Your current Dasha reveals which themes are active in your life right now — career shifts, relationship changes, spiritual growth, or emotional transformation. Understanding your Dasha is like reading the weather forecast for your soul.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Brain,
    title: 'The Science Behind Trait Scoring',
    category: 'Behavioral Science',
    description:
      'Our 14-trait emotional intelligence model combines behavioral questionnaire responses (Likert-scale assessment), Vedic planetary influences (weighted by house and sign placement), and numerological vibration analysis (life path, destiny, and soul urge numbers). The scoring algorithm normalizes across all three data sources, creating a unified emotional profile that is greater than the sum of its parts.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: BookOpen,
    title: 'How Yogas Shape Your Life',
    category: 'Vedic Astrology',
    description:
      'Yogas are specific planetary combinations in your birth chart that create powerful positive effects. Raj Yoga brings authority and success, Gaj Kesari Yoga grants wisdom and respect, while Panch Mahapurusha Yogas indicate extraordinary potential in specific life areas. Recognizing your Yogas helps you lean into your natural advantages.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
];

export default function WisdomView() {
  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Wisdom Library
          </h1>
          <p className="text-sm text-brown-400">
            Deepen your understanding of the ancient sciences behind your analysis.
          </p>
        </motion.div>

        {/* Wisdom Cards */}
        <div className="space-y-4">
          {wisdomCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <Card className={`border-0 shadow-sm ${card.color}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brown-700/10">
                        <Icon className="size-5 text-brown-700" />
                      </div>
                      <div className="flex-1">
                        <Badge className={`${card.badgeColor} border-0 text-[10px] font-medium mb-2`}>
                          {card.category}
                        </Badge>
                        <h3
                          className="font-serif text-lg font-bold text-brown-900 mb-2"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-sm text-brown-500 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
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
