import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';

// ─── Yoga Detail Model & Lookup ──────────────────────────────────────────────
class _YogaDetail {
  final String name;
  final String sanskrit;
  final String emoji;
  final String summary;
  final String description;
  final String houses;
  final String planets;
  final String emotionalInterpretation;

  const _YogaDetail({
    required this.name,
    required this.sanskrit,
    required this.emoji,
    required this.summary,
    required this.description,
    required this.houses,
    required this.planets,
    required this.emotionalInterpretation,
  });
}

const Map<String, _YogaDetail> _yogaDetails = {
  'Gaj Kesari Yoga': _YogaDetail(
    name: 'Gaj Kesari Yoga',
    sanskrit: 'गजकेसरी योग',
    emoji: '🦁',
    summary: 'Wisdom & courage combine to create natural leadership',
    description: 'When Jupiter and the Moon form an auspicious relationship in your chart, they create the Gaj Kesari Yoga — the "Elephant-Lion" combination. This grants you both the gentle wisdom of the elephant and the bold confidence of the lion, making you someone others naturally turn to for guidance.',
    houses: 'Jupiter and Moon in kendras (1st, 4th, 7th, 10th) from each other',
    planets: 'Jupiter (Guru) & Moon (Chandra)',
    emotionalInterpretation: 'Emotionally, this yoga gives you a rare combination of deep feeling and wise perspective. You can hold intense emotions without being overwhelmed by them, and you naturally help others process their feelings. Your emotional resilience is grounded in genuine optimism, not denial.',
  ),
  'Budh Aditya Yoga': _YogaDetail(
    name: 'Budh Aditya Yoga',
    sanskrit: 'बुधादित्य योग',
    emoji: '☀️',
    summary: 'Intellect and vitality merge for sharp communication',
    description: 'The conjunction of Sun and Mercury creates Budh Aditya Yoga, the "Intellectual Radiance" combination. Your mind works with clarity and purpose — you articulate complex ideas effortlessly and process information with remarkable speed.',
    houses: 'Sun and Mercury in the same house (not combust)',
    planets: 'Sun (Surya) & Mercury (Budh)',
    emotionalInterpretation: 'This yoga shapes how you process emotions intellectually. You tend to understand your feelings by naming and analyzing them before fully experiencing them.',
  ),
  'Raj Yoga': _YogaDetail(
    name: 'Raj Yoga',
    sanskrit: 'राजयोग',
    emoji: '👑',
    summary: 'Karmic and trikona lords unite for influence and purpose',
    description: 'Raj Yoga arises when the lords of kendra and trikona houses form a relationship. This grants leadership potential, recognition, and a sense of life purpose.',
    houses: 'Kendra lords (1st, 4th, 7th, 10th) & Trikona lords (1st, 5th, 9th) conjunct or aspecting',
    planets: 'Kendra & Trikona lords (varies by ascendant)',
    emotionalInterpretation: 'With Raj Yoga, you carry an innate sense of responsibility and purpose.',
  ),
  'Dhana Yoga': _YogaDetail(
    name: 'Dhana Yoga',
    sanskrit: 'धनयोग',
    emoji: '💎',
    summary: 'Wealth-giving planetary combinations create abundance',
    description: 'Dhana Yoga forms when the lords of wealth-indicating houses connect with the lords of trinal houses. This suggests natural financial acumen and an ability to attract resources.',
    houses: '2nd & 11th lords connecting with 1st, 5th, or 9th lords',
    planets: '2nd Lord, 11th Lord with Kendra/Trikona lords',
    emotionalInterpretation: 'Dhana Yoga shapes your relationship with security and self-worth.',
  ),
  'Neech Bhang Raj Yoga': _YogaDetail(
    name: 'Neech Bhang Raj Yoga',
    sanskrit: 'नीचभङ्गराजयोग',
    emoji: '🦅',
    summary: 'A debilitated planet is lifted — struggle transforms into strength',
    description: 'Neech Bhang Raj Yoga arises when a debilitated planet receives cancellation. Your struggles become the raw material of your power.',
    houses: 'Debilitated planet receiving cancellation',
    planets: 'Varies',
    emotionalInterpretation: 'Your emotional wounds are not permanent limitations — they are the foundation of your emotional wisdom.',
  ),
  'Chandra Mangal Yoga': _YogaDetail(
    name: 'Chandra Mangal Yoga',
    sanskrit: 'चन्द्रमङ्गल योग',
    emoji: '🔥',
    summary: 'Emotional depth meets driven energy for passionate action',
    description: 'Moon and Mars create the "Emotional Fire" combination — someone who acts on their feelings with intensity and conviction.',
    houses: 'Moon and Mars in the same house or in mutual aspect',
    planets: 'Moon (Chandra) & Mars (Mangal)',
    emotionalInterpretation: 'This yoga amplifies your emotional intensity.',
  ),
  'Hansa Yoga': _YogaDetail(
    name: 'Hansa Yoga',
    sanskrit: 'हंसयोग',
    emoji: '🦢',
    summary: 'Jupiter at peak strength grants wisdom and spiritual depth',
    description: 'Hansa Yoga forms when Jupiter is exalted or in its own sign in a kendra house.',
    houses: 'Jupiter exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Jupiter (Guru)',
    emotionalInterpretation: 'Hansa Yoga gives you an emotional maturity that others find grounding.',
  ),
  'Malavya Yoga': _YogaDetail(
    name: 'Malavya Yoga',
    sanskrit: 'मालव्ययोग',
    emoji: '🌹',
    summary: 'Venus at peak strength brings beauty and relational grace',
    description: 'Malavya Yoga arises when Venus is exalted or in its own sign in a kendra house.',
    houses: 'Venus exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Venus (Shukra)',
    emotionalInterpretation: 'Your emotional life is deeply connected to beauty and harmony.',
  ),
  'Shasha Yoga': _YogaDetail(
    name: 'Shasha Yoga',
    sanskrit: 'शशयोग',
    emoji: '🏔️',
    summary: 'Saturn at peak strength delivers endurance and lasting achievement',
    description: 'Shasha Yoga forms when Saturn is exalted or in its own sign in a kendra house.',
    houses: 'Saturn exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Saturn (Shani)',
    emotionalInterpretation: 'Shasha Yoga gives you emotional stamina but can also create emotional guardedness.',
  ),
  'Ruchaka Yoga': _YogaDetail(
    name: 'Ruchaka Yoga',
    sanskrit: 'रुचकयोग',
    emoji: '⚔️',
    summary: 'Mars at peak strength provides courage and competitive edge',
    description: 'Ruchaka Yoga arises when Mars is exalted or in its own sign in a kendra house.',
    houses: 'Mars exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Mars (Mangal)',
    emotionalInterpretation: 'Your emotional landscape is defined by courage and intensity.',
  ),
  'Bhadra Yoga': _YogaDetail(
    name: 'Bhadra Yoga',
    sanskrit: 'भद्रयोग',
    emoji: '📚',
    summary: 'Mercury at peak strength brings exceptional intellect',
    description: 'Bhadra Yoga forms when Mercury is exalted or in its own sign in a kendra house.',
    houses: 'Mercury exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Mercury (Budh)',
    emotionalInterpretation: 'Your emotional world is deeply connected to language and thought.',
  ),
  'Amala Yoga': _YogaDetail(
    name: 'Amala Yoga',
    sanskrit: 'अमलयोग',
    emoji: '✨',
    summary: 'Venus and Jupiter in kendras from Moon grant pure reputation',
    description: 'Amala Yoga arises when both Venus and Jupiter occupy kendra houses from the Moon.',
    houses: 'Venus and Jupiter in kendras from the Moon',
    planets: 'Moon, Venus & Jupiter',
    emotionalInterpretation: 'You have an emotional need for authenticity.',
  ),
  'Veshi Yoga': _YogaDetail(
    name: 'Veshi Yoga',
    sanskrit: 'वेशीयोग',
    emoji: '🗣️',
    summary: 'Planets in 2nd from the Sun bring wealth through speech',
    description: 'Veshi Yoga forms when planets occupy the 2nd house from the Sun.',
    houses: 'Planets in the 2nd sign from the Sun',
    planets: 'Sun with planets in the next sign',
    emotionalInterpretation: 'Your emotional expression connects to self-worth and family identity.',
  ),
  'Voshi Yoga': _YogaDetail(
    name: 'Voshi Yoga',
    sanskrit: 'वोशीयोग',
    emoji: '🌸',
    summary: 'Planets in 12th from the Sun bring inner contentment',
    description: 'Voshi Yoga forms when planets occupy the 12th house from the Sun.',
    houses: 'Planets in the 12th sign from the Sun',
    planets: 'Sun with planets in the previous sign',
    emotionalInterpretation: 'You have access to emotional resources beneath the surface.',
  ),
  'Ubhayachari Yoga': _YogaDetail(
    name: 'Ubhayachari Yoga',
    sanskrit: 'उभयचरीयोग',
    emoji: '🔱',
    summary: 'Planets flanking the Sun bring commanding presence',
    description: 'Ubhayachari Yoga forms when planets occupy both the 2nd and 12th houses from the Sun.',
    houses: 'Planets in both 2nd AND 12th from the Sun',
    planets: 'Sun with planets flanking it',
    emotionalInterpretation: 'You feel both supported and scrutinized by others.',
  ),
  'Vipreet Raj Yoga': _YogaDetail(
    name: 'Vipreet Raj Yoga',
    sanskrit: 'विपरीतराजयोग',
    emoji: '🌀',
    summary: 'Rise from adversity — challenges become extraordinary power',
    description: 'Vipreet Raj Yoga forms when the lords of challenging houses occupy other challenging houses.',
    houses: 'Lords of 6th, 8th, or 12th in 6th, 8th, or 12th',
    planets: 'Lords of Dushtana houses',
    emotionalInterpretation: 'Your deepest emotional wounds are portals to your greatest strengths.',
  ),
};

