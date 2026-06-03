import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../widgets/custom_widgets.dart';

class _Article {
  final String title;
  final String category;
  final String readTime;
  final String preview;
  final String content;
  final IconData icon;

  const _Article({
    required this.title,
    required this.category,
    required this.readTime,
    required this.preview,
    required this.content,
    required this.icon,
  });
}

final List<_Article> _articles = [
  const _Article(
    icon: LucideIcons.moon,
    title: 'Understanding Your Moon Sign',
    category: 'Vedic Astrology',
    preview: 'In Vedic astrology, the Moon sign (Rashi) reveals your emotional nature — how you process feelings, seek comfort, and react under stress.',
    content: 'In Vedic astrology, the Moon sign (Rashi) reveals your emotional nature — how you process feelings, seek comfort, and react under stress. Unlike the Sun sign which represents your outward identity, the Moon sign holds the key to your inner world. It governs your instincts, habits, and subconscious patterns that silently direct your choices. Understanding your Moon sign is the first step to emotional self-awareness — it tells you why you react the way you do, what truly nourishes you, and where your deepest emotional needs lie.',
    readTime: '3 min',
  ),
  const _Article(
    icon: LucideIcons.star,
    title: 'What is Nakshatra?',
    category: 'Vedic Astrology',
    preview: "Nakshatras are 27 lunar mansions that divide the zodiac into finer segments of 13°20' each. Your birth Nakshatra reveals your deepest psychological tendencies.",
    content: "Nakshatras are 27 lunar mansions that divide the zodiac into finer segments of 13°20' each. Your birth Nakshatra reveals your deepest psychological tendencies, your life purpose (dharma), and your karmic inheritance. It is far more specific than your sign — think of it as the difference between knowing your city and knowing your exact address in the cosmos. Each Nakshatra has its own ruling deity, symbol, and psychological profile that adds remarkable depth to your astrological understanding.",
    readTime: '4 min',
  ),
  const _Article(
    icon: LucideIcons.clock,
    title: 'Vimshottari Dasha Explained',
    category: 'Vedic Astrology',
    preview: "The Vimshottari Dasha system is Vedic astrology's most powerful timing technique. It maps your life into planetary periods, each ruled by a different planet.",
    content: "The Vimshottari Dasha system is Vedic astrology's most powerful timing technique. It maps your life into planetary periods, each ruled by a different planet. Your current Dasha reveals which themes are active in your life right now — career shifts, relationship changes, spiritual growth, or emotional transformation. Understanding your Dasha is like reading the weather forecast for your soul. The total cycle spans 120 years, with each planet ruling a specific portion based on the Moon's Nakshatra at birth.",
    readTime: '4 min',
  ),
  const _Article(
    icon: LucideIcons.brain,
    title: 'The Science Behind Trait Scoring',
    category: 'Behavioral Science',
    preview: 'Our 14-trait emotional intelligence model combines behavioral questionnaire responses, Vedic planetary influences, and numerological vibration analysis.',
    content: 'Our 14-trait emotional intelligence model combines behavioral questionnaire responses (Likert-scale assessment), Vedic planetary influences (weighted by house and sign placement), and numerological vibration analysis (life path, destiny, and soul urge numbers). The scoring algorithm normalizes across all three data sources, creating a unified emotional profile that is greater than the sum of its parts. This multi-source approach ensures your profile reflects both your innate tendencies and your learned behaviors.',
    readTime: '3 min',
  ),
  const _Article(
    icon: LucideIcons.book_open,
    title: 'How Yogas Shape Your Life',
    category: 'Vedic Astrology',
    preview: 'Yogas are specific planetary combinations in your birth chart that create powerful positive effects. Raj Yoga brings authority and success.',
    content: 'Yogas are specific planetary combinations in your birth chart that create powerful positive effects. Raj Yoga brings authority and success, Gaj Kesari Yoga grants wisdom and respect, while Panch Mahapurusha Yogas indicate extraordinary potential in specific life areas. Recognizing your Yogas helps you lean into your natural advantages. Think of Yogas as cosmic endorsements — when activated by the right timing (Dasha), they can catalyze significant positive changes in your life trajectory.',
    readTime: '3 min',
  ),
  const _Article(
    icon: LucideIcons.hash,
    title: 'Numerology: Life Path Numbers',
    category: 'Numerology',
    preview: "Your Life Path Number (derived from your birth date) is the most significant number in numerology — it reveals your core purpose and the lessons you're here to learn.",
    content: "Your Life Path Number (derived from your birth date) is the most significant number in numerology — it reveals your core purpose and the lessons you're here to learn. Life Path 1 represents the Leader — independent, pioneering, and self-motivated. Life Path 2 is the Diplomat — sensitive, cooperative, and peace-loving. Life Path 3 is the Creative — expressive, joyful, and socially gifted. Life Path 4 is the Builder — practical, disciplined, and hardworking. Life Path 5 is the Adventurer — freedom-loving, versatile, and progressive. Life Path 6 is the Nurturer — responsible, loving, and community-oriented. Life Path 7 is the Seeker — analytical, spiritual, and introspective. Life Path 8 is the Powerhouse — ambitious, authoritative, and materially focused. Life Path 9 is the Humanitarian — compassionate, generous, and globally minded. Master numbers 11, 22, and 33 carry intensified vibrations of their root numbers (2, 4, 6) with added spiritual significance.",
    readTime: '5 min',
  ),
  const _Article(
    icon: LucideIcons.shield,
    title: 'Doshas: Understanding Karmic Blocks',
    category: 'Vedic Astrology',
    preview: 'Doshas are planetary afflictions in your birth chart that indicate areas of karmic challenge — not curses, but invitations for growth and transformation.',
    content: "Doshas are planetary afflictions in your birth chart that indicate areas of karmic challenge — not curses, but invitations for growth and transformation. Mangal Dosha (Mars affliction) affects relationship harmony and can create friction in partnerships. Kaal Sarp Dosha (Rahu-Ketu axis alignment) indicates karmic patterns related to ancestral unfinished business. Pitra Dosha relates to ancestral debts and can manifest as recurring family patterns. Nadi Dosha affects health compatibility between partners. Understanding your Doshas doesn't mean you're doomed — it means you have a roadmap for the inner work that will free you from repetitive patterns. Remedies include mantras, gemstones, charitable acts, and most importantly, conscious behavioral change.",
    readTime: '4 min',
  ),
  const _Article(
    icon: LucideIcons.compass,
    title: 'The Power of Your Ascendant',
    category: 'Vedic Astrology',
    preview: 'Your Ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your moment of birth — it is the lens through which all other planetary energies are filtered.',
    content: "Your Ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your moment of birth — it is the lens through which all other planetary energies are filtered. While your Sun sign represents your soul's purpose and your Moon sign reveals your emotional nature, your Ascendant is your social mask, your first impression, and your physical constitution. It determines the layout of your entire birth chart — which planets fall in which houses. A Leo Ascendant projects confidence and warmth regardless of their Sun sign. A Scorpio Ascendant emanates intensity and mystery. Understanding your Ascendant helps you bridge the gap between how you see yourself and how the world sees you, enabling more authentic self-expression.",
    readTime: '4 min',
  ),
];

