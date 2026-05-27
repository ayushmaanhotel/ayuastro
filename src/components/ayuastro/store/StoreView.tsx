'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Flame, Gem, Leaf, CircleDot,
  Sparkles, Star, ChevronRight, Heart, ShoppingCart,
  Sun, Moon, Shield, Flower2,
  Package, Clock, Award, Filter, ArrowRight, Tag, Check,
  Zap, BookOpen, Wind, Droplets
} from 'lucide-react';
import { useAyuAstroStore } from '@/store/ayuastro-store';

// ─── Types ──────────────────────────────────────────────────────────────────

type StoreCategory = 'All' | 'Pujas' | 'Gemstones' | 'Rudraksha' | 'Remedies' | 'Rituals';

interface StoreProduct {
  id: string;
  name: string;
  category: StoreCategory;
  price: number;
  originalPrice?: number;
  emoji: string;
  description: string;
  benefits: string[];
  recommendation?: string; // Why it's recommended for the user
  doshaRelated?: string[];
  planetRelated?: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

// ─── Product Data ───────────────────────────────────────────────────────────

const PRODUCTS: StoreProduct[] = [
  // Pujas
  {
    id: 'mangal-dosha-puja',
    name: 'Mangal Dosha Nivaran Puja',
    category: 'Pujas',
    price: 5100,
    originalPrice: 7500,
    emoji: '🔥',
    description: 'Sacred Vedic ceremony to pacify Mars energy and reduce Mangal Dosha effects on marriage and relationships.',
    benefits: ['Reduces marital delays', 'Harmonizes Mars energy', 'Removes relationship obstacles', 'Performed by certified Vedic priests'],
    doshaRelated: ['Mangal Dosha'],
    planetRelated: ['Mars'],
    rating: 4.9,
    reviews: 342,
    inStock: true,
    isBestseller: true,
  },
  {
    id: 'kaal-sarp-puja',
    name: 'Kaal Sarp Dosh Nivaran',
    category: 'Pujas',
    price: 7100,
    originalPrice: 10000,
    emoji: '🐍',
    description: 'Powerful puja to neutralize Kaal Sarp Dosha caused by Rahu-Ketu axis alignment, releasing ancestral karmic blocks.',
    benefits: ['Breaks karmic cycles', 'Reduces Rahu-Ketu malefic effects', 'Ancestral peace', 'Career & financial breakthrough'],
    doshaRelated: ['Kaal Sarp Dosha'],
    planetRelated: ['Rahu', 'Ketu'],
    rating: 4.8,
    reviews: 256,
    inStock: true,
  },
  {
    id: 'navagraha-puja',
    name: 'Navagraha Shanti Puja',
    category: 'Pujas',
    price: 8100,
    originalPrice: 12000,
    emoji: '🪐',
    description: 'Comprehensive nine-planet pacification ceremony to balance all planetary energies in your birth chart.',
    benefits: ['Balances all 9 planets', 'Overall life harmony', 'Reduces negative dasha effects', 'Enhances positive planetary influences'],
    rating: 4.9,
    reviews: 412,
    inStock: true,
    isBestseller: true,
  },
  {
    id: 'pitra-dosh-puja',
    name: 'Pitra Dosh Shanti Puja',
    category: 'Pujas',
    price: 5500,
    emoji: '🙏',
    description: 'Ceremony to honor ancestors and resolve Pitra Dosha, which can manifest as recurring family patterns and obstacles.',
    benefits: ['Ancestral blessings', 'Family harmony', 'Removes hereditary karmic blocks', 'Peace to departed souls'],
    doshaRelated: ['Pitra Dosha'],
    rating: 4.7,
    reviews: 189,
    inStock: true,
  },
  {
    id: 'saturn-shanti-puja',
    name: 'Shani Shanti Puja',
    category: 'Pujas',
    price: 6100,
    originalPrice: 8500,
    emoji: '♄',
    description: 'Dedicated puja to pacify Saturn during Sade Sati or challenging Saturn dasha periods.',
    benefits: ['Reduces Saturn afflictions', 'Eases Sade Sati effects', 'Career stability', 'Patience & discipline enhancement'],
    planetRelated: ['Saturn'],
    rating: 4.8,
    reviews: 298,
    inStock: true,
  },
  // Gemstones
  {
    id: 'blue-sapphire',
    name: 'Natural Blue Sapphire (Neelam)',
    category: 'Gemstones',
    price: 15000,
    originalPrice: 22000,
    emoji: '💎',
    description: 'Certified natural Blue Sapphire for Saturn empowerment. Enhances discipline, career success, and protection from Saturn\'s malefic effects.',
    benefits: ['Career advancement', 'Protection from Saturn', 'Mental clarity', 'Wealth attraction'],
    planetRelated: ['Saturn'],
    rating: 4.9,
    reviews: 156,
    inStock: true,
    isBestseller: true,
  },
  {
    id: 'red-coral',
    name: 'Natural Red Coral (Moonga)',
    category: 'Gemstones',
    price: 4500,
    originalPrice: 6500,
    emoji: '🔴',
    description: 'Certified natural Red Coral for Mars empowerment. Boosts courage, energy, and reduces Mangal Dosha effects.',
    benefits: ['Courage & confidence', 'Mars energy balance', 'Reduces Mangal Dosha', 'Physical vitality'],
    doshaRelated: ['Mangal Dosha'],
    planetRelated: ['Mars'],
    rating: 4.7,
    reviews: 203,
    inStock: true,
  },
  {
    id: 'yellow-sapphire',
    name: 'Natural Yellow Sapphire (Pukhraj)',
    category: 'Gemstones',
    price: 12000,
    originalPrice: 18000,
    emoji: '💛',
    description: 'Certified natural Yellow Sapphire for Jupiter empowerment. Attracts wisdom, prosperity, and marital bliss.',
    benefits: ['Wisdom & knowledge', 'Marriage blessings', 'Jupiter energy boost', 'Financial prosperity'],
    planetRelated: ['Jupiter'],
    rating: 4.8,
    reviews: 178,
    inStock: true,
  },
  {
    id: 'emerald',
    name: 'Natural Emerald (Panna)',
    category: 'Gemstones',
    price: 9500,
    originalPrice: 14000,
    emoji: '💚',
    description: 'Certified natural Emerald for Mercury empowerment. Enhances communication, intellect, and business acumen.',
    benefits: ['Communication skills', 'Business success', 'Intellectual growth', 'Mercury energy balance'],
    planetRelated: ['Mercury'],
    rating: 4.7,
    reviews: 134,
    inStock: true,
    isNew: true,
  },
  {
    id: 'ruby',
    name: 'Natural Ruby (Manikya)',
    category: 'Gemstones',
    price: 25000,
    originalPrice: 35000,
    emoji: '❤️',
    description: 'Certified natural Ruby for Sun empowerment. Enhances leadership, authority, and self-confidence.',
    benefits: ['Leadership qualities', 'Self-confidence', 'Sun energy boost', 'Government favor'],
    planetRelated: ['Sun'],
    rating: 4.9,
    reviews: 98,
    inStock: true,
  },
  // Rudraksha
  {
    id: 'ek-mukhi-rudraksha',
    name: '1 Mukhi Rudraksha',
    category: 'Rudraksha',
    price: 11000,
    emoji: '📿',
    description: 'Rare one-faced Rudraksha representing Lord Shiva. Ultimate spiritual awakening and mental peace.',
    benefits: ['Supreme consciousness', 'Mental peace', 'Spiritual growth', 'Connection with divine'],
    rating: 4.9,
    reviews: 67,
    inStock: true,
  },
  {
    id: 'panch-mukhi-rudraksha',
    name: '5 Mukhi Rudraksha Bracelet',
    category: 'Rudraksha',
    price: 2100,
    originalPrice: 3500,
    emoji: '📿',
    description: 'Five-faced Rudraksha bracelet — the most commonly recommended bead for overall well-being and Jupiter energy.',
    benefits: ['Overall well-being', 'Blood pressure regulation', 'Jupiter blessings', 'Daily protection'],
    planetRelated: ['Jupiter'],
    rating: 4.8,
    reviews: 445,
    inStock: true,
    isBestseller: true,
  },
  {
    id: '8-mukhi-rudraksha',
    name: '8 Mukhi Rudraksha',
    category: 'Rudraksha',
    price: 5500,
    emoji: '📿',
    description: 'Eight-faced Rudraksha blessed by Lord Ganesha. Removes obstacles and Rahu afflictions.',
    benefits: ['Obstacle removal', 'Rahu pacification', 'Success in endeavors', 'Knowledge & wisdom'],
    planetRelated: ['Rahu'],
    rating: 4.7,
    reviews: 89,
    inStock: true,
  },
  // Remedies
  {
    id: 'navagraha-yantra',
    name: 'Navagraha Yantra (Gold Plated)',
    category: 'Remedies',
    price: 3100,
    originalPrice: 5000,
    emoji: '🔮',
    description: 'Energized gold-plated Navagraha Yantra for balancing all nine planetary energies in your living space.',
    benefits: ['Balances all planets', 'Home energy cleansing', 'Vastu correction', 'Meditation enhancement'],
    rating: 4.6,
    reviews: 167,
    inStock: true,
  },
  {
    id: 'lal-kitab-remedies',
    name: 'Personalized Lal Kitab Remedies',
    category: 'Remedies',
    price: 2500,
    emoji: '📕',
    description: 'Custom Lal Kitab remedies based on your specific birth chart. Simple, practical, and effective daily actions.',
    benefits: ['Personalized to your chart', 'Simple daily practices', 'No complex rituals', 'Proven traditional methods'],
    rating: 4.8,
    reviews: 312,
    inStock: true,
    isNew: true,
  },
  {
    id: 'mantra-audio',
    name: 'Planetary Mantra Collection',
    category: 'Remedies',
    price: 999,
    originalPrice: 1999,
    emoji: '🎵',
    description: 'Complete collection of Navagraha mantras with correct pronunciation guide. 108 recitations each, professionally recorded.',
    benefits: ['Correct pronunciation', 'All 9 planet mantras', 'Daily practice guide', 'Meditation support'],
    rating: 4.7,
    reviews: 523,
    inStock: true,
  },
  // Rituals
  {
    id: 'griha-pravesh',
    name: 'Griha Pravesh Ceremony',
    category: 'Rituals',
    price: 11000,
    emoji: '🏠',
    description: 'Complete Vedic housewarming ceremony with certified priest. Ensures positive energy and prosperity in your new home.',
    benefits: ['Home energy blessing', 'Vastu purification', 'Prosperity invocation', 'Negative energy removal'],
    rating: 4.9,
    reviews: 145,
    inStock: true,
  },
  {
    id: 'namkaran-ceremony',
    name: 'Namkaran Sanskar',
    category: 'Rituals',
    price: 5100,
    emoji: '👶',
    description: 'Traditional Vedic naming ceremony for newborns based on Nakshatra syllables and planetary positions.',
    benefits: ['Auspicious naming', 'Nakshatra-based', 'Child\'s cosmic blessing', 'Family celebration guide'],
    rating: 4.8,
    reviews: 87,
    inStock: true,
    isNew: true,
  },
  {
    id: 'vivah-muhurta',
    name: 'Vivah Muhurta Consultation',
    category: 'Rituals',
    price: 4100,
    emoji: '💍',
    description: 'Expert Muhurta calculation for the most auspicious wedding date and time based on both partners\' charts.',
    benefits: ['Auspicious wedding date', 'Compatibility analysis', 'Planetary timing', 'Detailed report included'],
    rating: 4.9,
    reviews: 198,
    inStock: true,
    isBestseller: true,
  },
];

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'All': { icon: ShoppingBag, color: 'text-brown-700 dark:text-brown-600', bg: 'bg-brown-700 dark:bg-gold' },
  'Pujas': { icon: Flame, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-600' },
  'Gemstones': { icon: Gem, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-600' },
  'Rudraksha': { icon: CircleDot, color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-700' },
  'Remedies': { icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-600' },
  'Rituals': { icon: Flower2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-600' },
};

const CATEGORIES: StoreCategory[] = ['All', 'Pujas', 'Gemstones', 'Rudraksha', 'Remedies', 'Rituals'];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StoreView() {
  const { astrologyData, numerologyData } = useAyuAstroStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<StoreCategory>('All');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  // Get user's doshas for recommendations
  const userDoshas = astrologyData?.doshas || [];
  const userPlanets = astrologyData?.planetaryPositions ? Object.keys(astrologyData.planetaryPositions) : [];

  // Determine recommended products based on user's profile
  const recommendedProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      // Match by dosha
      if (product.doshaRelated?.some(d => userDoshas.some(ud => ud.toLowerCase().includes(d.toLowerCase().split(' ')[0])))) {
        return true;
      }
      // Match by planet
      if (product.planetRelated?.some(p => userPlanets.includes(p))) {
        return true;
      }
      return false;
    }).slice(0, 4);
  }, [userDoshas, userPlanets]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="cosmic-bg bg-cream dark:bg-[#1A1412] px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-gold/15 dark:bg-gold/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-600">
                Vedic Store
              </h1>
              <p className="text-xs text-brown-400 dark:text-brown-500">
                Authentic remedies & spiritual items for your cosmic profile
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recommended for You Section */}
        {recommendedProducts.length > 0 && astrologyData && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-600">
                Recommended for You
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recommendedProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedProduct(product)}
                  className="flex-shrink-0 w-40"
                >
                  <div className="glass-premium rounded-xl p-3 shadow-md border border-gold/20 text-left h-full">
                    <div className="text-3xl mb-2">{product.emoji}</div>
                    <h3 className="text-xs font-semibold text-brown-900 dark:text-brown-600 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-2.5 h-2.5 fill-gold text-gold" />
                      <span className="text-[10px] text-brown-500 dark:text-brown-500">{product.rating}</span>
                    </div>
                    <p className="text-sm font-bold text-gold-dark dark:text-gold">
                      {formatPrice(product.price)}
                    </p>
                    {product.recommendation && (
                      <p className="text-[10px] text-sage-dark dark:text-sage mt-1 line-clamp-1">
                        ✦ {product.recommendation}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300 dark:text-brown-600" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pujas, gemstones, remedies..."
              className="pl-10 gold-focus-ring border-brown-200 dark:border-brown-100/30 bg-white dark:bg-cream-dark dark:text-brown-900"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? `${config.bg} text-white`
                      : 'bg-white dark:bg-cream-dark text-brown-500 dark:text-brown-500 hover:bg-brown-50 dark:hover:bg-brown-50/20 border border-brown-200 dark:border-brown-100/30'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingBag className="w-12 h-12 text-brown-200 dark:text-brown-500 mx-auto mb-3" />
                <p className="text-sm text-brown-400 dark:text-brown-500">No items match your search.</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Card className="card-hover border-0 shadow-md overflow-hidden bg-white dark:bg-white/[0.08]">
                      <CardContent className="p-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="w-full text-left"
                            >
                              <div className="flex gap-3 p-4">
                                {/* Product Image/Emoji */}
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-gold/10 to-brown-50/50 dark:from-gold/5 dark:to-brown-50/10 flex items-center justify-center text-3xl border border-gold/10">
                                  {product.emoji}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                        {product.isNew && (
                                          <Badge className="bg-emerald-500 text-white border-0 text-[9px] px-1.5 py-0.5">NEW</Badge>
                                        )}
                                        {product.isBestseller && (
                                          <Badge className="bg-gold text-white border-0 text-[9px] px-1.5 py-0.5">BESTSELLER</Badge>
                                        )}
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-brown-200 dark:border-brown-100/30 text-brown-500 dark:text-brown-500">
                                          {product.category}
                                        </Badge>
                                      </div>
                                      <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-600 truncate">
                                        {product.name}
                                      </h3>
                                    </div>
                                  </div>

                                  <p className="text-xs text-brown-400 dark:text-brown-500 line-clamp-2 mb-2 mt-1">
                                    {product.description}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-gold-dark dark:text-gold">
                                        {formatPrice(product.price)}
                                      </span>
                                      {product.originalPrice && (
                                        <span className="text-xs text-brown-300 dark:text-brown-500 line-through">
                                          {formatPrice(product.originalPrice)}
                                        </span>
                                      )}
                                      {product.originalPrice && (
                                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                          {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-gold text-gold" />
                                      <span className="text-[10px] text-brown-500 dark:text-brown-500">{product.rating}</span>
                                      <span className="text-[10px] text-brown-300 dark:text-brown-500">({product.reviews})</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </DialogTrigger>

                          {/* Product Detail Dialog */}
                          <DialogContent className="max-w-lg bg-cream dark:bg-[#1A1412] border-gold/20 max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-serif text-lg text-brown-900 dark:text-brown-600">
                                {product.emoji} {product.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Price & Rating */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-gold-dark dark:text-gold">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-brown-300 dark:text-brown-500 line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-brown-200 dark:text-brown-500'}`} />
                                  ))}
                                  <span className="text-xs text-brown-500 dark:text-brown-500 ml-1">
                                    {product.rating} ({product.reviews} reviews)
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-brown-600 dark:text-brown-500 leading-relaxed">
                                {product.description}
                              </p>

                              {/* Benefits */}
                              <div>
                                <h4 className="text-sm font-semibold text-brown-900 dark:text-brown-600 mb-2 flex items-center gap-1.5">
                                  <Check className="w-4 h-4 text-sage-dark" />
                                  Benefits
                                </h4>
                                <div className="space-y-1.5">
                                  {product.benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-start gap-2">
                                      <span className="text-gold mt-0.5">✦</span>
                                      <span className="text-sm text-brown-600 dark:text-brown-500">{benefit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Related Dosha/Planet */}
                              {(product.doshaRelated || product.planetRelated) && (
                                <div className="flex flex-wrap gap-2">
                                  {product.doshaRelated?.map(d => (
                                    <Badge key={d} className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-0 text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      {d}
                                    </Badge>
                                  ))}
                                  {product.planetRelated?.map(p => (
                                    <Badge key={p} className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-0 text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      {p}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* CTA */}
                              <div className="pt-2">
                                <Button className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold h-12 shadow-lg">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Add to Cart — {formatPrice(product.price)}
                                </Button>
                                <p className="text-[10px] text-brown-300 dark:text-brown-500 text-center mt-2">
                                  🔒 Secure payment · 📦 Authentic & certified · 🙏 Energized before shipping
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="glass-premium rounded-xl p-4 border border-gold/15">
            <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-600 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              Why Choose AyuAstro Store?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🙏', text: 'Energized by Vedic Priests' },
                { icon: '💎', text: '100% Authentic & Certified' },
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '📦', text: 'Free Shipping Above ₹999' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[11px] text-brown-500 dark:text-brown-500">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