// ─── Dosha Detail Model & Lookup ──────────────────────────────────────────────
class _DoshaDetail {
  final String name;
  final String sanskrit;
  final String summary;
  final String description;
  final Map<String, String> remedies;
  final String severity; // Mild, Moderate, Significant

  const _DoshaDetail({
    required this.name,
    required this.sanskrit,
    required this.summary,
    required this.description,
    required this.remedies,
    required this.severity,
  });
}

const Map<String, _DoshaDetail> _doshaDetails = {
  'Mangal Dosha': _DoshaDetail(
    name: 'Mangal Dosha',
    sanskrit: 'मङ्गलदोष',
    summary: 'Passion that seeks constructive channels',
    description: 'Mangal Dosha arises when Mars occupies the 1st, 4th, 7th, 8th, or 12th house. This placement intensifies your passionate nature and calls for emotional boundary training to manage defensiveness.',
    remedies: {
      'behavioral': 'Practice pausing 3 seconds before responding in conflict.',
      'mindfulness': 'Channel Mars energy through physical activity 3x/week.',
      'journaling': 'Reflect on where anger shields you from expressing vulnerability.',
    },
    severity: 'Moderate',
  ),
  'Kaal Sarp Dosha': _DoshaDetail(
    name: 'Kaal Sarp Dosha',
    sanskrit: 'कालसर्पदोष',
    summary: 'Karmic patterns that invite deep transformation',
    description: 'Kaal Sarp Dosha occurs when all seven visible planets are hemmed between Rahu and Ketu, creating a strong sense of destiny and a call to move beyond surface-level validations.',
    remedies: {
      'behavioral': 'Identify one recurring pattern and commit to a different response.',
      'mindfulness': 'Practice 10 minutes of daily grounding body scan meditation.',
      'journaling': 'What lesson keeps reappearing in different forms?',
    },
    severity: 'Significant',
  ),
  'Pitra Dosha': _DoshaDetail(
    name: 'Pitra Dosha',
    sanskrit: 'पितृदोष',
    summary: 'Ancestral patterns seeking conscious resolution',
    description: 'Pitra Dosha relates to unresolved behaviors and structural patterns inherited from previous generations that seek resolution through your awareness.',
    remedies: {
      'behavioral': 'Have an honest conversation about emotional patterns with family.',
      'mindfulness': 'Practice weekly ancestral reflection and gratitude.',
      'journaling': 'What emotional pattern did I inherit from my family?',
    },
    severity: 'Mild',
  ),
  'Shani Sade Sati': _DoshaDetail(
    name: 'Shani Sade Sati',
    sanskrit: 'शनिसाढ़ेसाती',
    summary: 'A 7.5-year period of profound restructuring',
    description: 'Sade Sati is the 7.5-year transit of Saturn through the 12th, 1st, and 2nd houses from your natal Moon, demanding structured self-reckoning, cleaning up old systems, and establishing disciplined routines.',
    remedies: {
      'behavioral': 'Simplify one area of your life each month and structure routines.',
      'mindfulness': 'Commit to silent meditation for 10 minutes at sunset.',
      'journaling': 'What habits are currently draining my productivity?',
    },
    severity: 'Significant',
  ),
  'Grahan Dosha': _DoshaDetail(
    name: 'Grahan Dosha',
    sanskrit: 'ग्रहणदोष',
    summary: 'Eclipse energy creates identity and emotional challenges',
    description: 'Grahan Dosha arises when the Sun or Moon is conjunct with Rahu or Ketu, casting temporary shadows on your emotional state and calling for identity clarification.',
    remedies: {
      'behavioral': 'Create a physical "grounding anchor" during intense emotional periods.',
      'mindfulness': 'Spend 10 minutes daily in Surya Namaskar.',
      'journaling': 'What truth is waiting to be revealed behind my current shadows?',
    },
    severity: 'Significant',
  ),
  'Shrapit Dosha': _DoshaDetail(
    name: 'Shrapit Dosha',
    sanskrit: 'श्रापितदोष',
    summary: 'Past life structures create obstacles seeking balance',
    description: 'Shrapit Dosha forms when Saturn and Rahu are conjunct or in mutual aspect. This signals a theme of persistent structural delays that are designed to teach patient resilience.',
    remedies: {
      'behavioral': 'When faced with an obstacle, document what patience lesson it teaches.',
      'mindfulness': 'Practice "karmic release" breathing exercises.',
      'journaling': 'What keeps blocking me, and how can I adapt instead of fighting?',
    },
    severity: 'Moderate',
  ),
};

