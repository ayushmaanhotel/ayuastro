import 'dart:math';
import 'package:flutter/material.dart';
import '../models/models.dart';
import 'custom_widgets.dart';

class KundaliChart extends StatelessWidget {
  final Map<String, PlanetaryPositionInfo> planetaryPositions;
  final String ascendant;
  final double? ascendantDegree;
  final String sunSign;
  final String moonSign;
  final BirthDetails? birthDetails;
  final String? nakshatra;
  final bool compact;

  const KundaliChart({
    Key? key,
    required this.planetaryPositions,
    required this.ascendant,
    this.ascendantDegree,
    required this.sunSign,
    required this.moonSign,
    this.birthDetails,
    this.nakshatra,
    this.compact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return CustomPaint(
      painter: _KundaliChartPainter(
        planetaryPositions: planetaryPositions,
        ascendant: ascendant,
        ascendantDegree: ascendantDegree,
        sunSign: sunSign,
        moonSign: moonSign,
        birthDetails: birthDetails,
        nakshatra: nakshatra,
        compact: compact,
        isDark: isDark,
      ),
    );
  }
}

class _KundaliChartPreset {
  final double planetFont;
  final double degreeFont;
  final double dotR;
  final double dotOffsetX;
  final double nameOffsetX;
  final double degOffsetX;
  final double retroOffsetX;
  final double lineGap;
  final double zodiacFont;
  final double houseNumFont;
  final double badgeR;

  const _KundaliChartPreset({
    required this.planetFont,
    required this.degreeFont,
    required this.dotR,
    required this.dotOffsetX,
    required this.nameOffsetX,
    required this.degOffsetX,
    required this.retroOffsetX,
    required this.lineGap,
    required this.zodiacFont,
    required this.houseNumFont,
    required this.badgeR,
  });
}

class _KundaliChartPainter extends CustomPainter {
  final Map<String, PlanetaryPositionInfo> planetaryPositions;
  final String ascendant;
  final double? ascendantDegree;
  final String sunSign;
  final String moonSign;
  final BirthDetails? birthDetails;
  final String? nakshatra;
  final bool compact;
  final bool isDark;

  static const List<String> zodiacOrder = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  static const Map<String, String> zodiacSymbols = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍',
    'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
  };

  static const Map<String, String> zodiacAbbr = {
    'Aries': 'Ari', 'Taurus': 'Tau', 'Gemini': 'Gem', 'Cancer': 'Can', 'Leo': 'Leo', 'Virgo': 'Vir',
    'Libra': 'Lib', 'Scorpio': 'Sco', 'Sagittarius': 'Sag', 'Capricorn': 'Cap', 'Aquarius': 'Aqu', 'Pisces': 'Pis',
  };

  static const Map<String, Color> planetColors = {
    'Sun': Color(0xFFEAB308),
    'Moon': Color(0xFF94A3B8),
    'Mars': Color(0xFFDC2626),
    'Mercury': Color(0xFF22C55E),
    'Jupiter': Color(0xFFF59E0B),
    'Venus': Color(0xFFEC4899),
    'Saturn': Color(0xFF5C6BC0),
    'Rahu': Color(0xFF7C3AED),
    'Ketu': Color(0xFF6B7280),
  };

  static const Map<int, String> houseSizes = {
    1: 'wide', 2: 'wide', 3: 'narrow', 4: 'narrow',
    5: 'wide', 6: 'wide', 7: 'wide', 8: 'narrow',
    9: 'narrow', 10: 'wide', 11: 'medium', 12: 'medium',
  };

  static const Map<String, _KundaliChartPreset> presets = {
    'wide': _KundaliChartPreset(
      planetFont: 11, degreeFont: 9, dotR: 3.5,
      dotOffsetX: -48, nameOffsetX: -40, degOffsetX: 14, retroOffsetX: 46,
      lineGap: 17, zodiacFont: 13, houseNumFont: 8.5, badgeR: 8,
    ),
    'medium': _KundaliChartPreset(
      planetFont: 10.5, degreeFont: 8.5, dotR: 3,
      dotOffsetX: -40, nameOffsetX: -32, degOffsetX: 12, retroOffsetX: 40,
      lineGap: 16, zodiacFont: 12, houseNumFont: 8, badgeR: 7,
    ),
    'narrow': _KundaliChartPreset(
      planetFont: 9.5, degreeFont: 7.5, dotR: 2.5,
      dotOffsetX: -30, nameOffsetX: -24, degOffsetX: 8, retroOffsetX: 32,
      lineGap: 15, zodiacFont: 11, houseNumFont: 7.5, badgeR: 6.5,
    ),
    'compact': _KundaliChartPreset(
      planetFont: 8.5, degreeFont: 7, dotR: 2,
      dotOffsetX: -24, nameOffsetX: -18, degOffsetX: 6, retroOffsetX: 26,
      lineGap: 12, zodiacFont: 10, houseNumFont: 7, badgeR: 5.5,
    ),
  };

