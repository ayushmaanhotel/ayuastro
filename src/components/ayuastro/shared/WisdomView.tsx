'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion } from 'framer-motion';
import { Moon, Star, Clock, Brain, BookOpen, Hash, Shield, Compass, Search, ChevronDown } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

type WisdomCategory = 'All' | 'Vedic Astrology' | 'Numerology' | 'Behavioral Science';

interface WisdomCard {
  icon: React.ElementType;
  title: string;
  category: WisdomCategory;
  preview: string;
  description: string;
  color: string;
  badgeColor: string;
}

const wisdomCards: WisdomCard[] = [
  {
    icon: Moon,
    title: 'Understanding Your Moon Sign',
    category: 'Vedic Astrology',
    preview: 'In Vedic astrology, the Moon sign (Rashi) reveals your emotional nature — how you process feelings, seek comfort, and react under stress.',
    description: 'In Vedic astrology, the Moon sign (Rashi) reveals your emotional nature — how you process feelings, seek comfort, and react under stress. Unlike the Sun sign which represents your outward identity, the Moon sign holds the key to your inner world. It governs your instincts, habits, and subconscious patterns that silently direct your choices. Understanding your Moon sign is the first step to emotional self-awareness — it tells you why you react the way you do, what truly nourishes you, and where your deepest emotional needs lie.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Star,
    title: 'What is Nakshatra?',
    category: 'Vedic Astrology',
    preview: 'Nakshatras are 27 lunar mansions that divide the zodiac into finer segments of 13°20\' each. Your birth Nakshatra reveals your deepest psychological tendencies.',
    description: 'Nakshatras are 27 lunar mansions that divide the zodiac into finer segments of 13°20\' each. Your birth Nakshatra reveals your deepest psychological tendencies, your life purpose (dharma), and your karmic inheritance. It is far more specific than your sign — think of it as the difference between knowing your city and knowing your exact address in the cosmos. Each Nakshatra has its own ruling deity, symbol, and psychological profile that adds remarkable depth to your astrological understanding.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: Clock,
    title: 'Vimshottari Dasha Explained',
    category: 'Vedic Astrology',
    preview: 'The Vimshottari Dasha system is Vedic astrology\'s most powerful timing technique. It maps your life into planetary periods, each ruled by a different planet.',
    description: 'The Vimshottari Dasha system is Vedic astrology\'s most powerful timing technique. It maps your life into planetary periods, each ruled by a different planet. Your current Dasha reveals which themes are active in your life right now — career shifts, relationship changes, spiritual growth, or emotional transformation. Understanding your Dasha is like reading the weather forecast for your soul. The total cycle spans 120 years, with each planet ruling a specific portion based on the Moon\'s Nakshatra at birth.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Brain,
    title: 'The Science Behind Trait Scoring',
    category: 'Behavioral Science',
    preview: 'Our 14-trait emotional intelligence model combines behavioral questionnaire responses, Vedic planetary influences, and numerological vibration analysis.',
    description: 'Our 14-trait emotional intelligence model combines behavioral questionnaire responses (Likert-scale assessment), Vedic planetary influences (weighted by house and sign placement), and numerological vibration analysis (life path, destiny, and soul urge numbers). The scoring algorithm normalizes across all three data sources, creating a unified emotional profile that is greater than the sum of its parts. This multi-source approach ensures your profile reflects both your innate tendencies and your learned behaviors.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: BookOpen,
    title: 'How Yogas Shape Your Life',
    category: 'Vedic Astrology',
    preview: 'Yogas are specific planetary combinations in your birth chart that create powerful positive effects. Raj Yoga brings authority and success.',
    description: 'Yogas are specific planetary combinations in your birth chart that create powerful positive effects. Raj Yoga brings authority and success, Gaj Kesari Yoga grants wisdom and respect, while Panch Mahapurusha Yogas indicate extraordinary potential in specific life areas. Recognizing your Yogas helps you lean into your natural advantages. Think of Yogas as cosmic endorsements — when activated by the right timing (Dasha), they can catalyze significant positive changes in your life trajectory.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Hash,
    title: 'Numerology: Life Path Numbers',
    category: 'Numerology',
    preview: 'Your Life Path Number (derived from your birth date) is the most significant number in numerology — it reveals your core purpose and the lessons you\'re here to learn.',
    description: 'Your Life Path Number (derived from your birth date) is the most significant number in numerology — it reveals your core purpose and the lessons you\'re here to learn. Life Path 1 represents the Leader — independent, pioneering, and self-motivated. Life Path 2 is the Diplomat — sensitive, cooperative, and peace-loving. Life Path 3 is the Creative — expressive, joyful, and socially gifted. Life Path 4 is the Builder — practical, disciplined, and hardworking. Life Path 5 is the Adventurer — freedom-loving, versatile, and progressive. Life Path 6 is the Nurturer — responsible, loving, and community-oriented. Life Path 7 is the Seeker — analytical, spiritual, and introspective. Life Path 8 is the Powerhouse — ambitious, authoritative, and materially focused. Life Path 9 is the Humanitarian — compassionate, generous, and globally minded. Master numbers 11, 22, and 33 carry intensified vibrations of their root numbers (2, 4, 6) with added spiritual significance.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: Shield,
    title: 'Doshas: Understanding Karmic Blocks',
    category: 'Vedic Astrology',
    preview: 'Doshas are planetary afflictions in your birth chart that indicate areas of karmic challenge — not curses, but invitations for growth and transformation.',
    description: 'Doshas are planetary afflictions in your birth chart that indicate areas of karmic challenge — not curses, but invitations for growth and transformation. Mangal Dosha (Mars affliction) affects relationship harmony and can create friction in partnerships. Kaal Sarp Dosha (Rahu-Ketu axis alignment) indicates karmic patterns related to ancestral unfinished business. Pitra Dosha relates to ancestral debts and can manifest as recurring family patterns. Nadi Dosha affects health compatibility between partners. Understanding your Doshas doesn\'t mean you\'re doomed — it means you have a roadmap for the inner work that will free you from repetitive patterns. Remedies include mantras, gemstones, charitable acts, and most importantly, conscious behavioral change.',
    color: 'bg-brown-50',
    badgeColor: 'bg-sage-muted text-sage-dark',
  },
  {
    icon: Compass,
    title: 'The Power of Your Ascendant',
    category: 'Vedic Astrology',
    preview: 'Your Ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your moment of birth — it is the lens through which all other planetary energies are filtered.',
    description: 'Your Ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your moment of birth — it is the lens through which all other planetary energies are filtered. While your Sun sign represents your soul\'s purpose and your Moon sign reveals your emotional nature, your Ascendant is your social mask, your first impression, and your physical constitution. It determines the layout of your entire birth chart — which planets fall in which houses. A Leo Ascendant projects confidence and warmth regardless of their Sun sign. A Scorpio Ascendant emanates intensity and mystery. Understanding your Ascendant helps you bridge the gap between how you see yourself and how the world sees you, enabling more authentic self-expression.',
    color: 'bg-white',
    badgeColor: 'bg-gold/10 text-gold-dark',
  },
];

