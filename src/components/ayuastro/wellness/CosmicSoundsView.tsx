'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Timer,
  Sparkles,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SoundChannel {
  id: string;
  name: string;
  emoji: string;
  isPlaying: boolean;
  volume: number; // 0-100
}

interface PresetScene {
  id: string;
  name: string;
  emoji: string;
  volumes: Record<string, number>; // sound id -> volume
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SOUND_CHANNELS: Omit<SoundChannel, 'isPlaying' | 'volume'>[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'fireplace', name: 'Fireplace', emoji: '🔥' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'cosmic', name: 'Cosmic', emoji: '⭐' },
  { id: 'singingBowl', name: 'Singing Bowl', emoji: '🎵' },
  { id: 'crickets', name: 'Night Crickets', emoji: '🦗' },
  { id: 'wind', name: 'Wind', emoji: '💨' },
];

const PRESET_SCENES: PresetScene[] = [
  {
    id: 'deep-meditation',
    name: 'Deep Meditation',
    emoji: '🧘',
    volumes: {
      rain: 0,
      ocean: 0,
      fireplace: 0,
      forest: 0,
      cosmic: 60,
      singingBowl: 80,
      crickets: 0,
      wind: 30,
    },
  },
  {
    id: 'sleep-harmony',
    name: 'Sleep Harmony',
    emoji: '🌙',
    volumes: {
      rain: 70,
      ocean: 50,
      fireplace: 0,
      forest: 0,
      cosmic: 0,
      singingBowl: 0,
      crickets: 40,
      wind: 0,
    },
  },
  {
    id: 'forest-bathing',
    name: 'Forest Bathing',
    emoji: '🌲',
    volumes: {
      rain: 20,
      ocean: 0,
      fireplace: 0,
      forest: 90,
      cosmic: 0,
      singingBowl: 0,
      crickets: 0,
      wind: 30,
    },
  },
  {
    id: 'cosmic-journey',
    name: 'Cosmic Journey',
    emoji: '✨',
    volumes: {
      rain: 0,
      ocean: 0,
      fireplace: 0,
      forest: 0,
      cosmic: 80,
      singingBowl: 50,
      crickets: 0,
      wind: 40,
    },
  },
];

const TIMER_DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '60 min', seconds: 3600 },
];

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ─── Waveform Bars Component ────────────────────────────────────────────────

function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gold/70 dark:bg-gold/60 origin-bottom"
          animate={
            isPlaying
              ? {
                  height: ['20%', '80%', '40%', '95%', '55%', '70%', '30%', '90%', '20%'],
                }
              : { height: '20%' }
          }
          transition={
            isPlaying
              ? {
                  duration: 1.2 + i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  );
}

// ─── Volume Slider Component ────────────────────────────────────────────────

function VolumeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative w-full h-2 flex items-center group">
      {/* Track background */}
      <div className="absolute inset-0 rounded-full bg-brown-100 dark:bg-brown-100/20" />
      {/* Gold filled track */}
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-100"
        style={{ width: `${value}%` }}
      />
      {/* Thumb */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="Volume"
      />
      <div
        className="absolute w-4 h-4 rounded-full bg-brown-700 dark:bg-brown-200 border-2 border-gold shadow-md transition-all duration-100 pointer-events-none"
        style={{ left: `calc(${value}% - 8px)` }}
      />
    </div>
  );
}

// ─── Atmospheric Background ─────────────────────────────────────────────────

