'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore, type ReportSection } from '@/store/ayuastro-store';
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
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

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
  'honest-disclaimer': { gradient: 'from-slate-500/10 to-gray-500/5', iconBg: 'bg-slate-500/15', iconColor: 'text-slate-600', badgeBg: 'bg-slate-500/10', badgeColor: 'text-slate-700' },
};

// ─── Default Sections (expanded) ────────────────────────────────────────────
const DEFAULT_FREE_SECTIONS: ReportSection[] = [
  {
    id: 'emotional-personality',
    title: 'Your Emotional Truth',
    icon: 'heart',
    content: 'Let\'s be real — your emotional world isn\'t simple. Your Moon sign shapes how you actually FEEL, not how you present yourself to the world. And those two things? They\'re often very different.\n\nYou feel things at a depth that most people around you don\'t even suspect. You\'ve learned to mask it, to appear calm when you\'re actually drowning inside. This isn\'t weakness — it\'s a superpower that you haven\'t learned to fully wield yet.\n\nThe key insight: your emotional intensity isn\'t something to manage or suppress. It\'s the raw material for your greatest strengths. The question isn\'t "how do I feel less?" — it\'s "how do I channel what I feel into something that serves me?"\n\nWatch for the pattern where you absorb other people\'s emotions and mistake them for your own. This is especially dangerous in relationships — you might think you\'re angry when you\'re actually picking up your partner\'s frustration.',
    traits: ['Emotional Depth', 'Empathy', 'Intuition', 'Inner Conflict'],
    insightLevel: 'free',
  },
  {
    id: 'relationship-style',
    title: 'Your Relationship Reality',
    icon: 'user',
    content: 'Here\'s the truth about how you love: you don\'t do surface-level. You never have. When you connect with someone, you go deep fast — and that scares people who aren\'t ready for it.\n\nYour attachment pattern tells the real story. You crave closeness but you\'ve been burned enough times that you\'ve built walls. The problem? Those walls don\'t just keep out the wrong people — they keep out the right ones too.\n\nWhat you actually need in a partner isn\'t what you think you want. You think you want someone who understands you. What you really need is someone who is WILLING to understand you — because understanding you takes time, patience, and the willingness to sit with your complexity without running away.\n\nThe pattern to break: you tend to choose partners who need saving because it gives you a role to play. But the role of "savior" keeps you from being truly vulnerable, which is what actually creates intimacy.',
    traits: ['Attachment Pattern', 'Trust Issues', 'Deep Connection', 'Vulnerability'],
    insightLevel: 'free',
  },
  {
    id: 'communication-patterns',
    title: 'How You Really Communicate',
    icon: 'message',
    content: 'You say less than you feel. That\'s not a flaw — it\'s a strategy you developed early. The question is: does this strategy still serve you?\n\nWhen you\'re upset, you don\'t explode. You implode. You withdraw, you go quiet, and the other person has no idea what happened. You think you\'re protecting the relationship by not starting a fight. What you\'re actually doing is building resentment that will eventually leak out as passive aggression.\n\nYour communication superpower: when you DO speak, your words carry unusual weight. People remember what you say because you don\'t waste words. Use this. Don\'t save your truth for never — share it at the right moment, with the right person, in the right way.\n\nThe hard truth: your communication style works better in writing than in person. In conversations, you get overwhelmed and shut down. In writing, you can express your full depth. This isn\'t a limitation — it\'s a preference. Own it.',
    traits: ['Selective Expression', 'Written Strength', 'Passive Patterns', 'Deep Listening'],
    insightLevel: 'free',
  },
];