class WisdomScreen extends StatefulWidget {
  const WisdomScreen({super.key});

  @override
  State<WisdomScreen> createState() => _WisdomScreenState();
}

class _WisdomScreenState extends State<WisdomScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final Set<String> _expandedArticles = {};
  final List<String> _recentlyViewed = [];

  final List<String> _categories = ['All', 'Vedic Astrology', 'Numerology', 'Behavioral Science'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onArticleViewed(String title) {
    setState(() {
      _recentlyViewed.remove(title);
      _recentlyViewed.insert(0, title);
      if (_recentlyViewed.length > 4) {
        _recentlyViewed.removeLast();
      }
    });
  }

  List<_Article> get _filteredArticles {
    return _articles.where((article) {
      final matchesCategory = _selectedCategory == 'All' || article.category == _selectedCategory;
      final matchesSearch = _searchQuery.trim().isEmpty ||
          article.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          article.preview.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          article.content.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          article.category.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final filtered = _filteredArticles;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Wisdom Library',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.brown900,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: Column(
          children: [
            // ─── SEARCH BAR ───
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 14),
                    const Icon(LucideIcons.search, color: AppColors.brown400, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                        style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "Search wisdom topics...",
                          hintStyle: TextStyle(color: AppColors.brown400, fontSize: 13),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ─── RECENTLY VIEWED (HORIZONTAL BAR) ───
            if (_recentlyViewed.isNotEmpty && _searchQuery.trim().isEmpty) ...[
              const Padding(
                padding: EdgeInsets.only(left: 20, top: 12, bottom: 6),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    "Recently Viewed",
                    style: TextStyle(
                      color: AppColors.goldDark,
                      fontFamily: 'Playfair Display',
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 72,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _recentlyViewed.length,
                  itemBuilder: (context, index) {
                    final title = _recentlyViewed[index];
                    final article = _articles.firstWhere((a) => a.title == title);

                    // Color indicator
                    Color accentColor = AppColors.sage;
                    if (article.category == 'Numerology') accentColor = AppColors.gold;
                    if (article.category == 'Behavioral Science') accentColor = AppColors.brown700;

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _expandedArticles.add(title);
                        });
                        // Smooth scroll to the article or toggle expand
                      },
                      child: Container(
                        width: 200,
                        margin: const EdgeInsets.only(right: 12, bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkCard.withValues(alpha: 0.8) : Colors.white.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                              blurRadius: 6,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Icon(article.icon, color: accentColor, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    article.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: isDark ? Colors.white : AppColors.brown900,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    article.category,
                                    style: TextStyle(
                                      color: accentColor.withValues(alpha: 0.8),
                                      fontSize: 9,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],

            // ─── CATEGORY TAB FILTERS ───
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isActive = _selectedCategory == cat;

                    return Padding(
                      padding: const EdgeInsets.only(right: 6.0),
                      child: ChoiceChip(
                        label: Text(cat, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                        selected: isActive,
                        selectedColor: AppColors.gold,
                        backgroundColor: isDark ? AppColors.darkCard : Colors.white,
                        labelStyle: TextStyle(
                          color: isActive
                              ? Colors.white
                              : (isDark ? Colors.white70 : AppColors.brown800),
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedCategory = cat;
                            });
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
            ),
            const Divider(height: 1),

            // ─── ARTICLES LIST ───
            Expanded(
              child: filtered.isEmpty
                  ? const Center(
                      child: Text(
                        "No articles found matching search criteria.",
                        style: TextStyle(color: AppColors.brown500, fontSize: 13),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final article = filtered[index];
                        final isExpanded = _expandedArticles.contains(article.title);

                        Color accentColor = AppColors.sage;
                        if (article.category == 'Numerology') accentColor = AppColors.gold;
                        if (article.category == 'Behavioral Science') accentColor = AppColors.brown700;

                        return TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0.0, end: 1.0),
                          duration: Duration(milliseconds: 300 + (index % 4 * 60)),
                          curve: Curves.easeOut,
                          builder: (context, value, child) {
                            return Opacity(
                              opacity: value,
                              child: Transform.translate(
                                offset: Offset(0, 20 * (1 - value)),
                                child: child,
                              ),
                            );
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkCard : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppColors.brown100.withValues(alpha: 0.4),
                                width: 0.8,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: IntrinsicHeight(
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    // Left vertical accent stripe
                                    Container(
                                      width: 4.5,
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
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: accentColor.withValues(alpha: 0.1),
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: Row(
                                                    children: [
                                                      Icon(article.icon, color: accentColor, size: 10),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        article.category,
                                                        style: TextStyle(color: accentColor, fontSize: 8, fontWeight: FontWeight.bold),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Row(
                                                  children: [
                                                    const Icon(LucideIcons.clock, size: 10, color: AppColors.brown400),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      article.readTime,
                                                      style: const TextStyle(fontSize: 10, color: AppColors.brown400),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              article.title,
                                              style: TextStyle(
                                                color: isDark ? Colors.white : AppColors.brown900,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14.5,
                                                fontFamily: 'Playfair Display',
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            AnimatedCrossFade(
                                              firstChild: Text(
                                                article.preview,
                                                style: const TextStyle(color: AppColors.brown500, fontSize: 12.5, height: 1.45),
                                              ),
                                              secondChild: Text(
                                                article.content,
                                                style: TextStyle(
                                                  color: isDark ? Colors.white70 : AppColors.brown700,
                                                  fontSize: 12.5,
                                                  height: 1.5,
                                                ),
                                              ),
                                              crossFadeState: isExpanded
                                                  ? CrossFadeState.showSecond
                                                  : CrossFadeState.showFirst,
                                              duration: const Duration(milliseconds: 250),
                                            ),
                                            const SizedBox(height: 14),
                                            InkWell(
                                              onTap: () {
                                                setState(() {
                                                  if (isExpanded) {
                                                    _expandedArticles.remove(article.title);
                                                  } else {
                                                    _expandedArticles.add(article.title);
                                                    _onArticleViewed(article.title);
                                                  }
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
