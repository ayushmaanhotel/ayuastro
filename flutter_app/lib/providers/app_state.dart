import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AppState extends ChangeNotifier {
  // Persistence Key
  static const String _storageKey = 'ayuastro_pref_storage';

  // Navigation state
  String _currentView = 'landing';
  String? _previousView;
  String _activeTab = 'insights';
  String _onboardingStep = 'name';

  // User state
  String? _userId;
  bool _isOnboarded = false;
  String? _userEmail;
  String? _userName;
  BirthDetails? _birthDetails;
  List<QuestionnaireAnswer> _questionnaireAnswers = [];

  // Computed data
  AstrologyInfo? _astrologyData;
  NumerologyInfo? _numerologyData;
  List<TraitScore> _traitScores = [];
  List<ReportSection> _reportSections = [];
  String _reportSummary = '';

  // App settings
  String _language = 'en'; // en, hi, hinglish
  String _vedicLevel = 'standard'; // standard, detailed, hinglish
  bool _dailyHoroscopeNotif = true;
  bool _moodRemindersNotif = true;
  bool _hasPaid = false;

  // Compatibility detail
  String? _compatPartnerName;
  String? _compatPartnerSign;
  int _compatOverallScore = 0;
  int _compatEmotionalScore = 0;
  int _compatCommunicationScore = 0;
  int _compatTrustScore = 0;

  // Active features data
  DailyHoroscope? _dailyHoroscope;
  List<TransitInfo> _transits = [];
  List<ChatMessage> _chatMessages = [];
  List<MoodEntry> _moodHistory = [];
  MoodHistorySummary? _moodSummary;
  bool _markedAffirmationDone = false;
  KundaliScoreData? _kundaliScore;
  bool _isScoreLoading = false;

  // Gratitude & Calendar state
  List<GratitudeEntry> _gratitudeHistory = [];
  GratitudeStats? _gratitudeStats;
  List<CalendarEvent> _calendarEvents = [];
  bool _isGratitudeHistoryLoading = false;
  bool _isCalendarLoading = false;


  // Loading states
  bool _isLoading = false;
  String _loadingMessage = '';
  String? _error;
  bool _isChatLoading = false;
  bool _isMoodHistoryLoading = false;

  // Getters
  String get currentView => _currentView;
  String? get previousView => _previousView;
  String get activeTab => _activeTab;
  String get onboardingStep => _onboardingStep;
  String? get userId => _userId;
  bool get isOnboarded => _isOnboarded;
  String? get userEmail => _userEmail;
  String? get userName => _userName;
  BirthDetails? get birthDetails => _birthDetails;
  List<QuestionnaireAnswer> get questionnaireAnswers => _questionnaireAnswers;
  AstrologyInfo? get astrologyData => _astrologyData;
  NumerologyInfo? get numerologyData => _numerologyData;
  List<TraitScore> get traitScores => _traitScores;
  List<ReportSection> get reportSections => _reportSections;
  String get reportSummary => _reportSummary;
  String get language => _language;
  String get vedicLevel => _vedicLevel;
  bool get dailyHoroscopeNotif => _dailyHoroscopeNotif;
  bool get moodRemindersNotif => _moodRemindersNotif;
  bool get hasPaid => _hasPaid;

  String? get compatPartnerName => _compatPartnerName;
  String? get compatPartnerSign => _compatPartnerSign;
  int get compatOverallScore => _compatOverallScore;
  int get compatEmotionalScore => _compatEmotionalScore;
  int get compatCommunicationScore => _compatCommunicationScore;
  int get compatTrustScore => _compatTrustScore;

  DailyHoroscope? get dailyHoroscope => _dailyHoroscope;
  List<TransitInfo> get transits => _transits;
  List<ChatMessage> get chatMessages => _chatMessages;
  List<MoodEntry> get moodHistory => _moodHistory;
  MoodHistorySummary? get moodSummary => _moodSummary;
  bool get markedAffirmationDone => _markedAffirmationDone;
  KundaliScoreData? get kundaliScore => _kundaliScore;
  bool get isScoreLoading => _isScoreLoading;

  List<GratitudeEntry> get gratitudeHistory => _gratitudeHistory;
  GratitudeStats? get gratitudeStats => _gratitudeStats;
  List<CalendarEvent> get calendarEvents => _calendarEvents;
  bool get isGratitudeHistoryLoading => _isGratitudeHistoryLoading;
  bool get isCalendarLoading => _isCalendarLoading;

  bool get isLoading => _isLoading;
  String get loadingMessage => _loadingMessage;
  String? get error => _error;
  bool get isChatLoading => _isChatLoading;
  bool get isMoodHistoryLoading => _isMoodHistoryLoading;

  AppState() {
    _loadState();
  }

  // Load from local storage
  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dataStr = prefs.getString(_storageKey);
      if (dataStr != null) {
        final Map<String, dynamic> data = jsonDecode(dataStr);
        _currentView = data['currentView'] ?? 'landing';
        _activeTab = data['activeTab'] ?? 'insights';
        _onboardingStep = data['onboardingStep'] ?? 'name';
        _userId = data['userId'];
        _isOnboarded = data['isOnboarded'] ?? false;
        _userEmail = data['userEmail'];
        _userName = data['userName'];
        _hasPaid = data['hasPaid'] ?? false;
        _language = data['language'] ?? 'en';
        _vedicLevel = data['vedicLevel'] ?? 'standard';
        _dailyHoroscopeNotif = data['dailyHoroscopeNotif'] ?? true;
        _moodRemindersNotif = data['moodRemindersNotif'] ?? true;

        if (data['birthDetails'] != null) {
          _birthDetails = BirthDetails.fromJson(data['birthDetails']);
        }
        if (data['questionnaireAnswers'] != null) {
          final List<dynamic> list = data['questionnaireAnswers'];
          _questionnaireAnswers = list.map((e) => QuestionnaireAnswer.fromJson(e)).toList();
        }
        if (data['astrologyData'] != null) {
          _astrologyData = AstrologyInfo.fromJson(data['astrologyData']);
        }
        if (data['numerologyData'] != null) {
          _numerologyData = NumerologyInfo.fromJson(data['numerologyData']);
        }
        if (data['traitScores'] != null) {
          final List<dynamic> list = data['traitScores'];
          _traitScores = list.map((e) => TraitScore.fromJson(e)).toList();
        }
        if (data['reportSections'] != null) {
          final List<dynamic> list = data['reportSections'];
          _reportSections = list.map((e) => ReportSection.fromJson(e)).toList();
        }
        _reportSummary = data['reportSummary'] ?? '';

        _compatPartnerName = data['compatPartnerName'];
        _compatPartnerSign = data['compatPartnerSign'];
        _compatOverallScore = data['compatOverallScore'] ?? 0;
        _compatEmotionalScore = data['compatEmotionalScore'] ?? 0;
        _compatCommunicationScore = data['compatCommunicationScore'] ?? 0;
        _compatTrustScore = data['compatTrustScore'] ?? 0;

        if (data['chatMessages'] != null) {
          final List<dynamic> list = data['chatMessages'];
          _chatMessages = list.map((e) => ChatMessage.fromJson(e)).toList();
        }

        // Custom base URL config if previously saved
        final savedBaseUrl = prefs.getString('ayuastro_api_base_url');
        if (savedBaseUrl != null) {
          ApiService.setBaseUrl(savedBaseUrl);
        }

        notifyListeners();
        
        // Fetch supplemental details in background if onboarded
        if (_userId != null && _astrologyData != null) {
          fetchDailyHoroscope();
          fetchTransits();
          fetchMoodHistory();
          fetchKundaliScore();
        }
      }
    } catch (e) {
      debugPrint("Error loading persistent state: $e");
    }
  }

  // Save to local storage
  Future<void> _saveState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = {
        'currentView': _currentView,
        'activeTab': _activeTab,
        'onboardingStep': _onboardingStep,
        'userId': _userId,
        'isOnboarded': _isOnboarded,
        'userEmail': _userEmail,
        'userName': _userName,
        'hasPaid': _hasPaid,
        'language': _language,
        'vedicLevel': _vedicLevel,
        'dailyHoroscopeNotif': _dailyHoroscopeNotif,
        'moodRemindersNotif': _moodRemindersNotif,
        'birthDetails': _birthDetails?.toJson(),
        'questionnaireAnswers': _questionnaireAnswers.map((a) => a.toJson()).toList(),
        'astrologyData': _astrologyData?.toJson(),
        'numerologyData': _numerologyData?.toJson(),
        'traitScores': _traitScores.map((s) => s.toJson()).toList(),
        'reportSections': _reportSections.map((s) => s.toJson()).toList(),
        'reportSummary': _reportSummary,
        'compatPartnerName': _compatPartnerName,
        'compatPartnerSign': _compatPartnerSign,
        'compatOverallScore': _compatOverallScore,
        'compatEmotionalScore': _compatEmotionalScore,
        'compatCommunicationScore': _compatCommunicationScore,
        'compatTrustScore': _compatTrustScore,
        'chatMessages': _chatMessages.map((m) => m.toJson()).toList(),
      };
      await prefs.setString(_storageKey, jsonEncode(data));
    } catch (e) {
      debugPrint("Error saving persistent state: $e");
    }
  }

  // View control
  void setView(String view) {
    _previousView = _currentView;
    _currentView = view;
    _saveState();
    notifyListeners();
  }

  void setActiveTab(String tab) {
    _activeTab = tab;
    _saveState();
    notifyListeners();
  }

  void setOnboardingStep(String step) {
    _onboardingStep = step;
    _saveState();
    notifyListeners();
  }

  void updateApiBaseUrl(String newUrl) async {
    ApiService.setBaseUrl(newUrl);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ayuastro_api_base_url', newUrl);
    notifyListeners();
  }

  // Onboarding operations
  void setBirthDetails({
    String? name,
    String? dateOfBirth,
    String? timeOfBirth,
    String? placeOfBirth,
    double? latitude,
    double? longitude,
    String? timezone,
    String? gender,
    String? relationshipStatus,
  }) {
    _birthDetails = BirthDetails(
      name: name ?? _birthDetails?.name ?? '',
      dateOfBirth: dateOfBirth ?? _birthDetails?.dateOfBirth ?? '',
      timeOfBirth: timeOfBirth ?? _birthDetails?.timeOfBirth ?? '',
      placeOfBirth: placeOfBirth ?? _birthDetails?.placeOfBirth ?? '',
      latitude: latitude ?? _birthDetails?.latitude ?? 19.0760, // Default Mumbai
      longitude: longitude ?? _birthDetails?.longitude ?? 72.8777,
      timezone: timezone ?? _birthDetails?.timezone ?? 'Asia/Kolkata',
      gender: gender ?? _birthDetails?.gender ?? 'male',
      relationshipStatus: relationshipStatus ?? _birthDetails?.relationshipStatus ?? 'single',
    );
    _saveState();
    notifyListeners();
  }

  void addQuestionnaireAnswer(String questionId, String answer, String category, int score) {
    _questionnaireAnswers.removeWhere((a) => a.questionId == questionId);
    _questionnaireAnswers.add(QuestionnaireAnswer(
      questionId: questionId,
      answer: answer,
      category: category,
      score: score,
    ));
    _saveState();
    notifyListeners();
  }

  void setHasPaid(bool paid) {
    _hasPaid = paid;
    _saveState();
    notifyListeners();
  }

  void setLanguage(String lang) {
    _language = lang;
    _saveState();
    notifyListeners();
  }

  void setVedicLevel(String level) {
    _vedicLevel = level;
    _saveState();
    notifyListeners();
  }

  void setDailyHoroscopeNotif(bool enabled) {
    _dailyHoroscopeNotif = enabled;
    _saveState();
    notifyListeners();
  }

  void setMoodRemindersNotif(bool enabled) {
    _moodRemindersNotif = enabled;
    _saveState();
    notifyListeners();
  }

  void toggleAffirmationDone() {
    _markedAffirmationDone = !_markedAffirmationDone;
    notifyListeners();
  }

  // User registration
  Future<void> registerUser({
    required String name,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    _loadingMessage = 'Creating your cosmic account...';
    notifyListeners();

    try {
      final res = await ApiService.signUp(name: name, email: email, password: password);
      if (res['success'] == true) {
        _userId = res['userId'];
        _userName = res['name'] ?? name;
        _userEmail = res['email'] ?? email;
        _isOnboarded = false;
        
        // Pre-fill birth details name
        _birthDetails = BirthDetails(
          name: _userName ?? '',
          dateOfBirth: '',
          timeOfBirth: '',
          placeOfBirth: '',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 'Asia/Kolkata',
          gender: 'male',
          relationshipStatus: 'single',
        );

        _currentView = 'onboarding';
        _onboardingStep = 'birth';
        _saveState();
      } else {
        throw Exception(res['error'] ?? 'Sign up failed');
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString().replaceAll('Exception:', '');
      notifyListeners();
      rethrow;
    }
  }

  // User login
  Future<void> loginUser({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    _loadingMessage = 'Connecting to cosmic logs...';
    notifyListeners();

    try {
      final res = await ApiService.signIn(email: email, password: password);
      if (res['success'] == true) {
        _userId = res['userId'];
        _userName = res['name'];
        _userEmail = res['email'];
        _isOnboarded = res['isOnboarded'] ?? false;

        if (_isOnboarded) {
          // If already onboarded, fetch profile/calculations from server to populate local state
          _updateLoadingMessage('Aligning with your stored stars...');
          final profileRes = await http_get_profile(_userId!);
          if (profileRes != null) {
            // Restore computed data from profile endpoint
            // But wait, the profile endpoint returns basic data. We'll fetch horoscope/transits directly.
            // If we need the full calculations, we'll fetch them.
          }
          _currentView = 'insights';
          _activeTab = 'insights';
        } else {
          _currentView = 'onboarding';
          _onboardingStep = 'birth';
          _birthDetails = BirthDetails(
            name: _userName ?? '',
            dateOfBirth: '',
            timeOfBirth: '',
            placeOfBirth: '',
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata',
            gender: 'male',
            relationshipStatus: 'single',
          );
        }
        _saveState();
        
        // Fetch supplemental details in background
        if (_isOnboarded && _astrologyData != null) {
          fetchDailyHoroscope();
          fetchTransits();
          fetchMoodHistory();
          fetchKundaliScore();
        }
      } else {
        throw Exception(res['error'] ?? 'Sign in failed');
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString().replaceAll('Exception:', '');
      notifyListeners();
      rethrow;
    }
  }

  // Helper helper to load basic profile during login
  Future<Map<String, dynamic>?> http_get_profile(String userId) async {
    return null;
  }

  // Perform backend processing
  Future<void> fetchCalculations() async {
    if (_birthDetails == null) {
      _error = 'Birth details are missing';
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    _loadingMessage = 'Mapping Stars & Aligning Planets...';
    notifyListeners();

    try {
      // Step messages simulated like the Next.js frontend
      _updateLoadingMessage('Analyzing Celestial Coordinates...');
      await Future.delayed(const Duration(milliseconds: 1200));
      _updateLoadingMessage('Computing Numerology Blueprint...');
      await Future.delayed(const Duration(milliseconds: 1000));
      _updateLoadingMessage('Scoring Psychological Traits...');
      
      final results = await ApiService.processAll(
        birthDetails: _birthDetails!,
        answers: _questionnaireAnswers,
        userId: _userId,
      );

      _userId = results['userId'];
      _isOnboarded = true;
      
      if (results['astrology'] != null) {
        _astrologyData = AstrologyInfo.fromJson(results['astrology']);
      }
      if (results['numerology'] != null) {
        _numerologyData = NumerologyInfo.fromJson(results['numerology']);
      }
      if (results['traits'] != null) {
        final List<dynamic> list = results['traits'];
        _traitScores = list.map((e) => TraitScore.fromJson(e)).toList();
      }
      if (results['report'] != null) {
        final report = results['report'];
        if (report['sections'] != null) {
          final List<dynamic> list = report['sections'];
          _reportSections = list.map((e) => ReportSection.fromJson(e)).toList();
        }
        _reportSummary = report['summary'] ?? '';
      }

      _isLoading = false;
      _currentView = 'insights';
      _activeTab = 'insights';
      _saveState();
      
      // Async fetch supplemental dashboard widgets
      fetchDailyHoroscope();
      fetchTransits();
      fetchMoodHistory();
      fetchKundaliScore();
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = e.toString().replaceAll('Exception:', '');
      notifyListeners();
    }
  }

  void _updateLoadingMessage(String msg) {
    _loadingMessage = msg;
    notifyListeners();
  }

  // Fetch Horoscope
  Future<void> fetchDailyHoroscope() async {
    if (_astrologyData == null) return;
    try {
      final data = await ApiService.getDailyHoroscope(
        sunSign: _astrologyData!.sunSign,
        moonSign: _astrologyData!.moonSign,
      );
      _dailyHoroscope = data;
      notifyListeners();
    } catch (e) {
      debugPrint("Error fetching horoscope: $e");
    }
  }

  // Fetch Transits
  Future<void> fetchTransits() async {
    if (_astrologyData == null) return;
    try {
      final data = await ApiService.getCurrentTransits(
        sunSign: _astrologyData!.sunSign,
        moonSign: _astrologyData!.moonSign,
        ascendant: _astrologyData!.ascendant,
      );
      _transits = data;
      notifyListeners();
    } catch (e) {
      debugPrint("Error fetching transits: $e");
    }
  }

  // Send message to Counselor Chat
  Future<void> sendChatMessage(String messageText) async {
    if (messageText.trim().isEmpty) return;
    if (_astrologyData == null || _userId == null) return;

    final userMessage = ChatMessage(
      role: 'user',
      content: messageText,
      timestamp: DateTime.now(),
    );

    _chatMessages.add(userMessage);
    _isChatLoading = true;
    _error = null;
    notifyListeners();

    try {
      final context = {
        'userName': _birthDetails?.name ?? 'Seeker',
        'sunSign': _astrologyData!.sunSign,
        'moonSign': _astrologyData!.moonSign,
        'ascendant': _astrologyData!.ascendant,
        'nakshatra': _astrologyData!.nakshatra,
        'currentDasha': _astrologyData!.currentDasha,
        'yogas': _astrologyData!.yogas,
        'doshas': _astrologyData!.doshas,
        'lifePathNumber': _numerologyData?.lifePathNumber ?? 1,
        'traits': _traitScores.map((s) => {'name': s.name, 'score': s.score}).toList(),
        'relationshipStatus': _birthDetails?.relationshipStatus ?? 'single',
      };

      // Limit history to last 10 messages
      final history = _chatMessages.length > 10 
          ? _chatMessages.sublist(_chatMessages.length - 11, _chatMessages.length - 1)
          : _chatMessages.sublist(0, _chatMessages.length - 1);

      final reply = await ApiService.sendChatMessage(
        message: messageText,
        sessionId: _userId!,
        context: context,
        conversationHistory: history,
      );

      final aiMessage = ChatMessage(
        role: 'assistant',
        content: reply,
        timestamp: DateTime.now(),
      );

      _chatMessages.add(aiMessage);
      _isChatLoading = false;
      _saveState();
      notifyListeners();
    } catch (e) {
      _isChatLoading = false;
      
      // Fallback responses in case LLM service fails
      final fallbacks = [
        "The celestial paths are momentarily obscured, yet your strength is clear. Look inside to find the answers you seek.",
        "A wise seeker listens to the silence between the stars. Rest your mind, and ask me again in a moment.",
        "Your planetary alignments show great inner resilience. Continue your journey with courage.",
        "The Cosmic Counsel is temporarily quiet. Focus on your breath and re-establish your query shortly."
      ];
      final fallbackReply = fallbacks[DateTime.now().second % fallbacks.length];
      
      _chatMessages.add(ChatMessage(
        role: 'assistant',
        content: fallbackReply,
        timestamp: DateTime.now(),
      ));
      
      _error = e.toString().replaceAll('Exception:', '');
      notifyListeners();
    }
  }

  void clearChat() {
    _chatMessages.clear();
    _saveState();
    notifyListeners();
  }

  // Log Mood
  Future<void> addMoodEntry(int mood, String emoji, String? note, List<String> tags) async {
    if (_userId == null) return;
    _isLoading = true;
    notifyListeners();

    try {
      final entry = await ApiService.logMood(
        userId: _userId!,
        mood: mood,
        emoji: emoji,
        note: note,
        tags: tags,
      );
      
      _moodHistory.insert(0, entry);
      _isLoading = false;
      fetchMoodHistory(); // Update stats
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  // Fetch Mood History
  Future<void> fetchMoodHistory() async {
    if (_userId == null) return;
    _isMoodHistoryLoading = true;
    notifyListeners();

    try {
      final data = await ApiService.getMoodHistory(userId: _userId!);
      _moodHistory = data['entries'] as List<MoodEntry>;
      _moodSummary = data['summary'] as MoodHistorySummary;
      _isMoodHistoryLoading = false;
      notifyListeners();
    } catch (e) {
      _isMoodHistoryLoading = false;
      debugPrint("Error loading mood history: $e");
      notifyListeners();
    }
  }

  // Compatibility detailed calculation
  void calculateCompatibility(String partnerName, String partnerSign) {
    _compatPartnerName = partnerName;
    _compatPartnerSign = partnerSign;
    
    // Deterministic matching based on sign elements and qualities
    if (_astrologyData == null) return;

    final mySign = _astrologyData!.moonSign;
    
    // Basic compatibility algorithm replication
    final elementScores = {
      'Fire': ['Aries', 'Leo', 'Sagittarius'],
      'Earth': ['Taurus', 'Virgo', 'Capricorn'],
      'Air': ['Gemini', 'Libra', 'Aquarius'],
      'Water': ['Cancer', 'Scorpio', 'Pisces'],
    };

    String getElement(String sign) {
      for (var entry in elementScores.entries) {
        if (entry.value.contains(sign)) return entry.key;
      }
      return 'Fire';
    }

    final myElement = getElement(mySign);
    final partnerElement = getElement(partnerSign);

    int overall = 50;
    int emotional = 50;
    int communication = 50;
    int trust = 50;

    if (myElement == partnerElement) {
      overall = 85;
      emotional = 90;
      communication = 80;
      trust = 85;
    } else if (
      (myElement == 'Fire' && partnerElement == 'Air') ||
      (myElement == 'Air' && partnerElement == 'Fire') ||
      (myElement == 'Earth' && partnerElement == 'Water') ||
      (myElement == 'Water' && partnerElement == 'Earth')
    ) {
      overall = 78;
      emotional = 75;
      communication = 85;
      trust = 75;
    } else if (
      (myElement == 'Fire' && partnerElement == 'Water') ||
      (myElement == 'Water' && partnerElement == 'Fire') ||
      (myElement == 'Earth' && partnerElement == 'Air') ||
      (myElement == 'Air' && partnerElement == 'Earth')
    ) {
      overall = 42;
      emotional = 35;
      communication = 45;
      trust = 48;
    } else {
      overall = 60;
      emotional = 58;
      communication = 62;
      trust = 60;
    }

    _compatOverallScore = overall;
    _compatEmotionalScore = emotional;
    _compatCommunicationScore = communication;
    _compatTrustScore = trust;

    _saveState();
    notifyListeners();
  }

  // Reset all
  // Fetch Kundali Score
  Future<void> fetchKundaliScore() async {
    if (_astrologyData == null) return;
    _isScoreLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.getKundaliScore(
        userId: _userId,
        sunSign: _astrologyData!.sunSign,
        moonSign: _astrologyData!.moonSign,
        ascendant: _astrologyData!.ascendant,
        planetaryPositions: _astrologyData!.planetaryPositions.map((k, v) => MapEntry(k, v.toJson())),
        yogas: _astrologyData!.yogas,
        doshas: _astrologyData!.doshas,
        nakshatra: _astrologyData!.nakshatra,
      );
      _kundaliScore = data;
      _isScoreLoading = false;
      notifyListeners();
    } catch (e) {
      _isScoreLoading = false;
      debugPrint("Error fetching Kundali score: $e");
      notifyListeners();
    }
  }

  // Fetch Gratitude History
  Future<void> fetchGratitudeHistory() async {
    if (_userId == null) return;
    _isGratitudeHistoryLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await ApiService.getGratitudeHistory(userId: _userId!);
      _gratitudeHistory = res['entries'] as List<GratitudeEntry>;
      _gratitudeStats = res['summary'] as GratitudeStats;
      _isGratitudeHistoryLoading = false;
      notifyListeners();
    } catch (e) {
      _isGratitudeHistoryLoading = false;
      debugPrint("Error fetching gratitude history: $e");
      notifyListeners();
    }
  }

  // Save Gratitude Entry
  Future<void> saveGratitude(String slot, String content) async {
    if (_userId == null) return;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.saveGratitudeEntry(
        userId: _userId!,
        slot: slot,
        content: content,
      );
      _isLoading = false;
      await fetchGratitudeHistory();
    } catch (e) {
      _isLoading = false;
      _error = e.toString();
      debugPrint("Error saving gratitude: $e");
      notifyListeners();
    }
  }

  // Fetch Calendar Events
  Future<void> fetchCalendarEvents(int month, int year) async {
    _isCalendarLoading = true;
    _error = null;
    notifyListeners();

    try {
      final events = await ApiService.getCalendarEvents(month: month, year: year);
      _calendarEvents = events;
      _isCalendarLoading = false;
      notifyListeners();
    } catch (e) {
      _isCalendarLoading = false;
      debugPrint("Error fetching calendar events: $e");
      notifyListeners();
    }
  }

  void reset() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_storageKey);
    } catch (_) {}

    _currentView = 'landing';
    _previousView = null;
    _activeTab = 'insights';
    _onboardingStep = 'birth';
    _userId = null;
    _isOnboarded = false;
    _userEmail = null;
    _userName = null;
    _birthDetails = null;
    _questionnaireAnswers = [];
    _astrologyData = null;
    _numerologyData = null;
    _traitScores = [];
    _reportSections = [];
    _reportSummary = '';
    _hasPaid = false;
    _compatPartnerName = null;
    _compatPartnerSign = null;
    _compatOverallScore = 0;
    _dailyHoroscope = null;
    _transits = [];
    _chatMessages = [];
    _moodHistory = [];
    _moodSummary = null;
    _markedAffirmationDone = false;
    _error = null;
    _isLoading = false;
    _gratitudeHistory = [];
    _gratitudeStats = null;
    _calendarEvents = [];

    notifyListeners();
  }
}
