import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // 10.0.2.2 is the special IP for Android emulators to access localhost on the host machine.
  // We can update this dynamically from the settings.
  static String baseUrl = 'http://10.0.2.2:3000';

  static void setBaseUrl(String newUrl) {
    if (newUrl.endsWith('/')) {
      baseUrl = newUrl.substring(0, newUrl.length - 1);
    } else {
      baseUrl = newUrl;
    }
  }

  // 1. Process All (Onboarding calculation)
  static Future<Map<String, dynamic>> processAll({
    required BirthDetails birthDetails,
    required List<QuestionnaireAnswer> answers,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/process-all'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        ...birthDetails.toJson(),
        'questionnaireAnswers': answers.map((a) => a.toJson()).toList(),
      }),
    ).timeout(const Duration(seconds: 60));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final raw = jsonDecode(response.body);
      // API wraps results under { success, data: {...} }
      final data = raw['data'] ?? raw;
      return data;
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to compute cosmic identity (${response.statusCode})');
    }
  }

  // 2. Daily Horoscope
  static Future<DailyHoroscope> getDailyHoroscope({
    required String sunSign,
    required String moonSign,
  }) async {
    final uri = Uri.parse('$baseUrl/api/horoscope/daily').replace(
      queryParameters: {
        'sunSign': sunSign,
        'moonSign': moonSign,
      },
    );

    final response = await http.get(uri).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      return DailyHoroscope.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load daily horoscope');
    }
  }

  // 3. Planetary Transits
  static Future<List<TransitInfo>> getCurrentTransits({
    required String sunSign,
    required String moonSign,
    required String ascendant,
  }) async {
    final uri = Uri.parse('$baseUrl/api/transits/current').replace(
      queryParameters: {
        'sunSign': sunSign,
        'moonSign': moonSign,
        'ascendant': ascendant,
      },
    );

    final response = await http.get(uri).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final List<dynamic> body = jsonDecode(response.body);
      return body.map((item) => TransitInfo.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load current planetary transits');
    }
  }

  // 4. Chat with Cosmic Counselor
  static Future<String> sendChatMessage({
    required String message,
    required String sessionId,
    required Map<String, dynamic> context,
    required List<ChatMessage> conversationHistory,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'message': message,
        'sessionId': sessionId,
        'context': context,
        'conversationHistory': conversationHistory
            .map((msg) => {
                  'role': msg.role,
                  'content': msg.content,
                })
            .toList(),
      }),
    ).timeout(const Duration(seconds: 20));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['response'] ?? '';
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Counselor is meditating. Try again later.');
    }
  }

  // 5. Mood Log Entry
  static Future<MoodEntry> logMood({
    required String userId,
    required int mood,
    required String emoji,
    String? note,
    required List<String> tags,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mood/entry'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'mood': mood,
        'emoji': emoji,
        if (note != null && note.isNotEmpty) 'note': note,
        'tags': tags,
      }),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200 || response.statusCode == 201) {
      return MoodEntry.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to log mood entry');
    }
  }

  // 6. Mood History
  static Future<Map<String, dynamic>> getMoodHistory({
    required String userId,
    int days = 30,
  }) async {
    final uri = Uri.parse('$baseUrl/api/mood/history').replace(
      queryParameters: {
        'userId': userId,
        'days': days.toString(),
      },
    );

    final response = await http.get(uri).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> entriesRaw = data['entries'] ?? [];
      final entries = entriesRaw.map((e) => MoodEntry.fromJson(e)).toList();
      final summary = MoodHistorySummary.fromJson(data['summary'] ?? {});
      return {
        'entries': entries,
        'summary': summary,
      };
    } else {
      throw Exception('Failed to fetch mood history');
    }
  }

  // Helpers
  static String? _tryExtractErrorMessage(String body) {
    try {
      final json = jsonDecode(body);
      return json['error'] ?? json['message'];
    } catch (_) {
      return null;
    }
  }
}
