import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../models/models.dart';

// ─── Constants & Prompts ─────────────────────────────────────────────────────
final List<Map<String, String>> _slots = [
  {'key': 'morning', 'emoji': '🌅', 'label': 'Morning', 'time': 'Start your day with gratitude'},
  {'key': 'afternoon', 'emoji': '☀️', 'label': 'Afternoon', 'time': 'Pause and reflect mid-day'},
  {'key': 'evening', 'emoji': '🌙', 'label': 'Evening', 'time': 'Close your day with thanks'},
];

final Map<String, List<String>> _gratitudePrompts = {
  'Aries': [
    'What bold step did you take today that you\'re proud of?',
    'Who inspired your courage recently?',
    'What physical energy are you grateful for today?',
    'What challenge helped you grow stronger?',
    'What new beginning are you thankful for?',
    'Who pushed you to be your best self?',
    'What victory — big or small — are you celebrating today?',
  ],
  'Taurus': [
    'What comfort in your life are you most grateful for?',
    'Which sensory experience brought you joy today?',
    'What stability in your life do you appreciate?',
    'What beautiful thing did you notice today?',
    'What resource or possession are you thankful for?',
    'Who provides you with a sense of security?',
    'What patience in yourself are you grateful for?',
  ],
  'Gemini': [
    'What conversation enriched your mind today?',
    'What new idea sparked excitement in you?',
    'Who made you laugh or think differently today?',
    'What did you learn that you\'re grateful for?',
    'What connection — old or new — are you appreciating?',
    'What variety in your life brings you joy?',
    'What words — spoken or written — touched your heart today?',
  ],
  'Cancer': [
    'Who made you feel emotionally safe today?',
    'What memory are you grateful to carry?',
    'What home comfort are you appreciating right now?',
    'Who nurtured you when you needed it?',
    'What emotional depth are you thankful for in yourself?',
    'What family bond are you cherishing today?',
    'What intuitive knowing guided you well recently?',
  ],
  'Leo': [
    'What moment made you feel truly alive today?',
    'Who appreciated your unique light recently?',
    'What creative expression are you proud of?',
    'What act of generosity — given or received — touched you?',
    'What recognition or acknowledgment are you grateful for?',
    'What playful moment brought you pure joy?',
    'Who helped you shine brighter today?',
  ],
  'Virgo': [
    'What small detail are you grateful someone noticed?',
    'What improvement in your life are you appreciating today?',
    'What act of service — yours or someone else\'s — made a difference?',
    'What routine brings you comfort and stability?',
    'What health practice are you thankful for?',
    'Who helped you feel more organized or grounded?',
    'What problem did you solve that you\'re proud of?',
  ],
  'Libra': [
    'What harmony in your life are you grateful for?',
    'Who brought balance to your world today?',
    'What beauty — in any form — moved you recently?',
    'What partnership are you appreciating today?',
    'What fair outcome are you thankful for?',
    'What peaceful moment are you cherishing?',
    'Who helped you see both sides of a situation?',
  ],
  'Scorpio': [
    'What transformation are you grateful for today?',
    'What emotional truth are you thankful you faced?',
    'Who trusted you with their vulnerability?',
    'What hidden strength did you discover in yourself?',
    'What ending led to a meaningful new beginning?',
    'What depth of connection are you appreciating?',
    'What power — used wisely — are you proud of?',
  ],
  'Sagittarius': [
    'What adventure — big or small — are you grateful for?',
    'What truth did you discover that shifted your perspective?',
    'What freedom in your life do you appreciate today?',
    'Who expanded your horizons recently?',
    'What learning journey are you thankful to be on?',
    'What optimistic moment lifted your spirits?',
    'What philosophical insight brought you peace?',
  ],
  'Capricorn': [
    'What achievement are you most grateful for today?',
    'Who supported your ambitions when it mattered?',
    'What discipline are you thankful you maintained?',
    'What mountain did you climb — literally or figuratively?',
    'What legacy-building effort are you proud of?',
    'What responsibility are you grateful to carry?',
    'What structure in your life brings you security?',
  ],
  'Aquarius': [
    'What unique perspective are you grateful for today?',
    'Who accepted your authentic self without judgment?',
    'What vision for a better future inspires you?',
    'What community or cause are you thankful to be part of?',
    'What innovation or change are you appreciating?',
    'Who celebrated your individuality recently?',
    'What friendship expanded your worldview?',
  ],
  'Pisces': [
    'What dream — waking or sleeping — inspired you today?',
    'Who showed you compassion when you needed it most?',
    'What creative or spiritual experience are you grateful for?',
    'What intuitive hit guided you well recently?',
    'What act of kindness — given or received — touched your soul?',
    'What moment of transcendence are you appreciating?',
    'What emotional release are you thankful for?',
  ],
};

