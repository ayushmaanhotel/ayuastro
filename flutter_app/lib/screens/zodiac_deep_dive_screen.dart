import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../data/zodiac_data.dart';
import '../data/vedic_zodiac_data.dart';

class ZodiacDeepDiveScreen extends StatefulWidget {
  const ZodiacDeepDiveScreen({super.key});

  @override
  State<ZodiacDeepDiveScreen> createState() => _ZodiacDeepDiveScreenState();
}

class _ZodiacDeepDiveScreenState extends State<ZodiacDeepDiveScreen> {
  String _selectedSign = 'Aries';
  int _activeTab = 0; // 0=overview, 1=love, 2=career, 3=spiritual

  @override
  void initState() {
    super.initState();
    final state = Provider.of<AppState>(context, listen: false);
    final sun = state.astrologyData?.sunSign;
    if (sun != null && zodiacData.containsKey(sun)) {
      _selectedSign = sun;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final sign = zodiacData[_selectedSign]!;

    final elementColors = {
      'Fire': [const Color(0xFFEF4444), const Color(0xFFF97316)],
      'Earth': [const Color(0xFF059669), const Color(0xFF10B981)],
      'Air': [const Color(0xFF3B82F6), const Color(0xFF60A5FA)],
      'Water': [const Color(0xFF8B5CF6), const Color(0xFF6366F1)],
    };
    final colors = elementColors[sign.element] ?? [Colors.grey, Colors.grey];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true, pinned: true,
            backgroundColor: (isDark ? AppColors.darkBg : AppColors.cream).withValues(alpha: 0.95),
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
              onPressed: () => state.setView('insights'),
            ),
            title: Text('Zodiac Deep Dive', style: TextStyle(
              fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.brown900,
            )),
          ),

