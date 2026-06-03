import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

// Import all screens
import 'insights_screen.dart';
import 'chat_screen.dart';
import 'sync_screen.dart';
import 'wisdom_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Body based on activeTab
    Widget getBody() {
      switch (state.activeTab) {
        case 'insights':
          return const InsightsScreen();
        case 'chat':
          return const ChatScreen();
        case 'sync':
          return const SyncScreen();
        case 'store':
        case 'wisdom':
          return const WisdomScreen();
        case 'profile':
          return const ProfileScreen();
        default:
          return const InsightsScreen();
      }
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: getBody(),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? Colors.white.withValues(alpha: 0.08) : AppColors.brown100,
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  context: context,
                  tabId: 'insights',
                  icon: LucideIcons.compass,
                  label: 'Insights',
                  isActive: state.activeTab == 'insights',
                  onTap: () => state.setActiveTab('insights'),
                ),
                _buildNavItem(
                  context: context,
                  tabId: 'chat',
                  icon: LucideIcons.message_circle,
                  label: 'Counselor',
                  isActive: state.activeTab == 'chat',
                  onTap: () => state.setActiveTab('chat'),
                ),
                _buildNavItem(
                  context: context,
                  tabId: 'sync',
                  icon: LucideIcons.users,
                  label: 'Sync',
                  isActive: state.activeTab == 'sync',
                  onTap: () => state.setActiveTab('sync'),
                ),
                _buildNavItem(
                  context: context,
                  tabId: 'wisdom',
                  icon: LucideIcons.book_open,
                  label: 'Wisdom',
                  isActive: state.activeTab == 'wisdom' || state.activeTab == 'store',
                  onTap: () => state.setActiveTab('wisdom'),
                ),
                _buildNavItem(
                  context: context,
                  tabId: 'profile',
                  icon: LucideIcons.user,
                  label: 'Profile',
                  isActive: state.activeTab == 'profile',
                  onTap: () => state.setActiveTab('profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required String tabId,
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: isActive 
              ? AppColors.gold.withValues(alpha: 0.08) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedScale(
              scale: isActive ? 1.15 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: Icon(
                icon,
                color: isActive 
                    ? AppColors.gold 
                    : (isDark ? Colors.white54 : AppColors.brown500),
                size: 22,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isActive 
                    ? AppColors.gold 
                    : (isDark ? Colors.white54 : AppColors.brown500),
                fontSize: 10,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
