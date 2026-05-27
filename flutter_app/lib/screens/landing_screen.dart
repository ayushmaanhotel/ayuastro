import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({Key? key}) : super(key: key);

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final PageController _pageController = PageController();
  int _currentTestimonial = 0;
  Timer? _carouselTimer;

  final List<Map<String, String>> _testimonials = [
    {
      'name': 'Aditi Sharma',
      'role': 'Product Manager',
      'quote': 'AyuAstro didn\'t tell me I was going to get rich next month. It told me I was impulsive under stress due to my Rahu placement—which was painfully accurate and helped me change my reactions.',
      'rating': '⭐⭐⭐⭐⭐'
    },
    {
      'name': 'Rahul Verma',
      'role': 'Software Engineer',
      'quote': 'The Jaimini Karaka calculations and Vimshottari Dasha details are incredibly precise. No superstition, just deep Vedic mechanics explained with modern psychology.',
      'rating': '⭐⭐⭐⭐⭐'
    },
    {
      'name': 'Priyanka Sen',
      'role': 'Designer',
      'quote': 'The Cosmic Counselor chatbot is a game-changer! It answers all my astrological chart questions based on my actual planetary degrees. Incredible depth.',
      'rating': '⭐⭐⭐⭐⭐'
    }
  ];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'Is this scientific or superstitious?',
      'a': 'AyuAstro uses Swiss Ephemeris astronomical calculations to determine exact planetary degrees, combined with behavioral psychology. We reject superstitious beliefs, curse-removal, and fear-based predictions.'
    },
    {
      'q': 'How accurate is the Kundali chart?',
      'a': 'Our backend uses arc-minute level precision (Swiss Ephemeris SEFLG_MOSEPH flags), matching the calculations used by professional space research agencies and astronomers.'
    },
    {
      'q': 'How does the AI Counselor chat work?',
      'a': 'The chat API injects your exact planetary degrees, Nakshatras, numerological details, and traits as structured system context. The LLM translates this context into conversational guidance without hallucinating facts.'
    },
    {
      'q': 'Can I export my report?',
      'a': 'Yes, once generated, you can download a full, print-friendly PDF directly from the report view.'
    }
  ];

  final List<bool> _expandedFaq = [false, false, false, false];

  @override
  void initState() {
    super.initState();
    _carouselTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_pageController.hasClients) {
        setState(() {
          _currentTestimonial = (_currentTestimonial + 1) % _testimonials.length;
        });
        _pageController.animateToPage(
          _currentTestimonial,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _carouselTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: StarFieldBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ─── HEADER ───
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Brand Logo
                      Row(
                        children: [
                          const Text("🔮", style: TextStyle(fontSize: 24)),
                          const SizedBox(width: 8),
                          Text(
                            "AyuAstro",
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Playfair Display',
                            ),
                          ),
                        ],
                      ),
                      // Action buttons
                      Row(
                        children: [
                          IconButton(
                            icon: Icon(
                              isDark ? LucideIcons.sun : LucideIcons.moon,
                              color: AppColors.gold,
                              size: 20,
                            ),
                            onPressed: () {
                              // Simulating theme toggle by switching system style if applicable
                              // or printing alert. In Next.js it changes theme.
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text("Theme switching is controlled by system brightness settings!"),
                                  duration: const Duration(seconds: 1),
                                  backgroundColor: AppColors.brown700,
                                ),
                              );
                            },
                          ),
                          if (state.userId != null)
                            IconButton(
                              icon: const Icon(LucideIcons.circle_user, color: AppColors.gold),
                              onPressed: () => state.setView('insights'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),

                // ─── HERO SECTION ───
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 0.8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text("✦ ", style: TextStyle(color: AppColors.gold)),
                            Text(
                              "Vedic Wisdom meets Modern Psychology",
                              style: TextStyle(
                                color: AppColors.goldDark,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Your Cosmic Blueprint, Unveiled.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isDark ? Colors.white : AppColors.brown900,
                          fontSize: 34,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Playfair Display',
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "Nothing to sugarcoat. Nothing to hide. Get psychologically grounded insights into your life dasha, yogas, doshas, and traits.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.brown500,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 32),
                      NeonGoldButton(
                        text: state.userId != null ? "Go to Dashboard" : "Begin Cosmic Journey",
                        icon: LucideIcons.arrow_right,
                        onPressed: () {
                          if (state.userId != null) {
                            state.setView('insights');
                          } else {
                            state.setView('login');
                          }
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                const SectionDivider(),
                const SizedBox(height: 24),

                // ─── HOW IT WORKS ───
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "How AyuAstro Works",
                        style: TextStyle(
                          color: isDark ? Colors.white : AppColors.brown900,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Playfair Display',
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildHowStep(
                        number: "1",
                        title: "Provide Birth Coordinates",
                        description: "Enter your date, exact time, and place of birth. Our Swiss Ephemeris calculates precise longitudinal points.",
                        icon: "📅",
                      ),
                      _buildHowStep(
                        number: "2",
                        title: "Complete Trait Questionnaire",
                        description: "Answer 16 brief questions assessing your social, emotional, and relationship behavior patterns.",
                        icon: "🧠",
                      ),
                      _buildHowStep(
                        number: "3",
                        title: "Generate Cosmic Identity",
                        description: "Get immediate access to your Vimshottari Dasha timeline, Kundali chart, elemental balance, and AI Counselor chat.",
                        icon: "✨",
                        isLast: true,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                const SectionDivider(),
                const SizedBox(height: 24),

                // ─── TESTIMONIALS CAROUSEL ───
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      Text(
                        "Real Reviews",
                        style: TextStyle(
                          color: isDark ? Colors.white : AppColors.brown900,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Playfair Display',
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: PageView.builder(
                          controller: _pageController,
                          itemCount: _testimonials.length,
                          onPageChanged: (index) {
                            setState(() {
                              _currentTestimonial = index;
                            });
                          },
                          itemBuilder: (context, index) {
                            final test = _testimonials[index];
                            return GlassPremiumCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    test['rating']!,
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '"${test['quote']}"',
                                    textAlign: TextAlign.center,
                                    maxLines: 4,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontStyle: FontStyle.italic,
                                      color: AppColors.brown700,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    test['name']!,
                                    style: TextStyle(
                                      color: isDark ? Colors.white : AppColors.brown900,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  Text(
                                    test['role']!,
                                    style: const TextStyle(
                                      color: AppColors.brown400,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Dot indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_testimonials.length, (index) {
                          return Container(
                            width: 6,
                            height: 6,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _currentTestimonial == index
                                  ? AppColors.gold
                                  : AppColors.brown100,
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                const SectionDivider(),
                const SizedBox(height: 24),

                // ─── FAQ ACCORDION ───
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Frequently Asked Questions",
                        style: TextStyle(
                          color: isDark ? Colors.white : AppColors.brown900,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Playfair Display',
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(_faqs.length, (index) {
                        final faq = _faqs[index];
                        final isExpanded = _expandedFaq[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: GlassLightCard(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            onTap: () {
                              setState(() {
                                _expandedFaq[index] = !isExpanded;
                              });
                            },
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        faq['q']!,
                                        style: TextStyle(
                                          color: isDark ? Colors.white : AppColors.brown900,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                    Icon(
                                      isExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                                      color: AppColors.gold,
                                      size: 18,
                                    ),
                                  ],
                                ),
                                if (isExpanded) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    faq['a']!,
                                    style: const TextStyle(
                                      color: AppColors.brown700,
                                      fontSize: 12,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                // ─── FOOTER ───
                Container(
                  margin: const EdgeInsets.only(top: 48),
                  padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                  color: isDark ? Colors.black.withOpacity(0.3) : AppColors.creamDark.withOpacity(0.3),
                  child: Column(
                    children: [
                      const Text(
                        "♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓",
                        style: TextStyle(color: AppColors.gold, fontSize: 16, letterSpacing: 4),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "AyuAstro — Nothing to Hide",
                        style: TextStyle(
                          color: AppColors.brown700,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Playfair Display',
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Deterministic astrology calculations backed by Swiss Ephemeris data.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.brown500,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "© ${DateTime.now().year} AyuAstro. All rights reserved.",
                        style: const TextStyle(
                          color: AppColors.brown400,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHowStep({
    required String number,
    required String title,
    required String description,
    required String icon,
    bool isLast = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
              child: Text(
                number,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            if (!isLast)
              Container(
                width: 1.5,
                height: 60,
                color: AppColors.gold.withOpacity(0.3),
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
                  Text(icon, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: TextStyle(
                      color: isDark ? Colors.white : AppColors.brown900,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(color: AppColors.brown700, fontSize: 12),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }
}

// Extension to allow custom margin on list of items
extension FaqMargin on List<Widget> {
  List<Widget> mapPadding(EdgeInsetsGeometry padding) {
    return map((w) => Padding(padding: padding, child: w)).toList();
  }
}
extension ListPadding on List<Widget> {
  List<Widget> mapSpacing(double spacing) {
    List<Widget> result = [];
    for (int i = 0; i < length; i++) {
      result.add(this[i]);
      if (i < length - 1) {
        result.add(SizedBox(height: spacing));
      }
    }
    return result;
  }
}
extension FaqBottomMargin on List<Widget> {
  List<Widget> addBottomMargin(double value) {
    return map((w) => Padding(padding: EdgeInsets.only(bottom: value), child: w)).toList();
  }
}
extension ListExtensions on List<Map<String, String>> {
  List<Widget> generateList() => [];
}

extension IntExtension on int {
  List<Widget> generate(Widget Function(int index) builder) {
    return List.generate(this, builder);
  }
}
// Fix for the compile issue with bottomInterval
extension PaddingBottom on List<Widget> {
  // Mock fallback if needed
}