const CATEGORIES: WisdomCategory[] = ['All', 'Vedic Astrology', 'Numerology', 'Behavioral Science'];

export default function WisdomView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<WisdomCategory>('All');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: wisdomCards.length };
    wisdomCards.forEach((card) => {
      counts[card.category] = (counts[card.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredCards = useMemo(() => {
    return wisdomCards.filter((card) => {
      const matchesCategory = activeCategory === 'All' || card.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleCard = (title: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

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

        {/* Search Bar */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wisdom topics..."
              className="pl-10 border-brown-200 dark:border-brown-100/30 bg-white dark:bg-cream-dark dark:text-brown-900 focus:border-brown-500 focus:ring-brown-500/20"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-brown-700 text-white'
                    : 'bg-white dark:bg-cream-dark text-brown-500 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/20 border border-brown-200 dark:border-brown-100/30'
                }`}
              >
                {cat}
                <span className={`text-[10px] ${
                  activeCategory === cat ? 'text-white/70' : 'text-brown-300'
                }`}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Wisdom Cards */}
        <div className="space-y-4">
          {filteredCards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-brown-400">No wisdom topics match your search.</p>
            </div>
          )}
          {filteredCards.map((card, i) => {
            const Icon = card.icon;
            const isExpanded = expandedCards.has(card.title);
            return (
              <motion.div
                key={card.title}
                {...fadeInUp}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <Card className={`border-0 shadow-sm ${card.color} dark:bg-white/5`}>
                  <CardContent className="p-6">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleCard(card.title)}>
                      <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brown-700/10">
                          <Icon className="size-5 text-brown-700" />
                        </div>
                        <div className="flex-1 min-w-0">
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
                            {card.preview}
                          </p>
                          <CollapsibleContent>
                            <p className="text-sm text-brown-500 leading-relaxed mt-3">
                              {card.description.substring(card.preview.length)}
                            </p>
                          </CollapsibleContent>
                          <CollapsibleTrigger asChild>
                            <button className="mt-2 text-xs font-medium text-gold-dark hover:text-gold flex items-center gap-1 transition-colors">
                              {isExpanded ? 'Show Less' : 'Read More'}
                              <ChevronDown className={`size-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </Collapsible>
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
