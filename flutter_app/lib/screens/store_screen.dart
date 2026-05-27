import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../models/models.dart';

class StoreScreen extends StatefulWidget {
  const StoreScreen({Key? key}) : super(key: key);

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> {
  String _activeCategory = 'all';
  int _selectedItemIdx = -1;

  static const List<StoreItem> _items = [
    // Pujas
    StoreItem(id: 'p1', name: 'Navagraha Shanti Puja', category: 'puja', emoji: '🪔',
      description: 'Pacify all 9 planetary energies with this powerful Vedic ritual performed by experienced pandits.',
      benefits: ['Balances all planetary influences', 'Removes obstacles', 'Enhances overall fortune'],
      rulingPlanet: 'All 9 Grahas', price: '₹2,999'),
    StoreItem(id: 'p2', name: 'Maha Mrityunjaya Jaap', category: 'puja', emoji: '🕉️',
      description: 'The great death-conquering mantra recited 1,25,000 times for health, longevity, and protection.',
      benefits: ['Shields from accidents', 'Promotes healing', 'Grants mental peace'],
      rulingPlanet: 'Moon', price: '₹3,499'),
    StoreItem(id: 'p3', name: 'Lakshmi Narayan Puja', category: 'puja', emoji: '🙏',
      description: 'Invoke the blessings of Goddess Lakshmi and Lord Vishnu for prosperity and harmony.',
      benefits: ['Financial stability', 'Marital harmony', 'Divine blessings'],
      rulingPlanet: 'Venus', price: '₹2,499'),
    StoreItem(id: 'p4', name: 'Kaal Sarp Dosha Nivaran', category: 'puja', emoji: '🐍',
      description: 'Specialized ritual to mitigate the effects of Kaal Sarp Dosha in your birth chart.',
      benefits: ['Removes life obstacles', 'Career growth', 'Peace of mind'],
      rulingPlanet: 'Rahu-Ketu', price: '₹4,999'),
    // Gemstones
    StoreItem(id: 'g1', name: 'Natural Yellow Sapphire', category: 'gemstone', emoji: '💎',
      description: 'Premium certified Pukhraj stone to strengthen Jupiter and attract wisdom, wealth, and good fortune.',
      benefits: ['Enhances wisdom', 'Financial growth', 'Academic success'],
      rulingPlanet: 'Jupiter', price: '₹8,999'),
    StoreItem(id: 'g2', name: 'Blue Sapphire (Neelam)', category: 'gemstone', emoji: '💙',
      description: 'Powerful Saturn gemstone — instant results. Must be tested before wearing. Lab-certified quality.',
      benefits: ['Career acceleration', 'Discipline and focus', 'Saturn appeasement'],
      rulingPlanet: 'Saturn', price: '₹12,999'),
    StoreItem(id: 'g3', name: 'Natural Ruby (Manik)', category: 'gemstone', emoji: '❤️',
      description: 'Strengthen your Sun with this premium certified ruby. Enhances leadership and vitality.',
      benefits: ['Leadership power', 'Fame and recognition', 'Health improvement'],
      rulingPlanet: 'Sun', price: '₹7,999'),
    StoreItem(id: 'g4', name: 'Emerald (Panna)', category: 'gemstone', emoji: '💚',
      description: 'Mercury stone for intelligence, communication, and business acumen. Lab-certified natural emerald.',
      benefits: ['Business success', 'Better communication', 'Mental clarity'],
      rulingPlanet: 'Mercury', price: '₹9,499'),
    // Rudrakshas
    StoreItem(id: 'r1', name: '5 Mukhi Rudraksha', category: 'rudraksha', emoji: '📿',
      description: 'The most common and powerful Rudraksha. Represents Lord Shiva and brings peace, health, and spiritual growth.',
      benefits: ['General well-being', 'Blood pressure control', 'Stress relief'],
      rulingPlanet: 'Jupiter', price: '₹499'),
    StoreItem(id: 'r2', name: '1 Mukhi Rudraksha', category: 'rudraksha', emoji: '🔱',
      description: 'The rarest and most sacred. Represents Lord Shiva himself. Grants enlightenment and supreme consciousness.',
      benefits: ['Spiritual enlightenment', 'Supreme consciousness', 'Material detachment'],
      rulingPlanet: 'Sun', price: '₹21,999'),
    StoreItem(id: 'r3', name: 'Gauri Shankar Rudraksha', category: 'rudraksha', emoji: '🕉️',
      description: 'Two naturally joined beads representing Shiva-Parvati unity. Perfect for marital harmony.',
      benefits: ['Marital harmony', 'Love and devotion', 'Family peace'],
      rulingPlanet: 'Moon', price: '₹3,999'),
  ];

  List<StoreItem> get _filteredItems {
    if (_activeCategory == 'all') return _items;
    return _items.where((i) => i.category == _activeCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent, elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
          onPressed: () => state.setView('insights'),
        ),
        title: Text('Vedic Store', style: TextStyle(
          fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.brown900,
        )),
      ),
      body: Column(
        children: [
          // Category Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _categoryTab('All', 'all', '✨', isDark),
                const SizedBox(width: 8),
                _categoryTab('Pujas', 'puja', '🪔', isDark),
                const SizedBox(width: 8),
                _categoryTab('Gems', 'gemstone', '💎', isDark),
                const SizedBox(width: 8),
                _categoryTab('Rudraksha', 'rudraksha', '📿', isDark),
              ],
            ),
          ),

