import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

// ─── Zodiac Constants & Data ────────────────────────────────────────────────
const List<String> _zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const Map<String, String> _zodiacSymbols = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍',
  'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
};

const Map<String, String> _zodiacElements = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

const Map<String, String> _zodiacModalities = {
  'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
  'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
  'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable',
};

const Map<String, List<String>> _elementCompat = {
  'Fire': ['Air', 'Fire'],
  'Air': ['Fire', 'Air'],
  'Earth': ['Water', 'Earth'],
  'Water': ['Earth', 'Water'],
};

const Map<String, Color> _elementColors = {
  'Fire': Color(0xFFEF4444),
  'Earth': Color(0xFF10B981),
  'Air': Color(0xFFF59E0B),
  'Water': Color(0xFF14B8A6),
};

// ─── Deterministic Compatibility calculation ─────────────────────────────────
int _calculateCompatibilityScore(String sign1, String sign2) {
  final el1 = _zodiacElements[sign1] ?? 'Fire';
  final el2 = _zodiacElements[sign2] ?? 'Fire';
  final mod1 = _zodiacModalities[sign1] ?? 'Cardinal';
  final mod2 = _zodiacModalities[sign2] ?? 'Cardinal';

  // Element compatibility score (0-40)
  int elementScore = 20;
  if (el1 == el2) {
    elementScore = 38;
  } else if (_elementCompat[el1]?.contains(el2) ?? false) {
    elementScore = 32;
  } else {
    elementScore = 16;
  }

  // Modality compatibility (0-25)
  int modalityScore = 12;
  if (mod1 != mod2) {
    modalityScore = 22;
  } else {
    modalityScore = 14;
  }

  // Moon sign emotional compatibility (0-25)
  int moonScore = (el1 == el2) ? 22 : ((_elementCompat[el1]?.contains(el2) ?? false) ? 18 : 10);

  // Deterministic variation based on sign indices
  final idx1 = _zodiacSigns.indexOf(sign1);
  final idx2 = _zodiacSigns.indexOf(sign2);
  final phaseBonus = ((idx1 * 7 + idx2 * 13) % 11) - 5;
  
  final overall = elementScore + modalityScore + moonScore + phaseBonus;
  return overall.clamp(15, 98);
}

