import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../widgets/custom_widgets.dart';
import '../widgets/kundali_chart.dart';

class ComprehensiveKundaliScreen extends StatefulWidget {
  const ComprehensiveKundaliScreen({Key? key}) : super(key: key);

  @override
  State<ComprehensiveKundaliScreen> createState() => _ComprehensiveKundaliScreenState();
}

class _ComprehensiveKundaliScreenState extends State<ComprehensiveKundaliScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String? _error;
  int _activeSection = 0;
  final Set<int> _openSections = {0};
  final Set<int> _viewedSections = {0};

  static const List<Map<String, String>> _sections = [
    {'key': 'personalityBlueprint', 'label': 'Personality', 'emoji': '🧠', 'sub': 'How your stars shape who you are'},
    {'key': 'karmaPatterns', 'label': 'Life Patterns', 'emoji': '♻️', 'sub': 'Repeating themes in your life journey'},
    {'key': 'careerDharma', 'label': 'Career & Money', 'emoji': '💼', 'sub': 'Your professional strengths and path'},
    {'key': 'marriageDynamics', 'label': 'Love & Relationships', 'emoji': '💕', 'sub': 'How you connect with partners'},
    {'key': 'healthTendencies', 'label': 'Health & Wellness', 'emoji': '💊', 'sub': "Your body's natural tendencies"},
    {'key': 'timingEvents', 'label': 'Life Timing', 'emoji': '⏳', 'sub': 'Current and upcoming life phases'},
    {'key': 'spiritualEvolution', 'label': 'Inner Growth', 'emoji': '👁️', 'sub': 'Your spiritual journey and lessons'},
    {'key': 'familyKarma', 'label': 'Family & Home', 'emoji': '👨‍👩‍👧‍👦', 'sub': 'Patterns from your family background'},
    {'key': 'hiddenPatterns', 'label': 'Hidden Strengths', 'emoji': '🛡️', 'sub': 'Secret powers and blind spots'},
    {'key': 'rareYogas', 'label': 'Special Combinations', 'emoji': '⭐', 'sub': 'Unique planetary alignments'},
    {'key': 'divisionalCharts', 'label': 'Deep Charts', 'emoji': '📊', 'sub': 'Detailed views of specific life areas'},
    {'key': 'nakshatraDeepAnalysis', 'label': 'Star Analysis', 'emoji': '🌙', 'sub': "Your birth star's deep influence"},
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final state = Provider.of<AppState>(context, listen: false);
    if (state.userId == null) {
      setState(() { _error = 'No user ID found. Please complete onboarding first.'; _loading = false; });
      return;
    }
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/api/astrology/comprehensive-kundali'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': state.userId}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        setState(() { _data = jsonDecode(response.body); _loading = false; });
      } else {
        setState(() { _error = 'API error: ${response.statusCode}'; _loading = false; });
      }
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _toggleSection(int idx) {
    setState(() {
      if (_openSections.contains(idx)) {
        _openSections.remove(idx);
      } else {
        _openSections.add(idx);
      }
      _viewedSections.add(idx);
      _activeSection = idx;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);

    if (_loading) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 80, height: 80,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold),
                ),
              ),
              const SizedBox(height: 24),
              Text('Analyzing Your Birth Chart', style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 20, fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.brown900,
              )),
              const SizedBox(height: 8),
              Text('Mapping 12 areas of your life through the stars...', style: TextStyle(
                fontSize: 14, color: isDark ? Colors.white54 : AppColors.brown500,
              )),
            ],
          ),
        ),
      );
    }

    if (_error != null || _data == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                const SizedBox(height: 16),
                Text('Unable to Load Analysis', style: TextStyle(
                  fontFamily: 'Playfair Display', fontSize: 20, fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.brown900,
                )),
                const SizedBox(height: 8),
                Text(_error ?? 'Unknown error', textAlign: TextAlign.center, style: TextStyle(
                  fontSize: 14, color: isDark ? Colors.white54 : AppColors.brown500,
                )),
                const SizedBox(height: 24),
                NeonGoldButton(text: '← Back to Insights', onPressed: () => state.setView('insights')),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: CustomScrollView(
        slivers: [
          // Sticky header
          SliverAppBar(
            floating: true,
            pinned: true,
            backgroundColor: (isDark ? AppColors.darkBg : AppColors.cream).withOpacity(0.95),
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
              onPressed: () => state.setView('insights'),
            ),
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Your Complete Birth Chart', style: TextStyle(
                  fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.brown900,
                )),
                Text('12 Areas of Your Life, Mapped by the Stars', style: TextStyle(
                  fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                )),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${_viewedSections.length}/12', style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.gold,
                    )),
                    Text('sections', style: TextStyle(
                      fontSize: 10, color: isDark ? Colors.white38 : AppColors.brown400,
                    )),
                  ],
                ),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(60),
              child: Column(
                children: [
                  // Progress bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _viewedSections.length / 12,
                        backgroundColor: isDark ? Colors.white12 : AppColors.brown100,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
                        minHeight: 4,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Scrollable section tabs
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: _sections.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 6),
                      itemBuilder: (context, i) {
                        final sec = _sections[i];
                        final isActive = i == _activeSection;
                        final isViewed = _viewedSections.contains(i);
                        return GestureDetector(
                          onTap: () => _toggleSection(i),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? AppColors.gold.withOpacity(0.2)
                                  : isViewed
                                      ? (isDark ? Colors.white10 : AppColors.brown100.withOpacity(0.5))
                                      : Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                              border: isActive
                                  ? Border.all(color: AppColors.gold.withOpacity(0.3))
                                  : null,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(sec['emoji']!, style: const TextStyle(fontSize: 12)),
                                const SizedBox(width: 4),
                                Text(sec['label']!, style: TextStyle(
                                  fontSize: 10, fontWeight: FontWeight.w600,
                                  color: isActive ? AppColors.gold
                                      : (isDark ? Colors.white54 : AppColors.brown500),
                                )),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),

          // Birth Details Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: _buildBirthDetailsCard(state, isDark),
            ),
          ),

          // Birth Chart
          if (state.astrologyData != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: GlassPremiumCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.grid_3x3, color: AppColors.gold, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Birth Chart', style: TextStyle(
                                fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : AppColors.brown900,
                              )),
                              Text('North Indian Style', style: TextStyle(
                                fontSize: 10, letterSpacing: 1, color: isDark ? Colors.white38 : AppColors.brown400,
                              )),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      AspectRatio(
                        aspectRatio: 460 / 710,
                        child: KundaliChart(
                          planetaryPositions: state.astrologyData!.planetaryPositions,
                          ascendant: state.astrologyData!.ascendant,
                          sunSign: state.astrologyData!.sunSign,
                          moonSign: state.astrologyData!.moonSign,
                          birthDetails: state.birthDetails,
                          nakshatra: state.astrologyData!.nakshatra,
                          compact: false,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Key Highlights
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: _buildKeyHighlights(isDark),
            ),
          ),

          // Sections
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final sec = _sections[i];
                final key = sec['key']!;
                final sectionData = _data![key] as Map<String, dynamic>? ?? {};
                final isOpen = _openSections.contains(i);

                return Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: GlassPremiumCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        InkWell(
                          onTap: () => _toggleSection(i),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Text(sec['emoji']!, style: const TextStyle(fontSize: 24)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(sec['label']!, style: TextStyle(
                                        fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold,
                                        color: isDark ? Colors.white : AppColors.brown900,
                                      )),
                                      const SizedBox(height: 2),
                                      Text(sec['sub']!, style: TextStyle(
                                        fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                                      )),
                                    ],
                                  ),
                                ),
                                Icon(isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                  color: isDark ? Colors.white38 : AppColors.brown400),
                              ],
                            ),
                          ),
                        ),
                        if (isOpen) ...[
                          Divider(height: 1, color: isDark ? Colors.white10 : AppColors.brown100),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: _buildSectionContent(key, sectionData, isDark),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
              childCount: _sections.length,
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }

  Widget _buildBirthDetailsCard(AppState state, bool isDark) {
    final birth = state.birthDetails;
    final astro = state.astrologyData;
    final items = <Map<String, String>>[];

    if (birth?.name != null && birth!.name.isNotEmpty) {
      items.add({'label': 'Name', 'value': birth.name});
    }
    if (birth?.dateOfBirth != null && birth!.dateOfBirth.isNotEmpty) {
      items.add({'label': 'Date of Birth', 'value': birth.dateOfBirth});
    }
    if (birth?.timeOfBirth != null && birth!.timeOfBirth.isNotEmpty) {
      items.add({'label': 'Time of Birth', 'value': birth.timeOfBirth});
    }
    if (birth?.placeOfBirth != null && birth!.placeOfBirth.isNotEmpty) {
      items.add({'label': 'Place of Birth', 'value': birth.placeOfBirth});
    }

    return GlassPremiumCard(
      borderShimmer: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Gold accent bar
          Container(
            height: 4, width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              gradient: const LinearGradient(colors: [AppColors.gold, AppColors.goldDark, AppColors.gold]),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.auto_awesome, color: AppColors.gold, size: 20),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Birth Details', style: TextStyle(
                    fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  )),
                  Text('The foundation of your birth chart', style: TextStyle(
                    fontSize: 10, letterSpacing: 1, color: isDark ? Colors.white38 : AppColors.brown400,
                  )),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: items.map((item) => Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['label']!, style: TextStyle(
                    fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1,
                    color: isDark ? Colors.white38 : AppColors.brown400,
                  )),
                  const SizedBox(height: 4),
                  Text(item['value']!, style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : AppColors.brown900,
                  )),
                ],
              ),
            )).toList(),
          ),
          if (astro != null) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                _cosmicBadge('☉ ${astro.sunSign}', isDark),
                const SizedBox(width: 8),
                _cosmicBadge('☽ ${astro.moonSign}', isDark),
                const SizedBox(width: 8),
                _cosmicBadge('↑ ${astro.ascendant}', isDark),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _cosmicBadge(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.gold.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.gold.withOpacity(0.25)),
      ),
      child: Text(text, style: TextStyle(
        fontSize: 11, fontWeight: FontWeight.w600,
        color: isDark ? AppColors.goldLight : AppColors.goldDark,
      )),
    );
  }

  Widget _buildKeyHighlights(bool isDark) {
    final highlights = <Map<String, String>>[];

    final pb = _data?['personalityBlueprint'] as Map<String, dynamic>? ?? {};
    if (pb['personalityArchetype'] != null) {
      highlights.add({
        'icon': '🧠',
        'title': '${pb['personalityArchetype']} Archetype',
        'desc': (pb['archetypeDescription'] ?? 'Your core personality pattern').toString().split('.').first + '.',
      });
    }
    final te = _data?['timingEvents'] as Map<String, dynamic>? ?? {};
    if (te['currentMahadasha'] != null) {
      highlights.add({
        'icon': '⏳',
        'title': '${te['currentMahadasha']} Dasha',
        'desc': (te['dashaInterpretation'] ?? 'Current planetary period').toString().split('.').first + '.',
      });
    }
    final ry = _data?['rareYogas'] as Map<String, dynamic>? ?? {};
    if (ry['detectedYogas'] is List) {
      final present = (ry['detectedYogas'] as List).where((y) => y['present'] == true).toList();
      if (present.isNotEmpty) {
        highlights.add({
          'icon': '⭐',
          'title': '${present.length} Yoga${present.length > 1 ? 's' : ''} Detected',
          'desc': present.map((y) => y['name']).join(', '),
        });
      }
    }

    if (highlights.isEmpty) {
      highlights.add({'icon': '✨', 'title': 'Full Analysis Ready', 'desc': '12 areas of your life mapped by the stars'});
    }

    return SizedBox(
      height: 110,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: highlights.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final h = highlights[i];
          return Container(
            width: 200,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.gold.withOpacity(0.12), AppColors.gold.withOpacity(0.04)],
                begin: Alignment.topLeft, end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.gold.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(h['icon']!, style: const TextStyle(fontSize: 22)),
                const SizedBox(height: 6),
                Text(h['title']!, style: TextStyle(
                  fontFamily: 'Playfair Display', fontSize: 13, fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.goldLight : AppColors.goldDark,
                )),
                const SizedBox(height: 4),
                Expanded(
                  child: Text(h['desc']!, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(
                    fontSize: 11, color: isDark ? Colors.white54 : AppColors.brown700,
                  )),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionContent(String key, Map<String, dynamic> data, bool isDark) {
    if (data.isEmpty) {
      return Text('Section data not available.', style: TextStyle(
        fontSize: 13, color: isDark ? Colors.white54 : AppColors.brown500,
      ));
    }

    final widgets = <Widget>[];

    switch (key) {
      case 'personalityBlueprint':
        if (data['personalityArchetype'] != null) {
          widgets.add(_archetypeCard(data['personalityArchetype'], data['archetypeDescription'] ?? '', isDark));
        }
        _addText(widgets, 'How You Think', data['mentalWiring'], isDark);
        _addText(widgets, 'How You Feel', data['emotionalTendencies'], isDark);
        _addText(widgets, 'Bravery & Worries', data['courageAndFear'], isDark);
        _addText(widgets, 'Leader or Supporter', data['leadershipVsFollower'], isDark);
        _addText(widgets, 'Money vs Meaning', data['materialisticVsSpiritual'], isDark);
        _addText(widgets, 'What Makes You Angry', data['angerPatterns'], isDark);
        _addText(widgets, 'How You Make Decisions', data['decisionStyle'], isDark);
        _addText(widgets, 'Secret Worries', data['hiddenInsecurities'], isDark);
        _addText(widgets, 'How Others See You', data['publicVsPrivateSelf'], isDark);
        _addText(widgets, 'How You\'re Smart', data['intelligenceType'], isDark);
        _addText(widgets, 'Communication Style', data['communicationStyle'], isDark);
        _addText(widgets, 'Comfort with Risk', data['riskAppetite'], isDark);
        break;

      case 'karmaPatterns':
        _addText(widgets, 'Patterns You Were Born With', data['pastLifeTendencies'], isDark);
        _addText(widgets, 'Lessons Still to Learn', data['unfinishedKarmas'], isDark);
        _addText(widgets, 'Why Some Pain Keeps Coming Back', data['repeatingSufferingLoops'], isDark);
        if (data['debtsToward'] is List) {
          widgets.add(_badgeList('People You Owe Attention To', data['debtsToward'], Colors.purple, isDark));
        }
        _addText(widgets, 'Where Life Keeps You Grounded', data['areasForcingHumility'], isDark);
        _addText(widgets, 'Why Some Problems Return', data['whyCertainPainRepeats'], isDark);
        break;

      case 'careerDharma':
        _addText(widgets, 'What Comes Naturally', data['naturalSkillPattern'], isDark);
        _addText(widgets, 'How You Handle Money', data['moneyBehavior'], isDark);
        _addText(widgets, 'Leadership Potential', data['authorityPotential'], isDark);
        _addText(widgets, 'Business vs Job', data['entrepreneurshipVsEmployment'], isDark);
        _addText(widgets, 'Fame Potential', data['famePotential'], isDark);
        _addText(widgets, 'Risk Capacity', data['riskCapacity'], isDark);
        _addText(widgets, 'When Money Flows Best', data['wealthCreationCycles'], isDark);
        if (data['industryCompatibility'] is List) {
          widgets.add(_badgeList('Compatible Industries', data['industryCompatibility'], Colors.green, isDark));
        }
        break;

      case 'marriageDynamics':
        _addText(widgets, 'Who You\'re Drawn To', data['attractionPattern'], isDark);
        _addText(widgets, 'Emotional Connection Style', data['emotionalCompatibility'], isDark);
        _addText(widgets, 'Power Balance', data['dominanceIssues'], isDark);
        _addText(widgets, 'How Loyal You Tend to Be', data['loyaltyIndicators'], isDark);
        _addText(widgets, 'Possible Delays', data['delays'], isDark);
        _addText(widgets, 'Relationship Challenges', data['divorcePotential'], isDark);
        _addText(widgets, 'Your Partner\'s Inner World', data['spousePsychology'], isDark);
        _addText(widgets, 'When Marriage Is Likely', data['marriageTiming'], isDark);
        _addText(widgets, 'Quality of Married Life', data['qualityOfMarriedLife'], isDark);
        break;

      case 'healthTendencies':
        if (data['ayurvedicConstitution'] != null) {
          widgets.add(_doshaCard(data['ayurvedicConstitution'].toString(), data['ayurvedicNote'] ?? '', isDark));
        }
        if (data['weakOrgans'] is List) {
          widgets.add(_badgeList('Vulnerable Areas', data['weakOrgans'], Colors.red, isDark));
        }
        _addText(widgets, 'Long-term Health Patterns', data['chronicDiseaseTendency'], isDark);
        _addText(widgets, 'How Stress Affects You', data['stressPattern'], isDark);
        _addText(widgets, 'Mental Health Patterns', data['mentalInstability'], isDark);
        _addText(widgets, 'Habit-Forming Tendencies', data['addictionTendencies'], isDark);
        break;

      case 'timingEvents':
        if (data['currentMahadasha'] != null) {
          widgets.add(_dashaCard(data, isDark));
        }
        _addText(widgets, 'What This Period Means', data['dashaInterpretation'], isDark);
        _addText(widgets, 'Current Planet Effects', data['gocharInfluence'], isDark);
        if (data['upcomingPeriods'] is List) {
          for (final p in data['upcomingPeriods']) {
            widgets.add(_upcomingPeriodCard(p, isDark));
          }
        }
        break;

      case 'spiritualEvolution':
        _addText(widgets, 'Desire for Freedom', data['mokshaTendency'], isDark);
        _addText(widgets, 'Spiritual Interest', data['spiritualInclination'], isDark);
        _addText(widgets, 'Relationship with Teachers', data['guruKarma'], isDark);
        _addText(widgets, 'Ability to Let Go', data['detachmentLevel'], isDark);
        _addText(widgets, 'Meditation Potential', data['meditationCapacity'], isDark);
        _addText(widgets, 'Pride Lessons', data['egoLessons'], isDark);
        _addText(widgets, 'Worldly vs Inner Peace', data['materialTrapVsLiberation'], isDark);
        break;

      case 'familyKarma':
        _addText(widgets, 'Relationship with Father', data['fatherRelationship'], isDark);
        _addText(widgets, 'Mother\'s Influence', data['motherPsychology'], isDark);
        _addText(widgets, 'Family Legacy', data['ancestorKarma'], isDark);
        _addText(widgets, 'Family Money Patterns', data['familyWealthPatterns'], isDark);
        _addText(widgets, 'Recurring Family Challenges', data['familySufferingCycles'], isDark);
        _addText(widgets, 'Relationship with Children', data['childKarma'], isDark);
        _addText(widgets, 'Heavy Responsibilities', data['responsibilityBurdens'], isDark);
        break;

      case 'hiddenPatterns':
        _addText(widgets, 'Self-Sabotage', data['selfSabotage'], isDark);
        _addText(widgets, 'Addictions', data['addictions'], isDark);
        _addText(widgets, 'Controlling Tendencies', data['manipulativeBehavior'], isDark);
        _addText(widgets, 'Pride Traps', data['egoTraps'], isDark);
        _addText(widgets, 'Procrastination', data['laziness'], isDark);
        _addText(widgets, 'Running from Problems', data['escapism'], isDark);
        _addText(widgets, 'Trust Issues', data['betrayalTendencies'], isDark);
        if (data['hiddenStrengths'] is List) {
          widgets.add(_bulletList('Hidden Strengths', data['hiddenStrengths'], AppColors.sage, isDark));
        }
        break;

      case 'rareYogas':
        if (data['detectedYogas'] is List) {
          final yogas = (data['detectedYogas'] as List).where((y) => y['present'] == true).toList();
          if (yogas.isEmpty) {
            widgets.add(Text('No major yogas detected in this chart.', style: TextStyle(
              fontSize: 13, color: isDark ? Colors.white54 : AppColors.brown500,
            )));
          } else {
            for (final y in yogas) {
              widgets.add(_yogaCard(y, isDark));
            }
          }
        }
        if (data['detectedDoshas'] is List) {
          final doshas = (data['detectedDoshas'] as List).where((d) => d['present'] == true).toList();
          if (doshas.isNotEmpty) {
            widgets.add(Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text('CHALLENGES FOUND', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: Colors.red.shade400,
              )),
            ));
            for (final d in doshas) {
              widgets.add(_doshaDetailCard(d, isDark));
            }
          }
        }
        break;

      case 'divisionalCharts':
        if (data['d9Navamsha'] is Map) {
          widgets.add(_vargaHighlightCard('D9 Navamsha — Your Inner Self', data['d9Navamsha'], isDark));
        }
        _addVargaCard(widgets, 'D10 Career', data['d10Career'], isDark);
        _addVargaCard(widgets, 'D7 Children', data['d7Children'], isDark);
        _addVargaCard(widgets, 'D12 Parents', data['d12Parents'], isDark);
        _addVargaCard(widgets, 'D20 Spirituality', data['d20Spirituality'], isDark);
        _addVargaCard(widgets, 'D24 Education', data['d24Education'], isDark);
        _addVargaCard(widgets, 'D60 Deep Karma', data['d60DeepKarma'], isDark);
        if (data['vargottamaPlanets'] is List && (data['vargottamaPlanets'] as List).isNotEmpty) {
          widgets.add(_badgeList('Planets in Same Sign (Very Strong)', data['vargottamaPlanets'], AppColors.gold, isDark));
        }
        break;

      case 'nakshatraDeepAnalysis':
        if (data['moonNakshatra'] != null) {
          widgets.add(_nakshatraHeaderCard(data, isDark));
        }
        _addText(widgets, 'Your Mental Programming', data['psychologicalCoding'], isDark);
        _addText(widgets, 'What You Deeply Want', data['desireNature'], isDark);
        _addText(widgets, 'Secret Drivers', data['hiddenMotivations'], isDark);
        _addText(widgets, 'Emotional Hurts', data['emotionalWounds'], isDark);
        _addText(widgets, 'How You Act', data['behavioralPatterns'], isDark);
        _addText(widgets, 'Divine Influence', data['deityInfluence'], isDark);
        _addText(widgets, 'Symbol Meaning', data['symbolMeaning'], isDark);
        _addText(widgets, 'Quarter Analysis', data['padaAnalysis'], isDark);
        _addText(widgets, 'Star Ruler\'s Effect', data['nakshatraRulerInfluence'], isDark);
        break;
    }

    if (data['keyFactors'] is Map) {
      widgets.add(_keyFactorsGrid(data['keyFactors'], isDark));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: widgets.map((w) => Padding(padding: const EdgeInsets.only(bottom: 12), child: w)).toList(),
    );
  }

  void _addText(List<Widget> list, String label, dynamic text, bool isDark) {
    if (text == null || text.toString().isEmpty) return;
    list.add(Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(
          fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
          color: isDark ? AppColors.brown500 : AppColors.brown500,
        )),
        const SizedBox(height: 4),
        Text(text.toString(), style: TextStyle(
          fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
        )),
      ],
    ));
  }

  Widget _archetypeCard(String archetype, String desc, bool isDark) {
    final emojis = {'Warrior': '⚔️', 'Sage': '📚', 'Artist': '🎨', 'Builder': '🏗️',
      'Mystic': '🔮', 'Leader': '👑', 'Healer': '💚', 'Innovator': '🚀'};
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.gold.withOpacity(0.15), AppColors.gold.withOpacity(0.03)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gold.withOpacity(0.25)),
      ),
      child: Column(
        children: [
          Text(emojis[archetype] ?? '✨', style: const TextStyle(fontSize: 32)),
          const SizedBox(height: 8),
          Text(archetype, style: TextStyle(
            fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
            color: isDark ? AppColors.goldLight : AppColors.goldDark,
          )),
          if (desc.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(desc, textAlign: TextAlign.center, style: TextStyle(
              fontSize: 12, height: 1.4, color: isDark ? Colors.white54 : AppColors.brown700,
            )),
          ],
        ],
      ),
    );
  }

  Widget _doshaCard(String dosha, String note, bool isDark) {
    final colors = {
      'Pitta': [Colors.red.withOpacity(0.15), Colors.orange.withOpacity(0.15)],
      'Vata': [Colors.blue.withOpacity(0.15), Colors.purple.withOpacity(0.15)],
      'Kapha': [Colors.green.withOpacity(0.15), Colors.teal.withOpacity(0.15)],
    };
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors[dosha] ?? [Colors.grey.withOpacity(0.15), Colors.grey.withOpacity(0.1)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(dosha, style: TextStyle(
            fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.brown900,
          )),
          if (note.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(note, style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700)),
          ],
        ],
      ),
    );
  }

  Widget _dashaCard(Map<String, dynamic> data, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.gold.withOpacity(0.12), AppColors.gold.withOpacity(0.04)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gold.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('CURRENT MAIN PERIOD', style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: AppColors.goldDark,
          )),
          const SizedBox(height: 4),
          Text(data['currentMahadasha'] ?? '', style: TextStyle(
            fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.brown900,
          )),
          if (data['currentAntardasha'] != null) ...[
            const SizedBox(height: 8),
            Text('CURRENT SUB-PERIOD', style: TextStyle(
              fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: AppColors.goldDark,
            )),
            const SizedBox(height: 4),
            Text(data['currentAntardasha'], style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.brown900,
            )),
          ],
        ],
      ),
    );
  }

  Widget _upcomingPeriodCard(Map<String, dynamic> p, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.6),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(p['period'] ?? '', style: TextStyle(
            fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.brown900,
          )),
          Text('${p['startDate'] ?? ''} → ${p['endDate'] ?? ''}', style: TextStyle(
            fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
          )),
          if (p['interpretation'] != null) ...[
            const SizedBox(height: 6),
            Text(p['interpretation'], style: TextStyle(
              fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700,
            )),
          ],
        ],
      ),
    );
  }

  Widget _yogaCard(Map<String, dynamic> y, bool isDark) {
    final strengthColor = y['strength'] == 'Strong' ? Colors.green : y['strength'] == 'Moderate' ? Colors.amber : Colors.grey;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.gold.withOpacity(0.08), AppColors.gold.withOpacity(0.03)]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gold.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(y['name'] ?? '', style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 14, fontWeight: FontWeight.bold,
                color: isDark ? AppColors.goldLight : AppColors.goldDark,
              )),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: strengthColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(y['strength'] ?? '', style: TextStyle(fontSize: 10, color: strengthColor)),
              ),
            ],
          ),
          if (y['description'] != null) ...[
            const SizedBox(height: 6),
            Text(y['description'], style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700)),
          ],
          if (y['contextualNote'] != null) ...[
            const SizedBox(height: 4),
            Text(y['contextualNote'], style: TextStyle(
              fontSize: 11, fontStyle: FontStyle.italic, color: isDark ? Colors.white38 : AppColors.brown500,
            )),
          ],
        ],
      ),
    );
  }

  Widget _doshaDetailCard(Map<String, dynamic> d, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(d['name'] ?? '', style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 14, fontWeight: FontWeight.bold,
                color: isDark ? Colors.red.shade300 : Colors.red.shade700,
              )),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.12), borderRadius: BorderRadius.circular(10),
                ),
                child: Text(d['severity'] ?? '', style: TextStyle(fontSize: 10, color: Colors.red.shade400)),
              ),
            ],
          ),
          if (d['description'] != null) ...[
            const SizedBox(height: 6),
            Text(d['description'], style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700)),
          ],
          if (d['remedies'] is List && (d['remedies'] as List).isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('REMEDIES', style: TextStyle(
              fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1, color: isDark ? Colors.white38 : AppColors.brown500,
            )),
            ...((d['remedies'] as List).map((r) => Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('• ', style: TextStyle(color: AppColors.sage)),
                  Expanded(child: Text(r.toString(), style: TextStyle(
                    fontSize: 11, color: isDark ? Colors.white54 : AppColors.brown700,
                  ))),
                ],
              ),
            ))),
          ],
        ],
      ),
    );
  }

  Widget _vargaHighlightCard(String title, Map<String, dynamic> data, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.gold.withOpacity(0.1), AppColors.gold.withOpacity(0.03)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gold.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(), style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: AppColors.goldDark,
          )),
          const SizedBox(height: 4),
          Text('${data['ascendantSign'] ?? ''} Ascendant', style: TextStyle(
            fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.brown900,
          )),
          if (data['analysis'] != null) ...[
            const SizedBox(height: 6),
            Text(data['analysis'], style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700)),
          ],
        ],
      ),
    );
  }

  void _addVargaCard(List<Widget> list, String name, dynamic data, bool isDark) {
    if (data is! Map) return;
    list.add(Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isDark ? Colors.white12 : AppColors.brown100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(8),
                ),
                child: Text(name, style: TextStyle(fontSize: 10, color: AppColors.goldDark)),
              ),
              const SizedBox(width: 8),
              Text('${data['ascendantSign'] ?? ''} Asc', style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.brown900,
              )),
            ],
          ),
          if (data['analysis'] != null) ...[
            const SizedBox(height: 6),
            Text(data['analysis'], style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.brown700)),
          ],
        ],
      ),
    ));
  }

  Widget _nakshatraHeaderCard(Map<String, dynamic> data, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Colors.blueGrey.withOpacity(0.1), Colors.blueGrey.withOpacity(0.03)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.blueGrey.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          const Icon(Icons.nightlight_round, size: 32, color: Colors.blueGrey),
          const SizedBox(height: 8),
          Text(data['moonNakshatra'] ?? '', style: TextStyle(
            fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.brown900,
          )),
          if (data['symbol'] != null || data['deity'] != null)
            Text('${data['symbol'] != null ? 'Symbol: ${data['symbol']}' : ''} • Deity: ${data['deity'] ?? ''}',
              style: TextStyle(fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500)),
        ],
      ),
    );
  }

  Widget _badgeList(String label, List items, Color color, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(
          fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
          color: isDark ? AppColors.brown500 : AppColors.brown500,
        )),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6, runSpacing: 6,
          children: items.map((item) => Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(item.toString(), style: TextStyle(
              fontSize: 11, color: color.withOpacity(0.8),
            )),
          )).toList(),
        ),
      ],
    );
  }

  Widget _bulletList(String label, List items, Color color, bool isDark) {
    return Column(
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
              Text('✦ ', style: TextStyle(color: color, fontSize: 12)),
              Expanded(child: Text(s.toString(), style: TextStyle(
                fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700,
              ))),
            ],
          ),
        )),
      ],
    );
  }

  Widget _keyFactorsGrid(Map<String, dynamic> factors, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: factors.entries.map((e) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.04) : AppColors.cream.withOpacity(0.6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(e.key.replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m.group(0)}').trim().toUpperCase(),
              style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1,
                color: isDark ? AppColors.goldLight : AppColors.goldDark,
              )),
            const SizedBox(height: 4),
            Text(e.value.toString(), style: TextStyle(
              fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700,
            )),
          ],
        ),
      )).toList(),
    );
  }
}
