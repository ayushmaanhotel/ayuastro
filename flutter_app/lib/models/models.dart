class BirthDetails {
  final String name;
  final String dateOfBirth;
  final String timeOfBirth;
  final String placeOfBirth;
  final double latitude;
  final double longitude;
  final String timezone;
  final String gender;
  final String relationshipStatus;

  BirthDetails({
    required this.name,
    required this.dateOfBirth,
    required this.timeOfBirth,
    required this.placeOfBirth,
    required this.latitude,
    required this.longitude,
    required this.timezone,
    required this.gender,
    required this.relationshipStatus,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'dateOfBirth': dateOfBirth,
    'timeOfBirth': timeOfBirth,
    'placeOfBirth': placeOfBirth,
    'latitude': latitude,
    'longitude': longitude,
    'timezone': timezone,
    'gender': gender,
    'relationshipStatus': relationshipStatus,
  };

  factory BirthDetails.fromJson(Map<String, dynamic> json) => BirthDetails(
    name: json['name'] ?? '',
    dateOfBirth: json['dateOfBirth'] ?? '',
    timeOfBirth: json['timeOfBirth'] ?? '',
    placeOfBirth: json['placeOfBirth'] ?? '',
    latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
    longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    timezone: json['timezone'] ?? '',
    gender: json['gender'] ?? '',
    relationshipStatus: json['relationshipStatus'] ?? '',
  );
}

class QuestionnaireAnswer {
  final String questionId;
  final String answer;
  final String category;
  final int score;

  QuestionnaireAnswer({
    required this.questionId,
    required this.answer,
    required this.category,
    required this.score,
  });

  Map<String, dynamic> toJson() => {
    'questionId': questionId,
    'answer': answer,
    'category': category,
    'score': score,
  };

  factory QuestionnaireAnswer.fromJson(Map<String, dynamic> json) => QuestionnaireAnswer(
    questionId: json['questionId'] ?? '',
    answer: json['answer'] ?? '',
    category: json['category'] ?? '',
    score: json['score'] ?? 1,
  );
}

class PlanetaryPositionInfo {
  final String sign;
  final double degree;
  final int house;
  final bool retrograde;
  final String nakshatra;
  final int nakshatraPada;
  final bool isCombust;

  PlanetaryPositionInfo({
    required this.sign,
    required this.degree,
    required this.house,
    required this.retrograde,
    required this.nakshatra,
    required this.nakshatraPada,
    required this.isCombust,
  });

  factory PlanetaryPositionInfo.fromJson(Map<String, dynamic> json) => PlanetaryPositionInfo(
    sign: json['sign'] ?? '',
    degree: (json['degreeInSign'] as num?)?.toDouble() ?? (json['degree'] as num?)?.toDouble() ?? 0.0,
    house: json['house'] ?? 1,
    retrograde: json['isRetrograde'] ?? json['retrograde'] ?? false,
    nakshatra: json['nakshatra'] ?? '',
    nakshatraPada: json['nakshatraPada'] ?? json['pada'] ?? 1,
    isCombust: json['isCombust'] ?? false,
  );

  Map<String, dynamic> toJson() => {
    'sign': sign,
    'degree': degree,
    'house': house,
    'retrograde': retrograde,
    'nakshatra': nakshatra,
    'nakshatraPada': nakshatraPada,
    'isCombust': isCombust,
  };
}

class AstrologyInfo {
  final String sunSign;
  final String moonSign;
  final String ascendant;
  final String nakshatra;
  final String currentDasha;
  final List<String> yogas;
  final List<String> doshas;
  final String calculationMethod;
  final Map<String, PlanetaryPositionInfo> planetaryPositions;

  AstrologyInfo({
    required this.sunSign,
    required this.moonSign,
    required this.ascendant,
    required this.nakshatra,
    required this.currentDasha,
    required this.yogas,
    required this.doshas,
    required this.calculationMethod,
    required this.planetaryPositions,
  });

  factory AstrologyInfo.fromJson(Map<String, dynamic> json) {
    var positionsRaw = json['planetaryPositions'] as Map<String, dynamic>? ?? {};
    Map<String, PlanetaryPositionInfo> positions = {};
    positionsRaw.forEach((key, value) {
      if (value is Map<String, dynamic>) {
        positions[key] = PlanetaryPositionInfo.fromJson(value);
      }
    });

    // nakshatra can be a string or an object {name, pada, ruler, ...}
    String nakshatraName = '';
    if (json['nakshatra'] is String) {
      nakshatraName = json['nakshatra'];
    } else if (json['nakshatra'] is Map) {
      nakshatraName = json['nakshatra']['name'] ?? '';
    }

    // yogas can be a list of strings or a list of objects {name, present, ...}
    List<String> yogasList = [];
    if (json['yogas'] is List) {
      for (final y in json['yogas']) {
        if (y is String) {
          yogasList.add(y);
        } else if (y is Map) {
          if (y['present'] == true || y['present'] == null) {
            yogasList.add(y['name'] ?? '');
          }
        }
      }
    }

    // doshas can be a list of strings or a list of objects {name, present, severity, ...}
    List<String> doshasList = [];
    if (json['doshas'] is List) {
      for (final d in json['doshas']) {
        if (d is String) {
          doshasList.add(d);
        } else if (d is Map) {
          if (d['present'] == true || d['present'] == null) {
            doshasList.add(d['name'] ?? '');
          }
        }
      }
    }

    // currentDasha: extract from dashaPeriods if available
    String currentDasha = '';
    if (json['currentDasha'] is String) {
      currentDasha = json['currentDasha'];
    } else if (json['dashaPeriods'] is Map) {
      final dp = json['dashaPeriods'];
      if (dp['currentMahadasha'] is Map) {
        currentDasha = dp['currentMahadasha']['planet'] ?? '';
        if (dp['currentAntardasha'] is Map) {
          currentDasha += ' / ${dp['currentAntardasha']['planet'] ?? ''}';
        }
      }
    }

    return AstrologyInfo(
      sunSign: json['sunSign'] ?? '',
      moonSign: json['moonSign'] ?? '',
      ascendant: json['ascendant'] ?? '',
      nakshatra: nakshatraName,
      currentDasha: currentDasha,
      yogas: yogasList,
      doshas: doshasList,
      calculationMethod: json['calculationMethod'] ?? 'meeus-fallback',
      planetaryPositions: positions,
    );
  }

  Map<String, dynamic> toJson() => {
    'sunSign': sunSign,
    'moonSign': moonSign,
    'ascendant': ascendant,
    'nakshatra': nakshatra,
    'currentDasha': currentDasha,
    'yogas': yogas,
    'doshas': doshas,
    'calculationMethod': calculationMethod,
    'planetaryPositions': planetaryPositions.map((k, v) => MapEntry(k, v.toJson())),
  };
}

class NumerologyInfo {
  final int lifePathNumber;
  final int destinyNumber;
  final int soulUrgeNumber;
  final int personalityNumber;
  final int birthdayNumber;
  final String lifePathDesc;
  final String destinyDesc;
  final String soulUrgeDesc;
  final String personalityDesc;

  NumerologyInfo({
    required this.lifePathNumber,
    required this.destinyNumber,
    required this.soulUrgeNumber,
    required this.personalityNumber,
    required this.birthdayNumber,
    required this.lifePathDesc,
    required this.destinyDesc,
    required this.soulUrgeDesc,
    required this.personalityDesc,
  });

  factory NumerologyInfo.fromJson(Map<String, dynamic> json) {
    // Descriptions can be flat (lifePathDesc) or nested (descriptions.lifePath)
    final desc = json['descriptions'] as Map<String, dynamic>? ?? {};
    return NumerologyInfo(
      lifePathNumber: json['lifePathNumber'] ?? 1,
      destinyNumber: json['destinyNumber'] ?? 1,
      soulUrgeNumber: json['soulUrgeNumber'] ?? 1,
      personalityNumber: json['personalityNumber'] ?? 1,
      birthdayNumber: json['birthdayNumber'] ?? 1,
      lifePathDesc: json['lifePathDesc'] ?? desc['lifePath'] ?? '',
      destinyDesc: json['destinyDesc'] ?? desc['destiny'] ?? '',
      soulUrgeDesc: json['soulUrgeDesc'] ?? desc['soulUrge'] ?? '',
      personalityDesc: json['personalityDesc'] ?? desc['personality'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'lifePathNumber': lifePathNumber,
    'destinyNumber': destinyNumber,
    'soulUrgeNumber': soulUrgeNumber,
    'personalityNumber': personalityNumber,
    'birthdayNumber': birthdayNumber,
    'lifePathDesc': lifePathDesc,
    'destinyDesc': destinyDesc,
    'soulUrgeDesc': soulUrgeDesc,
    'personalityDesc': personalityDesc,
  };
}

class TraitScore {
  final String name;
  final String label;
  final int score;
  final String description;

  TraitScore({
    required this.name,
    required this.label,
    required this.score,
    required this.description,
  });

  factory TraitScore.fromJson(Map<String, dynamic> json) => TraitScore(
    name: json['name'] ?? json['id'] ?? '',
    label: json['label'] ?? '',
    score: json['score'] ?? 0,
    description: json['description'] ?? '',
  );

  Map<String, dynamic> toJson() => {
    'name': name,
    'label': label,
    'score': score,
    'description': description,
  };
}

class ReportSection {
  final String id;
  final String title;
  final String icon;
  final String content;
  final List<String> traits;
  final String insightLevel; // 'free' | 'premium'

  ReportSection({
    required this.id,
    required this.title,
    required this.icon,
    required this.content,
    required this.traits,
    required this.insightLevel,
  });

  factory ReportSection.fromJson(Map<String, dynamic> json) => ReportSection(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    icon: json['icon'] ?? '',
    content: json['content'] ?? '',
    traits: List<String>.from(json['traits'] ?? []),
    insightLevel: json['insightLevel'] ?? 'free',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'icon': icon,
    'content': content,
    'traits': traits,
    'insightLevel': insightLevel,
  };
}

class MoodEntry {
  final String id;
  final int mood; // 1-5
  final String emoji;
  final String? note;
  final List<String> tags;
  final DateTime createdAt;

  MoodEntry({
    required this.id,
    required this.mood,
    required this.emoji,
    this.note,
    required this.tags,
    required this.createdAt,
  });

  factory MoodEntry.fromJson(Map<String, dynamic> json) {
    List<String> parsedTags = [];
    if (json['tags'] is String) {
      try {
        parsedTags = List<String>.from(
          (json['tags'] as String).replaceAll('[', '').replaceAll(']', '').replaceAll('"', '').split(',').map((e) => e.trim()).where((e) => e.isNotEmpty)
        );
      } catch (_) {}
    } else if (json['tags'] is List) {
      parsedTags = List<String>.from(json['tags']);
    }

    return MoodEntry(
      id: json['id'] ?? '',
      mood: json['mood'] ?? 3,
      emoji: json['emoji'] ?? '😐',
      note: json['note'],
      tags: parsedTags,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'mood': mood,
    'emoji': emoji,
    'note': note,
    'tags': tags,
    'createdAt': createdAt.toIso8601String(),
  };
}

class MoodHistorySummary {
  final double averageMood;
  final String mostCommonEmoji;
  final int streakDays;
  final int totalEntries;

  MoodHistorySummary({
    required this.averageMood,
    required this.mostCommonEmoji,
    required this.streakDays,
    required this.totalEntries,
  });

  factory MoodHistorySummary.fromJson(Map<String, dynamic> json) => MoodHistorySummary(
    averageMood: (json['averageMood'] as num?)?.toDouble() ?? 0.0,
    mostCommonEmoji: json['mostCommonEmoji'] ?? '😐',
    streakDays: json['streakDays'] ?? 0,
    totalEntries: json['totalEntries'] ?? 0,
  );
}

class TransitInfo {
  final String planet;
  final String sign;
  final int house;
  final String effect;
  final String badge;
  final String type; // 'Major' | 'Minor' | 'Shadow'

  TransitInfo({
    required this.planet,
    required this.sign,
    required this.house,
    required this.effect,
    required this.badge,
    required this.type,
  });

  factory TransitInfo.fromJson(Map<String, dynamic> json) => TransitInfo(
    planet: json['planet'] ?? '',
    sign: json['sign'] ?? '',
    house: json['house'] ?? 1,
    effect: json['effect'] ?? '',
    badge: json['badge'] ?? '',
    type: json['type'] ?? 'Minor',
  );
}

class DailyHoroscope {
  final String emotionalEnergy;
  final String focusArea;
  final String guidance;
  final String luckyElement;

  DailyHoroscope({
    required this.emotionalEnergy,
    required this.focusArea,
    required this.guidance,
    required this.luckyElement,
  });

  factory DailyHoroscope.fromJson(Map<String, dynamic> json) => DailyHoroscope(
    emotionalEnergy: json['emotionalEnergy'] ?? '',
    focusArea: json['focusArea'] ?? '',
    guidance: json['guidance'] ?? '',
    luckyElement: json['luckyElement'] ?? '',
  );
}

class ChatMessage {
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'role': role,
    'content': content,
    'timestamp': timestamp.toIso8601String(),
  };

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    role: json['role'] ?? 'user',
    content: json['content'] ?? '',
    timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
  );
}
