import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import 'custom_widgets.dart';

class KundaliScoreCard extends StatefulWidget {
  const KundaliScoreCard({Key? key}) : super(key: key);

  @override
  State<KundaliScoreCard> createState() => _KundaliScoreCardState();
}

class _KundaliScoreCardState extends State<KundaliScoreCard> {
  bool _detailsExpanded = false;
  bool _remediesExpanded = false;
  bool _vedicRemediesExpanded = false;

  Color _getScoreColor(double score) {
    if (score >= 70) return AppColors.sage;
    if (score >= 50) return AppColors.gold;
    return Colors.red;
  }

  Color _getBarBg(double score, bool isDark) {
    if (score >= 70) return AppColors.sage.withOpacity(0.12);
    if (score >= 50) return AppColors.gold.withOpacity(0.12);
    return Colors.red.withOpacity(0.12);
  }

  Color _getGradeBgColor(String grade, bool isDark) {
    if (grade == 'Exceptional' || grade == 'Strong') {
      return AppColors.sage.withOpacity(0.12);
    }
    if (grade == 'Good' || grade == 'Average') {
      return AppColors.gold.withOpacity(0.12);
    }
    return Colors.red.withOpacity(0.12);
  }

  Color _getGradeTextColor(String grade, bool isDark) {
    if (grade == 'Exceptional' || grade == 'Strong') {
      return AppColors.sage;
    }
    if (grade == 'Good' || grade == 'Average') {
      return AppColors.goldDark;
    }
    return Colors.red;
  }

  IconData _getBreakdownIcon(String label) {
    final lower = label.toLowerCase();
    if (lower.contains('graha') || lower.contains('planet')) return LucideIcons.star;
    if (lower.contains('yoga') || lower.contains('blessing')) return LucideIcons.sparkles;
    if (lower.contains('dosha') || lower.contains('challenge')) return LucideIcons.shield;
    if (lower.contains('bhava') || lower.contains('house') || lower.contains('layout')) return LucideIcons.target;
    if (lower.contains('lagna') || lower.contains('ascendant')) return LucideIcons.crown;
    if (lower.contains('nakshatra')) return LucideIcons.moon;
    if (lower.contains('element')) return LucideIcons.flame;
    return LucideIcons.star;
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final scoreData = state.kundaliScore;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (state.isScoreLoading) {
      return const GlassPremiumCard(
        child: SizedBox(
          height: 180,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 36,
                  height: 36,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold),
                  ),
                ),
                SizedBox(height: 16),
                Text(
                  "Calculating Kundali Score...",
                  style: TextStyle(fontSize: 12, color: AppColors.brown500, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (scoreData == null) {
      return GlassPremiumCard(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.gold.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(LucideIcons.star, color: AppColors.gold, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              "Kundali Score",
              style: TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.brown900,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              "Complete your birth details to see your Kundali Score",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.brown500),
            ),
          ],
        ),
      );
    }

