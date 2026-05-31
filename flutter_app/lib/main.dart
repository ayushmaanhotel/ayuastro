import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state.dart';
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/yoga_dosha_screen.dart';
import 'screens/report_screen.dart';
import 'screens/comprehensive_kundali_screen.dart';
import 'screens/cosmic_calendar_screen.dart';
import 'screens/breathing_meditation_screen.dart';
import 'screens/cosmic_sounds_screen.dart';
import 'screens/gratitude_journal_screen.dart';
import 'screens/zodiac_game_screen.dart';
import 'screens/store_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/zodiac_deep_dive_screen.dart';
import 'screens/nakshatra_deep_dive_screen.dart';
import 'widgets/custom_widgets.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
      ],
      child: Consumer<AppState>(
        builder: (context, state, _) {
          return MaterialApp(
            title: 'AyuAstro',
            debugShowCheckedModeBanner: false,
            // Theme settings mapping AyuAstro's cream and gold aesthetic
            theme: ThemeData(
              useMaterial3: true,
              brightness: Brightness.light,
              primaryColor: AppColors.gold,
              scaffoldBackgroundColor: AppColors.cream,
              colorScheme: const ColorScheme.light(
                primary: AppColors.gold,
                secondary: AppColors.sage,
                surface: Colors.white,
                background: AppColors.cream,
                onPrimary: Colors.white,
                onSecondary: Colors.white,
                onSurface: AppColors.brown900,
                onBackground: AppColors.brown900,
              ),
              dividerTheme: const DividerThemeData(
                color: AppColors.brown100,
                thickness: 1,
              ),
              textTheme: const TextTheme(
                bodyLarge: TextStyle(color: AppColors.brown900, fontFamily: 'Inter'),
                bodyMedium: TextStyle(color: AppColors.brown700, fontFamily: 'Inter'),
                titleLarge: TextStyle(
                  color: AppColors.brown900,
                  fontFamily: 'Playfair Display',
                  fontWeight: FontWeight.bold,
                ),
              ),
              appBarTheme: const AppBarTheme(
                iconTheme: IconThemeData(color: AppColors.brown900),
                titleTextStyle: TextStyle(
                  color: AppColors.brown900,
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            darkTheme: ThemeData(
              useMaterial3: true,
              brightness: Brightness.dark,
              primaryColor: AppColors.gold,
              scaffoldBackgroundColor: AppColors.darkBg,
              colorScheme: const ColorScheme.dark(
                primary: AppColors.gold,
                secondary: AppColors.sage,
                surface: AppColors.darkCard,
                background: AppColors.darkBg,
                onPrimary: Colors.white,
                onSecondary: Colors.white,
                onSurface: Colors.white,
                onBackground: Colors.white,
              ),
              dividerTheme: DividerThemeData(
                color: Colors.white.withOpacity(0.08),
                thickness: 1,
              ),
              textTheme: const TextTheme(
                bodyLarge: TextStyle(color: Colors.white, fontFamily: 'Inter'),
                bodyMedium: TextStyle(color: Colors.white70, fontFamily: 'Inter'),
                titleLarge: TextStyle(
                  color: Colors.white,
                  fontFamily: 'Playfair Display',
                  fontWeight: FontWeight.bold,
                ),
              ),
              appBarTheme: const AppBarTheme(
                iconTheme: IconThemeData(color: Colors.white),
                titleTextStyle: TextStyle(
                  color: Colors.white,
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            themeMode: state.themeMode,
            home: const AppViewSwitcher(),
          );
        },
      ),
    );
  }
}

class AppViewSwitcher extends StatelessWidget {
  const AppViewSwitcher({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    // Root route manager deciding which screen to show
    switch (state.currentView) {
      case 'landing':
        return const LandingScreen();
      case 'login':
        return const LoginScreen();
      case 'onboarding':
        return const OnboardingScreen();
      case 'insights':
        return const DashboardScreen();
      case 'yogaDosha':
        return const YogaDoshaScreen();
      case 'report':
        return const ReportScreen();
      case 'comprehensiveKundali':
        return const ComprehensiveKundaliScreen();
      case 'cosmicCalendar':
        return const CosmicCalendarScreen();
      case 'breathing':
        return const BreathingMeditationScreen();
      case 'cosmicSounds':
        return const CosmicSoundsScreen();
      case 'gratitudeJournal':
        return const GratitudeJournalScreen();
      case 'zodiacGame':
        return const ZodiacGameScreen();
      case 'store':
        return const StoreScreen();
      case 'settings':
        return const SettingsScreen();
      case 'zodiacDeepDive':
        return const ZodiacDeepDiveScreen();
      case 'nakshatraDeepDive':
        return const NakshatraDeepDiveScreen();
      default:
        return const LandingScreen();
    }
  }
}
