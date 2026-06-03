import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';

class MoodTrackerScreen extends StatefulWidget {
  const MoodTrackerScreen({super.key});

  @override
  State<MoodTrackerScreen> createState() => _MoodTrackerScreenState();
}

class _MoodTrackerScreenState extends State<MoodTrackerScreen> {
  int _selectedMood = 3;
  final _noteController = TextEditingController();
  final List<String> _selectedTags = [];

  final List<Map<String, dynamic>> _moodEmojis = [
    {'score': 1, 'emoji': '😔', 'label': 'Very Low'},
    {'score': 2, 'emoji': '😐', 'label': 'Down'},
    {'score': 3, 'emoji': '😌', 'label': 'Peaceful'},
    {'score': 4, 'emoji': '😊', 'label': 'Good'},
    {'score': 5, 'emoji': '🤩', 'label': 'Excellent'},
  ];

  final List<String> _availableTags = [
    'grateful', 'peaceful', 'anxious', 'energetic', 'tired',
    'content', 'stressed', 'reflective', 'emotional', 'balanced'
  ];

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  void _submitEntry(AppState state) async {
    final emoji = _moodEmojis.firstWhere((e) => e['score'] == _selectedMood)['emoji'];
    await state.addMoodEntry(
      _selectedMood,
      emoji,
      _noteController.text.trim(),
      _selectedTags,
    );

    _noteController.clear();
    _selectedTags.clear();
    _showSnackBar("Daily emotional resonance logged!");
  }

  void _showSnackBar(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        backgroundColor: AppColors.sage,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Mood Tracker & Journal",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── 1. TODAY'S CHECK-IN ───
              _buildTodayCheckInCard(state, isDark),
              const SizedBox(height: 16),

              // ─── 2. MOOD TIMELINE ───
              _buildMoodTimelineCard(state, isDark),
              const SizedBox(height: 16),

              // ─── 3. INSIGHTS SUMMARY ───
              if (state.moodSummary != null) ...[
                _buildInsightsCard(state.moodSummary!, isDark),
                const SizedBox(height: 16),
              ],

              // ─── 4. JOURNAL HISTORY ───
              _buildJournalHistoryCard(state, isDark),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTodayCheckInCard(AppState state, bool isDark) {
    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "How is your energy today?",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 16),
          // Emojis row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _moodEmojis.map((e) {
              final isSelected = _selectedMood == e['score'];
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedMood = e['score'];
                  });
                },
                child: Container(
                  width: 50,
                  height: 50,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.gold.withValues(alpha: 0.12) : Colors.transparent,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? AppColors.gold : Colors.transparent,
                      width: 1.5,
                    ),
                  ),
                  child: Text(e['emoji'], style: const TextStyle(fontSize: 30)),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          // Note field
          TextField(
            controller: _noteController,
            style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontSize: 13),
            maxLines: 3,
            decoration: InputDecoration(
              hintText: "Write a brief journal note...",
              hintStyle: const TextStyle(color: AppColors.brown400, fontSize: 13),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: AppColors.brown100),
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: AppColors.gold),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Tag chips
          const Text("Select emotional tags:", style: TextStyle(color: AppColors.brown500, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: _availableTags.map((tag) {
              final isSelected = _selectedTags.contains(tag);
              return ChoiceChip(
                label: Text(tag, style: const TextStyle(fontSize: 10)),
                selected: isSelected,
                selectedColor: AppColors.sage.withValues(alpha: 0.2),
                backgroundColor: isDark ? Colors.white.withValues(alpha: 0.03) : Colors.white,
                side: BorderSide(color: isSelected ? AppColors.sage : AppColors.brown100),
                labelStyle: TextStyle(
                  color: isSelected ? AppColors.sage : (isDark ? Colors.white70 : AppColors.brown700),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedTags.add(tag);
                    } else {
                      _selectedTags.remove(tag);
                    }
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          NeonGoldButton(
            text: "Log Mood Check-in",
            onPressed: () => _submitEntry(state),
          ),
        ],
      ),
    );
  }

  Widget _buildMoodTimelineCard(AppState state, bool isDark) {
    final List<MoodEntry> last7Days = state.moodHistory.take(7).toList().reversed.toList();

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "7-Day Mood Timeline",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (last7Days.isEmpty)
            const SizedBox(
              height: 60,
              child: Center(
                child: Text("No entries logged this week yet.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
              ),
            )
          else
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: last7Days.map((entry) {
                final dateLabel = DateFormat('E').format(entry.createdAt);
                
                // Color mapping
                Color barColor = Colors.orange;
                if (entry.mood == 5) barColor = AppColors.sage;
                if (entry.mood == 4) barColor = Colors.greenAccent;
                if (entry.mood == 3) barColor = Colors.yellow;
                if (entry.mood == 1) barColor = Colors.redAccent;

                return Column(
                  children: [
                    Text(entry.emoji, style: const TextStyle(fontSize: 18)),
                    const SizedBox(height: 6),
                    Container(
                      width: 16,
                      height: entry.mood * 10.0,
                      decoration: BoxDecoration(
                        color: barColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      dateLabel,
                      style: const TextStyle(fontSize: 9, color: AppColors.brown500, fontWeight: FontWeight.bold),
                    ),
                  ],
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildInsightsCard(MoodHistorySummary summary, bool isDark) {
    final isGlow = summary.averageMood >= 4.0;
    
    return GlassLightCard(
      child: Row(
        children: [
          // Circular average ring
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  value: summary.averageMood / 5.0,
                  strokeWidth: 5,
                  color: AppColors.gold,
                  backgroundColor: AppColors.brown100,
                ),
              ),
              Text(
                summary.averageMood.toStringAsFixed(1),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.goldDark),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.flame, color: Colors.orange, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      "Streak: ${summary.streakDays} Days",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.orange),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  isGlow 
                      ? "Your energetic state is shining brightly! Align this period with strategic action plans."
                      : "Your mood is balancing. Take time for recovery, journaling, and light stretching.",
                  style: const TextStyle(color: AppColors.brown700, fontSize: 11, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJournalHistoryCard(AppState state, bool isDark) {
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Journal History",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (state.moodHistory.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24.0),
              child: Center(
                child: Text("Your journal is empty. Log a mood entry to start.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: state.moodHistory.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                final entry = state.moodHistory[index];
                final dateStr = DateFormat('dd MMM, hh:mm a').format(entry.createdAt);

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(entry.emoji, style: const TextStyle(fontSize: 20)),
                              const SizedBox(width: 8),
                              Text(
                                "Mood: ${entry.mood}/5",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: isDark ? Colors.white : AppColors.brown900,
                                ),
                              ),
                            ],
                          ),
                          Text(dateStr, style: const TextStyle(fontSize: 10, color: AppColors.brown400)),
                        ],
                      ),
                      if (entry.note != null && entry.note!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          entry.note!,
                          style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
                        ),
                      ],
                      if (entry.tags.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          runSpacing: 2,
                          children: entry.tags.map((tag) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.brown100,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(tag, style: const TextStyle(color: AppColors.brown700, fontSize: 8)),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