const DEFAULT_PREMIUM_SECTIONS: ReportSection[] = [
  {
    id: 'hidden-strengths',
    title: 'Powers You Don\'t Know You Have',
    icon: 'sparkles',
    content: 'You have strengths you don\'t even recognize because they come so naturally to you that you think everyone has them. They don\'t.\n\nYour hidden power: you can see the root cause of a problem while everyone else is still arguing about the symptoms. This makes you invaluable in crisis — but it also makes you frustrated when others can\'t see what seems obvious to you.\n\nYour creativity isn\'t just artistic — it\'s strategic. You find solutions that other people miss because you approach problems from an angle they didn\'t consider. This is especially powerful in your career.\n\nYour resilience is quiet. You don\'t bounce back with a motivational speech — you process, you adapt, and you emerge different. Stronger, but changed. That\'s a different kind of resilience than the world celebrates, and it\'s actually more durable.',
    traits: ['Root-Cause Thinking', 'Strategic Creativity', 'Quiet Resilience', 'Adaptive Strength'],
    insightLevel: 'premium',
  },
  {
    id: 'emotional-blind-spots',
    title: 'What You Refuse to See',
    icon: 'eye',
    content: 'You have a blind spot around self-worth. You can see everyone else\'s value clearly, but when it comes to your own, you minimize, deflect, or outright deny it. This isn\'t humility — it\'s a pattern that costs you.\n\nThe pattern: you over-give until you\'re empty, then withdraw and wonder why people don\'t appreciate you. But you never actually asked for what you needed in the first place. You expected them to notice. They didn\'t.\n\nYour biggest blind spot: you think being needed is the same as being loved. It\'s not. Being needed keeps you in the role of caregiver. Being loved means someone sees YOU — not what you do for them.\n\nThe hard truth you need to hear: your emotional intelligence, which is your greatest strength, becomes a weapon against yourself when you use it to anticipate everyone\'s needs except your own.',
    traits: ['Self-Worth Gap', 'Over-Giving', 'Need vs Love', 'Emotional Intelligence Trap'],
    insightLevel: 'premium',
  },
  {
    id: 'money-psychology',
    title: 'Your Money Story — The Whole Truth',
    icon: 'wallet',
    content: 'Your relationship with money isn\'t about money. It\'s about security, control, and the story you inherited from your family.\n\nThe truth: you treat money as emotional insurance. When you feel financially secure, you feel emotionally secure. When money is tight, everything feels like it\'s falling apart — even the parts of your life that have nothing to do with money.\n\nYour money pattern: you either save obsessively or spend to self-soothe, and you swing between these extremes based on your emotional state, not your financial reality. This means your bank account is actually a mirror of your mental health.\n\nWhat you don\'t see: you undervalue your own work. You charge less than you\'re worth, accept less than you deserve, and feel guilty asking for more. This isn\'t a money problem — it\'s a self-worth problem wearing a financial disguise.',
    traits: ['Emotional Spending', 'Security Seeking', 'Undervaluing Self', 'Financial Anxiety'],
    insightLevel: 'premium',
  },
  {
    id: 'recurring-life-patterns',
    title: 'Patterns That Keep Repeating',
    icon: 'repeat',
    content: 'The same story keeps playing out in different areas of your life, and you might not even see it. That\'s the nature of karmic patterns — they\'re invisible to the person living them.\n\nYour recurring theme: entering situations where you are undervalued, over time proving your worth, then leaving transformed. This plays out in jobs, relationships, and friendships.\n\nThe deeper pattern: you are drawn to situations that require you to fight for recognition because deep down, you don\'t believe your value is inherent. You think it must be earned, proven, demonstrated — again and again and again.\n\nThe karmic lesson: your soul is trying to teach you that your worth is not negotiable. Every time you accept less than you deserve, you reinforce the pattern. Every time you walk away from something that doesn\'t value you, you break it.',
    traits: ['Recognition Seeking', 'Self-Worth Lessons', 'Karmic Loops', 'Transformation Cycles'],
    insightLevel: 'premium',
  },
  {
    id: 'your-dark-side',
    title: 'Your Shadow Self',
    icon: 'ghost',
    content: 'Everyone has a shadow — the part they don\'t want to admit exists. Yours shows up in specific ways that you probably justify to yourself.\n\nYour shadow: emotional manipulation. Not the cartoon-villain kind — the subtle kind. The kind where you withdraw affection to make someone feel your absence, or where you use your emotional intelligence to steer conversations in the direction you want.\n\nYou don\'t do this maliciously. You do it because you learned early that direct requests got you nothing, so you developed indirect strategies to get your needs met. But these strategies keep you from genuine connection.\n\nYour darker tendency: you can hold a grudge with surgical precision. You remember exactly what someone did, when they did it, and how it made you feel. You may forgive, but you rarely forget — and this memory becomes ammunition in future conflicts.',
    traits: ['Subtle Manipulation', 'Grudge Holding', 'Indirect Strategies', 'Emotional Control'],
    insightLevel: 'premium',
  },
  {
    id: 'love-heartbreak-timeline',
    title: 'Your Love & Heartbreak Timeline',
    icon: 'heartcrack',
    content: 'Love doesn\'t follow a schedule, but your chart does suggest phases where romantic energy is more active and phases where it\'s more about healing.\n\nYour 20s: intense crushes, idealized love, and the painful discovery that feelings alone don\'t sustain a relationship. Heartbreak here teaches you what you actually need vs. what you thought you wanted.\n\nYour 30s: the decade of reckoning. You either commit to the pattern of choosing unavailable partners, or you break it. This is when your dasha periods most likely activate major relationship events.\n\nYour 40s+: if you\'ve done the work, this is where love becomes what you always wanted — deep, real, and sustainable. If you haven\'t done the work, the pattern repeats with higher stakes.\n\nKey timing: your current dasha period is directly influencing your love life right now. Pay attention to who enters and exits during this time.',
    traits: ['Love Phases', 'Heartbreak Lessons', 'Timing Patterns', 'Dasha Influence'],
    insightLevel: 'premium',
  },
  {
    id: 'career-truth',
    title: 'What You\'re Actually Meant to Do',
    icon: 'briefcase',
    content: 'Forget what sounds impressive. Forget what your family expects. Here\'s what your chart says you\'re actually built for.\n\nYou are not meant for one career — you are meant for a mission. That mission involves helping people see what they can\'t see on their own. Whether you do this through counseling, teaching, writing, or strategy, the core function is the same: you are a mirror for others.\n\nThe career trap: you\'ll be tempted by stable, respectable jobs that look good on paper but slowly drain your soul. Your chart warns against choosing security over meaning. The security will never feel like enough, and the meaning will always pull you.\n\nThe honest truth: your career will not be a straight line. It will be a series of pivots, each one bringing you closer to your actual purpose. Don\'t fight the pivots — they\'re the path.',
    traits: ['Mission-Driven', 'Mirror for Others', 'Anti-Corporate', 'Pivoting Path'],
    insightLevel: 'premium',
  },
  {
    id: 'family-karma',
    title: 'What You Inherited From Your Family',
    icon: 'home',
    content: 'You didn\'t just inherit your parents\' genes — you inherited their patterns, their unresolved traumas, and their coping mechanisms.\n\nFather karma: your relationship with authority and self-worth is directly shaped by your father\'s presence (or absence). If he was emotionally unavailable, you may find yourself constantly seeking validation from authority figures who mirror that same distance.\n\nMother karma: your emotional patterns — how you nurture, how you self-soothe, how you handle stress — are mother\'s milk. Even the patterns you\'ve sworn you\'d never repeat show up when you\'re stressed.\n\nFamily wealth pattern: your relationship with money was set before you ever earned your first rupee. If your family struggled, you may carry scarcity mindset even when you\'re doing well. If your family had wealth, you may carry guilt about outearning them.\n\nThe liberation: you are not doomed to repeat these patterns. But you cannot break what you cannot name.',
    traits: ['Father Wound', 'Mother Pattern', 'Wealth Inheritance', 'Generational Cycles'],
    insightLevel: 'premium',
  },
  {
    id: 'health-warnings',
    title: 'What Your Body Is Prone To',
    icon: 'heartpulse',
    content: 'Your chart doesn\'t diagnose — but it does highlight vulnerabilities that are worth paying attention to.\n\nYour constitutional weakness: your digestive system and nervous system are connected. When you\'re stressed, your gut reacts first. This isn\'t psychosomatic — it\'s your body processing what your mind is trying to suppress.\n\nStress pattern: you carry tension in your shoulders and jaw. You may not realize how tightly you\'re holding yourself until someone points it out or until you get a migraine.\n\nThe warning: your tendency to push through discomfort rather than rest will catch up with you. Your body will force you to slow down if you don\'t choose to. Listen to the small signals before they become big ones.\n\nMental health: you are prone to periods of existential anxiety — not the everyday kind, but the deep, "what is the point of all this" kind. This is actually your spiritual nature expressing itself through your nervous system.',
    traits: ['Gut-Brain Connection', 'Stress Tension', 'Forced Rest', 'Existential Anxiety'],
    insightLevel: 'premium',
  },
  {
    id: 'life-phase-roadmap',
    title: 'Your Life Phase Roadmap',
    icon: 'map',
    content: 'Life isn\'t one long story — it\'s chapters. And your chart shows what each chapter is really about.\n\n**Your 20s** — The Experimentation Phase: You try on different identities, careers, and relationships. The mistake isn\'t trying — it\'s thinking you should have it figured out by 25. You won\'t. That\'s the point.\n\n**Your 30s** — The Building Phase: This is where your real work begins. The dasha periods in your 30s are the most defining of your life. Career direction solidifies, relationship patterns crystallize, and you either commit to growth or commit to comfort.\n\n**Your 40s** — The Power Phase: If you\'ve done the inner work, this decade brings the external rewards. Authority, recognition, and the confidence that comes from actually knowing who you are. If you haven\'t done the work, this is when the midlife crisis hits.\n\n**Your 50s+** — The Wisdom Phase: The pressure to prove yourself lifts. What replaces it is either deep peace or deep regret — and that depends entirely on whether you lived authentically or performed for others.',
    traits: ['Decade Themes', 'Dasha Alignment', 'Growth Windows', 'Wisdom Timeline'],
    insightLevel: 'premium',
  },
  {
    id: 'financial-timeline',
    title: 'When Money Flows & When It Doesn\'t',
    icon: 'barchart3',
    content: 'Money follows cycles, and your chart reveals those cycles clearly.\n\n**Early career (20s-early 30s):** Money is tight not because you lack talent, but because you lack direction. You\'re earning, but you\'re also spending on things that don\'t align with your eventual path. This isn\'t waste — it\'s tuition.\n\n**Mid-career (mid 30s-40s):** This is your wealth-building window. The dasha periods here favor financial growth, especially through intellectual property, consulting, or specialized expertise. Don\'t dilute your focus.\n\n**Peak earning (40s-50s):** If you\'ve specialized and built authority, this is when the real money comes. Not from working harder, but from being known for something specific.\n\n**Wealth preservation (60s+):** The danger here isn\'t earning — it\'s overspending on the next generation or on status symbols you don\'t actually care about. Your wealth is best preserved through simplicity and strategic giving.',
    traits: ['Wealth Cycles', 'Career Phases', 'Specialization Value', 'Preservation Strategy'],
    insightLevel: 'premium',
  },
  {
    id: 'spiritual-purpose',
    title: 'Why Your Soul Chose This Life',
    icon: 'flame',
    content: 'This isn\'t about religion. This is about the deepest "why" behind your existence.\n\nYour soul chose this life to master one core lesson: **authenticity under pressure**. You are here to learn who you are when everything external — status, relationships, security — is stripped away. And you will be tested on this. Multiple times.\n\nThe spiritual lesson: you keep attracting situations that force you to choose between what others expect and what your soul knows. Every time you choose the expectations, you feel a deep emptiness that no amount of external success can fill. Every time you choose your truth, you feel alive even if the circumstances are difficult.\n\nYour dharma: to be a guide for others who are going through what you\'ve already survived. Not a guru on a mountain — a real person who has walked through the fire and can say "I know this path. Here\'s where it turns."\n\nThe deepest truth: your suffering is not random. It is curriculum. And the degree to which you understand this directly determines your peace.',
    traits: ['Soul Mission', 'Authenticity Test', 'Guide Dharma', 'Suffering as Curriculum'],
    insightLevel: 'premium',
  },
  {
    id: 'your-deepest-fear',
    title: 'The Fear That Runs Your Life',
    icon: 'shieldalert',
    content: 'You have one fear that drives more of your decisions than you\'d ever admit. It\'s not the obvious stuff — it\'s the deep, structural fear that\'s been running in the background since you were a kid.\n\nYour fear shows up in the patterns you can\'t break. Every time you get close to something real — a relationship, a career opportunity, a moment of genuine happiness — this fear whispers "don\'t trust it" or "it won\'t last" or "you don\'t deserve this." And you listen, because the fear feels like protection when it\'s actually a prison.\n\nThe truth: your fear is protecting you from something that probably won\'t happen. But by protecting you, it\'s also keeping you from the things that WOULD happen if you stopped running.\n\nThis is what "nothing to hide" means. We\'re naming the fear so it stops running the show from the shadows.',
    traits: ['Core Fear', 'Self-Protection', 'Avoidance Strategy', 'Hidden Cost'],
    insightLevel: 'premium',
  },
  {
    id: 'your-friendship-pattern',
    title: 'How You Really Do Friendships',
    icon: 'users',
    content: 'Most astrology skips friendships. But who you are when the romantic stakes are removed? That\'s your real social self.\n\nYour friendship pattern tells a story. You have a type of friend you always attract and a role you always play. Maybe you\'re the therapist friend — everyone comes to you with their problems, but nobody asks how YOU\'RE doing. Maybe you\'re the fun friend — always invited to parties, rarely called when things get real.\n\nThe pattern to notice: your friendships mirror your relationship with yourself. If you don\'t ask for what you need from friends, you probably don\'t ask for it anywhere. If you keep attracting friends in crisis, there\'s something in you that needs to be needed.\n\nYour premium deep intelligence report will analyze your specific friendship archetype and tell you what you really need from your friendships but never ask for.',
    traits: ['Friendship Archetype', 'Trust Circles', 'Conflict Style', 'Unmet Needs'],
    insightLevel: 'premium',
  },
  {
    id: 'your-anger-blueprint',
    title: 'What Happens When You Get Angry',
    icon: 'flame',
    content: 'Anger is the emotion people lie about most. "I\'m not angry, I\'m just disappointed." No — you\'re angry. And that\'s okay.\n\nYour anger has a pattern. It builds in a specific way, explodes (or doesn\'t) in a specific way, and leaves a specific kind of damage. Most people think their anger style is normal because it\'s all they\'ve ever known. It\'s not normal — it\'s YOURS.\n\nThe key insight: your anger is never about what you think it\'s about. The person who cut you off in traffic? You\'re not angry about the traffic. You\'re angry about something deeper — feeling disrespected, feeling powerless, feeling like nobody sees you. Your anger is a messenger, and you\'ve been shooting the messenger your whole life.\n\nYour premium report will decode your specific anger blueprint — what triggers it, what it\'s really about, and how to use it instead of being used by it.',
    traits: ['Anger Style', 'Hidden Triggers', 'Damage Pattern', 'Constructive Channel'],
    insightLevel: 'premium',
  },
  {
    id: 'your-power-years',
    title: 'Your Power Years — When Everything Changes',
    icon: 'zap',
    content: 'Some years change everything. Not gradually — dramatically. Career breakthroughs, major relationships, identity shifts, financial turning points. These are the years where life before and life after look completely different.\n\nYour chart and dasha timeline reveal these power years with remarkable specificity. Saturn returns, Jupiter returns, Rahu-Ketu transits, and dasha changes — each one opens a door that only stays open for a limited time.\n\nThe mistake most people make: they treat power years like regular years. They play safe when they should be bold. They hesitate when they should be decisive. They maintain when they should be transforming.\n\nYour premium report will identify your specific power years with year ranges, what each one is about, and what you should do (and avoid) during these critical windows.',
    traits: ['Power Windows', 'Dasha Transitions', 'Life Milestones', 'Strategic Timing'],
    insightLevel: 'premium',
  },
  {
    id: 'your-decision-pattern',
    title: 'How You Make Decisions (And Why You Regret Half of Them)',
    icon: 'gitbranch',
    content: 'Every decision you\'ve ever made follows a pattern. Not the content — the PROCESS. How you gather info, how long you take, what you prioritize, and what you inevitably regret.\n\nYou have a decision-making operating system. It runs on autopilot for 90% of your choices. And it\'s the source of most of your regret — not because you make bad decisions, but because you make decisions the same WAY every time, even when the situation calls for a different approach.\n\nThe pattern: you probably make relationship decisions with your gut, financial decisions with your fear, and career decisions with other people\'s expectations. None of these are wrong — but they\'re not consistent, and that inconsistency is why you second-guess yourself.\n\nYour premium report will map your specific decision-making pattern, name your regret loop, and give you a calibrated process for making better decisions.',
    traits: ['Decision Style', 'Regret Pattern', 'Analysis Method', 'Optimal Process'],
    insightLevel: 'premium',
  },
  {
    id: 'your-parenting-style',
    title: 'The Parent You Are (Or Will Be)',
    icon: 'baby',
    content: 'Whether you have kids, want kids, or never want them — you parent something. You parent yourself. You parent your friends. You parent your projects. And your parenting pattern follows a specific blueprint.\n\nYour chart reveals your nurturing style — not just how you care for others, but what you BELIEVE care looks like. And that belief comes from how you were cared for, which is encoded in your 4th house and moon sign.\n\nThe honest truth: you will repeat your parents\' patterns unless you consciously choose differently. Not because you want to, but because those patterns are your default settings. Under stress, you revert to what you learned.\n\nYour premium report will name your parenting archetype, your blind spot, and the emotional inheritance you\'re passing on (or about to).',
    traits: ['Nurturing Style', 'Inherited Patterns', 'Parenting Strength', 'Blind Spot'],
    insightLevel: 'premium',
  },
  {
    id: 'honest-disclaimer',
    title: 'An Honest Note Before You Go',
    icon: 'scale',
    content: 'Before you carry all of this with you, there\'s something important to say.\n\nThis report is based on interpretation, not absolute truth. The calculations are mathematical — planetary positions, degrees, houses — but the MEANING is interpretive. Two astrologers could look at the same chart and emphasize completely different things. So take what resonates and leave what doesn\'t.\n\nThis is not 100% accurate. It was never meant to be. Astrology shows tendencies and patterns, not certainties. A trait score of 65 doesn\'t mean you\'re exactly 65% of anything — it means this factor is significant in your personality. The degree is approximate.\n\nYou are NOT defined by your chart. The chart shows the hand you were dealt — not how you play it. Free will is real. Awareness changes everything. Knowing a pattern exists gives you the power to choose differently, and that\'s the whole point.\n\nThe "nothing to hide" philosophy means we told you the hard truths. But hard truths are still interpretations of data, not objective facts about who you are.\n\nYou are more than your chart. You are more than your scores. You are a human being with the capacity to grow, change, and surprise even yourself.',
    traits: ['Disclaimer', 'Free Will', 'Interpretation', 'Self-Determination'],
    insightLevel: 'premium',
  },
];

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

  // Sections logic
  const freeSections = reportSections.filter((s) => s.insightLevel === 'free').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'free')
    : DEFAULT_FREE_SECTIONS;
  const premiumSections = reportSections.filter((s) => s.insightLevel === 'premium').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'premium')
    : DEFAULT_PREMIUM_SECTIONS;
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

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #5D4037 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

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
            <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/15 dark:text-gold border-0 text-[10px] px-2.5 py-0.5 flex items-center gap-1">
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
                  12 premium sections. Your shadow self, love timeline, career truth, family karma,
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
