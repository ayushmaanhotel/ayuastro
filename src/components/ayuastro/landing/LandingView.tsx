'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Bot,
  Brain,
  FileText,
  Lock,
  MessageCircle,
  Orbit,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const capabilities = [
  {
    icon: FileText,
    title: 'AI Report Engine',
    body: 'DeepSeek turns your kundali, numerology, dashas, yogas, and traits into structured insight sections.',
  },
  {
    icon: MessageCircle,
    title: 'Astrologer Chats',
    body: 'Each chat carries your chart context so guidance is personal, short, and grounded in your actual placements.',
  },
  {
    icon: Orbit,
    title: 'Swiss Ephemeris Core',
    body: 'Server-side Lahiri ayanamsa and whole-sign calculations keep chart math transparent and auditable.',
  },
];

const trustItems = [
  { label: 'AI provider', value: 'DeepSeek' },
  { label: 'Chart method', value: 'Lahiri Vedic' },
  { label: 'Data stance', value: 'Private by default' },
];

export default function LandingView() {
  const { setView } = useAyuAstroStore();

  return (
    <div className="min-h-screen bg-cream text-brown-900 dark:bg-brown-900 dark:text-cream">
      <section className="relative overflow-hidden border-b border-brown-100/70 dark:border-brown-700/40">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.png"
            alt=""
            className="h-full w-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,245,240,0.92),rgba(248,245,240,1))] dark:bg-[linear-gradient(180deg,rgba(26,20,18,0.90),rgba(26,20,18,1))]" />
        </div>

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="AyuAstro" className="size-10" />
              <div>
                <p className="font-serif text-xl font-bold leading-none">AyuAstro</p>
                <p className="text-xs text-brown-500 dark:text-brown-500">AI-first Vedic intelligence</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('onboarding')}
              className="border-brown-200 bg-white/70 text-brown-700 hover:bg-white dark:border-brown-700 dark:bg-brown-800/70 dark:text-cream"
            >
              Start
            </Button>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <Badge className="mb-5 border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark dark:text-gold">
                DeepSeek powered reports and chats
              </Badge>
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Your chart becomes an AI-guided operating system.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-brown-500 dark:text-brown-500 sm:text-lg">
                Generate a precise cosmic profile, ask astrologer personas direct questions, and turn
                Swiss Ephemeris calculations into practical emotional intelligence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => setView('onboarding')}
                  className="h-12 bg-brown-800 px-6 text-white hover:bg-brown-900 dark:bg-gold dark:text-brown-900 dark:hover:bg-gold-light"
                >
                  Generate My Report
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView('chat')}
                  className="h-12 border-brown-200 bg-white/75 px-6 text-brown-800 hover:bg-white dark:border-brown-700 dark:bg-brown-800/70 dark:text-cream"
                >
                  <Bot className="mr-2 size-4" />
                  Ask AI Astrologer
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div key={item.label} className="border-l border-gold/50 pl-3">
                    <p className="text-xs text-brown-400 dark:text-brown-500">{item.label}</p>
                    <p className="text-sm font-semibold text-brown-800 dark:text-cream">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="border-gold/20 bg-white/86 shadow-xl shadow-brown-900/5 backdrop-blur dark:bg-brown-800/78">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brown-800 dark:text-cream">AI Intelligence Console</p>
                      <p className="text-xs text-brown-400 dark:text-brown-500">Report and chat context pipeline</p>
                    </div>
                    <Sparkles className="size-5 text-gold" />
                  </div>

                  <div className="space-y-3">
                    {capabilities.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="rounded-lg border border-brown-100 bg-cream/70 p-4 dark:border-brown-700/60 dark:bg-brown-900/35"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gold/12 text-gold-dark dark:text-gold">
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-brown-900 dark:text-cream">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-brown-500 dark:text-brown-500">{item.body}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-sage-muted/60 p-4 dark:bg-sage-muted/25">
                      <ShieldCheck className="mb-2 size-4 text-sage-dark" />
                      <p className="text-xs font-semibold text-brown-800 dark:text-cream">Safety Guardrails</p>
                      <p className="mt-1 text-xs text-brown-500 dark:text-brown-500">No fear predictions or medical claims.</p>
                    </div>
                    <div className="rounded-lg bg-brown-50 p-4 dark:bg-brown-700/30">
                      <Lock className="mb-2 size-4 text-gold-dark dark:text-gold" />
                      <p className="text-xs font-semibold text-brown-800 dark:text-cream">Server-side Keys</p>
                      <p className="mt-1 text-xs text-brown-500 dark:text-brown-500">DeepSeek key never ships to clients.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-10">
        {[
          ['1', 'Enter birth details', 'Date, exact time, location, and questionnaire answers form the source data.'],
          ['2', 'Calculate the chart', 'The backend computes sidereal placements, houses, dashas, yogas, and doshas.'],
          ['3', 'Generate insight', 'DeepSeek converts deterministic chart data into report sections and chat guidance.'],
        ].map(([step, title, body]) => (
          <div key={step} className="rounded-lg border border-brown-100 bg-white p-5 dark:border-brown-700/50 dark:bg-brown-800/60">
            <div className="mb-4 flex size-8 items-center justify-center rounded-md bg-brown-800 text-sm font-bold text-white dark:bg-gold dark:text-brown-900">
              {step}
            </div>
            <h2 className="font-serif text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-brown-500 dark:text-brown-500">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
