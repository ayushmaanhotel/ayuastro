'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  User,
  Sun,
  Moon,
  Compass,
  Hash,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  Heart,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ProfileView() {
  const { birthDetails, astrologyData, numerologyData, reset, setView } = useAyuAstroStore();

  const handleReset = () => {
    reset();
    setView('landing');
  };

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Profile Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-brown-700 text-2xl font-semibold text-white">
            {birthDetails?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <h1
            className="font-serif text-2xl font-bold text-brown-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {birthDetails?.name || 'Seeker'}
          </h1>
          <p className="text-sm text-brown-400">Your Cosmic Profile</p>
        </motion.div>

        {/* Birth Details */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <User className="size-5 text-brown-500" />
                Birth Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Date of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.dateOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Time of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.timeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Place of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.placeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                {birthDetails?.relationshipStatus && (
                  <div className="flex items-center gap-3">
                    <Heart className="size-4 text-brown-300" />
                    <div>
                      <p className="text-xs text-brown-400">Relationship Status</p>
                      <p className="text-sm font-medium text-brown-900">
                        {birthDetails.relationshipStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Astrology Summary */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Moon className="size-5 text-gold" />
                Vedic Astrology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Sun className="mx-auto mb-1 size-4 text-gold" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Sun</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.sunSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Moon className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Moon</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.moonSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Compass className="mx-auto mb-1 size-4 text-brown-500" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Ascendant</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.ascendant || '—'}
                  </p>
                </div>
              </div>

              {astrologyData?.nakshatra && (
                <>
                  <Separator className="my-3 bg-brown-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brown-400">Nakshatra</p>
                      <p className="text-sm font-medium text-brown-900">{astrologyData.nakshatra}</p>
                    </div>
                    {astrologyData.currentDasha && (
                      <div className="text-right">
                        <p className="text-xs text-brown-400">Current Dasha</p>
                        <p className="text-sm font-medium text-brown-900">{astrologyData.currentDasha}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {astrologyData?.yogas && astrologyData.yogas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Yogas</p>
                  <div className="flex flex-wrap gap-1">
                    {astrologyData.yogas.map((yoga, i) => (
                      <Badge key={i} className="bg-sage-muted text-sage-dark border-0 text-xs">
                        {yoga}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Numerology Summary */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Hash className="size-5 text-gold" />
                Numerology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brown-50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Life Path</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.lifePathNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Destiny</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.destinyNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Soul Urge</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.soulUrgeNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Personality</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.personalityNumber || '—'}
                  </p>
                </div>
              </div>

              {numerologyData?.lifePathDesc && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Life Path Description</p>
                  <p className="text-sm text-brown-600 leading-relaxed">
                    {numerologyData.lifePathDesc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Over */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-brown-200 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
          >
            <RotateCcw className="mr-2 size-4" />
            Start Over
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
