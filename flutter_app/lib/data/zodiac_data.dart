class EmotionalTrait {
  final String name;
  final int score;
  const EmotionalTrait({required this.name, required this.score});
}

class CareerField {
  final String emoji;
  final String field;
  const CareerField({required this.emoji, required this.field});
}

class BestMatch {
  final String sign;
  final String symbol;
  const BestMatch({required this.sign, required this.symbol});
}

class ZodiacSignData {
  final String symbol;
  final String name;
  final String abbr;
  final String dateRange;
  final String element;
  final String modality;
  final String ruler;
  final String rulerSymbol;
  final String quality;
  final List<EmotionalTrait> emotionalTraits;
  final List<BestMatch> bestMatches;
  final List<String> relationshipStrengths;
  final List<String> relationshipGrowthAreas;
  final String loveLanguage;
  final List<CareerField> careerFields;
  final String workStyle;
  final String leadershipStyle;
  final String lifeLesson;
  final String spiritualPractice;
  final String affirmation;

  const ZodiacSignData({
    required this.symbol,
    required this.name,
    required this.abbr,
    required this.dateRange,
    required this.element,
    required this.modality,
    required this.ruler,
    required this.rulerSymbol,
    required this.quality,
    required this.emotionalTraits,
    required this.bestMatches,
    required this.relationshipStrengths,
    required this.relationshipGrowthAreas,
    required this.loveLanguage,
    required this.careerFields,
    required this.workStyle,
    required this.leadershipStyle,
    required this.lifeLesson,
    required this.spiritualPractice,
    required this.affirmation,
  });
}

const Map<String, String> zodiacSymbols = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
};

const Map<String, String> zodiacElements = {
  'Aries': 'Fire', 'Taurus': 'Earth', 'Gemini': 'Air', 'Cancer': 'Water',
  'Leo': 'Fire', 'Virgo': 'Earth', 'Libra': 'Air', 'Scorpio': 'Water',
  'Sagittarius': 'Fire', 'Capricorn': 'Earth', 'Aquarius': 'Air', 'Pisces': 'Water',
};

const Map<String, String> planetSymbols = {
  'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿',
  'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄', 'Rahu': '☊', 'Ketu': '☋',
};

