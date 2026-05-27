import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';
import '../services/api_service.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({Key? key}) : super(key: key);

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final Map<String, bool> _expandedSections = {};
  bool _isDownloading = false;

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final details = state.birthDetails;
    
    // Use sections from state, fallback to defaults if empty
    List<ReportSection> sections = state.reportSections;
    if (sections.isEmpty) {
      sections = _getFallbackSections();
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
          onPressed: () {
            state.setView('insights');
          },
        ),
        title: Text(
          "Personality Report",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (state.userId != null)
            IconButton(
              icon: _isDownloading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.gold,
                      ),
                    )
                  : const Icon(LucideIcons.download, color: AppColors.gold),
              onPressed: _isDownloading ? null : () => _downloadReport(context, state),
              tooltip: "Download PDF Report",
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
              // ─── HERO HEADER ───
              _buildHeroHeader(details, isDark),
              const SizedBox(height: 16),

              // ─── PREMIUM UPGRADE BANNER ───
              if (!state.hasPaid) ...[
                _buildUpgradeCard(context, state, isDark),
                const SizedBox(height: 16),
              ],

              // ─── REPORT SUMMARY CARD ───
              if (state.reportSummary.isNotEmpty) ...[
                _buildSummaryCard(state.reportSummary, isDark),
                const SizedBox(height: 20),
              ],

              // ─── SECTIONS LIST ───
              Text(
                "Report Segments",
                style: TextStyle(
                  color: isDark ? Colors.white : AppColors.brown900,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Playfair Display',
                ),
              ),
              const SizedBox(height: 12),

              ...sections.map((section) {
                final isExpanded = _expandedSections[section.id] ?? false;
                final isLocked = section.insightLevel == 'premium' && !state.hasPaid;

                return _buildSectionCard(
                  context,
                  state,
                  section,
                  isExpanded,
                  isLocked,
                  isDark,
                );
              }).toList(),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroHeader(BirthDetails? details, bool isDark) {
    return GlassPremiumCard(
      child: Column(
        children: [
          const Text("📜", style: TextStyle(fontSize: 32)),
          const SizedBox(height: 8),
          Text(
            "Deep Astrological Analysis",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            details != null
                ? "Synthesized profile for ${details.name}"
                : "Your cosmic blueprint, mapped to behavioral traits.",
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.brown500, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildUpgradeCard(BuildContext context, AppState state, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.gold.withOpacity(0.15),
            AppColors.goldDark.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withOpacity(0.1),
            blurRadius: 12,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Text("👑", style: TextStyle(fontSize: 22)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  "Unlock Full Celestial Report",
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            "Access 4 specialized premium sections: Hidden Strengths, Emotional Blind Spots, Money Psychology, and Recurring Life Patterns. Plus, download a beautifully formatted offline PDF report.",
            style: TextStyle(color: AppColors.brown700, fontSize: 11.5, height: 1.45),
          ),
          const SizedBox(height: 16),
          NeonGoldButton(
            text: "Unlock Premium (Simulated)",
            icon: LucideIcons.lock_open,
            onPressed: () => _simulateUnlock(context, state),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String summary, bool isDark) {
    return GlassLightCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Executive Summary",
            style: TextStyle(
              color: AppColors.goldDark,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            summary,
            style: const TextStyle(
              color: AppColors.brown700,
              fontSize: 12,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard(
    BuildContext context,
    AppState state,
    ReportSection section,
    bool isExpanded,
    bool isLocked,
    bool isDark,
  ) {
    IconData getIcon(String iconName) {
      switch (iconName.toLowerCase()) {
        case 'heart':
          return LucideIcons.heart;
        case 'user':
          return LucideIcons.user;
        case 'message':
        case 'chat':
          return LucideIcons.message_square;
        case 'sparkles':
          return LucideIcons.sparkles;
        case 'eye':
          return LucideIcons.eye;
        case 'dollar':
        case 'coins':
          return LucideIcons.coins;
        case 'repeat':
        case 'refresh':
          return LucideIcons.refresh_cw;
        default:
          return LucideIcons.book_open;
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassLightCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header row (always visible)
            InkWell(
              onTap: () {
                if (isLocked) {
                  _simulateUnlock(context, state);
                } else {
                  setState(() {
                    _expandedSections[section.id] = !isExpanded;
                  });
                }
              },
              child: Row(
                children: [
                  Icon(getIcon(section.icon), color: AppColors.gold, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          section.title,
                          style: TextStyle(
                            color: isDark ? Colors.white : AppColors.brown900,
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                          ),
                        ),
                        if (isLocked) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Row(
                              children: [
                                Icon(LucideIcons.lock, size: 8, color: AppColors.goldDark),
                                SizedBox(width: 2),
                                Text(
                                  "PRO",
                                  style: TextStyle(color: AppColors.goldDark, fontSize: 7, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(
                    isLocked
                        ? LucideIcons.lock
                        : (isExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down),
                    color: AppColors.brown500,
                    size: 16,
                  ),
                ],
              ),
            ),

            // Content (collapsible)
            if (isExpanded && !isLocked) ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              Text(
                section.content,
                style: const TextStyle(
                  color: AppColors.brown700,
                  fontSize: 12.5,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 12),
              // Render tag/trait chips
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: section.traits.map((trait) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.sageLight.withOpacity(isDark ? 0.08 : 0.4),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.sage.withOpacity(0.2)),
                    ),
                    child: Text(
                      trait,
                      style: const TextStyle(color: AppColors.sage, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  );
                }).toList(),
              ),
            ],

            if (isLocked) ...[
              // If expanded but locked, show blurred/masked state
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 12),
              Stack(
                alignment: Alignment.center,
                children: [
                  // Masked/Blurred Text mockup
                  Opacity(
                    opacity: 0.12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(height: 12, width: double.infinity, color: AppColors.brown900),
                        const SizedBox(height: 6),
                        Container(height: 12, width: double.infinity, color: AppColors.brown900),
                        const SizedBox(height: 6),
                        Container(height: 12, width: 180, color: AppColors.brown900),
                      ],
                    ),
                  ),
                  // Lock overlay description
                  Positioned.fill(
                    child: Container(
                      color: Colors.transparent,
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.lock, color: AppColors.gold, size: 24),
                          const SizedBox(height: 6),
                          Text(
                            "Tap to unlock this Premium Report Segment",
                            style: TextStyle(
                              color: isDark ? Colors.white70 : AppColors.brown900,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _simulateUnlock(BuildContext context, AppState state) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (context) {
        bool processing = false;
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: isDark ? AppColors.darkCard : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Text("👑 ", style: TextStyle(fontSize: 20)),
                  Text(
                    "Unlock Premium",
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      color: isDark ? Colors.white : AppColors.brown900,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              content: processing
                  ? const SizedBox(
                      height: 100,
                      child: Center(
                        child: CosmicLoader(message: "Authorizing cosmic access..."),
                      ),
                    )
                  : const Text(
                      "Unlock all 4 premium report sections and enable typeset PDF generation. (This is a free simulation of the purchase flow.)",
                      style: TextStyle(fontSize: 12.5, height: 1.45),
                    ),
              actions: processing
                  ? []
                  : [
                      TextButton(
                        child: const Text("Maybe Later", style: TextStyle(color: AppColors.brown500)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text("Unlock Now", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        onPressed: () async {
                          setStateDialog(() {
                            processing = true;
                          });
                          await Future.delayed(const Duration(milliseconds: 1800));
                          state.setHasPaid(true);
                          if (mounted) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("All cosmic insights successfully unlocked! ✦"),
                                backgroundColor: AppColors.sage,
                              ),
                            );
                          }
                        },
                      ),
                    ],
            );
          },
        );
      },
    );
  }

  Future<void> _downloadReport(BuildContext context, AppState state) async {
    if (state.userId == null) return;
    setState(() {
      _isDownloading = true;
    });

    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/api/reports/generate-pdf'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': state.userId,
          'includePremium': state.hasPaid,
        }),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        final htmlContent = response.body;

        // Save HTML report to user documents directory
        final directory = await getApplicationDocumentsDirectory();
        final nameSlug = state.birthDetails?.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_').toLowerCase() ?? 'seeker';
        final file = File('${directory.path}/ayuastro_report_$nameSlug.html');
        await file.writeAsString(htmlContent);

        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              backgroundColor: Theme.of(context).brightness == Brightness.dark ? AppColors.darkCard : Colors.white,
              title: const Row(
                children: [
                  Icon(LucideIcons.file_check, color: AppColors.sage),
                  SizedBox(width: 8),
                  Text("Report Saved"),
                ],
              ),
              content: Text(
                "Your detailed astrological report has been saved to your local storage:\n\n${file.path}\n\nYou can open this HTML file in any browser to print or save it as a PDF.",
                style: const TextStyle(fontSize: 12.5, height: 1.45),
              ),
              actions: [
                TextButton(
                  child: const Text("OK", style: TextStyle(color: AppColors.gold)),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          );
        }
      } else {
        throw Exception("Server returned code ${response.statusCode}");
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Error generating report: ${e.toString().replaceAll('Exception:', '')}"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
      }
    }
  }

  List<ReportSection> _getFallbackSections() {
    return [
      ReportSection(
        id: 'emotional-personality',
        title: 'Emotional Personality',
        icon: 'heart',
        content: 'Your emotional world is rich and layered. You process feelings with extraordinary depth, often absorbing the emotional climate of any room you enter. This sensitivity is your superpower when channeled through creative or healing work, but requires conscious boundaries to prevent overwhelm.',
        traits: ['Empathy', 'Emotional Awareness', 'Intuition'],
        insightLevel: 'free',
      ),
      ReportSection(
        id: 'relationship-style',
        title: 'Relationship Style',
        icon: 'user',
        content: 'You approach relationships as sacred contracts — seeking depth over breadth. Your attachment pattern leans toward secure-anxious, meaning you crave closeness but may intermittently need space to process.',
        traits: ['Trust Capacity', 'Loyalty', 'Harmony Seeking'],
        insightLevel: 'free',
      ),
      ReportSection(
        id: 'communication-patterns',
        title: 'Communication Patterns',
        icon: 'message',
        content: 'Your communication style is nuanced — you often say less than you feel. You listen more than you speak, but when you do articulate, your words carry unusual weight.',
        traits: ['Communication', 'Patience', 'Intuition'],
        insightLevel: 'free',
      ),
      ReportSection(
        id: 'hidden-strengths',
        title: 'Hidden Strengths',
        icon: 'sparkles',
        content: 'Beneath your conscious awareness lies a reservoir of untapped power. Your hidden strengths often surface during life transitions.',
        traits: ['Creativity', 'Resilience', 'Intuition'],
        insightLevel: 'premium',
      ),
      ReportSection(
        id: 'emotional-blind-spots',
        title: 'Emotional Blind Spots',
        icon: 'eye',
        content: 'Your blind spots center around self-worth and boundary enforcement. While you can see others clearly, you may minimize your own needs.',
        traits: ['Independence', 'Discipline', 'Trust Capacity'],
        insightLevel: 'premium',
      ),
      ReportSection(
        id: 'money-psychology',
        title: 'Money Psychology',
        icon: 'dollar',
        content: 'Your relationship with money is emotionally charged. You tend to view financial security as emotional security.',
        traits: ['Discipline', 'Resilience', 'Leadership'],
        insightLevel: 'premium',
      ),
      ReportSection(
        id: 'recurring-patterns',
        title: 'Recurring Life Patterns',
        icon: 'repeat',
        content: 'Your karmic patterns reveal a recurring theme of entering situations where you are undervalued, only to eventually claim your worth.',
        traits: ['Adaptability', 'Patience', 'Loyalty'],
        insightLevel: 'premium',
      ),
    ];
  }
}
