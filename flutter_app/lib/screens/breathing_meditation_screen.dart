import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

// ─── Data Models ─────────────────────────────────────────────────────────────
class BreathingPhase {
  final String phase; // 'inhale', 'hold', 'exhale', 'holdAfterExhale'
  final int duration; // milliseconds
  final String label;

  const BreathingPhase({
    required this.phase,
    required this.duration,
    required this.label,
  });
}

class BreathingTechnique {
  final String id;
  final String name;
  final String subtitle;
  final String emoji;
  final List<BreathingPhase> phases;
  final String description;
  final Color color;

  const BreathingTechnique({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.emoji,
    required this.phases,
    required this.description,
    required this.color,
  });
}

class MeditationCardData {
  final String id;
  final String name;
  final String emoji;
  final int duration; // minutes
  final String durationLabel;
  final String description;
  final IconData icon;
  final List<Color> gradient;

  const MeditationCardData({
    required this.id,
    required this.name,
    required this.emoji,
    required this.duration,
    required this.durationLabel,
    required this.description,
    required this.icon,
    required this.gradient,
  });
}

// ─── Breathing Techniques ───────────────────────────────────────────────────
final List<BreathingTechnique> _techniques = [
  const BreathingTechnique(
    id: 'cosmic-calm',
    name: 'Cosmic Calm',
    subtitle: '4-7-8 Breathing',
    emoji: '🌌',
    phases: [
      BreathingPhase(phase: 'inhale', duration: 4000, label: 'Breathe In'),
      BreathingPhase(phase: 'hold', duration: 7000, label: 'Hold'),
      BreathingPhase(phase: 'exhale', duration: 8000, label: 'Breathe Out'),
    ],
    description: 'Release anxiety and find deep calm',
    color: AppColors.gold,
  ),
  const BreathingTechnique(
    id: 'moon-rhythm',
    name: 'Moon Rhythm',
    subtitle: 'Box Breathing',
    emoji: '🌙',
    phases: [
      BreathingPhase(phase: 'inhale', duration: 4000, label: 'Breathe In'),
      BreathingPhase(phase: 'hold', duration: 4000, label: 'Hold'),
      BreathingPhase(phase: 'exhale', duration: 4000, label: 'Breathe Out'),
      BreathingPhase(phase: 'holdAfterExhale', duration: 4000, label: 'Hold'),
    ],
    description: 'Sharpen focus and clarity',
    color: AppColors.sage,
  ),
  const BreathingTechnique(
    id: 'solar-breath',
    name: 'Solar Breath',
    subtitle: '6-2-6 Breathing',
    emoji: '☀️',
    phases: [
      BreathingPhase(phase: 'inhale', duration: 6000, label: 'Breathe In'),
      BreathingPhase(phase: 'hold', duration: 2000, label: 'Hold'),
      BreathingPhase(phase: 'exhale', duration: 6000, label: 'Breathe Out'),
    ],
    description: 'Restore emotional balance',
    color: AppColors.gold,
  ),
];

// ─── Meditation Cards ───────────────────────────────────────────────────────
final List<MeditationCardData> _meditationCards = [
  const MeditationCardData(
    id: 'morning-intention',
    name: 'Morning Intention',
    emoji: '🌅',
    duration: 2,
    durationLabel: '2 min',
    description: 'Set your daily cosmic intention and align with your inner purpose',
    icon: LucideIcons.sun,
    gradient: [Color(0x30D4AF37), Color(0x10D4AF37)],
  ),
  const MeditationCardData(
    id: 'emotional-release',
    name: 'Emotional Release',
    emoji: '🕊️',
    duration: 3,
    durationLabel: '3 min',
    description: 'Let go of trapped emotions and create space for healing',
    icon: LucideIcons.heart,
    gradient: [Color(0x30A5D6A7), Color(0x10A5D6A7)],
  ),
  const MeditationCardData(
    id: 'gratitude-flow',
    name: 'Gratitude Flow',
    emoji: '🙏',
    duration: 2,
    durationLabel: '2 min',
    description: 'Cultivate deep appreciation for the blessings in your life',
    icon: LucideIcons.sparkles,
    gradient: [Color(0x30D4AF37), Color(0x10A5D6A7)],
  ),
  const MeditationCardData(
    id: 'sleep-harmony',
    name: 'Sleep Harmony',
    emoji: '🌙',
    duration: 5,
    durationLabel: '5 min',
    description: 'Gentle pre-sleep relaxation to ease into restful slumber',
    icon: LucideIcons.bed_double,
    gradient: [Color(0x30A1887F), Color(0x10A5D6A7)],
  ),
];