          // Items Grid
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _filteredItems.length,
              itemBuilder: (_, i) {
                final item = _filteredItems[i];
                final isOpen = i == _selectedItemIdx;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedItemIdx = isOpen ? -1 : i),
                    child: GlassPremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(item.emoji, style: const TextStyle(fontSize: 28)),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name, style: TextStyle(
                                      fontFamily: 'Playfair Display', fontSize: 15, fontWeight: FontWeight.bold,
                                      color: isDark ? Colors.white : AppColors.brown900,
                                    )),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.gold.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(item.rulingPlanet, style: TextStyle(
                                            fontSize: 9, color: AppColors.goldDark,
                                          )),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(item.price, style: TextStyle(
                                          fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.gold,
                                        )),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Icon(isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                color: isDark ? Colors.white38 : AppColors.brown400),
                            ],
                          ),

                          if (isOpen) ...[
                            const SizedBox(height: 12),
                            Divider(color: isDark ? Colors.white10 : AppColors.brown100),
                            const SizedBox(height: 12),
                            Text(item.description, style: TextStyle(
                              fontSize: 13, height: 1.5, color: isDark ? Colors.white54 : AppColors.brown700,
                            )),
                            const SizedBox(height: 12),
                            Text('BENEFITS', style: TextStyle(
                              fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                              color: isDark ? Colors.white38 : AppColors.brown500,
                            )),
                            const SizedBox(height: 6),
                            ...item.benefits.map((b) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                children: [
                                  Text('✦ ', style: TextStyle(color: AppColors.gold, fontSize: 12)),
                                  Expanded(child: Text(b, style: TextStyle(
                                    fontSize: 12, color: isDark ? Colors.white54 : AppColors.brown700,
                                  ))),
                                ],
                              ),
                            )),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text('✨ ${item.name} — Coming soon!'),
                                    backgroundColor: AppColors.gold,
                                  ));
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.gold,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                child: const Text('Enquire Now', style: TextStyle(fontWeight: FontWeight.w600)),
                              ),
                            ),
                          ],
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
    );
  }

  Widget _categoryTab(String label, String key, String emoji, bool isDark) {
    final isActive = _activeCategory == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() { _activeCategory = key; _selectedItemIdx = -1; }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppColors.gold.withOpacity(0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isActive ? AppColors.gold.withOpacity(0.4) : (isDark ? Colors.white12 : AppColors.brown100),
            ),
          ),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 18)),
              const SizedBox(height: 2),
              Text(label, style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w600,
                color: isActive ? AppColors.gold : (isDark ? Colors.white54 : AppColors.brown500),
              )),
            ],
          ),
        ),
      ),
    );
  }
}
