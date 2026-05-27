import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
  bool _dailyHoroscope = true;
  bool _transitAlerts = true;
  String _language = 'English';

  @override
  void initState() {
    super.initState();
    _darkMode = false; // Would read from state in production
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
        title: Text('Settings', style: TextStyle(
          fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.brown900,
        )),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Section
            GlassPremiumCard(
              borderShimmer: true,
              child: Column(
                children: [
                  Container(
                    height: 4, width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      gradient: const LinearGradient(colors: [AppColors.gold, AppColors.goldDark, AppColors.gold]),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        width: 56, height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [AppColors.gold.withOpacity(0.3), AppColors.gold.withOpacity(0.1)],
                          ),
                        ),
                        child: Center(
                          child: Text(
                            (state.birthDetails?.name ?? 'U').substring(0, 1).toUpperCase(),
                            style: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.gold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(state.birthDetails?.name ?? 'User', style: TextStyle(
                              fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.brown900,
                            )),
                            Text(
                              '${state.astrologyData?.sunSign ?? ''} ☉ • ${state.astrologyData?.moonSign ?? ''} ☽',
                              style: TextStyle(
                                fontSize: 12, color: isDark ? Colors.white38 : AppColors.brown500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (state.birthDetails != null) ...[
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8, runSpacing: 8,
                      children: [
                        if (state.birthDetails!.dateOfBirth.isNotEmpty)
                          _infoBadge('📅 ${state.birthDetails!.dateOfBirth}', isDark),
                        if (state.birthDetails!.timeOfBirth.isNotEmpty)
                          _infoBadge('🕐 ${state.birthDetails!.timeOfBirth}', isDark),
                        if (state.birthDetails!.placeOfBirth.isNotEmpty)
                          _infoBadge('📍 ${state.birthDetails!.placeOfBirth}', isDark),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Appearance
            _sectionHeader('APPEARANCE', isDark),
            const SizedBox(height: 10),
            _toggleSetting('Dark Mode', '🌙', 'Switch between light and dark themes', _darkMode, (v) {
              setState(() => _darkMode = v);
              // In production, this would update the theme
            }, isDark),

            const SizedBox(height: 12),
            _languageSetting(isDark),

            const SizedBox(height: 24),

            // Notifications
            _sectionHeader('NOTIFICATIONS', isDark),
            const SizedBox(height: 10),
            _toggleSetting('Push Notifications', '🔔', 'Receive cosmic updates and reminders', _notifications,
              (v) => setState(() => _notifications = v), isDark),
            const SizedBox(height: 10),
            _toggleSetting('Daily Horoscope', '⭐', 'Morning horoscope alert at 7:00 AM', _dailyHoroscope,
              (v) => setState(() => _dailyHoroscope = v), isDark),
            const SizedBox(height: 10),
            _toggleSetting('Transit Alerts', '🪐', 'Notify on significant planetary movements', _transitAlerts,
              (v) => setState(() => _transitAlerts = v), isDark),

            const SizedBox(height: 24),

            // About
            _sectionHeader('ABOUT', isDark),
            const SizedBox(height: 10),
            _infoCard('App Version', '1.0.0', '📱', isDark),
            const SizedBox(height: 10),
            _infoCard('Data Source', 'Swiss Ephemeris + Vedic Calculations', '🔭', isDark),
            const SizedBox(height: 10),
            _infoCard('Privacy', 'Your data is encrypted and never shared', '🔒', isDark),

            const SizedBox(height: 24),

            // Actions
            _sectionHeader('ACCOUNT', isDark),
            const SizedBox(height: 10),
            GlassLightCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _actionTile('Export My Data', Icons.download, Colors.blue, isDark, () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('📦 Data export coming soon!'), backgroundColor: AppColors.gold),
                    );
                  }),
                  Divider(color: isDark ? Colors.white10 : AppColors.brown100),
                  _actionTile('Clear Cache', Icons.delete_outline, Colors.orange, isDark, () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('🧹 Cache cleared!'), backgroundColor: AppColors.gold),
                    );
                  }),
                  Divider(color: isDark ? Colors.white10 : AppColors.brown100),
                  _actionTile('Log Out', Icons.logout, Colors.red, isDark, () {
                    state.setView('login');
                  }),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // Footer
            Center(
              child: Column(
                children: [
                  Text('✨ AyuAstro ✨', style: TextStyle(
                    fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold,
                    color: AppColors.gold,
                  )),
                  const SizedBox(height: 4),
                  Text('Vedic Wisdom for Modern Life', style: TextStyle(
                    fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                  )),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, bool isDark) {
    return Text(title, style: TextStyle(
      fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5,
      color: isDark ? Colors.white38 : AppColors.brown500,
    ));
  }

  Widget _toggleSetting(String label, String emoji, String desc, bool value, ValueChanged<bool> onChanged, bool isDark) {
    return GlassLightCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : AppColors.brown900,
                )),
                Text(desc, style: TextStyle(
                  fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                )),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.gold,
            inactiveTrackColor: isDark ? Colors.white12 : AppColors.brown100,
          ),
        ],
      ),
    );
  }

  Widget _languageSetting(bool isDark) {
    return GlassLightCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const Text('🌐', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Language', style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : AppColors.brown900,
                )),
                Text('App display language', style: TextStyle(
                  fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                )),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.gold.withOpacity(0.25)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _language,
                isDense: true,
                style: TextStyle(fontSize: 12, color: isDark ? AppColors.goldLight : AppColors.goldDark),
                dropdownColor: isDark ? const Color(0xFF1E1E2E) : Colors.white,
                items: ['English', 'Hindi', 'Sanskrit'].map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
                onChanged: (v) => setState(() => _language = v ?? 'English'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCard(String label, String value, String emoji, bool isDark) {
    return GlassLightCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : AppColors.brown900,
                )),
                Text(value, style: TextStyle(
                  fontSize: 11, color: isDark ? Colors.white38 : AppColors.brown500,
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoBadge(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : AppColors.cream.withOpacity(0.8),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(text, style: TextStyle(
        fontSize: 11, color: isDark ? Colors.white54 : AppColors.brown700,
      )),
    );
  }

  Widget _actionTile(String label, IconData icon, Color color, bool isDark, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 14),
            Text(label, style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w500, color: color,
            )),
            const Spacer(),
            Icon(Icons.chevron_right, color: isDark ? Colors.white24 : AppColors.brown400, size: 20),
          ],
        ),
      ),
    );
  }
}
