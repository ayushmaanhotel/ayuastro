import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class CompatibilityDetailScreen extends StatelessWidget {
  const CompatibilityDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final mySign = state.astrologyData?.moonSign ?? 'Aries';
    final partnerSign = state.compatPartnerSign ?? 'Leo';

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
          "Compatibility Details",
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
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── OVERALL HEADER ───
              _buildOverallScoreCard(state),
              const SizedBox(height: 16),

              // ─── SUB-SCORES GRID ───
              _buildSubScoresSection(context, state),
              const SizedBox(height: 16),

              // ─── ELEMENT HARMONY ───
              _buildElementHarmonyCard(mySign, partnerSign),
              const SizedBox(height: 16),

              // ─── STRENGTHS & GROWTH AREAS ───
              _buildStrengthsGrowthCard(state),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverallScoreCard(AppState state) {
    return GlassPremiumCard(
      child: Column(
        children: [
          Text(
            "Cosmic Union ✦",
            style: TextStyle(color: AppColors.gold, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Playfair Display'),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                state.astrologyData?.moonSign ?? '?',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.brown900),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 24)),
              ),
              Text(
                state.compatPartnerSign ?? '?',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.brown900),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "Overall Match: ${state.compatOverallScore}%",
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.goldDark),
          ),
        ],
      ),
    );
  }

  Widget _buildSubScoresSection(BuildContext context, AppState state) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Widget buildRow(String title, int score, Color color) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                Text("$score/100", style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: score / 100.0,
                minHeight: 6,
                color: color,
                backgroundColor: isDark ? Colors.white.withValues(alpha: 0.04) : AppColors.brown100,
              ),
            ),
          ],
        ),
      );
    }

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Compatibility Dimensions",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          buildRow("Emotional Compatibility", state.compatEmotionalScore, AppColors.sage),
          buildRow("Communication Style", state.compatCommunicationScore, AppColors.gold),
          buildRow("Mutual Trust & Alignment", state.compatTrustScore, Colors.blue),
        ],
      ),
    );
  }

  Widget _buildElementHarmonyCard(String mySign, String partnerSign) {
    final elementScores = {
      'Fire': ['Aries', 'Leo', 'Sagittarius'],
      'Earth': ['Taurus', 'Virgo', 'Capricorn'],
      'Air': ['Gemini', 'Libra', 'Aquarius'],
      'Water': ['Cancer', 'Scorpio', 'Pisces'],
    };

    String getElement(String sign) {
      for (var entry in elementScores.entries) {
        if (entry.value.contains(sign)) return entry.key;
      }
      return 'Fire';
    }

    final myElement = getElement(mySign);
    final partnerElement = getElement(partnerSign);

    String harmonyText = "";
    if (myElement == partnerElement) {
      harmonyText = "You share the same element ($myElement). This creates an immediate intuitive understanding, matching instincts, and shared core values. You speak the same silent language.";
    } else if (
      (myElement == 'Fire' && partnerElement == 'Air') ||
      (myElement == 'Air' && partnerElement == 'Fire')
    ) {
      harmonyText = "Fire and Air feed each other. Air inspires Fire with thoughts, plans, and communication, while Fire energizes Air with action, warmth, and vitality.";
    } else if (
      (myElement == 'Earth' && partnerElement == 'Water') ||
      (myElement == 'Water' && partnerElement == 'Earth')
    ) {
      harmonyText = "Earth and Water are mutually supportive. Water nourishes the Earth, unlocking emotional depth, while Earth structures Water, providing safety and boundaries.";
    } else {
      harmonyText = "Your elements ($myElement & $partnerElement) have differing core drives. While this can sometimes cause friction, it also represents a powerful opportunity to balance each other and learn growth lessons.";
    }

    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Element Harmony: $myElement + $partnerElement",
            style: const TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            harmonyText,
            style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.45),
          ),
        ],
      ),
    );
  }

  Widget _buildStrengthsGrowthCard(AppState state) {
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Relationship Guidance",
            style: TextStyle(color: AppColors.goldDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("💪 ", style: TextStyle(fontSize: 14)),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Core Strength: Intuitive Alignment", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Text("You naturally sense each other's emotional highs and lows, requiring very little verbal explanation to sync up.", style: TextStyle(color: AppColors.brown700, fontSize: 11, height: 1.35)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("⚠️ ", style: TextStyle(fontSize: 14)),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Growth Area: Objective Boundaries", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Text("Because of your high emotional resonance, you risk absorbing each other's stress. Practice healthy boundary separation.", style: TextStyle(color: AppColors.brown700, fontSize: 11, height: 1.35)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
