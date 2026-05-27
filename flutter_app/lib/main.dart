import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state.dart';
import 'screens/landing_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/yoga_dosha_screen.dart';
import 'screens/report_screen.dart';
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
            themeMode: ThemeMode.system,
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
      case 'onboarding':
        return const OnboardingScreen();
      case 'insights':
        return const DashboardScreen();
      case 'yogaDosha':
        return const YogaDoshaScreen();
      case 'report':
        return const ReportScreen();
      default:
        return const LandingScreen();
    }
  }
}