// ─── Daily Mindfulness Prompts (144 total: 12 per zodiac sign) ─────────────
const List<String> _zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const Map<String, List<String>> _mindfulnessPrompts = {
  'Aries': [
    'Pause before reacting today — your fire is powerful, but a steady flame warms more than a wildfire.',
    'Practice patience with one conversation today. Let the other person finish before you ignite.',
    'Channel your warrior spirit inward — what inner battle needs your courage today?',
    'Before charging forward, take three slow breaths. Direction matters more than speed.',
    'Your enthusiasm is contagious, but today practice receiving instead of initiating.',
    'Sit with stillness for 2 minutes. Notice how your body feels when you stop moving.',
    'Choose one impulsive habit today and replace it with a mindful pause.',
    'Your strength is in starting things — today, find beauty in finishing something.',
    'When frustration rises, breathe into it. Let the heat transform into purpose.',
    'Practice gentle persistence over forceful action in one area today.',
    'Notice the space between your impulse and your action — that\'s where your power lives.',
    'Let someone else take the lead today. Observe what you discover from following.',
  ],
  'Taurus': [
    'Release one attachment today — the earth flourishes when it lets go of what it no longer needs.',
    'Try something unfamiliar today. Your comfort zone is beautiful, but growth lives just beyond it.',
    'Notice the textures around you — your senses are a gateway to presence.',
    'Practice flexibility in one fixed opinion. What opens when you soften your stance?',
    'Your stability is a gift — today, share it by being a grounding presence for someone.',
    'Move your body in a new way today. Let your physical form surprise you.',
    'When you feel stubbornness rising, ask: "Is this protecting me or limiting me?"',
    'Savor one meal today with complete attention — taste, texture, aroma, gratitude.',
    'Let beauty be your meditation. Spend 3 minutes truly seeing something beautiful.',
    'Practice letting someone change your mind today — it\'s a sign of strength, not weakness.',
    'Ground yourself by walking barefoot or touching the earth. Feel the exchange of energy.',
    'Release the need for certainty in one small area. See what freedom emerges.',
  ],
  'Gemini': [
    'Silence your inner commentator for 5 minutes — let yourself simply exist without narration.',
    'Practice deep listening today. Hear not just words, but the feelings beneath them.',
    'Choose one thought stream and follow it to its depth rather than its breadth.',
    'Write down three thoughts, then release them. You are not your thoughts.',
    'Your mind is a kaleidoscope — today, focus on one pattern and see its full beauty.',
    'Have a conversation where you listen twice as much as you speak.',
    'When your mind races, anchor to your breath. It\'s always here, always now.',
    'Read one paragraph with complete attention. No skimming, no jumping ahead.',
    'Practice presence in transition moments — walking, waiting, moving between spaces.',
    'Choose curiosity over judgment in one interaction today.',
    'Let one idea fully form before sharing it. See what depth emerges in patience.',
    'Today, notice when you\'re performing and when you\'re being. Choose being.',
  ],
  'Cancer': [
    'Place boundaries with love today — protecting your energy is not rejecting others.',
    'Observe your emotions as waves — you are the ocean, not any single swell.',
    'Nurture yourself the way you nurture others. You deserve your own tenderness.',
    'When nostalgia calls, thank it for the memory, then return to this moment.',
    'Your sensitivity is a superpower — today, use it to sense your own needs first.',
    'Practice releasing one old emotional pattern that no longer serves you.',
    'Create a safe space within yourself through 5 minutes of self-compassion.',
    'Let someone support you today. Receiving is an act of trust, not weakness.',
    'When you feel the urge to withdraw, reach out instead — just one small connection.',
    'Honor your need for home, but find home within yourself first.',
    'Practice sitting with uncomfortable emotions without trying to fix them.',
    'Forgive yourself for one thing you\'ve been carrying. Set it down gently.',
  ],
  'Leo': [
    'Let your light shine inward today — illuminate the quiet corners of your own heart.',
    'Practice being seen without performing. Your essence is enough.',
    'Share the stage today — someone else\'s light doesn\'t dim your own.',
    'Find validation from within. Write down three things you genuinely appreciate about yourself.',
    'Your warmth is healing — direct it toward yourself first today.',
    'Create something just for you, not for applause or recognition.',
    'When the need for attention arises, give yourself the attention you seek.',
    'Practice humility in one small act. What opens when you step back?',
    'Lead with vulnerability today. It takes more courage than confidence.',
    'Notice when you\'re seeking external approval and gently return to self-approval.',
    'Your generosity is legendary — today, be generous with your own self-talk.',
    'Sit in the background and observe. Find the beauty in not being the center.',
  ],
  'Virgo': [
    'Release perfection in one task today — done is more beautiful than perfect.',
    'Your body knows things your mind hasn\'t articulated — listen to its quiet signals.',
    'Practice being messy, imperfect, and human. It\'s where the magic lives.',
    'Replace one criticism with one compliment — especially toward yourself.',
    'Your analytical mind is a gift — today, let it rest and lead from your heart instead.',
    'Do one thing today purely for joy, with no productive outcome in mind.',
    'When you catch yourself overthinking, drop into your body. Feel your feet on the ground.',
    'Practice accepting help without immediately trying to improve upon it.',
    'Let one thing remain unfinished today. Notice the world continues to turn.',
    'Your service to others is beautiful — serve yourself with the same devotion today.',
    'Replace "I should" with "I choose" in three instances today.',
    'Find the sacred in the imperfect. A cracked bowl holds flowers beautifully.',
  ],
  'Libra': [
    'Practice choosing without weighing every option — trust your first instinct today.',
    'Your need for harmony is noble — but disharmony within yourself needs attention first.',
    'Spend time alone today and discover what balance feels like when it\'s just you.',
    'Make one decision quickly, without consulting anyone. Trust your inner scale.',
    'Your aesthetic sense is refined — today, make your inner world as beautiful as your outer one.',
    'When you feel torn between two choices, pause and feel which one makes your body relax.',
    'Practice saying "no" with grace. Your "yes" becomes more meaningful.',
    'Notice when you\'re accommodating others at the expense of your truth.',
    'Create beauty in an unexpected place today — a small act of aesthetic kindness.',
    'Balance giving and receiving in one relationship today with conscious awareness.',
    'Your diplomacy is a gift — today, mediate the conflicting voices within yourself.',
    'Choose authenticity over pleasantness in one conversation today.',
  ],
  'Scorpio': [
    'Practice vulnerability today — your deepest power lies in letting yourself be seen.',
    'Release one thing you\'ve been holding onto tightly. Transformation requires release.',
    'Your intensity is magnetic — today, direct it toward self-discovery rather than control.',
    'Let go of one secret you\'ve been carrying. Freedom lives on the other side of truth.',
    'When you feel the urge to probe deeper, turn that investigation inward with compassion.',
    'Practice trust in one small way today. Let someone show up for you.',
    'Your ability to see beneath surfaces is rare — today, see beneath your own.',
    'Surrender one need for control. Notice what rushes in to fill the space.',
    'Transform pain into purpose today — but first, let yourself simply feel it.',
    'Practice being light. Not everything needs to carry the weight of profundity.',
    'Your emotional depth is a well — today, draw from it to nourish, not to drown.',
    'Forgive one betrayal, past or present. Do it for your freedom, not theirs.',
  ],
  'Sagittarius': [
    'Stillness is not confinement — it\'s the space where wisdom takes root.',
    'Practice depth over breadth today. One conversation, fully present, can change everything.',
    'Your optimism is a gift — today, direct it toward the parts of yourself that doubt.',
    'Instead of seeking the next adventure, find the adventure in this exact moment.',
    'Commit to one thing today without an escape plan. See it through with your whole heart.',
    'Your freedom-seeking nature is beautiful — but some commitments amplify freedom rather than limit it.',
    'Practice presence in the mundane. The sacred hides in ordinary moments.',
    'When you feel restless, sit with it instead of running. What is the restlessness trying to teach?',
    'Share one profound insight today, but only after living it first.',
    'Ground your vision in one practical step today. The journey needs both the map and the first step.',
    'Explore the inner landscape today — it\'s as vast and wondrous as any external frontier.',
    'Find meaning in what\'s already here rather than what\'s over the next horizon.',
  ],
  'Capricorn': [
    'Rest is not the opposite of achievement — it\'s the foundation of it.',
    'Practice receiving without earning. You are worthy simply because you exist.',
    'Your ambition is admirable — today, let it be guided by joy rather than obligation.',
    'Ask for help with one thing today. It\'s a sign of wisdom, not weakness.',
    'Replace "I must" with "I choose" in three instances today. Reclaim your agency.',
    'Celebrate one small win with the same enthusiasm as a major milestone.',
    'Your discipline is legendary — today, be disciplined about play and rest.',
    'When you feel the weight of responsibility, set it down for 5 minutes. The world will wait.',
    'Practice vulnerability with one person today. Let them see the person behind the achievements.',
    'Find beauty in the journey rather than fixating on the summit.',
    'Your wisdom comes from lived experience — today, share it without needing to be right.',
    'Let one thing be "good enough." Perfection is a heavy crown to wear every day.',
  ],
  'Aquarius': [
    'Connect with one person deeply today — your revolution starts with one authentic bond.',
    'Your vision for the future is beautiful — but today, be fully present in this moment.',
    'Practice sitting with your emotions instead of analyzing them. Feel, don\'t think.',
    'Your individuality is your superpower — today, celebrate someone else\'s uniqueness too.',
    'Replace detachment with compassionate engagement in one interaction today.',
    'Ground your ideas in one tangible action. A vision without action is just a dream.',
    'When you feel disconnected, touch your heart. You belong here, right now.',
    'Your mind reaches for the stars — today, let your heart lead the way.',
    'Practice being part of a group without needing to be different. Belonging is healing.',
    'Share one unconventional idea, but listen with equal passion to others\' perspectives.',
    'Your humanitarian spirit is noble — start with one act of kindness toward yourself.',
    'Embrace the messiness of human emotion. It\'s the soil where innovation grows.',
  ],
  'Pisces': [
    'Anchor yourself in the present moment — your dreams are beautiful, but your feet belong on earth.',
    'Practice discernment today — not every emotion is yours to carry.',
    'Your compassion is boundless — today, direct that ocean of care toward yourself.',
    'Create one boundary with love. Protecting your energy serves everyone.',
    'When you feel lost in the fog, return to your body. It\'s your most honest compass.',
    'Channel your imagination into one concrete creation today. Give form to your vision.',
    'Practice saying what you mean with clarity. Your truth deserves precise words.',
    'Release one fantasy that\'s keeping you from seeing reality\'s beauty.',
    'Your sensitivity connects you to everything — today, choose what you connect with consciously.',
    'Spend time near water and let it wash away what no longer serves you.',
    'Ground your spiritual insights in daily practice. One small ritual can anchor the cosmos.',
    'Honor both your dreamer and your doer. They need each other to create magic.',
  ],
};