    final hasVedicRemedies = scoreData.vedicRemedies != null &&
        (scoreData.vedicRemedies!.gemstones.isNotEmpty ||
            scoreData.vedicRemedies!.mantras.isNotEmpty ||
            scoreData.vedicRemedies!.dayPractices.isNotEmpty ||
            scoreData.vedicRemedies!.fasting.isNotEmpty);

    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header / Accent Indicator
          Container(
            height: 3,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(1.5),
              gradient: const LinearGradient(
                colors: [AppColors.gold, AppColors.goldDark, AppColors.gold],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Score Ring & Grade
          Column(
            children: [
              _ScoreRing(score: scoreData.overallScore.toDouble()),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _getGradeBgColor(scoreData.grade, isDark),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  scoreData.grade,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _getGradeTextColor(scoreData.grade, isDark),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                scoreData.gradeDescription,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : AppColors.brown700, height: 1.35),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Shadbala Details (sthanaBala, digBala, etc.)
          if (scoreData.shadbalaDetails != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withOpacity(0.04) : AppColors.creamDark.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? Colors.white10 : AppColors.brown100,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.compass, size: 14, color: AppColors.gold),
                      const SizedBox(width: 6),
                      Text(
                        "SHADBALA COMPONENTS",
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: isDark ? Colors.white54 : AppColors.brown700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildShadbalaStat("Sthana", scoreData.shadbalaDetails!.sthanaBala.toString(), isDark),
                      _buildShadbalaStat("Dig Bala", scoreData.shadbalaDetails!.digBala.toString(), isDark),
                      _buildShadbalaStat("Cheshta", scoreData.shadbalaDetails!.chestaBala.toString(), isDark),
                      _buildShadbalaStat(
                        "Navamsha",
                        "${scoreData.shadbalaDetails!.navamshaBonus >= 0 ? '+' : ''}${scoreData.shadbalaDetails!.navamshaBonus}",
                        isDark,
                        textColor: scoreData.shadbalaDetails!.navamshaBonus >= 0 ? AppColors.sage : Colors.red,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Honest Assessment
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.gold.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.eye, size: 14, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Text(
                      "HONEST ASSESSMENT",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: isDark ? AppColors.goldLight : AppColors.goldDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  scoreData.honestAssessment,
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.45,
                    color: isDark ? Colors.white70 : AppColors.brown900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Top Strength & Challenge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.sage.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.trending_up, size: 12, color: AppColors.sage),
                          const SizedBox(width: 4),
                          Text(
                            "STRENGTH",
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: AppColors.sage,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        scoreData.topStrength,
                        style: TextStyle(
                          fontSize: 11,
                          height: 1.35,
                          color: isDark ? Colors.white70 : AppColors.brown800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.trending_down, size: 12, color: Colors.red),
                          const SizedBox(width: 4),
                          const Text(
                            "CHALLENGE",
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Colors.red,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        scoreData.topChallenge,
                        style: TextStyle(
                          fontSize: 11,
                          height: 1.35,
                          color: isDark ? Colors.white70 : AppColors.brown800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Score Breakdown (Collapsible)
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              InkWell(
                onTap: () => setState(() => _detailsExpanded = !_detailsExpanded),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.target, size: 14, color: AppColors.brown500),
                          const SizedBox(width: 6),
                          Text(
                            "Score Breakdown",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white70 : AppColors.brown700,
                            ),
                          ),
                        ],
                      ),
                      Icon(
                        _detailsExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                        size: 16,
                        color: AppColors.gold,
                      ),
                    ],
                  ),
                ),
              ),
              if (_detailsExpanded) ...[
                const SizedBox(height: 12),
                ...scoreData.breakdown.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(_getBreakdownIcon(item.label), size: 12, color: AppColors.brown400),
                                  const SizedBox(width: 6),
                                  Text(
                                    item.label,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? Colors.white70 : AppColors.brown800,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                item.score.toString(),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: _getScoreColor(item.score.toDouble()),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Container(
                              height: 6,
                              width: double.infinity,
                              color: isDark ? Colors.white12 : AppColors.brown100,
                              child: FractionallySizedBox(
                                alignment: Alignment.centerLeft,
                                widthFactor: item.score / 100,
                                child: Container(
                                  color: _getScoreColor(item.score.toDouble()),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.description,
                            style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : AppColors.brown500, height: 1.3),
                          ),
                          if (item.subScores.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: item.subScores.entries.map((entry) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withOpacity(0.03) : AppColors.creamDark.withOpacity(0.4),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    "${entry.key}: ${entry.value}",
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? Colors.white54 : AppColors.brown700,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ],
                      ),
                    )),
              ] else ...[
                // Mini Row Summary
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: scoreData.breakdown.map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Row(
                          children: [
                            Text(
                              "${item.label}: ",
                              style: const TextStyle(fontSize: 9, color: AppColors.brown400),
                            ),
                            Text(
                              item.score.toString(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: _getScoreColor(item.score.toDouble()),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),

          // Basic Remedies (Upayas)
          if (scoreData.remedies.isNotEmpty) ...[
            InkWell(
              onTap: () => setState(() => _remediesExpanded = !_remediesExpanded),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.lightbulb, size: 14, color: AppColors.gold),
                        const SizedBox(width: 6),
                        Text(
                          "Recommended Upaya (Remedies)",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.goldDark,
                          ),
                        ),
                      ],
                    ),
                    Icon(
                      _remediesExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                      size: 16,
                      color: AppColors.gold,
                    ),
                  ],
                ),
              ),
            ),
            if (_remediesExpanded) ...[
              const SizedBox(height: 8),
              ...scoreData.remedies.map((remedy) => Padding(
                    padding: const EdgeInsets.only(bottom: 6, left: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("✦ ", style: TextStyle(color: AppColors.gold, fontSize: 10)),
                        Expanded(
                          child: Text(
                            remedy,
                            style: TextStyle(
                              fontSize: 12,
                              height: 1.4,
                              color: isDark ? Colors.white70 : AppColors.brown800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
            const SizedBox(height: 12),
          ],

          // Vedic-Specific Remedies (Ratna, Mantra, Vrata)
          if (hasVedicRemedies) ...[
            InkWell(
              onTap: () => setState(() => _vedicRemediesExpanded = !_vedicRemediesExpanded),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(LucideIcons.gem, size: 14, color: AppColors.brown700),
                        SizedBox(width: 6),
                        Text(
                          "Vedic Remedies (Ratna, Mantra, Vrata)",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.brown700,
                          ),
                        ),
                      ],
                    ),
                    Icon(
                      _vedicRemediesExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                      size: 16,
                      color: AppColors.gold,
                    ),
                  ],
                ),
              ),
            ),
            if (_vedicRemediesExpanded) ...[
              const SizedBox(height: 12),
              // Gemstones
              if (scoreData.vedicRemedies!.gemstones.isNotEmpty) ...[
                _buildVedicCategoryHeader(LucideIcons.gem, "Ratna (Gemstones)", AppColors.gold, isDark),
                const SizedBox(height: 4),
                ...scoreData.vedicRemedies!.gemstones.map((g) => _buildVedicCategoryItem("◆", g, isDark)),
                const SizedBox(height: 12),
              ],
              // Mantras
              if (scoreData.vedicRemedies!.mantras.isNotEmpty) ...[
                _buildVedicCategoryHeader(LucideIcons.hand_heart, "Mantra (Chants)", AppColors.sage, isDark),
                const SizedBox(height: 4),
                ...scoreData.vedicRemedies!.mantras.map((m) => _buildVedicCategoryItem("ॐ", m, isDark)),
                const SizedBox(height: 12),
              ],
              // Day Practices
              if (scoreData.vedicRemedies!.dayPractices.isNotEmpty) ...[
                _buildVedicCategoryHeader(LucideIcons.sun, "Day-Specific Practices", AppColors.brown500, isDark),
                const SizedBox(height: 4),
                ...scoreData.vedicRemedies!.dayPractices.map((d) => _buildVedicCategoryItem("☀", d, isDark)),
                const SizedBox(height: 12),
              ],
              // Fasting
              if (scoreData.vedicRemedies!.fasting.isNotEmpty) ...[
                _buildVedicCategoryHeader(LucideIcons.utensils, "Vrata (Fasting)", AppColors.brown500, isDark),
                const SizedBox(height: 4),
                ...scoreData.vedicRemedies!.fasting.map((f) => _buildVedicCategoryItem("•", f, isDark)),
                const SizedBox(height: 12),
              ],
              // Disclaimer
              if (scoreData.vedicRemedies!.disclaimer.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.gold.withOpacity(0.08)),
                  ),
                  child: Text(
                    scoreData.vedicRemedies!.disclaimer,
                    style: TextStyle(
                      fontSize: 10,
                      fontStyle: FontStyle.italic,
                      height: 1.4,
                      color: isDark ? Colors.white38 : AppColors.brown500,
                    ),
                  ),
                ),
              ],
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildShadbalaStat(String label, String value, bool isDark, {Color? textColor}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: textColor ?? (isDark ? Colors.white : AppColors.brown900),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: AppColors.brown400),
        ),
      ],
    );
  }

  Widget _buildVedicCategoryHeader(IconData icon, String title, Color color, bool isDark) {
    return Row(
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 6),
        Text(
          title.toUpperCase(),
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: color,
            letterSpacing: 1.1,
          ),
        ),
      ],
    );
  }

  Widget _buildVedicCategoryItem(String bullet, String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, bottom: 4, top: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "$bullet ",
            style: TextStyle(color: AppColors.gold, fontSize: bullet == "ॐ" ? 12 : 9, fontWeight: FontWeight.bold),
          ),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 11,
                height: 1.4,
                color: isDark ? Colors.white70 : AppColors.brown700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScoreRing extends StatelessWidget {
  final double score;
  final double size;

  const _ScoreRing({Key? key, required this.score, this.size = 110}) : super(key: key);

  Color _getScoreColor(double score) {
    if (score >= 70) return AppColors.sage;
    if (score >= 50) return AppColors.gold;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final strokeColor = _getScoreColor(score);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background Circle
          SizedBox(
            width: size - 8,
            height: size - 8,
            child: CircularProgressIndicator(
              value: 1.0,
              strokeWidth: 8,
              valueColor: AlwaysStoppedAnimation<Color>(
                isDark ? AppColors.brown700 : AppColors.brown100,
              ),
            ),
          ),
          // Foreground Progress Circle
          SizedBox(
            width: size - 8,
            height: size - 8,
            child: CircularProgressIndicator(
              value: score / 100,
              strokeWidth: 8,
              valueColor: AlwaysStoppedAnimation<Color>(strokeColor),
            ),
          ),
          // Score Text
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                score.toInt().toString(),
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: strokeColor,
                ),
              ),
              const Text(
                'out of 100',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: AppColors.brown400,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
