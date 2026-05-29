import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../models/models.dart';

class _Product {
  final String id;
  final String name;
  final String category;
  final double price;
  final double? originalPrice;
  final String emoji;
  final String description;
  final List<String> benefits;
  final List<String>? doshaRelated;
  final List<String>? planetRelated;
  final double rating;
  final int reviews;
  final bool inStock;
  final bool isNew;
  final bool isBestseller;

  const _Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.originalPrice,
    required this.emoji,
    required this.description,
    required this.benefits,
    this.doshaRelated,
    this.planetRelated,
    required this.rating,
    required this.reviews,
    required this.inStock,
    this.isNew = false,
    this.isBestseller = false,
  });
}

final List<_Product> _products = [
  // Pujas
  const _Product(
    id: 'mangal-dosha-puja',
    name: 'Mangal Dosha Nivaran Puja',
    category: 'Pujas',
    price: 5100,
    originalPrice: 7500,
    emoji: '🔥',
    description: 'Sacred Vedic ceremony to pacify Mars energy and reduce Mangal Dosha effects on marriage and relationships.',
    benefits: ['Reduces marital delays', 'Harmonizes Mars energy', 'Removes relationship obstacles', 'Performed by certified Vedic priests'],
    doshaRelated: ['Mangal Dosha'],
    planetRelated: ['Mars'],
    rating: 4.9,
    reviews: 342,
    inStock: true,
    isBestseller: true,
  ),
  const _Product(
    id: 'kaal-sarp-puja',
    name: 'Kaal Sarp Dosh Nivaran',
    category: 'Pujas',
    price: 7100,
    originalPrice: 10000,
    emoji: '🐍',
    description: 'Powerful puja to neutralize Kaal Sarp Dosha caused by Rahu-Ketu axis alignment, releasing ancestral karmic blocks.',
    benefits: ['Breaks karmic cycles', 'Reduces Rahu-Ketu malefic effects', 'Ancestral peace', 'Career & financial breakthrough'],
    doshaRelated: ['Kaal Sarp Dosha'],
    planetRelated: ['Rahu', 'Ketu'],
    rating: 4.8,
    reviews: 256,
    inStock: true,
  ),
  const _Product(
    id: 'navagraha-puja',
    name: 'Navagraha Shanti Puja',
    category: 'Pujas',
    price: 8100,
    originalPrice: 12000,
    emoji: '🪐',
    description: 'Comprehensive nine-planet pacification ceremony to balance all planetary energies in your birth chart.',
    benefits: ['Balances all 9 planets', 'Overall life harmony', 'Reduces negative dasha effects', 'Enhances positive planetary influences'],
    rating: 4.9,
    reviews: 412,
    inStock: true,
    isBestseller: true,
  ),
  const _Product(
    id: 'pitra-dosh-puja',
    name: 'Pitra Dosh Shanti Puja',
    category: 'Pujas',
    price: 5500,
    emoji: '🙏',
    description: 'Ceremony to honor ancestors and resolve Pitra Dosha, which can manifest as recurring family patterns and obstacles.',
    benefits: ['Ancestral blessings', 'Family harmony', 'Removes hereditary karmic blocks', 'Peace to departed souls'],
    doshaRelated: ['Pitra Dosha'],
    rating: 4.7,
    reviews: 189,
    inStock: true,
  ),
  const _Product(
    id: 'saturn-shanti-puja',
    name: 'Shani Shanti Puja',
    category: 'Pujas',
    price: 6100,
    originalPrice: 8500,
    emoji: '♄',
    description: 'Dedicated puja to pacify Saturn during Sade Sati or challenging Saturn dasha periods.',
    benefits: ['Reduces Saturn afflictions', 'Eases Sade Sati effects', 'Career stability', 'Patience & discipline enhancement'],
    planetRelated: ['Saturn'],
    rating: 4.8,
    reviews: 298,
    inStock: true,
  ),
  // Gemstones
  const _Product(
    id: 'blue-sapphire',
    name: 'Natural Blue Sapphire (Neelam)',
    category: 'Gemstones',
    price: 15000,
    originalPrice: 22000,
    emoji: '💎',
    description: 'Certified natural Blue Sapphire for Saturn empowerment. Enhances discipline, career success, and protection from Saturn\'s malefic effects.',
    benefits: ['Career advancement', 'Protection from Saturn', 'Mental clarity', 'Wealth attraction'],
    planetRelated: ['Saturn'],
    rating: 4.9,
    reviews: 156,
    inStock: true,
    isBestseller: true,
  ),
  const _Product(
    id: 'red-coral',
    name: 'Natural Red Coral (Moonga)',
    category: 'Gemstones',
    price: 4500,
    originalPrice: 6500,
    emoji: '🔴',
    description: 'Certified natural Red Coral for Mars empowerment. Boosts courage, energy, and reduces Mangal Dosha effects.',
    benefits: ['Courage & confidence', 'Mars energy balance', 'Reduces Mangal Dosha', 'Physical vitality'],
    doshaRelated: ['Mangal Dosha'],
    planetRelated: ['Mars'],
    rating: 4.7,
    reviews: 203,
    inStock: true,
  ),
  const _Product(
    id: 'yellow-sapphire',
    name: 'Natural Yellow Sapphire (Pukhraj)',
    category: 'Gemstones',
    price: 12000,
    originalPrice: 18000,
    emoji: '💛',
    description: 'Certified natural Yellow Sapphire for Jupiter empowerment. Attracts wisdom, prosperity, and marital bliss.',
    benefits: ['Wisdom & knowledge', 'Marriage blessings', 'Jupiter energy boost', 'Financial prosperity'],
    planetRelated: ['Jupiter'],
    rating: 4.8,
    reviews: 178,
    inStock: true,
  ),
  const _Product(
    id: 'emerald',
    name: 'Natural Emerald (Panna)',
    category: 'Gemstones',
    price: 9500,
    originalPrice: 14000,
    emoji: '💚',
    description: 'Certified natural Emerald for Mercury empowerment. Enhances communication, intellect, and business acumen.',
    benefits: ['Communication skills', 'Business success', 'Intellectual growth', 'Mercury energy balance'],
    planetRelated: ['Mercury'],
    rating: 4.7,
    reviews: 134,
    inStock: true,
    isNew: true,
  ),
  const _Product(
    id: 'ruby',
    name: 'Natural Ruby (Manikya)',
    category: 'Gemstones',
    price: 25000,
    originalPrice: 35000,
    emoji: '❤️',
    description: 'Certified natural Ruby for Sun empowerment. Enhances leadership, authority, and self-confidence.',
    benefits: ['Leadership qualities', 'Self-confidence', 'Sun energy boost', 'Government favor'],
    planetRelated: ['Sun'],
    rating: 4.9,
    reviews: 98,
    inStock: true,
  ),
  // Rudraksha
  const _Product(
    id: 'ek-mukhi-rudraksha',
    name: '1 Mukhi Rudraksha',
    category: 'Rudraksha',
    price: 11000,
    emoji: '📿',
    description: 'Rare one-faced Rudraksha representing Lord Shiva. Ultimate spiritual awakening and mental peace.',
    benefits: ['Supreme consciousness', 'Mental peace', 'Spiritual growth', 'Connection with divine'],
    rating: 4.9,
    reviews: 67,
    inStock: true,
  ),
  const _Product(
    id: 'panch-mukhi-rudraksha',
    name: '5 Mukhi Rudraksha Bracelet',
    category: 'Rudraksha',
    price: 2100,
    originalPrice: 3500,
    emoji: '📿',
    description: 'Five-faced Rudraksha bracelet — the most commonly recommended bead for overall well-being and Jupiter energy.',
    benefits: ['Overall well-being', 'Blood pressure regulation', 'Jupiter blessings', 'Daily protection'],
    planetRelated: ['Jupiter'],
    rating: 4.8,
    reviews: 445,
    inStock: true,
    isBestseller: true,
  ),
  const _Product(
    id: '8-mukhi-rudraksha',
    name: '8 Mukhi Rudraksha',
    category: 'Rudraksha',
    price: 5500,
    emoji: '📿',
    description: 'Eight-faced Rudraksha blessed by Lord Ganesha. Removes obstacles and Rahu afflictions.',
    benefits: ['Obstacle removal', 'Rahu pacification', 'Success in endeavors', 'Knowledge & wisdom'],
    planetRelated: ['Rahu'],
    rating: 4.7,
    reviews: 89,
    inStock: true,
  ),
  // Remedies
  const _Product(
    id: 'navagraha-yantra',
    name: 'Navagraha Yantra (Gold Plated)',
    category: 'Remedies',
    price: 3100,
    originalPrice: 5000,
    emoji: '🔮',
    description: 'Energized gold-plated Navagraha Yantra for balancing all nine planetary energies in your living space.',
    benefits: ['Balances all planets', 'Home energy cleansing', 'Vastu correction', 'Meditation enhancement'],
    rating: 4.6,
    reviews: 167,
    inStock: true,
  ),
  const _Product(
    id: 'lal-kitab-remedies',
    name: 'Personalized Lal Kitab Remedies',
    category: 'Remedies',
    price: 2500,
    emoji: '📕',
    description: 'Custom Lal Kitab remedies based on your specific birth chart. Simple, practical, and effective daily actions.',
    benefits: ['Personalized to your chart', 'Simple daily practices', 'No complex rituals', 'Proven traditional methods'],
    rating: 4.8,
    reviews: 312,
    inStock: true,
    isNew: true,
  ),
  const _Product(
    id: 'mantra-audio',
    name: 'Planetary Mantra Collection',
    category: 'Remedies',
    price: 999,
    originalPrice: 1999,
    emoji: '🎵',
    description: 'Complete collection of Navagraha mantras with correct pronunciation guide. 108 recitations each, professionally recorded.',
    benefits: ['Correct pronunciation', 'All 9 planet mantras', 'Daily practice guide', 'Meditation support'],
    rating: 4.7,
    reviews: 523,
    inStock: true,
  ),
  // Rituals
  const _Product(
    id: 'griha-pravesh',
    name: 'Griha Pravesh Ceremony',
    category: 'Rituals',
    price: 11000,
    emoji: '🏠',
    description: 'Complete Vedic housewarming ceremony with certified priest. Ensures positive energy and prosperity in your new home.',
    benefits: ['Home energy blessing', 'Vastu purification', 'Prosperity invocation', 'Negative energy removal'],
    rating: 4.9,
    reviews: 145,
    inStock: true,
  ),
  const _Product(
    id: 'namkaran-ceremony',
    name: 'Namkaran Sanskar',
    category: 'Rituals',
    price: 5100,
    emoji: '👶',
    description: 'Traditional Vedic naming ceremony for newborns based on Nakshatra syllables and planetary positions.',
    benefits: ['Auspicious naming', 'Nakshatra-based', 'Child\'s cosmic blessing', 'Family celebration guide'],
    rating: 4.8,
    reviews: 87,
    inStock: true,
    isNew: true,
  ),
  const _Product(
    id: 'vivah-muhurta',
    name: 'Vivah Muhurta Consultation',
    category: 'Rituals',
    price: 4100,
    emoji: '💍',
    description: 'Expert Muhurta calculation for the most auspicious wedding date and time based on both partners\' charts.',
    benefits: ['Auspicious wedding date', 'Compatibility analysis', 'Planetary timing', 'Detailed report included'],
    rating: 4.9,
    reviews: 198,
    inStock: true,
    isBestseller: true,
  ),
];