  _KundaliChartPainter({
    required this.planetaryPositions,
    required this.ascendant,
    this.ascendantDegree,
    required this.sunSign,
    required this.moonSign,
    this.birthDetails,
    this.nakshatra,
    required this.compact,
    required this.isDark,
  });

  // Coordinates helpers
  static const double fOx = 25;
  static const double fOy = 170;
  static const double fScale = 400 / 280;

  Offset _fGrid(double x, double y) {
    return Offset(
      (x * fScale).roundToDouble() + fOx,
      (y * fScale).roundToDouble() + fOy,
    );
  }

  static const double cOx = 40;
  static const double cOy = 30;
  static const double cScale = 340 / 280;

  Offset _cGrid(double x, double y) {
    return Offset(
      (x * cScale).roundToDouble() + cOx,
      (y * cScale).roundToDouble() + cOy,
    );
  }

  String _formatDegree(double degree) {
    final d = degree.floor();
    final m = ((degree - d) * 60).floor();
    return "$d°${m.toString().padLeft(2, '0')}'";
  }

  String _formatBirthDate(String dob) {
    try {
      final parsed = DateTime.tryParse(dob);
      if (parsed != null) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return "${parsed.day} ${months[parsed.month - 1]} ${parsed.year}";
      }
    } catch (_) {}
    return dob;
  }

  Offset _getCentroid(List<Offset> points) {
    double cx = 0;
    double cy = 0;
    for (final p in points) {
      cx += p.dx;
      cy += p.dy;
    }
    return Offset((cx / points.length).roundToDouble(), (cy / points.length).roundToDouble());
  }

  void _drawText(
    Canvas canvas,
    String text,
    Offset offset, {
    required double fontSize,
    required Color color,
    FontWeight fontWeight = FontWeight.normal,
    TextAlign textAlign = TextAlign.center,
    bool isSerif = false,
    double opacity = 1.0,
  }) {
    final textSpan = TextSpan(
      text: text,
      style: TextStyle(
        fontSize: fontSize,
        color: color.withOpacity(opacity),
        fontWeight: fontWeight,
        fontFamily: isSerif ? 'Playfair Display' : 'Inter',
      ),
    );
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
      textAlign: textAlign,
    )..layout();

    double x = offset.dx;
    if (textAlign == TextAlign.center) {
      x -= textPainter.width / 2;
    } else if (textAlign == TextAlign.right) {
      x -= textPainter.width;
    }

    final y = offset.dy - textPainter.height / 2;
    textPainter.paint(canvas, Offset(x, y));
  }

  void _drawTextRich(
    Canvas canvas,
    TextSpan textSpan,
    Offset offset, {
    TextAlign textAlign = TextAlign.left,
  }) {
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
      textAlign: textAlign,
    )..layout();

    double x = offset.dx;
    if (textAlign == TextAlign.center) {
      x -= textPainter.width / 2;
    } else if (textAlign == TextAlign.right) {
      x -= textPainter.width;
    }

    final y = offset.dy - textPainter.height / 2;
    textPainter.paint(canvas, Offset(x, y));
  }

  void _drawGridLines(Canvas canvas, Offset Function(double, double) gridFn) {
    final linePaint = Paint()
      ..color = isDark ? AppColors.gold.withOpacity(0.3) : AppColors.brown700.withOpacity(0.6)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    final lines = [
      // Top side
      [gridFn(70, 10), gridFn(70, 70)],
      [gridFn(150, 10), gridFn(150, 70)],
      [gridFn(230, 10), gridFn(230, 70)],
      // Right side
      [gridFn(290, 70), gridFn(230, 70)],
      [gridFn(290, 150), gridFn(230, 150)],
      [gridFn(290, 230), gridFn(230, 230)],
      // Bottom side
      [gridFn(70, 230), gridFn(70, 290)],
      [gridFn(150, 230), gridFn(150, 290)],
      [gridFn(230, 230), gridFn(230, 290)],
      // Left side
      [gridFn(10, 70), gridFn(70, 70)],
      [gridFn(10, 150), gridFn(70, 150)],
      [gridFn(10, 230), gridFn(70, 230)],
      // Center cross
      [gridFn(70, 150), gridFn(230, 150)],
      [gridFn(150, 70), gridFn(150, 230)],
    ];

    for (final line in lines) {
      canvas.drawLine(line[0], line[1], linePaint);
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    // Determine canvas target dimensions
    final double targetW = compact ? 420.0 : 460.0;
    final double targetH = compact ? 420.0 : 710.0;

    // Scale dynamically
    canvas.save();
    canvas.scale(size.width / targetW, size.height / targetH);

    // Bounding Rects
    final Rect canvasRect = Rect.fromLTWH(0, 0, targetW, targetH);

    // Background color
    final bgPaint = Paint()..color = isDark ? AppColors.darkBg : AppColors.cream;
    canvas.drawRect(canvasRect, bgPaint);

    // Group planets by house
    final Map<int, List<Map<String, dynamic>>> planetsByHouse = {};
    for (final entry in planetaryPositions.entries) {
      final name = entry.key;
      final pos = entry.value;
      if (!planetsByHouse.containsKey(pos.house)) {
        planetsByHouse[pos.house] = [];
      }
      planetsByHouse[pos.house]!.add({
        'name': name,
        'degree': pos.degree,
        'retrograde': pos.retrograde,
      });
    }

    // Map zodiac signs to houses
    final Map<int, String> signByHouse = {};
    for (final entry in planetaryPositions.entries) {
      if (!signByHouse.containsKey(entry.value.house)) {
        signByHouse[entry.value.house] = entry.value.sign;
      }
    }

    final ascIdx = zodiacOrder.indexOf(ascendant);
    if (ascIdx >= 0) {
      for (int h = 1; h <= 12; h++) {
        if (!signByHouse.containsKey(h)) {
          signByHouse[h] = zodiacOrder[(ascIdx + h - 1) % 12];
        }
      }
    }

    if (compact) {
      // ══════════════════════════════════════════════════════════════════════════
      //  COMPACT MODE
      // ══════════════════════════════════════════════════════════════════════════
      final Offset cTop = _cGrid(150, 10);
      final Offset cRight = _cGrid(290, 150);
      final Offset cBottom = _cGrid(150, 290);
      final Offset cLeft = _cGrid(10, 150);
      final Offset cCenter = _cGrid(150, 150);

      final Map<int, List<Offset>> cHousePolygons = {
        1:  [_cGrid(70, 10),  _cGrid(230, 10), _cGrid(150, 70)],
        2:  [_cGrid(230, 10), _cGrid(290, 70), _cGrid(230, 70), _cGrid(150, 70)],
        3:  [_cGrid(290, 70), _cGrid(290, 150), _cGrid(230, 150), _cGrid(230, 70)],
        4:  [_cGrid(290, 150), _cGrid(290, 230), _cGrid(230, 230), _cGrid(230, 150)],
        5:  [_cGrid(290, 230), _cGrid(230, 290), _cGrid(150, 230), _cGrid(230, 230)],
        6:  [_cGrid(230, 290), _cGrid(70, 290), _cGrid(150, 230)],
        7:  [_cGrid(70, 290), _cGrid(10, 230), _cGrid(70, 230), _cGrid(150, 230)],
        8:  [_cGrid(10, 230), _cGrid(10, 150), _cGrid(70, 150), _cGrid(70, 230)],
        9:  [_cGrid(10, 150), _cGrid(10, 70), _cGrid(70, 70), _cGrid(70, 150)],
        10: [_cGrid(10, 70),  _cGrid(70, 10),  _cGrid(150, 70), _cGrid(70, 70)],
        11: [_cGrid(70, 70),  _cGrid(150, 70), _cGrid(150, 150), _cGrid(70, 150)],
        12: [_cGrid(150, 70), _cGrid(230, 70), _cGrid(230, 150), _cGrid(150, 150)],
      };

      // Diamond background
      final diamondPath = Path()
        ..moveTo(cTop.dx, cTop.dy)
        ..lineTo(cRight.dx, cRight.dy)
        ..lineTo(cBottom.dx, cBottom.dy)
        ..lineTo(cLeft.dx, cLeft.dy)
        ..close();

      final chartBgPaint = Paint()
        ..shader = RadialGradient(
          colors: isDark
              ? [const Color(0xFF2D2320), const Color(0xFF1A1412)]
              : [const Color(0xFFFFFDF7), const Color(0xFFF5F0E6)],
        ).createShader(Rect.fromLTRB(cLeft.dx, cTop.dy, cRight.dx, cBottom.dy));

      canvas.drawPath(diamondPath, chartBgPaint);

      // Diamond border
      final borderPaint = Paint()
        ..color = isDark ? AppColors.gold.withOpacity(0.5) : AppColors.brown700
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke;
      canvas.drawPath(diamondPath, borderPaint);

      // Grid lines
      _drawGridLines(canvas, _cGrid);

      // 1st house gold highlight
      final ascGlowPaint = Paint()
        ..shader = LinearGradient(
          colors: [
            AppColors.gold.withOpacity(0.18),
            AppColors.gold.withOpacity(0.04),
          ],
        ).createShader(Rect.fromLTRB(cLeft.dx, cTop.dy, cRight.dx, cCenter.dy));
      final ascPath = Path();
      ascPath.moveTo(cHousePolygons[1]![0].dx, cHousePolygons[1]![0].dy);
      for (int i = 1; i < cHousePolygons[1]!.length; i++) {
        ascPath.lineTo(cHousePolygons[1]![i].dx, cHousePolygons[1]![i].dy);
      }
      ascPath.close();
      canvas.drawPath(ascPath, ascGlowPaint);

      // Draw houses
      for (int h = 1; h <= 12; h++) {
        final polygon = cHousePolygons[h]!;
        final sign = signByHouse[h] ?? 'Aries';
        final planets = planetsByHouse[h] ?? [];
        _paintHouse(canvas, h, polygon, sign, planets, false);
      }

      // Ascendant label
      _drawText(
        canvas,
        "ASC",
        Offset(cTop.dx, cTop.dy - 8),
        fontSize: 8,
        color: AppColors.gold,
        fontWeight: FontWeight.bold,
      );

      // Corners & Center dots
      final dotPaint = Paint()..color = isDark ? AppColors.gold.withOpacity(0.4) : AppColors.brown700.withOpacity(0.4);
      for (final pt in [cTop, cRight, cBottom, cLeft]) {
        canvas.drawCircle(pt, 3, dotPaint);
      }
      canvas.drawCircle(cCenter, 2, Paint()..color = AppColors.gold.withOpacity(0.3));

    } else {
      // ══════════════════════════════════════════════════════════════════════════
      //  FULL MODE
      // ══════════════════════════════════════════════════════════════════════════
      final Offset fTop = _fGrid(150, 10);
      final Offset fRight = _fGrid(290, 150);
      final Offset fBottom = _fGrid(150, 290);
      final Offset fLeft = _fGrid(10, 150);
      final Offset fCenter = _fGrid(150, 150);

      final Map<int, List<Offset>> fHousePolygons = {
        1:  [_fGrid(70, 10),  _fGrid(230, 10), _fGrid(150, 70)],
        2:  [_fGrid(230, 10), _fGrid(290, 70), _fGrid(230, 70), _fGrid(150, 70)],
        3:  [_fGrid(290, 70), _fGrid(290, 150), _fGrid(230, 150), _fGrid(230, 70)],
        4:  [_fGrid(290, 150), _fGrid(290, 230), _fGrid(230, 230), _fGrid(230, 150)],
        5:  [_fGrid(290, 230), _fGrid(230, 290), _fGrid(150, 230), _fGrid(230, 230)],
        6:  [_fGrid(230, 290), _fGrid(70, 290), _fGrid(150, 230)],
        7:  [_fGrid(70, 290), _fGrid(10, 230), _fGrid(70, 230), _fGrid(150, 230)],
        8:  [_fGrid(10, 230), _fGrid(10, 150), _fGrid(70, 150), _fGrid(70, 230)],
        9:  [_fGrid(10, 150), _fGrid(10, 70), _fGrid(70, 70), _fGrid(70, 150)],
        10: [_fGrid(10, 70),  _fGrid(70, 10),  _fGrid(150, 70), _fGrid(70, 70)],
        11: [_fGrid(70, 70),  _fGrid(150, 70), _fGrid(150, 150), _fGrid(70, 150)],
        12: [_fGrid(150, 70), _fGrid(230, 70), _fGrid(230, 150), _fGrid(150, 150)],
      };

      // ── BIRTH DETAILS HEADER ──
      final headerRect = Rect.fromLTWH(10, 8, 440, 150);
      final headerBgPaint = Paint()
        ..shader = LinearGradient(
          colors: [
            AppColors.gold.withOpacity(0.06),
            AppColors.brown500.withOpacity(0.03),
          ],
        ).createShader(headerRect);
      canvas.drawRRect(RRect.fromRectAndRadius(headerRect, const Radius.circular(14)), headerBgPaint);

      final headerBorderPaint = Paint()
        ..color = AppColors.gold.withOpacity(0.3)
        ..strokeWidth = 0.8
        ..style = PaintingStyle.stroke;
      canvas.drawRRect(RRect.fromRectAndRadius(headerRect, const Radius.circular(14)), headerBorderPaint);

      // Accent gold line top
      final headerAccentRect = Rect.fromLTWH(10, 8, 440, 3);
      canvas.drawRRect(RRect.fromRectAndRadius(headerAccentRect, const Radius.circular(1.5)), Paint()..color = AppColors.gold.withOpacity(0.4));

      // Header Title
      _drawText(
        canvas,
        "Birth Chart (Kundali)",
        const Offset(230, 34),
        fontSize: 16,
        color: isDark ? Colors.white : AppColors.brown700,
        fontWeight: FontWeight.bold,
        isSerif: true,
      );

      // Name Detail
      if (birthDetails?.name != null && birthDetails!.name.isNotEmpty) {
        _drawTextRich(
          canvas,
          TextSpan(
            children: [
              const TextSpan(text: "Name ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brown500)),
              TextSpan(text: birthDetails!.name, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)),
            ],
          ),
          const Offset(30, 58),
        );
      }

      // DOB & TOB Detail
      if (birthDetails != null) {
        final dobStr = birthDetails!.dateOfBirth.isNotEmpty ? _formatBirthDate(birthDetails!.dateOfBirth) : '';
        final tobStr = birthDetails!.timeOfBirth;

        if (dobStr.isNotEmpty || tobStr.isNotEmpty) {
          final List<InlineSpan> spans = [];
          if (dobStr.isNotEmpty) {
            spans.add(const TextSpan(text: "DOB ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brown500)));
            spans.add(TextSpan(text: dobStr, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)));
          }
          if (dobStr.isNotEmpty && tobStr.isNotEmpty) {
            spans.add(const TextSpan(text: "  ·  ", style: TextStyle(color: Colors.brown)));
          }
          if (tobStr.isNotEmpty) {
            spans.add(const TextSpan(text: "TOB ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brown500)));
            spans.add(TextSpan(text: tobStr, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)));
          }

          _drawTextRich(
            canvas,
            TextSpan(children: spans),
            const Offset(30, 76),
          );
        }
      }

      // Place Detail
      if (birthDetails?.placeOfBirth != null && birthDetails!.placeOfBirth.isNotEmpty) {
        _drawTextRich(
          canvas,
          TextSpan(
            children: [
              const TextSpan(text: "Place ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brown500)),
              TextSpan(text: birthDetails!.placeOfBirth, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)),
            ],
          ),
          const Offset(30, 93),
        );
      }

      // Ascendant + Nakshatra
      final List<InlineSpan> ascSpans = [
        const TextSpan(text: "Asc ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.gold)),
        TextSpan(text: "${zodiacSymbols[ascendant] ?? ''} $ascendant", style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)),
      ];
      if (ascendantDegree != null) {
        ascSpans.add(TextSpan(text: " ${_formatDegree(ascendantDegree!)}", style: const TextStyle(color: AppColors.brown500)));
      }
      if (nakshatra != null && nakshatra!.isNotEmpty) {
        ascSpans.add(const TextSpan(text: "  ·  ", style: TextStyle(color: Colors.brown)));
        ascSpans.add(const TextSpan(text: "Nak ", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brown500)));
        ascSpans.add(TextSpan(text: nakshatra!, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900)));
      }
      _drawTextRich(canvas, TextSpan(children: ascSpans), const Offset(30, 116));

      // Sun & Moon Badges
      // Sun Badge
      final sunBadgeRect = Rect.fromLTWH(30, 126, 90, 20);
      canvas.drawRRect(RRect.fromRectAndRadius(sunBadgeRect, const Radius.circular(10)), Paint()..color = const Color(0xFFEAB308).withOpacity(0.1));
      canvas.drawRRect(RRect.fromRectAndRadius(sunBadgeRect, const Radius.circular(10)), Paint()..color = const Color(0xFFEAB308).withOpacity(0.5)..strokeWidth = 0.6..style = PaintingStyle.stroke);
      _drawText(canvas, "☉ $sunSign", const Offset(75, 136), fontSize: 9.5, color: const Color(0xFFB8960C), fontWeight: FontWeight.bold);

      // Moon Badge
      final moonBadgeRect = Rect.fromLTWH(130, 126, 90, 20);
      canvas.drawRRect(RRect.fromRectAndRadius(moonBadgeRect, const Radius.circular(10)), Paint()..color = const Color(0xFF94A3B8).withOpacity(0.1));
      canvas.drawRRect(RRect.fromRectAndRadius(moonBadgeRect, const Radius.circular(10)), Paint()..color = const Color(0xFF94A3B8).withOpacity(0.5)..strokeWidth = 0.6..style = PaintingStyle.stroke);
      _drawText(canvas, "☽ $moonSign", const Offset(175, 136), fontSize: 9.5, color: isDark ? Colors.white70 : const Color(0xFF64748B), fontWeight: FontWeight.bold);


      // ── DIAMOND CHART ──
      final diamondPath = Path()
        ..moveTo(fTop.dx, fTop.dy)
        ..lineTo(fRight.dx, fRight.dy)
        ..lineTo(fBottom.dx, fBottom.dy)
        ..lineTo(fLeft.dx, fLeft.dy)
        ..close();

      // Shadow simulated
      final shadowPaint = Paint()
        ..color = isDark ? Colors.black.withOpacity(0.5) : const Color(0xFF5D4037).withOpacity(0.15)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
      canvas.drawPath(diamondPath.shift(const Offset(0, 3)), shadowPaint);

      final chartBgPaint = Paint()
        ..shader = RadialGradient(
          colors: isDark
              ? [const Color(0xFF2D2320), const Color(0xFF1A1412)]
              : [const Color(0xFFFFFDF7), const Color(0xFFF5F0E6)],
        ).createShader(Rect.fromLTRB(fLeft.dx, fTop.dy, fRight.dx, fBottom.dy));
      canvas.drawPath(diamondPath, chartBgPaint);

      // Diamond Border
      final borderPaint = Paint()
        ..color = isDark ? AppColors.gold.withOpacity(0.5) : AppColors.brown700
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke;
      canvas.drawPath(diamondPath, borderPaint);

      // Grid Lines
      _drawGridLines(canvas, _fGrid);

      // 1st house gold highlight
      final ascGlowPaint = Paint()
        ..shader = LinearGradient(
          colors: [
            AppColors.gold.withOpacity(0.2),
            AppColors.gold.withOpacity(0.04),
          ],
        ).createShader(Rect.fromLTRB(fLeft.dx, fTop.dy, fRight.dx, fCenter.dy));
      final ascPath = Path();
      ascPath.moveTo(fHousePolygons[1]![0].dx, fHousePolygons[1]![0].dy);
      for (int i = 1; i < fHousePolygons[1]!.length; i++) {
        ascPath.lineTo(fHousePolygons[1]![i].dx, fHousePolygons[1]![i].dy);
      }
      ascPath.close();
      canvas.drawPath(ascPath, ascGlowPaint);

      // Draw houses
      for (int h = 1; h <= 12; h++) {
        final polygon = fHousePolygons[h]!;
        final sign = signByHouse[h] ?? 'Aries';
        final planets = planetsByHouse[h] ?? [];
        _paintHouse(canvas, h, polygon, sign, planets, true);
      }

      // Ascendant label
      _drawText(
        canvas,
        "ASCENDANT",
        Offset(fTop.dx, fTop.dy - 10),
        fontSize: 9,
        color: AppColors.gold,
        fontWeight: FontWeight.bold,
      );

      // Corners & Center dots
      final dotPaint = Paint()..color = isDark ? AppColors.gold.withOpacity(0.4) : AppColors.brown700.withOpacity(0.4);
      for (final pt in [fTop, fRight, fBottom, fLeft]) {
        canvas.drawCircle(pt, 3.5, dotPaint);
      }
      canvas.drawCircle(fCenter, 2, Paint()..color = AppColors.gold.withOpacity(0.35));


      // ── LEGEND ──
      final legendRect = Rect.fromLTWH(10, 600, 440, 100);
      final legendBgPaint = Paint()
        ..shader = LinearGradient(
          colors: [
            AppColors.gold.withOpacity(0.04),
            AppColors.brown500.withOpacity(0.02),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(legendRect);
      canvas.drawRRect(RRect.fromRectAndRadius(legendRect, const Radius.circular(12)), legendBgPaint);

      final legendBorderPaint = Paint()
        ..color = AppColors.gold.withOpacity(0.2)
        ..strokeWidth = 0.5
        ..style = PaintingStyle.stroke;
      canvas.drawRRect(RRect.fromRectAndRadius(legendRect, const Radius.circular(12)), legendBorderPaint);

      // Legend Title
      _drawText(
        canvas,
        "LEGEND",
        const Offset(30, 614),
        fontSize: 9,
        color: AppColors.brown500,
        fontWeight: FontWeight.bold,
        textAlign: TextAlign.left,
      );

      // Row 1: Badges & markers
      // House Badge demo
      canvas.drawCircle(const Offset(40, 638), 5, Paint()..color = isDark ? Colors.white12 : const Color(0xFF5D4037).withOpacity(0.08));
      _drawText(canvas, "1", const Offset(40, 638), fontSize: 7, color: isDark ? Colors.white70 : AppColors.brown400, fontWeight: FontWeight.bold);
      _drawText(canvas, "House number", const Offset(52, 638), fontSize: 8.5, color: AppColors.brown500, textAlign: TextAlign.left);

      // Zodiac symbol demo
      _drawText(canvas, "♈", const Offset(148, 638), fontSize: 11, color: AppColors.brown500, textAlign: TextAlign.left);
      _drawText(canvas, "Zodiac sign", const Offset(162, 638), fontSize: 8.5, color: AppColors.brown500, textAlign: TextAlign.left);

      // Retrograde demo
      _drawText(canvas, "℞", const Offset(252, 638), fontSize: 9.5, color: Colors.red, fontWeight: FontWeight.bold, textAlign: TextAlign.left);
      _drawText(canvas, "Retrograde", const Offset(264, 638), fontSize: 8.5, color: AppColors.brown500, textAlign: TextAlign.left);

      // Ascendant highlight demo
      final ascLegendRect = Rect.fromLTWH(350, 631, 12, 12);
      canvas.drawRRect(RRect.fromRectAndRadius(ascLegendRect, const Radius.circular(2)), Paint()..color = AppColors.gold.withOpacity(0.18));
      canvas.drawRRect(RRect.fromRectAndRadius(ascLegendRect, const Radius.circular(2)), Paint()..color = AppColors.gold.withOpacity(0.5)..strokeWidth = 0.5..style = PaintingStyle.stroke);
      _drawText(canvas, "1st house (Asc)", const Offset(368, 638), fontSize: 8.5, color: AppColors.brown500, textAlign: TextAlign.left);

      // Row 2: Planet color dots
      final List<Map<String, dynamic>> row2Planets = [
        {'name': 'Sun', 'color': const Color(0xFFEAB308), 'x': 30.0},
        {'name': 'Moon', 'color': const Color(0xFF94A3B8), 'x': 82.0},
        {'name': 'Mars', 'color': const Color(0xFFDC2626), 'x': 138.0},
        {'name': 'Mercury', 'color': const Color(0xFF22C55E), 'x': 186.0},
        {'name': 'Jupiter', 'color': const Color(0xFFF59E0B), 'x': 252.0},
        {'name': 'Venus', 'color': const Color(0xFFEC4899), 'x': 314.0},
        {'name': 'Saturn', 'color': const Color(0xFF5C6BC0), 'x': 370.0},
      ];
      for (final p in row2Planets) {
        canvas.drawCircle(Offset(p['x'], 660), 4, Paint()..color = p['color']);
        _drawText(canvas, p['name'], Offset(p['x'] + 8, 660), fontSize: 8, color: AppColors.brown500, textAlign: TextAlign.left);
      }

      // Row 3: Shadow planets & Degree format
      final List<Map<String, dynamic>> row3Planets = [
        {'name': 'Rahu', 'color': const Color(0xFF7C3AED), 'x': 30.0},
        {'name': 'Ketu', 'color': const Color(0xFF6B7280), 'x': 90.0},
      ];
      for (final p in row3Planets) {
        canvas.drawCircle(Offset(p['x'], 680), 4, Paint()..color = p['color']);
        _drawText(canvas, p['name'], Offset(p['x'] + 8, 680), fontSize: 8, color: AppColors.brown500, textAlign: TextAlign.left);
      }

      _drawTextRich(
        canvas,
        TextSpan(
          children: [
            const TextSpan(text: "Degree format: ", style: TextStyle(fontSize: 8.5, color: AppColors.brown500)),
            TextSpan(text: "15°23' ", style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : AppColors.brown900)),
            const TextSpan(text: "= 15° 23 min", style: TextStyle(fontSize: 8.5, color: AppColors.brown500)),
          ],
        ),
        const Offset(160, 680),
      );
    }

    canvas.restore();
  }

  void _paintHouse(
    Canvas canvas,
    int houseNum,
    List<Offset> polygon,
    String sign,
    List<Map<String, dynamic>> planets,
    bool isFull,
  ) {
    final Offset center = _getCentroid(polygon);
    final isAsc = houseNum == 1;

    final zodiacSymbol = zodiacSymbols[sign] ?? '';
    final zodiacAbbrStr = zodiacAbbr[sign] ?? '';

    // Choose preset
    final String sizeKey = isFull ? (houseSizes[houseNum] ?? 'wide') : 'compact';
    final preset = presets[sizeKey]!;

    // Triangular houses (1, 6) are shorter - shift up
    final bool isTriangle = polygon.length == 3;
    final double yTopOffset = isTriangle ? -6.0 : -14.0;
    final double badgeYShift = isFull ? 15.0 : 11.0;

    // 1. Draw Zodiac Symbol & Abbr
    if (zodiacSymbol.isNotEmpty) {
      _drawText(
        canvas,
        "$zodiacSymbol $zodiacAbbrStr",
        Offset(center.dx, center.dy + yTopOffset),
        fontSize: preset.zodiacFont,
        color: isAsc ? const Color(0xFFD4AF37) : AppColors.brown500,
        opacity: 0.85,
        fontWeight: FontWeight.w600,
      );
    }

    // 2. Draw House Number circ badge
    final badgeCenter = Offset(center.dx + preset.dotOffsetX, center.dy + yTopOffset + badgeYShift);
    canvas.drawCircle(
      badgeCenter,
      preset.badgeR,
      Paint()
        ..color = isAsc
            ? const Color(0xFFD4AF37).withOpacity(0.2)
            : const Color(0xFF5D4037).withOpacity(0.08),
    );
    _drawText(
      canvas,
      houseNum.toString(),
      badgeCenter,
      fontSize: preset.houseNumFont,
      color: isAsc ? const Color(0xFFD4AF37) : AppColors.brown400,
      fontWeight: FontWeight.bold,
      opacity: 0.75,
    );

    // 3. Draw Planets
    final double planetStartY = center.dy + 2.0;
    for (int i = 0; i < planets.length; i++) {
      final p = planets[i];
      final double py = planetStartY + i * preset.lineGap;
      final Color pColor = planetColors[p['name']] ?? AppColors.brown500;
      final String displayName = p['name'];

      // Dot
      canvas.drawCircle(
        Offset(center.dx + preset.dotOffsetX, py),
        preset.dotR,
        Paint()..color = pColor,
      );

      // Name
      _drawText(
        canvas,
        displayName,
        Offset(center.dx + preset.nameOffsetX, py),
        fontSize: preset.planetFont,
        color: isAsc ? const Color(0xFF8B6914) : (isDark ? Colors.white70 : AppColors.brown900),
        fontWeight: FontWeight.bold,
        textAlign: TextAlign.left,
      );

      // Degree
      _drawText(
        canvas,
        _formatDegree(p['degree'] as double),
        Offset(center.dx + preset.degOffsetX, py),
        fontSize: preset.degreeFont,
        color: isAsc ? const Color(0xFFB8960C) : AppColors.brown500,
        textAlign: TextAlign.left,
      );

      // Retrograde
      if (p['retrograde'] == true) {
        _drawText(
          canvas,
          "℞",
          Offset(center.dx + preset.retroOffsetX, py),
          fontSize: preset.degreeFont,
          color: Colors.red,
          fontWeight: FontWeight.bold,
          textAlign: TextAlign.left,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