String _getDailyMindfulnessPrompt(String sunSign) {
  final now = DateTime.now();
  final dayOfYear = now.difference(DateTime(now.year, 1, 0)).inDays;
  final signIndex = _zodiacSigns.indexOf(sunSign);
  final activeIndex = signIndex >= 0 ? signIndex : 0;
  final promptIndex = (dayOfYear + activeIndex) % 12;
  final prompts = _mindfulnessPrompts[sunSign] ?? _mindfulnessPrompts['Aries']!;
  return prompts[promptIndex];
}

// ─── Main Screen Widget ──────────────────────────────────────────────────────
class BreathingMeditationScreen extends StatefulWidget {
  const BreathingMeditationScreen({super.key});

  @override
  State<BreathingMeditationScreen> createState() => _BreathingMeditationScreenState();
}

class _BreathingMeditationScreenState extends State<BreathingMeditationScreen> with TickerProviderStateMixin {
  int _selectedTechniqueIndex = 0;
  bool _isPlaying = false;
  int _currentPhaseIndex = 0;
  double _phaseProgress = 0.0;
  int _cyclesCompleted = 0;
  
  Timer? _tickTimer;
  int _phaseStartTime = 0;

  MeditationCardData? _activeMeditation;
  bool _practicedToday = false;

  @override
  void dispose() {
    _stopTicks();
    super.dispose();
  }