int _deterministicHash(String str) {
  int hash = 0;
  for (int i = 0; i < str.length; i++) {
    int char = str.codeUnitAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.abs();
}

String _getDailyPrompt(String sunSign, String slot) {
  final todayStr = DateTime.now().toIso8601String().split('T')[0];
  final key = todayStr + sunSign + slot;
  final hash = _deterministicHash(key);
  final pool = _gratitudePrompts[sunSign] ?? _gratitudePrompts['Capricorn']!;
  return pool[hash % pool.length];
}

// ─── Screen Widget ───────────────────────────────────────────────────────────
class GratitudeJournalScreen extends StatefulWidget {
  const GratitudeJournalScreen({super.key});

  @override
  State<GratitudeJournalScreen> createState() => _GratitudeJournalScreenState();
}

class _GratitudeJournalScreenState extends State<GratitudeJournalScreen> {
  String _activeSlot = 'morning';
  final TextEditingController _textController = TextEditingController();
  
  bool _practiceSuccess = false;
  Timer? _successBannerTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = Provider.of<AppState>(context, listen: false);
      state.fetchGratitudeHistory().then((_) => _prefillActiveSlot());
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _successBannerTimer?.cancel();
    super.dispose();
  }

  void _prefillActiveSlot() {
    final state = Provider.of<AppState>(context, listen: false);
    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    
    final todayEntry = state.gratitudeHistory.firstWhere(
      (e) => e.slot == _activeSlot && e.createdAt.toIso8601String().split('T')[0] == todayStr,
      orElse: () => GratitudeEntry(id: '', slot: _activeSlot, content: '', createdAt: DateTime.now()),
    );
    
    setState(() {
      _textController.text = todayEntry.content;
    });
  }

  Future<void> _handleSubmit() async {
    final state = Provider.of<AppState>(context, listen: false);
    final content = _textController.text.trim();
    if (content.isEmpty) return;

    FocusScope.of(context).unfocus();
    await state.saveGratitude(_activeSlot, content);

    if (state.error == null) {
      setState(() {
        _practiceSuccess = true;
      });
      _successBannerTimer?.cancel();
      _successBannerTimer = Timer(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _practiceSuccess = false;
          });
        }
      });
    }
  }

  // Check if a slot has been submitted today
  bool _isSlotSubmittedToday(String slot, List<GratitudeEntry> history) {
    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    return history.any(
      (e) => e.slot == slot && e.createdAt.toIso8601String().split('T')[0] == todayStr,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final sunSign = state.astrologyData?.sunSign ?? 'Capricorn';
    
    final history = state.gratitudeHistory;
    final stats = state.gratitudeStats;
    final streak = stats?.streak ?? 0;
    final total = stats?.totalEntries ?? 0;
    final mostCommon = stats?.mostCommonSlot ?? 'morning';

    final isSubmitted = _isSlotSubmittedToday(_activeSlot, history);
    final dailyPrompt = _getDailyPrompt(sunSign, _activeSlot);

    // Build past 7 days timeline
    final today = DateTime.now();
    final List<Map<String, dynamic>> last7Days = List.generate(7, (i) {
      final date = today.subtract(Duration(days: 6 - i));
      final dayKey = date.toIso8601String().split('T')[0];
      final dayEntries = history.where((e) => e.createdAt.toIso8601String().split('T')[0] == dayKey).toList();
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        'dayName': dayNames[date.weekday % 7],
        'count': dayEntries.length,
        'entries': dayEntries,
        'isToday': i == 6,
      };
    });

    final allTodayDone = _isSlotSubmittedToday('morning', history) &&
        _isSlotSubmittedToday('afternoon', history) &&
        _isSlotSubmittedToday('evening', history);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        state.setView('insights');
      },
      child: Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
            onPressed: () => state.setView('insights'),
          ),
          title: Text(
            'Gratitude Journal',
            style: TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.brown900,
            ),
          ),
          actions: [
            if (streak > 0)
              Padding(
                padding: const EdgeInsets.only(right: 16.0),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.flame, color: AppColors.gold, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '$streak',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.goldDark,
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              )
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 40),
          child: Column(
            children: [
              // ─── "I Practiced Today" success animation banner ───
              AnimatedSize(
                duration: const Duration(milliseconds: 300),
                child: _practiceSuccess
                    ? Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0x30A5D6A7), Color(0x10D4AF37)],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.sage.withValues(alpha: 0.3)),
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.sage.withValues(alpha: 0.2),
                                ),
                                child: const Icon(LucideIcons.check, color: AppColors.sage, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: const [
                                    Text(
                                      'I Practiced Today!',
                                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.sage),
                                    ),
                                    Text(
                                      'Your gratitude is shaping your world',
                                      style: TextStyle(fontSize: 10, color: Colors.grey),
                                    )
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),

              // ─── Section 1: Today I'm grateful for... ───
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
                              Icon(LucideIcons.book_open, color: AppColors.gold, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Today I\'m grateful for...',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.goldDark,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            dailyPrompt,
                            style: TextStyle(
                              fontSize: 11,
                              fontStyle: FontStyle.italic,
                              color: isDark ? Colors.white38 : AppColors.brown500,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Slot Tabs Switcher
                          Row(
                            children: _slots.map((slot) {
                              final key = slot['key']!;
                              final isCurrent = _activeSlot == key;
                              final hasSubmitted = _isSlotSubmittedToday(key, history);

                              return Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                  child: GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _activeSlot = key;
                                      });
                                      _prefillActiveSlot();
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      decoration: BoxDecoration(
                                        color: isCurrent
                                            ? AppColors.gold.withValues(alpha: 0.12)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: isCurrent
                                              ? AppColors.gold.withValues(alpha: 0.3)
                                              : (isDark ? Colors.white10 : AppColors.brown100),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Column(
                                        children: [
                                          Text(slot['emoji']!, style: const TextStyle(fontSize: 18)),
                                          const SizedBox(height: 2),
                                          Text(
                                            slot['label']!,
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: isCurrent ? AppColors.goldDark : Colors.grey,
                                            ),
                                          ),
                                          if (hasSubmitted)
                                            const Padding(
                                              padding: EdgeInsets.only(top: 2.0),
                                              child: Icon(LucideIcons.check, color: AppColors.sage, size: 10),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 20),

                          // Slot Content Box
                          Row(
                            children: [
                              Text(
                                '${_slots.firstWhere((s) => s['key'] == _activeSlot)['emoji']} ${_slots.firstWhere((s) => s['key'] == _activeSlot)['label']} Gratitude',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white70 : AppColors.brown700,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '${_textController.text.length}/500',
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          isSubmitted
                              ? Container(
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.03) : AppColors.cream.withValues(alpha: 0.4),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.sage.withValues(alpha: 0.2)),
                                  ),
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '"${_textController.text}"',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontStyle: FontStyle.italic,
                                          height: 1.4,
                                          color: isDark ? Colors.white70 : AppColors.brown700,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: const [
                                          Icon(LucideIcons.check, color: AppColors.sage, size: 12),
                                          SizedBox(width: 4),
                                          Text(
                                            'Saved',
                                            style: TextStyle(fontSize: 10, color: AppColors.sage, fontWeight: FontWeight.bold),
                                          )
                                        ],
                                      )
                                    ],
                                  ),
                                )
                              : Column(
                                  children: [
                                    TextField(
                                      controller: _textController,
                                      maxLines: 4,
                                      maxLength: 500,
                                      onChanged: (text) => setState(() {}),
                                      buildCounter: (_, {required currentLength, required isFocused, maxLength}) => const SizedBox.shrink(),
                                      decoration: InputDecoration(
                                        hintText: 'What are you grateful for this $_activeSlot...',
                                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                                        filled: true,
                                        fillColor: isDark ? Colors.white.withValues(alpha: 0.03) : AppColors.cream.withValues(alpha: 0.3),
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          borderSide: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
                                        ),
                                        contentPadding: const EdgeInsets.all(12),
                                      ),
                                      style: TextStyle(fontSize: 13, color: isDark ? Colors.white : AppColors.brown900),
                                    ),
                                    const SizedBox(height: 12),
                                    SizedBox(
                                      width: double.infinity,
                                      child: state.isLoading
                                          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
                                          : ElevatedButton.icon(
                                              onPressed: _textController.text.trim().isEmpty ? null : _handleSubmit,
                                              icon: const Icon(LucideIcons.check, size: 16),
                                              label: Text('Save ${_slots.firstWhere((s) => s['key'] == _activeSlot)['label']} Gratitude'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.gold,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(vertical: 12),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                              ),
                                            ),
                                    )
                                  ],
                                ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Section 2: Today's Gratitude Flow ───
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
                  children: [
                    Container(
                      height: 4,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.sage, AppColors.gold, AppColors.sage],
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
                                "Today's Gratitude Flow",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.goldDark,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          allTodayDone
                              ? Center(
                                  child: Column(
                                    children: [
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: const [
                                          Text('🌅', style: TextStyle(fontSize: 24)),
                                          SizedBox(width: 8),
                                          Text('☀️', style: TextStyle(fontSize: 24)),
                                          SizedBox(width: 8),
                                          Text('🌙', style: TextStyle(fontSize: 24)),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      const Text(
                                        'Complete Gratitude Day!',
                                        style: TextStyle(
                                          fontFamily: 'Playfair Display',
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.sage,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'You\'ve filled all three gratitude slots today',
                                        style: TextStyle(fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500),
                                      ),
                                      const SizedBox(height: 8),
                                    ],
                                  ),
                                )
                              : Column(
                                  children: _slots.map((slot) {
                                    final key = slot['key']!;
                                    final hasSubmitted = _isSlotSubmittedToday(key, history);
                                    final todayEntry = history.firstWhere(
                                      (e) => e.slot == key && e.createdAt.toIso8601String().split('T')[0] == today.toIso8601String().split('T')[0],
                                      orElse: () => GratitudeEntry(id: '', slot: key, content: '', createdAt: DateTime.now()),
                                    );

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: hasSubmitted
                                            ? AppColors.sage.withValues(alpha: 0.06)
                                            : (isDark ? Colors.white.withValues(alpha: 0.02) : AppColors.cream.withValues(alpha: 0.3)),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: hasSubmitted ? AppColors.sage.withValues(alpha: 0.2) : Colors.transparent,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Text(slot['emoji']!, style: const TextStyle(fontSize: 20)),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  slot['label']!,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: isDark ? Colors.white70 : AppColors.brown700,
                                                  ),
                                                ),
                                                Text(
                                                  hasSubmitted ? todayEntry.content : slot['time']!,
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                                                )
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: hasSubmitted ? AppColors.sage.withValues(alpha: 0.15) : Colors.white10,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Row(
                                              children: [
                                                if (hasSubmitted)
                                                  const Icon(LucideIcons.check, color: AppColors.sage, size: 8),
                                                const SizedBox(width: 2),
                                                Text(
                                                  hasSubmitted ? 'Done' : 'Pending',
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.bold,
                                                    color: hasSubmitted ? AppColors.sage : Colors.grey,
                                                  ),
                                                )
                                              ],
                                            ),
                                          )
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                )
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Section 3: Streak & Stats Card ───
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
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.flame, color: AppColors.gold, size: 18),
                            const SizedBox(width: 4),
                            Text(
                              '$streak',
                              style: TextStyle(
                                fontFamily: 'Playfair Display',
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : AppColors.brown900,
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text('Day Streak', style: TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(
                          '$total',
                          style: TextStyle(
                            fontFamily: 'Playfair Display',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : AppColors.brown900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text('Total Entries', style: TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(
                          mostCommon == 'morning' ? '🌅' : mostCommon == 'afternoon' ? '☀️' : '🌙',
                          style: const TextStyle(fontSize: 20),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          mostCommon.toUpperCase(),
                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Section 4: Gratitude History Timeline ───
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
                        Icon(LucideIcons.book_open, color: AppColors.gold, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Gratitude History',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.goldDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('Past 7 days', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    const SizedBox(height: 16),

                    state.isGratitudeHistoryLoading
                        ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: last7Days.length,
                            itemBuilder: (context, idx) {
                              final day = last7Days[idx];
                              final dayEntries = day['entries'] as List<GratitudeEntry>;
                              final count = day['count'] as int;
                              final isToday = day['isToday'] as bool;

                              final hasMorning = dayEntries.any((e) => e.slot == 'morning');
                              final hasAfternoon = dayEntries.any((e) => e.slot == 'afternoon');
                              final hasEvening = dayEntries.any((e) => e.slot == 'evening');

                              return Container(
                                padding: const EdgeInsets.symmetric(vertical: 8.0),
                                child: Row(
                                  children: [
                                    // Day Label
                                    SizedBox(
                                      width: 40,
                                      child: Text(
                                        day['dayName'],
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                                          color: isToday
                                              ? AppColors.goldDark
                                              : (isDark ? Colors.white54 : AppColors.brown500),
                                        ),
                                      ),
                                    ),

                                    // Dot Connector Indicator
                                    Column(
                                      children: [
                                        Container(
                                          width: 12,
                                          height: 12,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: count == 3
                                                ? AppColors.sage
                                                : (count > 0 ? AppColors.gold : Colors.grey.withValues(alpha: 0.4)),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 20),

                                    // Slots Emojis
                                    Row(
                                      children: [
                                        Opacity(opacity: hasMorning ? 1.0 : 0.2, child: const Text('🌅', style: TextStyle(fontSize: 14))),
                                        const SizedBox(width: 8),
                                        Opacity(opacity: hasAfternoon ? 1.0 : 0.2, child: const Text('☀️', style: TextStyle(fontSize: 14))),
                                        const SizedBox(width: 8),
                                        Opacity(opacity: hasEvening ? 1.0 : 0.2, child: const Text('🌙', style: TextStyle(fontSize: 14))),
                                      ],
                                    ),
                                    const Spacer(),

                                    // Count
                                    Text(
                                      '$count/3',
                                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              );
                            },
                          )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Section 5: Gratitude Insights ───
              if (total > 0)
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.gold.withValues(alpha: 0.05), AppColors.sage.withValues(alpha: 0.1)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.15)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(LucideIcons.sparkles, color: AppColors.gold, size: 14),
                          SizedBox(width: 6),
                          Text(
                            'Gratitude Insight',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.goldDark,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        streak >= 7
                            ? 'Amazing! A week-long gratitude streak. Your mind is rewiring itself for positivity and abundance.'
                            : (streak >= 3
                                ? 'Three days of gratitude! Research shows this is when the brain starts forming new positive neural pathways.'
                                : 'Every gratitude entry rewires your brain for positivity. Keep going — even small moments of thanks create big changes.'),
                        style: TextStyle(
                          fontSize: 12,
                          height: 1.4,
                          color: isDark ? Colors.white60 : AppColors.brown500,
                        ),
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
}
