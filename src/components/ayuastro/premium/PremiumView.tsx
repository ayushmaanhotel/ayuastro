'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Star, Eye, CheckCircle2, Shield, ArrowRight, Quote } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const benefits = [
  'Comprehensive 14-trait emotional intelligence analysis with depth scoring',
  'Premium sections: Hidden Strengths, Blind Spots, Money Psychology, Life Patterns',
  'Lifetime access to your full profile with periodic cosmic updates',
];

export default function PremiumView() {
  const { setView, setHasPaid, birthDetails } = useAyuAstroStore();

  const handleUnlock = () => {
    // In a real app, this would integrate with a payment gateway
    setHasPaid(true);
    setView('report');
  };

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Hero */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="text-center">
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Unlock Your Deep Emotional Intelligence
          </h1>
          <p className="text-sm text-brown-400 leading-relaxed">
            Gain profound clarity about your emotional patterns, hidden strengths, and the karmic
            cycles shaping your life decisions.
          </p>
        </motion.div>

        {/* Rating */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="size-4 fill-gold text-gold" />
            ))}
          </div>
          <p className="text-sm font-semibold text-brown-900">4.9/5</p>
          <p className="text-xs text-brown-400">Trusted Seeker Rating</p>
        </motion.div>

        {/* Premium Visual Report Card Preview */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="premium-card border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10">
                  <Eye className="size-6 text-gold" />
                </div>
                <div>
                  <h3
                    className="font-serif text-lg font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Premium Visual Report
                  </h3>
                  <p className="text-xs text-brown-400">
                    {birthDetails?.name || 'Your'} Deep Intelligence Analysis
                  </p>
                </div>
              </div>

              {/* Preview sections list */}
              <div className="space-y-2">
                {[
                  'Emotional Personality',
                  'Relationship Style',
                  'Communication Patterns',
                  'Hidden Strengths',
                  'Emotional Blind Spots',
                  'Money Psychology',
                  'Recurring Life Patterns',
                ].map((section, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      i < 3 ? 'bg-sage-muted/50 text-brown-700' : 'bg-gold/5 text-brown-400'
                    }`}
                  >
                    <div
                      className={`size-1.5 rounded-full ${
                        i < 3 ? 'bg-sage-dark' : 'bg-gold'
                      }`}
                    />
                    {section}
                    {i >= 3 && (
                      <Badge className="ml-auto bg-gold/10 text-gold-dark border-0 text-[10px] px-1.5 py-0">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-brown-900 mb-4">What you will unlock</h3>
              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-sage-dark mt-0.5" />
                    <p className="text-sm text-brown-600 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-sm bg-white text-center">
            <CardContent className="p-6">
              <div className="mb-2">
                <span className="text-lg text-brown-300 line-through">₹1,499</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="font-serif text-5xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ₹499
                </span>
              </div>
              <p className="mt-1 text-xs text-brown-400">One-time payment</p>

              <Badge className="mt-3 bg-sage-muted text-sage-dark border-0 text-xs font-medium">
                One-time unlock. Lifetime access.
              </Badge>

              <Separator className="my-5 bg-brown-100" />

              <Button
                onClick={handleUnlock}
                size="lg"
                className="w-full bg-brown-700 py-6 text-base font-medium text-white hover:bg-brown-800"
              >
                Get Full Deep Intelligence Report
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brown-400">
                <Shield className="size-3.5" />
                Secure, encrypted payment.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonial */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <Quote className="size-8 text-brown-100 mb-2" />
              <p className="text-sm leading-relaxed text-brown-600 italic mb-3">
                &ldquo;The premium report revealed patterns I had been living with for decades
                without understanding. The money psychology section alone was worth it — I finally
                see why I keep repeating the same financial cycles.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-brown-50 text-xs font-semibold text-brown-600">
                  A
                </div>
                <div>
                  <p className="text-xs font-medium text-brown-900">Ananya S.</p>
                  <p className="text-[10px] text-brown-400">Verified Seeker</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
