import 'dart:math';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'custom_widgets.dart';

// ─── Constants ──────────────────────────────────────────────────────────────

const Map<String, Color> elementChartColors = {
  'Fire': Color(0xFFEF4444),
  'Earth': Color(0xFF10B981),
  'Air': Color(0xFFF59E0B),
  'Water': Color(0xFF3B82F6),
};

const List<Color> numerologyColors = [
  Color(0xFFD4AF37), // gold
  Color(0xFF7C9070), // sage
  Color(0xFF8B6F47), // brown
  Color(0xFFC4A35A), // light gold
];

const Map<String, Color> pieColors = {
  'High': Color(0xFF7C9070),     // sage
  'Moderate': Color(0xFFD4AF37), // gold
  'Growth': Color(0xFFA89070),   // brown-300
};

const Map<int, String> numerologyMeanings = {
  1: 'The Pioneer — independence, originality, ambition',
  2: 'The Peacemaker — cooperation, sensitivity, balance',
  3: 'The Creative — expression, joy, inspiration',
  4: 'The Builder — stability, discipline, hard work',
  5: 'The Adventurer — freedom, change, versatility',
  6: 'The Nurturer — responsibility, love, harmony',
  7: 'The Seeker — wisdom, introspection, spirituality',
  8: 'The Powerhouse — authority, success, material mastery',
  9: 'The Humanitarian — compassion, generosity, universal love',
  11: 'The Illuminator — intuition, spiritual insight, inspiration',
  22: 'The Master Builder — visionary creation, practical idealism',
  33: 'The Master Teacher — compassion mastery, spiritual upliftment',
};

// ─── 1. Radar Chart Painter ────────────────────────────────────────────────

class RadarChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> data; // [{subject: 'Empathy', score: 78}, ...]
  final bool isDark;

  RadarChartPainter({required this.data, this.isDark = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) * 0.35;
    final n = data.length;
    final angleStep = 2 * pi / n;

    // Grid colors
    final gridColor = isDark 
        ? const Color(0xFFA89070).withOpacity(0.15) 
        : const Color(0xFF8B6F47).withOpacity(0.1);
    final axisColor = isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47);
    final goldColor = const Color(0xFFD4AF37);

    // Draw concentric polygon grids (at 20%, 40%, 60%, 80%, 100%)
    for (int level = 1; level <= 5; level++) {
      final levelRadius = radius * level / 5;
      final path = Path();
      for (int i = 0; i <= n; i++) {
        final angle = -pi / 2 + i * angleStep;
        final x = center.dx + levelRadius * cos(angle);
        final y = center.dy + levelRadius * sin(angle);
        if (i == 0) path.moveTo(x, y); else path.lineTo(x, y);
      }
      path.close();
      canvas.drawPath(path, Paint()
        ..color = gridColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.8);
    }

    // Draw radial axis lines
    for (int i = 0; i < n; i++) {
      final angle = -pi / 2 + i * angleStep;
      final x = center.dx + radius * cos(angle);
      final y = center.dy + radius * sin(angle);
      canvas.drawLine(center, Offset(x, y), Paint()
        ..color = gridColor
        ..strokeWidth = 0.5);
    }

    // Draw labels
    for (int i = 0; i < n; i++) {
      final angle = -pi / 2 + i * angleStep;
      final labelRadius = radius + 18;
      final x = center.dx + labelRadius * cos(angle);
      final y = center.dy + labelRadius * sin(angle);

      final label = data[i]['subject']?.toString() ?? '';
      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: TextStyle(
            color: axisColor,
            fontSize: 9,
            fontWeight: FontWeight.w500,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      // Center text around the point
      canvas.save();
      tp.paint(canvas, Offset(x - tp.width / 2, y - tp.height / 2));
      canvas.restore();
    }

    // Draw filled score polygon
    final scorePath = Path();
    for (int i = 0; i <= n; i++) {
      final idx = i % n;
      final score = (data[idx]['score'] as num?)?.toDouble() ?? 0;
      final r = radius * score / 100;
      final angle = -pi / 2 + idx * angleStep;
      final x = center.dx + r * cos(angle);
      final y = center.dy + r * sin(angle);
      if (i == 0) scorePath.moveTo(x, y); else scorePath.lineTo(x, y);
    }
    scorePath.close();

    // Fill with transparent gold
    canvas.drawPath(scorePath, Paint()
      ..color = goldColor.withOpacity(0.1)
      ..style = PaintingStyle.fill);

    // Stroke
    canvas.drawPath(scorePath, Paint()
      ..color = goldColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2);

    // Draw dots at score vertices
    for (int i = 0; i < n; i++) {
      final score = (data[i]['score'] as num?)?.toDouble() ?? 0;
      final r = radius * score / 100;
      final angle = -pi / 2 + i * angleStep;
      final x = center.dx + r * cos(angle);
      final y = center.dy + r * sin(angle);

      // White border dot
      canvas.drawCircle(Offset(x, y), 4, Paint()..color = Colors.white);
      // Gold fill dot
      canvas.drawCircle(Offset(x, y), 3, Paint()..color = goldColor);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ─── 2. Donut Chart Painter ─────────────────────────────────────────────────

class DonutChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> data; // [{name: 'High', value: 50, count: 7}, ...]
  final bool isDark;

  DonutChartPainter({required this.data, this.isDark = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final center = Offset(size.width / 2, size.height / 2);
    final outerRadius = min(size.width, size.height) * 0.38;
    final innerRadius = outerRadius * 0.55;
    final total = data.fold<double>(0, (sum, d) => sum + ((d['value'] as num?)?.toDouble() ?? 0));
    if (total == 0) return;

    double startAngle = -pi / 2;
    final gap = 0.04; // gap between segments in radians

    for (int i = 0; i < data.length; i++) {
      final value = (data[i]['value'] as num?)?.toDouble() ?? 0;
      final sweepAngle = (value / total) * (2 * pi) - gap;
      final name = data[i]['name']?.toString() ?? '';
      final color = pieColors[name] ?? AppColors.gold;

      final path = Path();
      path.addArc(Rect.fromCircle(center: center, radius: outerRadius), startAngle, sweepAngle);
      path.arcTo(Rect.fromCircle(center: center, radius: innerRadius), startAngle + sweepAngle, -sweepAngle, false);
      path.close();

      canvas.drawPath(path, Paint()
        ..color = color
        ..style = PaintingStyle.fill);

      startAngle += sweepAngle + gap;
    }

    // Draw center text
    Map<String, dynamic> dominant = data.first;
    int maxCount = (dominant['count'] as num?)?.toInt() ?? 0;
    for (final item in data) {
      final c = (item['count'] as num?)?.toInt() ?? 0;
      if (c > maxCount) {
        maxCount = c;
        dominant = item;
      }
    }
    final dominantName = dominant['name']?.toString() ?? '';

    final titlePainter = TextPainter(
      text: TextSpan(
        text: dominantName,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: isDark ? AppColors.gold : AppColors.brown900,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    titlePainter.paint(canvas, Offset(center.dx - titlePainter.width / 2, center.dy - titlePainter.height / 2 - 6));

    final subtitlePainter = TextPainter(
      text: TextSpan(
        text: 'DOMINANT',
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
          color: isDark ? AppColors.brown400 : AppColors.brown500,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    subtitlePainter.paint(canvas, Offset(center.dx - subtitlePainter.width / 2, center.dy + 8));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ─── 3. Bar Chart Painter (Element Balance) ─────────────────────────────────

class ElementBarChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> data; // [{element: 'Fire', percentage: 33}, ...]
  final bool isDark;

  ElementBarChartPainter({required this.data, this.isDark = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final axisColor = isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47);
    final gridColor = (isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47)).withOpacity(0.1);

    final leftPadding = 30.0;
    final bottomPadding = 28.0;
    final topPadding = 8.0;
    final chartWidth = size.width - leftPadding - 10;
    final chartHeight = size.height - bottomPadding - topPadding;

    // Draw horizontal grid lines
    for (int i = 0; i <= 4; i++) {
      final y = topPadding + chartHeight * (1 - i / 4);
      canvas.drawLine(
        Offset(leftPadding, y), 
        Offset(size.width - 10, y), 
        Paint()..color = gridColor..strokeWidth = 0.5
      );
      // Y axis labels
      final label = '${i * 25}';
      final tp = TextPainter(
        text: TextSpan(text: label, style: TextStyle(color: axisColor, fontSize: 9)),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(leftPadding - tp.width - 6, y - tp.height / 2));
    }

    // Draw bars
    final barCount = data.length;
    final barGroupWidth = chartWidth / barCount;
    final barWidth = barGroupWidth * 0.55;

    for (int i = 0; i < barCount; i++) {
      final element = data[i]['element']?.toString() ?? '';
      final percentage = (data[i]['percentage'] as num?)?.toDouble() ?? 0;
      final color = elementChartColors[element] ?? AppColors.gold;

      final barHeight = chartHeight * (percentage / 100);
      final x = leftPadding + i * barGroupWidth + (barGroupWidth - barWidth) / 2;
      final y = topPadding + chartHeight - barHeight;

      // Rounded rect bar
      final barRect = RRect.fromRectAndCorners(
        Rect.fromLTWH(x, y, barWidth, barHeight),
        topLeft: const Radius.circular(8),
        topRight: const Radius.circular(8),
      );
      canvas.drawRRect(barRect, Paint()..color = color);

      // X axis label
      final tp = TextPainter(
        text: TextSpan(
          text: element,
          style: TextStyle(color: axisColor, fontSize: 11, fontWeight: FontWeight.w600),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(x + barWidth / 2 - tp.width / 2, topPadding + chartHeight + 8));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ─── 4. Mood Trend Area Painter ─────────────────────────────────────────────

class MoodTrendAreaPainter extends CustomPainter {
  final List<Map<String, dynamic>> data; // [{day: 'Mon', mood: 60}, ...]
  final bool isDark;

  MoodTrendAreaPainter({required this.data, this.isDark = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final axisColor = isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47);
    final gridColor = (isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47)).withOpacity(0.1);
    final goldColor = const Color(0xFFD4AF37);

    final leftPadding = 30.0;
    final bottomPadding = 28.0;
    final topPadding = 8.0;
    final chartWidth = size.width - leftPadding - 10;
    final chartHeight = size.height - bottomPadding - topPadding;

    // Horizontal grid lines
    for (int i = 0; i <= 4; i++) {
      final y = topPadding + chartHeight * (1 - i / 4);
      canvas.drawLine(
        Offset(leftPadding, y),
        Offset(size.width - 10, y),
        Paint()..color = gridColor..strokeWidth = 0.5,
      );
      final label = '${i * 25}';
      final tp = TextPainter(
        text: TextSpan(text: label, style: TextStyle(color: axisColor, fontSize: 9)),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(leftPadding - tp.width - 6, y - tp.height / 2));
    }

    // Filter out zero-mood entries for valid points
    final validPoints = <Offset>[];
    final allPoints = <Offset>[];
    final step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    for (int i = 0; i < data.length; i++) {
      final mood = (data[i]['mood'] as num?)?.toDouble() ?? 0;
      final x = leftPadding + i * step;
      final y = topPadding + chartHeight * (1 - mood / 100);
      allPoints.add(Offset(x, y));
      if (mood > 0) validPoints.add(Offset(x, y));
    }

    if (validPoints.length >= 2) {
      // Build smooth Bezier path
      final linePath = Path();
      linePath.moveTo(validPoints[0].dx, validPoints[0].dy);
      for (int i = 1; i < validPoints.length; i++) {
        final prev = validPoints[i - 1];
        final curr = validPoints[i];
        final cpx1 = prev.dx + (curr.dx - prev.dx) * 0.4;
        final cpx2 = prev.dx + (curr.dx - prev.dx) * 0.6;
        linePath.cubicTo(cpx1, prev.dy, cpx2, curr.dy, curr.dx, curr.dy);
      }

      // Fill area under the curve
      final areaPath = Path.from(linePath);
      areaPath.lineTo(validPoints.last.dx, topPadding + chartHeight);
      areaPath.lineTo(validPoints.first.dx, topPadding + chartHeight);
      areaPath.close();

      // Gradient fill
      final gradient = ui.Gradient.linear(
        Offset(0, topPadding),
        Offset(0, topPadding + chartHeight),
        [goldColor.withOpacity(0.15), goldColor.withOpacity(0.0)],
      );
      canvas.drawPath(areaPath, Paint()..shader = gradient);

      // Line stroke
      canvas.drawPath(linePath, Paint()
        ..color = goldColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round);

      // Dots
      for (final pt in validPoints) {
        canvas.drawCircle(pt, 5, Paint()..color = Colors.white);
        canvas.drawCircle(pt, 4, Paint()..color = goldColor);
      }
    }

    // X axis labels (show every other for space)
    for (int i = 0; i < data.length; i++) {
      if (data.length > 7 && i % 2 != 0 && i != data.length - 1) continue;
      final label = data[i]['day']?.toString() ?? '';
      final x = leftPadding + i * step;
      final tp = TextPainter(
        text: TextSpan(text: label, style: TextStyle(color: axisColor, fontSize: 9)),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(x - tp.width / 2, topPadding + chartHeight + 8));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ─── 5. Numerology Blueprint Horizontal Bar Painter ─────────────────────────

class NumerologyBarPainter extends CustomPainter {
  final List<Map<String, dynamic>> data; // [{name: 'Life Path', value: 7, meaning: '...'}, ...]
  final bool isDark;

  NumerologyBarPainter({required this.data, this.isDark = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final axisColor = isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47);
    final gridColor = (isDark ? const Color(0xFFA89070) : const Color(0xFF8B6F47)).withOpacity(0.1);

    final leftPadding = 80.0;
    final rightPadding = 10.0;
    final topPadding = 8.0;
    final barHeight = 22.0;
    final barSpacing = 14.0;
    final chartWidth = size.width - leftPadding - rightPadding;
    final maxValue = 33.0;

    // Draw vertical grid lines
    for (int i = 0; i <= 3; i++) {
      final x = leftPadding + chartWidth * i / 3;
      canvas.drawLine(
        Offset(x, topPadding),
        Offset(x, topPadding + data.length * (barHeight + barSpacing)),
        Paint()..color = gridColor..strokeWidth = 0.5,
      );
      // Bottom labels
      final label = '${(maxValue * i / 3).round()}';
      final tp = TextPainter(
        text: TextSpan(text: label, style: TextStyle(color: axisColor, fontSize: 9)),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(x - tp.width / 2, topPadding + data.length * (barHeight + barSpacing) + 6));
    }

    // Draw bars
    for (int i = 0; i < data.length; i++) {
      final name = data[i]['name']?.toString() ?? '';
      final value = (data[i]['value'] as num?)?.toDouble() ?? 0;
      final color = i < numerologyColors.length ? numerologyColors[i] : AppColors.gold;
      final y = topPadding + i * (barHeight + barSpacing);
      final barW = chartWidth * (value / maxValue);

      // Y axis label
      final tp = TextPainter(
        text: TextSpan(
          text: name,
          style: TextStyle(color: axisColor, fontSize: 10, fontWeight: FontWeight.w500),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(leftPadding - tp.width - 8, y + barHeight / 2 - tp.height / 2));

      // Rounded horizontal bar
      final barRect = RRect.fromRectAndCorners(
        Rect.fromLTWH(leftPadding, y, barW, barHeight),
        topRight: const Radius.circular(8),
        bottomRight: const Radius.circular(8),
      );
      canvas.drawRRect(barRect, Paint()..color = color);

      // Value label on bar
      final valTp = TextPainter(
        text: TextSpan(
          text: '${value.toInt()}',
          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      if (barW > 30) {
        valTp.paint(canvas, Offset(leftPadding + barW - valTp.width - 8, y + barHeight / 2 - valTp.height / 2));
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