String _getLevel(int score) {
  if (score > 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

class GameRound {
  final String sign1;
  final String sign2;
  final int actualScore;
  final String actualLevel; // 'High', 'Medium', 'Low'

  GameRound({
    required this.sign1,
    required this.sign2,
    required this.actualScore,
    required this.actualLevel,
  });
}

List<GameRound> _generateRounds() {
  final List<GameRound> rounds = [];
  final Set<String> usedPairs = {};
  final rand = Random();

  while (rounds.length < 10) {
    final idx1 = rand.nextInt(12);
    int idx2 = rand.nextInt(12);
    while (idx2 == idx1) {
      idx2 = rand.nextInt(12);
    }

    final pairKey = '${min(idx1, idx2)}-${max(idx1, idx2)}';
    if (usedPairs.contains(pairKey)) continue;
    usedPairs.add(pairKey);

    final sign1 = _zodiacSigns[idx1];
    final sign2 = _zodiacSigns[idx2];
    final score = _calculateCompatibilityScore(sign1, sign2);

    rounds.add(GameRound(
      sign1: sign1,
      sign2: sign2,
      actualScore: score,
      actualLevel: _getLevel(score),
    ));
  }
  return rounds;
}

Map<String, String> _getRating(int correctCount) {
  if (correctCount >= 8) {
    return {
      'title': 'Cosmic Matchmaker',
      'emoji': '🌟',
      'description': 'You have an extraordinary sense of zodiac harmony!'
    };
  }
  if (correctCount >= 5) {
    return {
      'title': 'Astrology Apprentice',
      'emoji': '🔮',
      'description': 'Good instincts! You understand the cosmic currents.'
    };
  }
  return {
    'title': 'Novice Stargazer',
    'emoji': '🔭',
    'description': 'Keep gazing at the stars — your intuition will grow!'
  };
}

// ─── Main Screen Widget ───
class ZodiacGameScreen extends StatefulWidget {
  const ZodiacGameScreen({Key? key}) : super(key: key);

  @override
  State<ZodiacGameScreen> createState() => _ZodiacGameScreenState();
}

class _ZodiacGameScreenState extends State<ZodiacGameScreen> {
  late List<GameRound> _rounds;
  int _currentRoundIdx = 0;
  int _correct = 0;
  int _wrong = 0;
  int _streak = 0;
  int _bestStreak = 0;
  String? _guessedLevel; // 'High', 'Medium', 'Low'
  bool _isRevealing = false;
  bool _isComplete = false;

  @override
  void initState() {
    super.initState();
    _startNewGame();
  }

  void _startNewGame() {
    setState(() {
      _rounds = _generateRounds();
      _currentRoundIdx = 0;
      _correct = 0;
      _wrong = 0;
      _streak = 0;
      _bestStreak = 0;
      _guessedLevel = null;
      _isRevealing = false;
      _isComplete = false;
    });
  }

  void _handleGuess(String level) {
    if (_isRevealing || _isComplete) return;

    final round = _rounds[_currentRoundIdx];
    final isCorrect = level == round.actualLevel;

    setState(() {
      _guessedLevel = level;
      _isRevealing = true;
      if (isCorrect) {
        _correct++;
        _streak++;
        if (_streak > _bestStreak) _bestStreak = _streak;
      } else {
        _wrong++;
        _streak = 0;
      }
    });
  }

  void _handleNextRound() {
    setState(() {
      if (_currentRoundIdx + 1 >= 10) {
        _isComplete = true;
        _isRevealing = false;
      } else {
        _currentRoundIdx++;
        _guessedLevel = null;
        _isRevealing = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);

    if (_isComplete) {
      return _buildScoreboardView(isDark, state);
    }

    final round = _rounds[_currentRoundIdx];
    final el1 = _zodiacElements[round.sign1]!;
    final el2 = _zodiacElements[round.sign2]!;
    final isCorrect = _guessedLevel == round.actualLevel;

    return WillPopScope(
      onWillPop: () async {
        state.setView('sync');
        return false;
      },
      child: Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
            onPressed: () => state.setView('sync'),
          ),
          title: Text(
            'Zodiac Game 🎮',
            style: TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.brown900,
            ),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            children: [
              // ─── Score Tracker ───
              Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                padding: const EdgeInsets.all(12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Text('$_correct', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.sage)),
                          const Text('Correct', style: TextStyle(fontSize: 8, color: Colors.grey)),
                        ],
                      ),
                    ),
                    Container(width: 1, height: 24, color: isDark ? Colors.white12 : AppColors.brown100),
                    Expanded(
                      child: Column(
                        children: [
                          Text('$_wrong', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                          const Text('Wrong', style: TextStyle(fontSize: 8, color: Colors.grey)),
                        ],
                      ),
                    ),
                    Container(width: 1, height: 24, color: isDark ? Colors.white12 : AppColors.brown100),
                    Expanded(
                      child: Column(
                        children: [
                          Text('$_streak', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown700)),
                          const Text('Streak', style: TextStyle(fontSize: 8, color: Colors.grey)),
                        ],
                      ),
                    ),
                    Container(width: 1, height: 24, color: isDark ? Colors.white12 : AppColors.brown100),
                    Expanded(
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Round ${_currentRoundIdx + 1}/10',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Pair Cards ───
              Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: const [
                        Icon(LucideIcons.gamepad_2, color: AppColors.gold, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Guess the Compatibility',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Zodiac Match Visualizer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        // Left Sign
                        Column(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.5),
                                border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 1.5),
                              ),
                              alignment: Alignment.center,
                              child: Text(_zodiacSymbols[round.sign1]!, style: const TextStyle(fontSize: 36)),
                            ),
                            const SizedBox(height: 8),
                            Text(round.sign1, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: _elementColors[el1]!.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: _elementColors[el1]!.withOpacity(0.3)),
                              ),
                              child: Text(
                                el1,
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _elementColors[el1]),
                              ),
                            )
                          ],
                        ),

                        // Center VS
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.gold.withOpacity(0.1),
                            border: Border.all(color: AppColors.gold.withOpacity(0.2)),
                          ),
                          alignment: Alignment.center,
                          child: const Text(
                            'VS',
                            style: TextStyle(fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                          ),
                        ),

                        // Right Sign
                        Column(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.5),
                                border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 1.5),
                              ),
                              alignment: Alignment.center,
                              child: Text(_zodiacSymbols[round.sign2]!, style: const TextStyle(fontSize: 36)),
                            ),
                            const SizedBox(height: 8),
                            Text(round.sign2, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: _elementColors[el2]!.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: _elementColors[el2]!.withOpacity(0.3)),
                              ),
                              child: Text(
                                el2,
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _elementColors[el2]),
                              ),
                            )
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Game interactive area
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: !_isRevealing
                          ? Column(
                              children: [
                                const Text(
                                  'What\'s their compatibility level?',
                                  style: TextStyle(fontSize: 12, color: Colors.grey),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                        child: ElevatedButton(
                                          onPressed: () => _handleGuess('High'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppColors.sage,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 12),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          child: Column(
                                            children: [
                                              const Text('High', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                              Opacity(opacity: 0.8, child: const Text('>70%', style: TextStyle(fontSize: 9))),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                        child: ElevatedButton(
                                          onPressed: () => _handleGuess('Medium'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppColors.gold,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 12),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          child: Column(
                                            children: [
                                              const Text('Medium', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                              Opacity(opacity: 0.8, child: const Text('40-70%', style: TextStyle(fontSize: 9))),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                        child: ElevatedButton(
                                          onPressed: () => _handleGuess('Low'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF8D6E63),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 12),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          child: Column(
                                            children: [
                                              const Text('Low', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                              Opacity(opacity: 0.8, child: const Text('<40%', style: TextStyle(fontSize: 9))),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            )
                          : Column(
                              children: [
                                // Glowing Score Reveal Circle
                                Container(
                                  width: 100,
                                  height: 100,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppColors.gold.withOpacity(0.1),
                                    border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.gold.withOpacity(0.15),
                                        blurRadius: 15,
                                        spreadRadius: 2,
                                      )
                                    ],
                                  ),
                                  alignment: Alignment.center,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text('🔔', style: TextStyle(fontSize: 16)),
                                      Text(
                                        '${round.actualScore}%',
                                        style: TextStyle(
                                          fontFamily: 'Playfair Display',
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                          color: isDark ? AppColors.goldLight : AppColors.goldDark,
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16),

                                // Feedback Banner
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: isCorrect ? AppColors.sage.withOpacity(0.12) : AppColors.gold.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: isCorrect ? AppColors.sage.withOpacity(0.3) : AppColors.gold.withOpacity(0.3)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isCorrect ? LucideIcons.sparkles : Icons.cancel,
                                        color: isCorrect ? AppColors.sage : AppColors.goldDark,
                                        size: 14,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        isCorrect ? 'Correct! ✨' : 'Wrong — It was ${round.actualLevel}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: isCorrect ? AppColors.sage : AppColors.goldDark,
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),

                                // Modality / Element details
                                Text(
                                  '${_zodiacElements[round.sign1]} × ${_zodiacElements[round.sign2]}  •  ${_zodiacModalities[round.sign1]} × ${_zodiacModalities[round.sign2]}',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                                ),
                                const SizedBox(height: 16),

                                SizedBox(
                                  width: 140,
                                  child: ElevatedButton(
                                    onPressed: _handleNextRound,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.goldDark,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: Text(
                                      _currentRoundIdx < 9 ? 'Next Round →' : 'See Results 🏆',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                )
                              ],
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Section: Quick Reference ───
              Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
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
                        Icon(LucideIcons.sparkles, color: AppColors.gold, size: 16),
                        SizedBox(width: 8),
                        Text(
                          'Quick Reference',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Zodiac signs symbols grid
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _zodiacSigns.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        crossAxisSpacing: 6,
                        mainAxisSpacing: 6,
                        childAspectRatio: 2.1,
                      ),
                      itemBuilder: (context, idx) {
                        final sign = _zodiacSigns[idx];
                        return Container(
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white.withOpacity(0.02) : AppColors.cream.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(_zodiacSymbols[sign]!, style: const TextStyle(fontSize: 14)),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  sign,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(fontSize: 9, color: isDark ? Colors.white60 : AppColors.brown500),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),

                    // Quick criteria description
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.sage.withOpacity(0.06),
                              border: Border.all(color: AppColors.sage.withOpacity(0.15)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              children: [
                                const Text('High >70%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.sage)),
                                Text('Same/Compatible Elements', textAlign: TextAlign.center, style: TextStyle(fontSize: 8, color: isDark ? Colors.white30 : Colors.black45)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.gold.withOpacity(0.06),
                              border: Border.all(color: AppColors.gold.withOpacity(0.15)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              children: [
                                const Text('Med 40-70%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                                Text('Mixed Elements', textAlign: TextAlign.center, style: TextStyle(fontSize: 8, color: isDark ? Colors.white30 : Colors.black45)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScoreboardView(bool isDark, AppState state) {
    final rating = _getRating(_correct);
    final percentage = ((_correct / 10) * 100).round();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(rating['emoji']!, style: const TextStyle(fontSize: 64)),
                  const SizedBox(height: 12),
                  Text(
                    rating['title']!,
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.brown900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    rating['description']!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),

                  // Stats Grid
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(color: AppColors.sage.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              Text('$_correct', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.sage)),
                              const Text('Correct', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              Text('$_wrong', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                              const Text('Wrong', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              Text('$_bestStreak', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : AppColors.brown700)),
                              const Text('Best Streak', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Progress bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.gold.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.gold.withOpacity(0.15)),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Score: ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('$_correct/10', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: _correct / 10.0,
                            minHeight: 6,
                            backgroundColor: isDark ? Colors.white10 : AppColors.brown100,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
                          ),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _startNewGame,
                          icon: const Icon(LucideIcons.rotate_ccw, size: 16),
                          label: const Text('Play Again'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.goldDark,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => state.setView('sync'),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: isDark ? Colors.white24 : AppColors.brown100),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            'Back to Sync',
                            style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown700),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
