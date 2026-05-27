import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class YogaDoshaScreen extends StatelessWidget {
  const YogaDoshaScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final astro = state.astrologyData;

    final yogas = astro?.yogas ?? [];
    final doshas = astro?.doshas ?? [];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
          onPressed: () {
            // Set view back to insights dashboard
            state.setView('insights');
          },
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
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── INFO CARD ───
              _buildIntroCard(),
              const SizedBox(height: 20),

              // ─── YOGAS SECTION ───
              Row(
                children: [
                  const Text("🌟 ", style: TextStyle(fontSize: 20)),
                  Text(
                    "Your Present Yogas (${yogas.length})",
                    style: TextStyle(
                      color: isDark ? Colors.white : AppColors.brown900,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      fontFamily: 'Playfair Display',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (yogas.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Text("No positive yogas detected in your planetary degrees.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
                )
              else
                ...yogas.map((yName) => _buildYogaItem(yName, isDark)).toList(),

              const SizedBox(height: 24),

              // ─── DOSHAS SECTION ───
              Row(
                children: [
                  const Text("⚠️ ", style: TextStyle(fontSize: 20)),
                  Text(
                    "Karmic Lessons & Doshas (${doshas.length})",
                    style: TextStyle(
                      color: isDark ? Colors.white : AppColors.brown900,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      fontFamily: 'Playfair Display',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (doshas.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Text("No active doshas or karmic blockages identified in your chart.", style: TextStyle(color: AppColors.brown500, fontSize: 12)),
                )
              else
                ...doshas.map((dName) => _buildDoshaItem(dName, isDark)).toList(),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIntroCard() {
    return const GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Astrological Blueprints",
            style: TextStyle(color: AppColors.goldDark, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text(
            "Yogas represent highly integrated alignments that yield talent and capability. Doshas (Karmic Lessons) represent structural tensions designed to teach maturity. We analyze them without superstition, looking strictly at psychological and developmental drivers.",
            style: TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.45),
          ),
        ],
      ),
    );
  }

  Widget _buildYogaItem(String name, bool isDark) {
    // Generate detailed info based on yoga name
    String sName = "Raja Yoga";
    String summary = "Integration of mind and active will.";
    String desc = "Formed when the lords of kendras (quadrants) and trikonas (trines) associate, creating a smooth path for translating internal vision into physical leadership.";

    if (name.contains("Gaja Kesari") || name.contains("Gajakesari")) {
      sName = "Gajakesari Yoga (गजकेसरी)";
      summary = "Strength of intellect and emotional stability.";
      desc = "Jupiter is in a quadrant from the Moon. This brings great wisdom, mental resilience, and the capability to guide others through emotional periods.";
    } else if (name.contains("Adhi")) {
      sName = "Adhi Yoga (अधि योग)";
      summary = "Natural leadership and quiet influence.";
      desc = "Benefics (Mercury, Venus, Jupiter) in 6th, 7th, or 8th houses from the Moon. Yields an adaptable, highly trusted personality capable of organizing group objectives.";
    } else if (name.contains("Pancha Mahapurusha") || name.contains("Malavya") || name.contains("Ruchaka") || name.contains("Bhadra") || name.contains("Hamsa") || name.contains("Sasa")) {
      sName = "$name (महापुरुष)";
      summary = "Exceptional planetary strength expressing direct talent.";
      desc = "A major planet (Mars, Mercury, Jupiter, Venus, Saturn) is in its own sign or exalted in a quadrant. It signifies a specialized energetic drive that manifests as clear vocational talent.";
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassLightCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text("🌟", style: TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Text(
                  sName,
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              "Focus: $summary",
              style: const TextStyle(color: AppColors.sage, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              desc,
              style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoshaItem(String name, bool isDark) {
    String sName = "Karmic Lesson";
    String severity = "Moderate";
    String desc = "Represents a point of persistent tension in your chart where Saturn or Mars calls for structure and emotional boundary separation.";
    List<String> remedies = [
      "Mindfulness: 5 minutes daily grounding breathwork.",
      "Journaling prompt: Write about your reaction when boundaries are crossed.",
      "Behavioral: Practice active pause before expressing defense."
    ];

    if (name.contains("Manglik") || name.contains("Kuja")) {
      sName = "Kuja Dosha (कुज दोष)";
      severity = "Significant";
      desc = "Mars is placed in a house affecting relationships. This creates intense relational drive, potential defensiveness, and conflicts that can only be resolved through emotional boundary training.";
      remedies = [
        "Behavioral: Implement a 10-second rule before responding to confrontational text.",
        "Mindfulness: Perform physical exercise to channel excess adrenaline.",
        "Journaling: Reflect on where anger shields you from expressing vulnerability."
      ];
    } else if (name.contains("Sade Sati") || name.contains("Saturn")) {
      sName = "Sade Sati (साढ़े साती)";
      severity = "Significant";
      desc = "Saturn transits the houses surrounding your natal Moon. This represents a 7.5-year cycle of structured self-reckoning, cleaning up old systems, and establishing disciplined foundations.";
      remedies = [
        "Behavioral: Structure daily routines and stick to them strictly.",
        "Mindfulness: Commit to silent meditation for 10 minutes at sunset.",
        "Journaling: List what habits are currently draining your productivity."
      ];
    } else if (name.contains("Kalsarp") || name.contains("Kaal Sarp")) {
      sName = "Kaal Sarp (काल सर्प)";
      severity = "Moderate";
      desc = "All planets are hemmed between Rahu and Ketu, creating a strong sense of destiny alongside periods of internal confusion. It represents a call to move beyond surface-level ambitions.";
      remedies = [
        "Behavioral: Set clear, long-term personal goals, ignoring short-term validation.",
        "Mindfulness: Grounding body scans to manage anxiety cycles.",
        "Journaling: Write down what illusions you are currently mistaking for truth."
      ];
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassLightCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text("⚠️", style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    Text(
                      sName,
                      style: TextStyle(
                        color: isDark ? Colors.white : AppColors.brown900,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: severity == 'Significant' 
                        ? Colors.red.withOpacity(0.1) 
                        : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    severity,
                    style: TextStyle(
                      color: severity == 'Significant' ? Colors.red : Colors.orange,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              desc,
              style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            const Text(
              "Practical Remedies:",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppColors.goldDark),
            ),
            const SizedBox(height: 6),
            ...remedies.map((rem) => Padding(
              padding: const EdgeInsets.only(bottom: 4.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("✦ ", style: TextStyle(color: AppColors.gold, fontSize: 12)),
                  Expanded(
                    child: Text(rem, style: const TextStyle(color: AppColors.brown700, fontSize: 11, height: 1.35)),
                  ),
                ],
              ),
            )).toList(),
          ],
        ),
      ),
    );
  }
}
