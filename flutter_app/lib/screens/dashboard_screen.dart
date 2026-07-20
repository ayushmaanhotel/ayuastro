import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

import 'chat_screen.dart';
import 'insights_screen.dart';
import 'profile_screen.dart';
import 'sync_screen.dart';
import 'wisdom_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  static const List<_TabSpec> _tabs = [
    _TabSpec(
      id: 'insights',
      label: 'Insights',
      icon: LucideIcons.compass,
      screen: InsightsScreen(),
    ),
    _TabSpec(
      id: 'chat',
      label: 'Counselor',
      icon: LucideIcons.message_circle,
      screen: ChatScreen(),
    ),
    _TabSpec(
      id: 'sync',
      label: 'Sync',
      icon: LucideIcons.users,
      screen: SyncScreen(),
    ),
    _TabSpec(
      id: 'wisdom',
      label: 'Wisdom',
      icon: LucideIcons.book_open,
      screen: WisdomScreen(),
    ),
    _TabSpec(
      id: 'profile',
      label: 'Profile',
      icon: LucideIcons.user,
      screen: ProfileScreen(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final currentTab = _tabs.firstWhere(
      (tab) => tab.id == state.activeTab,
      orElse: () => _tabs.first,
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 1080;
        final isDark = Theme.of(context).brightness == Brightness.dark;

        if (isWide) {
          return Scaffold(
            backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
            body: SafeArea(
              child: Row(
                children: [
                  Container(
                    width: 280,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkCard : Colors.white,
                      border: Border(
                        right: BorderSide(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.06)
                              : AppColors.brown100,
                        ),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(24, 20, 24, 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'AyuAstro',
                                style: TextStyle(
                                  color: isDark
                                      ? Colors.white
                                      : AppColors.brown900,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Clean space for guidance, reports, and memory.',
                                style: TextStyle(
                                  color: isDark
                                      ? Colors.white70
                                      : AppColors.brown500,
                                  fontSize: 13,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        Expanded(
                          child: ListView(
                            padding: const EdgeInsets.fromLTRB(12, 16, 12, 16),
                            children: [
                              for (final tab in _tabs)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: _SidebarItem(
                                    icon: tab.icon,
                                    label: tab.label,
                                    selected: tab.id == state.activeTab,
                                    onTap: () => state.setActiveTab(tab.id),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: GlassLightCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Current view',
                                  style: TextStyle(
                                    color: isDark
                                        ? Colors.white70
                                        : AppColors.brown500,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  currentTab.label,
                                  style: TextStyle(
                                    color: isDark
                                        ? Colors.white
                                        : AppColors.brown900,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(child: currentTab.screen),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
          body: currentTab.screen,
          bottomNavigationBar: NavigationBar(
            selectedIndex: _tabs
                .indexWhere((tab) => tab.id == state.activeTab)
                .clamp(0, _tabs.length - 1)
                .toInt(),
            onDestinationSelected: (index) =>
                state.setActiveTab(_tabs[index].id),
            backgroundColor: isDark ? AppColors.darkCard : Colors.white,
            indicatorColor: AppColors.gold.withValues(alpha: 0.12),
            height: 68,
            labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
            destinations: [
              for (final tab in _tabs)
                NavigationDestination(icon: Icon(tab.icon), label: tab.label),
            ],
          ),
        );
      },
    );
  }
}

class _TabSpec {
  final String id;
  final String label;
  final IconData icon;
  final Widget screen;

  const _TabSpec({
    required this.id,
    required this.label,
    required this.icon,
    required this.screen,
  });
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.gold.withValues(alpha: isDark ? 0.18 : 0.10)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? AppColors.gold.withValues(alpha: isDark ? 0.28 : 0.20)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: selected
                  ? AppColors.gold
                  : (isDark ? Colors.white70 : AppColors.brown500),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: selected
                      ? (isDark ? Colors.white : AppColors.brown900)
                      : (isDark ? Colors.white70 : AppColors.brown500),
                  fontSize: 14,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
