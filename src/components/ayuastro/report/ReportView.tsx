'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

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

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ReportView() {
  const { reportSections, hasPaid, setView, userId, astrologyData } = useAyuAstroStore();
  const [downloading, setDownloading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.round(progress)));
      setShowBackToTop(scrollTop > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const freeSections = reportSections.filter((s) => s.insightLevel === 'free').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'free')
    : DEFAULT_FREE_SECTIONS;

  const premiumSections = reportSections.filter((s) => s.insightLevel === 'premium').length > 0
    ? reportSections.filter((s) => s.insightLevel === 'premium')
    : DEFAULT_PREMIUM_SECTIONS;

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
        a.download = 'ayuastro-report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        cosmicToast.success('Report downloaded! ✦');
      } else if (res.status === 404) {
        // User not found in database - generate client-side fallback
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

    const allSections = [
      ...freeSections.map((s, i) => `<div style="background:white;border-radius:12px;padding:2rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><h2 style="font-family:Georgia,serif;font-size:1.3rem;color:#3E2723;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #E8F0E9;">${i + 1}. ${s.title}</h2><p style="color:#5D4037;line-height:1.8;">${s.content}</p><div style="margin-top:1rem;display:flex;gap:0.4rem;flex-wrap:wrap;">${s.traits.map(t => `<span style="background:#EFEBE9;color:#5D4037;font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:20px;">${t}</span>`).join('')}</div></div>`),
      ...(hasPaid ? premiumSections.map((s, i) => `<div style="background:white;border-radius:12px;padding:2rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><h2 style="font-family:Georgia,serif;font-size:1.3rem;color:#3E2723;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #E8F0E9;">${freeSections.length + i + 1}. ${s.title} <span style="background:linear-gradient(135deg,#D4AF37,#D4A84B);color:white;font-size:0.6rem;padding:0.15rem 0.5rem;border-radius:4px;letter-spacing:0.1em;vertical-align:middle;margin-left:0.5rem;">PREMIUM</span></h2><p style="color:#5D4037;line-height:1.8;">${s.content}</p><div style="margin-top:1rem;display:flex;gap:0.4rem;flex-wrap:wrap;">${s.traits.map(t => `<span style="background:#D4AF37/10;color:#B8960C;font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:20px;">${t}</span>`).join('')}</div></div>`) : []),
    ];

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AyuAstro Report - ${name}</title><style>body{font-family:Inter,-apple-system,sans-serif;background:#FDF6EC;color:#3E2723;line-height:1.7;max-width:800px;margin:0 auto;padding:2rem;}</style></head><body><div style="text-align:center;padding:4rem 2rem;"><h1 style="font-family:Georgia,serif;font-size:3rem;color:#3E2723;">AyuAstro</h1><p style="color:#8D6E63;letter-spacing:0.15em;text-transform:uppercase;">Deep Intelligence Report</p><p style="color:#5D4037;font-size:1.1rem;margin-top:2rem;">Prepared for <strong>${name}</strong><br>Born ${dob} at ${tob}<br>${pob}<br><br>☉ ${sun} &nbsp; ☽ ${moon} &nbsp; ↑ ${asc}</p></div>${allSections.join('\n')}<div style="text-align:center;padding:3rem;color:#8D6E63;font-size:0.8rem;border-top:2px solid #D7CCC8;margin-top:2rem;"><p style="font-family:Georgia,serif;font-size:1rem;color:#5D4037;margin-bottom:0.5rem;">AyuAstro — AI-Powered Emotional Intelligence</p><p>This report was generated for personal reflection only.</p></div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ayuastro-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-cream px-4 py-6 pb-24 relative">
      {/* Scroll progress bar at top */}
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
        <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(93,64,55,0.1)" strokeWidth="2" />
          <motion.circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 15}`}
            animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - scrollProgress / 100) }}
            transition={{ duration: 0.2 }}
          />
        </svg>
        <span className="text-[9px] font-bold text-gold-dark">{scrollProgress}%</span>
      </div>

      {/* Dot pattern background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #5D4037 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-serif text-3xl font-bold text-brown-900 mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Your Deep Intelligence Report
              </h1>
              <p className="text-sm text-brown-400">
                A comprehensive analysis of your emotional architecture.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-gold/30 text-gold-dark hover:bg-gold/5 hover:text-gold-dark hover:animate-pulse"
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
        </motion.div>

        {/* Free Sections */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brown-400">
            Unlocked Insights
          </h2>
          {freeSections.map((section, i) => {
            const Icon = ICON_MAP[section.icon] || Sparkles;
            return (
              <motion.div
                key={section.id}
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 group hover:border-l-2 hover:border-l-gold transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                      <div className="flex size-7 items-center justify-center rounded-full bg-gold/15 text-gold-dark text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-sage-muted">
                        <Icon className="size-4 text-sage-dark" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-brown-600 dark:text-brown-300 mb-3">
                      {section.content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {section.traits.map((trait, ti) => (
                        <Badge
                          key={ti}
                          className="bg-brown-50 dark:bg-brown-50/20 text-brown-600 dark:text-brown-300 border-0 text-xs"
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
        </motion.div>

        {/* Gold Divider between Free and Premium */}
        <div className="section-divider">
          <span className="text-gold text-lg zodiac-glow">✦</span>
        </div>

        {/* Premium Sections */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Premium Insights
          </h2>
          {premiumSections.map((section, i) => {
            const Icon = ICON_MAP[section.icon] || Sparkles;
            const isLocked = !hasPaid;
            const sectionNum = freeSections.length + i + 1;
            return (
              <motion.div
                key={section.id}
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <Card className={`card-hover border-0 shadow-md bg-white dark:bg-white/5 group hover:border-l-2 hover:border-l-gold transition-all`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                      <div className="flex size-7 items-center justify-center rounded-full bg-gold/15 text-gold-dark text-xs font-bold">
                        {sectionNum}
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
                        <Icon className="size-4 text-gold-dark" />
                      </div>
                      {section.title}
                      {isLocked && <Lock className="ml-auto size-4 text-gold" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLocked ? (
                      <div className="relative overflow-hidden rounded-lg">
                        <div className="blur-[6px] select-none">
                          <p className="text-sm leading-relaxed text-brown-600 mb-3">
                            {section.content}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/20 via-white/50 to-white/80 dark:from-card/20 dark:via-card/50 dark:to-card/80">
                          <Lock className="size-5 text-gold mb-2" />
                          <p className="text-xs font-medium text-brown-700 dark:text-brown-200 mb-2">
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
                        <p className="text-sm leading-relaxed text-brown-600 dark:text-brown-300 mb-3">
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
        </motion.div>

        {/* Back to Top Button */}
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
