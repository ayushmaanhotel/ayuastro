import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PRODUCTS = [
  {
    id: 'mangal-dosha-puja',
    name: 'Mangal Dosha Nivaran Puja',
    category: 'Pujas',
    price: 5100,
    originalPrice: 7500,
    emoji: '🔥',
    description: 'Sacred Vedic ceremony to pacify Mars energy and reduce Mangal Dosha effects on marriage and relationships.',
    benefits: ['Reduces marital delays', 'Harmonizes Mars energy', 'Removes relationship obstacles', 'Performed by certified Vedic priests'],
    doshaRelated: ['Mangal Dosha', 'Mars'],
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let userDoshas: string[] = [];
    let userPlanets: string[] = [];
    let isPersonalized = false;

    if (token) {
      const preferences = await db.userPreferences.findUnique({
        where: { ucpToken: token },
        include: {
          user: {
            include: {
              astrology: true,
            },
          },
        },
      });

      if (preferences && preferences.ucpEnabled && preferences.user.astrology) {
        isPersonalized = true;
        const astro = preferences.user.astrology;
        try {
          const parsedDoshas = JSON.parse(astro.doshas);
          userDoshas = Array.isArray(parsedDoshas) 
            ? parsedDoshas.map(d => (typeof d === 'string' ? d : d.name || '').toLowerCase())
            : [];
        } catch (e) {
          console.warn('Failed to parse user doshas:', e);
        }
        try {
          const parsedPositions = JSON.parse(astro.planetaryPositions);
          userPlanets = parsedPositions ? Object.keys(parsedPositions) : [];
        } catch (e) {
          console.warn('Failed to parse user planetaryPositions:', e);
        }
      }
    }

    const catalog = PRODUCTS.map(product => {
      let isRecommended = false;
      let reason = undefined;

      if (isPersonalized) {
        // Check dosha alignment
        const matchesDosha = product.doshaRelated?.some(d => 
          userDoshas.some(ud => ud.includes(d.toLowerCase().split(' ')[0]))
        );
        // Check planet alignment
        const matchesPlanet = product.planetRelated?.some(p => 
          userPlanets.some(up => up.toLowerCase() === p.toLowerCase())
        );

        if (matchesDosha) {
          isRecommended = true;
          reason = `Recommended to pacify or balance active ${product.doshaRelated?.join(', ')} traits detected in your chart.`;
        } else if (matchesPlanet) {
          isRecommended = true;
          reason = `Recommended to strengthen or remediate your natal ${product.planetRelated?.join(', ')} energy.`;
        }
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        description: product.description,
        benefits: product.benefits,
        rating: product.rating,
        reviews: product.reviews,
        inStock: product.inStock,
        isRecommended,
        recommendationReason: reason,
      };
    });

    // Sort: Recommended products first, then bestseller, then the rest
    catalog.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      personalized: isPersonalized,
      catalog,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('[UCP Catalog API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
