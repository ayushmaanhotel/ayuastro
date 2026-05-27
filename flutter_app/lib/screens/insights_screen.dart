import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';
import '../widgets/kundali_score_card.dart';
import '../widgets/dosha_detail_card.dart';
import '../widgets/kundali_chart.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({Key? key}) : super(key: key);

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  bool _isTableCollapsed = true;

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final astro = state.astrologyData;
    final numData = state.numerologyData;

    if (astro == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: const Center(
          child: Text(
            "Please complete onboarding to view insights.",
            style: TextStyle(color: AppColors.brown700),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "Cosmic Insights",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.rotate_ccw, color: AppColors.gold),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: isDark ? AppColors.darkCard : Colors.white,
                  title: const Text("Start Over?"),
                  content: const Text("This will clear all your birth details and quiz answers."),
                  actions: [
                    TextButton(
                      child: const Text("Cancel"),
                      onPressed: () => Navigator.pop(context),
                    ),
                    TextButton(
                      child: const Text("Yes, Reset", style: TextStyle(color: Colors.red)),
                      onPressed: () {
                        Navigator.pop(context);
                        state.reset();
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: StarFieldBackground(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── 1. DAILY COSMIC INSIGHT ───
              _buildCosmicInsightCard(),
              const SizedBox(height: 16),

              // ─── KUNDALI SCORE CARD ───
              const KundaliScoreCard(),
              const SizedBox(height: 16),

              // ─── DOSHA DETAIL CARD ───
              DoshaDetailCard(doshas: astro.doshas),
              const SizedBox(height: 16),

              // ─── 2. DAILY AFFIRMATION & RITUAL ───
              _buildAffirmationCard(state),
              const SizedBox(height: 16),

              // ─── 3. DAILY HOROSCOPE ───
              if (state.dailyHoroscope != null) ...[
                _buildHoroscopeCard(state.dailyHoroscope!),
                const SizedBox(height: 16),
              ],

              // ─── 4. PLANETARY TRANSITS ───
              if (state.transits.isNotEmpty) ...[
                _buildTransitsCard(state.transits),
                const SizedBox(height: 16),
              ],

              // ─── 5. ELEMENTAL BALANCE ───
              _buildElementalBalanceCard(astro),
              const SizedBox(height: 16),

              // ─── 6. NUMEROLOGY BLUEPRINT ───
              if (numData != null) ...[
                _buildNumerologyCard(numData),
                const SizedBox(height: 16),
              ],

              // ─── 7. ASTROLOGY IDENTITY ───
              _buildAstroIdentityCard(astro),
              const SizedBox(height: 16),

              // ─── 8. DASHA TIMELINE ───
              _buildDashaTimelineCard(astro),
              const SizedBox(height: 16),

              // ─── 9. KUNDALI CHART ───
              _buildKundaliCard(astro, state.birthDetails),
              const SizedBox(height: 16),

              // ─── 10. PLANETARY POSITIONS TABLE ───
              _buildPlanetsTableCard(astro),
              const SizedBox(height: 24),

              // ─── CLICKABLE NAVIGATION SHORTCUTS ───
              InkWell(
                onTap: () {
                  state.setView('yogaDosha');
                },
                child: GlassLightCard(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Text("🧘", style: TextStyle(fontSize: 20)),
                          const SizedBox(width: 12),
                          Text(
                            "View Yogas (${astro.yogas.length}) & Doshas (${astro.doshas.length})",
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const Icon(LucideIcons.arrow_right, color: AppColors.gold, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              InkWell(
                onTap: () {
                  state.setView('report');
                },
                child: GlassLightCard(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Text("📄", style: TextStyle(fontSize: 20)),
                          const SizedBox(width: 12),
                          Text(
                            "Read Your Detailed AI Personality Report",
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const Icon(LucideIcons.arrow_right, color: AppColors.gold, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Cosmic Insight Widget
  Widget _buildCosmicInsightCard() {
    return const GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.sparkles, color: AppColors.gold, size: 18),
              SizedBox(width: 8),
              Text(
                "Daily Cosmic Insight",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Text(
            "“Your chart is not a set of lock combinations—it is a map of your potential contradictions. The tension you feel is where growth happens.”",
            style: TextStyle(
              color: AppColors.brown700,
              fontSize: 13,
              fontStyle: FontStyle.italic,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // 2. Affirmation Card Widget
  Widget _buildAffirmationCard(AppState state) {
    
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Personalized Affirmation ✦",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "\"I translate my intense emotional currents into creative strength, remaining grounded when the external tides shift.\"",
            style: TextStyle(
              color: AppColors.brown900,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text("🌅", style: TextStyle(fontSize: 20)),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Daily Ritual: Solar Contemplation",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    Text(
                      "Spend 5 minutes looking eastward at sunrise, aligning your focus with internal clarity.",
                      style: TextStyle(color: AppColors.brown500, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: state.markedAffirmationDone ? AppColors.sage : AppColors.gold,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              elevation: 0,
            ),
            onPressed: () {
              state.toggleAffirmationDone();
            },
            child: Text(
              state.markedAffirmationDone ? "Completed ✓" : "Mark as Completed",
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  // 3. Daily Horoscope Widget
  Widget _buildHoroscopeCard(DailyHoroscope horoscope) {
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Daily Horoscope",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.sageLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "Lucky Element: ${horoscope.luckyElement}",
                  style: const TextStyle(color: AppColors.sage, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "Emotional Energy: ${horoscope.emotionalEnergy}",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.brown900),
          ),
          const SizedBox(height: 4),
          Text(
            horoscope.guidance,
            style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 8),
          Text(
            "Focus Area: ${horoscope.focusArea}",
            style: const TextStyle(color: AppColors.goldDark, fontSize: 11, fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }

  // 4. Planetary Transits Widget
  Widget _buildTransitsCard(List<TransitInfo> transits) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.orbit, color: AppColors.gold, size: 16),
              SizedBox(width: 8),
              Text(
                "Active Planetary Transits",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: min(3, transits.length), // Show top 3 transits
            separatorBuilder: (context, index) => const Divider(height: 16),
            itemBuilder: (context, index) {
              final transit = transits[index];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "${transit.planet} in ${transit.sign} (House ${transit.house})",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: isDark ? Colors.white : AppColors.brown900,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: transit.type == 'Major'
                              ? Colors.red.withOpacity(0.1)
                              : AppColors.brown100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          transit.type,
                          style: TextStyle(
                            color: transit.type == 'Major' ? Colors.red : AppColors.brown700,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    transit.effect,
                    style: const TextStyle(color: AppColors.brown700, fontSize: 11, height: 1.35),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // 5. Elemental Balance Widget
  Widget _buildElementalBalanceCard(AstrologyInfo astro) {
    // Replicating elemental counts
    final elements = {'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0};

    final zodiacElements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
    };

    astro.planetaryPositions.forEach((planet, pos) {
      final elem = zodiacElements[pos.sign] ?? 'Fire';
      elements[elem] = (elements[elem] ?? 0) + 1;
    });

    final total = elements.values.fold(0, (sum, val) => sum + val);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget buildBar(String name, int count, Color color) {
      final pct = total > 0 ? count / total : 0.0;
      return Padding(
        padding: const EdgeInsets.only(bottom: 12.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                Text("$count (${(pct * 100).toStringAsFixed(0)}%)", style: const TextStyle(fontSize: 11, color: AppColors.brown700)),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct,
                minHeight: 8,
                color: color,
                backgroundColor: isDark ? Colors.white.withOpacity(0.04) : AppColors.brown100,
              ),
            ),
          ],
        ),
      );
    }

    // Find dominant
    String dominant = 'Fire';
    int maxVal = -1;
    elements.forEach((key, val) {
      if (val > maxVal) {
        maxVal = val;
        dominant = key;
      }
    });

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Elemental Balance",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          buildBar('Fire (Passion/Initiative)', elements['Fire'] ?? 0, Colors.orange),
          buildBar('Earth (Stability/Patience)', elements['Earth'] ?? 0, Colors.green),
          buildBar('Air (Communication/Adaptability)', elements['Air'] ?? 0, Colors.amber),
          buildBar('Water (Emotion/Intuition)', elements['Water'] ?? 0, Colors.blue),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.gold.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Text("✦ ", style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold)),
                Expanded(
                  child: Text(
                    "Dominant Element: $dominant. Focuses your psychological drive heavily on qualities of ${dominant == 'Fire' ? 'passion and active creation' : dominant == 'Earth' ? 'stability and practical foundations' : dominant == 'Air' ? 'social adaptability and intellect' : 'emotional depth and intuitive listening'}.",
                    style: const TextStyle(color: AppColors.brown900, fontSize: 11, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 6. Numerology Card
  Widget _buildNumerologyCard(NumerologyInfo numData) {
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Numerology Blueprint",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildNumCircle("Life Path", numData.lifePathNumber, Colors.brown),
              const SizedBox(width: 12),
              _buildNumCircle("Destiny", numData.destinyNumber, AppColors.gold),
              const SizedBox(width: 12),
              _buildNumCircle("Soul Urge", numData.soulUrgeNumber, AppColors.sage),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            "Life Path ${numData.lifePathNumber} Drive:",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.brown900),
          ),
          const SizedBox(height: 4),
          Text(
            numData.lifePathDesc.isNotEmpty ? numData.lifePathDesc : "Your Life Path represents the core lessons, path, and purpose you will walk in this lifetime.",
            style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildNumCircle(String label, int number, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(
              number.toString(),
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: AppColors.brown500, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  // 7. Astrology Identity Card
  Widget _buildAstroIdentityCard(AstrologyInfo astro) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Astrology Identity",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildSignCell("☉ Sun Sign", astro.sunSign, "Leo" == astro.sunSign ? "♌" : "♈"),
              const SizedBox(width: 8),
              _buildSignCell("☽ Moon Sign", astro.moonSign, "Cancer" == astro.moonSign ? "♋" : "♊"),
              const SizedBox(width: 8),
              _buildSignCell("⬆ Ascendant", astro.ascendant, "Taurus" == astro.ascendant ? "♉" : "♑"),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Nakshatra: ${astro.nakshatra}",
                style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Text(
                "Current Dasha: ${astro.currentDasha}",
                style: const TextStyle(color: AppColors.goldDark, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSignCell(String title, String value, String symbol) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.02) : AppColors.cream,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.brown100),
        ),
        child: Column(
          children: [
            Text(title, style: const TextStyle(fontSize: 9, color: AppColors.brown500, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              symbol,
              style: const TextStyle(fontSize: 24, color: AppColors.gold),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : AppColors.brown900),
            ),
          ],
        ),
      ),
    );
  }

  // 8. Dasha Timeline Card
  Widget _buildDashaTimelineCard(AstrologyInfo astro) {
    final planets = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    final activePlanet = astro.currentDasha.split('/').first;

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Vimshottari Dasha periods",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 60,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: planets.length,
              itemBuilder: (context, index) {
                final planet = planets[index];
                final isActive = planet == activePlanet;

                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.gold.withOpacity(0.15) : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isActive ? AppColors.gold : AppColors.brown100,
                      width: isActive ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        planet,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                          color: isActive ? AppColors.goldDark : AppColors.brown700,
                        ),
                      ),
                      if (isActive)
                        const Text(
                          "Active ✦",
                          style: TextStyle(fontSize: 8, color: AppColors.sage, fontWeight: FontWeight.bold),
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // 9. Kundali Chart CustomPaint Widget
  Widget _buildKundaliCard(AstrologyInfo astro, BirthDetails? birthDetails) {
    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Vedic Kundali Chart",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.gold.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  "North Indian",
                  style: TextStyle(color: AppColors.goldDark, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Premium Kundali Chart
          AspectRatio(
            aspectRatio: 460 / 710,
            child: KundaliChart(
              planetaryPositions: astro.planetaryPositions,
              ascendant: astro.ascendant,
              sunSign: astro.sunSign,
              moonSign: astro.moonSign,
              birthDetails: birthDetails,
              nakshatra: astro.nakshatra,
              compact: false,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "Lagna: ${astro.ascendant} Ascendant. The 1st house (top-center triangle) is the anchor of your physical and behavioral profile.",
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.brown500, fontSize: 11, height: 1.35),
          ),
        ],
      ),
    );
  }

  // 10. Planets Table Card
  Widget _buildPlanetsTableCard(AstrologyInfo astro) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _isTableCollapsed = !_isTableCollapsed;
              });
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(LucideIcons.list, color: AppColors.gold, size: 16),
                    SizedBox(width: 8),
                    Text(
                      "Planetary Positions Table",
                      style: TextStyle(
                        color: AppColors.goldDark,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Icon(
                  _isTableCollapsed ? LucideIcons.chevron_down : LucideIcons.chevron_up,
                  color: AppColors.gold,
                  size: 18,
                ),
              ],
            ),
          ),
          if (!_isTableCollapsed) ...[
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columnSpacing: 16,
                headingRowHeight: 32,
                dataRowHeight: 36,
                columns: [
                  DataColumn(label: Text("Planet", style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown900, fontSize: 11, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Sign", style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown900, fontSize: 11, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Degree", style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown900, fontSize: 11, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("House", style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown900, fontSize: 11, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Retro", style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown900, fontSize: 11, fontWeight: FontWeight.bold))),
                ],
                rows: astro.planetaryPositions.entries.map((entry) {
                  final planet = entry.key;
                  final details = entry.value;

                  return DataRow(
                    cells: [
                      DataCell(Text(planet, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                      DataCell(Text(details.sign, style: const TextStyle(fontSize: 11))),
                      DataCell(Text("${details.degree.toStringAsFixed(1)}°", style: const TextStyle(fontSize: 11))),
                      DataCell(Text(details.house.toString(), style: const TextStyle(fontSize: 11))),
                      DataCell(Text(details.retrograde ? "℞" : "-", style: TextStyle(fontSize: 12, color: details.retrograde ? Colors.red : AppColors.brown400, fontWeight: FontWeight.bold))),
                    ],
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
