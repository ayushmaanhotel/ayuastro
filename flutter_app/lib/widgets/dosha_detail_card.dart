import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'custom_widgets.dart';

class DoshaInfo {
  final String id;
  final String name;
  final String severity; // Serious | Moderate | Mild
  final String whatItMeans;
  final String howItAffects;
  final List<String> remedies;
  final String silverLining;

  const DoshaInfo({
    required this.id,
    required this.name,
    required this.severity,
    required this.whatItMeans,
    required this.howItAffects,
    required this.remedies,
    required this.silverLining,
  });
}

const List<DoshaInfo> _doshaData = [
  DoshaInfo(
    id: 'mangal',
    name: 'Mangal Dosha',
    severity: 'Serious',
    whatItMeans:
        'Mars is in your 1st, 2nd, 4th, 7th, 8th, or 12th house. This creates a pattern of aggression, impatience, and conflict in close relationships.',
    howItAffects:
        'You may struggle with anger, dominance in relationships, and difficulty compromising. Marriage can be delayed or turbulent. The fire of Mars doesn\'t ask permission — it acts. In relationships, this means you often push when you should listen.',
    remedies: [
      'Practice the 10-second rule before reacting in anger.',
      'Channel Mars energy through physical exercise — it needs an outlet.',
      'Chant "Om Mangalaya Namaha" on Tuesdays.',
      'Consider red coral only after consulting a qualified astrologer.',
    ],
    silverLining:
        'Your Mars energy, when channeled, gives you incredible drive, courage, and the ability to fight for what\'s right. Many successful leaders have this dosha. Your passion is not a flaw — it\'s fuel that needs direction.',
  ),
  DoshaInfo(
    id: 'kaal-sarp',
    name: 'Kaal Sarp Dosha',
    severity: 'Serious',
    whatItMeans:
        'All planets are between Rahu and Ketu. This creates a pattern of sudden ups and downs, feeling stuck despite efforts, and karmic lessons repeating.',
    howItAffects:
        'Life feels like a rollercoaster. Success comes and then slips away. You may feel a sense of unfulfillment even when things are going well. Progress feels like two steps forward, one step back — consistently.',
    remedies: [
      'Visit a Rahu-Ketu temple on Amavasya (new moon) if possible.',
      'Practice gratitude journaling daily — it grounds you.',
      'Focus on one thing at a time — scattered energy is your enemy.',
      'Chant "Om Rahuve Namaha" and "Om Ketuve Namaha".',
    ],
    silverLining:
        'People with Kaal Sarp Dosha often have deep spiritual insight and the ability to transform themselves completely. Your struggles give you wisdom others lack. You understand pain in a way that makes you an extraordinary healer.',
  ),
  DoshaInfo(
    id: 'pitra',
    name: 'Pitra Dosha',
    severity: 'Moderate',
    whatItMeans:
        'Sun-Rahu conjunction or 9th house affliction. This suggests ancestral karma affecting your life path — particularly career and relationships with authority figures.',
    howItAffects:
        'You may face obstacles in career progression despite hard work. Relationships with father or authority figures may be strained. A sense of carrying a burden that isn\'t entirely yours. Things that should be easy feel harder than they should be.',
    remedies: [
      'Perform Shradh ceremonies for ancestors.',
      'Respect and care for elders — this isn\'t just tradition, it\'s energetic repair.',
      'Donate to charity on Sundays.',
      'Practice forgiveness — holding grudges amplifies this dosha.',
    ],
    silverLining:
        'Pitra Dosha gives you a deep sense of responsibility and the ability to break generational patterns. You have the power to heal not just yourself but your family line. You\'re the one who stops the cycle.',
  ),
  DoshaInfo(
    id: 'nadi',
    name: 'Nadi Dosha',
    severity: 'Serious',
    whatItMeans:
        'Same Nadi as partner in matchmaking. In Vedic astrology, this is considered serious for marriage compatibility as it may affect health of offspring.',
    howItAffects:
        'This is primarily a compatibility concern, not a personal flaw. If both partners have the same Nadi, traditional astrology suggests potential health concerns for children. It does not affect your individual personality or life path directly.',
    remedies: [
      'This dosha is about compatibility, not you individually — don\'t internalize it.',
      'If matched, consider Nadi Dosha Nivaran puja before marriage.',
      'Focus on health and wellness as a couple — proactive care matters more.',
      'Modern view: genetics and health screening matter more than Nadi matching.',
    ],
    silverLining:
        'Awareness of this dosha means you\'ll be more proactive about health and family planning, which is actually responsible. Being informed is always better than being ignorant.',
  ),
  DoshaInfo(
    id: 'grahan',
    name: 'Grahan Dosha',
    severity: 'Moderate',
    whatItMeans:
        'Sun or Moon conjunct Rahu or Ketu. Eclipse energy shadows your confidence (Sun) or emotional stability (Moon). This creates periods of self-doubt and emotional turbulence.',
    howItAffects:
        'If Sun is affected: confidence comes and goes. You may struggle with authority or self-identity. If Moon is affected: emotional stability fluctuates. Anxiety and overthinking are patterns you know well.',
    remedies: [
      'Chant Gayatri Mantra 108 times daily for spiritual protection.',
      'Donate wheat, jaggery, and copper on Sundays (for Sun affliction).',
      'Donate rice, milk, and silver on Mondays (for Moon affliction).',
      'Perform Grahan Shanti Puja during eclipse periods.',
    ],
    silverLining:
        'Grahan Dosha gives you extraordinary sensitivity to energy and the unseen. Many psychics, healers, and artists have this placement. Your turbulence is the price of your perception.',
  ),
  DoshaInfo(
    id: 'shrapit',
    name: 'Shrapit Dosha',
    severity: 'Moderate',
    whatItMeans:
        'Saturn-Rahu conjunction or mutual aspect. This indicates karmic debts from past actions creating obstacles and delays in the current life.',
    howItAffects:
        'Obstacles seem to appear from nowhere. Progress is delayed even when you do everything right. There\'s a recurring feeling of "why is this so hard for me?" — and it\'s not your imagination.',
    remedies: [
      'Chant "Om Sham Shanicharaya Namah" and "Om Raahave Namaha" 108 times daily.',
      'Light a mustard oil lamp for Saturn and burn camphor for Rahu on Saturdays.',
      'Recite Hanuman Chalisa daily for protection from the Saturn-Rahu combination.',
      'Donate black sesame seeds, iron, and blankets on Saturdays.',
    ],
    silverLining:
        'Shrapit Dosha creates extraordinary patience and resilience. You\'ve learned to persist when others quit. This dosha often produces people who achieve success later in life — but when it comes, it\'s unshakeable.',
  ),
];

