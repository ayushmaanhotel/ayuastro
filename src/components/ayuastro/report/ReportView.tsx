'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore, type ReportSection, type AstrologyInfo, type NumerologyInfo, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
  Download,
  ArrowUp,
  Star,
  BookOpen,
  Clock,
  Ghost,
  HeartCrack,
  Briefcase,
  Home,
  HeartPulse,
  Map,
  BarChart3,
  Flame,
  Loader2,
  AlertCircle,
  Check,
  Zap,
  ShieldAlert,
  GitBranch,
  Baby,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

// ─── Zodiac Symbols Map ─────────────────────────────────────────────────────
const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, { element: string; color: string; bgClass: string }> = {
  Aries: { element: 'Fire', color: 'text-red-500', bgClass: 'from-red-500/10 to-orange-500/5' },
  Leo: { element: 'Fire', color: 'text-red-500', bgClass: 'from-red-500/10 to-orange-500/5' },
  Sagittarius: { element: 'Fire', color: 'text-red-500', bgClass: 'from-red-500/10 to-orange-500/5' },
  Taurus: { element: 'Earth', color: 'text-emerald-600', bgClass: 'from-emerald-500/10 to-green-500/5' },
  Virgo: { element: 'Earth', color: 'text-emerald-600', bgClass: 'from-emerald-500/10 to-green-500/5' },
  Capricorn: { element: 'Earth', color: 'text-emerald-600', bgClass: 'from-emerald-500/10 to-green-500/5' },
  Gemini: { element: 'Air', color: 'text-amber-500', bgClass: 'from-amber-500/10 to-yellow-500/5' },
  Libra: { element: 'Air', color: 'text-amber-500', bgClass: 'from-amber-500/10 to-yellow-500/5' },
  Aquarius: { element: 'Air', color: 'text-amber-500', bgClass: 'from-amber-500/10 to-yellow-500/5' },
  Cancer: { element: 'Water', color: 'text-sky-500', bgClass: 'from-sky-500/10 to-blue-500/5' },
  Scorpio: { element: 'Water', color: 'text-sky-500', bgClass: 'from-sky-500/10 to-blue-500/5' },
  Pisces: { element: 'Water', color: 'text-sky-500', bgClass: 'from-sky-500/10 to-blue-500/5' },
};

// ─── Icon Map (15+ sections) ────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  message: MessageCircle,
  user: User,
  sparkles: Sparkles,
  eye: Eye,
  shield: Shield,
  dollar: DollarSign,
  repeat: Repeat,
  wallet: DollarSign,
  ghost: Ghost,
  heartcrack: HeartCrack,
  briefcase: Briefcase,
  home: Home,
  heartpulse: HeartPulse,
  map: Map,
  barchart3: BarChart3,
  flame: Flame,
  shieldalert: ShieldAlert,
  gitbranch: GitBranch,
  baby: Baby,
  scale: Scale,
  shieldcheck: ShieldCheck,
  users: Users,
};

