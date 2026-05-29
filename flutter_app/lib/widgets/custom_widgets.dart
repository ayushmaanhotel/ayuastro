import 'dart:math';
import 'package:flutter/material.dart';

// Theme Colors Constant
class AppColors {
  static const Color cream = Color(0xFFF4EFE6);
  static const Color creamDark = Color(0xFFF5E6D0);
  static const Color brown900 = Color(0xFF3E2723);
  static const Color brown800 = Color(0xFF4E342E);
  static const Color brown700 = Color(0xFF5D4037);
  static const Color brown500 = Color(0xFF8D6E63);
  static const Color brown400 = Color(0xFFA1887F);
  static const Color brown100 = Color(0xFFEFEBE9);
  
  static const Color gold = Color(0xFFC4973B);
  static const Color goldDark = Color(0xFF8B6914);
  static const Color goldLight = Color(0xFFF0C14B);
  
  static const Color sage = Color(0xFF4A7C59);
  static const Color sageLight = Color(0xFFE8F0E9);

  // Dark mode mappings
  static const Color darkBg = Color(0xFF1C1310);
  static const Color darkCard = Color(0xFF281C18);
}

// 1. Premium Glassmorphism Card
class GlassPremiumCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final bool borderShimmer;
  final Color? customBorderColor;

  const GlassPremiumCard({
    Key? key,
    required this.child,
    this.padding,
    this.width,
    this.height,
    this.borderShimmer = false,
    this.customBorderColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      width: width,
      height: height,
      padding: padding ?? const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark 
            ? AppColors.darkCard.withOpacity(0.85) 
            : Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: customBorderColor ?? (isDark 
              ? AppColors.gold.withOpacity(0.25) 
              : AppColors.gold.withOpacity(0.15)),
          width: borderShimmer ? 1.8 : 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: (isDark ? Colors.black : AppColors.brown900).withOpacity(isDark ? 0.4 : 0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
          if (borderShimmer)
            BoxShadow(
              color: AppColors.gold.withOpacity(0.15),
              blurRadius: 10,
              spreadRadius: 1,
            ),
        ],
      ),
      child: Stack(
        children: [
          child,
          const Positioned(
            top: 4,
            left: 4,
            child: Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 8)),
          ),
          const Positioned(
            top: 4,
            right: 4,
            child: Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 8)),
          ),
          const Positioned(
            bottom: 4,
            left: 4,
            child: Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 8)),
          ),
          const Positioned(
            bottom: 4,
            right: 4,
            child: Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 8)),
          ),
        ],
      ),
    );
  }
}

// 2. Light Glass Card
class GlassLightCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final double borderRadius;
  final VoidCallback? onTap;

  const GlassLightCard({
    Key? key,
    required this.child,
    this.padding,
    this.width,
    this.height,
    this.borderRadius = 12,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Widget content = Container(
      width: width,
      height: height,
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark 
            ? Colors.white.withOpacity(0.04) 
            : AppColors.cream.withOpacity(0.6),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: isDark 
              ? Colors.white.withOpacity(0.08) 
              : AppColors.brown100,
          width: 1,
        ),
      ),
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: content,
      );
    }
    return content;
  }
}

// 3. Neon Gold Button with animated press scale
class NeonGoldButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final IconData? icon;

  const NeonGoldButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
  }) : super(key: key);

  @override
  _NeonGoldButtonState createState() => _NeonGoldButtonState();
}

class _NeonGoldButtonState extends State<NeonGoldButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        if (!widget.isLoading) widget.onPressed();
      },
      onTapCancel: () => _controller.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        ),
        child: Container(
          height: 52,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.gold, AppColors.goldDark],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withOpacity(0.35),
                blurRadius: 16,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: widget.isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2.5,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      Icon(widget.icon, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

// 4. Custom Section Divider
class SectionDivider extends StatelessWidget {
  final String symbol;
  const SectionDivider({Key? key, this.symbol = '✦'}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  (isDark ? AppColors.gold.withOpacity(0.5) : AppColors.gold.withOpacity(0.3)),
                ],
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            symbol,
            style: const TextStyle(
              color: AppColors.gold,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  (isDark ? AppColors.gold.withOpacity(0.5) : AppColors.gold.withOpacity(0.3)),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// 5. Star-field background simulation widget
class StarFieldBackground extends StatefulWidget {
  final Widget child;
  const StarFieldBackground({Key? key, required this.child}) : super(key: key);

  @override
  _StarFieldBackgroundState createState() => _StarFieldBackgroundState();
}

class _StarFieldBackgroundState extends State<StarFieldBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<Offset> _stars = [];
  final List<double> _starsFlickerOffset = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    // Generate 35 static star coordinates
    for (int i = 0; i < 35; i++) {
      _stars.add(Offset(_random.nextDouble(), _random.nextDouble()));
      _starsFlickerOffset.add(_random.nextDouble() * pi);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Stack(
      children: [
        // Star Drawing Layer
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => CustomPaint(
              painter: StarPainter(
                stars: _stars,
                flickerOffset: _starsFlickerOffset,
                animationValue: _controller.value,
                isDark: isDark,
              ),
            ),
          ),
        ),
        widget.child,
      ],
    );
  }
}

class StarPainter extends CustomPainter {
  final List<Offset> stars;
  final List<double> flickerOffset;
  final double animationValue;
  final bool isDark;

  StarPainter({
    required this.stars,
    required this.flickerOffset,
    required this.animationValue,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    final starColor = AppColors.gold.withOpacity(isDark ? 0.35 : 0.2);

    for (int i = 0; i < stars.length; i++) {
      // Calculate flicker opacity based on sine wave
      final double flickerValue = sin(animationValue * 2 * pi + flickerOffset[i]);
      final double opacity = max(0.05, (flickerValue + 1.0) / 2.0 * (isDark ? 0.7 : 0.4));
      
      paint.color = starColor.withOpacity(opacity);
      
      final dx = stars[i].dx * size.width;
      final dy = stars[i].dy * size.height;
      final radius = (i % 3 == 0) ? 1.5 : 1.0;
      
      canvas.drawCircle(Offset(dx, dy), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// 6. Cosmic loading spinner spinner mandala
class CosmicLoader extends StatefulWidget {
  final String message;
  const CosmicLoader({Key? key, required this.message}) : super(key: key);

  @override
  _CosmicLoaderState createState() => _CosmicLoaderState();
}

class _CosmicLoaderState extends State<CosmicLoader> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        RotationTransition(
          turns: _controller,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer golden mandala decoration
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.gold.withOpacity(isDark ? 0.35 : 0.2),
                    width: 1.5,
                  ),
                ),
              ),
              // Sparkling rotating nodes
              ...List.generate(4, (index) {
                final angle = (index * pi / 2);
                return Transform.translate(
                  offset: Offset(45 * cos(angle), 45 * sin(angle)),
                  child: const Text("✦", style: TextStyle(color: AppColors.gold, fontSize: 12)),
                );
              }),
              // Inner core celestial symbol
              const Text(
                "🔮",
                style: TextStyle(fontSize: 32),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          child: Text(
            widget.message,
            key: ValueKey<String>(widget.message),
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }
}