function AtmosphericBackground({
  channels,
}: {
  channels: SoundChannel[];
}) {
  const hasRain = channels.find((c) => c.id === 'rain')?.isPlaying;
  const hasCosmic = channels.find((c) => c.id === 'cosmic')?.isPlaying;
  const anyPlaying = channels.some((c) => c.isPlaying);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: anyPlaying
            ? 'linear-gradient(180deg, #1a1410 0%, #2D2320 40%, #1a1410 100%)'
            : 'linear-gradient(180deg, #1a1410 0%, #2D2320 50%, #1a1410 100%)',
        }}
        transition={{ duration: 2 }}
      />

      {/* Ambient glow when sounds are playing */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: anyPlaying ? 0.15 : 0,
        }}
        transition={{ duration: 3 }}
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.3) 0%, rgba(165,214,167,0.1) 40%, transparent 70%)',
        }}
      />

      {/* Rain lines */}
      <AnimatePresence>
        {hasRain && (
          <motion.div
            key="rain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                className="absolute w-[1px] bg-gradient-to-b from-transparent via-blue-300/20 to-transparent"
                style={{
                  left: `${(i / 30) * 100 + Math.random() * 3}%`,
                  height: `${40 + Math.random() * 60}px`,
                  top: `-${60 + Math.random() * 40}px`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star twinkle for cosmic */}
      <AnimatePresence>
        {hasCosmic && (
          <motion.div
            key="cosmic-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute rounded-full bg-gold"
                style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Circular Timer ─────────────────────────────────────────────────────────

function CircularTimer({
  totalSeconds,
  remainingSeconds,
  size = 150,
}: {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(188,170,164,0.15)"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212,175,55,0.8)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-serif text-2xl font-bold text-cream"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] text-brown-300">remaining</span>
      </div>
    </div>
  );
}

// ─── Main CosmicSoundsView ──────────────────────────────────────────────────

export default function CosmicSoundsView() {
  const { setView } = useAyuAstroStore();

  // Sound channels state
  const [channels, setChannels] = useState<SoundChannel[]>(
    SOUND_CHANNELS.map((s) => ({ ...s, isPlaying: false, volume: 0 }))
  );
  const [masterVolume, setMasterVolume] = useState(75);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Timer state
  const [selectedDuration, setSelectedDuration] = useState(600); // 10 min default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [timerComplete, setTimerComplete] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (timerRunning && !timerPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRunning(false);
            setTimerComplete(true);
            setSessionsCompleted((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerPaused]);

  // Channel handlers
  const toggleChannel = useCallback((id: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isPlaying: !c.isPlaying, volume: c.isPlaying ? c.volume : c.volume || 50 }
          : c
      )
    );
    setActivePreset(null);
  }, []);

  const setChannelVolume = useCallback((id: string, volume: number) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, volume, isPlaying: volume > 0 ? true : c.isPlaying } : c))
    );
    setActivePreset(null);
  }, []);

  const playAll = useCallback(() => {
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        isPlaying: c.volume > 0 ? true : true,
        volume: c.volume || 50,
      }))
    );
  }, []);

  const pauseAll = useCallback(() => {
    setChannels((prev) => prev.map((c) => ({ ...c, isPlaying: false })));
  }, []);

  const allPlaying = channels.every((c) => c.isPlaying);
  const anyPlaying = channels.some((c) => c.isPlaying);

  // Preset handler
  const applyPreset = useCallback((preset: PresetScene) => {
    setActivePreset(preset.id);
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        volume: preset.volumes[c.id] ?? 0,
        isPlaying: (preset.volumes[c.id] ?? 0) > 0,
      }))
    );
  }, []);

  // Timer handlers
  const startTimer = () => {
    setTimeRemaining(selectedDuration);
    setTimerRunning(true);
    setTimerPaused(false);
    setTimerComplete(false);
  };

  const pauseTimer = () => {
    setTimerPaused(!timerPaused);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerPaused(false);
    setTimeRemaining(selectedDuration);
    setTimerComplete(false);
  };

  const selectDuration = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
    setTimerRunning(false);
    setTimerPaused(false);
    setTimerComplete(false);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AtmosphericBackground channels={channels} />

      <div className="relative z-10 px-4 py-6 mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('breathing')}
            className="size-10 rounded-full hover:bg-white/10 dark:hover:bg-white/10"
          >
            <ArrowLeft className="size-5 text-cream dark:text-cream" />
          </Button>
          <div>
            <h1
              className="font-serif text-xl font-bold text-cream"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cosmic Sounds
            </h1>
            <p className="text-xs text-brown-300">Ambient soundscapes for meditation</p>
          </div>
          <Badge className="ml-auto bg-gold/15 text-gold border border-gold/20 text-xs">
            <Music className="size-3 mr-1" />
            {channels.filter((c) => c.isPlaying).length} active
          </Badge>
        </motion.div>

        {/* ─── Master Volume & Controls ──────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border border-gold/10 shadow-lg bg-[#2D2320]/90 dark:bg-[#2D2320]/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {masterVolume > 0 ? (
                    <Volume2 className="size-4 text-gold" />
                  ) : (
                    <VolumeX className="size-4 text-brown-400" />
                  )}
                  <span className="text-sm font-medium text-cream">Master Volume</span>
                </div>
                <span className="text-xs text-brown-300">{masterVolume}%</span>
              </div>
              <VolumeSlider
                value={masterVolume}
                onChange={setMasterVolume}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={allPlaying ? pauseAll : playAll}
                  className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/20 text-xs"
                  size="sm"
                >
                  {allPlaying ? (
                    <>
                      <Pause className="size-3.5 mr-1.5" />
                      Pause All
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 mr-1.5" />
                      Play All
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setChannels((prev) =>
                      prev.map((c) => ({ ...c, isPlaying: false, volume: 0 }))
                    );
                    setActivePreset(null);
                  }}
                  variant="outline"
                  className="flex-1 border-brown-100/20 text-brown-300 hover:text-cream hover:bg-white/5 text-xs"
                  size="sm"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Reset All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Preset Scenes ─────────────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border border-gold/10 shadow-lg bg-[#2D2320]/90 dark:bg-[#2D2320]/90 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-cream">
                <Sparkles className="size-4 text-gold" />
                Preset Scenes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SCENES.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyPreset(preset)}
                    className={`relative rounded-xl p-3 border transition-all duration-200 text-left ${
                      activePreset === preset.id
                        ? 'border-gold/40 bg-gold/15 shadow-md shadow-gold/10'
                        : 'border-brown-100/10 bg-white/5 hover:bg-white/10 hover:border-gold/20'
                    }`}
                  >
                    {activePreset === preset.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold animate-pulse" />
                    )}
                    <span className="text-lg">{preset.emoji}</span>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        activePreset === preset.id
                          ? 'text-gold'
                          : 'text-cream'
                      }`}
                    >
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-brown-400 mt-0.5">
                      {Object.values(preset.volumes).filter((v) => v > 0).length} sounds
                    </p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Sound Mixer Channels ──────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border border-gold/10 shadow-lg bg-[#2D2320]/90 dark:bg-[#2D2320]/90 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-cream">
                <Music className="size-4 text-gold" />
                Sound Mixer
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {channels.map((channel, index) => {
                const effectiveVolume = Math.round(
                  (channel.volume * masterVolume) / 100
                );
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`rounded-xl p-3 border transition-all duration-300 ${
                      channel.isPlaying
                        ? 'border-gold/20 bg-gold/5 shadow-sm'
                        : 'border-brown-100/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Emoji icon */}
                      <div
                        className={`flex items-center justify-center size-10 rounded-lg text-xl ${
                          channel.isPlaying
                            ? 'bg-gold/10'
                            : 'bg-white/5'
                        }`}
                      >
                        {channel.emoji}
                      </div>

                      {/* Name + waveform */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-xs font-semibold ${
                              channel.isPlaying
                                ? 'text-gold'
                                : 'text-brown-300'
                            }`}
                          >
                            {channel.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <WaveformBars isPlaying={channel.isPlaying} />
                            <span className="text-[10px] text-brown-400 w-7 text-right">
                              {effectiveVolume}%
                            </span>
                          </div>
                        </div>
                        <VolumeSlider
                          value={channel.volume}
                          onChange={(v) => setChannelVolume(channel.id, v)}
                        />
                      </div>

                      {/* Play/Pause toggle */}
                      <button
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex items-center justify-center size-8 rounded-full border transition-all duration-200 flex-shrink-0 ${
                          channel.isPlaying
                            ? 'border-gold/30 bg-gold/15 text-gold hover:bg-gold/25'
                            : 'border-brown-100/20 bg-white/5 text-brown-400 hover:text-cream hover:border-gold/20'
                        }`}
                        aria-label={channel.isPlaying ? 'Pause' : 'Play'}
                      >
                        {channel.isPlaying ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Session Timer ─────────────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border border-gold/10 shadow-lg bg-[#2D2320]/90 dark:bg-[#2D2320]/90 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-cream">
                  <Timer className="size-4 text-gold" />
                  Session Timer
                </CardTitle>
                <Badge className="bg-gold/10 text-gold border-0 text-[10px]">
                  {sessionsCompleted} completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Duration selector */}
              <div className="flex gap-1.5 mb-5">
                {TIMER_DURATIONS.map((d) => (
                  <button
                    key={d.seconds}
                    onClick={() => selectDuration(d.seconds)}
                    disabled={timerRunning}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                      selectedDuration === d.seconds && !timerRunning
                        ? 'bg-gold/15 text-gold border border-gold/30'
                        : timerRunning
                        ? 'bg-white/5 text-brown-500 border border-transparent cursor-not-allowed'
                        : 'bg-white/5 text-brown-300 border border-transparent hover:border-gold/20 hover:text-cream'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Circular timer display */}
              <div className="flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {timerComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center py-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl mb-3"
                      >
                        ✦
                      </motion.div>
                      <p
                        className="font-serif text-lg font-semibold text-gold"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        Session Complete ✦
                      </p>
                      <p className="text-xs text-brown-300 mt-1">
                        Your soundscape journey has ended
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CircularTimer
                        totalSeconds={selectedDuration}
                        remainingSeconds={timeRemaining}
                        size={150}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timer controls */}
                <div className="flex items-center gap-3 mt-4">
                  {!timerRunning && !timerComplete && (
                    <Button
                      onClick={startTimer}
                      className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/20 text-xs px-6"
                      size="sm"
                    >
                      <Play className="size-3.5 mr-1.5" />
                      Start
                    </Button>
                  )}
                  {timerRunning && (
                    <>
                      <Button
                        onClick={pauseTimer}
                        className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/20 text-xs"
                        size="sm"
                      >
                        {timerPaused ? (
                          <>
                            <Play className="size-3.5 mr-1.5" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="size-3.5 mr-1.5" />
                            Pause
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        variant="outline"
                        className="border-brown-100/20 text-brown-300 hover:text-cream hover:bg-white/5 text-xs"
                        size="sm"
                      >
                        <RotateCcw className="size-3.5 mr-1.5" />
                        Reset
                      </Button>
                    </>
                  )}
                  {timerComplete && (
                    <Button
                      onClick={() => {
                        setTimeRemaining(selectedDuration);
                        setTimerComplete(false);
                      }}
                      className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/20 text-xs"
                      size="sm"
                    >
                      <RotateCcw className="size-3.5 mr-1.5" />
                      New Session
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom spacing for atmospheric immersion */}
        <div className="h-4" />
      </div>
    </div>
  );
}
