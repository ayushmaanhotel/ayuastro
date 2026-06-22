import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../widgets/custom_widgets.dart';
import '../widgets/chart_painters.dart';
import '../models/models.dart';
import 'mood_tracker_screen.dart';
import 'pdf_viewer_screen.dart';

// ─── Zodiac Element Mapping ─────────────────────────────────────────────────
const Map<String, String> _zodiacElements = {
  'Aries': 'Fire', 'Taurus': 'Earth', 'Gemini': 'Air',
  'Cancer': 'Water', 'Leo': 'Fire', 'Virgo': 'Earth',
  'Libra': 'Air', 'Scorpio': 'Water', 'Sagittarius': 'Fire',
  'Capricorn': 'Earth', 'Aquarius': 'Air', 'Pisces': 'Water',
};

// ─── Default fallback traits ────────────────────────────────────────────────
List<TraitScore> _getDefaultTraits() {
  return [
    TraitScore(name: 'empathy', label: 'Empathy', score: 78, description: ''),
    TraitScore(name: 'resilience', label: 'Resilience', score: 65, description: ''),
    TraitScore(name: 'communication', label: 'Communication', score: 72, description: ''),
    TraitScore(name: 'trust', label: 'Trust', score: 55, description: ''),
    TraitScore(name: 'emotional_awareness', label: 'Awareness', score: 82, description: ''),
    TraitScore(name: 'adaptability', label: 'Adaptability', score: 48, description: ''),
    TraitScore(name: 'patience', label: 'Patience', score: 61, description: ''),
    TraitScore(name: 'leadership', label: 'Leadership', score: 35, description: ''),
    TraitScore(name: 'creativity', label: 'Creativity', score: 73, description: ''),
    TraitScore(name: 'loyalty', label: 'Loyalty', score: 85, description: ''),
    TraitScore(name: 'independence', label: 'Independence', score: 42, description: ''),
    TraitScore(name: 'harmony', label: 'Harmony', score: 68, description: ''),
    TraitScore(name: 'intuition', label: 'Intuition', score: 76, description: ''),
    TraitScore(name: 'discipline', label: 'Discipline', score: 38, description: ''),
  ];
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin {
  int _activeSegment = 0; // 0: Cosmic Blueprint, 1: Profile & Settings
  final GlobalKey _shareCardKey = GlobalKey();
  
  // Settings values (simulated local state synced with appState toggles)
  bool _dailyHoroscope = true;
  bool _transitAlerts = true;

  @override
  void initState() {
    super.initState();
    final state = Provider.of<AppState>(context, listen: false);
    _dailyHoroscope = state.dailyHoroscopeNotif;
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final traits = state.traitScores.isNotEmpty ? state.traitScores : _getDefaultTraits();
    final astro = state.astrologyData;
    final numData = state.numerologyData;
    final sunSign = astro?.sunSign ?? 'Capricorn';
    final moonSign = astro?.moonSign ?? 'Gemini';
    final ascendant = astro?.ascendant ?? 'Taurus';

    // Radar Chart data
    final radarData = traits.map((t) => {
      'subject': t.label.isNotEmpty ? t.label : t.name,
      'score': t.score,
    }).toList();

    // Pie distribution data
    final high = traits.where((t) => t.score > 75).length;
    final moderate = traits.where((t) => t.score >= 40 && t.score <= 75).length;
    final growth = traits.where((t) => t.score < 40).length;
    final total = traits.isEmpty ? 1 : traits.length;
    final pieData = [
      {'name': 'High', 'value': (high / total * 100).round(), 'count': high},
      {'name': 'Moderate', 'value': (moderate / total * 100).round(), 'count': moderate},
      {'name': 'Growth Area', 'value': (growth / total * 100).round(), 'count': growth},
    ];

    // Element Balance data
    final signElements = [sunSign, moonSign, ascendant]
        .map((s) => _zodiacElements[s])
        .where((e) => e != null)
        .toList();
    final counts = <String, int>{'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0};
    for (final el in signElements) {
      if (el != null) counts[el] = (counts[el] ?? 0) + 1;
    }
    final elementData = counts.entries.map((e) => {
      'element': e.key,
      'count': e.value,
      'percentage': (e.value / 3 * 100).round(),
    }).toList();

    // Numerology Blueprint
    final numChartData = numData != null ? [
      {'name': 'Life Path', 'value': numData.lifePathNumber, 'meaning': numerologyMeanings[numData.lifePathNumber] ?? 'Unique path'},
      {'name': 'Destiny', 'value': numData.destinyNumber, 'meaning': numerologyMeanings[numData.destinyNumber] ?? 'Unique destiny'},
      {'name': 'Soul Urge', 'value': numData.soulUrgeNumber, 'meaning': numerologyMeanings[numData.soulUrgeNumber] ?? 'Unique soul urge'},
      {'name': 'Personality', 'value': numData.personalityNumber, 'meaning': numerologyMeanings[numData.personalityNumber] ?? 'Unique personality'},
    ] : <Map<String, dynamic>>[];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: SafeArea(
        child: Column(
          children: [
            // ─── STICKY HEADER & SEGMENT SELECTOR ──────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBg : AppColors.cream,
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100,
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'My Profile',
                        style: TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.brown900,
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.edit_note, color: AppColors.gold, size: 28),
                        tooltip: 'Edit Birth Details',
                        onPressed: () => _showEditProfileBottomSheet(context, state),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  
                  // Custom Segmented Toggle Slider
                  Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.04) : AppColors.brown100.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100,
                      ),
                    ),
                    child: Stack(
                      children: [
                        // Animated capsule background sliding indicator
                        AnimatedAlign(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                          alignment: _activeSegment == 0 ? Alignment.centerLeft : Alignment.centerRight,
                          child: FractionallySizedBox(
                            widthFactor: 0.5,
                            child: Container(
                              margin: const EdgeInsets.all(3),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.gold.withValues(alpha: 0.18) : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: isDark ? Border.all(color: AppColors.gold.withValues(alpha: 0.3), width: 1) : null,
                                boxShadow: isDark ? null : [
                                  BoxShadow(
                                    color: AppColors.brown900.withValues(alpha: 0.08),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        
                        // Interactive Text Labels overlay
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _activeSegment = 0),
                                behavior: HitTestBehavior.opaque,
                                child: Center(
                                  child: Text(
                                    'Cosmic Blueprint',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: _activeSegment == 0 ? FontWeight.bold : FontWeight.w500,
                                      color: _activeSegment == 0
                                          ? (isDark ? AppColors.goldLight : AppColors.brown900)
                                          : (isDark ? Colors.white38 : AppColors.brown400),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _activeSegment = 1),
                                behavior: HitTestBehavior.opaque,
                                child: Center(
                                  child: Text(
                                    'Preferences & Actions',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: _activeSegment == 1 ? FontWeight.bold : FontWeight.w500,
                                      color: _activeSegment == 1
                                          ? (isDark ? AppColors.goldLight : AppColors.brown900)
                                          : (isDark ? Colors.white38 : AppColors.brown400),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // ─── MAIN SCROLLABLE CONTENT BODY ──────────────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  children: [
                    // Profile Header Card showing Avatar & Sign placements
                    _buildProfileSummaryCard(context, state, isDark, sunSign, moonSign, ascendant),
                    const SizedBox(height: 20),
                    
                    if (_activeSegment == 0) ...[
                      // ─── TAB 0: Cosmic Placements Share Card ───
                      _buildPlacementsShareSection(state, isDark),
                      // ─── TAB 0: Cosmic Blueprint Visualizer Charts ───
                      _buildChartSection(isDark, radarData, pieData, elementData, numData, numChartData),
                    ] else ...[
                      // ─── TAB 1: Preferences, Settings & Core Actions ───
                      _buildSettingsSection(context, state, isDark),
                    ],
                    const SizedBox(height: 80), // bottom nav spacer
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Sub-widgets ────────────────────────────────────────────────────────────

  Widget _buildProfileSummaryCard(
    BuildContext context,
    AppState state,
    bool isDark,
    String sunSign,
    String moonSign,
    String ascendant,
  ) {
    final details = state.birthDetails;
    return GlassPremiumCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      borderShimmer: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar with gold border
              Container(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [AppColors.gold, AppColors.goldDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    (details?.name ?? 'U').substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              
              // Name & Main Signs
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      details?.name ?? 'Cosmic Traveler',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.brown900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          '$sunSign ☉  •  $moonSign ☽  •  $ascendant ↗',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.gold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          
          // Aligned grid of birth details
          Divider(color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100),
          const SizedBox(height: 12),
          
          if (details != null) ...[
            Column(
              children: [
                _buildBirthDetailRow(Icons.calendar_today, 'Date of Birth', details.dateOfBirth, isDark),
                const SizedBox(height: 10),
                _buildBirthDetailRow(Icons.access_time, 'Time of Birth', details.timeOfBirth, isDark),
                const SizedBox(height: 10),
                _buildBirthDetailRow(Icons.place_outlined, 'Place of Birth', details.placeOfBirth, isDark),
              ],
            ),
          ] else ...[
            Center(
              child: Text(
                'No birth details found.',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white30 : AppColors.brown400),
              ),
            ),
          ]
        ],
      ),
    );
  }

  Widget _buildBirthDetailRow(IconData icon, String title, String value, bool isDark) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.gold),
        const SizedBox(width: 10),
        Text(
          '$title: ',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white30 : AppColors.brown400,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white70 : AppColors.brown900,
            ),
          ),
        ),
      ],
    );
  }

  // ─── Section 0: Cosmic Blueprint Visualizer ─────────────────────────────────

  Widget _buildChartSection(
    bool isDark,
    List<Map<String, dynamic>> radarData,
    List<Map<String, dynamic>> pieData,
    List<Map<String, dynamic>> elementData,
    NumerologyInfo? numData,
    List<Map<String, dynamic>> numChartData,
  ) {
    return Column(
      children: [
        // 1. RADAR CHART — Emotional Architecture
        _buildChartCard(
          isDark: isDark,
          gradientColors: [AppColors.gold, AppColors.sage, AppColors.goldDark],
          icon: Icons.bubble_chart_outlined,
          iconColor: AppColors.gold,
          title: 'Emotional Architecture',
          subtitle: 'Balance of your primary psychological dimensions',
          child: Column(
            children: [
              SizedBox(
                width: double.infinity,
                height: 280,
                child: CustomPaint(
                  painter: RadarChartPainter(data: radarData, isDark: isDark),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLegendItem(AppColors.gold, 'Your Score', false),
                  const SizedBox(width: 16),
                  _buildLegendItem(AppColors.brown400, 'Average Base (50)', true),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 2. DONUT CHART — Trait Distribution
        _buildChartCard(
          isDark: isDark,
          gradientColors: [AppColors.sage, AppColors.gold, AppColors.brown400],
          icon: Icons.pie_chart_outline,
          iconColor: AppColors.sage,
          title: 'Personality Trait Spans',
          subtitle: 'Distribution of prominent traits vs growth areas',
          child: Column(
            children: [
              SizedBox(
                width: double.infinity,
                height: 240,
                child: CustomPaint(
                  painter: DonutChartPainter(data: pieData, isDark: isDark),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLegendDot(pieColors['High']!, 'High (>75)'),
                  const SizedBox(width: 12),
                  _buildLegendDot(pieColors['Moderate']!, 'Moderate (40-75)'),
                  const SizedBox(width: 12),
                  _buildLegendDot(pieColors['Growth']!, 'Growth Area (<40)'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 3. BAR CHART — Element Balance
        _buildChartCard(
          isDark: isDark,
          gradientColors: [
            const Color(0xFFEF4444), const Color(0xFF10B981),
            const Color(0xFFF59E0B), const Color(0xFF3B82F6),
          ],
          icon: Icons.waves,
          iconColor: AppColors.gold,
          title: 'Astrological Element Balance',
          subtitle: 'Distribution of Fire, Earth, Air and Water qualities',
          child: Column(
            children: [
              SizedBox(
                width: double.infinity,
                height: 220,
                child: CustomPaint(
                  painter: ElementBarChartPainter(data: elementData, isDark: isDark),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: elementData.map((e) {
                  final element = e['element'] as String;
                  final pct = e['percentage'] as int;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: _buildLegendDot(
                      elementChartColors[element] ?? AppColors.gold,
                      '$element: $pct%',
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 4. MOOD TREND — Navigation Card
        _buildChartCard(
          isDark: isDark,
          gradientColors: [AppColors.goldDark, AppColors.gold, AppColors.sage],
          icon: Icons.trending_up,
          iconColor: AppColors.gold,
          title: 'Daily Mood Analytics',
          subtitle: 'Track your emotional state over daily cycles',
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.mood, size: 24, color: AppColors.gold),
                ),
                const SizedBox(height: 10),
                Text(
                  'Track Emotional Trends',
                  style: TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Log your daily moods to correlate planetary transits with personal emotional cycles.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.brown500 : AppColors.brown400,
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MoodTrackerScreen())),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.brown700,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit_calendar, size: 14),
                      SizedBox(width: 8),
                      Text('Open Mood Logger', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // 5. NUMEROLOGY BLUEPRINT — Horizontal Bars
        if (numData != null)
          _buildChartCard(
            isDark: isDark,
            gradientColors: [AppColors.gold, AppColors.sage, AppColors.brown400],
            icon: Icons.auto_awesome_outlined,
            iconColor: AppColors.gold,
            title: 'Numerology Blueprint',
            subtitle: 'Core vibrational frequencies computed from birth date',
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 180,
                  child: CustomPaint(
                    painter: NumerologyBarPainter(data: numChartData, isDark: isDark),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: numChartData.asMap().entries.map((entry) {
                    final i = entry.key;
                    final item = entry.value;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: _buildLegendDot(
                        i < numerologyColors.length ? numerologyColors[i] : AppColors.gold,
                        '${item['name']}: ${item['value']}',
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildChartCard({
    required bool isDark,
    required List<Color> gradientColors,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100,
        ),
        boxShadow: [
          BoxShadow(
            color: (isDark ? Colors.black : AppColors.brown900).withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thin gradient accent bar
          Container(
            height: 3,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              gradient: LinearGradient(colors: gradientColors),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, size: 18, color: iconColor),
                    const SizedBox(width: 8),
                    Text(
                      title,
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.brown900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.brown500 : AppColors.brown400,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: child,
          ),
        ],
      ),
    );
  }

  // ─── Section 1: Settings, Preferences & Actions ─────────────────────────────

  Widget _buildSettingsSection(BuildContext context, AppState state, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Preferences Segment ──
        _sectionHeader('PREFERENCES', isDark),
        const SizedBox(height: 8),
        _toggleSetting(
          'Daily Horoscope Alert', 
          '🔔', 
          'Receive custom alerts based on Sun/Moon sign', 
          _dailyHoroscope,
          (v) {
            setState(() => _dailyHoroscope = v);
            // Sync preferences state in provider
            state.setDailyHoroscopeNotif(v);
          }, 
          isDark,
        ),
        const SizedBox(height: 10),
        _toggleSetting(
          'Significant Transit Alerts', 
          '🪐', 
          'Notify when major outer planets change signs', 
          _transitAlerts,
          (v) => setState(() => _transitAlerts = v), 
          isDark,
        ),
        const SizedBox(height: 10),
        _languageSetting(isDark, state),
        const SizedBox(height: 10),
        _themeModeSetting(isDark, state),
        const SizedBox(height: 20),
        _buildUcpSettingsSection(isDark, state),
        
        const SizedBox(height: 24),

        // ── Data & Maintenance ──
        _sectionHeader('DATA & STORAGE', isDark),
        const SizedBox(height: 8),
        GlassLightCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Column(
            children: [
              _actionTile('Clear Cached Reports', Icons.delete_outline, Colors.orange, isDark, () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🧹 App cache and offline reports cleared!'), 
                    backgroundColor: AppColors.gold,
                  ),
                );
              }),
              Divider(color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100),
              _actionTile('Export Cosmic Chart (PDF)', Icons.file_download_outlined, AppColors.sage, isDark, () {
                _exportPdfReport(context, state);
              }),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // ── Account Actions ──
        _sectionHeader('ACCOUNT ACTIONS', isDark),
        const SizedBox(height: 8),
        GlassLightCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: Column(
            children: [
              _actionTile('Recalculate Chart Details', Icons.refresh_outlined, AppColors.gold, isDark, () {
                _showEditProfileBottomSheet(context, state);
              }),
              Divider(color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100),
              _actionTile('Delete Account Data', Icons.person_remove_outlined, Colors.red, isDark, () {
                _showDeleteAccountConfirm(context);
              }),
              Divider(color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100),
              _actionTile('Log Out Session', Icons.logout_outlined, Colors.red, isDark, () {
                state.reset();
              }),
            ],
          ),
        ),

        const SizedBox(height: 36),
        
        // App Footer details
        Center(
          child: Column(
            children: [
              Text(
                '✦  AyuAstro  ✦', 
                style: TextStyle(
                  fontFamily: 'Playfair Display', 
                  fontSize: 16, 
                  fontWeight: FontWeight.bold,
                  color: AppColors.gold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'v1.1.2 Release Package • Encrypted & Secure', 
                style: TextStyle(
                  fontSize: 10, 
                  color: isDark ? Colors.white24 : AppColors.brown400,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _exportPdfReport(BuildContext context, AppState state) async {
    if (state.userId == null) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('📦 Preparing and generating your Cosmic PDF Chart...'),
        backgroundColor: AppColors.gold,
        duration: Duration(seconds: 3),
      ),
    );

    try {
      final response = await ApiService.generatePdfReport(
        userId: state.userId!,
        includePremium: state.hasPaid,
      );

      if (response.statusCode == 200) {
        final pdfBytes = response.bodyBytes;

        final directory = await getApplicationDocumentsDirectory();
        final nameSlug = state.birthDetails?.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_').toLowerCase() ?? 'seeker';
        final file = File('${directory.path}/ayuastro_report_$nameSlug.pdf');
        await file.writeAsBytes(pdfBytes);

        if (context.mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              backgroundColor: Theme.of(context).brightness == Brightness.dark ? AppColors.darkCard : Colors.white,
              title: const Row(
                children: [
                  Icon(Icons.file_present_outlined, color: AppColors.sage),
                  SizedBox(width: 8),
                  Text("Cosmic Chart Exported"),
                ],
              ),
              content: Text(
                "Your detailed astrological chart and traits summary have been exported natively as a PDF:\n\n${file.path}",
                style: const TextStyle(fontSize: 12.5, height: 1.45),
              ),
              actions: [
                TextButton(
                  child: const Text("Later", style: TextStyle(color: AppColors.brown500)),
                  onPressed: () => Navigator.pop(context),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text("View PDF", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PdfViewerScreen(filePath: file.path),
                      ),
                    );
                  },
                ),
              ],
            ),
          );
        }
      } else {
        throw Exception("Server returned code ${response.statusCode}");
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Error exporting PDF: ${e.toString().replaceAll('Exception:', '')}"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Widget _sectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(left: 6.0),
      child: Text(
        title, 
        style: TextStyle(
          fontSize: 10, 
          fontWeight: FontWeight.bold, 
          letterSpacing: 1.5,
          color: isDark ? Colors.white30 : AppColors.brown500,
        ),
      ),
    );
  }

  Widget _toggleSetting(String label, String emoji, String desc, bool value, ValueChanged<bool> onChanged, bool isDark) {
    return GlassLightCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label, 
                  style: TextStyle(
                    fontSize: 13, 
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  desc, 
                  style: TextStyle(
                    fontSize: 10, 
                    color: isDark ? Colors.white38 : AppColors.brown500,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.gold,
            inactiveTrackColor: isDark ? Colors.white12 : AppColors.brown100,
          ),
        ],
      ),
    );
  }

  Widget _buildUcpSettingsSection(bool isDark, AppState state) {
    final hasToken = state.ucpToken != null && state.ucpToken!.isNotEmpty;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader('AI AGENT INTEGRATION (UCP & MCP)', isDark),
        const SizedBox(height: 8),
        _toggleSetting(
          'Universal Context Sharing', 
          '🔮', 
          'Allow third-party AI agents to securely query your birth chart and suggest remedies.', 
          state.ucpEnabled,
          (v) {
            state.setUcpEnabled(v);
          }, 
          isDark,
        ),
        if (state.ucpEnabled) ...[
          const SizedBox(height: 10),
          GlassLightCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'UCP Access Token',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white70 : AppColors.brown900,
                      ),
                    ),
                    Row(
                      children: [
                        if (hasToken)
                          IconButton(
                            icon: const Icon(Icons.copy, size: 16, color: AppColors.gold),
                            tooltip: 'Copy Token',
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: state.ucpToken!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('📋 UCP Token copied to clipboard!'),
                                  backgroundColor: AppColors.gold,
                                ),
                              );
                            },
                          ),
                        TextButton(
                          onPressed: () {
                            state.rotateUcpToken();
                          },
                          child: Text(
                            'Rotate Key',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.gold : AppColors.brown700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.black26 : Colors.white70,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? Colors.white10 : AppColors.brown400,
                    ),
                  ),
                  child: Text(
                    state.ucpToken ?? 'Generating token...',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: AppColors.gold,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  '💡 Use this token in the AyuAstro Model Context Protocol (MCP) server configuration or with compatible AI Agents to sync your live planetary chart and unlock cosmic remedies.',
                  style: TextStyle(
                    fontSize: 9.5,
                    color: isDark ? Colors.white30 : AppColors.brown500,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _languageSetting(bool isDark, AppState state) {
    final curLang = state.language;
    String displayLang = 'English';
    if (curLang == 'hi') displayLang = 'Hindi';
    if (curLang == 'hinglish') displayLang = 'Sanskrit';

    return GlassLightCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          const Text('🌐', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vedic Language', 
                  style: TextStyle(
                    fontSize: 13, 
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  ),
                ),
                Text(
                  'Select display/transliteration system', 
                  style: TextStyle(
                    fontSize: 10, 
                    color: isDark ? Colors.white38 : AppColors.brown500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: displayLang,
                isDense: true,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? AppColors.goldLight : AppColors.goldDark),
                dropdownColor: isDark ? AppColors.darkCard : Colors.white,
                items: ['English', 'Hindi', 'Sanskrit']
                    .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) {
                    final code = v == 'English' ? 'en' : v == 'Hindi' ? 'hi' : 'hinglish';
                    state.setVedicLevel(code); // update state settings
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _themeModeSetting(bool isDark, AppState state) {
    final curMode = state.themeMode;
    String displayMode = 'System Default';
    if (curMode == ThemeMode.light) displayMode = 'Light (Beige)';
    if (curMode == ThemeMode.dark) displayMode = 'Dark (Cosmic)';

    return GlassLightCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          const Text('🎨', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'App Theme',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  ),
                ),
                Text(
                  'Switch light, dark or system themes',
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? Colors.white38 : AppColors.brown500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: displayMode,
                isDense: true,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? AppColors.goldLight : AppColors.goldDark),
                dropdownColor: isDark ? AppColors.darkCard : Colors.white,
                items: ['Light (Beige)', 'Dark (Cosmic)', 'System Default']
                    .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) {
                    final mode = v == 'Light (Beige)'
                        ? ThemeMode.light
                        : v == 'Dark (Cosmic)'
                            ? ThemeMode.dark
                            : ThemeMode.system;
                    state.setThemeMode(mode);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionTile(String label, IconData icon, Color color, bool isDark, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 14),
            Text(
              label, 
              style: TextStyle(
                fontSize: 13, 
                fontWeight: FontWeight.w600, 
                color: isDark ? Colors.white70 : AppColors.brown900,
              ),
            ),
            const Spacer(),
            Icon(Icons.chevron_right, color: isDark ? Colors.white12 : AppColors.brown100, size: 18),
          ],
        ),
      ),
    );
  }

  // ─── Custom Legends ─────────────────────────────────────────────────────────

  Widget _buildLegendItem(Color color, String text, bool dashed) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 24, height: 2,
          decoration: BoxDecoration(
            color: dashed ? null : color,
            border: dashed ? Border(
              bottom: BorderSide(color: color, width: 1, style: BorderStyle.solid),
            ) : null,
          ),
          child: dashed ? CustomPaint(
            painter: _DashedLinePainter(color: color),
          ) : null,
        ),
        const SizedBox(width: 6),
        Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w500, color: color)),
      ],
    );
  }

  Widget _buildLegendDot(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8, height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w500, color: AppColors.brown500)),
      ],
    );
  }

  // ─── Interactive Edit Profile Modal Sheet ───────────────────────────────────

  void _showEditProfileBottomSheet(BuildContext context, AppState state) {
    final currentDetails = state.birthDetails;
    
    final nameController = TextEditingController(text: currentDetails?.name ?? '');
    final placeController = TextEditingController(text: currentDetails?.placeOfBirth ?? '');
    
    String dateStr = currentDetails?.dateOfBirth ?? '1995-05-15';
    String timeStr = currentDetails?.timeOfBirth ?? '08:30';
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (sheetContext, setSheetState) {
            final sheetDark = Theme.of(sheetContext).brightness == Brightness.dark;
            
            Future<void> pickDate() async {
              DateTime initial = DateTime.tryParse(dateStr) ?? DateTime(1995, 5, 15);
              final picked = await showDatePicker(
                context: sheetContext,
                initialDate: initial,
                firstDate: DateTime(1930),
                lastDate: DateTime.now(),
              );
              if (picked != null) {
                setSheetState(() {
                  dateStr = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                });
              }
            }

            Future<void> pickTime() async {
              int hr = 8;
              int min = 30;
              final parts = timeStr.split(':');
              if (parts.length >= 2) {
                hr = int.tryParse(parts[0]) ?? 8;
                min = int.tryParse(parts[1]) ?? 30;
              }
              final picked = await showTimePicker(
                context: sheetContext,
                initialTime: TimeOfDay(hour: hr, minute: min),
              );
              if (picked != null) {
                setSheetState(() {
                  timeStr = "${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}";
                });
              }
            }

            return Container(
              padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(sheetContext).viewInsets.bottom + 24),
              decoration: BoxDecoration(
                color: sheetDark ? AppColors.darkCard : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                border: Border.all(
                  color: sheetDark ? Colors.white.withValues(alpha: 0.08) : AppColors.brown100,
                ),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                      Text(
                        'Recalculate Kundali details',
                        style: TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: sheetDark ? Colors.white : AppColors.brown900,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(sheetContext),
                      )
                    ],
                  ),
                  Divider(color: sheetDark ? Colors.white10 : AppColors.brown100),
                  const SizedBox(height: 16),
                  
                  // Name TextField
                  Text(
                    'Full Name',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.gold),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: nameController,
                    style: TextStyle(fontSize: 13, color: sheetDark ? Colors.white : AppColors.brown900),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: sheetDark ? Colors.white24 : AppColors.brown100),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // DateTime Picker Rows
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Birth Date',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.gold),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: pickDate,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: sheetDark ? Colors.white24 : AppColors.brown100),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(dateStr, style: TextStyle(fontSize: 13, color: sheetDark ? Colors.white70 : AppColors.brown900)),
                                    const Icon(Icons.calendar_today, size: 14, color: AppColors.gold),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Birth Time',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.gold),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: pickTime,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: sheetDark ? Colors.white24 : AppColors.brown100),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(timeStr, style: TextStyle(fontSize: 13, color: sheetDark ? Colors.white70 : AppColors.brown900)),
                                    const Icon(Icons.access_time, size: 14, color: AppColors.gold),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Place of Birth TextField
                  Text(
                    'Place of Birth',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.gold),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: placeController,
                    style: TextStyle(fontSize: 13, color: sheetDark ? Colors.white : AppColors.brown900),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      hintText: 'City, Country',
                      hintStyle: TextStyle(color: sheetDark ? Colors.white30 : AppColors.brown400),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: sheetDark ? Colors.white24 : AppColors.brown100),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Submit Button
                  NeonGoldButton(
                    text: 'Recalculate Cosmic Chart',
                    onPressed: () async {
                      if (nameController.text.trim().isEmpty || placeController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(sheetContext).showSnackBar(
                          const SnackBar(content: Text('⚠️ Name and place of birth are required.')),
                        );
                        return;
                      }
                      
                      Navigator.pop(sheetContext); // dismiss bottom sheet first
                      
                      // Perform recalculation in State
                      final newDetails = BirthDetails(
                        name: nameController.text.trim(),
                        dateOfBirth: dateStr,
                        timeOfBirth: timeStr,
                        placeOfBirth: placeController.text.trim(),
                        latitude: currentDetails?.latitude ?? 28.6139,
                        longitude: currentDetails?.longitude ?? 77.2090,
                        timezone: currentDetails?.timezone ?? '5.5',
                        gender: currentDetails?.gender ?? 'Male',
                        relationshipStatus: currentDetails?.relationshipStatus ?? 'Single',
                      );
                      
                      await state.updateBirthDetails(newDetails);
                      if (!context.mounted) return;
                      
                      if (state.error != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('❌ Calculation Error: ${state.error}')),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('✨ Cosmic alignments successfully recalculated!'), backgroundColor: AppColors.sage),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          );
          },
        );
      },
    );
  }

  void _showDeleteAccountConfirm(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Delete Cosmic Data?'),
          content: const Text('This will permanently delete all your calculations, mood trackers, and chat histories from local storage. This action is irreversible.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('🗑️ All local profile data deleted.')),
                );
              },
              child: const Text('Delete', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  String _getArchetype(String sunSign) {
    switch (sunSign.toLowerCase()) {
      case 'aries':
        return 'The Courageous Pioneer';
      case 'taurus':
        return 'The Patient Builder';
      case 'gemini':
        return 'The Versatile Messenger';
      case 'cancer':
        return 'The Intuitive Nurturer';
      case 'leo':
        return 'The Radiant Leader';
      case 'virgo':
        return 'The Precise Alchemist';
      case 'libra':
        return 'The Harmonious Diplomat';
      case 'scorpio':
        return 'The Alchemical Phoenix';
      case 'sagittarius':
        return 'The Explorer Sage';
      case 'capricorn':
        return 'The Driven Architect';
      case 'aquarius':
        return 'The Visionary Rebel';
      case 'pisces':
        return 'The Mystical Dreamer';
      default:
        return 'The Cosmic Traveler';
    }
  }

  Future<void> _captureAndSharePlacements(AppState state, BuildContext context) async {
    try {
      final boundary = _shareCardKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) {
        throw Exception("RepaintBoundary render object not found.");
      }

      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) {
        throw Exception("Failed to serialize image to byte data.");
      }
      final pngBytes = byteData.buffer.asUint8List();

      final directory = await getApplicationDocumentsDirectory();
      final nameSlug = state.birthDetails?.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_').toLowerCase() ?? 'seeker';
      final imagePath = '${directory.path}/ayuastro_blueprint_$nameSlug.png';
      final file = File(imagePath);
      await file.writeAsBytes(pngBytes);

      final sun = state.astrologyData?.sunSign ?? 'Capricorn';
      final moon = state.astrologyData?.moonSign ?? 'Gemini';
      final asc = state.astrologyData?.ascendant ?? 'Taurus';
      final archetype = _getArchetype(sun);

      final shareText = "✨ My Cosmic Blueprint on AyuAstro:\n"
          "☉ Sun: $sun\n"
          "☽ Moon: $moon\n"
          "↗ Rising: $asc\n"
          "👑 Archetype: $archetype\n\n"
          "Reveal your celestial alignment on AyuAstro! ✦";

      await Clipboard.setData(ClipboardData(text: shareText));

      if (context.mounted) {
        _showShareSuccessSheet(context, imagePath, shareText);
      }
    } catch (e) {
      debugPrint("Error exporting blueprint card: $e");
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Error exporting share card: ${e.toString()}"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _showShareSuccessSheet(BuildContext context, String imagePath, String shareText) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.78,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkBg : AppColors.cream,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.0),
          ),
          child: StarFieldBackground(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 48,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppColors.brown400,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Text("🎨", style: TextStyle(fontSize: 26)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Blueprint Generated!",
                              style: TextStyle(
                                color: isDark ? Colors.white : AppColors.brown900,
                                fontFamily: 'Playfair Display',
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            const Text(
                              "Saved successfully to local storage",
                              style: TextStyle(color: AppColors.sage, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.brown100, width: 0.8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(19),
                        child: Image.file(
                          File(imagePath),
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
                    ),
                    child: const Row(
                      children: [
                        Icon(LucideIcons.clipboard_check, color: AppColors.goldDark, size: 18),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Caption Template Copied!",
                                style: TextStyle(color: AppColors.goldDark, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 2),
                              Text(
                                "The cosmic summary text is copied. Paste it directly when sharing your Story or Status!",
                                style: TextStyle(color: AppColors.brown500, fontSize: 9, height: 1.3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text("Done & Share Now", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildShareCard(AppState state, bool isDark) {
    final sun = state.astrologyData?.sunSign ?? 'Capricorn';
    final moon = state.astrologyData?.moonSign ?? 'Gemini';
    final asc = state.astrologyData?.ascendant ?? 'Taurus';
    final nak = state.astrologyData?.nakshatra ?? 'Rohini';
    final name = state.birthDetails?.name ?? 'Cosmic Traveler';
    final archetype = _getArchetype(sun);

    return RepaintBoundary(
      key: _shareCardKey,
      child: Container(
        width: 320,
        height: 320,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            colors: [
              Color(0xFF140E26), // Deep violet
              Color(0xFF090614), // Midnight black
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(
            color: AppColors.gold,
            width: 2.0,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold.withValues(alpha: 0.12),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Stack(
            children: [
              Positioned(
                right: -40,
                bottom: -40,
                child: Opacity(
                  opacity: 0.08,
                  child: Text(
                    "🪐",
                    style: TextStyle(fontSize: 180, color: AppColors.gold),
                  ),
                ),
              ),
              Positioned(
                left: -30,
                top: -30,
                child: Opacity(
                  opacity: 0.06,
                  child: Text(
                    "✦",
                    style: TextStyle(fontSize: 100, color: AppColors.gold),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "MY COSMIC BLUEPRINT",
                                style: TextStyle(
                                  color: AppColors.goldLight,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                "AyuAstro Vedic Alignment",
                                style: TextStyle(
                                  color: Colors.white38,
                                  fontSize: 8,
                                  letterSpacing: 0.5,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          "✦",
                          style: TextStyle(color: AppColors.gold, fontSize: 16),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontFamily: 'Playfair Display',
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 0.8),
                        ),
                        child: Text(
                          archetype,
                          style: const TextStyle(
                            color: AppColors.goldLight,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: _buildPlacementItem("SUN SIGN", sun, "☉")),
                        Expanded(child: _buildPlacementItem("MOON SIGN", moon, "☽")),
                        Expanded(child: _buildPlacementItem("ASCENDANT", asc, "↗")),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      "Nakshatra: $nak ✦ Energized by Kashi Vedic Logic",
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 9,
                        fontStyle: FontStyle.italic,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    const Divider(color: Colors.white10, height: 1),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            "Reveal your alignment on AyuAstro App",
                            style: TextStyle(color: Colors.white30, fontSize: 8),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "ayuastro.com",
                          style: TextStyle(color: AppColors.gold, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlacementItem(String label, String value, String symbol) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white30, fontSize: 8, fontWeight: FontWeight.bold),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Text(
              symbol,
              style: const TextStyle(color: AppColors.gold, fontSize: 12),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPlacementsShareSection(AppState state, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.brown100,
        ),
        boxShadow: [
          BoxShadow(
            color: (isDark ? Colors.black : AppColors.brown900).withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Text("✨", style: TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Cosmic Placements Card",
                  style: TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.brown900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            "Share your primary planetary nodes on Instagram or WhatsApp to invite friends into the cosmic flow.",
            style: TextStyle(color: AppColors.brown500, fontSize: 11),
          ),
          const SizedBox(height: 16),
          Center(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: SizedBox(
                width: 320,
                height: 320,
                child: _buildShareCard(state, isDark),
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _captureAndSharePlacements(state, context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              elevation: 2,
            ),
            icon: const Icon(LucideIcons.share_2, size: 16),
            label: const Text(
              "Export & Copy Story Caption",
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Dashed Line Helper ──────────────────────────────────────────────────────
class _DashedLinePainter extends CustomPainter {
  final Color color;
  _DashedLinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const dashWidth = 3.0;
    const dashSpace = 2.0;
    double x = 0;
    while (x < size.width) {
      canvas.drawLine(Offset(x, size.height / 2), Offset(x + dashWidth, size.height / 2), paint);
      x += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
