import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../models/models.dart';

class CosmicCalendarScreen extends StatefulWidget {
  const CosmicCalendarScreen({super.key});

  @override
  State<CosmicCalendarScreen> createState() => _CosmicCalendarScreenState();
}

class _CosmicCalendarScreenState extends State<CosmicCalendarScreen> {
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;
  String _activeFilter = 'all';
  final Set<String> _expandedEventKeys = {};

  final Map<int, Map<String, String>> _monthThemes = {
    1: {
      'theme': 'Foundations & Intentions',
      'description': 'The year begins with Saturnian discipline. Set structures that will hold your growth all year.'
    },
    2: {
      'theme': 'Inner Awakening',
      'description': 'Aquarius season brings collective vision. Your unique contribution to the world becomes clearer.'
    },
    3: {
      'theme': 'Transformation & Renewal',
      'description': 'Eclipse season stirs the pot. Old patterns dissolve; brave new paths emerge from the shadows.'
    },
    4: {
      'theme': 'Action & Courage',
      'description': 'Aries fire ignites fresh beginnings. Trust your impulse toward what excites you most.'
    },
    5: {
      'theme': 'Grounding & Growth',
      'description': 'Taurus energy stabilizes. Jupiter\'s expansion meets earthly patience — build with intention.'
    },
    6: {
      'theme': 'Communication & Curiosity',
      'description': 'Gemini season sparks mental agility. Mercury\'s dance amplifies both insight and confusion.'
    },
    7: {
      'theme': 'Emotional Depth',
      'description': 'Cancer season turns us inward. Venus retrograde asks: what do you truly value in love?'
    },
    8: {
      'theme': 'Creative Power',
      'description': 'Leo season radiates confidence. Express your truth boldly, even if your voice shakes.'
    },
    9: {
      'theme': 'Service & Healing',
      'description': 'Eclipse season returns. Virgo precision meets cosmic release — healing happens in the details.'
    },
    10: {
      'theme': 'Balance & Partnership',
      'description': 'Libra season seeks harmony. Relationships become mirrors for your deepest growth edges.'
    },
    11: {
      'theme': 'Depth & Truth',
      'description': 'Scorpio strips away the superficial. Mercury retrograde asks you to revisit what matters most.'
    },
    12: {
      'theme': 'Wisdom & Expansion',
      'description': 'Sagittarius season closes the year with philosophical fire. Integrate lessons and dream bigger.'
    },
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppState>(context, listen: false)
          .fetchCalendarEvents(_selectedMonth, _selectedYear);
    });
  }

  List<CalendarEvent> _getFilteredEvents(List<CalendarEvent> allEvents) {
    if (_activeFilter == 'all') {
      return allEvents;
    }
    return allEvents.where((e) => e.type == _activeFilter).toList();
  }

  List<CalendarEvent> _getUpcomingEvents(List<CalendarEvent> allEvents) {
    final now = DateTime.now();
    // Normalize now to midnight to include all of today
    final today = DateTime(now.year, now.month, now.day);
    final sevenDaysLater = today.add(const Duration(days: 7));
    return allEvents.where((e) {
      final eventDate = DateTime(e.date.year, e.date.month, e.date.day);
      return !eventDate.isBefore(today) && !eventDate.isAfter(sevenDaysLater);
    }).toList();
  }

  void _toggleEvent(CalendarEvent event) {
    final key = '${event.date.toIso8601String()}_${event.title}';
    setState(() {
      if (_expandedEventKeys.contains(key)) {
        _expandedEventKeys.remove(key);
      } else {
        _expandedEventKeys.add(key);
      }
    });
  }

  void _jumpToToday() {
    final now = DateTime.now();
    setState(() {
      _selectedMonth = now.month;
      _selectedYear = now.year;
    });
    Provider.of<AppState>(context, listen: false)
        .fetchCalendarEvents(_selectedMonth, _selectedYear);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    final now = DateTime.now();
    final isCurrentMonth = _selectedMonth == now.month && _selectedYear == now.year;
    final upcomingEvents = _getUpcomingEvents(state.calendarEvents);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back,
              color: isDark ? Colors.white70 : AppColors.brown700),
          onPressed: () => state.setView('insights'),
        ),
        title: Text(
          'Cosmic Calendar',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.brown900,
          ),
        ),
        actions: [
          if (!isCurrentMonth)
            TextButton.icon(
              onPressed: _jumpToToday,
              icon: Icon(Icons.calendar_today,
                  size: 14,
                  color: isDark ? AppColors.goldLight : AppColors.goldDark),
              label: Text(
                'Today',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.goldLight : AppColors.goldDark,
                ),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Month Selector Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: Icon(Icons.chevron_left,
                        color: (_selectedYear <= 2025 && _selectedMonth <= 1)
                            ? (isDark ? Colors.white12 : AppColors.brown100)
                            : (isDark ? Colors.white54 : AppColors.brown500)),
                    onPressed: (_selectedYear <= 2025 && _selectedMonth <= 1)
                        ? null
                        : () {
                            setState(() {
                              if (_selectedMonth == 1) {
                                _selectedMonth = 12;
                                _selectedYear--;
                              } else {
                                _selectedMonth--;
                              }
                            });
                            Provider.of<AppState>(context, listen: false)
                                .fetchCalendarEvents(_selectedMonth, _selectedYear);
                          },
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.25)),
                    ),
                    child: Text(
                      '${months[_selectedMonth - 1]} $_selectedYear',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.goldLight : AppColors.goldDark,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.chevron_right,
                        color: (_selectedYear >= 2026 && _selectedMonth >= 12)
                            ? (isDark ? Colors.white12 : AppColors.brown100)
                            : (isDark ? Colors.white54 : AppColors.brown500)),
                    onPressed: (_selectedYear >= 2026 && _selectedMonth >= 12)
                        ? null
                        : () {
                            setState(() {
                              if (_selectedMonth == 12) {
                                _selectedMonth = 1;
                                _selectedYear++;
                              } else {
                                _selectedMonth++;
                              }
                            });
                            Provider.of<AppState>(context, listen: false)
                                .fetchCalendarEvents(_selectedMonth, _selectedYear);
                          },
                  ),
                ],
              ),
            ),

            // Main Content Area
            if (state.isCalendarLoading)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: List.generate(4, (index) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _skeletonCard(isDark),
                  )),
                ),
              )
            else ...[
              // 1. Monthly Overview Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: _monthlyOverviewCard(state.calendarEvents, isDark),
              ),

              // 2. Next 7 Days (Upcoming highlights) - only if viewing current month and has upcoming events
              if (isCurrentMonth && upcomingEvents.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: _upcomingHighlightsCard(upcomingEvents, isDark),
                ),

              // 3. Filter Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    _filterChip('All', 'all', Icons.grid_view, isDark),
                    const SizedBox(width: 8),
                    _filterChip('Transits', 'transit', Icons.compare_arrows, isDark),
                    const SizedBox(width: 8),
                    _filterChip('Moons', 'moonPhase', Icons.nightlight_round, isDark),
                    const SizedBox(width: 8),
                    _filterChip('Retro', 'retrograde', Icons.replay, isDark),
                    const SizedBox(width: 8),
                    _filterChip('Eclipses', 'eclipse', Icons.brightness_medium, isDark),
                    const SizedBox(width: 8),
                    _filterChip('Yogas', 'specialYoga', Icons.auto_awesome, isDark),
                  ],
                ),
              ),

              // 4. Events list (filtered)
              _getFilteredEvents(state.calendarEvents).isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🌌', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            Text(
                              'No cosmic events found for this filter.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: isDark ? Colors.white54 : AppColors.brown500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Column(
                        children: _getFilteredEvents(state.calendarEvents)
                            .map((event) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _eventCard(event, isDark),
                                ))
                            .toList(),
                      ),
                    ),

              // 5. Jump to Current Month inline button at bottom
              if (!isCurrentMonth)
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 32),
                  child: Center(
                    child: OutlinedButton.icon(
                      onPressed: _jumpToToday,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.gold.withValues(alpha: 0.3)),
                        foregroundColor: isDark ? AppColors.goldLight : AppColors.goldDark,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: const Text('Jump to Current Month'),
                    ),
                  ),
                )
              else
                const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }

  Widget _filterChip(String label, String type, IconData icon, bool isDark) {
    final isActive = _activeFilter == type;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.gold.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive
                ? AppColors.gold.withValues(alpha: 0.4)
                : (isDark ? Colors.white12 : AppColors.brown100),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 14,
                color: isActive
                    ? AppColors.gold
                    : (isDark ? Colors.white38 : AppColors.brown400)),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isActive
                    ? AppColors.gold
                    : (isDark ? Colors.white54 : AppColors.brown500),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _monthlyOverviewCard(List<CalendarEvent> allEvents, bool isDark) {
    final themeInfo = _monthThemes[_selectedMonth] ?? _monthThemes[1]!;

    final avgImpact = allEvents.isNotEmpty
        ? (allEvents.fold<double>(0, (sum, e) => sum + e.emotionalImpact) /
            allEvents.length)
        : 0.0;
    final formattedAvgImpact = (avgImpact * 10).round() / 10.0;

    final sortedEvents = List<CalendarEvent>.from(allEvents)
      ..sort((a, b) => b.emotionalImpact.compareTo(a.emotionalImpact));
    final topEvents = sortedEvents.take(3).toList();

    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top border line with a linear gradient of gold, purple, sage
          Container(
            height: 4,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.gold,
                  Color(0xFF8B5CF6), // purple
                  AppColors.sage,
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.gold.withValues(alpha: 0.2),
                            const Color(0xFF8B5CF6).withValues(alpha: 0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.auto_awesome,
                          color: isDark ? AppColors.goldLight : AppColors.goldDark,
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            themeInfo['theme'] ?? '',
                            style: TextStyle(
                              fontFamily: 'Playfair Display',
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.brown900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            themeInfo['description'] ?? '',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white54 : AppColors.brown500,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (topEvents.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    'KEY EVENTS THIS MONTH',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: isDark ? Colors.white38 : AppColors.brown400,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...List.generate(topEvents.length, (index) {
                    final event = topEvents[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          if (event.emoji.isNotEmpty) ...[
                            Text(event.emoji, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 8),
                          ] else ...[
                            const Text('✨', style: TextStyle(fontSize: 14)),
                            const SizedBox(width: 8),
                          ],
                          Expanded(
                            child: Text(
                              event.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: isDark ? Colors.white70 : AppColors.brown800,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '★ TOP ${index + 1}',
                              style: const TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                                color: AppColors.goldDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
                if (allEvents.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Text(
                        'EMOTIONAL INTENSITY',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                          color: isDark ? Colors.white38 : AppColors.brown400,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '$formattedAvgImpact/5',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white70 : AppColors.brown700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    height: 8,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white12 : AppColors.brown100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: avgImpact / 5.0,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          gradient: const LinearGradient(
                            colors: [
                              AppColors.sage,
                              AppColors.gold,
                              Colors.orange,
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _upcomingHighlightsCard(List<CalendarEvent> upcomingEvents, bool isDark) {
    final typeColors = {
      'transit': const Color(0xFF3B82F6),
      'eclipse': const Color(0xFF8B5CF6),
      'retrograde': const Color(0xFFF97316),
      'moonPhase': const Color(0xFF10B981),
      'specialYoga': const Color(0xFFD4AF37),
    };
    final typeLabels = {
      'transit': 'Transit',
      'eclipse': 'Eclipse',
      'retrograde': 'Retrograde',
      'moonPhase': 'Moon Phase',
      'specialYoga': 'Special Yoga',
    };

    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 4,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.sage,
                  AppColors.gold,
                  Colors.orange,
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.calendar_today,
                      size: 16,
                      color: AppColors.gold,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Next 7 Days',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.brown900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...upcomingEvents.map((event) {
                  final color = typeColors[event.type] ?? Colors.grey;
                  final label = typeLabels[event.type] ?? event.type;
                  final day = event.date.day;
                  final monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][event.date.month - 1];
                  final now = DateTime.now();
                  final isEvToday = event.date.year == now.year &&
                      event.date.month == now.month &&
                      event.date.day == now.day;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isEvToday
                          ? AppColors.gold.withValues(alpha: 0.1)
                          : (isDark ? Colors.white.withValues(alpha: 0.04) : AppColors.brown100.withValues(alpha: 0.4)),
                      borderRadius: BorderRadius.circular(10),
                      border: isEvToday
                          ? Border.all(color: AppColors.gold.withValues(alpha: 0.2))
                          : null,
                    ),
                    child: Row(
                      children: [
                        if (event.emoji.isNotEmpty) ...[
                          Text(event.emoji, style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 10),
                        ] else ...[
                          const Text('✨', style: TextStyle(fontSize: 18)),
                          const SizedBox(width: 10),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                event.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : AppColors.brown900,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '$monthAbbr $day · Impact: ${event.emotionalImpact}/5',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isDark ? Colors.white38 : AppColors.brown400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            label.toUpperCase(),
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              color: color,
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
      ),
    );
  }

  Widget _eventCard(CalendarEvent event, bool isDark) {
    final now = DateTime.now();
    final isEvToday = event.date.year == now.year &&
        event.date.month == now.month &&
        event.date.day == now.day;

    final day = event.date.day;
    final monthAbbr = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ][event.date.month - 1].toUpperCase();

    final key = '${event.date.toIso8601String()}_${event.title}';
    final isExpanded = _expandedEventKeys.contains(key);

    final typeColors = {
      'transit': const Color(0xFF3B82F6),
      'eclipse': const Color(0xFF8B5CF6),
      'retrograde': const Color(0xFFF97316),
      'moonPhase': const Color(0xFF10B981),
      'specialYoga': const Color(0xFFD4AF37),
    };
    final typeLabels = {
      'transit': 'Transit',
      'eclipse': 'Eclipse',
      'retrograde': 'Retrograde',
      'moonPhase': 'Moon Phase',
      'specialYoga': 'Special Yoga',
    };

    final color = typeColors[event.type] ?? Colors.grey;
    final typeLabel = typeLabels[event.type] ?? event.type;

    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.white,
      clipBehavior: Clip.antiAlias,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        decoration: BoxDecoration(
          border: isEvToday
              ? Border.all(color: AppColors.gold.withValues(alpha: 0.5), width: 2)
              : null,
        ),
        child: Column(
          children: [
            InkWell(
              onTap: () => _toggleEvent(event),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Date Badge
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: isEvToday
                            ? AppColors.gold.withValues(alpha: 0.15)
                            : (isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.cream),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '$day',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isEvToday
                                  ? (isDark ? AppColors.goldLight : AppColors.goldDark)
                                  : (isDark ? Colors.white70 : AppColors.brown700),
                            ),
                          ),
                          Text(
                            monthAbbr,
                            style: TextStyle(
                              fontSize: 10,
                              letterSpacing: 0.8,
                              fontWeight: FontWeight.w600,
                              color: isEvToday
                                  ? (isDark
                                      ? AppColors.goldLight.withValues(alpha: 0.7)
                                      : AppColors.goldDark.withValues(alpha: 0.7))
                                  : (isDark ? Colors.white38 : AppColors.brown400),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Middle Content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              if (event.emoji.isNotEmpty) ...[
                                Text(event.emoji, style: const TextStyle(fontSize: 16)),
                                const SizedBox(width: 6),
                              ] else ...[
                                const Text('✨', style: TextStyle(fontSize: 16)),
                                const SizedBox(width: 6),
                              ],
                              Expanded(
                                child: Text(
                                  event.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontFamily: 'Playfair Display',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : AppColors.brown900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  typeLabel.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: color,
                                  ),
                                ),
                              ),
                              if (isEvToday) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.gold.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'TODAY',
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.goldDark,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Impact Gauge
                          Row(
                            children: [
                              Text(
                                'Impact: ',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isDark ? Colors.white38 : AppColors.brown400,
                                ),
                              ),
                              const SizedBox(width: 4),
                              ...List.generate(5, (i) {
                                final active = i < event.emotionalImpact;
                                return Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 1),
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: active
                                        ? (isDark ? AppColors.goldLight : AppColors.goldDark)
                                        : (isDark ? Colors.white12 : AppColors.brown100),
                                  ),
                                );
                              }),
                            ],
                          ),
                          if (!isExpanded && event.guidance.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              event.guidance,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? Colors.white54 : AppColors.brown500,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Chevron Indicator
                    RotationTransition(
                      turns: AlwaysStoppedAnimation(isExpanded ? 0.5 : 0.0),
                      child: Icon(
                        Icons.keyboard_arrow_down,
                        size: 20,
                        color: isDark ? Colors.white30 : AppColors.brown400,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (isExpanded) ...[
              Padding(
                padding: const EdgeInsets.only(left: 84, right: 16, bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Divider(height: 1, thickness: 1),
                    const SizedBox(height: 12),
                    // About This Event box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withValues(alpha: 0.04) : AppColors.brown100.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ABOUT THIS EVENT',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                              color: isDark ? Colors.white38 : AppColors.brown400,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            event.description,
                            style: TextStyle(
                              fontSize: 12,
                              height: 1.4,
                              color: isDark ? Colors.white70 : AppColors.brown700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (event.guidance.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      // Guidance Box
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: isDark ? 0.08 : 0.05),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'COSMIC GUIDANCE',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                                color: isDark ? AppColors.goldLight : AppColors.goldDark,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              event.guidance,
                              style: TextStyle(
                                fontSize: 12,
                                height: 1.4,
                                color: isDark ? Colors.white70 : AppColors.brown700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
}

  Widget _skeletonCard(bool isDark) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.brown100,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 150,
                    height: 14,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.brown100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 80,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.brown100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 100,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.05) : AppColors.brown100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