class StoreScreen extends StatefulWidget {
  const StoreScreen({Key? key}) : super(key: key);

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> {
  String _activeCategory = 'All';
  String _searchQuery = '';
  final Set<String> _wishlist = {};

  final List<String> _categories = ['All', 'Pujas', 'Gemstones', 'Rudraksha', 'Remedies', 'Rituals'];

  Map<String, IconData> get _categoryIcons => {
        'All': LucideIcons.shopping_bag,
        'Pujas': LucideIcons.flame,
        'Gemstones': LucideIcons.gem,
        'Rudraksha': LucideIcons.circle_dot,
        'Remedies': LucideIcons.shield,
        'Rituals': LucideIcons.flower_2,
      };

  Map<String, Color> get _categoryColors => {
        'All': AppColors.gold,
        'Pujas': Colors.orange,
        'Gemstones': Colors.purple,
        'Rudraksha': Colors.amber,
        'Remedies': AppColors.sage,
        'Rituals': Colors.pink,
      };

  List<_Product> get _recommendedProducts {
    final state = Provider.of<AppState>(context, listen: false);
    final userDoshas = state.astrologyData?.doshas ?? [];
    final userPlanets = state.astrologyData?.planetaryPositions.keys.toList() ?? [];

    return _products.where((product) {
      // Match by dosha
      if (product.doshaRelated != null) {
        final matchesDosha = product.doshaRelated!.any((d) =>
            userDoshas.any((ud) => ud.toLowerCase().contains(d.toLowerCase().split(' ')[0])));
        if (matchesDosha) return true;
      }
      // Match by planet
      if (product.planetRelated != null) {
        final matchesPlanet = product.planetRelated!.any((p) =>
            userPlanets.any((up) => up.toLowerCase() == p.toLowerCase()));
        if (matchesPlanet) return true;
      }
      return false;
    }).toList();
  }

  List<_Product> get _filteredProducts {
    return _products.where((product) {
      final matchesCategory = _activeCategory == 'All' || product.category == _activeCategory;
      final matchesSearch = _searchQuery.trim().isEmpty ||
          product.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          product.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          product.category.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  void _showProductDetails(_Product product, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkBg : AppColors.cream,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: AppColors.gold.withOpacity(0.4), width: 1.0),
          ),
          child: StarFieldBackground(
            child: Column(
              children: [
                // Handle bar
                const SizedBox(height: 12),
                Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.brown400,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Badges Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (product.isBestseller)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.amber.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.amber, width: 0.5),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.sparkles, color: Colors.amber, size: 12),
                                    SizedBox(width: 4),
                                    Text("Bestseller", style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              )
                            else if (product.isNew)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.blue, width: 0.5),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.zap, color: Colors.blue, size: 12),
                                    SizedBox(width: 4),
                                    Text("New Launch", style: TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              )
                            else
                              const SizedBox(),
                            IconButton(
                              icon: Icon(
                                _wishlist.contains(product.id) ? Icons.favorite : Icons.favorite_border,
                                color: _wishlist.contains(product.id) ? Colors.red : AppColors.brown400,
                              ),
                              onPressed: () {
                                setState(() {
                                  if (_wishlist.contains(product.id)) {
                                    _wishlist.remove(product.id);
                                  } else {
                                    _wishlist.add(product.id);
                                  }
                                });
                                Navigator.pop(context);
                                _showProductDetails(product, isDark);
                              },
                            ),
                          ],
                        ),

