// ignore_for_file: use_null_aware_elements
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // 10.0.2.2 is the special IP for Android emulators to access localhost on the host machine.
  // We can update this dynamically from the settings.
  static String baseUrl = 'https://ayuastro.vercel.app';
  static String? _accessToken;

  static void setBaseUrl(String newUrl) {
    if (newUrl.endsWith('/')) {
      baseUrl = newUrl.substring(0, newUrl.length - 1);
    } else {
      baseUrl = newUrl;
    }
  }

  static void setAuthToken(String? accessToken) {
    _accessToken = accessToken;
  }

  static Map<String, String> _jsonHeaders() => {
        'Content-Type': 'application/json',
      };

  static Map<String, String> _authHeaders() => {
        'Content-Type': 'application/json',
        if (_accessToken != null && _accessToken!.isNotEmpty) 'Authorization': 'Bearer $_accessToken',
      };

  // Sign In API
  static Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/signin'),
      headers: _jsonHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to sign in. Please check your credentials.');
    }
  }

  // Sign Up API
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/signup'),
      headers: _jsonHeaders(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to create account. Please try again.');
    }
  }

  // Forgot Password API
  static Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/forgot-password'),
      headers: _jsonHeaders(),
      body: jsonEncode({
        'email': email,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to request password reset.');
    }
  }

  // 1. Process All (Onboarding calculation)
  static Future<Map<String, dynamic>> processAll({
    required BirthDetails birthDetails,
    required List<QuestionnaireAnswer> answers,
    String? userId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/process-all'),
      headers: _authHeaders(),
      body: jsonEncode({
        ...birthDetails.toJson(),
        'questionnaireAnswers': answers.map((a) => a.toJson()).toList(),
        if (userId != null) 'userId': userId,
        'freeOnly': true, // Explicitly request free report during onboarding
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
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return DailyHoroscope.fromJson(data);
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
      final raw = jsonDecode(response.body);
      final List<dynamic> body = (raw is Map && raw.containsKey('data')) ? raw['data'] : raw;
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
      headers: _jsonHeaders(),
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
      headers: _authHeaders(),
      body: jsonEncode({
        'userId': userId,
        'mood': mood,
        'emoji': emoji,
        if (note != null && note.isNotEmpty) 'note': note,
        'tags': tags,
      }),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return MoodEntry.fromJson(data);
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

    final response = await http.get(uri, headers: _authHeaders()).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final raw = jsonDecode(response.body);
      final data = (raw is Map && raw.containsKey('data')) ? raw['data'] : raw;
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

  // 7. Fetch Kundali Score
  static Future<KundaliScoreData> getKundaliScore({
    String? userId,
    required String sunSign,
    required String moonSign,
    required String ascendant,
    required Map<String, dynamic> planetaryPositions,
    required List<String> yogas,
    required List<String> doshas,
    required String nakshatra,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/astrology/kundali-score'),
      headers: userId != null ? _authHeaders() : _jsonHeaders(),
      body: jsonEncode({
        if (userId != null) 'userId': userId,
        'sunSign': sunSign,
        'moonSign': moonSign,
        'ascendant': ascendant,
        'planetaryPositions': planetaryPositions,
        'yogas': yogas,
        'doshas': doshas,
        'nakshatra': nakshatra,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return KundaliScoreData.fromJson(data);
    } else {
      throw Exception('Failed to fetch Kundali score');
    }
  }

  // Fetch Gratitude History
  static Future<Map<String, dynamic>> getGratitudeHistory({
    required String userId,
    int days = 30,
  }) async {
    final uri = Uri.parse('$baseUrl/api/gratitude/history').replace(
      queryParameters: {
        'userId': userId,
        'days': days.toString(),
      },
    );

    final response = await http.get(uri, headers: _authHeaders()).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      
      final List<dynamic> entriesRaw = data['entries'] ?? [];
      final entries = entriesRaw.map((e) => GratitudeEntry.fromJson(e)).toList();
      
      final summaryRaw = data['summary'] ?? {};
      final summaryMap = Map<String, dynamic>.from(summaryRaw);
      if (summaryMap.containsKey('streakDays') && !summaryMap.containsKey('streak')) {
        summaryMap['streak'] = summaryMap['streakDays'];
      }
      final stats = GratitudeStats.fromJson(summaryMap);

      return {
        'entries': entries,
        'summary': stats,
      };
    } else {
      throw Exception('Failed to fetch gratitude history');
    }
  }

  // Save Gratitude Entry
  static Future<GratitudeEntry> saveGratitudeEntry({
    required String userId,
    required String slot,
    required String content,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/gratitude/entry'),
      headers: _authHeaders(),
      body: jsonEncode({
        'userId': userId,
        'slot': slot,
        'content': content,
      }),
    ).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return GratitudeEntry.fromJson(data);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to save gratitude entry');
    }
  }

  // Fetch Calendar Events
  static Future<List<CalendarEvent>> getCalendarEvents({
    required int month,
    required int year,
  }) async {
    final uri = Uri.parse('$baseUrl/api/calendar/events').replace(
      queryParameters: {
        'month': month.toString(),
        'year': year.toString(),
      },
    );

    final response = await http.get(uri).timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final raw = jsonDecode(response.body);
      final List<dynamic> eventsRaw = raw['events'] ?? [];
      return eventsRaw.map((e) => CalendarEvent.fromJson(e)).toList();
    } else {
      throw Exception('Failed to fetch calendar events');
    }
  }

  // Fetch Vedic Analysis
  static Future<Map<String, dynamic>> getVedicAnalysis({
    required String userId,
  }) async {
    final uri = Uri.parse('$baseUrl/api/astrology/vedic-analysis').replace(
      queryParameters: {
        'userId': userId,
      },
    );

    final response = await http.get(uri, headers: _authHeaders()).timeout(const Duration(seconds: 25));

    if (response.statusCode == 200) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return Map<String, dynamic>.from(data);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to load Vedic analysis details');
    }
  }

  // Chat with Astrologer
  static Future<Map<String, dynamic>> sendAstrologerChatMessage({
    required String message,
    required String sessionId,
    String? userId,
    required Map<String, dynamic> context,
    required List<ChatMessage> conversationHistory,
    required String astrologerId,
    required String astrologerSystemPrompt,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/chat/astrologer'),
      headers: userId != null ? _authHeaders() : _jsonHeaders(),
      body: jsonEncode({
        'message': message,
        'sessionId': sessionId,
        if (userId != null) 'userId': userId,
        'context': context,
        'conversationHistory': conversationHistory
            .map((msg) => {
                  'role': msg.role,
                  'content': msg.content,
                })
            .toList(),
        'astrologerId': astrologerId,
        'astrologerSystemPrompt': astrologerSystemPrompt,
      }),
    ).timeout(const Duration(seconds: 20));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'response': data['response'] ?? '',
        'remaining': data['remaining'],
      };
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Astrologer is meditating. Try again later.');
    }
  }

  // Fetch Deep Intelligence Report
  static Future<Map<String, dynamic>> fetchDeepIntelligenceReport({
    required String userId,
    required Map<String, dynamic> astrologyData,
    required Map<String, dynamic> numerologyData,
    required Map<String, dynamic> traitScores,
    String language = 'en',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/ai/deep-intelligence'),
      headers: _authHeaders(),
      body: jsonEncode({
        'userId': userId,
        'astrologyData': astrologyData,
        'numerologyData': numerologyData,
        'traitScores': traitScores,
        'language': language,
      }),
    ).timeout(const Duration(seconds: 120));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final raw = jsonDecode(response.body);
      final data = raw['data'] ?? raw;
      return data;
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to generate deep cosmic insights (${response.statusCode})');
    }
  }

  // Update Preferences API
  static Future<Map<String, dynamic>> updatePreferences({
    required String userId,
    bool? ucpEnabled,
    bool? rotateUcpToken,
    String? language,
    String? vedicLevel,
    bool? dailyHoroscope,
    bool? moodReminders,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/auth/preferences'),
      headers: _authHeaders(),
      body: jsonEncode({
        'userId': userId,
        if (ucpEnabled != null) 'ucpEnabled': ucpEnabled,
        if (rotateUcpToken != null) 'rotateUcpToken': rotateUcpToken,
        if (language != null) 'language': language,
        if (vedicLevel != null) 'vedicLevel': vedicLevel,
        if (dailyHoroscope != null) 'dailyHoroscope': dailyHoroscope,
        if (moodReminders != null) 'moodReminders': moodReminders,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to update preferences on server');
    }
  }

  // 8. Generate PDF Report
  static Future<List<int>> generatePdfReport({
    required String userId,
    required bool includePremium,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/reports/generate-pdf'),
      headers: _authHeaders(),
      body: jsonEncode({
        'userId': userId,
        'includePremium': includePremium,
      }),
    ).timeout(const Duration(seconds: 40));

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to generate PDF report (${response.statusCode})');
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

  // Fetch User Profile API
  static Future<Map<String, dynamic>> fetchUserProfile(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/auth/profile?userId=$userId'),
      headers: _authHeaders(),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final errorMsg = _tryExtractErrorMessage(response.body);
      throw Exception(errorMsg ?? 'Failed to fetch user profile from server');
    }
  }
}

