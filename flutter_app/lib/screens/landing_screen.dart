import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Header(isDark: isDark, state: state),
              const SizedBox(height: 28),
              _HeroPanel(
                isDark: isDark,
                onReport: () => state.setView(state.userId == null ? 'login' : 'insights'),
                onChat: () => state.setView(state.userId == null ? 'login' : 'insights'),
              ),
              const SizedBox(height: 18),
              _TrustRow(isDark: isDark),
              const SizedBox(height: 18),
              _CapabilityCard(
                icon: Icons.description_outlined,
                title: 'AI report generation',
                body:
                    'DeepSeek reads your chart, numerology, dashas, yogas, doshas, and traits to produce structured insight sections.',
                isDark: isDark,
              ),
              const SizedBox(height: 12),
              _CapabilityCard(
                icon: Icons.chat_bubble_outline,
                title: 'Astrologer chat context',
                body:
                    'Chats send your real cosmic profile to the backend, so answers stay personal and short instead of generic.',
                isDark: isDark,
              ),
              const SizedBox(height: 12),
              _CapabilityCard(
                icon: Icons.public,
                title: 'Swiss Ephemeris math',
                body:
                    'The server calculates Lahiri sidereal placements and whole-sign houses before AI interprets anything.',
                isDark: isDark,
              ),
              const SizedBox(height: 18),
              _FlowCard(isDark: isDark),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final bool isDark;
  final AppState state;

  const _Header({required this.isDark, required this.state});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.24)),
              ),
              child: const Icon(Icons.auto_awesome, color: AppColors.gold, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AyuAstro',
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'Playfair Display',
                  ),
                ),
                const Text(
                  'AI-first Vedic intelligence',
                  style: TextStyle(color: AppColors.brown500, fontSize: 11),
                ),
              ],
            ),
          ],
        ),
        IconButton(
          icon: Icon(
            state.userId == null ? Icons.login : Icons.dashboard_outlined,
            color: AppColors.gold,
          ),
          onPressed: () => state.setView(state.userId == null ? 'login' : 'insights'),
        ),
      ],
    );
  }
}

class _HeroPanel extends StatelessWidget {
  final bool isDark;
  final VoidCallback onReport;
  final VoidCallback onChat;

  const _HeroPanel({
    required this.isDark,
    required this.onReport,
    required this.onChat,
  });

  @override
  Widget build(BuildContext context) {
    return GlassPremiumCard(
      padding: const EdgeInsets.all(22),
      customBorderColor: AppColors.gold.withValues(alpha: 0.28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'DEEPSEEK POWERED REPORTS AND CHATS',
              style: TextStyle(
                color: AppColors.goldDark,
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'Your chart becomes an AI-guided operating system.',
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontSize: 32,
              height: 1.12,
              fontWeight: FontWeight.w900,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Generate a precise cosmic profile, ask direct astrologer questions, and turn deterministic chart math into practical emotional intelligence.',
            style: TextStyle(
              color: isDark ? Colors.white70 : AppColors.brown700,
              fontSize: 14,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 22),
          NeonGoldButton(
            text: 'Generate My Report',
            icon: Icons.arrow_forward,
            onPressed: onReport,
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: onChat,
            icon: const Icon(Icons.smart_toy_outlined, size: 18),
            label: const Text('Ask AI Astrologer'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
              foregroundColor: isDark ? Colors.white : AppColors.brown900,
              side: BorderSide(color: AppColors.gold.withValues(alpha: 0.35)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustRow extends StatelessWidget {
  final bool isDark;

  const _TrustRow({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('AI provider', 'DeepSeek'),
      ('Chart method', 'Lahiri'),
      ('Keys', 'Server-side'),
    ];

    return Row(
      children: items
          .map(
            (item) => Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 3),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.16)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.$1, style: const TextStyle(color: AppColors.brown500, fontSize: 10)),
                    const SizedBox(height: 4),
                    Text(
                      item.$2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: isDark ? Colors.white : AppColors.brown900,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _CapabilityCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  final bool isDark;

  const _CapabilityCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GlassLightCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.gold, size: 19),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  body,
                  style: TextStyle(
                    color: isDark ? Colors.white60 : AppColors.brown700,
                    fontSize: 12,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FlowCard extends StatelessWidget {
  final bool isDark;

  const _FlowCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final steps = [
      ('1', 'Birth details', 'Exact time and location create the chart input.'),
      ('2', 'Deterministic math', 'Swiss Ephemeris produces placements before AI runs.'),
      ('3', 'AI insight', 'DeepSeek generates reports and conversational guidance.'),
    ];

    return GlassPremiumCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'How the intelligence flows',
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 12),
          ...steps.map(
            (step) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppColors.brown900,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(step.$1, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step.$2,
                          style: TextStyle(
                            color: isDark ? Colors.white : AppColors.brown900,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          step.$3,
                          style: const TextStyle(color: AppColors.brown500, fontSize: 12, height: 1.35),
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
    );
  }
}