final Map<String, ZodiacSignData> zodiacData = {
  'Aries': const ZodiacSignData(
    symbol: '♈', name: 'Aries', abbr: 'Ari',
    dateRange: 'Mar 21 – Apr 19', element: 'Fire', modality: 'Cardinal',
    ruler: 'Mars', rulerSymbol: '♂', quality: '🔥 The Pioneer',
    emotionalTraits: [
      EmotionalTrait(name: 'Courage', score: 92),
      EmotionalTrait(name: 'Passion', score: 88),
      EmotionalTrait(name: 'Impatience', score: 75),
      EmotionalTrait(name: 'Independence', score: 85),
      EmotionalTrait(name: 'Leadership', score: 80),
      EmotionalTrait(name: 'Competitiveness', score: 78),
    ],
    bestMatches: [
      BestMatch(sign: 'Leo', symbol: '♌'),
      BestMatch(sign: 'Sagittarius', symbol: '♐'),
      BestMatch(sign: 'Gemini', symbol: '♊'),
    ],
    relationshipStrengths: [
      'Brings fearless authenticity and excitement to relationships',
      'Naturally protective and fiercely loyal once committed',
    ],
    relationshipGrowthAreas: [
      'Learning patience and allowing emotional pace to match the partner',
      'Balancing independence with emotional availability',
    ],
    loveLanguage: 'Acts of Service — showing love through bold, decisive action',
    careerFields: [
      CareerField(emoji: '⚔️', field: 'Military & Defense'),
      CareerField(emoji: '🏃', field: 'Sports & Athletics'),
      CareerField(emoji: '🚀', field: 'Entrepreneurship'),
      CareerField(emoji: '🏥', field: 'Emergency Medicine'),
      CareerField(emoji: '📢', field: 'Sales & Marketing'),
    ],
    workStyle: 'Thrives in fast-paced, competitive environments where initiative is rewarded.',
    leadershipStyle: 'Bold and inspiring — leads from the front, sets the pace.',
    lifeLesson: 'To learn that true strength includes the courage to be vulnerable.',
    spiritualPractice: 'Dynamic meditation or martial arts — channeling fiery energy into disciplined movement.',
    affirmation: 'I honor my fire by choosing where to direct it.',
  ),
  'Taurus': const ZodiacSignData(
    symbol: '♉', name: 'Taurus', abbr: 'Tau',
    dateRange: 'Apr 20 – May 20', element: 'Earth', modality: 'Fixed',
    ruler: 'Venus', rulerSymbol: '♀', quality: '🌿 The Builder',
    emotionalTraits: [
      EmotionalTrait(name: 'Patience', score: 90),
      EmotionalTrait(name: 'Loyalty', score: 94),
      EmotionalTrait(name: 'Sensuality', score: 85),
      EmotionalTrait(name: 'Stubbornness', score: 80),
      EmotionalTrait(name: 'Stability', score: 92),
      EmotionalTrait(name: 'Practicality', score: 88),
    ],
    bestMatches: [
      BestMatch(sign: 'Virgo', symbol: '♍'),
      BestMatch(sign: 'Capricorn', symbol: '♑'),
      BestMatch(sign: 'Cancer', symbol: '♋'),
    ],
    relationshipStrengths: [
      'Offers unwavering dependability and creates a sanctuary of comfort',
      'Deeply affectionate and attuned to physical expressions of love',
    ],
    relationshipGrowthAreas: [
      'Releasing rigidity when life demands adaptability',
      'Learning that change can bring beauty, not just disruption',
    ],
    loveLanguage: 'Physical Touch & Quality Time — expressing devotion through presence',
    careerFields: [
      CareerField(emoji: '🏦', field: 'Finance & Banking'),
      CareerField(emoji: '🎨', field: 'Art & Design'),
      CareerField(emoji: '🍽️', field: 'Culinary Arts'),
      CareerField(emoji: '🏡', field: 'Real Estate'),
      CareerField(emoji: '🎶', field: 'Music & Performance'),
    ],
    workStyle: 'Methodical and thorough — builds lasting structures with patience.',
    leadershipStyle: 'Steady and reliable — leads by example with quiet consistency.',
    lifeLesson: 'True security comes from within, not from external possessions.',
    spiritualPractice: 'Nature immersion and sensory meditation.',
    affirmation: 'My need for stability is not stubbornness — it is wisdom.',
  ),
  'Gemini': const ZodiacSignData(
    symbol: '♊', name: 'Gemini', abbr: 'Gem',
    dateRange: 'May 21 – Jun 20', element: 'Air', modality: 'Mutable',
    ruler: 'Mercury', rulerSymbol: '☿', quality: '💬 The Communicator',
    emotionalTraits: [
      EmotionalTrait(name: 'Adaptability', score: 92),
      EmotionalTrait(name: 'Curiosity', score: 90),
      EmotionalTrait(name: 'Restlessness', score: 78),
      EmotionalTrait(name: 'Wit', score: 88),
      EmotionalTrait(name: 'Sociability', score: 85),
      EmotionalTrait(name: 'Versatility', score: 86),
    ],
    bestMatches: [
      BestMatch(sign: 'Libra', symbol: '♎'),
      BestMatch(sign: 'Aquarius', symbol: '♒'),
      BestMatch(sign: 'Aries', symbol: '♈'),
    ],
    relationshipStrengths: [
      'Keeps relationships alive with intellectual stimulation',
      'Adapts easily to partner needs and communicates openly',
    ],
    relationshipGrowthAreas: [
      'Deepening emotional presence beyond surface exchanges',
      'Committing fully without fear of missing alternatives',
    ],
    loveLanguage: 'Words of Affirmation — connecting through meaningful conversation',
    careerFields: [
      CareerField(emoji: '✍️', field: 'Writing & Journalism'),
      CareerField(emoji: '📱', field: 'Social Media'),
      CareerField(emoji: '🎙️', field: 'Broadcasting'),
      CareerField(emoji: '🧑‍💼', field: 'Public Relations'),
      CareerField(emoji: '🧑‍🏫', field: 'Teaching'),
    ],
    workStyle: 'Multi-tasking genius — juggles many projects with mental agility.',
    leadershipStyle: 'Communicative and networked — connects people and ideas.',
    lifeLesson: 'Depth is as valuable as breadth — go deep as well as wide.',
    spiritualPractice: 'Journaling meditation — writing thoughts to find inner truth.',
    affirmation: 'My curiosity is my superpower when I choose where to aim it.',
  ),
  'Cancer': const ZodiacSignData(
    symbol: '♋', name: 'Cancer', abbr: 'Can',
    dateRange: 'Jun 21 – Jul 22', element: 'Water', modality: 'Cardinal',
    ruler: 'Moon', rulerSymbol: '☽', quality: '🌊 The Nurturer',
    emotionalTraits: [
      EmotionalTrait(name: 'Empathy', score: 95),
      EmotionalTrait(name: 'Intuition', score: 92),
      EmotionalTrait(name: 'Sensitivity', score: 88),
      EmotionalTrait(name: 'Protectiveness', score: 90),
      EmotionalTrait(name: 'Moodiness', score: 72),
      EmotionalTrait(name: 'Devotion', score: 94),
    ],
    bestMatches: [
      BestMatch(sign: 'Scorpio', symbol: '♏'),
      BestMatch(sign: 'Pisces', symbol: '♓'),
      BestMatch(sign: 'Taurus', symbol: '♉'),
    ],
    relationshipStrengths: [
      'Creates deep emotional safety for loved ones',
      'Remembers every meaningful detail about their partner',
    ],
    relationshipGrowthAreas: [
      'Letting go of past hurts to be fully present',
      'Expressing needs directly rather than hinting',
    ],
    loveLanguage: 'Acts of Care — nurturing through cooking, comfort, and presence',
    careerFields: [
      CareerField(emoji: '🏥', field: 'Healthcare & Nursing'),
      CareerField(emoji: '👶', field: 'Childcare & Education'),
      CareerField(emoji: '🏡', field: 'Interior Design'),
      CareerField(emoji: '🍳', field: 'Food & Hospitality'),
      CareerField(emoji: '💆', field: 'Counseling & Therapy'),
    ],
    workStyle: 'Emotionally intelligent and team-oriented — creates harmony at work.',
    leadershipStyle: 'Nurturing — protects their team and builds loyalty through care.',
    lifeLesson: 'True nurturing includes nurturing yourself first.',
    spiritualPractice: 'Moon gazing and water meditation.',
    affirmation: 'My sensitivity is my greatest strength, not my weakness.',
  ),
  'Leo': const ZodiacSignData(
    symbol: '♌', name: 'Leo', abbr: 'Leo',
    dateRange: 'Jul 23 – Aug 22', element: 'Fire', modality: 'Fixed',
    ruler: 'Sun', rulerSymbol: '☉', quality: '👑 The Performer',
    emotionalTraits: [
      EmotionalTrait(name: 'Generosity', score: 92),
      EmotionalTrait(name: 'Confidence', score: 90),
      EmotionalTrait(name: 'Creativity', score: 88),
      EmotionalTrait(name: 'Pride', score: 75),
      EmotionalTrait(name: 'Warmth', score: 94),
      EmotionalTrait(name: 'Dramatic Flair', score: 82),
    ],
    bestMatches: [
      BestMatch(sign: 'Aries', symbol: '♈'),
      BestMatch(sign: 'Sagittarius', symbol: '♐'),
      BestMatch(sign: 'Libra', symbol: '♎'),
    ],
    relationshipStrengths: [
      'Makes partners feel like the center of the universe',
      'Brings fun, adventure, and grand romantic gestures',
    ],
    relationshipGrowthAreas: [
      'Sharing the spotlight and celebrating partner equally',
      'Accepting constructive feedback with grace',
    ],
    loveLanguage: 'Receiving Appreciation — feeling seen and valued for who they are',
    careerFields: [
      CareerField(emoji: '🎭', field: 'Entertainment & Arts'),
      CareerField(emoji: '👔', field: 'Executive Leadership'),
      CareerField(emoji: '🎬', field: 'Film & Media'),
      CareerField(emoji: '💍', field: 'Luxury & Fashion'),
      CareerField(emoji: '🎤', field: 'Public Speaking'),
    ],
    workStyle: 'Commands attention and inspires teams with natural charisma.',
    leadershipStyle: 'Charismatic — leads with warmth, vision, and inspires devotion.',
    lifeLesson: 'True royalty is found in humility and service to others.',
    spiritualPractice: 'Heart-centered meditation — opening to give and receive love.',
    affirmation: 'I shine brightest when I help others find their light.',
  ),
  'Virgo': const ZodiacSignData(
    symbol: '♍', name: 'Virgo', abbr: 'Vir',
    dateRange: 'Aug 23 – Sep 22', element: 'Earth', modality: 'Mutable',
    ruler: 'Mercury', rulerSymbol: '☿', quality: '🔍 The Analyst',
    emotionalTraits: [
      EmotionalTrait(name: 'Precision', score: 94),
      EmotionalTrait(name: 'Helpfulness', score: 90),
      EmotionalTrait(name: 'Self-Criticism', score: 78),
      EmotionalTrait(name: 'Reliability', score: 92),
      EmotionalTrait(name: 'Modesty', score: 85),
      EmotionalTrait(name: 'Analytical Mind', score: 95),
    ],
    bestMatches: [
      BestMatch(sign: 'Taurus', symbol: '♉'),
      BestMatch(sign: 'Capricorn', symbol: '♑'),
      BestMatch(sign: 'Cancer', symbol: '♋'),
    ],
    relationshipStrengths: [
      'Shows love through practical acts of service and attention to detail',
      'Creates order and stability that makes others feel supported',
    ],
    relationshipGrowthAreas: [
      'Accepting imperfection in self and partner',
      'Expressing emotions without overanalyzing them',
    ],
    loveLanguage: 'Acts of Service — love expressed through helpful, thoughtful actions',
    careerFields: [
      CareerField(emoji: '🏥', field: 'Healthcare & Research'),
      CareerField(emoji: '📊', field: 'Data Analysis'),
      CareerField(emoji: '✍️', field: 'Editing & Writing'),
      CareerField(emoji: '🧪', field: 'Science & Lab Work'),
      CareerField(emoji: '🌿', field: 'Nutrition & Wellness'),
    ],
    workStyle: 'Detail-oriented perfectionist who improves every system they touch.',
    leadershipStyle: 'Service-oriented — leads by organizing, improving, and supporting.',
    lifeLesson: 'Perfection is the enemy of good — embrace wholeness over flawlessness.',
    spiritualPractice: 'Mindful organization — finding meditation in methodical tasks.',
    affirmation: 'I am enough exactly as I am, imperfections and all.',
  ),
  'Libra': const ZodiacSignData(
    symbol: '♎', name: 'Libra', abbr: 'Lib',
    dateRange: 'Sep 23 – Oct 22', element: 'Air', modality: 'Cardinal',
    ruler: 'Venus', rulerSymbol: '♀', quality: '⚖️ The Harmonizer',
    emotionalTraits: [
      EmotionalTrait(name: 'Diplomacy', score: 94),
      EmotionalTrait(name: 'Fairness', score: 90),
      EmotionalTrait(name: 'Indecision', score: 72),
      EmotionalTrait(name: 'Grace', score: 88),
      EmotionalTrait(name: 'Charm', score: 92),
      EmotionalTrait(name: 'Idealism', score: 80),
    ],
    bestMatches: [
      BestMatch(sign: 'Gemini', symbol: '♊'),
      BestMatch(sign: 'Aquarius', symbol: '♒'),
      BestMatch(sign: 'Leo', symbol: '♌'),
    ],
    relationshipStrengths: [
      'Creates beauty and balance in every relationship',
      'Natural mediator who resolves conflicts with grace',
    ],
    relationshipGrowthAreas: [
      'Making decisions without seeking external validation',
      'Expressing true feelings instead of keeping peace at all costs',
    ],
    loveLanguage: 'Quality Time — shared beauty, culture, and meaningful experiences',
    careerFields: [
      CareerField(emoji: '⚖️', field: 'Law & Justice'),
      CareerField(emoji: '🎨', field: 'Design & Aesthetics'),
      CareerField(emoji: '🤝', field: 'Diplomacy & Mediation'),
      CareerField(emoji: '💄', field: 'Fashion & Beauty'),
      CareerField(emoji: '🎵', field: 'Music & Arts'),
    ],
    workStyle: 'Collaborative and aesthetic — makes any environment more beautiful.',
    leadershipStyle: 'Diplomatic — builds consensus and finds the fairest path forward.',
    lifeLesson: 'Balance includes choosing yourself, even when it displeases others.',
    spiritualPractice: 'Beauty meditation — finding the divine in art, music, and nature.',
    affirmation: 'My peace does not depend on everyone else being happy.',
  ),
  'Scorpio': const ZodiacSignData(
    symbol: '♏', name: 'Scorpio', abbr: 'Sco',
    dateRange: 'Oct 23 – Nov 21', element: 'Water', modality: 'Fixed',
    ruler: 'Mars', rulerSymbol: '♂', quality: '🦂 The Transformer',
    emotionalTraits: [
      EmotionalTrait(name: 'Intensity', score: 96),
      EmotionalTrait(name: 'Depth', score: 94),
      EmotionalTrait(name: 'Jealousy', score: 72),
      EmotionalTrait(name: 'Resilience', score: 92),
      EmotionalTrait(name: 'Passion', score: 95),
      EmotionalTrait(name: 'Intuition', score: 90),
    ],
    bestMatches: [
      BestMatch(sign: 'Cancer', symbol: '♋'),
      BestMatch(sign: 'Pisces', symbol: '♓'),
      BestMatch(sign: 'Virgo', symbol: '♍'),
    ],
    relationshipStrengths: [
      'Loves with unmatched depth, loyalty, and transformative power',
      'Understands partner on a soul level beyond surface behavior',
    ],
    relationshipGrowthAreas: [
      'Letting go of control and trusting without proof',
      'Expressing vulnerability without fear of betrayal',
    ],
    loveLanguage: 'Deep Emotional Intimacy — soul-to-soul connection beyond words',
    careerFields: [
      CareerField(emoji: '🔬', field: 'Research & Investigation'),
      CareerField(emoji: '🧬', field: 'Psychology & Psychiatry'),
      CareerField(emoji: '💰', field: 'Finance & Investments'),
      CareerField(emoji: '🕵️', field: 'Detective & Forensics'),
      CareerField(emoji: '⚕️', field: 'Surgery & Medicine'),
    ],
    workStyle: 'Deeply focused — goes beneath the surface to find the real truth.',
    leadershipStyle: 'Strategic and transformative — rebuilds broken systems.',
    lifeLesson: 'Trust is built in vulnerability, not in control.',
    spiritualPractice: 'Shadow work meditation — facing inner darkness to find light.',
    affirmation: 'I transform my pain into power and my wounds into wisdom.',
  ),
  'Sagittarius': const ZodiacSignData(
    symbol: '♐', name: 'Sagittarius', abbr: 'Sag',
    dateRange: 'Nov 22 – Dec 21', element: 'Fire', modality: 'Mutable',
    ruler: 'Jupiter', rulerSymbol: '♃', quality: '🏹 The Explorer',
    emotionalTraits: [
      EmotionalTrait(name: 'Optimism', score: 94),
      EmotionalTrait(name: 'Freedom', score: 92),
      EmotionalTrait(name: 'Bluntness', score: 75),
      EmotionalTrait(name: 'Adventure', score: 90),
      EmotionalTrait(name: 'Philosophy', score: 85),
      EmotionalTrait(name: 'Humor', score: 88),
    ],
    bestMatches: [
      BestMatch(sign: 'Aries', symbol: '♈'),
      BestMatch(sign: 'Leo', symbol: '♌'),
      BestMatch(sign: 'Aquarius', symbol: '♒'),
    ],
    relationshipStrengths: [
      'Makes life an adventure — brings joy, laughter, and growth',
      'Inspires partners to dream bigger and explore more',
    ],
    relationshipGrowthAreas: [
      'Staying present instead of always looking toward the next horizon',
      'Tempering honesty with emotional sensitivity',
    ],
    loveLanguage: 'Shared Adventures — exploring the world and ideas together',
    careerFields: [
      CareerField(emoji: '✈️', field: 'Travel & Tourism'),
      CareerField(emoji: '📚', field: 'Education & Teaching'),
      CareerField(emoji: '📰', field: 'Publishing & Writing'),
      CareerField(emoji: '⚖️', field: 'Law & Philosophy'),
      CareerField(emoji: '🏔️', field: 'Outdoor & Sports'),
    ],
    workStyle: 'Visionary and expansive — sees the big picture and inspires teams.',
    leadershipStyle: 'Inspirational — leads by sharing vision and creating meaning.',
    lifeLesson: 'The greatest journey is inward — explore your own depths.',
    spiritualPractice: 'Pilgrimage meditation — finding the sacred in every journey.',
    affirmation: 'I find freedom not by running from, but by deeply committing to.',
  ),
  'Capricorn': const ZodiacSignData(
    symbol: '♑', name: 'Capricorn', abbr: 'Cap',
    dateRange: 'Dec 22 – Jan 19', element: 'Earth', modality: 'Cardinal',
    ruler: 'Saturn', rulerSymbol: '♄', quality: '🏔️ The Achiever',
    emotionalTraits: [
      EmotionalTrait(name: 'Discipline', score: 95),
      EmotionalTrait(name: 'Ambition', score: 94),
      EmotionalTrait(name: 'Coldness', score: 68),
      EmotionalTrait(name: 'Responsibility', score: 92),
      EmotionalTrait(name: 'Perseverance', score: 96),
      EmotionalTrait(name: 'Wisdom', score: 88),
    ],
    bestMatches: [
      BestMatch(sign: 'Taurus', symbol: '♉'),
      BestMatch(sign: 'Virgo', symbol: '♍'),
      BestMatch(sign: 'Scorpio', symbol: '♏'),
    ],
    relationshipStrengths: [
      'Provides rock-solid stability and long-term commitment',
      'Shows love through dedication, provision, and protection',
    ],
    relationshipGrowthAreas: [
      'Allowing emotional expression without seeing it as weakness',
      'Making time for play and lightness amidst ambition',
    ],
    loveLanguage: 'Commitment & Provision — building a secure future together',
    careerFields: [
      CareerField(emoji: '🏛️', field: 'Government & Politics'),
      CareerField(emoji: '🏗️', field: 'Engineering & Architecture'),
      CareerField(emoji: '💼', field: 'Corporate Management'),
      CareerField(emoji: '🏦', field: 'Banking & Finance'),
      CareerField(emoji: '⚖️', field: 'Law & Administration'),
    ],
    workStyle: 'Structured and goal-oriented — climbs steadily to the top.',
    leadershipStyle: 'Authoritative — leads through competence, structure, and results.',
    lifeLesson: 'Success without joy is not success — let warmth in.',
    spiritualPractice: 'Mountain meditation — finding stillness in disciplined practice.',
    affirmation: 'I am more than my achievements — I am worthy just being.',
  ),
  'Aquarius': const ZodiacSignData(
    symbol: '♒', name: 'Aquarius', abbr: 'Aqu',
    dateRange: 'Jan 20 – Feb 18', element: 'Air', modality: 'Fixed',
    ruler: 'Saturn', rulerSymbol: '♄', quality: '⚡ The Visionary',
    emotionalTraits: [
      EmotionalTrait(name: 'Innovation', score: 94),
      EmotionalTrait(name: 'Humanitarianism', score: 90),
      EmotionalTrait(name: 'Detachment', score: 75),
      EmotionalTrait(name: 'Originality', score: 92),
      EmotionalTrait(name: 'Rebellion', score: 80),
      EmotionalTrait(name: 'Idealism', score: 88),
    ],
    bestMatches: [
      BestMatch(sign: 'Gemini', symbol: '♊'),
      BestMatch(sign: 'Libra', symbol: '♎'),
      BestMatch(sign: 'Sagittarius', symbol: '♐'),
    ],
    relationshipStrengths: [
      'Respects individuality and gives freedom to partners',
      'Brings unique perspective and intellectual excitement',
    ],
    relationshipGrowthAreas: [
      'Moving from intellectual love to emotional warmth',
      'Being present in the moment rather than future-gazing',
    ],
    loveLanguage: 'Intellectual Connection — sharing ideas and supporting causes together',
    careerFields: [
      CareerField(emoji: '💻', field: 'Technology & Innovation'),
      CareerField(emoji: '🔬', field: 'Science & Research'),
      CareerField(emoji: '🌍', field: 'Humanitarian Work'),
      CareerField(emoji: '🚀', field: 'Space & Aerospace'),
      CareerField(emoji: '📡', field: 'Communications & Media'),
    ],
    workStyle: 'Innovative and independent — works best on cutting-edge projects.',
    leadershipStyle: 'Visionary — leads by showing a better future and challenging norms.',
    lifeLesson: 'Connection requires vulnerability — let people in close.',
    spiritualPractice: 'Group meditation — finding unity while honoring individuality.',
    affirmation: 'I can change the world and still let someone love me deeply.',
  ),
  'Pisces': const ZodiacSignData(
    symbol: '♓', name: 'Pisces', abbr: 'Pis',
    dateRange: 'Feb 19 – Mar 20', element: 'Water', modality: 'Mutable',
    ruler: 'Jupiter', rulerSymbol: '♃', quality: '🌊 The Mystic',
    emotionalTraits: [
      EmotionalTrait(name: 'Empathy', score: 96),
      EmotionalTrait(name: 'Imagination', score: 94),
      EmotionalTrait(name: 'Escapism', score: 72),
      EmotionalTrait(name: 'Compassion', score: 95),
      EmotionalTrait(name: 'Intuition', score: 93),
      EmotionalTrait(name: 'Dreaminess', score: 88),
    ],
    bestMatches: [
      BestMatch(sign: 'Cancer', symbol: '♋'),
      BestMatch(sign: 'Scorpio', symbol: '♏'),
      BestMatch(sign: 'Taurus', symbol: '♉'),
    ],
    relationshipStrengths: [
      'Loves unconditionally with a depth that heals others',
      'Naturally attuned to partner emotional needs without words',
    ],
    relationshipGrowthAreas: [
      'Setting healthy boundaries instead of absorbing pain',
      'Staying grounded in reality while honoring dreams',
    ],
    loveLanguage: 'Emotional Presence — deep listening and spiritual union',
    careerFields: [
      CareerField(emoji: '🎨', field: 'Art & Creative Arts'),
      CareerField(emoji: '🧘', field: 'Healing & Spirituality'),
      CareerField(emoji: '🎵', field: 'Music & Dance'),
      CareerField(emoji: '📸', field: 'Photography & Film'),
      CareerField(emoji: '💆', field: 'Therapy & Counseling'),
    ],
    workStyle: 'Creative and empathic — brings imagination and heart to every project.',
    leadershipStyle: 'Compassionate — leads by seeing and nurturing the best in others.',
    lifeLesson: 'Your sensitivity is a gift — learn to protect it, not numb it.',
    spiritualPractice: 'Ocean meditation — dissolving boundaries to feel universal oneness.',
    affirmation: 'I am not too sensitive — the world needs more of what I feel.',
  ),
};