          // Sign Selector Wheel
          SliverToBoxAdapter(
            child: SizedBox(
              height: 80,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: zodiacData.entries.map((e) {
                  final isSelected = e.key == _selectedSign;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedSign = e.key),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 60, height: 70,
                        decoration: BoxDecoration(
                          color: isSelected ? colors[0].withValues(alpha: 0.15) : Colors.transparent,
                          borderRadius: BorderRadius.circular(14),
                          border: isSelected ? Border.all(color: colors[0].withValues(alpha: 0.4)) : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(e.value.symbol, style: TextStyle(fontSize: isSelected ? 28 : 22)),
                            Text(e.value.abbr, style: TextStyle(
                              fontSize: 9, fontWeight: FontWeight.w600,
                              color: isSelected ? colors[0] : (isDark ? Colors.white38 : AppColors.brown500),
                            )),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Hero Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [colors[0].withValues(alpha: 0.12), colors[1].withValues(alpha: 0.06)]),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: colors[0].withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    Text(sign.symbol, style: const TextStyle(fontSize: 52)),
                    const SizedBox(height: 8),
                    Text(sign.name, style: TextStyle(
                      fontFamily: 'Playfair Display', fontSize: 28, fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.brown900,
                    )),
                    Text(sign.quality, style: TextStyle(
                      fontSize: 14, color: colors[0],
                    )),
                    const SizedBox(height: 8),
                    Text(sign.dateRange, style: TextStyle(
                      fontSize: 12, color: isDark ? Colors.white38 : AppColors.brown500,
                    )),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8, runSpacing: 6,
                      children: [
                        _badge(sign.element, colors[0], isDark),
                        _badge(sign.modality, colors[0], isDark),
                        _badge('${sign.rulerSymbol} ${sign.ruler}', colors[0], isDark),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Tabs
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  _tab('Overview', 0, colors[0], isDark),
                  const SizedBox(width: 8),
                  _tab('Love', 1, colors[0], isDark),
                  const SizedBox(width: 8),
                  _tab('Career', 2, colors[0], isDark),
                  const SizedBox(width: 8),
                  _tab('Spirit', 3, colors[0], isDark),
                  const SizedBox(width: 8),
                  _tab('Vedic', 4, colors[0], isDark),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _buildTabContent(sign, colors[0], isDark),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 60)),
        ],
      ),
    );
  }

  Widget _buildTabContent(ZodiacSignData sign, Color color, bool isDark) {
    switch (_activeTab) {
      case 0: return _overviewTab(sign, color, isDark);
      case 1: return _loveTab(sign, color, isDark);
      case 2: return _careerTab(sign, color, isDark);
      case 3: return _spiritualTab(sign, color, isDark);
      case 4: return _vedicTab(_selectedSign, color, isDark);
      default: return _overviewTab(sign, color, isDark);
    }
  }

  Widget _overviewTab(ZodiacSignData sign, Color color, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Emotional Traits
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('EMOTIONAL PROFILE', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 12),
              ...sign.emotionalTraits.map((t) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(t.name, style: TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : AppColors.brown900,
                        )),
                        Text('${t.score}%', style: TextStyle(fontSize: 12, color: color)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: t.score / 100,
                        backgroundColor: isDark ? Colors.white10 : AppColors.brown100,
                        valueColor: AlwaysStoppedAnimation<Color>(color),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              )),
            ],
          ),
        ),
      ],
    );
  }

  Widget _loveTab(ZodiacSignData sign, Color color, bool isDark) {
    return Column(
      children: [
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('BEST MATCHES', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: sign.bestMatches.map((m) => Column(
                  children: [
                    Text(m.symbol, style: const TextStyle(fontSize: 32)),
                    const SizedBox(height: 4),
                    Text(m.sign, style: TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : AppColors.brown900,
                    )),
                  ],
                )).toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('LOVE LANGUAGE', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: color,
              )),
              const SizedBox(height: 8),
              Text(sign.loveLanguage, style: TextStyle(
                fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _listCard('Strengths', sign.relationshipStrengths, Colors.green, isDark),
        const SizedBox(height: 12),
        _listCard('Growth Areas', sign.relationshipGrowthAreas, Colors.amber, isDark),
      ],
    );
  }

  Widget _careerTab(ZodiacSignData sign, Color color, bool isDark) {
    return Column(
      children: [
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('CAREER FIELDS', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 12),
              ...sign.careerFields.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Text(f.emoji, style: const TextStyle(fontSize: 20)),
                    const SizedBox(width: 10),
                    Text(f.field, style: TextStyle(
                      fontSize: 13, color: isDark ? Colors.white70 : AppColors.brown700,
                    )),
                  ],
                ),
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _textCard('Work Style', sign.workStyle, isDark),
        const SizedBox(height: 12),
        _textCard('Leadership Style', sign.leadershipStyle, isDark),
      ],
    );
  }

  Widget _spiritualTab(ZodiacSignData sign, Color color, bool isDark) {
    return Column(
      children: [
        _textCard('Life Lesson', sign.lifeLesson, isDark),
        const SizedBox(height: 12),
        _textCard('Spiritual Practice', sign.spiritualPractice, isDark),
        const SizedBox(height: 12),
        GlassPremiumCard(
          borderShimmer: true,
          child: Column(
            children: [
              const Text('✨', style: TextStyle(fontSize: 32)),
              const SizedBox(height: 8),
              Text('DAILY AFFIRMATION', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? AppColors.goldLight : AppColors.goldDark,
              )),
              const SizedBox(height: 8),
              Text('"${sign.affirmation}"', textAlign: TextAlign.center, style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 16, fontStyle: FontStyle.italic,
                height: 1.5, color: isDark ? Colors.white : AppColors.brown900,
              )),
            ],
          ),
        ),
      ],
    );
  }

  Widget _vedicTab(String signName, Color color, bool isDark) {
    final vedic = vedicZodiacData[signName];
    if (vedic == null) {
      return const Center(child: Text("Vedic data not available for this sign."));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Vedic Identity Card
        GlassPremiumCard(
          borderShimmer: true,
          child: Column(
            children: [
              Text(vedic.symbol, style: const TextStyle(fontSize: 40)),
              const SizedBox(height: 8),
              Text(vedic.sanskritName, style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.brown900,
              )),
              Text(vedic.name, style: TextStyle(
                fontSize: 14, color: color,
              )),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8, runSpacing: 6,
                children: [
                  _badge(vedic.element, color, isDark),
                  _badge(vedic.modality, color, isDark),
                  _badge(vedic.rulingPlanet, color, isDark),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.auto_awesome, color: AppColors.gold, size: 14),
                  const SizedBox(width: 6),
                  Text('Deity: ${vedic.deity}', style: TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white70 : AppColors.brown700,
                  )),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Nakshatras
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NAKSHATRAS', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 8),
              Text(vedic.nakshatras, style: TextStyle(
                fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Personality Traits
        _listCard('Vedic Personality', vedic.personalityTraits, color, isDark),
        const SizedBox(height: 12),

        // Strengths & Weaknesses
        _listCard('Strengths', vedic.strengths, Colors.green, isDark),
        const SizedBox(height: 12),
        _listCard('Shadow Side', vedic.weaknesses, Colors.orange, isDark),
        const SizedBox(height: 12),

        // Career & Love
        _textCard('Career Aptitude', vedic.careerAptitude, isDark),
        const SizedBox(height: 12),
        _textCard('Love Style', vedic.loveStyle, isDark),
        const SizedBox(height: 12),

        // Health & Spiritual
        _textCard('Health Tendencies', vedic.healthTendency, isDark),
        const SizedBox(height: 12),
        _textCard('Spiritual Path', vedic.spiritualPath, isDark),
        const SizedBox(height: 12),

        // Life Lesson
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('LIFE LESSON', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 8),
              Text(vedic.lifeLesson, style: TextStyle(
                fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Daily Affirmation
        GlassPremiumCard(
          borderShimmer: true,
          child: Column(
            children: [
              const Text('🙏', style: TextStyle(fontSize: 32)),
              const SizedBox(height: 8),
              Text('VEDIC AFFIRMATION', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? AppColors.goldLight : AppColors.goldDark,
              )),
              const SizedBox(height: 8),
              Text('"${vedic.dailyAffirmation}"', textAlign: TextAlign.center, style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 16, fontStyle: FontStyle.italic,
                height: 1.5, color: isDark ? Colors.white : AppColors.brown900,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Compatibility
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('VEDIC COMPATIBILITY', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 12),
              ...vedic.compatibility.entries.map((entry) {
                final partnerSign = vedicZodiacData[entry.key];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          '${partnerSign?.symbol ?? ''} ${entry.key}',
                          style: TextStyle(
                            fontSize: 11, fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white70 : AppColors.brown700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: entry.value / 100,
                            backgroundColor: AppColors.brown100.withValues(alpha: 0.3),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              entry.value >= 80 ? Colors.green :
                              entry.value >= 60 ? AppColors.gold :
                              entry.value >= 50 ? Colors.orange : Colors.redAccent,
                            ),
                            minHeight: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 35,
                        child: Text(
                          '${entry.value}%',
                          textAlign: TextAlign.right,
                          style: TextStyle(
                            fontSize: 11, fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white54 : AppColors.brown500,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _tab(String label, int index, Color color, bool isDark) {
    final isActive = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? color.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isActive ? color.withValues(alpha: 0.4) : (isDark ? Colors.white12 : AppColors.brown100),
            ),
          ),
          child: Center(child: Text(label, style: TextStyle(
            fontSize: 12, fontWeight: FontWeight.w600,
            color: isActive ? color : (isDark ? Colors.white54 : AppColors.brown500),
          ))),
        ),
      ),
    );
  }

  Widget _badge(String text, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }

  Widget _textCard(String label, String text, bool isDark) {
    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
            color: isDark ? Colors.white38 : AppColors.brown500,
          )),
          const SizedBox(height: 8),
          Text(text, style: TextStyle(
            fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
          )),
        ],
      ),
    );
  }

  Widget _listCard(String label, List<String> items, Color color, bool isDark) {
    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: color,
          )),
          const SizedBox(height: 8),
          ...items.map((s) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('✦ ', style: TextStyle(color: color)),
                Expanded(child: Text(s, style: TextStyle(
                  fontSize: 12, height: 1.4, color: isDark ? Colors.white54 : AppColors.brown700,
                ))),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
