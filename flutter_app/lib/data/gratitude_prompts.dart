class GratitudePrompt {
  final String zodiacSign;
  final String slot; // 'morning', 'afternoon', 'evening'
  final String prompt;

  const GratitudePrompt({
    required this.zodiacSign,
    required this.slot,
    required this.prompt,
  });
}

final Map<String, List<GratitudePrompt>> gratitudePrompts = {
  'Aries': [
    GratitudePrompt(zodiacSign: 'Aries', slot: 'morning', prompt: 'What bold action are you grateful you took recently?'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'morning', prompt: 'Name a moment of courage that shaped your day yesterday.'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'afternoon', prompt: 'What energy or drive are you thankful for in your body right now?'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'afternoon', prompt: 'Who challenged you today in a way that made you stronger?'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'evening', prompt: 'What independent choice are you proud of making today?'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'evening', prompt: 'Name one thing that fired up your passion today.'),
    GratitudePrompt(zodiacSign: 'Aries', slot: 'morning', prompt: 'What new beginning are you excited about right now?'),
  ],
  'Taurus': [
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'morning', prompt: 'What sensory pleasure did you enjoy today (taste, touch, sound, smell)?'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'morning', prompt: 'Name something stable and reliable in your life that you cherish.'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'afternoon', prompt: 'What comfort or luxury are you grateful to have in your life?'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'afternoon', prompt: 'Who showed you patience and loyalty recently?'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'evening', prompt: 'What natural beauty did you notice and appreciate today?'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'evening', prompt: 'Name a moment of peace and stillness you experienced today.'),
    GratitudePrompt(zodiacSign: 'Taurus', slot: 'morning', prompt: 'What abundance surrounds you that you often take for granted?'),
  ],
  'Gemini': [
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'morning', prompt: 'What conversation sparked joy or insight for you today?'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'morning', prompt: 'Name something new you learned that excited your mind.'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'afternoon', prompt: 'Who made you laugh today and why are you grateful?'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'afternoon', prompt: 'What connection or friendship enriched your day?'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'evening', prompt: 'What idea or concept are you fascinated by right now?'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'evening', prompt: 'Name a moment of wit or cleverness you are proud of today.'),
    GratitudePrompt(zodiacSign: 'Gemini', slot: 'morning', prompt: 'What variety or change in your routine are you grateful for?'),
  ],
  'Cancer': [
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'morning', prompt: 'Who in your family are you deeply grateful for today?'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'morning', prompt: 'Name a moment of emotional comfort you experienced recently.'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'afternoon', prompt: 'What home or safe space are you thankful to have?'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'afternoon', prompt: 'Who nurtured or cared for you when you needed it?'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'evening', prompt: 'What memory from childhood brings you warmth and gratitude?'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'evening', prompt: 'How did you show kindness to someone today?'),
    GratitudePrompt(zodiacSign: 'Cancer', slot: 'morning', prompt: 'What emotional strength did you discover in yourself recently?'),
  ],
  'Leo': [
    GratitudePrompt(zodiacSign: 'Leo', slot: 'morning', prompt: 'What creative project or idea are you grateful to be working on?'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'morning', prompt: 'Name a moment when someone appreciated your efforts today.'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'afternoon', prompt: 'What joy or fun did you experience today that lit you up?'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'afternoon', prompt: 'Who admired or celebrated you recently?'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'evening', prompt: 'What talent or gift are you thankful to possess?'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'evening', prompt: 'Name a time today when you made someone smile.'),
    GratitudePrompt(zodiacSign: 'Leo', slot: 'morning', prompt: 'What spotlight moment are you proud of from this week?'),
  ],
  'Virgo': [
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'morning', prompt: 'What small detail or system in your life are you grateful works smoothly?'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'morning', prompt: 'Name a skill or ability you improved recently.'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'afternoon', prompt: 'How did being of service to someone bring you satisfaction today?'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'afternoon', prompt: 'What organization or structure in your life brings you peace?'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'evening', prompt: 'What health improvement or wellness habit are you grateful for?'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'evening', prompt: 'Name a constructive critique that helped you grow.'),
    GratitudePrompt(zodiacSign: 'Virgo', slot: 'morning', prompt: 'What routine or daily habit enriches your life the most?'),
  ],
  'Libra': [
    GratitudePrompt(zodiacSign: 'Libra', slot: 'morning', prompt: 'What beautiful thing did you create or appreciate today?'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'morning', prompt: 'Name a harmonious moment in your relationships.'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'afternoon', prompt: 'Who brought balance or fairness into your life recently?'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'afternoon', prompt: 'What partnership or collaboration are you grateful for?'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'evening', prompt: 'What piece of art, music, or beauty inspired you today?'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'evening', prompt: 'How did you create peace or resolve a conflict today?'),
    GratitudePrompt(zodiacSign: 'Libra', slot: 'morning', prompt: 'What choice are you glad you made for the sake of balance?'),
  ],
  'Scorpio': [
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'morning', prompt: 'What transformation or change are you grateful to have experienced?'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'morning', prompt: 'Name a deep connection that enriches your soul.'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'afternoon', prompt: 'What hidden truth or insight did you uncover recently?'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'afternoon', prompt: 'Who trusts you completely, and what does that mean to you?'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'evening', prompt: 'What fear did you face or overcome recently?'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'evening', prompt: 'Name a moment of emotional intensity that led to growth.'),
    GratitudePrompt(zodiacSign: 'Scorpio', slot: 'morning', prompt: 'What power or resilience do you carry that you are grateful for?'),
  ],
  'Sagittarius': [
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'morning', prompt: 'What adventure or new experience are you grateful for?'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'morning', prompt: 'Name a piece of wisdom you gained recently.'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'afternoon', prompt: 'What freedom in your life are you most thankful for?'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'afternoon', prompt: 'Who inspired your philosophical or spiritual growth?'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'evening', prompt: 'What optimism or hope are you holding onto right now?'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'evening', prompt: 'Name a culture, tradition, or belief system you are grateful to know.'),
    GratitudePrompt(zodiacSign: 'Sagittarius', slot: 'morning', prompt: 'What teaching or mentorship enriched your life this week?'),
  ],
  'Capricorn': [
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'morning', prompt: 'What goal or milestone did you achieve that you are proud of?'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'morning', prompt: 'Name a discipline or habit that serves you well.'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'afternoon', prompt: 'What professional accomplishment are you grateful for?'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'afternoon', prompt: 'Who mentored or guided you toward success recently?'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'evening', prompt: 'What responsibility do you carry that makes you feel strong?'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'evening', prompt: 'Name a moment of perseverance that paid off.'),
    GratitudePrompt(zodiacSign: 'Capricorn', slot: 'morning', prompt: 'What legacy or structure are you building that you are thankful for?'),
  ],
  'Aquarius': [
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'morning', prompt: 'What innovation or idea are you excited to be part of?'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'morning', prompt: 'Name a community or group that supports your vision.'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'afternoon', prompt: 'What cause or humanitarian effort are you grateful to contribute to?'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'afternoon', prompt: 'Who accepted you for your unique self recently?'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'evening', prompt: 'What progressive change are you witnessing that gives you hope?'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'evening', prompt: 'Name a moment of creative originality you experienced today.'),
    GratitudePrompt(zodiacSign: 'Aquarius', slot: 'morning', prompt: 'What friendship or alliance are you deeply grateful for?'),
  ],
  'Pisces': [
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'morning', prompt: 'What dream or creative vision are you nurturing with gratitude?'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'morning', prompt: 'Name a moment of spiritual or emotional connection today.'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'afternoon', prompt: 'What act of compassion did you witness or perform today?'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'afternoon', prompt: 'Who showed you unconditional love recently?'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'evening', prompt: 'What music, art, or beauty moved your soul today?'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'evening', prompt: 'Name a moment of intuition that served you well.'),
    GratitudePrompt(zodiacSign: 'Pisces', slot: 'morning', prompt: 'What mystical or synchronistic event are you grateful for?'),
  ],
};

List<GratitudePrompt> getPromptsForSign(String sign, String slot) {
  return gratitudePrompts[sign]?.where((p) => p.slot == slot).toList() ?? [];
}

GratitudePrompt? getDailyPrompt(String sign, String slot, DateTime date) {
  final prompts = getPromptsForSign(sign, slot);
  if (prompts.isEmpty) return null;
  final index = date.day % prompts.length;
  return prompts[index];
}
