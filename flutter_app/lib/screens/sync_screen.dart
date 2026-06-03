import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import 'compatibility_detail_screen.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({super.key});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  final _partnerNameController = TextEditingController();
  String _selectedSign = 'Aries';

  static const List<String> zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  @override
  void dispose() {
    _partnerNameController.dispose();
    super.dispose();
  }

  void _calculate(AppState state) {
    if (_partnerNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter your partner's name")),
      );
      return;
    }
    state.calculateCompatibility(
      _partnerNameController.text.trim(),
      _selectedSign,
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
        title: Text(
          "Cosmic Sync",
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
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── INPUT FORM ───
              GlassPremiumCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Cosmic Harmony Check",
                      style: TextStyle(
                        color: AppColors.goldDark,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Playfair Display',
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _partnerNameController,
                      style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                      decoration: InputDecoration(
                        labelText: "Partner's Name",
                        labelStyle: const TextStyle(color: AppColors.brown500),
                        prefixIcon: const Icon(LucideIcons.user, color: AppColors.gold),
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
                    const Text(
                      "Partner's Moon / Zodiac Sign",
                      style: TextStyle(color: AppColors.brown500, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedSign,
                      style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                      dropdownColor: isDark ? AppColors.darkCard : Colors.white,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(LucideIcons.sparkles, color: AppColors.gold),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: AppColors.brown100),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: zodiacSigns.map((sign) {
                        return DropdownMenuItem<String>(
                          value: sign,
                          child: Text(sign),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedSign = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 24),
                    NeonGoldButton(
                      text: "Check Compatibility",
                      onPressed: () => _calculate(state),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ─── RESULTS PANEL ───
              if (state.compatPartnerSign != null) ...[
                _buildResultsPanel(state),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultsPanel(AppState state) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Choose compatibility badge
    String badge = "Growth Journey";
    Color badgeColor = Colors.orange;
    if (state.compatOverallScore > 70) {
      badge = "Cosmic Match!";
      badgeColor = AppColors.sage;
    } else if (state.compatOverallScore >= 45) {
      badge = "Harmonious Bond";
      badgeColor = AppColors.gold;
    }

    return GlassPremiumCard(
      child: Column(
        children: [
          Text(
            "Sync Result for ${state.birthDetails?.name} & ${state.compatPartnerName}",
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          // Circular Score Ring
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 120,
                height: 120,
                child: CircularProgressIndicator(
                  value: state.compatOverallScore / 100.0,
                  strokeWidth: 10,
                  color: AppColors.gold,
                  backgroundColor: AppColors.brown100,
                ),
              ),
              Column(
                children: [
                  Text(
                    "${state.compatOverallScore}%",
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.goldDark,
                    ),
                  ),
                  Text(
                    badge,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: badgeColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            "Your Moon elements (${state.astrologyData?.moonSign} & ${state.compatPartnerSign}) show a $badge pairing.",
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 20),
          // View details button
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.gold),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const CompatibilityDetailScreen(),
                ),
              );
            },
            child: const Text(
              "View Full Details →",
              style: TextStyle(color: AppColors.goldDark, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
