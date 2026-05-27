import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import 'mood_tracker_screen.dart';
import '../models/models.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final astro = state.astrologyData;
    final numData = state.numerologyData;
    final details = state.birthDetails;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "Cosmic Profile",
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
              // ─── COSMIC IDENTITY CARD ───
              _buildCosmicIdentityCard(details, astro, isDark),
              const SizedBox(height: 16),

              // ─── COSMIC AGE CARD ───
              if (numData != null) ...[
                _buildCosmicAgeCard(numData.lifePathNumber, isDark),
                const SizedBox(height: 16),
              ],

              // ─── MOOD TRACKER CTA CARD ───
              _buildMoodTrackerCTA(context, isDark),
              const SizedBox(height: 16),

              // ─── TRAIT HIGHLIGHTS ───
              if (state.traitScores.isNotEmpty) ...[
                _buildTraitHighlightsCard(state.traitScores, isDark),
                const SizedBox(height: 16),
              ],

              // ─── ACCOUNT STATS ───
              _buildAccountStatsCard(state, isDark),
              const SizedBox(height: 24),

              // ─── RESET ACCOUNT ───
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent.withOpacity(0.1),
                  elevation: 0,
                  side: const BorderSide(color: Colors.redAccent, width: 0.8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      backgroundColor: isDark ? AppColors.darkCard : Colors.white,
                      title: const Text("Start Over?"),
                      content: const Text("This will clear all your profile data and calculated results."),
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
                child: const Text("Reset Cosmic Profile", style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCosmicIdentityCard(BirthDetails? details, AstrologyInfo? astro, bool isDark) {
    if (details == null) return const SizedBox();

    return GlassPremiumCard(
      child: Column(
        children: [
          const Text("🔮", style: TextStyle(fontSize: 32)),
          const SizedBox(height: 8),
          Text(
            details.name,
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "Cosmic Signature: ${astro?.sunSign} Sun ✦ ${astro?.moonSign} Moon",
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.goldDark, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMiniBadge("Gender: ${details.gender}"),
              _buildMiniBadge("Status: ${details.relationshipStatus}"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.sageLight.withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.sage, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildCosmicAgeCard(int lifePathNumber, bool isDark) {
    final int cosmicAge = lifePathNumber * 7 + 100;
    
    // Custom descriptions based on Life Path
    final List<String> descriptions = [
      "A soul seeking independence and pioneering fresh structural beginnings.",
      "An empathetic peacemaker, balancing dualities across lifetimes.",
      "A creative expressionist, learning to project inner truth onto physical canvases.",
      "A builder of solid foundations, locking structures of patience and practicality.",
      "A progressive adventurer, exploring freedom, adaptability, and wisdom.",
      "A nurturing caretaker, balancing universal responsibility with self-love.",
      "A spiritual analytical seeker, uncovering internal truths and esoteric logic.",
      "A manifestor of power and organization, balancing material and spiritual realms.",
      "A humanitarian leader, completing full karmic cycles and expressing empathy.",
    ];
    final String desc = descriptions[(lifePathNumber - 1) % descriptions.length];

    return GlassLightCard(
      child: Row(
        children: [
          const Text("♾️", style: TextStyle(fontSize: 24, color: AppColors.gold)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Cosmic Age: $cosmicAge Cycles",
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: const TextStyle(color: AppColors.brown500, fontSize: 11, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMoodTrackerCTA(BuildContext context, bool isDark) {
    return GlassLightCard(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const MoodTrackerScreen(),
          ),
        );
      },
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text("📔", style: TextStyle(fontSize: 24)),
              SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Mood & Journal Tracker",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  SizedBox(height: 2),
                  Text(
                    "Track your daily emotional resonance patterns",
                    style: TextStyle(color: AppColors.brown500, fontSize: 11),
                  ),
                ],
              ),
            ],
          ),
          Icon(LucideIcons.chevron_right, color: AppColors.gold),
        ],
      ),
    );
  }

  Widget _buildTraitHighlightsCard(List<TraitScore> traits, bool isDark) {
    // Sort traits to find top 3 and bottom 3
    final sorted = List<TraitScore>.from(traits)..sort((a, b) => b.score.compareTo(a.score));
    final topTraits = sorted.take(3).toList();
    final bottomTraits = sorted.reversed.take(3).toList();

    Widget buildBar(String label, int score, Color color) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4.0),
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
            ),
            Expanded(
              flex: 5,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(3),
                child: LinearProgressIndicator(
                  value: score / 100.0,
                  minHeight: 5,
                  color: color,
                  backgroundColor: AppColors.brown100,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text("$score%", style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    }

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Trait Resonance Map",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            "Top Strengths",
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.sage),
          ),
          const SizedBox(height: 6),
          ...topTraits.map((t) => buildBar(t.label, t.score, AppColors.sage)),
          const SizedBox(height: 16),
          const Text(
            "Growth Focus Areas",
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.goldDark),
          ),
          const SizedBox(height: 6),
          ...bottomTraits.map((t) => buildBar(t.label, t.score, AppColors.gold)),
        ],
      ),
    );
  }

  Widget _buildAccountStatsCard(AppState state, bool isDark) {
    Widget buildStatRow(String label, String value) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: AppColors.brown700)),
            Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.brown900)),
          ],
        ),
      );
    }

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "System Stats",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          buildStatRow("Analysis Status", "Calculated ✦"),
          buildStatRow("Diagnostic Quiz", "16/16 Answered"),
          buildStatRow("Premium Status", state.hasPaid ? "Unlocked Pro" : "Free Tier"),
        ],
      ),
    );
  }
}