// ─── Main Stateful Screen ────────────────────────────────────────────────────
class YogaDoshaScreen extends StatefulWidget {
  const YogaDoshaScreen({Key? key}) : super(key: key);

  @override
  State<YogaDoshaScreen> createState() => _YogaDoshaScreenState();
}

class _YogaDoshaScreenState extends State<YogaDoshaScreen> {
  String _activeTab = 'yogas'; // yogas, doshas, aspects, dignity, transit, nakshatra, analysis
  final Set<String> _expandedYogas = {};
  final Set<String> _expandedDoshas = {};
  bool _showAbsentYogas = false;
  bool _showAbsentDoshas = false;

  final Set<String> _expandedAspectPlanets = {};
  final Set<String> _expandedDignityPlanets = {};
  final Set<int> _expandedHouseLords = {};
  final Set<String> _expandedTransitPlanets = {};

  @override
  void initState() {
    super.initState();
    // Fetch vedic analysis in background once screen opens if not yet loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = Provider.of<AppState>(context, listen: false);
      if (state.vedicAnalysis == null && !state.isVedicAnalysisLoading) {
        state.fetchVedicAnalysis();
      }
    });
  }

  void _onTabChanged(String tabId) {
    setState(() {
      _activeTab = tabId;
    });
    final state = Provider.of<AppState>(context, listen: false);
    if (tabId != 'yogas' && tabId != 'doshas' && state.vedicAnalysis == null && !state.isVedicAnalysisLoading) {
      state.fetchVedicAnalysis();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final astro = state.astrologyData;

    final userYogas = (astro?.yogas ?? []).where((y) => _yogaDetails.containsKey(y)).toList();
    final userDoshas = (astro?.doshas ?? []).where((d) => _doshaDetails.containsKey(d)).toList();

    final absentYogas = _yogaDetails.keys.where((y) => !userYogas.contains(y)).toList();
    final absentDoshas = _doshaDetails.keys.where((d) => !userDoshas.contains(d)).toList();

    final needsAnalysis = _activeTab != 'yogas' && _activeTab != 'doshas';
    final analysisLoading = state.isVedicAnalysisLoading;
    final analysis = state.vedicAnalysis;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
          onPressed: () => state.setView('insights'),
        ),
        title: Text(
          "Yogas & Doshas Details",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: Column(
          children: [
            // Horizontal Tab Bar Selector
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: (isDark ? Colors.white : AppColors.brown900).withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? Colors.white10 : AppColors.brown800),
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      _buildTabChip('yogas', 'Yogas (${userYogas.length})', LucideIcons.sparkles),
                      _buildTabChip('doshas', 'Doshas (${userDoshas.length})', Icons.warning_amber_rounded),
                      _buildTabChip('aspects', 'Aspects', LucideIcons.arrow_left_right),
                      _buildTabChip('dignity', 'Dignity', LucideIcons.gem),
                      _buildTabChip('transit', 'Transit', LucideIcons.orbit),
                      _buildTabChip('nakshatra', 'Nakshatra', LucideIcons.moon),
                      _buildTabChip('analysis', 'Full', LucideIcons.book_open),
                    ],
                  ),
                ),
              ),
            ),

            // Tab View Body
            Expanded(
              child: needsAnalysis && analysisLoading
                  ? const Center(
                      child: CosmicLoader(message: "Analyzing celestial vectors..."),
                    )
                  : needsAnalysis && analysis == null
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.error_outline, color: AppColors.gold, size: 40),
                                const SizedBox(height: 12),
                                const Text(
                                  "Failed to load Vedic deep dive details.",
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppColors.brown700, fontSize: 14),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold),
                                  onPressed: () => state.fetchVedicAnalysis(),
                                  icon: const Icon(LucideIcons.refresh_cw, size: 14),
                                  label: const Text("Retry Connection"),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (_activeTab == 'yogas') _buildYogasTab(userYogas, absentYogas, isDark),
                              if (_activeTab == 'doshas') _buildDoshasTab(userDoshas, absentDoshas, isDark),
                              if (_activeTab == 'aspects' && analysis != null) _buildAspectsTab(analysis, isDark),
                              if (_activeTab == 'dignity' && analysis != null) _buildDignityTab(analysis, isDark),
                              if (_activeTab == 'transit' && analysis != null) _buildTransitTab(analysis, isDark),
                              if (_activeTab == 'nakshatra' && analysis != null) _buildNakshatraTab(analysis, isDark),
                              if (_activeTab == 'analysis' && analysis != null) _buildFullAnalysisTab(analysis, isDark),
                              const SizedBox(height: 40),
                            ],
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabChip(String id, String label, IconData icon) {
    final isSelected = _activeTab == id;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () => _onTabChanged(id),
      child: Container(
        margin: const EdgeInsets.only(right: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? Colors.white12 : Colors.white)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected && !isDark
              ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))]
              : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 12, color: isSelected ? AppColors.goldDark : AppColors.brown500),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected
                    ? (isDark ? Colors.white : AppColors.brown900)
                    : AppColors.brown500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── 1. Yogas Tab ───
  Widget _buildYogasTab(List<String> userYogas, List<String> absentYogas, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Astrological Blueprints",
                style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 6),
              Text(
                "Yogas are powerful structural geometries indicating integrated planetary talents and resources. They represent where parts of your mind work together in flow.",
                style: TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          "Your Active Yogas",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'Playfair Display',
            color: isDark ? Colors.white : AppColors.brown900,
          ),
        ),
        const SizedBox(height: 10),
        if (userYogas.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24.0),
            child: Text("No positive yogas detected in your planetary degrees.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
          )
        else
          ...userYogas.map((yName) => _buildYogaCard(yName, true, isDark)).toList(),
        
        if (absentYogas.isNotEmpty) ...[
          const SizedBox(height: 16),
          Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              title: Text(
                "Show Absent Yogas (${absentYogas.length})",
                style: const TextStyle(fontSize: 12, color: AppColors.brown500, fontWeight: FontWeight.bold),
              ),
              leading: const Icon(LucideIcons.chevron_down, size: 14, color: AppColors.brown500),
              children: absentYogas.map((yName) => _buildYogaCard(yName, false, isDark)).toList(),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildYogaCard(String yogaName, bool isPresent, bool isDark) {
    final state = Provider.of<AppState>(context, listen: false);
    final yoga = _yogaDetails[yogaName];
    if (yoga == null) return const SizedBox.shrink();
    final isExpanded = _expandedYogas.contains(yogaName);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
      ),
      elevation: 0,
      child: ExpansionTile(
        initiallyExpanded: isExpanded,
        onExpansionChanged: (expanded) {
          setState(() {
            if (expanded) {
              _expandedYogas.add(yogaName);
            } else {
              _expandedYogas.remove(yogaName);
            }
          });
        },
        title: Row(
          children: [
            Text(yoga.emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    yoga.name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13.5,
                      color: isDark ? Colors.white : AppColors.brown900,
                    ),
                  ),
                  Text(
                    yoga.sanskrit,
                    style: const TextStyle(fontSize: 10, color: AppColors.goldDark, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: isPresent
                ? AppColors.sage.withOpacity(0.12)
                : AppColors.brown500.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            isPresent ? "Present" : "Absent",
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: isPresent ? AppColors.sage : AppColors.brown500,
            ),
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                const SizedBox(height: 8),
                Text(
                  yoga.summary,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.sage),
                ),
                const SizedBox(height: 6),
                Text(
                  yoga.description,
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45),
                ),
                const SizedBox(height: 10),
                _buildCardParam("Planets", yoga.planets, isDark),
                _buildCardParam("Houses", yoga.houses, isDark),
                if (yoga.emotionalInterpretation.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Emotional Essence",
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          yoga.emotionalInterpretation,
                          style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown900, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
                if (isPresent) ...[
                  const SizedBox(height: 12),
                  const Divider(),
                  const SizedBox(height: 8),
                  _buildYogaAiSection(state, yogaName, isDark),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardParam(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("$label: ", style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.brown500)),
          Expanded(
            child: Text(value, style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white70 : AppColors.brown900)),
          ),
        ],
      ),
    );
  }

  // ─── 2. Doshas Tab ───
  Widget _buildDoshasTab(List<String> userDoshas, List<String> absentDoshas, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Karmic Scaffolding",
                style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 6),
              Text(
                "Doshas represent points of structural friction, calling for behavioral maturity and conscious adjustments rather than superstition.",
                style: TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          "Your Active Lessons",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'Playfair Display',
            color: isDark ? Colors.white : AppColors.brown900,
          ),
        ),
        const SizedBox(height: 10),
        if (userDoshas.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24.0),
            child: Text("No active doshas or karmic blockages identified in your chart.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
          )
        else
          ...userDoshas.map((dName) => _buildDoshaCard(dName, true, isDark)).toList(),
        
        if (absentDoshas.isNotEmpty) ...[
          const SizedBox(height: 16),
          Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              title: Text(
                "Show Absent Doshas (${absentDoshas.length})",
                style: const TextStyle(fontSize: 12, color: AppColors.brown500, fontWeight: FontWeight.bold),
              ),
              leading: const Icon(LucideIcons.chevron_down, size: 14, color: AppColors.brown500),
              children: absentDoshas.map((dName) => _buildDoshaCard(dName, false, isDark)).toList(),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDoshaCard(String doshaName, bool isPresent, bool isDark) {
    final state = Provider.of<AppState>(context, listen: false);
    final dosha = _doshaDetails[doshaName];
    if (dosha == null) return const SizedBox.shrink();
    final isExpanded = _expandedDoshas.contains(doshaName);

    Color sevColor = Colors.orange;
    if (dosha.severity == 'Significant') {
      sevColor = Colors.red;
    } else if (dosha.severity == 'Mild') {
      sevColor = Colors.green;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
      ),
      elevation: 0,
      child: ExpansionTile(
        initiallyExpanded: isExpanded,
        onExpansionChanged: (expanded) {
          setState(() {
            if (expanded) {
              _expandedDoshas.add(doshaName);
            } else {
              _expandedDoshas.remove(doshaName);
            }
          });
        },
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: AppColors.gold, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dosha.name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13.5,
                      color: isDark ? Colors.white : AppColors.brown900,
                    ),
                  ),
                  Text(
                    dosha.sanskrit,
                    style: const TextStyle(fontSize: 10, color: AppColors.goldDark, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: isPresent
                ? sevColor.withOpacity(0.12)
                : AppColors.brown500.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            isPresent ? dosha.severity : "Absent",
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: isPresent ? sevColor : AppColors.brown500,
            ),
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                const SizedBox(height: 8),
                Text(
                  dosha.summary,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                ),
                const SizedBox(height: 6),
                Text(
                  dosha.description,
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45),
                ),
                if (isPresent) ...[
                  const SizedBox(height: 12),
                  const Text(
                    "Behavioral Remedies:",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.sage),
                  ),
                  const SizedBox(height: 6),
                  _buildRemedyRow("🔧 Behavioral", dosha.remedies['behavioral'] ?? '', isDark),
                  _buildRemedyRow("🧘 Mindfulness", dosha.remedies['mindfulness'] ?? '', isDark),
                  _buildRemedyRow("📝 Journaling", dosha.remedies['journaling'] ?? '', isDark),
                  const SizedBox(height: 12),
                  const Divider(),
                  const SizedBox(height: 8),
                  _buildDoshaAiSection(state, doshaName, isDark),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRemedyRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("$label: ", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.brown500)),
          Expanded(
            child: Text(value, style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown900, height: 1.3)),
          ),
        ],
      ),
    );
  }

  // ─── 3. Aspects Tab ───
  Widget _buildAspectsTab(Map<String, dynamic> analysis, bool isDark) {
    final aspectsList = (analysis['planetaryAspects'] as List<dynamic>? ?? []);
    final activeAspects = aspectsList.where((pa) => (pa['aspects'] as List).isNotEmpty).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          "Planetary Aspects (Drishti)",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 6),
        const Text(
          "Vedic aspects are specific: Mars aspects 4th/7th/8th houses from itself; Jupiter 5th/7th/9th; Saturn 3rd/7th/10th; others aspect the 7th house.",
          style: TextStyle(color: AppColors.brown500, fontSize: 11.5, height: 1.4),
        ),
        const SizedBox(height: 14),
        if (activeAspects.isEmpty)
          const Text("No active planetary aspects computed.")
        else
          ...activeAspects.map((pa) {
            final String planet = pa['planet'] ?? '';
            final String sign = pa['sign'] ?? '';
            final int house = pa['house'] ?? 1;
            final List aspects = pa['aspects'] as List;
            final isExpanded = _expandedAspectPlanets.contains(planet);

            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
              ),
              elevation: 0,
              child: ExpansionTile(
                initiallyExpanded: isExpanded,
                onExpansionChanged: (expanded) {
                  setState(() {
                    if (expanded) {
                      _expandedAspectPlanets.add(planet);
                    } else {
                      _expandedAspectPlanets.remove(planet);
                    }
                  });
                },
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        planet.substring(0, math.min(2, planet.length)),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(planet, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? Colors.white : AppColors.brown900)),
                          Text("in $sign (House $house)", style: const TextStyle(fontSize: 10.5, color: AppColors.brown500)),
                        ],
                      ),
                    ),
                  ],
                ),
                trailing: Text(
                  "${aspects.length} Aspect${aspects.length != 1 ? 's' : ''}",
                  style: const TextStyle(fontSize: 11, color: AppColors.goldDark, fontWeight: FontWeight.bold),
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Column(
                      children: [
                        const Divider(),
                        ...aspects.map((aspect) {
                          final targetPlanet = aspect['targetPlanet'] ?? '';
                          final targetSign = aspect['targetSign'] ?? '';
                          final targetHouse = aspect['targetHouse'] ?? 1;
                          final aspectType = aspect['aspectType'] ?? '';
                          final interpretation = aspect['interpretation'] ?? '';

                          return Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: (isDark ? Colors.white : AppColors.brown900).withOpacity(0.04),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "$planet ➜ $targetPlanet (in H$targetHouse)",
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown900),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: AppColors.gold.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        aspectType,
                                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  interpretation,
                                  style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : AppColors.brown700, height: 1.4),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
      ],
    );
  }

  // ─── 4. Dignity & Strength Tab ───
  Widget _buildDignityTab(Map<String, dynamic> analysis, bool isDark) {
    final shadbala = (analysis['shadbala'] as List<dynamic>? ?? []);
    final dignityDetails = (analysis['dignityDetails'] as List<dynamic>? ?? []);
    final houseLords = (analysis['enhancedHouseLordAnalysis'] as List<dynamic>? ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          "Shadbala Strength Ranking",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        // Shadbala progress bars
        GlassLightCard(
          child: Column(
            children: List.generate(shadbala.length, (idx) {
              final sb = shadbala[idx];
              final String planet = sb['planet'] ?? '';
              final String sign = sb['sign'] ?? '';
              final double strength = (sb['totalStrength'] as num?)?.toDouble() ?? 0.0;
              final String rating = sb['strengthRating'] ?? '';
              final barWidth = math.min(1.0, strength / 8.0);

              Color barColor = AppColors.gold;
              if (strength >= 5.5) {
                barColor = AppColors.sage;
              } else if (strength >= 4.0) {
                barColor = AppColors.gold;
              } else if (strength >= 2.5) {
                barColor = Colors.orange;
              } else {
                barColor = Colors.red;
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("$planet ($sign)", style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                        Row(
                          children: [
                            Text("${strength.toStringAsFixed(1)}/8 ", style: const TextStyle(fontSize: 10.5, color: AppColors.brown500)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: barColor.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                rating,
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: barColor),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: barWidth,
                        minHeight: 5,
                        color: barColor,
                        backgroundColor: isDark ? Colors.white12 : AppColors.brown100,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          "Dignity Details",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        ...dignityDetails.map((dd) {
          final String planet = dd['planet'] ?? '';
          final String sign = dd['sign'] ?? '';
          final double degree = (dd['degree'] as num?)?.toDouble() ?? 0.0;
          final String dignity = dd['dignity'] ?? '';
          final isRetrograde = dd['isRetrograde'] ?? false;
          final isCombust = dd['isCombust'] ?? false;
          final interpretation = dd['interpretation'] ?? '';
          final relation = dd['signRelationship'] ?? '';
          final ownSigns = (dd['ownSigns'] as List? ?? []).join(', ');
          final moola = dd['moolatrikonaSign'] ?? 'N/A';
          final isExpanded = _expandedDignityPlanets.contains(planet);

          Color digColor = AppColors.brown500;
          if (dignity == 'Exalted') digColor = AppColors.sage;
          if (dignity == 'Own Sign') digColor = Colors.blue;
          if (dignity == 'Moolatrikona') digColor = Colors.teal;
          if (dignity == 'Debilitated') digColor = Colors.red;

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
            ),
            elevation: 0,
            child: ExpansionTile(
              initiallyExpanded: isExpanded,
              onExpansionChanged: (expanded) {
                setState(() {
                  if (expanded) {
                    _expandedDignityPlanets.add(planet);
                  } else {
                    _expandedDignityPlanets.remove(planet);
                  }
                });
              },
              title: Row(
                children: [
                  Text(planet, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? Colors.white : AppColors.brown900)),
                  const SizedBox(width: 8),
                  Text("$sign ${degree.toStringAsFixed(1)}°", style: const TextStyle(fontSize: 11, color: AppColors.brown500)),
                  if (isRetrograde) ...[
                    const SizedBox(width: 4),
                    const Text("℞", style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                  if (isCombust) ...[
                    const SizedBox(width: 4),
                    const Text("C", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 10)),
                  ],
                ],
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: digColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                child: Text(dignity, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: digColor)),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(),
                      Text(interpretation, style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.4)),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(child: _buildDignityBox("Exalted Sign", "${dd['exaltedSign']} ${dd['exaltedDegree']}°", AppColors.sage, isDark)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildDignityBox("Debilitated", "${dd['debilitatedSign']} ${dd['debilitatedDegree']}°", Colors.red, isDark)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(child: _buildDignityBox("Moolatrikona", moola, Colors.teal, isDark)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildDignityBox("Own Signs", ownSigns, Colors.blue, isDark)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: (relation == 'Friendly' ? Colors.green : relation == 'Enemy' ? Colors.red : Colors.orange).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              "Relationship: $relation",
                              style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: relation == 'Friendly' ? Colors.green : relation == 'Enemy' ? Colors.red : Colors.orange),
                            ),
                          ),
                          if (dd['distanceFromSun'] != null) ...[
                            const SizedBox(width: 12),
                            Text("${(dd['distanceFromSun'] as num).toStringAsFixed(1)}° from Sun", style: const TextStyle(fontSize: 9.5, color: AppColors.brown500)),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
        const SizedBox(height: 20),
        const Text(
          "House Lord Placements",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        ...houseLords.map((hl) {
          final int houseNum = hl['houseNumber'] ?? 1;
          final String houseName = hl['houseName'] ?? '';
          final String lord = hl['lord'] ?? '';
          final int lordHouse = hl['lordHouse'] ?? 1;
          final String lordDignity = hl['lordDignity'] ?? '';
          final String lordRelation = hl['lordSignRelationship'] ?? '';
          final String type = hl['lordHouseType'] ?? '';
          final String interpretation = hl['interpretation'] ?? '';
          final isExpanded = _expandedHouseLords.contains(houseNum);

          Color houseColor = AppColors.brown500;
          if (type.contains('Kendra')) houseColor = Colors.blue;
          if (type.contains('Trikona')) houseColor = AppColors.sage;
          if (type.contains('Dushtana')) houseColor = Colors.red;

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
            ),
            elevation: 0,
            child: ExpansionTile(
              initiallyExpanded: isExpanded,
              onExpansionChanged: (expanded) {
                setState(() {
                  if (expanded) {
                    _expandedHouseLords.add(houseNum);
                  } else {
                    _expandedHouseLords.remove(houseNum);
                  }
                });
              },
              title: Row(
                children: [
                  Text("H$houseNum", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.goldDark)),
                  const SizedBox(width: 8),
                  Text(houseName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? Colors.white : AppColors.brown900)),
                ],
              ),
              subtitle: Text("Lord $lord in House $lordHouse", style: TextStyle(fontSize: 11, color: houseColor, fontWeight: FontWeight.bold)),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: houseColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                            child: Text(type, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: houseColor)),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                            child: Text(lordDignity, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(interpretation, style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.4)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildDignityBox(String label, String value, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 8.5, color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 10, color: isDark ? Colors.white70 : AppColors.brown900)),
        ],
      ),
    );
  }

  // ─── 5. Transit Tab ───
  Widget _buildTransitTab(Map<String, dynamic> analysis, bool isDark) {
    final ct = analysis['currentTransitInfluence'];
    final sadeSati = ct['sadeSatiStatus'];
    final dhaiya = ct['dhaiyaStatus'];
    final jupTransit = ct['jupiterTransitToMoon'];
    final transits = (ct['transits'] as List<dynamic>? ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          "Current Transit Influence",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display', color: isDark ? Colors.white : AppColors.brown900),
        ),
        Text("Transit calculations as of ${ct['transitDate']}", style: const TextStyle(fontSize: 10, color: AppColors.brown500)),
        const SizedBox(height: 12),
        // Sade Sati Status Cards
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: sadeSati['isActive'] == true ? Colors.red.withOpacity(0.08) : Colors.green.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: sadeSati['isActive'] == true ? Colors.red.withOpacity(0.2) : Colors.green.withOpacity(0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("SADE SATI", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.brown500)),
                    const SizedBox(height: 4),
                    Text(
                      sadeSati['isActive'] == true ? "Active" : "Not Active",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: sadeSati['isActive'] == true ? Colors.red : Colors.green),
                    ),
                    if (sadeSati['isActive'] == true) ...[
                      const SizedBox(height: 4),
                      Text(sadeSati['phase'] ?? '', style: const TextStyle(fontSize: 9.5, color: AppColors.brown700)),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: dhaiya['isActive'] == true ? Colors.orange.withOpacity(0.08) : Colors.green.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: dhaiya['isActive'] == true ? Colors.orange.withOpacity(0.2) : Colors.green.withOpacity(0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("SATURN DHAIYA", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.brown500)),
                    const SizedBox(height: 4),
                    Text(
                      dhaiya['isActive'] == true ? "Active" : "Not Active",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: dhaiya['isActive'] == true ? Colors.orange : Colors.green),
                    ),
                    const SizedBox(height: 4),
                    const Text("Saturn 2.5 year transit", style: TextStyle(fontSize: 9.5, color: AppColors.brown700)),
                  ],
                ),
              ),
            ),
          ],
        ),
        if (sadeSati['isActive'] == true) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.red.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
            child: Text(sadeSati['description'] ?? '', style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.35)),
          ),
        ],
        if (dhaiya['isActive'] == true) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.orange.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
            child: Text(dhaiya['description'] ?? '', style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.35)),
          ),
        ],
        const SizedBox(height: 12),
        // Jupiter Transit Box
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.gold.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.gold.withOpacity(0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.compass, size: 16, color: AppColors.goldDark),
                  const SizedBox(width: 8),
                  Text(
                    "Jupiter Transit to Natal Moon (${jupTransit['house']} House)",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown900),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(jupTransit['description'] ?? '', style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown900, height: 1.45)),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          "All Planetary Transits",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        ...transits.map((tr) {
          final String planet = tr['planet'] ?? '';
          final String sign = tr['transitSign'] ?? '';
          final int house = tr['transitHouse'] ?? 1;
          final String aspect = tr['natalAspect'] ?? '';
          final String influence = tr['influence'] ?? '';
          final bool isMajor = tr['isMajor'] ?? false;
          final isExpanded = _expandedTransitPlanets.contains(planet);

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
            ),
            elevation: 0,
            child: ExpansionTile(
              initiallyExpanded: isExpanded,
              onExpansionChanged: (expanded) {
                setState(() {
                  if (expanded) {
                    _expandedTransitPlanets.add(planet);
                  } else {
                    _expandedTransitPlanets.remove(planet);
                  }
                });
              },
              title: Row(
                children: [
                  Container(
                    width: 8, height: 8,
                    decoration: BoxDecoration(color: isMajor ? AppColors.gold : AppColors.brown400, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  Text(planet, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? Colors.white : AppColors.brown900)),
                  const SizedBox(width: 6),
                  Text("in $sign (House $house)", style: const TextStyle(fontSize: 10.5, color: AppColors.brown500)),
                ],
              ),
              trailing: isMajor
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                      decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                      child: const Text("Major", style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                    )
                  : null,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(),
                      Text(aspect, style: const TextStyle(fontSize: 10.5, color: AppColors.brown500, fontStyle: FontStyle.italic)),
                      const SizedBox(height: 4),
                      Text(influence, style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  // ─── 6. Nakshatra Details Tab ───
  Widget _buildNakshatraTab(Map<String, dynamic> analysis, bool isDark) {
    final np = analysis['nakshatraPersonality'];
    final nc = analysis['nakshatraCompatibility'];
    final List traits = np['personalityTraits'] as List? ?? [];
    final List compatNotes = nc['compatibilityNotes'] as List? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          "Nakshatra Personality",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        Card(
          color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
          ),
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "${np['nakshatra']} (Pada ${np['pada']})",
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown900),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: Colors.purple.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text("Ruler: ${np['ruler']}", style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.purple)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text("Deity: ${np['deity']}  |  Symbol: ${np['symbol']}  |  Gana: ${np['gana']}", style: const TextStyle(fontSize: 10.5, color: AppColors.brown500)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: traits.map((tr) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.purple.withOpacity(0.06), borderRadius: BorderRadius.circular(12)),
                        child: Text(tr.toString(), style: const TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold)),
                      )).toList(),
                ),
                const SizedBox(height: 12),
                Text(np['emotionalNature'] ?? '', style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.purple.withOpacity(0.04), borderRadius: BorderRadius.circular(10)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(LucideIcons.heart, size: 14, color: Colors.purple),
                          SizedBox(width: 6),
                          Text("Life Purpose Essence", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.purple)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(np['lifePurpose'] ?? '', style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : AppColors.brown900, height: 1.4)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          "Nakshatra Compatibility (Koota)",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        Card(
          color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
          ),
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Based on your Moon Nakshatra (${nc['nakshatra']})", style: const TextStyle(fontSize: 11, color: AppColors.brown500)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildCompatMetric("Yoni", nc['yoni'] ?? '', Colors.pink)),
                    const SizedBox(width: 8),
                    Expanded(child: _buildCompatMetric("Gana", nc['gana'] ?? '', Colors.purple)),
                    const SizedBox(width: 8),
                    Expanded(child: _buildCompatMetric("Nadi", (nc['nadi'] ?? '').split(' ')[0], Colors.teal)),
                  ],
                ),
                const SizedBox(height: 14),
                _buildCompatDescRow("Yoni (Animal Nature)", nc['yoniDescription'] ?? '', Colors.pink, isDark),
                _buildCompatDescRow("Gana (Temperament)", nc['ganaDescription'] ?? '', Colors.purple, isDark),
                _buildCompatDescRow("Nadi (Constitution)", nc['nadiDescription'] ?? '', Colors.teal, isDark),
                if (compatNotes.isNotEmpty) ...[
                  const Divider(),
                  const SizedBox(height: 8),
                  const Text("Relational Synthesis Notes", style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                  const SizedBox(height: 6),
                  ...compatNotes.map((note) => Padding(
                        padding: const EdgeInsets.only(bottom: 6.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("✦ ", style: TextStyle(color: AppColors.gold, fontSize: 12)),
                            Expanded(child: Text(note.toString(), style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.35))),
                          ],
                        ),
                      )).toList(),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCompatMetric(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCompatDescRow(String label, String description, Color color, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: color.withOpacity(0.03), borderRadius: BorderRadius.circular(8)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 9.5, color: color, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(description, style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.4)),
          ],
        ),
      ),
    );
  }

  // ─── 7. Full Analysis Tab ───
  Widget _buildFullAnalysisTab(Map<String, dynamic> analysis, bool isDark) {
    final summary = analysis['summary'];
    final ascLord = analysis['ascendantLordAnalysis'];
    final dasha = analysis['dashaInterpretation'];
    final strengths = (analysis['planetaryStrengths'] as List<dynamic>? ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Chart Strength Summary Box
        Card(
          color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
          ),
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(LucideIcons.crown, color: AppColors.gold, size: 24),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("OVERALL CHART STRENGTH", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.brown500)),
                        Text(
                          summary['overallChartStrength'] ?? '',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.goldDark, fontFamily: 'Playfair Display'),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildSummaryItem("Active Yogas", summary['presentYogas'].toString(), "${summary['strongYogas']} Strong")),
                    const SizedBox(width: 8),
                    Expanded(child: _buildSummaryItem("Active Doshas", summary['presentDoshas'].toString(), "${summary['highSeverityDoshas']} Major")),
                    const SizedBox(width: 8),
                    Expanded(child: _buildSummaryItem("Calculation", "Vedic", "Meeus Engine")),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Ascendant Lord Analysis
        Card(
          color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
          ),
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.sun, color: AppColors.gold, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      "Ascendant Lord Analysis",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown900, fontFamily: 'Playfair Display'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                      child: Text("Ascendant: ${ascLord['ascendant']}", style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.sage.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                      child: Text("Lord: ${ascLord['lord']} in H${ascLord['lordHouse']}", style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.sage)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  ascLord['analysis'] ?? '',
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Dasha Card
        Card(
          color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
          ),
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.circle_dot, color: AppColors.gold, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      "Active Vimshottari Dasha Period",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown900, fontFamily: 'Playfair Display'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.teal.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                      child: Text("Mahadasha: ${dasha['mahadashaPlanet']}", style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.teal)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.teal.withOpacity(0.06), borderRadius: BorderRadius.circular(6)),
                      child: Text("Antardasha: ${dasha['antardashaPlanet']}", style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.teal)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  dasha['interpretation'] ?? '',
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.45),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: (dasha['areasAffected'] as List? ?? []).map((area) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.teal.withOpacity(0.06), borderRadius: BorderRadius.circular(10)),
                        child: Text(area.toString(), style: const TextStyle(fontSize: 9.5, color: Colors.teal, fontWeight: FontWeight.bold)),
                      )).toList(),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          "Natal Planetary Summary",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
        ),
        const SizedBox(height: 10),
        ...strengths.map((ps) {
          final String planet = ps['planet'] ?? '';
          final String sign = ps['sign'] ?? '';
          final String deg = ps['degree'] ?? '';
          final int house = ps['house'] ?? 1;
          final String strength = ps['strength'] ?? '';
          final isRetro = ps['isRetrograde'] ?? false;
          final isCombust = ps['isCombust'] ?? false;
          final analysisText = ps['analysis'] ?? '';

          Color strColor = AppColors.brown500;
          if (strength == 'Strong' || strength == 'Very Strong') strColor = AppColors.sage;
          if (strength == 'Moderate') strColor = AppColors.gold;
          if (strength == 'Weak' || strength == 'Very Weak') strColor = Colors.red;

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard.withOpacity(0.85) : Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isDark ? Colors.white10 : AppColors.brown100),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(planet, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? Colors.white : AppColors.brown900)),
                        const SizedBox(width: 6),
                        Text("in $sign H$house", style: const TextStyle(fontSize: 11, color: AppColors.brown500)),
                        if (isRetro) ...[
                          const SizedBox(width: 4),
                          const Text("℞", style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                        if (isCombust) ...[
                          const SizedBox(width: 4),
                          const Text("C", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 10)),
                        ],
                      ],
                    ),
                    Text(strength, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: strColor)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(analysisText, style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white60 : AppColors.brown700, height: 1.45)),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildSummaryItem(String label, String value, String sub) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.gold.withOpacity(0.04),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 9.5, color: AppColors.brown500, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.goldDark)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(fontSize: 8.5, color: AppColors.brown400)),
        ],
      ),
    );
  }

  Widget _buildYogaAiSection(AppState state, String yogaName, bool isDark) {
    final hasAnalysis = state.yogaAiAnalysis.containsKey(yogaName);
    final isLoading = state.isYogaAiLoading(yogaName);

    if (isLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0),
        child: Column(
          children: [
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
            ),
            const SizedBox(height: 8),
            Text(
              "Consulting cosmic counselor AI...",
              style: TextStyle(fontSize: 10, color: isDark ? Colors.white60 : AppColors.brown500, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    if (!hasAnalysis) {
      return Center(
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: isDark ? AppColors.darkCard : Colors.white,
            foregroundColor: AppColors.goldDark,
            side: const BorderSide(color: AppColors.gold, width: 1.0),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
          icon: const Icon(LucideIcons.sparkles, size: 14, color: AppColors.gold),
          label: const Text("Analyze Placement with Deep AI", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          onPressed: () async {
            try {
              await state.generateYogaAiAnalysis(yogaName);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("AI Consultation failed: $e"), backgroundColor: Colors.redAccent),
                );
              }
            }
          },
        ),
      );
    }

    final analysisText = state.yogaAiAnalysis[yogaName] ?? '';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.gold.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.sparkles, color: AppColors.gold, size: 14),
              const SizedBox(width: 6),
              Text(
                "Deep AI Insights",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : AppColors.goldDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          AstroMarkdownText(
            text: analysisText,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.45,
              color: isDark ? Colors.white70 : AppColors.brown700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDoshaAiSection(AppState state, String doshaName, bool isDark) {
    final hasAnalysis = state.doshaAiAnalysis.containsKey(doshaName);
    final isLoading = state.isDoshaAiLoading(doshaName);

    if (isLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0),
        child: Column(
          children: [
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
            ),
            const SizedBox(height: 8),
            Text(
              "Consulting cosmic counselor AI...",
              style: TextStyle(fontSize: 10, color: isDark ? Colors.white60 : AppColors.brown500, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    if (!hasAnalysis) {
      return Center(
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: isDark ? AppColors.darkCard : Colors.white,
            foregroundColor: AppColors.goldDark,
            side: const BorderSide(color: AppColors.gold, width: 1.0),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
          icon: const Icon(LucideIcons.sparkles, size: 14, color: AppColors.gold),
          label: const Text("Analyze Lesson with Deep AI", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          onPressed: () async {
            try {
              await state.generateDoshaAiAnalysis(doshaName);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("AI Consultation failed: $e"), backgroundColor: Colors.redAccent),
                );
              }
            }
          },
        ),
      );
    }

    final analysisText = state.doshaAiAnalysis[doshaName] ?? '';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.gold.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.sparkles, color: AppColors.gold, size: 14),
              const SizedBox(width: 6),
              Text(
                "Deep AI Insights",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : AppColors.goldDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          AstroMarkdownText(
            text: analysisText,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.45,
              color: isDark ? Colors.white70 : AppColors.brown700,
            ),
          ),
        ],
      ),
    );
  }
}
