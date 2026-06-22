import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';
import '../services/api_service.dart';
import 'pdf_viewer_screen.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

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
              }),

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
            AppColors.gold.withValues(alpha: 0.15),
            AppColors.goldDark.withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.1),
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
                  "Unlock Premium Kundali PDF Guide",
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
          const SizedBox(height: 12),
          Row(
            children: [
              const Text(
                "₹99",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                "₹499",
                style: TextStyle(
                  color: AppColors.brown400,
                  fontSize: 14,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  "80% OFF (Limited Offer)",
                  style: TextStyle(color: Colors.green, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          NeonGoldButton(
            text: "Unlock Detailed Report Now",
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
                              color: AppColors.gold.withValues(alpha: 0.12),
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
              AstroMarkdownText(
                text: section.content,
                style: TextStyle(
                  color: isDark ? Colors.white70 : AppColors.brown700,
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
                      color: AppColors.sageLight.withValues(alpha: isDark ? 0.08 : 0.4),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.sage.withValues(alpha: 0.2)),
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
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        bool processing = false;
        String selectedUpiApp = '';

        return StatefulBuilder(
          builder: (context, setStateDialog) {
            void handleUpiTap(String appName) async {
              setStateDialog(() {
                processing = true;
                selectedUpiApp = appName;
              });
              await Future.delayed(const Duration(milliseconds: 2000));
              if (!context.mounted) return;
              Navigator.pop(context); // Close the UPI payment sheet
              _triggerReportGeneration(context, state, appName);
            }

            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
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
                      if (processing) ...[
                        Expanded(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const CosmicLoader(message: "Initializing secure merchant handshake..."),
                                const SizedBox(height: 20),
                                Text(
                                  "Connecting securely to $selectedUpiApp App...",
                                  style: const TextStyle(color: AppColors.brown500, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ] else ...[
                        Row(
                          children: [
                            const Text("👑", style: TextStyle(fontSize: 26)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Premium Kundali Guide",
                                    style: TextStyle(
                                      color: isDark ? Colors.white : AppColors.brown900,
                                      fontFamily: 'Playfair Display',
                                      fontWeight: FontWeight.bold,
                                      fontSize: 20,
                                    ),
                                  ),
                                  const Text(
                                    "Astro-Remedial PDF & Golden Insights",
                                    style: TextStyle(color: AppColors.goldDark, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Expanded(
                          child: SingleChildScrollView(
                            physics: const BouncingScrollPhysics(),
                            child: Column(
                              children: [
                                _buildBenefitRow("Complete 35+ Page Kundali PDF Guidebook", "Download & read offline anytime"),
                                _buildBenefitRow("Hidden Strengths & Potential Mapping", "Uncover cosmic advantages in career/life"),
                                _buildBenefitRow("Emotional Blind Spots & Sade Sati Care", "Actionable methods to dissolve hurdles"),
                                _buildBenefitRow("Money Psychology & Wealth Guidance", "Tailored financial astro-remedies"),
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.darkCard : Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text("Payable Amount", style: TextStyle(color: AppColors.brown400, fontSize: 11)),
                                          Text("Includes PDF Generation", style: TextStyle(color: AppColors.brown500, fontSize: 9)),
                                        ],
                                      ),
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.baseline,
                                        textBaseline: TextBaseline.alphabetic,
                                        children: [
                                          const Text(
                                            "₹99",
                                            style: TextStyle(color: AppColors.goldDark, fontSize: 24, fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            "₹499",
                                            style: TextStyle(
                                              color: isDark ? Colors.white30 : AppColors.brown100,
                                              fontSize: 14,
                                              decoration: TextDecoration.lineThrough,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                                const Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    "CHOOSE INSTANT UPI OPTION",
                                    style: TextStyle(
                                      color: AppColors.goldDark,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                _buildUpiButton(
                                  context: context,
                                  appName: "Google Pay",
                                  color: Colors.blue.shade600,
                                  icon: "GPay",
                                  onPressed: () => handleUpiTap("Google Pay"),
                                ),
                                const SizedBox(height: 8),
                                _buildUpiButton(
                                  context: context,
                                  appName: "PhonePe",
                                  color: Colors.purple.shade600,
                                  icon: "PhonePe",
                                  onPressed: () => handleUpiTap("PhonePe"),
                                ),
                                const SizedBox(height: 8),
                                _buildUpiButton(
                                  context: context,
                                  appName: "Paytm",
                                  color: Colors.cyan.shade700,
                                  icon: "Paytm",
                                  onPressed: () => handleUpiTap("Paytm"),
                                ),
                                const SizedBox(height: 8),
                                _buildUpiButton(
                                  context: context,
                                  appName: "Other UPI / BHIM",
                                  color: Colors.orange.shade700,
                                  icon: "UPI",
                                  onPressed: () => handleUpiTap("UPI App"),
                                ),
                                const SizedBox(height: 20),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _triggerReportGeneration(BuildContext context, AppState state, String appName) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return PopScope(
          canPop: false,
          child: const AlertDialog(
            backgroundColor: Colors.transparent,
            elevation: 0,
            content: Center(
              child: CosmicLoader(
                message: "Analyzing celestial alignment...\nSynthesizing 15-segment deep insights...",
              ),
            ),
          ),
        );
      },
    );

    try {
      await state.generateDeepReport();
      if (context.mounted) {
        Navigator.pop(context); // Close loader dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("✨ Payment of ₹99 successful via $appName! Deep AI Insights generated."),
            backgroundColor: AppColors.sage,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context); // Close loader dialog
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: Theme.of(context).brightness == Brightness.dark ? AppColors.darkCard : Colors.white,
            title: const Row(
              children: [
                Icon(Icons.error_outline, color: Colors.red),
                SizedBox(width: 8),
                Text("AI Generation Error"),
              ],
            ),
            content: Text(
              "We encountered an issue while generating your deep astrological report: $e\n\nPlease try again.",
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
            actions: [
              TextButton(
                child: const Text("OK", style: TextStyle(color: AppColors.goldDark)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      }
    }
  }

  Widget _buildBenefitRow(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 16),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, height: 1.3),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppColors.brown500, fontSize: 10, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpiButton({
    required BuildContext context,
    required String appName,
    required Color color,
    required String icon,
    required VoidCallback onPressed,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.brown100.withValues(alpha: 0.4), width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 30,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: color.withValues(alpha: 0.4), width: 0.8),
              ),
              alignment: Alignment.center,
              child: Text(
                icon,
                style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                appName,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
            const Icon(LucideIcons.chevron_right, size: 14, color: AppColors.brown400),
          ],
        ),
      ),
    );
  }

  Future<void> _downloadReport(BuildContext context, AppState state) async {
    if (state.userId == null) return;
    setState(() {
      _isDownloading = true;
    });

    try {
      final pdfBytes = await ApiService.generatePdfReport(
        userId: state.userId!,
        includePremium: state.hasPaid,
      );

      // Save PDF report to user documents directory
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
                Icon(LucideIcons.file_check, color: AppColors.sage),
                SizedBox(width: 8),
                Text("Report Generated"),
              ],
            ),
            content: Text(
              "Your detailed astrological report has been generated and saved natively to your local storage as a PDF:\n\n${file.path}",
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
    } catch (e) {
      if (context.mounted) {
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