                        // Center Emoji representation
                        Center(
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.gold.withOpacity(0.1),
                              border: Border.all(color: AppColors.gold.withOpacity(0.4), width: 1.0),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              product.emoji,
                              style: const TextStyle(fontSize: 48),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Name
                        Center(
                          child: Text(
                            product.name,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontFamily: 'Playfair Display',
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),

                        // Rating & Category
                        Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                product.category,
                                style: const TextStyle(color: AppColors.goldDark, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.star, color: Colors.amber, size: 14),
                              const SizedBox(width: 2),
                              Text(
                                product.rating.toString(),
                                style: TextStyle(color: isDark ? Colors.white70 : AppColors.brown500, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                "(${product.reviews} reviews)",
                                style: const TextStyle(color: AppColors.brown400, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Pricing block
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkCard : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.brown100.withOpacity(0.4), width: 0.8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text("Vedic Store Price", style: TextStyle(color: AppColors.brown400, fontSize: 11)),
                                  const SizedBox(height: 4),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.baseline,
                                    textBaseline: TextBaseline.alphabetic,
                                    children: [
                                      Text(
                                        "₹${product.price.toInt()}",
                                        style: const TextStyle(color: AppColors.goldDark, fontSize: 24, fontWeight: FontWeight.bold),
                                      ),
                                      if (product.originalPrice != null) ...[
                                        const SizedBox(width: 8),
                                        Text(
                                          "₹${product.originalPrice!.toInt()}",
                                          style: const TextStyle(
                                            color: AppColors.brown400,
                                            fontSize: 14,
                                            decoration: TextDecoration.lineThrough,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                              if (product.originalPrice != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    "Save ${((product.originalPrice! - product.price) / product.originalPrice! * 100).toInt()}%",
                                    style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Description
                        Text(
                          "ABOUT THIS REMEDY",
                          style: TextStyle(
                            color: isDark ? Colors.white70 : AppColors.brown700,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.description,
                          style: const TextStyle(color: AppColors.brown500, fontSize: 13, height: 1.5),
                        ),
                        const SizedBox(height: 20),

                        // Benefits
                        Text(
                          "BENEFITS & IMPACT",
                          style: TextStyle(
                            color: isDark ? Colors.white70 : AppColors.brown700,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ...product.benefits.map((b) => Padding(
                              padding: const EdgeInsets.only(bottom: 8.0),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(LucideIcons.check, color: AppColors.gold, size: 16),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      b,
                                      style: const TextStyle(color: AppColors.brown500, fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                        const SizedBox(height: 20),

                        // Sourcing / Trust Badge
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.gold.withOpacity(0.2), width: 0.8),
                          ),
                          child: const Row(
                            children: [
                              Icon(LucideIcons.shield, color: AppColors.gold, size: 18),
                              SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text("Authentic Vedic Sourcing", style: TextStyle(color: AppColors.goldDark, fontSize: 12, fontWeight: FontWeight.bold)),
                                    SizedBox(height: 2),
                                    Text("100% Energized by custom mantras before dispatch. Certification of authenticity included.", style: TextStyle(color: AppColors.brown500, fontSize: 10, height: 1.35)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),

                // Footer checkout action
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('✨ Order Enquiry for "${product.name}" registered!'),
                              backgroundColor: AppColors.gold,
                            ));
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.gold,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            elevation: 4,
                          ),
                          child: const Text('Enquire / Order Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final recommendations = _recommendedProducts;
    final filtered = _filteredProducts;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
          onPressed: () => state.setView('insights'),
        ),
        title: Text(
          'Vedic Store',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.brown900,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: Column(
          children: [
            // Search Input Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.brown100.withOpacity(0.4), width: 0.8),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 14),
                    const Icon(LucideIcons.search, color: AppColors.brown400, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                        style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "Search pujas, gemstones, remedies...",
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

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ─── RECOMMENDED FOR YOU (CAROUSEL) ───
                    if (recommendations.isNotEmpty && _searchQuery.trim().isEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.only(left: 20, top: 12, bottom: 8),
                        child: Text(
                          "Recommended for Your Chart",
                          style: TextStyle(
                            color: AppColors.goldDark,
                            fontFamily: 'Playfair Display',
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Container(
                        height: 140,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: recommendations.length,
                          itemBuilder: (context, idx) {
                            final product = recommendations[idx];

                            // Antigravity Design Rule: Weightless glassmorphism, soft diffused drop-shadow
                            return GestureDetector(
                              onTap: () => _showProductDetails(product, isDark),
                              child: Container(
                                width: 220,
                                margin: const EdgeInsets.only(right: 12, bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.darkCard.withOpacity(0.8) : Colors.white.withOpacity(0.8),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 0.8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Text(product.emoji, style: const TextStyle(fontSize: 32)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            product.name,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              color: isDark ? Colors.white : AppColors.brown900,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            "₹${product.price.toInt()}",
                                            style: const TextStyle(
                                              color: AppColors.goldDark,
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Row(
                                            children: [
                                              const Icon(Icons.star, color: Colors.amber, size: 10),
                                              const SizedBox(width: 2),
                                              Text(
                                                product.rating.toString(),
                                                style: TextStyle(
                                                  color: isDark ? Colors.white70 : AppColors.brown700,
                                                  fontSize: 9,
                                                ),
                                              ),
                                            ],
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
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Container(
                        height: 40,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: _categories.length,
                          itemBuilder: (context, index) {
                            final cat = _categories[index];
                            final isActive = _activeCategory == cat;
                            final color = _categoryColors[cat] ?? AppColors.gold;
                            final icon = _categoryIcons[cat] ?? LucideIcons.shopping_bag;

                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Row(
                                  children: [
                                    Icon(icon, color: isActive ? Colors.white : color, size: 13),
                                    const SizedBox(width: 6),
                                    Text(cat, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                ),
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
                                      _activeCategory = cat;
                                    });
                                  }
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ),

                    // ─── PRODUCT LIST GRID ───
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filtered.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.85,
                        ),
                        itemBuilder: (context, index) {
                          final product = filtered[index];

                          // Antigravity Design Rule: Staggered entrance transition
                          return TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.0, end: 1.0),
                            duration: Duration(milliseconds: 300 + (index % 6 * 60)),
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
                            child: Card(
                              color: isDark ? AppColors.darkCard : Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: AppColors.brown100.withOpacity(0.4),
                                  width: 0.8,
                                ),
                              ),
                              child: InkWell(
                                onTap: () => _showProductDetails(product, isDark),
                                borderRadius: BorderRadius.circular(16),
                                child: Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Top info: category + wishlist icon
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            product.category,
                                            style: const TextStyle(color: AppColors.brown400, fontSize: 9, fontWeight: FontWeight.bold),
                                          ),
                                          Icon(
                                            _wishlist.contains(product.id) ? Icons.favorite : Icons.favorite_border,
                                            color: _wishlist.contains(product.id) ? Colors.red : AppColors.brown400,
                                            size: 14,
                                          ),
                                        ],
                                      ),
                                      const Spacer(),
                                      // Product visual represent
                                      Center(
                                        child: Text(
                                          product.emoji,
                                          style: const TextStyle(fontSize: 32),
                                        ),
                                      ),
                                      const Spacer(),
                                      // Product title
                                      Text(
                                        product.name,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          color: isDark ? Colors.white : AppColors.brown900,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                          height: 1.35,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      // Rating + Price row
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            "₹${product.price.toInt()}",
                                            style: const TextStyle(
                                              color: AppColors.goldDark,
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              const Icon(Icons.star, color: Colors.amber, size: 10),
                                              const SizedBox(width: 2),
                                              Text(
                                                product.rating.toString(),
                                                style: TextStyle(
                                                  color: isDark ? Colors.white70 : AppColors.brown700,
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
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
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