// ─── Section Color Themes ───────────────────────────────────────────────────
const SECTION_COLORS: Record<string, { gradient: string; iconBg: string; iconColor: string; badgeBg: string; badgeColor: string }> = {
  'emotional-personality': { gradient: 'from-rose-500/10 to-pink-500/5', iconBg: 'bg-rose-500/15', iconColor: 'text-rose-600', badgeBg: 'bg-rose-500/10', badgeColor: 'text-rose-700' },
  'relationship-style': { gradient: 'from-violet-500/10 to-purple-500/5', iconBg: 'bg-violet-500/15', iconColor: 'text-violet-600', badgeBg: 'bg-violet-500/10', badgeColor: 'text-violet-700' },
  'communication-patterns': { gradient: 'from-sky-500/10 to-blue-500/5', iconBg: 'bg-sky-500/15', iconColor: 'text-sky-600', badgeBg: 'bg-sky-500/10', badgeColor: 'text-sky-700' },
  'hidden-strengths': { gradient: 'from-amber-500/10 to-yellow-500/5', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-600', badgeBg: 'bg-amber-500/10', badgeColor: 'text-amber-700' },
  'emotional-blind-spots': { gradient: 'from-indigo-500/10 to-blue-500/5', iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-600', badgeBg: 'bg-indigo-500/10', badgeColor: 'text-indigo-700' },
  'money-psychology': { gradient: 'from-emerald-500/10 to-green-500/5', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-600', badgeBg: 'bg-emerald-500/10', badgeColor: 'text-emerald-700' },
  'recurring-life-patterns': { gradient: 'from-orange-500/10 to-red-500/5', iconBg: 'bg-orange-500/15', iconColor: 'text-orange-600', badgeBg: 'bg-orange-500/10', badgeColor: 'text-orange-700' },
  'your-dark-side': { gradient: 'from-gray-600/10 to-slate-500/5', iconBg: 'bg-gray-600/15', iconColor: 'text-gray-700', badgeBg: 'bg-gray-600/10', badgeColor: 'text-gray-700' },
  'love-heartbreak-timeline': { gradient: 'from-pink-500/10 to-rose-500/5', iconBg: 'bg-pink-500/15', iconColor: 'text-pink-600', badgeBg: 'bg-pink-500/10', badgeColor: 'text-pink-700' },
  'career-truth': { gradient: 'from-teal-500/10 to-cyan-500/5', iconBg: 'bg-teal-500/15', iconColor: 'text-teal-600', badgeBg: 'bg-teal-500/10', badgeColor: 'text-teal-700' },
  'family-karma': { gradient: 'from-amber-600/10 to-orange-500/5', iconBg: 'bg-amber-600/15', iconColor: 'text-amber-700', badgeBg: 'bg-amber-600/10', badgeColor: 'text-amber-800' },
  'health-warnings': { gradient: 'from-red-500/10 to-rose-500/5', iconBg: 'bg-red-500/15', iconColor: 'text-red-600', badgeBg: 'bg-red-500/10', badgeColor: 'text-red-700' },
  'life-phase-roadmap': { gradient: 'from-blue-500/10 to-indigo-500/5', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-600', badgeBg: 'bg-blue-500/10', badgeColor: 'text-blue-700' },
  'financial-timeline': { gradient: 'from-green-500/10 to-emerald-500/5', iconBg: 'bg-green-500/15', iconColor: 'text-green-600', badgeBg: 'bg-green-500/10', badgeColor: 'text-green-700' },
  'spiritual-purpose': { gradient: 'from-purple-500/10 to-violet-500/5', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-600', badgeBg: 'bg-purple-500/10', badgeColor: 'text-purple-700' },
  'your-deepest-fear': { gradient: 'from-red-600/10 to-rose-600/5', iconBg: 'bg-red-600/15', iconColor: 'text-red-700', badgeBg: 'bg-red-600/10', badgeColor: 'text-red-800' },
  'your-friendship-pattern': { gradient: 'from-cyan-500/10 to-teal-500/5', iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-600', badgeBg: 'bg-cyan-500/10', badgeColor: 'text-cyan-700' },
  'your-anger-blueprint': { gradient: 'from-orange-600/10 to-red-600/5', iconBg: 'bg-orange-600/15', iconColor: 'text-orange-700', badgeBg: 'bg-orange-600/10', badgeColor: 'text-orange-800' },
  'your-power-years': { gradient: 'from-yellow-500/10 to-amber-500/5', iconBg: 'bg-yellow-500/15', iconColor: 'text-yellow-600', badgeBg: 'bg-yellow-500/10', badgeColor: 'text-yellow-700' },
  'your-decision-pattern': { gradient: 'from-lime-500/10 to-green-500/5', iconBg: 'bg-lime-500/15', iconColor: 'text-lime-600', badgeBg: 'bg-lime-500/10', badgeColor: 'text-lime-700' },
  'your-parenting-style': { gradient: 'from-pink-500/10 to-fuchsia-500/5', iconBg: 'bg-pink-500/15', iconColor: 'text-pink-600', badgeBg: 'bg-pink-500/10', badgeColor: 'text-pink-700' },
  'your-personalized-remedies': { gradient: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-600', badgeBg: 'bg-emerald-500/10', badgeColor: 'text-emerald-700' },
  'honest-disclaimer': { gradient: 'from-slate-500/10 to-gray-500/5', iconBg: 'bg-slate-500/15', iconColor: 'text-slate-600', badgeBg: 'bg-slate-500/10', badgeColor: 'text-slate-700' },
};

// ─── Personalized Default Section Generator ─────────────────────────────────
function generatePersonalizedDefaults(
  astrology: AstrologyInfo | null,
  numerology: NumerologyInfo | null,
  traits: TraitScore[]
): { freeSections: ReportSection[]; premiumSections: ReportSection[] } {
  // Extract data with defaults
  const sun = astrology?.sunSign || 'your Sun sign';
  const moon = astrology?.moonSign || 'your Moon sign';
  const asc = astrology?.ascendant || 'your Ascendant';
  const nakshatra = astrology?.nakshatra || 'your Nakshatra';
  const dasha = astrology?.currentDasha || 'your current Dasha';
  const yogas = astrology?.yogas || [];
  const doshas = astrology?.doshas || [];
  const lifePath = numerology?.lifePathNumber || 1;
  const destiny = numerology?.destinyNumber || 1;
  const soulUrge = numerology?.soulUrgeNumber || 1;

  // Build trait map
  const traitMap: Record<string, number> = {};
  traits.forEach(t => { traitMap[t.name] = t.score; });

  const emotionalIntensity = traitMap['emotionalIntensity'] ?? 50;
  const attachmentStyle = traitMap['attachmentStyle'] ?? 50;
  const trust = traitMap['trust'] ?? 50;
  const empathy = traitMap['empathy'] ?? 50;
  const ambition = traitMap['ambition'] ?? 50;
  const discipline = traitMap['discipline'] ?? 50;
  const impulsiveness = traitMap['impulsiveness'] ?? 50;
  const creativity = traitMap['creativity'] ?? 50;
  const patience = traitMap['patience'] ?? 50;
  const resilience = traitMap['resilience'] ?? 50;
  const communicationOpenness = traitMap['communicationOpenness'] ?? 50;
  const socialEnergy = traitMap['socialEnergy'] ?? 50;
  const intuition = traitMap['intuition'] ?? 50;
  const adaptability = traitMap['adaptability'] ?? 50;

  // Find strongest and weakest
  const strongest = traits.length > 0 ? traits.reduce((a, b) => a.score > b.score ? a : b) : { name: 'emotionalIntensity', label: 'Emotional Intensity', score: 50, description: '' };
  const weakest = traits.length > 0 ? traits.reduce((a, b) => a.score < b.score ? a : b) : { name: 'patience', label: 'Patience', score: 50, description: '' };

  // Yoga/dosha text
  const yogaText = yogas.length > 0 ? `Your chart carries ${yogas.join(' and ')} — these amplify specific strengths in your personality.` : 'Your chart is free of major yogas, which means your life path is more self-made than fated.';
  const doshaText = doshas.length > 0 ? `Your chart has ${doshas.join(' and ')} — these create friction points that you'll need to navigate consciously.` : 'Your chart has no major doshas, which means fewer karmic obstacles in your path.';

  // Emotional description based on scores
  const emotionalDesc = emotionalIntensity > 70
    ? 'you feel everything at full volume — your emotions are like an exposed nerve, vivid and sometimes overwhelming'
    : emotionalIntensity > 40
      ? 'you have a rich emotional life but you\'ve developed a filter — you feel deeply but you choose when to show it'
      : 'you process emotions quietly and internally — others may not realize how much is happening beneath your calm surface';

  // Trust description
  const trustDesc = trust > 65
    ? 'you tend to trust freely, which means you sometimes project your own sincerity onto people who haven\'t earned it'
    : trust < 35
      ? 'you guard your trust fiercely, which protects you but also keeps out the people who deserve to be close to you'
      : 'you\'re selective about trust — you give it in measured doses, which is healthy but can feel slow to people who want in';

  // Build personalized free sections
  const freeSections: ReportSection[] = [
    {
      id: 'emotional-personality',
      title: 'Your Emotional Truth',
      icon: 'heart',
      content: `Let's be real about your emotional world. With your Moon in ${moon}, ${emotionalDesc}. Your Sun in ${sun} drives your outer identity, but it's your Moon that runs your inner life — and those two don't always agree.

Your emotional intensity score is ${emotionalIntensity}/100. ${emotionalIntensity > 70 ? 'That means you don\'t just feel things — you get consumed by them. A bad day isn\'t just a bad day; it\'s a full-body experience. This intensity is your superpower when you channel it, and your kryptonite when it channels you.' : emotionalIntensity > 40 ? 'That means you have significant emotional capacity — you feel deeply but you\'ve learned to regulate. The danger is regulating so well that you numb yourself to your own signals.' : 'That means you process emotions internally and quietly. People may underestimate how much is happening beneath your surface because you don\'t show it the way others do.'}

With empathy at ${empathy}/100 and intuition at ${intuition}/100, ${empathy > 65 && intuition > 60 ? 'you absorb others\' emotions AND sense what\'s unsaid — this makes you incredibly perceptive but also vulnerable to emotional overload. You might walk into a room and instantly feel the tension without anyone saying a word.' : empathy > 65 ? 'you absorb others\' emotions easily — sometimes to the point where you can\'t tell which feelings are yours and which belong to someone else. This is especially dangerous in relationships.' : 'you sense more than you absorb — you pick up on undercurrents but don\'t get swept away by them. This gives you clarity but can make you seem detached to people who need emotional mirroring.'}

${yogaText} ${doshaText}

Watch for the pattern where you absorb other people's emotions and mistake them for your own. With your ${moon} Moon, this is especially likely when you're tired or stressed.`,
      traits: ['Emotional Depth', 'Empathy', 'Intuition', 'Inner Conflict'],
      insightLevel: 'free' as const,
    },
    {
      id: 'relationship-style',
      title: 'Your Relationship Reality',
      icon: 'user',
      content: `Here's the truth about how you love: with your attachment style score at ${attachmentStyle}/100 and trust at ${trust}/100, ${trustDesc}.

Your ${moon} Moon means you crave ${moon === 'Cancer' || moon === 'Pisces' || moon === 'Scorpio' ? 'deep emotional merging — you want to feel completely safe with someone, to let your guard down fully. But that desire for merging can make you hold on too tight when you should let go' : moon === 'Aries' || moon === 'Leo' || moon === 'Sagittarius' ? 'passion and independence in equal measure — you want a partner who excites you but doesn\'t clip your wings. The problem? You sometimes confuse excitement for connection' : moon === 'Taurus' || moon === 'Virgo' || moon === 'Capricorn' ? 'stability and consistency — you want someone who shows up, every day, reliably. But your standard for "reliable" might be so high that you reject people for normal human inconsistency' : 'a balance of depth and freedom — you\'re adaptable in relationships but may struggle to articulate what you actually need'}.

Your ${sun} Sun adds another layer: it wants to be ${sun === 'Aries' || sun === 'Leo' || sun === 'Sagittarius' ? 'seen and admired. You might choose partners who reflect well on your image rather than partners who see the real you' : sun === 'Cancer' || sun === 'Scorpio' || sun === 'Pisces' ? 'loved unconditionally. You might stay in relationships long past their expiration date because you believe love should endure everything' : sun === 'Taurus' || sun === 'Virgo' || sun === 'Capricorn' ? 'respected and valued. You might choose partners based on practical compatibility and wonder why something feels missing emotionally' : 'understood intellectually before emotionally. You might overthink relationships instead of feeling your way through them'}.

The gap: ${trust < 40 ? 'Your low trust score means you test people constantly — often without telling them they\'re being tested. The people who pass are the ones who stay consistent despite your walls. But most people give up before they get through, and you interpret that as proof they weren\'t worth trusting. It\'s a self-fulfilling prophecy.' : trust > 70 ? 'Your high trust means you open up fast — sometimes too fast. You might reveal your deepest self to someone who hasn\'t proven they can hold it, and then feel betrayed when they can\'t. Not everyone has the capacity for your depth, and that\'s not their fault or yours.' : 'Your moderate trust means you\'re cautious but not closed. You give people a chance but keep one foot out the door. This protects you but also prevents the vulnerability that creates genuine intimacy.'}

With social energy at ${socialEnergy}/100, ${socialEnergy > 65 ? 'you need regular social connection to feel alive — isolation drains you faster than conflict' : socialEnergy < 35 ? 'you recharge alone and too much social interaction depletes you — your partner needs to understand that your need for space isn\'t rejection' : 'you balance social time and alone time well, but your relationship needs are very specific and non-negotiable'}.`,
      traits: ['Attachment Pattern', 'Trust Issues', 'Deep Connection', 'Vulnerability'],
      insightLevel: 'free' as const,
    },
    {
      id: 'communication-patterns',
      title: 'How You Really Communicate',
      icon: 'message',
      content: `Your communication openness score is ${communicationOpenness}/100. ${communicationOpenness > 65 ? 'You share freely — sometimes too freely. You might tell a stranger your life story in 10 minutes, which creates instant connection but also instant vulnerability. Not everyone deserves that level of access to you.' : communicationOpenness < 35 ? 'You keep a fortress around your inner world. Most people will never get past the moat. This isn\'t coldness — it\'s protection. But the walls that keep out the wrong people also keep out the right ones.' : 'You share selectively — you have different levels of openness for different people. This is actually healthy, but it can confuse people who can\'t figure out where they stand with you.'}

With impulsiveness at ${impulsiveness}/100 and discipline at ${discipline}/100: ${impulsiveness > 65 && discipline < 40 ? 'You speak before you think and regret it later. Your words are honest but sometimes brutal. You\'ve probably said things in arguments you can\'t take back, and the pattern keeps repeating because your impulse to express always outruns your filter.' : impulsiveness < 35 && discipline > 60 ? 'You overthink every word before saying it. By the time you\'ve formulated the perfect response, the moment has passed. People think you\'re distant when you\'re actually just processing. Your written communication is probably 10x better than your spoken.' : 'You balance thought and expression reasonably well, but you may default to silence when you should speak up, especially when the topic is emotionally charged.'}

Your ${asc} Ascendant means people first see you as ${asc === 'Aries' ? 'bold and direct — but they don\'t see the hesitation underneath' : asc === 'Taurus' ? 'calm and grounded — but they don\'t see the stubbornness that comes when you\'re pushed' : asc === 'Gemini' ? 'quick and clever — but they don\'t see the depth behind the wit' : asc === 'Cancer' ? 'warm and caring — but they don\'t see the self-protection underneath' : asc === 'Leo' ? 'confident and expressive — but they don\'t see the vulnerability you mask with performance' : asc === 'Virgo' ? 'precise and helpful — but they don\'t see the anxiety that drives the perfectionism' : asc === 'Libra' ? 'diplomatic and charming — but they don\'t see the indecision behind the pleasantness' : asc === 'Scorpio' ? 'intense and private — but they don\'t see how much you actually want to be understood' : asc === 'Sagittarius' ? 'adventurous and optimistic — but they don\'t see the restlessness that never lets you settle' : asc === 'Capricorn' ? 'serious and capable — but they don\'t see the softness you protect with competence' : asc === 'Aquarius' ? 'independent and unconventional — but they don\'t see the loneliness underneath the detachment' : 'sensitive and intuitive — but they don\'t see the strength behind the gentleness'}.

Your communication superpower: ${empathy > 60 && intuition > 60 ? 'you hear what people AREN\'T saying. You pick up on the unsaid, the hinted, the avoided. This makes you an incredible listener and a terrifying opponent in arguments because you see through deflection instantly.' : creativity > 65 ? 'you find unexpected ways to express complex ideas. You use metaphors, stories, and analogies that make abstract feelings concrete. People remember what you say because you say it differently than anyone else.' : 'your words carry weight because you don\'t waste them. When you speak, people listen — not because you\'re loud, but because you\'re deliberate.'}`,
      traits: ['Selective Expression', 'Written Strength', 'Passive Patterns', 'Deep Listening'],
      insightLevel: 'free' as const,
    },
  ];

  // Build personalized premium sections (teaser + CTA style)
  const premiumSections: ReportSection[] = [
    {
      id: 'hidden-strengths',
      title: 'Powers You Don\'t Know You Have',
      icon: 'sparkles',
      content: `With creativity at ${creativity} and intuition at ${intuition}, you have strengths you don't fully recognize because they come so naturally that you think everyone has them. They don't.

Your ${strongest.label} (${strongest.score}/100) is your most dominant trait — it shapes almost everything you do, but you probably take it for granted. Meanwhile, your resilience at ${resilience} means ${resilience > 70 ? 'you bounce back from things that would break most people, but you might not even realize you\'re doing it because recovery has become automatic' : resilience > 40 ? 'you endure more than you think you can, but your recovery isn\'t automatic — it requires conscious effort and the right conditions' : 'you\'re more fragile than you let on, and pushing through without recovering is a pattern that will catch up with you'}.

${yogas.length > 0 ? `Your ${yogas[0]} yoga specifically amplifies your innate abilities in ways you haven't fully tapped into yet.` : ''}

**Generate your Deep Intelligence Report to discover your specific hidden powers, how your ${moon} Moon and ${sun} Sun combination creates a unique edge, and what happens when you finally stop doubting your strongest abilities.**`,
      traits: ['Root-Cause Thinking', 'Strategic Creativity', 'Quiet Resilience', 'Adaptive Strength'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'emotional-blind-spots',
      title: 'What You Refuse to See',
      icon: 'eye',
      content: `With emotional intensity at ${emotionalIntensity} and patience at ${patience}, ${emotionalIntensity > 70 && patience < 40 ? 'you react fast and feel hard — and you probably don\'t notice the loop: you react, feel ashamed of your reaction, suppress it, and then erupt again. This cycle runs on autopilot and it\'s costing you relationships' : emotionalIntensity < 40 && patience > 60 ? 'you suppress your emotions so effectively that you\'ve convinced yourself you\'re "over it" when you\'re actually just numb. Your body keeps score though — pay attention to tension headaches, jaw clenching, or digestive issues' : 'you have a moderate emotional pattern, but there\'s a specific blind spot you can\'t see from inside it'}.

${trust > 65 ? 'Your high trust score means you project your own sincerity onto others — you assume people mean what they say because YOU mean what you say. This gets you betrayed more often than it should.' : trust < 35 ? 'Your low trust means you push people away before they can hurt you — but the people you push away are often the ones who would have stayed. Your self-protection has become self-isolation.' : ''}

**Generate your Deep Intelligence Report to uncover your specific blind spots, how your ${doshas.length > 0 ? doshas[0] + ' dosha' : 'chart patterns'} warp your perception, and the exact pattern you keep repeating that you think is "just how things are."**`,
      traits: ['Self-Worth Gap', 'Over-Giving', 'Need vs Love', 'Emotional Intelligence Trap'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'money-psychology',
      title: 'Your Money Story — The Whole Truth',
      icon: 'wallet',
      content: `With ambition at ${ambition} and discipline at ${discipline}, ${ambition > 70 && discipline > 60 ? 'you\'re a Builder — slow and steady wealth accumulation is your natural pattern. But you might be building wealth without building freedom, and the money keeps growing while the satisfaction doesn\'t' : ambition > 70 && impulsiveness > 60 ? 'you\'re a Rollercoaster — big earning years followed by big losses. Your ambition drives you to earn but your impulsiveness drives you to spend, and the gap between the two is where your financial stress lives' : ambition < 40 && creativity > 60 ? 'you\'re an Underearner — brilliant but struggling to monetize your talent. You value meaning over money, which is noble, but it\'s also keeping you from the financial security your nervous system craves' : 'your financial pattern is complex — neither purely saver nor spender, but something specific to your chart that needs deeper analysis'}.

Your Soul Urge number is ${soulUrge} — ${soulUrge === 4 ? 'you want SECURITY above all. Money for you equals safety' : soulUrge === 5 ? 'you want FREEDOM above all. Money for you equals the ability to go anywhere and do anything' : soulUrge === 8 ? 'you want POWER and LEGACY. Money for you equals influence and the ability to create lasting impact' : soulUrge === 1 ? 'you want INDEPENDENCE. Money for you equals never having to depend on anyone' : soulUrge === 6 ? 'you want to PROVIDE. Money for you equals the ability to take care of the people you love' : 'money represents something deeply personal that your chart reveals in detail'}.

**Generate your Deep Intelligence Report to understand your complete money psychology, what your ${destiny} Destiny Number says about your financial approach, and the specific blind spot that's keeping you from the financial reality you deserve.**`,
      traits: ['Emotional Spending', 'Security Seeking', 'Undervaluing Self', 'Financial Anxiety'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'recurring-life-patterns',
      title: 'Patterns That Keep Repeating',
      icon: 'repeat',
      content: `Your Life Path Number is ${lifePath} — this means ${lifePath === 1 ? 'your recurring lesson is about sovereignty: learning to stand strong without isolating, to lead without dominating, to be independent without being alone' : lifePath === 2 || lifePath === 11 ? 'your recurring lesson is about balance: learning to give without losing yourself, to cooperate without compromising your core, to be in relationship without disappearing into it' : lifePath === 3 ? 'your recurring lesson is about self-expression: learning to speak your truth without fear of rejection, to create without needing validation, to be seen without performing' : lifePath === 4 || lifePath === 22 ? 'your recurring lesson is about building: learning to create structure without becoming rigid, to work hard without becoming a workaholic, to build something lasting without sacrificing your joy' : lifePath === 5 ? 'your recurring lesson is about freedom: learning to explore without escaping, to change without running, to be free without being lost' : lifePath === 6 ? 'your recurring lesson is about service: learning to care for others without self-destruction, to love without controlling, to give without resentment' : lifePath === 7 ? 'your recurring lesson is about trust: learning to trust your inner knowing, to seek truth without isolating, to be spiritual without being disconnected from reality' : lifePath === 8 ? 'your recurring lesson is about power: learning to use power ethically, to build wealth without becoming it, to lead without exploiting' : 'your recurring lesson is about completion: learning to let go without bitterness, to end chapters without regret, to serve the world without losing yourself'}.

You're currently in ${dasha !== 'your current Dasha' ? `your ${dasha} period` : 'a significant dasha period'} — ${dasha.includes('Saturn') ? 'this means the universe is demanding you get serious about structure and discipline' : dasha.includes('Jupiter') ? 'this means expansion and opportunity are active themes right now' : dasha.includes('Rahu') ? 'this means unconventional paths and sudden changes are likely' : dasha.includes('Venus') ? 'this means relationships, creativity, and material comfort are heightened' : 'this is a significant life chapter that your chart defines in detail'}.

**Generate your Deep Intelligence Report to discover your specific karmic patterns, how your ${nakshatra !== 'your Nakshatra' ? nakshatra + ' Nakshatra' : 'Nakshatra'} myth plays out in your life, and the ONE pattern that — if interrupted — could change everything.**`,
      traits: ['Recognition Seeking', 'Self-Worth Lessons', 'Karmic Loops', 'Transformation Cycles'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-dark-side',
      title: 'Your Shadow Self',
      icon: 'ghost',
      content: `${emotionalIntensity > 75 ? 'Your shadow is emotional manipulation — not the cartoon-villain kind, but the subtle kind. You withdraw affection to make someone feel your absence. You use your emotional intelligence to steer conversations. You don\'t do this maliciously — you do it because direct requests got you nothing growing up.' : impulsiveness > 70 ? 'Your shadow is chaos-creation — you stir up drama when things are too calm because peace feels like death. You might not even realize you\'re doing it until the dust settles and you\'re standing in the wreckage wondering what happened.' : trust < 35 ? 'Your shadow is paranoid sabotage — you destroy good things before they can be destroyed BY them. Your low trust score isn\'t just caution; it\'s a pattern of preemptive strikes against anything that feels too good to be true.' : 'Your shadow is specific to your chart combination — and it\'s something you probably justify to yourself every day without realizing it.'}

Your ${moon} Moon's dark side: every moon sign has a shadow. ${moon === 'Aries' ? 'Yours is volcanic rage that erupts and then wonders why everyone is upset' : moon === 'Taurus' ? 'Yours is stubborn possessiveness that confuses holding on with loving' : moon === 'Gemini' ? 'Yours is emotional detachment that looks like indifference but is actually fear of depth' : moon === 'Cancer' ? 'Yours is emotional manipulation through guilt and moodiness when you feel unsafe' : moon === 'Leo' ? 'Yours is dramatic self-centeredness that makes everything about your pain' : moon === 'Virgo' ? 'Yours is critical perfectionism that tears down yourself and others in the name of "helping"' : moon === 'Libra' ? 'Yours is people-pleasing that erases your own needs and then resents people for not seeing them' : moon === 'Scorpio' ? 'Yours is vindictive obsession — you can love and hate someone with equal intensity, sometimes simultaneously' : moon === 'Sagittarius' ? 'Yours is running away when things get too real — you confuse escape with freedom' : moon === 'Capricorn' ? 'Yours is emotional coldness that masks how much you actually feel — people think you don\'t care when you care too much' : moon === 'Aquarius' ? 'Yours is intellectualization that distances you from your own feelings — you analyze instead of feel' : 'Yours is emotional absorption that makes you carry other people\'s darkness as your own'}.

**Generate your Deep Intelligence Report to confront your complete shadow self, how it shows up under stress, and what you need to integrate — not eliminate — to become whole.**`,
      traits: ['Subtle Manipulation', 'Grudge Holding', 'Indirect Strategies', 'Emotional Control'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'love-heartbreak-timeline',
      title: 'Your Love & Heartbreak Timeline',
      icon: 'heartcrack',
      content: `With attachment style at ${attachmentStyle} and emotional intensity at ${emotionalIntensity}, your love archetype is ${attachmentStyle > 60 && empathy > 60 ? 'the Devoted Lover — you give everything and get destroyed when it ends. Your love is genuine but it\'s also consuming' : trust < 40 && emotionalIntensity > 50 ? 'the Guarded Heart — you feel deeply but refuse to show it. You push people away to test if they\'ll stay, and most of them don\'t' : impulsiveness > 60 && socialEnergy > 55 ? 'the Serial Romantic — you love the beginning but bolt when it gets real. The chemistry is always there; the commitment is the challenge' : 'unique to your specific chart combination'}.

Your current ${dasha !== 'your current Dasha' ? `${dasha} period` : 'dasha period'} is directly influencing your love life right now. ${dasha.includes('Venus') ? 'This is a high-activation period for romance — love is in the air but so is the potential for intensity.' : dasha.includes('Saturn') ? 'This is a period where relationships get serious or end — there\'s no middle ground right now.' : dasha.includes('Rahu') ? 'This can bring unconventional or intense connections — be careful of getting swept up in chemistry without compatibility.' : 'The specific timing of your love windows requires deeper analysis of your complete dasha sequence.'}

**Generate your Deep Intelligence Report to get specific year ranges for when love enters, when heartbreak is probable, and when the stars align for your most significant partnership milestone.**`,
      traits: ['Love Phases', 'Heartbreak Lessons', 'Timing Patterns', 'Dasha Influence'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'career-truth',
      title: 'What You\'re Actually Meant to Do',
      icon: 'briefcase',
      content: `With ambition at ${ambition} and creativity at ${creativity}, ${ambition > 70 && creativity > 65 ? 'you need a career that has BOTH upward mobility AND creative freedom. The moment either one is missing, you start dying inside. You\'re not meant for a straight ladder — you\'re meant for a portfolio career where each role feeds a different part of you' : ambition < 40 && creativity > 65 ? 'you\'re probably in a job that drains you while your real genius goes untapped. You value meaning over prestige, but you\'ve been told that\'s "not ambitious enough." It\'s not — it\'s a different kind of ambition entirely' : ambition > 70 && creativity < 40 ? 'you thrive in structured, competitive environments. You\'re built for the corporate ladder — but make sure you\'re climbing the right wall. Success without fulfillment isn\'t success' : 'your career path is more nuanced than a simple score can capture — your specific chart combination reveals a calling that defies conventional career categories'}.

Your Life Path ${lifePath} means you're here to ${lifePath === 1 ? 'BUILD something of your own — entrepreneurship or independent work calls to you' : lifePath === 2 || lifePath === 11 ? 'BRIDGE people and ideas — mediation, counseling, or partnership-based work is your arena' : lifePath === 3 ? 'EXPRESS and CREATE — communication, writing, or artistic work is where you come alive' : lifePath === 4 || lifePath === 22 ? 'STRUCTURE and BUILD — engineering, architecture, or systems design is your natural domain' : lifePath === 5 ? 'EXPLORE and EXPERIENCE — travel, media, or anything with variety feeds your soul' : lifePath === 6 ? 'HEAL and SERVE — counseling, healthcare, or education is where you find purpose' : lifePath === 7 ? 'RESEARCH and UNDERSTAND — analysis, investigation, or spiritual work is your calling' : lifePath === 8 ? 'LEAD and LEVERAGE — business, finance, or executive leadership is your arena' : 'COMPLETE and ELEVATE — teaching, philanthropy, or wisdom-sharing is your endgame'}.

**Generate your Deep Intelligence Report to discover what you're actually meant to do (it's probably not what your family expects), what your ${nakshatra !== 'your Nakshatra' ? nakshatra + ' Nakshatra' : 'chart'} says about your natural genius at work, and the career trap you're most likely to fall into.**`,
      traits: ['Mission-Driven', 'Mirror for Others', 'Anti-Corporate', 'Pivoting Path'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'family-karma',
      title: 'What You Inherited From Your Family',
      icon: 'home',
      content: `Your ${moon} Moon in Vedic astrology represents your mother and your emotional foundation. ${moon === 'Cancer' ? 'This suggests an emotionally present but sometimes smothering maternal influence — you learned to nurture by being nurtured, but you may also have learned to hold on too tight' : moon === 'Capricorn' ? 'This suggests a mother who provided materially but may have been emotionally distant — you learned early that feelings were private, not shared' : moon === 'Aries' ? 'This suggests a strong, independent maternal figure who taught you to stand on your own but may not have modeled emotional vulnerability' : moon === 'Scorpio' ? 'This suggests an intense, complex maternal relationship — you learned about power and control early, possibly through emotional extremes' : 'Your Moon sign reveals a specific family pattern that runs deeper than you realize'}.

Your trust score of ${trust} and attachment style of ${attachmentStyle} didn't come from nowhere — ${attachmentStyle > 60 ? 'your anxious attachment likely came from inconsistent emotional availability in childhood' : attachmentStyle < 40 ? 'your avoidant pattern likely came from learning early that expressing needs led to disappointment' : 'your attachment pattern is relatively balanced, which suggests either a secure foundation or significant conscious healing'}.

**Generate your Deep Intelligence Report to uncover your complete family karma — what you inherited, what you need to break, and what you need to honor.**`,
      traits: ['Father Wound', 'Mother Pattern', 'Wealth Inheritance', 'Generational Cycles'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'health-warnings',
      title: 'What Your Body Is Prone To',
      icon: 'heartpulse',
      content: `Your ${asc} Ascendant governs ${asc === 'Aries' ? 'the head — watch for migraines, sinus issues, and tension headaches when stressed' : asc === 'Taurus' ? 'the throat — thyroid, vocal cords, and neck tension are your weak points' : asc === 'Gemini' ? 'the lungs and nervous system — respiratory issues and anxiety-related symptoms are common' : asc === 'Cancer' ? 'the chest and stomach — digestive issues and emotional eating patterns are likely' : asc === 'Leo' ? 'the heart and spine — cardiovascular health and back problems need attention' : asc === 'Virgo' ? 'the digestive system — IBS, food sensitivities, and stress-induced gut issues' : asc === 'Libra' ? 'the kidneys and lower back — hydration and hormonal balance are key' : asc === 'Scorpio' ? 'the reproductive system and eliminative organs — detox and hormonal health matter' : asc === 'Sagittarius' ? 'the hips and liver — watch for hip issues and liver-related fatigue' : asc === 'Capricorn' ? 'the bones and joints — skeletal health and arthritis prevention matter' : asc === 'Aquarius' ? 'the circulatory system and calves — blood circulation and leg issues' : 'the feet and lymphatic system — foot problems and immune function need attention'}.

Your emotional intensity at ${emotionalIntensity} directly impacts your physical health: ${emotionalIntensity > 70 ? 'suppressed emotions show up as jaw clenching, shoulder tension, and digestive problems. Your body processes what your mind tries to suppress' : 'your moderate emotional processing means your health is generally stable, but watch for psychosomatic symptoms during high-stress periods'}.

**Generate your Deep Intelligence Report for your complete health profile — specific vulnerabilities based on your chart, the stress-body connection your trait scores reveal, and practical vigilance points.**`,
      traits: ['Gut-Brain Connection', 'Stress Tension', 'Forced Rest', 'Existential Anxiety'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'life-phase-roadmap',
      title: 'Your Life Phase Roadmap',
      icon: 'map',
      content: `Your life isn't one long story — it's chapters, and your chart shows what each chapter is about. With Life Path ${lifePath}, your ${lifePath === 1 ? '20s are about proving you can stand alone, your 30s are about learning that standing alone isn\'t the same as being alone' : lifePath === 6 ? '20s are about learning to care for others without losing yourself, your 30s are about building relationships that are partnerships, not rescue missions' : '20s and 30s have specific themes your chart defines in detail'}.

You're in ${dasha !== 'your current Dasha' ? `your ${dasha} period` : 'a significant dasha period'} — this defines the current chapter of your life. ${dasha.includes('Saturn') ? 'Saturn periods demand discipline and deliver earned rewards — your current chapter is about building something real' : dasha.includes('Jupiter') ? 'Jupiter periods bring expansion and growth — your current chapter is about saying yes to the right opportunities' : 'Each dasha period activates specific themes that shape your decisions, relationships, and growth'}.

**Generate your Deep Intelligence Report for your complete decade-by-decade roadmap — specific themes, challenges, and opportunities for your 20s, 30s, 40s, 50s, and 60s+, all mapped to your dasha timeline with approximate year ranges.**`,
      traits: ['Decade Themes', 'Dasha Alignment', 'Growth Windows', 'Wisdom Timeline'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'financial-timeline',
      title: 'When Money Flows & When It Doesn\'t',
      icon: 'barchart3',
      content: `Your financial archetype: ${ambition > 70 && discipline > 60 ? 'The Builder — slow and steady wealth accumulation. You rarely get rich quick but rarely go broke' : ambition > 70 && impulsiveness > 60 ? 'The Rollercoaster — big earning years followed by big losses. Your financial drama is a lifestyle' : ambition < 40 && creativity > 60 ? 'The Underearner — brilliant but can\'t monetize. Always "about to" break through' : discipline > 65 && trust < 40 ? 'The Security Seeker — you hoard money out of fear and it never feels like enough' : 'Your specific financial archetype needs deeper analysis of your chart'}.

Your Destiny Number ${destiny} means ${destiny === 8 ? 'you\'re born to handle large sums but money comes with power struggles' : destiny === 4 ? 'you\'re a steady earner who must build brick by brick' : destiny === 3 ? 'you earn through communication and creativity but income is inconsistent' : destiny === 1 ? 'you have entrepreneurial potential but can overspend proving status' : destiny === 6 ? 'you earn through service and responsibility — money follows meaning for you' : 'your financial approach is unique and your chart reveals it in detail'}.

**Generate your Deep Intelligence Report for your complete financial timeline — when money flows, when it tightens, specific year ranges based on your dasha periods, and your biggest financial blind spot.**`,
      traits: ['Wealth Cycles', 'Career Phases', 'Specialization Value', 'Preservation Strategy'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'spiritual-purpose',
      title: 'Why Your Soul Chose This Life',
      icon: 'flame',
      content: `Your Life Path ${lifePath} is your soul's curriculum: ${lifePath === 1 ? 'sovereignty — learning to stand alone without isolation, to lead without dominating' : lifePath === 2 || lifePath === 11 ? 'balance — learning to give without losing, to cooperate without compromising your core' : lifePath === 3 ? 'self-expression — learning to speak your truth regardless of rejection' : lifePath === 4 || lifePath === 22 ? 'mastery through structure — learning to build without becoming rigid' : lifePath === 5 ? 'freedom — learning to explore without escaping, to change without running' : lifePath === 6 ? 'service without self-destruction — learning to love without controlling, to give without resentment' : lifePath === 7 ? 'inner truth — learning to trust your knowing, to seek without isolating' : lifePath === 8 ? 'ethical power — learning to build wealth without becoming it, to lead without exploiting' : 'completion — learning to let go without bitterness, to end chapters without regret'}.

You keep attracting situations that force you to choose between what others expect and what your soul knows. Every time you choose the expectations, you feel empty. Every time you choose your truth, you feel alive even when it's hard.

**Generate your Deep Intelligence Report to understand your complete spiritual purpose, your ${nakshatra !== 'your Nakshatra' ? nakshatra + ' Nakshatra\'s' : ''} mythological purpose, and what your soul is really here to learn.**`,
      traits: ['Soul Mission', 'Authenticity Test', 'Guide Dharma', 'Suffering as Curriculum'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-deepest-fear',
      title: 'The Fear That Runs Your Life',
      icon: 'shieldalert',
      content: `Your combination of ${trust < 40 ? 'low trust' : trust > 70 ? 'high trust' : 'moderate trust'} and ${emotionalIntensity > 70 ? 'high emotional intensity' : emotionalIntensity < 40 ? 'low emotional intensity' : 'moderate emotional intensity'} creates a specific fear pattern. ${trust < 40 ? 'Your deepest fear is betrayal — you\'re so afraid of being hurt that you\'d rather push people away first. This fear runs your relationships, your career choices, and your willingness to be seen.' : trust > 70 ? 'Your deepest fear is abandonment — you trust so freely that the thought of someone leaving is unbearable. This fear makes you hold on too tight and tolerate too much.' : 'Your fear is specific to your chart and it shows up in the patterns you can\'t break.'}

Every time you get close to something real, this fear whispers something — "don't trust it," "it won't last," "you don't deserve this." And you listen, because the fear feels like protection when it's actually a prison.

**Generate your Deep Intelligence Report to name the specific fear that runs your life, how it shows up in your decisions, and how to stop letting it drive from the back seat.**`,
      traits: ['Core Fear', 'Self-Protection', 'Avoidance Strategy', 'Hidden Cost'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-friendship-pattern',
      title: 'How You Really Do Friendships',
      icon: 'users',
      content: `With empathy at ${empathy} and social energy at ${socialEnergy}, ${empathy > 65 && socialEnergy > 55 ? 'you\'re the therapist friend — everyone comes to you with their problems, but nobody asks how YOU\'RE doing. You give incredible advice but rarely take it yourself' : empathy > 65 && socialEnergy < 40 ? 'you\'re the wise hermit — you have deep insights but few people get close enough to hear them. Your friendships are rare but profound' : socialEnergy > 65 && empathy < 50 ? 'you\'re the life of the party but keep your real self hidden behind the fun. People know the fun version, not the real you' : 'your friendship pattern is unique to your chart combination'}.

**Generate your Deep Intelligence Report to discover your friendship archetype, what you really need from friends but never ask for, and the pattern that keeps repeating in your social life.**`,
      traits: ['Friendship Archetype', 'Trust Circles', 'Conflict Style', 'Unmet Needs'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-anger-blueprint',
      title: 'What Happens When You Get Angry',
      icon: 'flame',
      content: `With impulsiveness at ${impulsiveness} and patience at ${patience}, ${impulsiveness > 65 && patience < 40 ? 'you erupt. Your anger is fast, hot, and destructive. You say things you mean in the moment but regret forever. The damage is done before your rational brain catches up' : impulsiveness < 35 && patience > 60 ? 'you implode. Your anger goes inward, building resentment that leaks out as passive aggression or sudden coldness. People don\'t even know you\'re angry until the relationship is damaged beyond repair' : 'your anger has a specific pattern that your chart reveals in detail — and it\'s probably not what you think it is'}.

Your anger is never about what you think it's about. The person who cut you off? You're not angry about the traffic. You're angry about something deeper.

**Generate your Deep Intelligence Report to decode your anger blueprint — what triggers it, what it's really about, and how to use it instead of being used by it.**`,
      traits: ['Anger Style', 'Hidden Triggers', 'Damage Pattern', 'Constructive Channel'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-power-years',
      title: 'Your Power Years — When Everything Changes',
      icon: 'zap',
      content: `Some years change everything. Your chart and dasha timeline reveal these power years — the ones where life before and life after look completely different. ${dasha !== 'your current Dasha' ? `Your current ${dasha} period is one such window — this is when major life events are most likely to crystallize.` : 'Your current dasha period is one such window.'}

The mistake most people make: they treat power years like regular years. They play safe when they should be bold. They hesitate when they should be decisive.

**Generate your Deep Intelligence Report to identify your specific power years with year ranges, what each one is about, and what you should do (and avoid) during these critical windows.**`,
      traits: ['Power Windows', 'Dasha Transitions', 'Life Milestones', 'Strategic Timing'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-decision-pattern',
      title: 'How You Make Decisions (And Why You Regret Half of Them)',
      icon: 'gitbranch',
      content: `You make relationship decisions with your ${emotionalIntensity > 65 ? 'gut — if it feels right, you go for it, even when the data says otherwise' : 'head — you analyze every angle until the opportunity passes'}, financial decisions with your ${trust < 40 ? 'fear — you protect what you have rather than risk growing it' : ambition > 65 ? 'ambition — you chase the bigger number even when the smaller one would make you happier' : 'instinct — which is better than most people\'s analysis'}, and career decisions with ${discipline > 60 ? 'discipline — you stick with what you started even when you should pivot' : 'impulse — you jump at what excites you even when you should be strategic'}.

The inconsistency is why you second-guess yourself.

**Generate your Deep Intelligence Report to map your specific decision-making pattern, name your regret loop, and get a calibrated process for making better decisions.**`,
      traits: ['Decision Style', 'Regret Pattern', 'Analysis Method', 'Optimal Process'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-parenting-style',
      title: 'The Parent You Are (Or Will Be)',
      icon: 'baby',
      content: `With your ${moon} Moon and empathy at ${empathy}, your nurturing style is ${empathy > 65 ? 'deeply emotional — you feel your children\'s pain before they can express it. This is beautiful but can become smothering if you don\'t allow them their own emotional experience' : empathy < 40 ? 'practical and structured — you provide stability and guidance through action, not words. Your love shows up in what you DO, not what you say' : 'balanced between emotional attunement and practical guidance — but the balance shifts depending on your stress level'}.

The honest truth: you will repeat your parents' patterns unless you consciously choose differently. Under stress, you revert to what you learned.

**Generate your Deep Intelligence Report to name your parenting archetype, your blind spot, and the emotional inheritance you're passing on (or about to).**`,
      traits: ['Nurturing Style', 'Inherited Patterns', 'Parenting Strength', 'Blind Spot'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'your-personalized-remedies',
      title: 'Your Personalized Remedies & Solutions',
      icon: 'shieldcheck',
      content: `This section turns insight into action. After all the patterns, fears, and blind spots — here are your personalized remedies based on your specific chart data.

**Your 3 Priority Remedies:**

1. **Emotional Boundary Practice** — With emotional intensity at ${emotionalIntensity}/100 ${emotionalIntensity > 70 ? 'and empathy at ' + empathy + '/100, you absorb others\' feelings like a sponge. Before every emotional interaction, pause and ask: "Is this MY feeling or theirs?" This single question, practiced daily, rewires the pattern.' : 'you have significant emotional depth. Practice the 10-minute rule: wait 10 minutes before responding to anything emotionally charged.'}

2. **Trust Calibration** — With trust at ${trust}/100, ${trust > 65 ? 'practice "selective vulnerability": share one small truth with someone safe this week. Not everything — just enough to test the waters. Build trust like a muscle, not a flood.' : trust < 35 ? 'practice "graduated risk": let one person in on one thing you\'ve been holding back. Start small. Trust isn\'t given — it\'s built through repeated small acts of courage.' : 'your trust is moderate — maintain it by checking in quarterly: "Is this person earning my continued trust? Am I giving them reason to earn it?"'}

3. **Pattern Interrupt** — When you catch yourself repeating your signature pattern (identified in your recurring patterns section), physically change your state: stand up, drink water, take 3 deep breaths. Then choose differently.

**Generate your Deep Intelligence Report to get 8 categories of personalized remedies — emotional, relational, financial, career, health, spiritual, planetary, and pattern-interruption techniques — all based on YOUR exact birth chart, trait scores, doshas, and dasha period. Plus a 30-day action plan.**`,
      traits: ['Emotional Boundaries', 'Trust Calibration', 'Pattern Interrupt', 'Daily Practice'],
      insightLevel: 'premium' as const,
    },
    {
      id: 'honest-disclaimer',
      title: 'An Honest Note Before You Go',
      icon: 'scale',
      content: `Before you carry all of this with you, there's something important to say.

This report is based on interpretation of your ${sun} Sun, ${moon} Moon, and ${asc} Ascendant — but the MEANING is interpretive, not absolute. Two astrologers could look at the same chart and emphasize completely different things. So take what resonates and leave what doesn't.

This is not 100% accurate. It was never meant to be. Astrology shows tendencies and patterns, not certainties. Your trait scores are approximations, not definitions. A creativity score of ${creativity} doesn't mean you're exactly ${creativity}% creative — it means this factor is significant in your personality.

You are NOT defined by your chart. The chart shows the hand you were dealt — not how you play it. Free will is real. Awareness changes everything. Knowing a pattern exists gives you the power to choose differently, and that's the whole point.

The "nothing to hide" philosophy means we told you the hard truths about your ${moon} Moon's shadow, your ${weakest.label} (${weakest.score}/100) vulnerability, and the patterns your Life Path ${lifePath} creates. But hard truths are still interpretations of data, not objective facts about who you are.

You are more than your chart. You are more than your scores. You are a human being with the capacity to grow, change, and surprise even yourself.`,
      traits: ['Disclaimer', 'Free Will', 'Interpretation', 'Self-Determination'],
      insightLevel: 'premium' as const,
    },
  ];

  return { freeSections, premiumSections };
}

// ─── Markdown Renderer (lightweight) ────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brown-900 dark:text-brown-200 font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.*$)/gm, '<h4 class="font-serif text-base font-bold text-brown-900 dark:text-brown-200 mt-4 mb-2">$1</h4>')
    // Bullet points
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-brown-700 dark:text-brown-400 list-disc leading-relaxed">$1</li>')
    // Line breaks → paragraphs
    .replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/\n/g, '<br/>');
}

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// ─── Language Labels ──────────────────────────────────────────────────────────
const LANGUAGE_OPTIONS: { value: 'en' | 'hi' | 'hinglish'; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { value: 'hinglish', label: 'Hinglish', flag: '🗣️' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReportView() {
  const { reportSections, hasPaid, setView, userId, astrologyData, numerologyData, traitScores, setReportSections, setReportSummary, setReportLoading, reportLoading, language, setLanguage, birthDetails } = useAyuAstroStore();
  const [downloading, setDownloading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [bookmarkedSections, setBookmarkedSections] = useState<Record<string, boolean>>({});
  const [deepReportGenerating, setDeepReportGenerating] = useState(false);
  const [deepReportProgress, setDeepReportProgress] = useState({ completed: 0, total: 22, sectionTitle: '' });
  const [activeSectionNav, setActiveSectionNav] = useState<string | null>(null);
  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const tocRef = useRef<HTMLDivElement | null>(null);

  // Generate personalized default sections
  const { freeSections: defaultFree, premiumSections: defaultPremium } = generatePersonalizedDefaults(astrologyData, numerologyData, traitScores);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.round(progress)));
      setShowBackToTop(scrollTop > 400);

      // Determine active section for TOC
      const sectionIds = allSections.map(s => s.id);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = sectionsRef.current[sectionIds[i]];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSectionNav(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sections logic — dynamic defaults
  const freeSections = reportSections.filter((s) => s.insightLevel === 'free').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'free')
    : defaultFree;
  const premiumSections = reportSections.filter((s) => s.insightLevel === 'premium').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'premium')
    : defaultPremium;
  const allSections = [...freeSections, ...premiumSections];
  const totalSections = allSections.length;
  const hasDeepReport = reportSections.length >= 12;

  // Calculate reading time (180 words per min for detailed content)
  const totalWords = allSections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
  const readingTime = Math.max(1, Math.ceil(totalWords / 180));

  // Count expanded sections as "read"
  const sectionsRead = Object.values(expandedSections).filter(Boolean).length;
  const continueReadingSection = allSections.find(s => !expandedSections[s.id] && (s.insightLevel === 'free' || hasPaid));

  const scrollToSection = useCallback((id: string) => {
    const el = sectionsRef.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setExpandedSections(prev => ({ ...prev, [id]: true }));
    }
  }, []);

  // ─── Deep Intelligence Report Generation ─────────────────────────────────
  const handleGenerateDeepReport = async () => {
    if (!userId || !astrologyData || !numerologyData) {
      cosmicToast.error('Missing data', 'Please complete onboarding first');
      return;
    }

    setDeepReportGenerating(true);
    setDeepReportProgress({ completed: 0, total: 22, sectionTitle: 'Starting...' });

    try {
      const res = await fetch('/api/ai/deep-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          astrologyData: {
            sunSign: astrologyData.sunSign,
            moonSign: astrologyData.moonSign,
            ascendant: astrologyData.ascendant,
            nakshatra: astrologyData.nakshatra,
            currentDasha: astrologyData.currentDasha,
            yogas: astrologyData.yogas,
            doshas: astrologyData.doshas,
          },
          numerologyData: {
            lifePathNumber: numerologyData.lifePathNumber,
            destinyNumber: numerologyData.destinyNumber,
            soulUrgeNumber: numerologyData.soulUrgeNumber,
          },
          traitScores: traitScores.reduce((acc, t) => ({ ...acc, [t.name]: t.score }), {}),
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.sections) {
          setReportSections(data.data.sections);
          setReportSummary(data.data.summary || '');
          cosmicToast.success('Deep Intelligence Report generated! ✦');
        } else {
          cosmicToast.error('Generation failed', data.error || 'Unknown error');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        cosmicToast.error('Generation failed', errorData.error || 'Please try again later');
      }
    } catch {
      cosmicToast.error('Network error', 'Please check your connection');
    } finally {
      setDeepReportGenerating(false);
      setDeepReportProgress({ completed: 0, total: 22, sectionTitle: '' });
    }
  };

  // ─── Download Handler ────────────────────────────────────────────────────
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!userId) {
      setDownloadError('Please complete onboarding first to download your report.');
      return;
    }
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, includePremium: hasPaid }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ayuastro-deep-intelligence-report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        cosmicToast.success('Report downloaded! ✦');
      } else if (res.status === 404) {
        cosmicToast.warning('Download issue', 'Generated a basic report instead');
        generateClientSideReport();
      } else {
        setDownloadError('Failed to generate report. Please try again later.');
      }
    } catch {
      setDownloadError('Network error. Please check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  const generateClientSideReport = () => {
    const name = useAyuAstroStore.getState().birthDetails?.name || 'Seeker';
    const dob = useAyuAstroStore.getState().birthDetails?.dateOfBirth || 'Unknown';
    const tob = useAyuAstroStore.getState().birthDetails?.timeOfBirth || 'Unknown';
    const pob = useAyuAstroStore.getState().birthDetails?.placeOfBirth || 'Unknown';
    const sun = astrologyData?.sunSign || 'Unknown';
    const moon = astrologyData?.moonSign || 'Unknown';
    const asc = astrologyData?.ascendant || 'Unknown';

    const sectionsHtml = allSections.map((s, i) => {
      const isPremium = s.insightLevel === 'premium';
      return `<div style="background:white;border-radius:16px;padding:2.5rem;margin-bottom:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-left:4px solid ${isPremium ? '#D4AF37' : '#8D6E63'};">
        <h2 style="font-family:Georgia,serif;font-size:1.4rem;color:#3E2723;margin-bottom:1rem;">${i + 1}. ${s.title} ${isPremium ? '<span style="background:linear-gradient(135deg,#D4AF37,#D4A84B);color:white;font-size:0.6rem;padding:0.15rem 0.5rem;border-radius:4px;letter-spacing:0.1em;vertical-align:middle;margin-left:0.5rem;">PREMIUM</span>' : ''}</h2>
        <div style="color:#5D4037;line-height:1.9;font-size:0.95rem;">${s.content.replace(/\n\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</div>
        <div style="margin-top:1.2rem;display:flex;gap:0.4rem;flex-wrap:wrap;">${s.traits.map(t => `<span style="background:${isPremium ? 'rgba(212,175,55,0.1)' : '#EFEBE9'};color:${isPremium ? '#B8960C' : '#5D4037'};font-size:0.75rem;padding:0.2rem 0.7rem;border-radius:20px;">${t}</span>`).join('')}</div>
      </div>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AyuAstro Deep Intelligence Report - ${name}</title><style>body{font-family:Inter,-apple-system,sans-serif;background:#FDF6EC;color:#3E2723;line-height:1.7;max-width:800px;margin:0 auto;padding:2rem;}p{margin-bottom:1rem;}</style></head><body>
    <div style="text-align:center;padding:4rem 2rem;border-bottom:3px solid #D4AF37;margin-bottom:3rem;">
      <h1 style="font-family:Georgia,serif;font-size:3.5rem;color:#3E2723;margin-bottom:0.5rem;">AyuAstro</h1>
      <p style="color:#D4AF37;letter-spacing:0.2em;text-transform:uppercase;font-size:0.9rem;font-weight:600;">Deep Intelligence Report — Nothing to Hide</p>
      <p style="color:#5D4037;font-size:1.1rem;margin-top:2rem;">Prepared for <strong>${name}</strong><br>Born ${dob} at ${tob}<br>${pob}<br><br>☉ ${sun} &nbsp; ☽ ${moon} &nbsp; ↑ ${asc}</p>
    </div>
    ${sectionsHtml.join('\n')}
    <div style="text-align:center;padding:3rem;color:#8D6E63;font-size:0.8rem;border-top:2px solid #D7CCC8;margin-top:2rem;">
      <p style="font-family:Georgia,serif;font-size:1rem;color:#5D4037;margin-bottom:0.5rem;">AyuAstro — Nothing to Hide</p>
      <p>This report was generated for personal reflection. No prediction is absolute. You are the author of your life.</p>
    </div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ayuastro-deep-intelligence-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // ─── Section Card Component ──────────────────────────────────────────────
  const SectionCard = ({ section, index }: { section: ReportSection; index: number }) => {
    const Icon = ICON_MAP[section.icon] || Sparkles;
    const isLocked = section.insightLevel === 'premium' && !hasPaid;
    const isPremium = section.insightLevel === 'premium';
    const isBookmarked = bookmarkedSections[section.id];
    const isExpanded = expandedSections[section.id];
    const colors = SECTION_COLORS[section.id] || SECTION_COLORS['hidden-strengths'];
    const wordCount = section.content.split(/\s+/).length;
    const sectionReadTime = Math.max(1, Math.round(wordCount / 180));

    return (
      <motion.div
        key={section.id}
        variants={fadeInUp}
        transition={{ duration: 0.4 }}
        ref={(el) => { sectionsRef.current[section.id] = el; }}
        id={`section-${section.id}`}
      >
        <Card className={`border-0 shadow-md overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-90' : ''}`}>
          {/* Colored top border */}
          <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

          <CardHeader className="pb-2 pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`flex size-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
                  <Icon className={`size-4 ${colors.iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-brown-900 dark:text-brown-200 flex items-center gap-2">
                    {section.title}
                    {isPremium && (
                      <Badge className="bg-gold/15 text-gold-dark dark:text-gold text-[9px] px-1.5 py-0 border-0 font-bold tracking-wider">
                        PREMIUM
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-[10px] text-brown-400 dark:text-brown-500 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Clock className="size-2.5" /> {sectionReadTime} min</span>
                    <span>·</span>
                    <span>{wordCount} words</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleBookmark(section.id)}
                  className="transition-all hover:scale-110 p-1"
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark section'}
                >
                  <Star
                    className={`size-4 transition-all ${
                      isBookmarked
                        ? 'fill-gold text-gold'
                        : 'text-brown-200 dark:text-brown-600 hover:text-gold/60'
                    }`}
                  />
                </button>
                {isLocked && <Lock className="size-4 text-gold/70" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLocked ? (
              <div className="relative overflow-hidden rounded-lg">
                <div className="blur-[6px] select-none">
                  <p className="text-sm leading-relaxed text-brown-600 dark:text-brown-500">
                    {section.content.substring(0, 200)}...
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/20 via-white/50 to-white/80 dark:from-card/20 dark:via-card/50 dark:to-card/80">
                  <Lock className="size-6 text-gold mb-2" />
                  <p className="text-sm font-semibold text-brown-800 dark:text-brown-300 mb-1">
                    Unlock This Section
                  </p>
                  <p className="text-[10px] text-brown-500 dark:text-brown-400 mb-3 text-center max-w-[200px]">
                    Get the complete truth about {section.title.toLowerCase()}
                  </p>
                  <Button
                    onClick={() => setView('premium')}
                    size="sm"
                    className="bg-gradient-to-r from-gold-dark to-gold text-white hover:from-gold hover:to-gold-dark shadow-md"
                  >
                    <Zap className="mr-1 size-3" />
                    Unlock Full Report
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`text-sm leading-relaxed text-brown-700 dark:text-brown-400 ${!isExpanded && wordCount > 150 ? 'line-clamp-6' : ''}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                />
                {wordCount > 150 && (
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                    className="mt-2 text-xs font-semibold text-gold-dark dark:text-gold hover:text-gold dark:hover:text-gold-light transition-colors flex items-center gap-1"
                  >
                    {isExpanded ? 'Show less ↑' : 'Read full section ↓'}
                  </button>
                )}
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-brown-100/30 dark:border-brown-700/30">
                  {section.traits.map((trait, ti) => (
                    <Badge
                      key={ti}
                      className={`${isPremium ? 'bg-gold/10 text-gold-dark dark:text-gold' : `${colors.badgeBg} ${colors.badgeColor} dark:text-brown-400`} border-0 text-[10px] px-2 py-0.5`}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Zodiac sign data for cosmic identity banner
  const sunSign = astrologyData?.sunSign || '';
  const moonSign = astrologyData?.moonSign || '';
  const ascSign = astrologyData?.ascendant || '';
  const sunElement = ZODIAC_ELEMENTS[sunSign];
  const moonElement = ZODIAC_ELEMENTS[moonSign];
  const ascElement = ZODIAC_ELEMENTS[ascSign];

  return (
    <div className="bg-cream px-4 py-6 pb-24 relative min-h-screen">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-brown-100/30">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #B8960C, #D4AF37, #F0C14B)' }}
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Reading progress circular indicator */}
      <div className="fixed top-16 right-4 z-40 flex flex-col items-center gap-1">
        <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(93,64,55,0.1)" strokeWidth="2.5" />
          <motion.circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 16}`}
            animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - scrollProgress / 100) }}
            transition={{ duration: 0.2 }}
          />
        </svg>
        <span className="text-[9px] font-bold text-gold-dark">{scrollProgress}%</span>
      </div>

      {/* Background texture with zodiac constellation */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #5D4037 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Decorative zodiac constellation background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-32 left-4 text-brown-300/10 dark:text-brown-600/10 text-6xl select-none">✦</div>
        <div className="absolute top-96 right-6 text-gold/8 dark:text-gold/5 text-4xl select-none">⊹</div>
        <div className="absolute bottom-64 left-8 text-brown-300/8 dark:text-brown-600/8 text-5xl select-none">✧</div>
        <div className="absolute top-[600px] right-3 text-gold/6 dark:text-gold/4 text-3xl select-none">⋆</div>
        <div className="absolute bottom-[400px] left-2 text-brown-300/6 dark:text-brown-600/6 text-7xl select-none">✦</div>
      </div>

      <div className="mx-auto max-w-lg space-y-6 relative z-10">
        {/* ═══ Header ═══ */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          {/* AyuAstro Text Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex flex-col items-center">
              <img
                src="/ayuastro-text-logo.svg"
                alt="AyuAstro - Nothing to Hide"
                className="h-12 sm:h-14 w-auto"
              />
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brown-900 dark:text-brown-200 mb-1">
                Deep Intelligence Report
              </h1>
              <p className="text-sm text-brown-400 dark:text-brown-500 flex items-center gap-1">
                <Shield className="size-3" />
                Nothing to Hide · The Complete Truth
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-gold/30 text-gold-dark hover:bg-gold/5 hover:text-gold-dark"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="size-3.5 mr-1" />
                {downloading ? 'Generating...' : 'Download'}
              </Button>
              {downloadError && (
                <p className="text-[10px] text-red-500/80 max-w-[180px] text-right">{downloadError}</p>
              )}
            </div>
          </div>

          {/* ═══ Cosmic Identity Banner ═══ */}
          {(sunSign || moonSign || ascSign) && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-4"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 dark:border-gold/10 shadow-lg">
                {/* Gradient background based on sun sign element */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sunElement?.bgClass || 'from-amber-500/10 to-orange-500/5'} dark:opacity-50`} />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-900/40 via-transparent to-transparent dark:from-brown-900/60" />

                {/* Decorative constellation pattern */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  <span className="absolute top-3 left-4 text-white/10 text-lg">✦</span>
                  <span className="absolute top-8 right-6 text-white/8 text-sm">⋆</span>
                  <span className="absolute bottom-6 left-8 text-white/6 text-xs">⊹</span>
                  <span className="absolute bottom-3 right-4 text-white/10 text-base">✧</span>
                </div>

                <div className="relative z-10 p-4 pb-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-brown-500/80 dark:text-brown-400/80 font-semibold mb-3 text-center">
                    Your Cosmic Identity
                  </p>

                  <div className="flex items-center justify-center gap-3 sm:gap-5">
                    {/* Sun Sign */}
                    <div className="flex flex-col items-center">
                      <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/25 dark:bg-white/10 backdrop-blur-sm border border-gold/20 shadow-inner">
                        <span className="text-2xl sm:text-3xl">{ZODIAC_SYMBOLS[sunSign] || '☉'}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest text-brown-500/70 dark:text-brown-400/70 mt-1.5 font-bold">Sun</span>
                      <span className="text-xs sm:text-sm font-bold text-brown-900 dark:text-brown-200">{sunSign || '—'}</span>
                      {sunElement && (
                        <span className={`text-[8px] font-semibold ${sunElement.color} dark:opacity-80`}>{sunElement.element}</span>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-gold/40 to-gold/20" />
                      <span className="text-[8px] text-gold/60">✦</span>
                      <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-gold/20 to-gold/40" />
                    </div>

                    {/* Moon Sign */}
                    <div className="flex flex-col items-center">
                      <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/25 dark:bg-white/10 backdrop-blur-sm border border-gold/20 shadow-inner">
                        <span className="text-2xl sm:text-3xl">{ZODIAC_SYMBOLS[moonSign] || '☽'}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest text-brown-500/70 dark:text-brown-400/70 mt-1.5 font-bold">Moon</span>
                      <span className="text-xs sm:text-sm font-bold text-brown-900 dark:text-brown-200">{moonSign || '—'}</span>
                      {moonElement && (
                        <span className={`text-[8px] font-semibold ${moonElement.color} dark:opacity-80`}>{moonElement.element}</span>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-gold/40 to-gold/20" />
                      <span className="text-[8px] text-gold/60">✦</span>
                      <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-gold/20 to-gold/40" />
                    </div>

                    {/* Ascendant */}
                    <div className="flex flex-col items-center">
                      <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/25 dark:bg-white/10 backdrop-blur-sm border border-gold/20 shadow-inner">
                        <span className="text-2xl sm:text-3xl">{ZODIAC_SYMBOLS[ascSign] || '↑'}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest text-brown-500/70 dark:text-brown-400/70 mt-1.5 font-bold">Asc</span>
                      <span className="text-xs sm:text-sm font-bold text-brown-900 dark:text-brown-200">{ascSign || '—'}</span>
                      {ascElement && (
                        <span className={`text-[8px] font-semibold ${ascElement.color} dark:opacity-80`}>{ascElement.element}</span>
                      )}
                    </div>
                  </div>

                  {/* Nakshatra & Dasha info */}
                  {(astrologyData?.nakshatra || astrologyData?.currentDasha) && (
                    <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/10">
                      {astrologyData.nakshatra && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] uppercase tracking-wider text-brown-500/60 dark:text-brown-400/60 font-bold">Nakshatra</span>
                          <span className="text-[10px] font-semibold text-brown-800 dark:text-brown-300">{astrologyData.nakshatra}</span>
                        </div>
                      )}
                      {astrologyData.nakshatra && astrologyData.currentDasha && (
                        <span className="text-brown-400/30">·</span>
                      )}
                      {astrologyData.currentDasha && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] uppercase tracking-wider text-brown-500/60 dark:text-brown-400/60 font-bold">Dasha</span>
                          <span className="text-[10px] font-semibold text-brown-800 dark:text-brown-300">{astrologyData.currentDasha}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Language Toggle */}
          <div className="flex items-center gap-1.5 mt-3 p-1 bg-white/50 dark:bg-white/[0.06] rounded-xl border border-brown-100/50 dark:border-brown-100/20">
            <span className="text-[10px] text-brown-400 dark:text-brown-500 ml-1.5 mr-0.5">Language:</span>
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  language === opt.value
                    ? 'bg-gold/15 text-gold-dark dark:text-gold shadow-sm'
                    : 'text-brown-400 dark:text-brown-500 hover:bg-brown-50/50 dark:hover:bg-brown-800/30'
                }`}
                aria-label={`Switch to ${opt.label}`}
              >
                <span className="text-xs">{opt.flag}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className="bg-brown-50 dark:bg-brown-50/20 text-brown-500 dark:text-brown-500 border-0 text-[10px] px-2.5 py-0.5 flex items-center gap-1">
              <Clock className="size-2.5" />
              {readingTime} min read
            </Badge>
            <Badge className="bg-gold/10 text-gold-dark dark:text-gold/15 dark:text-gold border-0 text-[10px] px-2.5 py-0.5 flex items-center gap-1">
              <BookOpen className="size-2.5" />
              {sectionsRead}/{totalSections} read
            </Badge>
            <Badge className="bg-brown-50 dark:bg-brown-50/20 text-brown-500 dark:text-brown-500 border-0 text-[10px] px-2.5 py-0.5">
              {totalWords.toLocaleString()} words
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-brown-100/30 dark:bg-brown-50/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #B8960C, #D4AF37, #F0C14B)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((sectionsRead / totalSections) * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Continue Reading */}
          {continueReadingSection && (
            <button
              onClick={() => scrollToSection(continueReadingSection.id)}
              className="mt-2 text-[11px] font-medium text-gold-dark dark:text-gold hover:text-gold dark:hover:text-gold-light transition-colors flex items-center gap-0.5"
            >
              Continue Reading → {continueReadingSection.title}
            </button>
          )}

          {/* Honest Disclaimer Banner */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/20">
            <div className="flex items-start gap-2">
              <Scale className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Honest Note</p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                  This report is based on interpretation of your birth chart, not absolute truth. Astrology shows tendencies and patterns — not certainties. You are NOT defined by your chart. Free will is real. Take what resonates, leave what doesn't. This is what we think your chart indicates, but please don't rely on it 100%.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Deep Intelligence Report Generation (if not already generated) ═══ */}
        {hasPaid && !hasDeepReport && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-2 border-gold/30 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold/15 shrink-0">
                    <Zap className="size-5 text-gold-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-200">
                      Generate Your Deep Intelligence Report
                    </h3>
                    <p className="text-xs text-brown-500 dark:text-brown-400 mt-1 leading-relaxed">
                      The complete, nothing-to-hide analysis with 15 sections covering your shadow self, love timeline, career truth, family karma, health warnings, life phase roadmap, financial timeline, and spiritual purpose. This takes 1-2 minutes.
                    </p>
                    {deepReportGenerating ? (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Loader2 className="size-4 text-gold animate-spin" />
                          <span className="text-xs font-medium text-brown-600 dark:text-brown-400">
                            {deepReportProgress.sectionTitle}...
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-brown-100/30 dark:bg-brown-700/30 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark"
                            animate={{ width: `${(deepReportProgress.completed / deepReportProgress.total) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-[10px] text-brown-400 mt-1">
                          Section {deepReportProgress.completed} of {deepReportProgress.total}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button
                          onClick={handleGenerateDeepReport}
                          size="sm"
                          className="bg-gradient-to-r from-gold-dark to-gold text-white hover:from-gold hover:to-gold-dark shadow-md"
                        >
                          <Zap className="mr-1.5 size-3.5" />
                          Generate Full Report ({LANGUAGE_OPTIONS.find(l => l.value === language)?.label || 'English'})
                        </Button>
                        <p className="text-[9px] text-brown-400 dark:text-brown-500 mt-1">
                          Change language using the toggle above before generating
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ Table of Contents ═══ */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-sm bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-brown-400 dark:text-brown-500 mb-3 flex items-center gap-1.5">
                <BookOpen className="size-3" />
                Table of Contents
              </h3>
              <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                {allSections.map((section, i) => {
                  const isLocked = section.insightLevel === 'premium' && !hasPaid;
                  const isActive = activeSectionNav === section.id;
                  const isRead = expandedSections[section.id];
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-[11px] ${
                        isActive
                          ? 'bg-gold/15 text-gold-dark dark:text-gold font-semibold'
                          : isRead
                            ? 'bg-brown-50/50 dark:bg-brown-800/30 text-brown-600 dark:text-brown-400'
                            : 'text-brown-400 dark:text-brown-500 hover:bg-brown-50/30 dark:hover:bg-brown-800/20'
                      }`}
                    >
                      <span className={`flex size-4 items-center justify-center rounded-full text-[8px] font-bold shrink-0 ${
                        isRead ? 'bg-gold/20 text-gold-dark' : isActive ? 'bg-gold/15 text-gold-dark' : 'bg-brown-100/50 text-brown-400'
                      }`}>
                        {isRead ? <Check className="size-2.5" /> : i + 1}
                      </span>
                      <span className="truncate flex-1">{section.title}</span>
                      {isLocked && <Lock className="size-2.5 text-gold/50 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Free Sections ═══ */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brown-400 dark:text-brown-500">
              Free Insights
            </h2>
            <div className="flex-1 h-px bg-brown-100/50 dark:bg-brown-700/30" />
            <Badge className="bg-sage/10 text-sage-dark dark:text-sage border-0 text-[9px]">3 sections</Badge>
          </div>
          {freeSections.map((section, i) => (
            <SectionCard key={section.id} section={section} index={i} />
          ))}
        </motion.div>

        {/* ═══ Gold Divider ═══ */}
        <div className="section-divider">
          <span className="text-gold text-lg zodiac-glow">✦</span>
        </div>

        {/* ═══ Premium Sections ═══ */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-dark dark:text-gold">
              Premium — The Whole Truth
            </h2>
            <div className="flex-1 h-px bg-gold/20" />
            <Badge className="bg-gold/15 text-gold-dark dark:text-gold border-0 text-[9px]">{premiumSections.length} sections</Badge>
          </div>
          {premiumSections.map((section, i) => (
            <SectionCard key={section.id} section={section} index={freeSections.length + i} />
          ))}
        </motion.div>

        {/* ═══ Bottom CTA (if not paid) ═══ */}
        {!hasPaid && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
            <Card className="border-2 border-gold/30 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
              <CardContent className="p-5 text-center">
                <Zap className="size-8 text-gold mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-brown-900 dark:text-brown-200">
                  Unlock the Complete Truth
                </h3>
                <p className="text-sm text-brown-500 dark:text-brown-400 mt-2 leading-relaxed">
                  15 premium sections. Your shadow self, love timeline, career truth, family karma,
                  health warnings, life phase roadmap, financial timeline, and spiritual purpose.
                </p>
                <Button
                  onClick={() => setView('premium')}
                  size="lg"
                  className="mt-4 bg-gradient-to-r from-gold-dark to-gold text-white hover:from-gold hover:to-gold-dark shadow-lg"
                >
                  <Zap className="mr-1.5 size-4" />
                  Unlock Full Report
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ Disclaimer ═══ */}
        <div className="text-center px-4 py-6">
          <p className="text-[10px] text-brown-300 dark:text-brown-600 leading-relaxed max-w-sm mx-auto">
            This report is for self-reflection and personal insight. No prediction is absolute — you are the author of your life.
            Astrology reveals tendencies, not destinies. The stars incline; they do not compel.
          </p>
        </div>

        {/* ═══ Back to Top ═══ */}
        {showBackToTop && (
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            size="sm"
            className="fixed bottom-20 right-4 z-40 rounded-full size-10 p-0 bg-brown-700 text-white hover:bg-brown-800 shadow-lg"
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
