import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../widgets/custom_widgets.dart';

class WisdomScreen extends StatefulWidget {
  const WisdomScreen({Key? key}) : super(key: key);

  @override
  State<WisdomScreen> createState() => _WisdomScreenState();
}

class _WisdomScreenState extends State<WisdomScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _articles = [
    {
      'title': 'The Power of Your Ascendant (Lagna)',
      'category': 'Vedic Astrology',
      'readTime': '3 min',
      'preview': 'Your Ascendant represents your interface with the physical world, your appearance, temperament, and default reactions.',
      'content': 'In Vedic astrology, Lagna is the sign rising on the eastern horizon at the moment of your birth. Unlike tropical Western astrology which focuses heavily on the Sun sign, Vedic systems view the Lagna as your primary physical and behavioral avatar. It dictates how you handle first impressions and construct your social self-defense mechanisms.',
    },
    {
      'title': 'Doshas & Karmic Lessons',
      'category': 'Vedic Astrology',
      'readTime': '5 min',
      'preview': 'Doshas like Manglik, Kaal Sarp, or Sade Sati represent specific stress patterns and structural life blockages.',
      'content': 'Rather than viewing doshas as curses, AyuAstro frames them as psychological and developmental blockages. For instance, Kuja Dosha (Mars placement) indicates an intense drive that requires maturity to prevent relational burnout. Sade Sati (Saturn transit) represents 7.5 years of structured accountability forcing self-reckoning.',
    },
    {
      'title': 'Life Path & Numerology Core Numbers',
      'category': 'Numerology',
      'readTime': '4 min',
      'preview': 'Learn how your birth date numbers shape your life lessons and internal motivation patterns.',
      'content': 'In the Pythagorean numerological system, your Life Path number calculated from your full date of birth denotes the central trail you walk. The Destiny number calculated from your name reveals your active capabilities, and the Soul Urge shows your silent, deep-seated emotional needs.',
    },
    {
      'title': '14 Personality Traits Scoring Blends',
      'category': 'Behavioral Science',
      'readTime': '4 min',
      'preview': 'Our scoring system integrates 40% astrology, 20% numerology, and 40% questionnaire inputs.',
      'content': 'AyuAstro uses a structured weighted formula. The astrological components provide the archetypal template, the numerology supplies the core driving motivation, and the behavioral questionnaire provides your current, active choices. This blended framework prevents superstitious fatalism.',
    },
  ];

  final Map<int, bool> _expandedArticles = {};

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Filter articles
    final filtered = _articles.where((article) {
      final matchesCategory = _selectedCategory == 'All' || article['category'] == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          article['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          article['preview'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: StarFieldBackground(
        child: Column(
          children: [
            // ─── SEARCH & FILTER HEADER ───
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // Search bar
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkCard : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.brown100),
                      ),
                      child: TextField(
                        controller: _searchController,
                        style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                        decoration: const InputDecoration(
                          prefixIcon: Icon(LucideIcons.search, color: AppColors.gold, size: 18),
                          hintText: "Search wisdom library...",
                          hintStyle: TextStyle(color: AppColors.brown400, fontSize: 13),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Category buttons list
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        children: ['All', 'Vedic Astrology', 'Numerology', 'Behavioral Science'].map((cat) {
                          final isSelected = _selectedCategory == cat;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text(cat, style: const TextStyle(fontSize: 10)),
                              selected: isSelected,
                              selectedColor: AppColors.gold.withOpacity(0.2),
                              backgroundColor: isDark ? Colors.white.withOpacity(0.04) : Colors.white,
                              side: BorderSide(color: isSelected ? AppColors.gold : AppColors.brown100),
                              labelStyle: TextStyle(
                                color: isSelected ? AppColors.goldDark : (isDark ? Colors.white70 : AppColors.brown700),
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() {
                                    _selectedCategory = cat;
                                  });
                                }
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // ─── ARTICLES LIST ───
            Expanded(
              child: filtered.isEmpty
                  ? const Center(
                      child: Text("No articles found matching search criteria.", style: TextStyle(color: AppColors.brown500)),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final article = filtered[index];
                        final isExpanded = _expandedArticles[index] ?? false;

                        Color accentColor = AppColors.sage;
                        if (article['category'] == 'Numerology') accentColor = AppColors.gold;
                        if (article['category'] == 'Behavioral Science') accentColor = AppColors.brown700;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: GlassLightCard(
                            padding: EdgeInsets.zero,
                            child: IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Color bar left accent
                                  Container(
                                    width: 4,
                                    color: accentColor,
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(16.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: accentColor.withOpacity(0.1),
                                                  borderRadius: BorderRadius.circular(10),
                                                ),
                                                child: Text(
                                                  article['category'],
                                                  style: TextStyle(color: accentColor, fontSize: 8, fontWeight: FontWeight.bold),
                                                ),
                                              ),
                                              Row(
                                                children: [
                                                  const Icon(LucideIcons.clock, size: 10, color: AppColors.brown400),
                                                  const SizedBox(width: 4),
                                                  Text(article['readTime'], style: const TextStyle(fontSize: 10, color: AppColors.brown400)),
                                                ],
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            article['title'],
                                            style: TextStyle(
                                              color: isDark ? Colors.white : AppColors.brown900,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                              fontFamily: 'Playfair Display',
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            isExpanded ? article['content'] : article['preview'],
                                            style: const TextStyle(color: AppColors.brown700, fontSize: 12, height: 1.4),
                                          ),
                                          const SizedBox(height: 12),
                                          InkWell(
                                            onTap: () {
                                              setState(() {
                                                _expandedArticles[index] = !isExpanded;
                                              });
                                            },
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  isExpanded ? "Collapse Content" : "Read Full Article",
                                                  style: const TextStyle(color: AppColors.goldDark, fontSize: 11, fontWeight: FontWeight.bold),
                                                ),
                                                const SizedBox(width: 4),
                                                Icon(
                                                  isExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                                                  color: AppColors.gold,
                                                  size: 14,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
