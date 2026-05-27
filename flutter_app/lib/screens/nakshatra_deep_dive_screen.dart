import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';
import '../data/nakshatra_data.dart';

class NakshatraDeepDiveScreen extends StatefulWidget {
  const NakshatraDeepDiveScreen({Key? key}) : super(key: key);

  @override
  State<NakshatraDeepDiveScreen> createState() => _NakshatraDeepDiveScreenState();
}

class _NakshatraDeepDiveScreenState extends State<NakshatraDeepDiveScreen> {
  int _selectedIdx = 0;
  int _activeTab = 0; // 0=overview, 1=padas, 2=spiritual

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);
    final nak = allNakshatras[_selectedIdx];

    final elementColors = {
      'Fire': const Color(0xFFEF4444), 'Earth': const Color(0xFF059669),
      'Air': const Color(0xFF3B82F6), 'Water': const Color(0xFF8B5CF6),
    };
    final color = elementColors[nak.element] ?? Colors.grey;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true, pinned: true,
            backgroundColor: (isDark ? AppColors.darkBg : AppColors.cream).withOpacity(0.95),
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: isDark ? Colors.white70 : AppColors.brown700),
              onPressed: () => state.setView('insights'),
            ),
            title: Text('Nakshatra Deep Dive', style: TextStyle(
              fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.brown900,
            )),
          ),

          // Nakshatra Selector
          SliverToBoxAdapter(
            child: SizedBox(
              height: 75,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: allNakshatras.length,
                itemBuilder: (_, i) {
                  final n = allNakshatras[i];
                  final isSelected = i == _selectedIdx;
                  final nColor = elementColors[n.element] ?? Colors.grey;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: GestureDetector(
                      onTap: () => setState(() { _selectedIdx = i; _activeTab = 0; }),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 60, height: 65,
                        decoration: BoxDecoration(
                          color: isSelected ? nColor.withOpacity(0.15) : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected ? Border.all(color: nColor.withOpacity(0.4)) : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('${n.index}', style: TextStyle(
                              fontSize: isSelected ? 18 : 14, fontWeight: FontWeight.bold,
                              color: isSelected ? nColor : (isDark ? Colors.white38 : AppColors.brown400),
                            )),
                            const SizedBox(height: 2),
                            Text(n.name.length > 7 ? '${n.name.substring(0, 6)}…' : n.name, style: TextStyle(
                              fontSize: 8, fontWeight: FontWeight.w600,
                              color: isSelected ? nColor : (isDark ? Colors.white38 : AppColors.brown500),
                            )),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Hero
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [color.withOpacity(0.12), color.withOpacity(0.04)]),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: color.withOpacity(0.2)),
                ),
                child: Column(
                  children: [
                    Text('🌙', style: const TextStyle(fontSize: 40)),
                    const SizedBox(height: 8),
                    Text(nak.name, style: TextStyle(
                      fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.brown900,
                    )),
                    Text('Nakshatra #${nak.index}', style: TextStyle(fontSize: 12, color: color)),
                    const SizedBox(height: 8),
                    Text(nak.degreeRange, style: TextStyle(
                      fontSize: 12, color: isDark ? Colors.white38 : AppColors.brown500,
                    )),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8, runSpacing: 6,
                      children: [
                        _badge('Symbol: ${nak.symbol}', color, isDark),
                        _badge('Deity: ${nak.deity}', color, isDark),
                        _badge(nak.element, color, isDark),
                        _badge('Gana: ${nak.gana}', color, isDark),
                        _badge('Ruler: ${nak.ruler}', color, isDark),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Tabs
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  _tab('Overview', 0, color, isDark),
                  const SizedBox(width: 8),
                  _tab('Padas', 1, color, isDark),
                  const SizedBox(width: 8),
                  _tab('Spiritual', 2, color, isDark),
                ],
              ),
            ),
          ),

          // Tab Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _buildContent(nak, color, isDark),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 60)),
        ],
      ),
    );
  }

  Widget _buildContent(NakshatraData nak, Color color, bool isDark) {
    switch (_activeTab) {
      case 0: return _overviewContent(nak, color, isDark);
      case 1: return _padasContent(nak, color, isDark);
      case 2: return _spiritualContent(nak, color, isDark);
      default: return _overviewContent(nak, color, isDark);
    }
  }

  Widget _overviewContent(NakshatraData nak, Color color, bool isDark) {
    return Column(
      children: [
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('OVERVIEW', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 8),
              Text(nak.overview, style: TextStyle(
                fontSize: 13, height: 1.6, color: isDark ? Colors.white70 : AppColors.brown700,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('EMOTIONAL NEED', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: color,
              )),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Text('💚', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(child: Text(nak.emotionalNeed, style: TextStyle(
                    fontSize: 13, color: isDark ? Colors.white70 : AppColors.brown700,
                  ))),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('CAREER LESSON', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: color,
              )),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Text('💼', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(child: Text(nak.careerLesson, style: TextStyle(
                    fontSize: 13, color: isDark ? Colors.white70 : AppColors.brown700,
                  ))),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _padasContent(NakshatraData nak, Color color, bool isDark) {
    return Column(
      children: List.generate(4, (i) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                color.withOpacity(0.08 + i * 0.02),
                color.withOpacity(0.02),
              ]),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: color.withOpacity(0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: color.withOpacity(0.15),
                      ),
                      child: Center(child: Text('${i + 1}', style: TextStyle(
                        fontWeight: FontWeight.bold, color: color,
                      ))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        i < nak.padaDescriptions.length ? nak.padaDescriptions[i] : 'Pada ${i + 1}',
                        style: TextStyle(
                          fontSize: 13, height: 1.4, color: isDark ? Colors.white70 : AppColors.brown700,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _spiritualContent(NakshatraData nak, Color color, bool isDark) {
    return Column(
      children: [
        // Mantra
        GlassPremiumCard(
          borderShimmer: true,
          child: Column(
            children: [
              const Text('🕉️', style: TextStyle(fontSize: 36)),
              const SizedBox(height: 8),
              Text('MANTRA', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? AppColors.goldLight : AppColors.goldDark,
              )),
              const SizedBox(height: 8),
              Text(nak.mantra, textAlign: TextAlign.center, style: TextStyle(
                fontFamily: 'Playfair Display', fontSize: 18, fontStyle: FontStyle.italic,
                color: isDark ? Colors.white : AppColors.brown900,
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Meditation
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('MEDITATION FOCUS', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: color,
              )),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Text('🧘', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(child: Text(nak.meditationFocus, style: TextStyle(
                    fontSize: 13, height: 1.5, fontStyle: FontStyle.italic,
                    color: isDark ? Colors.white70 : AppColors.brown700,
                  ))),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Deity Info
        GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('RULING DEITY', style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2,
                color: isDark ? Colors.white38 : AppColors.brown500,
              )),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Text('🙏', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  Expanded(child: Text('${nak.deity} — the presiding deity of ${nak.name}. '
                      'Connect with this divine energy through the mantra above.', style: TextStyle(
                    fontSize: 13, height: 1.5, color: isDark ? Colors.white70 : AppColors.brown700,
                  ))),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _tab(String label, int index, Color color, bool isDark) {
    final isActive = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? color.withOpacity(0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isActive ? color.withOpacity(0.4) : (isDark ? Colors.white12 : AppColors.brown100),
            ),
          ),
          child: Center(child: Text(label, style: TextStyle(
            fontSize: 12, fontWeight: FontWeight.w600,
            color: isActive ? color : (isDark ? Colors.white54 : AppColors.brown500),
          ))),
        ),
      ),
    );
  }

  Widget _badge(String text, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