class DoshaDetailCard extends StatefulWidget {
  final List<String> doshas;

  const DoshaDetailCard({Key? key, required this.doshas}) : super(key: key);

  @override
  State<DoshaDetailCard> createState() => _DoshaDetailCardState();
}

class _DoshaDetailCardState extends State<DoshaDetailCard> {
  final Map<String, bool> _expandedDoshas = {};

  Color _getSeverityBorderColor(String severity) {
    switch (severity) {
      case 'Serious':
        return Colors.red;
      case 'Moderate':
        return Colors.orange;
      default:
        return Colors.yellow.shade700;
    }
  }

  Color _getSeverityBgColor(String severity) {
    switch (severity) {
      case 'Serious':
        return Colors.red.withOpacity(0.12);
      case 'Moderate':
        return Colors.orange.withOpacity(0.12);
      default:
        return Colors.yellow.shade100.withOpacity(0.3);
    }
  }

  Color _getSeverityTextColor(String severity) {
    switch (severity) {
      case 'Serious':
        return Colors.red;
      case 'Moderate':
        return Colors.orange.shade800;
      default:
        return Colors.yellow.shade800;
    }
  }

  IconData _getSeverityIcon(String severity) {
    switch (severity) {
      case 'Serious':
        return LucideIcons.triangle_alert;
      case 'Moderate':
        return LucideIcons.flame;
      default:
        return LucideIcons.eye;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Filter to find matching doshas
    final activeDoshas = _doshaData.where((d) {
      return widget.doshas.any((userDosha) {
        final ud = userDosha.toLowerCase();
        return ud.contains(d.id) ||
            d.name.toLowerCase().contains(ud.replaceAll(' dosha', '').replaceAll(' dosh', '').trim());
      });
    }).toList();

    // If activeDoshas is empty but user has some doshas, map them dynamically
    final displayDoshas = activeDoshas.isNotEmpty
        ? activeDoshas
        : widget.doshas.isNotEmpty
            ? widget.doshas.map((name) {
                final id = name.toLowerCase().replaceAll(RegExp(r'\s+'), '-');
                return DoshaInfo(
                  id: id,
                  name: name,
                  severity: 'Moderate',
                  whatItMeans: '$name is detected in your birth chart. This indicates specific challenges in certain life areas.',
                  howItAffects: 'This dosha creates patterns of difficulty in specific areas of life. The exact effects depend on the planetary positions involved.',
                  remedies: [
                    'Consult a qualified Vedic astrologer for personalized remedies.',
                    'Practice mindfulness and self-awareness daily.',
                    'Chant mantras associated with the planets involved.'
                  ],
                  silverLining: 'Every dosha carries a hidden gift. The challenge you face builds strength that others lack.',
                );
              }).toList()
            : <DoshaInfo>[];

    if (displayDoshas.isEmpty) {
      return GlassPremiumCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Accent Bar
            Container(
              height: 3,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(1.5),
                gradient: const LinearGradient(
                  colors: [AppColors.sage, AppColors.sageLight, AppColors.sage],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.sage.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.shield, color: AppColors.sage, size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Dosha Analysis",
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.brown900,
                      ),
                    ),
                    const Text(
                      "No doshas detected",
                      style: TextStyle(fontSize: 11, color: AppColors.brown400),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.sage.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                "Good news — your chart is relatively free of major doshas. This doesn't mean life is perfect, but it means you don't have the specific karmic patterns that doshas create. Consider this a genuine advantage.",
                style: TextStyle(
                  fontSize: 13,
                  height: 1.45,
                  color: isDark ? Colors.white70 : AppColors.brown800,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return GlassPremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Accent Bar
          Container(
            height: 3,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(1.5),
              gradient: const LinearGradient(
                colors: [Colors.red, Colors.orange, Colors.yellow],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(LucideIcons.triangle_alert, color: Colors.red, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Dosha Analysis",
                        style: TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.brown900,
                        ),
                      ),
                      Text(
                        "${displayDoshas.length} ${displayDoshas.length == 1 ? 'dosha' : 'doshas'} detected",
                        style: const TextStyle(fontSize: 11, color: AppColors.brown400),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.eye, size: 10, color: Colors.red),
                    SizedBox(width: 4),
                    Text(
                      "BRUTALLY HONEST",
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.red),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Dosha Cards
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayDoshas.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final dosha = displayDoshas[index];
              final isExpanded = _expandedDoshas[dosha.id] ?? false;

              return Container(
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.02) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border(
                    left: BorderSide(
                      color: _getSeverityBorderColor(dosha.severity),
                      width: 4,
                    ),
                    top: BorderSide(color: isDark ? Colors.white12 : AppColors.brown100),
                    right: BorderSide(color: isDark ? Colors.white12 : AppColors.brown100),
                    bottom: BorderSide(color: isDark ? Colors.white12 : AppColors.brown100),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Area
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                dosha.name,
                                style: TextStyle(
                                  fontFamily: 'Playfair Display',
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : AppColors.brown900,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _getSeverityBgColor(dosha.severity),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      _getSeverityIcon(dosha.severity),
                                      size: 8,
                                      color: _getSeverityTextColor(dosha.severity),
                                    ),
                                    const SizedBox(width: 2),
                                    Text(
                                      dosha.severity,
                                      style: TextStyle(
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                        color: _getSeverityTextColor(dosha.severity),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            dosha.whatItMeans,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white70 : AppColors.brown700,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Expandable Details
                    if (isExpanded) ...[
                      Padding(
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Divider(height: 1),
                            const SizedBox(height: 12),

                            // How It Affects
                            Row(
                              children: [
                                const Icon(LucideIcons.triangle_alert, size: 12, color: Colors.red),
                                const SizedBox(width: 6),
                                Text(
                                  "HOW IT AFFECTS YOU",
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red.shade400,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              dosha.howItAffects,
                              style: TextStyle(
                                fontSize: 11,
                                height: 1.4,
                                color: isDark ? Colors.white70 : AppColors.brown800,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Practical Remedies
                            const Row(
                              children: [
                                Icon(LucideIcons.sparkles, size: 12, color: AppColors.gold),
                                SizedBox(width: 6),
                                Text(
                                  "PRACTICAL REMEDIES",
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.goldDark,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ...dosha.remedies.map((remedy) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text("✦ ", style: TextStyle(color: AppColors.gold, fontSize: 10)),
                                      Expanded(
                                        child: Text(
                                          remedy,
                                          style: TextStyle(
                                            fontSize: 11,
                                            height: 1.35,
                                            color: isDark ? Colors.white70 : AppColors.brown800,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                            const SizedBox(height: 12),

                            // The Good News
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.sage.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(LucideIcons.lightbulb, size: 12, color: AppColors.sage),
                                      const SizedBox(width: 6),
                                      Text(
                                        "THE GOOD NEWS",
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.sage,
                                          letterSpacing: 1,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    dosha.silverLining,
                                    style: TextStyle(
                                      fontSize: 11,
                                      height: 1.4,
                                      color: isDark ? Colors.white70 : AppColors.brown800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Expand/Collapse Toggle Button
                    InkWell(
                      onTap: () => setState(() => _expandedDoshas[dosha.id] = !isExpanded),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.01) : Colors.grey.shade50,
                          border: Border(
                            top: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100),
                          ),
                          borderRadius: const BorderRadius.only(
                            bottomLeft: Radius.circular(12),
                            bottomRight: Radius.circular(12),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              isExpanded ? 'Hide details' : 'Show details',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isDark ? Colors.white54 : AppColors.brown500,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              isExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                              size: 14,
                              color: isDark ? Colors.white54 : AppColors.brown500,
                            ),
                          ],
                        ),
                      ),
                    ),
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
