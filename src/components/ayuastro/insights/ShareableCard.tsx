'use client';

import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Badge } from '@/components/ui/badge';

const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, { element: string; color: string }> = {
  Aries: { element: 'Fire', color: 'from-red-500/20 to-orange-500/10' },
  Taurus: { element: 'Earth', color: 'from-green-600/20 to-emerald-500/10' },
  Gemini: { element: 'Air', color: 'from-yellow-500/20 to-amber-400/10' },
  Cancer: { element: 'Water', color: 'from-blue-400/20 to-cyan-400/10' },
  Leo: { element: 'Fire', color: 'from-orange-500/20 to-amber-500/10' },
  Virgo: { element: 'Earth', color: 'from-green-500/20 to-lime-500/10' },
  Libra: { element: 'Air', color: 'from-pink-400/20 to-rose-400/10' },
  Scorpio: { element: 'Water', color: 'from-purple-600/20 to-indigo-500/10' },
  Sagittarius: { element: 'Fire', color: 'from-purple-500/20 to-violet-400/10' },
  Capricorn: { element: 'Earth', color: 'from-gray-600/20 to-slate-500/10' },
  Aquarius: { element: 'Air', color: 'from-cyan-500/20 to-teal-400/10' },
  Pisces: { element: 'Water', color: 'from-teal-400/20 to-emerald-400/10' },
};

function getTopTraits(traits: TraitScore[], count: number = 3): TraitScore[] {
  return [...traits].sort((a, b) => b.score - a.score).slice(0, count);
}

function getArchetype(traits: TraitScore[]): string {
  if (traits.length === 0) return 'The Seeker';
  const top = getTopTraits(traits, 3);
  const names = top.map((t) => t.name.toLowerCase());
  if (names.includes('empathy') && names.includes('trust')) return 'The Empathic Guardian';
  if (names.includes('empathy')) return 'The Deep Feeler';
  if (names.includes('resilience')) return 'The Resilient Anchor';
  if (names.includes('communication')) return 'The Expressive Bridge';
  if (names.includes('ambition')) return 'The Driven Architect';
  if (names.includes('intuition')) return 'The Intuitive Oracle';
  return 'The Reflective Seeker';
}

function getArchetypeEmoji(archetype: string): string {
  const map: Record<string, string> = {
    'The Empathic Guardian': '🛡️',
    'The Deep Feeler': '🌊',
    'The Resilient Anchor': '⚓',
    'The Expressive Bridge': '🌉',
    'The Driven Architect': '🏗️',
    'The Intuitive Oracle': '🔮',
    'The Reflective Seeker': '🪞',
  };
  return map[archetype] || '✨';
}

export default function ShareableCard() {
  const { traitScores, astrologyData, birthDetails, numerologyData } = useAyuAstroStore();

  const topTraits = getTopTraits(traitScores);
  const archetype = getArchetype(traitScores);
  const archetypeEmoji = getArchetypeEmoji(archetype);

  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';
  const sunElement = ZODIAC_ELEMENTS[sunSign];
  const gradientClass = sunElement?.color || 'from-gold/20 to-brown-200/10';

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass} p-[2px]`}
      >
        {/* Decorative border pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-3 text-gold/30 text-xs">♈ ♉ ♊ ♋</div>
          <div className="absolute top-2 right-3 text-gold/30 text-xs">♌ ♍ ♎ ♏</div>
          <div className="absolute bottom-8 left-3 text-gold/30 text-xs">♐ ♑ ♒ ♓</div>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-white via-cream to-white p-6">
          {/* Header with Archetype */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">{archetypeEmoji}</span>
            </div>
            <h2
              className="font-serif text-xl font-bold text-brown-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {birthDetails?.name || 'Cosmic Seeker'}
            </h2>
            <p
              className="font-serif text-sm font-semibold text-gold-dark mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {archetype}
            </p>
          </div>

          {/* Zodiac Signs Row */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                <span className="text-xl">{ZODIAC_ICONS[sunSign]}</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-brown-400 mt-1">Sun</p>
              <p className="text-xs font-semibold text-brown-900">{sunSign}</p>
            </div>
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-brown-50 border border-brown-200">
                <span className="text-xl">{ZODIAC_ICONS[moonSign]}</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-brown-400 mt-1">Moon</p>
              <p className="text-xs font-semibold text-brown-900">{moonSign}</p>
            </div>
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-sage-muted/50 border border-sage/20">
                <span className="text-xl">{ZODIAC_ICONS[ascendant]}</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-brown-400 mt-1">Asc</p>
              <p className="text-xs font-semibold text-brown-900">{ascendant}</p>
            </div>
          </div>

          {/* Top Traits */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-brown-400 mb-2 text-center">
              Top Traits
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {topTraits.map((trait, i) => (
                <Badge
                  key={i}
                  className={`border-0 text-xs font-medium ${
                    i === 0
                      ? 'bg-gold/15 text-gold-dark'
                      : i === 1
                      ? 'bg-sage-muted text-sage-dark'
                      : 'bg-brown-50 text-brown-600'
                  }`}
                >
                  {trait.label || trait.name} {Math.round(trait.score)}%
                </Badge>
              ))}
            </div>
          </div>

          {/* Numerology Quick Stats */}
          {numerologyData && (
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p
                  className="font-serif text-2xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {numerologyData.lifePathNumber}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-brown-400">Life Path</p>
              </div>
              <div className="w-px h-8 bg-brown-200" />
              <div className="text-center">
                <p
                  className="font-serif text-2xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {numerologyData.destinyNumber}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-brown-400">Destiny</p>
              </div>
              <div className="w-px h-8 bg-brown-200" />
              <div className="text-center">
                <p
                  className="font-serif text-2xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {numerologyData.soulUrgeNumber}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-brown-400">Soul Urge</p>
              </div>
            </div>
          )}

          {/* Branding Footer */}
          <div className="pt-3 border-t border-brown-100 text-center">
            <p className="text-[10px] text-brown-300 tracking-wider">
              ✦ Generated by <span className="font-semibold text-brown-500">AyuAstro</span> ✦
            </p>
            <p className="text-[8px] text-brown-200 mt-0.5">
              AI-Powered Emotional Intelligence Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