  void _startTicks() {
    _stopTicks();
    _phaseStartTime = DateTime.now().millisecondsSinceEpoch;
    _tickTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!mounted) return;
      final technique = _techniques[_selectedTechniqueIndex];
      final currentPhase = technique.phases[_currentPhaseIndex];
      final now = DateTime.now().millisecondsSinceEpoch;
      final elapsed = now - _phaseStartTime;
      
      setState(() {
        _phaseProgress = (elapsed / currentPhase.duration).clamp(0.0, 1.0);
      });

      if (elapsed >= currentPhase.duration) {
        _phaseStartTime = DateTime.now().millisecondsSinceEpoch;
        setState(() {
          _phaseProgress = 0.0;
          if (_currentPhaseIndex + 1 >= technique.phases.length) {
            _currentPhaseIndex = 0;
            _cyclesCompleted++;
          } else {
            _currentPhaseIndex++;
          }
        });
      }
    });
  }

  void _stopTicks() {
    _tickTimer?.cancel();
    _tickTimer = null;
  }

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _startTicks();
      } else {
        _stopTicks();
      }
    });
  }

  void _resetBreathing() {
    _stopTicks();
    setState(() {
      _isPlaying = false;
      _currentPhaseIndex = 0;
      _phaseProgress = 0.0;
      _cyclesCompleted = 0;
    });
  }

  double _getCircleScale() {
    if (!_isPlaying) return 1.0;
    final technique = _techniques[_selectedTechniqueIndex];
    final currentPhase = technique.phases[_currentPhaseIndex];
    
    switch (currentPhase.phase) {
      case 'inhale':
        return 1.0 + _phaseProgress * 0.35;
      case 'hold':
        return 1.35;
      case 'exhale':
        return 1.35 - _phaseProgress * 0.35;
      case 'holdAfterExhale':
      default:
        return 1.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final sunSign = state.astrologyData?.sunSign ?? 'Aries';
    final dailyPrompt = _getDailyMindfulnessPrompt(sunSign);
    final activeTechnique = _techniques[_selectedTechniqueIndex];
    final currentPhase = activeTechnique.phases[_currentPhaseIndex];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_activeMeditation != null) {
          setState(() {
            _activeMeditation = null;
          });
          return;
        }
        state.setView('insights');
      },
      child: Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: Stack(
          children: [
            // ─── Scrollable Content ───
            SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
                          onPressed: () => state.setView('insights'),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Breathing & Meditation',
                              style: TextStyle(
                                fontFamily: 'Playfair Display',
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : AppColors.brown900,
                              ),
                            ),
                            Text(
                              'Find your cosmic calm',
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? Colors.white38 : AppColors.brown400,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // ─── Section 1: Breathing Exercise ───
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkCard : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(LucideIcons.wind, color: AppColors.gold, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Breathing Exercise',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.goldDark,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Technique Selector Row
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: List.generate(_techniques.length, (index) {
                                final tech = _techniques[index];
                                final isSelected = index == _selectedTechniqueIndex;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: GestureDetector(
                                    onTap: () {
                                      if (_isPlaying) _togglePlay();
                                      setState(() {
                                        _selectedTechniqueIndex = index;
                                        _currentPhaseIndex = 0;
                                        _phaseProgress = 0.0;
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppColors.gold.withValues(alpha: 0.12)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: isSelected
                                              ? AppColors.gold.withValues(alpha: 0.4)
                                              : (isDark ? Colors.white12 : AppColors.brown100),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Text(tech.emoji, style: const TextStyle(fontSize: 18)),
                                          const SizedBox(width: 8),
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                tech.name,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: isSelected
                                                      ? AppColors.goldDark
                                                      : (isDark ? Colors.white70 : AppColors.brown700),
                                                ),
                                              ),
                                              Text(
                                                tech.subtitle,
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  color: isDark ? Colors.white38 : AppColors.brown400,
                                                ),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Description
                          Text(
                            activeTechnique.description,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? Colors.white54 : AppColors.brown700,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Breathing Orb Canvas
                          Center(
                            child: SizedBox(
                              width: 280,
                              height: 280,
                              child: CustomPaint(
                                painter: _BreathingCirclePainter(
                                  progress: _phaseProgress,
                                  scale: _getCircleScale(),
                                  isPlaying: _isPlaying,
                                  phaseLabel: _isPlaying ? currentPhase.label : 'Ready',
                                  secondsRemaining: _isPlaying
                                      ? (((1.0 - _phaseProgress) * currentPhase.duration) / 1000).ceil()
                                      : 0,
                                  emoji: activeTechnique.emoji,
                                  color: activeTechnique.color,
                                  isDark: isDark,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Round indicator
                          Center(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(LucideIcons.clock, size: 12, color: AppColors.gold),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Round ${_cyclesCompleted + (_isPlaying ? 1 : 0)}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.goldDark,
                                    ),
                                  )
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Play/Reset controls
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                icon: Icon(LucideIcons.rotate_ccw, color: isDark ? Colors.white70 : AppColors.brown500),
                                onPressed: _resetBreathing,
                                tooltip: 'Reset',
                              ),
                              const SizedBox(width: 16),
                              GestureDetector(
                                onTap: _togglePlay,
                                child: Container(
                                  width: 60,
                                  height: 60,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppColors.gold,
                                  ),
                                  child: Icon(
                                    _isPlaying ? LucideIcons.pause : LucideIcons.play,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 76), // Spacer offset to keep align centered
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Section 2: Quick Meditations ───
                    Text(
                      'Quick Meditations',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.brown900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _meditationCards.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 1.15,
                      ),
                      itemBuilder: (context, idx) {
                        final card = _meditationCards[idx];
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _activeMeditation = card;
                            });
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: card.gradient,
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isDark ? Colors.white10 : AppColors.brown100.withValues(alpha: 0.5),
                              ),
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(card.emoji, style: const TextStyle(fontSize: 22)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.gold.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(LucideIcons.clock, size: 8, color: AppColors.gold),
                                          const SizedBox(width: 2),
                                          Text(
                                            card.durationLabel,
                                            style: const TextStyle(
                                              fontSize: 8,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.goldDark,
                                            ),
                                          )
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                Text(
                                  card.name,
                                  style: TextStyle(
                                    fontFamily: 'Playfair Display',
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : AppColors.brown900,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  card.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 9,
                                    height: 1.2,
                                    color: isDark ? Colors.white38 : AppColors.brown500,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: const [
                                    Icon(LucideIcons.play, size: 10, color: AppColors.gold),
                                    SizedBox(width: 4),
                                    Text(
                                      'Start',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.gold,
                                      ),
                                    )
                                  ],
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),

                    // ─── Section 3: Cosmic Sounds entry ───
                    GestureDetector(
                      onTap: () => state.setView('cosmicSounds'),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF2D2320), Color(0xFF1A1410)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.gold.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(LucideIcons.music, color: AppColors.gold, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: const [
                                      Text(
                                        'Cosmic Sounds',
                                        style: TextStyle(
                                          fontFamily: 'Playfair Display',
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      Text(
                                        'Ambient soundscapes for meditation',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.white60,
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                                Row(
                                  children: const [
                                    Icon(LucideIcons.play, color: AppColors.gold, size: 14),
                                    Icon(LucideIcons.chevron_right, color: AppColors.gold, size: 14),
                                  ],
                                )
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                Opacity(opacity: 0.5, child: Text('🌧️', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('🌊', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('🔥', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('🌲', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('⭐', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('🎵', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('🦗', style: const TextStyle(fontSize: 14))),
                                Opacity(opacity: 0.5, child: Text('💨', style: const TextStyle(fontSize: 14))),
                              ],
                            )
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Section 4: Daily Mindfulness ───
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkCard : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 4,
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [AppColors.gold, AppColors.sage, AppColors.gold],
                              ),
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(20),
                                topRight: Radius.circular(20),
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: const [
                                    Icon(LucideIcons.sparkles, color: AppColors.gold, size: 20),
                                    SizedBox(width: 8),
                                    Text(
                                      'Daily Mindfulness',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.goldDark,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.03) : AppColors.cream.withValues(alpha: 0.5),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.1)),
                                  ),
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: AppColors.sage.withValues(alpha: 0.2),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              sunSign,
                                              style: const TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.sage,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            "Today's cosmic guidance",
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: isDark ? Colors.white38 : AppColors.brown500,
                                            ),
                                          )
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        '"$dailyPrompt"',
                                        style: TextStyle(
                                          fontFamily: 'Playfair Display',
                                          fontSize: 14,
                                          fontStyle: FontStyle.italic,
                                          height: 1.4,
                                          color: isDark ? Colors.white70 : AppColors.brown800,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      _practicedToday
                                          ? Center(
                                              child: Row(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: const [
                                                  Icon(Icons.check_circle_outline, color: AppColors.sage, size: 16),
                                                  SizedBox(width: 8),
                                                  Text(
                                                    'Practiced today ✦',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.bold,
                                                      color: AppColors.sage,
                                                    ),
                                                  )
                                                ],
                                              ),
                                            )
                                          : SizedBox(
                                              width: double.infinity,
                                              child: NeonGoldButton(
                                                text: 'I Practiced Today',
                                                icon: Icons.check_circle_outline,
                                                onPressed: () {
                                                  setState(() {
                                                    _practicedToday = true;
                                                  });
                                                },
                                              ),
                                            ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ─── Overlay: Meditation Timer Screen ───
            if (_activeMeditation != null)
              _MeditationTimerOverlay(
                meditation: _activeMeditation!,
                onClose: () {
                  setState(() {
                    _activeMeditation = null;
                  });
                },
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Custom Painter for Breathing Circle & Orbiting Particles ───────────────
class _BreathingCirclePainter extends CustomPainter {
  final double progress;
  final double scale;
  final bool isPlaying;
  final String phaseLabel;
  final int secondsRemaining;
  final String emoji;
  final Color color;
  final bool isDark;

  const _BreathingCirclePainter({
    required this.progress,
    required this.scale,
    required this.isPlaying,
    required this.phaseLabel,
    required this.secondsRemaining,
    required this.emoji,
    required this.color,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Draw orbiting particles (6 total)
    if (isPlaying) {
      const particleCount = 6;
      const orbitRadius = 110.0;
      final particlePaint = Paint()..color = color.withValues(alpha: 0.5);

      for (int i = 0; i < particleCount; i++) {
        final baseAngle = (i * 360) / particleCount;
        final rotationOffset = progress * 30.0;
        final angle = baseAngle + rotationOffset;
        final rad = angle * pi / 180;
        
        final px = cx + cos(rad) * orbitRadius;
        final py = cy + sin(rad) * orbitRadius;

        canvas.drawCircle(Offset(px, py), 4, particlePaint);
      }
    }

    // Outer glow ring
    final glowPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          color.withValues(alpha: 0.2),
          color.withValues(alpha: 0.08),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: Offset(cx, cy), radius: 105 * scale));

    canvas.drawCircle(Offset(cx, cy), 105 * scale, glowPaint);

    // Main Circle
    final mainPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.withValues(alpha: 0.25),
          color.withValues(alpha: 0.12),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(Rect.fromCircle(center: Offset(cx, cy), radius: 100 * scale));

    canvas.drawCircle(Offset(cx, cy), 100 * scale, mainPaint);

    // Inner Circle Backdrop
    final innerSize = 65.0;
    final innerPaint = Paint()
      ..color = isDark ? AppColors.darkCard.withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.7);
    
    canvas.drawCircle(Offset(cx, cy), innerSize, innerPaint);
    
    // Border for Inner Circle
    final borderPaint = Paint()
      ..color = AppColors.gold.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(Offset(cx, cy), innerSize, borderPaint);

    // Text & Emoji rendering
    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
    );

    // Render phase text
    textPainter.text = TextSpan(
      text: phaseLabel,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: isDark ? Colors.white70 : AppColors.brown500,
      ),
    );
    textPainter.layout();
    textPainter.paint(canvas, Offset(cx - textPainter.width / 2, cy - 25));

    // Render value (either emoji or seconds remaining)
    if (isPlaying) {
      textPainter.text = TextSpan(
        text: '$secondsRemaining',
        style: TextStyle(
          fontFamily: 'Playfair Display',
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.brown900,
        ),
      );
    } else {
      textPainter.text = TextSpan(
        text: emoji,
        style: const TextStyle(fontSize: 26),
      );
    }
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(cx - textPainter.width / 2, cy - (isPlaying ? 10 : 15)),
    );
  }

  @override
  bool shouldRepaint(covariant _BreathingCirclePainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.scale != scale ||
        oldDelegate.isPlaying != isPlaying ||
        oldDelegate.phaseLabel != phaseLabel ||
        oldDelegate.secondsRemaining != secondsRemaining ||
        oldDelegate.emoji != emoji ||
        oldDelegate.color != color ||
        oldDelegate.isDark != isDark;
  }
}

// ─── Overlay Component: Meditation Timer ─────────────────────────────────────
class _MeditationTimerOverlay extends StatefulWidget {
  final MeditationCardData meditation;
  final VoidCallback onClose;

  const _MeditationTimerOverlay({
    required this.meditation,
    required this.onClose,
  });

  @override
  State<_MeditationTimerOverlay> createState() => _MeditationTimerOverlayState();
}

class _MeditationTimerOverlayState extends State<_MeditationTimerOverlay> with SingleTickerProviderStateMixin {
  late int _timeLeftSeconds;
  bool _isPaused = false;
  Timer? _timer;

  // Pulse animation for orb
  late AnimationController _orbController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _timeLeftSeconds = widget.meditation.duration * 60;
    
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _orbController, curve: Curves.easeInOut),
    );

    _opacityAnimation = Tween<double>(begin: 0.4, end: 0.7).animate(
      CurvedAnimation(parent: _orbController, curve: Curves.easeInOut),
    );

    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _orbController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isPaused) return;
      
      setState(() {
        if (_timeLeftSeconds > 0) {
          _timeLeftSeconds--;
        } else {
          _timer?.cancel();
          _orbController.stop();
        }
      });
    });
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final minutes = _timeLeftSeconds ~/ 60;
    final seconds = _timeLeftSeconds % 60;
    final progress = 1.0 - (_timeLeftSeconds / (widget.meditation.duration * 60));

    return Container(
      color: isDark ? Colors.black.withValues(alpha: 0.95) : const Color(0xFF1E1916).withValues(alpha: 0.96),
      child: Stack(
        children: [
          // Close button
          Positioned(
            top: 50,
            right: 20,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white70, size: 26),
              onPressed: widget.onClose,
            ),
          ),

          // Central content
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Pulsating breathing orb
                  AnimatedBuilder(
                    animation: _orbController,
                    builder: (context, child) {
                      final scale = _scaleAnimation.value;
                      final opacity = _opacityAnimation.value;
                      return Stack(
                        alignment: Alignment.center,
                        children: [
                          // Outer glow
                          Transform.scale(
                            scale: scale,
                            child: Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [
                                    AppColors.gold.withValues(alpha: 0.3 * opacity),
                                    AppColors.sage.withValues(alpha: 0.15 * opacity),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                          ),
                          // Inner glow
                          Transform.scale(
                            scale: 1.0 + (scale - 1.0) * 0.5,
                            child: Container(
                              width: 96,
                              height: 96,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [
                                    AppColors.gold.withValues(alpha: 0.5),
                                    const Color(0xFFF0C14B).withValues(alpha: 0.2),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 32),

                  // Title
                  Text(
                    widget.meditation.name,
                    style: const TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.cream,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${widget.meditation.emoji} Close your eyes and breathe gently',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.white60,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Circular Timer Canvas
                  SizedBox(
                    width: 150,
                    height: 150,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CustomPaint(
                          size: const Size(150, 150),
                          painter: _TimerProgressPainter(progress: progress),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '$minutes:${seconds.toString().padLeft(2, '0')}',
                              style: const TextStyle(
                                fontFamily: 'Playfair Display',
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppColors.cream,
                              ),
                            ),
                            const Text(
                              'remaining',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.white30,
                              ),
                            )
                          ],
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Controls / Return
                  if (_timeLeftSeconds > 0) ...[
                    GestureDetector(
                      onTap: _togglePause,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isPaused ? LucideIcons.play : LucideIcons.pause,
                              color: Colors.white70,
                              size: 14,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _isPaused ? 'Resume' : 'Pause',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Colors.white70,
                              ),
                            )
                          ],
                        ),
                      ),
                    )
                  ] else ...[
                    Column(
                      children: [
                        const Text(
                          'Namaste ✦',
                          style: TextStyle(
                            fontFamily: 'Playfair Display',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.gold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Your meditation is complete',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: widget.onClose,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.gold,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Return',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        )
                      ],
                    )
                  ]
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

// ─── Custom Painter for Circular Progress Timer ──────────────────────────────
class _TimerProgressPainter extends CustomPainter {
  final double progress;

  _TimerProgressPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = (size.width - 8) / 2;

    // Draw background ring
    final bgPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    canvas.drawCircle(Offset(cx, cy), radius, bgPaint);

    // Draw active gold ring
    final activePaint = Paint()
      ..color = AppColors.gold.withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 4;

    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: radius),
      -pi / 2,
      2 * pi * progress,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _TimerProgressPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
