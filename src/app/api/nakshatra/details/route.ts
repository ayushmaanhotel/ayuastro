import { NextResponse } from 'next/server';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface NakshatraDetail {
  name: string;
  symbol: string;
  symbolMeaning: string;
  rulingDeity: string;
  deityDescription: string;
  rulingPlanet: string;
  rulingPlanetSymbol: string;
  element: string;
  gana: string;
  padaDescriptions: [string, string, string, string];
  personality: {
    emotionalTendencies: string;
    strengths: string[];
    growthAreas: string[];
    mentalTendencies: string;
  };
  relationships: {
    approach: string;
    compatibility: string;
    emotionalNeeds: string;
  };
  career: {
    naturalTalents: string[];
    bestCareers: string[];
    lifeLessons: string;
    karmicThemes: string;
  };
  spiritual: {
    mantra: string;
    practices: string[];
    meditationFocus: string;
  };
}

// ─── All 27 Nakshatras Data ──────────────────────────────────────────────────

const NAKSHATRA_DATA: Record<string, NakshatraDetail> = {
  Ashwini: {
    name: 'Ashwini',
    symbol: '🐎',
    symbolMeaning: 'Horse Head — symbolizing swiftness, pioneering energy, and the urge to move forward',
    rulingDeity: 'Ashwini Kumaras',
    deityDescription: 'The celestial twin healers of Vedic mythology, known as the physicians of the gods. They represent the power to heal, restore, and initiate new beginnings with divine speed.',
    rulingPlanet: 'Ketu',
    rulingPlanetSymbol: '☊',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Aries): Bold pioneer energy, fiercely independent with a natural urge to lead and initiate',
      'Pada 2 (Aries): Action-oriented healer, combines courage with compassion in service of others',
      'Pada 3 (Aries): Intellectually curious explorer, seeks knowledge through direct experience',
      'Pada 4 (Aries): Spiritual warrior, channels restless energy into purposeful transformation',
    ],
    personality: {
      emotionalTendencies: 'Quick-moving emotions that shift rapidly — you feel deeply but process experiences at remarkable speed. There is an inherent restlessness that drives you toward constant renewal and fresh beginnings.',
      strengths: ['Swift decision-making and initiative', 'Natural healing presence and vitality', 'Courage to start anew without fear', 'Infectious enthusiasm that inspires others'],
      growthAreas: ['Patience with emotional processing and others\' pace', 'Following through on commitments beyond initial excitement', 'Balancing independence with emotional vulnerability', 'Developing comfort with stillness and reflection'],
      mentalTendencies: 'Your mind moves like quicksilver — fast, sharp, and always seeking the next frontier. You think in terms of possibilities and solutions rather than problems.',
    },
    relationships: {
      approach: 'You approach love with the same pioneering spirit you bring to everything — boldly, directly, and with infectious enthusiasm.',
      compatibility: 'Best compatibility with Hasta, Shravana, and Rohini nakshatras. You need a partner who appreciates your need for freedom while providing grounding stability.',
      emotionalNeeds: 'Freedom to explore and grow within the relationship, spontaneity and adventure, a partner who respects your independence while being emotionally present.',
    },
    career: {
      naturalTalents: ['Healing and medicine', 'Quick problem-solving', 'Leadership in crisis situations', 'Entrepreneurial vision'],
      bestCareers: ['Emergency medicine & surgery', 'Entrepreneurship & startups', 'Sports & athletics', 'Holistic healing & wellness', 'Military & defense services'],
      lifeLessons: 'To learn that true healing begins within, and that the courage to be still is as powerful as the courage to act.',
      karmicThemes: 'Breaking free from past-life patterns of stagnation; learning to use speed and initiative in service of others.',
    },
    spiritual: {
      mantra: 'Om Ashwinebhyo Namaha',
      practices: ['Morning sun salutations to channel vital energy', 'Breathwork (pranayama) for grounding restless energy', 'Volunteer work in healing contexts', 'Forest bathing and nature immersion'],
      meditationFocus: 'Visualize a golden horse galloping across an endless plain — feel the vital force moving through you, then gradually slow it to a peaceful walk, discovering the stillness within motion.',
    },
  },
  Bharani: {
    name: 'Bharani',
    symbol: '♀',
    symbolMeaning: 'Yoni — the divine feminine creative force, representing the gateway of birth, transformation, and the power of restraint',
    rulingDeity: 'Yama',
    deityDescription: 'The Lord of Death and cosmic judge who governs dharma, discipline, and the inevitable transformation of all things. Yama teaches that every ending is a doorway to a new beginning.',
    rulingPlanet: 'Venus',
    rulingPlanetSymbol: '♀',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Aries): Intense transformative energy, carries the weight of responsibility with fierce determination',
      'Pada 2 (Aries): Creative power channeled through artistic expression and aesthetic sensibility',
      'Pada 3 (Aries): Deep psychological insight, drawn to understanding the hidden dimensions of life',
      'Pada 4 (Taurus): Grounded transformation, learns to build lasting structures from intense experiences',
    ],
    personality: {
      emotionalTendencies: 'Emotions run deep and intense — you experience the full spectrum from creative ecstasy to existential depths. Your emotional life follows cycles of death and rebirth.',
      strengths: ['Profound capacity for transformation', 'Unwavering loyalty and commitment', 'Deep creative and artistic sensibility', 'Courage to face life\'s darkest truths'],
      growthAreas: ['Accepting that not all intensity needs a resolution', 'Developing patience with others\' slower emotional pace', 'Balancing desire for control with surrender', 'Trusting the natural timing of transformation'],
      mentalTendencies: 'Your mind is drawn to the hidden and the taboo — you see beneath surfaces with piercing clarity.',
    },
    relationships: {
      approach: 'You love with total intensity and devotion, seeking relationships that transform both partners.',
      compatibility: 'Best compatibility with Rohini, Purva Phalguni, and Pushya nakshatras. You need a partner who can match your emotional depth.',
      emotionalNeeds: 'Complete emotional honesty and authenticity, transformation through love, a partner who can hold space for your depth.',
    },
    career: {
      naturalTalents: ['Deep analytical and investigative ability', 'Creative arts and aesthetic design', 'Crisis management and transformation', 'Psychological insight and counseling'],
      bestCareers: ['Psychology & therapy', 'Fine arts & creative direction', 'Investigation & forensic science', 'Obstetrics & fertility medicine', 'Crisis counseling & hospice care'],
      lifeLessons: 'To learn that bearing the weight of transformation is not a punishment but a sacred capacity.',
      karmicThemes: 'Moving through cycles of loss and renewal with grace; learning to use the power of restraint as a tool for creative liberation.',
    },
    spiritual: {
      mantra: 'Om Yamaya Namaha',
      practices: ['Contemplation on impermanence and cycles of nature', 'Tantric practices for transformation of desire', 'Dark room meditation — embracing the void', 'Creating art as a spiritual practice'],
      meditationFocus: 'Sit in darkness and visualize a seed deep underground — feel the pressure, the waiting, the inevitable breakthrough.',
    },
  },
  Krittika: {
    name: 'Krittika',
    symbol: '🔥',
    symbolMeaning: 'Razor or Flame — representing the power to cut through illusion, purify through fire, and separate truth from falsehood',
    rulingDeity: 'Agni',
    deityDescription: 'The God of Fire, the divine purifier who transforms all that he touches. Agni represents the sacred flame that burns away impurities and illuminates truth.',
    rulingPlanet: 'Sun',
    rulingPlanetSymbol: '☉',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Aries): Fierce cutting energy, speaks truth with bluntness and holds uncompromising standards',
      'Pada 2 (Taurus): Grounded flame, channels critical energy into building practical excellence',
      'Pada 3 (Taurus): Nurturing fire, uses discernment to care for and protect loved ones',
      'Pada 4 (Taurus): Philosophical flame, seeks truth through wisdom and intellectual rigor',
    ],
    personality: {
      emotionalTendencies: 'Your emotions burn with a clear, bright flame — you feel things sharply and are not afraid to express what you see as truth.',
      strengths: ['Exceptional clarity and discernment', 'Courage to speak difficult truths', 'Capacity for deep nurturing and protection', 'Natural leadership through example'],
      growthAreas: ['Softening the razor edge of criticism with compassion', 'Accepting imperfection in yourself and others', 'Patience with those who process truth more slowly', 'Using warmth as readily as discernment'],
      mentalTendencies: 'Your mind is a precision instrument — you cut through complexity to find the essential truth.',
    },
    relationships: {
      approach: 'You seek relationships built on absolute honesty and mutual growth. You are fiercely protective of those you love.',
      compatibility: 'Best compatibility with Rohini, Hasta, and Shravana nakshatras. You thrive with a partner who appreciates your directness.',
      emotionalNeeds: 'Honesty above all else, a partner who can handle your intensity, warmth and nurturing in return for your fierce devotion.',
    },
    career: {
      naturalTalents: ['Critical analysis and quality assessment', 'Teaching and mentorship', 'Nurturing and protection of others', 'Leadership through clarity and vision'],
      bestCareers: ['Teaching & education', 'Culinary arts & nutrition', 'Quality control & auditing', 'Surgery & dentistry', 'Law & justice'],
      lifeLessons: 'To learn that the same fire that purifies can also warm, and that discernment without compassion is merely judgment.',
      karmicThemes: 'Learning to wield the power of truth without causing unnecessary harm; transforming critical energy into creative and nurturing purpose.',
    },
    spiritual: {
      mantra: 'Om Agnaye Namaha',
      practices: ['Fire ceremony (homa) for purification', 'Cooking with mindful intention and devotion', 'Truth-speaking practices and satya vows', 'Sun gazing during safe hours'],
      meditationFocus: 'Visualize a bright, steady flame at the center of your being — watch it illuminate everything within you, burning away what is false while warming and nurturing what is true.',
    },
  },
  Rohini: {
    name: 'Rohini',
    symbol: '🛒',
    symbolMeaning: 'Cart or Chariot — symbolizing abundance, cultivation, and the capacity to carry life\'s riches with grace',
    rulingDeity: 'Brahma',
    deityDescription: 'The Creator God of the Vedic trinity, who represents the power of creation, manifestation, and the sacred art of bringing beauty into form.',
    rulingPlanet: 'Moon',
    rulingPlanetSymbol: '☽',
    element: 'Earth',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Taurus): Pure creative force, manifests beauty and abundance with effortless grace',
      'Pada 2 (Taurus): Sensory artist, channels creativity through touch, taste, and material form',
      'Pada 3 (Taurus): Emotional cultivator, nurtures relationships and creative projects with deep feeling',
      'Pada 4 (Taurus): Visionary builder, combines creative imagination with practical manifestation skill',
    ],
    personality: {
      emotionalTendencies: 'Your emotional world is rich, fertile, and deeply rooted — you feel things with a luxurious depth that others find both comforting and captivating.',
      strengths: ['Extraordinary creative and artistic ability', 'Deep capacity for nurturing and care', 'Magnetic personal presence', 'Patience to see projects through to completion'],
      growthAreas: ['Releasing possessiveness in relationships and creative work', 'Embracing change as a form of creative evolution', 'Developing flexibility when plans shift unexpectedly', 'Sharing attention and resources more freely'],
      mentalTendencies: 'Your mind works like a fertile garden — ideas grow organically, developing depth and richness over time.',
    },
    relationships: {
      approach: 'You are one of the most devoted and sensual lovers in the zodiac. You express love through beauty, comfort, and physical presence.',
      compatibility: 'Best compatibility with Krittika, Pushya, and Anuradha nakshatras. You need a partner who appreciates your depth.',
      emotionalNeeds: 'Physical and emotional security, beauty in your environment, a partner who is fully present and attentive, steady commitment that deepens over time.',
    },
    career: {
      naturalTalents: ['Creative arts and aesthetic design', 'Nurturing and cultivation in all forms', 'Business acumen with artistic sensibility', 'Patience for long-term growth projects'],
      bestCareers: ['Art, design & fashion', 'Agriculture & organic farming', 'Interior design & architecture', 'Music & performing arts', 'Luxury goods & hospitality'],
      lifeLessons: 'To learn that true abundance flows when you release the grip of possessiveness, and that beauty grows most freely when it is shared.',
      karmicThemes: 'Transforming attachment into appreciation; learning that creation requires both holding on and letting go in their proper seasons.',
    },
    spiritual: {
      mantra: 'Om Brahmane Namaha',
      practices: ['Gardening and working with earth as meditation', 'Creating beauty as a devotional practice', 'Gratitude rituals for abundance', 'Moonlight meditation during full moon'],
      meditationFocus: 'Visualize a lush, abundant garden — feel the fertile earth beneath you, the warmth of the sun, the gentle rain. Sense your own capacity to create and nurture life in all its forms.',
    },
  },
  Mrigashirsha: {
    name: 'Mrigashirsha',
    symbol: '🦌',
    symbolMeaning: 'Deer Head — representing the seeking nature, gentle curiosity, and the eternal search for the sacred through beauty and grace',
    rulingDeity: 'Soma',
    deityDescription: 'The Moon God and keeper of the divine nectar of immortality. Soma represents the intoxicating bliss of spiritual seeking and the gentle pursuit of truth.',
    rulingPlanet: 'Mars',
    rulingPlanetSymbol: '♂',
    element: 'Earth',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Taurus): Gentle seeker of beauty, pursues aesthetic and spiritual truth with quiet determination',
      'Pada 2 (Taurus): Nurturing explorer, combines the desire for security with a need for discovery',
      'Pada 3 (Gemini): Intellectual wanderer, seeks truth through communication, learning, and ideas',
      'Pada 4 (Gemini): Spiritual communicator, channels the search for meaning into teaching and writing',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are gentle, elusive, and deeply sensitive — like a deer in a forest, you are always alert and attuned to subtle shifts in your environment.',
      strengths: ['Exceptional sensitivity and perceptiveness', 'Graceful adaptability in all situations', 'Natural curiosity that drives continuous growth', 'Gentle persistence that achieves goals without force'],
      growthAreas: ['Committing to a path rather than endlessly seeking', 'Staying present when impulse says to flee', 'Trusting your own perceptions without constant validation', 'Developing courage to face discomfort directly'],
      mentalTendencies: 'Your mind is perpetually searching — for meaning, for beauty, for the next revelation. This restless seeking makes you extraordinarily perceptive.',
    },
    relationships: {
      approach: 'You approach love like a gentle deer approaching a forest clearing — cautiously, beautifully, and with deep sensitivity.',
      compatibility: 'Best compatibility with Rohini, Hasta, and Shravana nakshatras. You need a partner who provides safety without confinement.',
      emotionalNeeds: 'Emotional safety and gentle reassurance, freedom to explore within the relationship, beauty and harmony in your shared environment.',
    },
    career: {
      naturalTalents: ['Research and investigation', 'Writing and communication', 'Aesthetic and design sensibility', 'Teaching and guidance'],
      bestCareers: ['Research & academia', 'Writing & journalism', 'Design & creative arts', 'Counseling & therapy', 'Environmental science & ecology'],
      lifeLessons: 'To learn that the treasure you seek is already within you, and that the search itself is the sacred journey — not its destination.',
      karmicThemes: 'Transforming restless seeking into purposeful exploration; learning that commitment and freedom can coexist when rooted in authentic desire.',
    },
    spiritual: {
      mantra: 'Om Somaya Namaha',
      practices: ['Moonlight meditation and lunar cycle tracking', 'Forest walking meditation with sensory awareness', 'Journaling the inner search and its revelations', 'Chanting and devotional singing (kirtan)'],
      meditationFocus: 'Visualize a deer moving gracefully through a moonlit forest — feel the gentleness, the alertness, the beauty of the search. Then notice that the deer is not searching for anything — it is simply being.',
    },
  },
  Ardra: {
    name: 'Ardra',
    symbol: '💧',
    symbolMeaning: 'Teardrop or Diamond — representing the emotional depth that comes through suffering and the clarity that emerges after the storm',
    rulingDeity: 'Rudra',
    deityDescription: 'The fierce form of Shiva known as the Howler — the god of storms, destruction, and transformative power. Rudra destroys illusion and complacency.',
    rulingPlanet: 'Rahu',
    rulingPlanetSymbol: '☊',
    element: 'Earth',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Gemini): Intense communicator, channels emotional depth into powerful self-expression',
      'Pada 2 (Gemini): Intellectual storm, processes emotional turbulence through analysis and understanding',
      'Pada 3 (Gemini): Social transformer, uses personal intensity to catalyze change in communities',
      'Pada 4 (Cancer): Emotional depth personified, carries the weight of deep feeling with protective care',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is characterized by intensity and turbulence — you experience the full force of feelings. Like a storm, your emotions are powerful but ultimately purifying.',
      strengths: ['Extraordinary emotional resilience after hardship', 'Capacity for deep empathy born of personal experience', 'Courage to face the darkest aspects of existence', 'Transformative power that inspires change in others'],
      growthAreas: ['Developing equanimity amid emotional storms', 'Trusting that calm will follow turbulence', 'Avoiding the temptation to create drama when things are too peaceful', 'Channeling intensity into constructive outlets'],
      mentalTendencies: 'Your mind is a powerful storm system — brilliant, unpredictable, and deeply penetrating. You see through pretense with uncomfortable clarity.',
    },
    relationships: {
      approach: 'You seek relationships of profound depth and transformative potential. Superficial connections feel suffocating.',
      compatibility: 'Best compatibility with Swati, Shatabhisha, and Punarvasu nakshatras. You need a partner who understands that your intensity is a form of love.',
      emotionalNeeds: 'Permission to feel everything fully without judgment, a partner who remains steady during emotional storms, authentic connection that goes beyond pleasant surfaces.',
    },
    career: {
      naturalTalents: ['Crisis management and intervention', 'Deep research and investigation', 'Healing and therapeutic work', 'Transformative leadership'],
      bestCareers: ['Crisis counseling & trauma therapy', 'Investigative journalism', 'Meteorology & earth sciences', 'Social work & community organizing', 'Rehabilitation & recovery services'],
      lifeLessons: 'To learn that the storm within is not your enemy but your teacher, and that the teardrop and the diamond are made of the same substance.',
      karmicThemes: 'Transforming suffering into wisdom; learning to wield the power of emotional intensity without being consumed by it.',
    },
    spiritual: {
      mantra: 'Om Rudraya Namaha',
      practices: ['Storm meditation — embracing turbulence as divine movement', 'Crying as spiritual release and purification', 'Working with those in crisis as a form of seva', 'Dance and movement therapy for emotional release'],
      meditationFocus: 'Sit with the feeling of a storm — the wind, the rain, the thunder. Instead of seeking shelter, move into the center of the storm and discover the still point within.',
    },
  },
  Punarvasu: {
    name: 'Punarvasu',
    symbol: '🏹',
    symbolMeaning: 'Bow and Quiver — representing the return to light after darkness, the power of renewal, and the infinite potential of second chances',
    rulingDeity: 'Aditi',
    deityDescription: 'The Mother of the Gods and goddess of infinite space, freedom, and boundless potential. Aditi represents the cosmic womb from which all possibilities emerge.',
    rulingPlanet: 'Jupiter',
    rulingPlanetSymbol: '♃',
    element: 'Air',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Gemini): Philosophical communicator, seeks truth through dialogue and intellectual exchange',
      'Pada 2 (Gemini): Expansive thinker, brings optimism and broad vision to every endeavor',
      'Pada 3 (Cancer): Nurturing philosopher, combines intellectual depth with emotional wisdom',
      'Pada 4 (Cancer): Spiritual homemaker, creates sacred space that nurtures the soul\'s return to wholeness',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are characterized by remarkable resilience and an innate faith that things will work out. After every emotional storm, you possess a unique ability to return to hope.',
      strengths: ['Extraordinary resilience and ability to bounce back', 'Expansive optimism that uplifts others', 'Philosophical wisdom gained through experience', 'Natural gift for creating harmony and reconciliation'],
      growthAreas: ['Recognizing when optimism becomes avoidance of difficulty', 'Building lasting structures rather than constantly starting fresh', 'Accepting that some endings are permanent', 'Developing depth of commitment alongside breadth of vision'],
      mentalTendencies: 'Your mind naturally gravitates toward the big picture — you see connections, patterns, and possibilities where others see isolated events.',
    },
    relationships: {
      approach: 'You bring warmth, optimism, and a deep belief in the possibility of reconciliation to your relationships.',
      compatibility: 'Best compatibility with Pushya, Vishakha, and Shravana nakshatras. You need a partner who shares your philosophical outlook.',
      emotionalNeeds: 'Freedom to explore and grow, philosophical connection with your partner, space to reinvent yourself when needed, a relationship that feels like coming home.',
    },
    career: {
      naturalTalents: ['Teaching and mentoring', 'Philosophical and spiritual guidance', 'Mediation and conflict resolution', 'Visionary planning and strategy'],
      bestCareers: ['Teaching & academia', 'Spiritual counseling & ministry', 'Diplomacy & international relations', 'Travel & cultural exchange', 'Publishing & philosophical writing'],
      lifeLessons: 'To learn that true renewal requires completion, not just new beginnings, and that the return home is as sacred as the departure.',
      karmicThemes: 'Breaking cycles of unfinished journeys; learning that the wisdom gained through wandering must eventually be anchored in committed action.',
    },
    spiritual: {
      mantra: 'Om Adityai Namaha',
      practices: ['Pilgrimage and spiritual travel', 'Study of comparative philosophy and religion', 'Forgiveness meditation and reconciliation rituals', 'Creating sacred spaces that welcome the returning soul'],
      meditationFocus: 'Visualize a journey — you have traveled far, weathered storms, and now you see home on the horizon. Feel the warmth of return, the expansion of possibility.',
    },
  },
  Pushya: {
    name: 'Pushya',
    symbol: '🐄',
    symbolMeaning: 'Cow Udder — representing nourishment, generosity, and the sacred act of providing sustenance to others',
    rulingDeity: 'Brihaspati',
    deityDescription: 'The Guru of the Gods, the divine teacher who embodies wisdom, ritual, and the sacred transmission of knowledge. Brihaspati represents the highest form of spiritual authority.',
    rulingPlanet: 'Saturn',
    rulingPlanetSymbol: '♄',
    element: 'Fire',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Cancer): Pure nurturing energy, provides emotional sustenance and spiritual nourishment',
      'Pada 2 (Cancer): Devoted teacher, combines emotional depth with disciplined wisdom',
      'Pada 3 (Cancer): Community builder, creates structures that support collective well-being',
      'Pada 4 (Leo): Royal nurturer, provides guidance and sustenance with natural authority and grace',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is grounded in a deep need to care for and nourish others. You feel most fulfilled when you are providing support, wisdom, or comfort.',
      strengths: ['Exceptional capacity for nurturing and guidance', 'Strong moral compass and ethical foundation', 'Patience and discipline in achieving goals', 'Natural authority that inspires trust and respect'],
      growthAreas: ['Balancing the desire to nourish others with self-care', 'Allowing yourself to receive support without guilt', 'Avoiding rigidity in moral or spiritual views', 'Embracing playfulness alongside responsibility'],
      mentalTendencies: 'Your mind is structured, disciplined, and oriented toward service. You think in terms of systems, principles, and the greater good.',
    },
    relationships: {
      approach: 'You express love through devoted care, practical support, and the creation of a stable, nurturing environment.',
      compatibility: 'Best compatibility with Punarvasu, Rohini, and Anuradha nakshatras. You need a partner who appreciates your nurturing nature.',
      emotionalNeeds: 'Respect and recognition for your contributions, a partner who reciprocates care and attention, shared values and spiritual alignment, stability and consistency.',
    },
    career: {
      naturalTalents: ['Teaching and spiritual guidance', 'Organizational leadership and management', 'Counseling and mentoring', 'Community building and social service'],
      bestCareers: ['Education & spiritual teaching', 'Healthcare & nursing', 'Social work & community development', 'Religious ministry & chaplaincy', 'Organizational management & HR'],
      lifeLessons: 'To learn that the nourishment you give so freely to others must also flow inward, and that self-compassion is not selfishness but the foundation of sustainable service.',
      karmicThemes: 'Balancing the impulse to serve with the wisdom to receive; learning that true authority comes from humility, not hierarchy.',
    },
    spiritual: {
      mantra: 'Om Brihaspataye Namaha',
      practices: ['Service (seva) as spiritual practice', 'Study of sacred texts and philosophical inquiry', 'Ritual and ceremonial practice with devotion', 'Feeding the hungry as a form of worship'],
      meditationFocus: 'Visualize a radiant cow nurturing her calf — feel the abundance of giving, the sacredness of sustenance. Then turn this nurturing energy toward yourself.',
    },
  },
  Ashlesha: {
    name: 'Ashlesha',
    symbol: '🐍',
    symbolMeaning: 'Coiled Serpent — representing kundalini energy, hidden wisdom, and the power of deep psychological insight',
    rulingDeity: 'Nagas',
    deityDescription: 'The Serpent Deities who guard the earth\'s hidden treasures and esoteric wisdom. Nagas represent the kundalini force that lies coiled at the base of the spine.',
    rulingPlanet: 'Mercury',
    rulingPlanetSymbol: '☿',
    element: 'Water',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Cancer): Deep emotional intelligence, perceives hidden feelings and unspoken truths',
      'Pada 2 (Cancer): Intuitive healer, uses psychological insight to help others transform',
      'Pada 3 (Leo): Charismatic authority, wields psychological power with confidence and magnetism',
      'Pada 4 (Leo): Spiritual alchemist, transforms personal darkness into wisdom and leadership',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are deep, complex, and often hidden from view — like a serpent coiled in stillness, you observe far more than you reveal.',
      strengths: ['Extraordinary psychological intuition', 'Ability to penetrate to the core of any issue', 'Natural charisma and hypnotic presence', 'Capacity for profound transformation and healing'],
      growthAreas: ['Trusting others enough to show vulnerability', 'Using insight to heal rather than manipulate', 'Developing transparency in communication', 'Avoiding the tendency to test others\' loyalty'],
      mentalTendencies: 'Your mind works like a serpent — silent, observant, and capable of striking with precision when needed.',
    },
    relationships: {
      approach: 'You approach relationships with intensity and a desire for complete emotional merger. You want to know your partner\'s deepest secrets.',
      compatibility: 'Best compatibility with Jyeshtha, Revati, and Rohini nakshatras. You need a partner who can handle your intensity.',
      emotionalNeeds: 'Complete emotional honesty and depth, loyalty that withstands any test, intellectual stimulation alongside emotional connection.',
    },
    career: {
      naturalTalents: ['Psychological analysis and counseling', 'Strategic thinking and negotiation', 'Research into hidden or esoteric subjects', 'Healing and transformation work'],
      bestCareers: ['Psychology & psychoanalysis', 'Research & intelligence work', 'Hypnotherapy & energy healing', 'Strategic consulting & negotiation', 'Toxicology & pharmacology'],
      lifeLessons: 'To learn that the venom that can harm can also heal, and that transparency is not vulnerability but the highest form of power.',
      karmicThemes: 'Transforming the urge to control through insight into the capacity to heal through wisdom; learning to trust as deeply as you perceive.',
    },
    spiritual: {
      mantra: 'Om Nagadevataya Namaha',
      practices: ['Kundalini yoga and energy work', 'Shadow work and deep psychological exploration', 'Snake handling meditation (symbolic visualization)', 'Studying esoteric and mystical traditions'],
      meditationFocus: 'Visualize a coiled serpent at the base of your spine — feel its wisdom, its patience, its power. As you breathe, sense the energy slowly rising, transforming each chakra.',
    },
  },
  Magha: {
    name: 'Magha',
    symbol: '👑',
    symbolMeaning: 'Royal Throne — representing ancestral power, nobility of character, and the responsibility that comes with authority',
    rulingDeity: 'Pitris',
    deityDescription: 'The Ancestral Spirits who guard the lineage wisdom and karmic inheritance of all beings. The Pitris represent the accumulated wisdom of those who came before.',
    rulingPlanet: 'Ketu',
    rulingPlanetSymbol: '☊',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Leo): Pure royal authority, carries ancestral power with natural dignity and command',
      'Pada 2 (Leo): Inherited wisdom, channels ancestral knowledge into leadership and service',
      'Pada 3 (Leo): Noble reformer, uses position and influence to create positive change',
      'Pada 4 (Leo): Spiritual aristocrat, recognizes true nobility as service to the highest good',
    ],
    personality: {
      emotionalTendencies: 'You carry a deep sense of dignity and pride in your emotional life — you feel things with the weight of ancestral responsibility.',
      strengths: ['Natural leadership and authority', 'Deep respect for tradition and lineage', 'Generosity and nobility of spirit', 'Commitment to duty and ethical responsibility'],
      growthAreas: ['Distinguishing between authentic authority and ego-driven pride', 'Honoring ancestral wisdom without being bound by past patterns', 'Serving others from genuine care rather than sense of obligation', 'Embracing humility as a form of true power'],
      mentalTendencies: 'Your mind is oriented toward legacy, hierarchy, and the proper order of things. You think in terms of generations rather than moments.',
    },
    relationships: {
      approach: 'You approach relationships with a sense of honor and duty, seeking partners who share your values and whom you can respect.',
      compatibility: 'Best compatibility with Purva Phalguni, Uttara Phalguni, and Ashwini nakshatras. You need a partner who respects your authority.',
      emotionalNeeds: 'Respect and recognition from your partner, a relationship that honors tradition while allowing evolution, loyalty and commitment that match your own.',
    },
    career: {
      naturalTalents: ['Executive leadership and governance', 'Preservation of tradition and culture', 'Public service and civic duty', 'Teaching through example and mentorship'],
      bestCareers: ['Government & politics', 'Corporate leadership & CEO roles', 'Heritage & cultural preservation', 'Law & judiciary', 'Philanthropy & foundation work'],
      lifeLessons: 'To learn that the truest throne is the one earned through service, and that the greatest legacy is the wisdom you pass on.',
      karmicThemes: 'Releasing attachment to status while maintaining commitment to responsibility; transforming inherited power into earned wisdom.',
    },
    spiritual: {
      mantra: 'Om Pitribhyo Namaha',
      practices: ['Ancestral honor rituals and altar creation', 'Service to elders and community elders', 'Study of lineage and family history', 'Meditation on the nature of true authority'],
      meditationFocus: 'Visualize a royal throne on a mountaintop — feel the weight of responsibility, the vastness of the view. Then rise from the throne and serve those below.',
    },
  },
  'Purva Phalguni': {
    name: 'Purva Phalguni',
    symbol: '🛏️',
    symbolMeaning: 'Front Legs of the Bed — representing pleasure, union, creative procreation, and the celebration of life\'s sensual abundance',
    rulingDeity: 'Bhaga',
    deityDescription: 'The God of Fortune, Pleasure, and Marital Bliss. Bhaga represents the divine enjoyment of life\'s gifts and the sacredness of sensual pleasure.',
    rulingPlanet: 'Venus',
    rulingPlanetSymbol: '♀',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Leo): Passionate creator, expresses love and beauty with dramatic flair and warmth',
      'Pada 2 (Leo): Sensual aristocrat, appreciates the finer things and creates beauty in all forms',
      'Pada 3 (Virgo): Refined artist, channels creative energy through meticulous craft and detail',
      'Pada 4 (Virgo): Devoted partner, seeks to perfect the art of relationship and intimate connection',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is rich, warm, and driven by a deep desire for connection and pleasure. You feel most alive when expressing love or creating beauty.',
      strengths: ['Exceptional capacity for love and affection', 'Creative expression in all its forms', 'Social grace and diplomatic charm', 'Ability to find beauty and joy in everyday moments'],
      growthAreas: ['Developing depth beneath the surface of pleasure', 'Committing to growth even when comfort beckons', 'Balancing indulgence with discipline', 'Finding meaning beyond pleasure and social approval'],
      mentalTendencies: 'Your mind is attracted to beauty, harmony, and the art of living well. You think in aesthetic terms and are gifted at creating pleasant environments.',
    },
    relationships: {
      approach: 'You are one of the most romantic and affectionate partners in the zodiac. Love is your art form.',
      compatibility: 'Best compatibility with Uttara Phalguni, Magha, and Bharani nakshatras. You need a partner who shares your love of beauty.',
      emotionalNeeds: 'Romance and aesthetic pleasure in partnership, appreciation and admiration from your partner, creative collaboration, physical and emotional warmth.',
    },
    career: {
      naturalTalents: ['Creative arts and performance', 'Social diplomacy and relationship building', 'Event planning and hospitality', 'Aesthetic design and curation'],
      bestCareers: ['Entertainment & performing arts', 'Fashion & beauty industry', 'Event planning & hospitality', 'Interior design & luxury goods', 'Marriage counseling & relationship coaching'],
      lifeLessons: 'To learn that the deepest pleasure arises from genuine connection, not mere indulgence.',
      karmicThemes: 'Transforming the pursuit of pleasure into the cultivation of joy; learning that lasting fulfillment comes from creative contribution.',
    },
    spiritual: {
      mantra: 'Om Bhagaya Namaha',
      practices: ['Creating beauty as devotional practice', 'Sacred sexuality and conscious intimacy', 'Gratitude rituals celebrating life\'s gifts', 'Art and music as pathways to the divine'],
      meditationFocus: 'Visualize a lush garden at sunset — the golden light, the fragrance, the warmth. Feel the sacredness of pleasure when experienced with full presence and gratitude.',
    },
  },
  'Uttara Phalguni': {
    name: 'Uttara Phalguni',
    symbol: '🪑',
    symbolMeaning: 'Back Legs of the Bed — representing the completion of union, lasting commitment, and the depth that follows initial attraction',
    rulingDeity: 'Aryaman',
    deityDescription: 'The God of Contracts, Companionship, and Noble Conduct. Aryaman represents the sacred agreements that bind people together and the honor that sustains relationships.',
    rulingPlanet: 'Sun',
    rulingPlanetSymbol: '☉',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Leo): Dignified partner, brings warmth and authority to committed relationships',
      'Pada 2 (Virgo): Practical idealist, builds lasting structures from creative inspiration',
      'Pada 3 (Virgo): Service-oriented leader, combines authority with humility and dedication',
      'Pada 4 (Virgo): Perfectionist builder, refines and improves every project and relationship',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are stable, deep, and oriented toward lasting connection. Your emotional satisfaction comes from building something enduring.',
      strengths: ['Commitment and reliability in relationships', 'Ability to transform creative vision into reality', 'Balanced approach to work and pleasure', 'Natural dignity and ethical conduct'],
      growthAreas: ['Allowing imperfection without constant refinement', 'Accepting that some things cannot be improved', 'Balancing duty with spontaneity', 'Trusting the process rather than controlling outcomes'],
      mentalTendencies: 'Your mind bridges creative inspiration and practical execution — you can envision beautiful possibilities and then work methodically to bring them into form.',
    },
    relationships: {
      approach: 'You bring depth, commitment, and practical wisdom to relationships. You view love as a sacred contract that requires ongoing effort.',
      compatibility: 'Best compatibility with Purva Phalguni, Hasta, and Pushya nakshatras. You need a partner who values commitment as deeply as you do.',
      emotionalNeeds: 'Reliability and consistency, shared goals and vision, appreciation for your efforts, a balance of practical support and romantic warmth.',
    },
    career: {
      naturalTalents: ['Project completion and follow-through', 'Balancing creativity with practicality', 'Building and sustaining organizations', 'Teaching and mentorship'],
      bestCareers: ['Architecture & construction', 'Business management & operations', 'Education & academic administration', 'Law & contract negotiation', 'Social services & community building'],
      lifeLessons: 'To learn that perfection is not the absence of flaws but the presence of love.',
      karmicThemes: 'Completing what has been started; learning that the art of finishing is as sacred as the art of beginning.',
    },
    spiritual: {
      mantra: 'Om Aryamane Namaha',
      practices: ['Sacred commitment ceremonies and vow renewals', 'Service to community as spiritual practice', 'Balanced discipline of work and celebration', 'Building and maintaining sacred spaces'],
      meditationFocus: 'Visualize the completion of a beautiful cathedral — every stone placed with intention, every detail lovingly crafted. Feel the sacredness of commitment and perseverance.',
    },
  },
  Hasta: {
    name: 'Hasta',
    symbol: '✋',
    symbolMeaning: 'Hand — representing skill, craftsmanship, healing touch, and the power to shape reality through intention and action',
    rulingDeity: 'Savitar',
    deityDescription: 'The Sun God in his creative aspect, who brings forth all forms and beings through divine will. Savitar represents the power of manifestation through skilled action.',
    rulingPlanet: 'Moon',
    rulingPlanetSymbol: '☽',
    element: 'Earth',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Virgo): Healing hands, channels intuitive wisdom through practical skill and service',
      'Pada 2 (Virgo): Master craftsperson, combines precision with beauty in every creation',
      'Pada 3 (Virgo): Astute business mind, uses skill and intelligence for practical success',
      'Pada 4 (Libra): Diplomatic artist, blends skill with social grace and aesthetic sensitivity',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are contained, intelligent, and expressed primarily through action rather than words. You show love through what you create or fix for others.',
      strengths: ['Exceptional manual and creative skill', 'Intelligence combined with practical ability', 'Healing presence and comforting touch', 'Attention to detail and quality craftsmanship'],
      growthAreas: ['Expressing emotions verbally as well as through action', 'Accepting that some things cannot be fixed', 'Trusting intuition alongside analysis', 'Allowing yourself to receive care without needing to reciprocate immediately'],
      mentalTendencies: 'Your mind is precise, analytical, and hands-on — you understand things by working with them directly.',
    },
    relationships: {
      approach: 'You express love through acts of service, skilled care, and practical support. You are the partner who remembers every detail and fixes every problem.',
      compatibility: 'Best compatibility with Swati, Shravana, and Rohini nakshatras. You need a partner who appreciates your practical expressions of love.',
      emotionalNeeds: 'Appreciation for your skills and contributions, a partner who creates emotional safety for vulnerability, shared activities and creative projects.',
    },
    career: {
      naturalTalents: ['Handcrafts and skilled trades', 'Healing arts and bodywork', 'Business and financial management', 'Teaching and skill transmission'],
      bestCareers: ['Surgery & hand therapy', 'Crafts & artisanal work', 'Business management & accounting', 'Massage therapy & energy healing', 'Technology & software development'],
      lifeLessons: 'To learn that the hand that creates must also learn to release, and that skill without heart is merely technique.',
      karmicThemes: 'Transforming control into craft; learning that the highest form of skill serves not the ego but the greater good.',
    },
    spiritual: {
      mantra: 'Om Savitre Namaha',
      practices: ['Hand-based meditation — pottery, drawing, or weaving with full presence', 'Healing touch practices and reiki', 'Decluttering and organizing as spiritual discipline', 'Gratitude practice for the gift of skilled action'],
      meditationFocus: 'Visualize your hands glowing with golden light — feel the creative power, the healing potential. Then open your hands and release the need to control.',
    },
  },
  Chitra: {
    name: 'Chitra',
    symbol: '💎',
    symbolMeaning: 'Bright Jewel or Pearl — representing brilliance, artistic vision, and the ability to create extraordinary beauty from raw materials',
    rulingDeity: 'Vishwakarma',
    deityDescription: 'The Divine Architect and Cosmic Craftsman who designed the universe\'s most magnificent structures. Vishwakarma represents the power to envision and create works of extraordinary beauty.',
    rulingPlanet: 'Mars',
    rulingPlanetSymbol: '♂',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Virgo): Precision artist, creates beauty through meticulous attention to detail and form',
      'Pada 2 (Libra): Aesthetic visionary, designs harmonious environments and relationships',
      'Pada 3 (Libra): Social architect, builds bridges between people through art and diplomacy',
      'Pada 4 (Libra): Cosmic designer, channels creative vision into structures that serve the greater good',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is colorful, dramatic, and driven by a deep need to create something beautiful. You feel most alive when bringing your vision into reality.',
      strengths: ['Extraordinary creative vision and artistic ability', 'Capacity to transform raw materials into masterpieces', 'Magnetic personal presence and charm', 'Skill at building and designing beautiful structures'],
      growthAreas: ['Accepting imperfection in creative work and relationships', 'Valuing substance alongside beauty and form', 'Developing patience with the creative process', 'Balancing the desire to shine with genuine collaboration'],
      mentalTendencies: 'Your mind is a kaleidoscope — constantly creating new patterns, seeing potential beauty in everything, and envisioning possibilities that others miss.',
    },
    relationships: {
      approach: 'You bring artistry, romance, and a desire for aesthetic perfection to relationships.',
      compatibility: 'Best compatibility with Hasta, Swati, and Anuradha nakshatras. You need a partner who appreciates your creative vision.',
      emotionalNeeds: 'A partner who inspires your creative vision, beauty and aesthetics in your shared life, appreciation for your unique perspective, space to create freely.',
    },
    career: {
      naturalTalents: ['Architecture and design', 'Visual arts and creative direction', 'Building and construction with aesthetic focus', 'Fashion and personal styling'],
      bestCareers: ['Architecture & interior design', 'Graphic design & visual arts', 'Fashion design & jewelry making', 'Film & cinematography', 'Urban planning & landscape design'],
      lifeLessons: 'To learn that the jewel you seek to create already exists within you, and that the most beautiful architecture is built on a foundation of authenticity.',
      karmicThemes: 'Transforming the pursuit of external beauty into the cultivation of inner radiance; learning that creation serves its highest purpose when it reveals truth.',
    },
    spiritual: {
      mantra: 'Om Vishwakarmaaye Namaha',
      practices: ['Sacred geometry study and meditation', 'Creating art as spiritual offering', 'Designing and building with conscious intention', 'Contemplation on the relationship between form and emptiness'],
      meditationFocus: 'Visualize a brilliant jewel forming deep within the earth — feel the pressure, the transformation, the emergence of extraordinary beauty.',
    },
  },
  Swati: {
    name: 'Swati',
    symbol: '🌱',
    symbolMeaning: 'Shoot of Grass or Sword — representing independence, flexibility, and the power to thrive in any environment through adaptability',
    rulingDeity: 'Vayu',
    deityDescription: 'The God of Wind and Breath, the invisible yet omnipresent force that moves all things. Vayu represents the power of freedom, the intelligence of adaptability, and the life force.',
    rulingPlanet: 'Rahu',
    rulingPlanetSymbol: '☊',
    element: 'Air',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Libra): Independent diplomat, balances personal freedom with social harmony',
      'Pada 2 (Libra): Intellectual entrepreneur, uses innovative thinking to create new possibilities',
      'Pada 3 (Scorpio): Deep explorer, seeks hidden truths behind pleasant surfaces',
      'Pada 4 (Scorpio): Transformative communicator, channels insight into powerful self-expression',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are independent, adaptable, and sometimes hard to pin down — like the wind, you move freely and resist confinement.',
      strengths: ['Extraordinary independence and self-sufficiency', 'Adaptability to any situation or environment', 'Intellectual brilliance and innovative thinking', 'Diplomatic skill and social intelligence'],
      growthAreas: ['Committing to emotional depth over breadth of experience', 'Developing consistency in relationships and projects', 'Balancing independence with vulnerability and trust', 'Staying present when the wind urges you to move on'],
      mentalTendencies: 'Your mind is like the wind — quick, curious, and impossible to contain. You see multiple perspectives with rare clarity.',
    },
    relationships: {
      approach: 'You approach love with a desire for partnership that respects your independence. You need relationships that feel like two trees growing side by side.',
      compatibility: 'Best compatibility with Hasta, Shravana, and Ardra nakshatras. You need a partner who gives you room to breathe.',
      emotionalNeeds: 'Freedom and autonomy within the relationship, intellectual stimulation and shared curiosity, honest and direct communication.',
    },
    career: {
      naturalTalents: ['Entrepreneurship and independent business', 'Diplomacy and negotiation', 'Innovation and disruptive thinking', 'Communication and media'],
      bestCareers: ['Entrepreneurship & freelance work', 'Diplomacy & international relations', 'Journalism & broadcasting', 'Technology & innovation', 'Consulting & strategy'],
      lifeLessons: 'To learn that the deepest freedom is found not in escaping commitment but in choosing it consciously.',
      karmicThemes: 'Transforming restlessness into purposeful movement; learning that independence reaches its highest expression in conscious interdependence.',
    },
    spiritual: {
      mantra: 'Om Vayave Namaha',
      practices: ['Breathwork (pranayama) as primary spiritual practice', 'Wind meditation — feeling the air move through and around you', 'Solo travel as spiritual pilgrimage', 'Study of diverse philosophical traditions'],
      meditationFocus: 'Sit in an open space and feel the wind on your skin — notice how it moves freely, touches everything, owns nothing. Then feel your own breath as the wind within you.',
    },
  },
  Vishakha: {
    name: 'Vishakha',
    symbol: '⛩️',
    symbolMeaning: 'Triumphal Arch or Forked Branch — representing determination, the power to achieve goals through unwavering focus, and the ability to pursue multiple paths simultaneously',
    rulingDeity: 'Indragni',
    deityDescription: 'The dual deities Indra (king of gods) and Agni (fire god) joined together, representing the fusion of power and transformation. Indragni embodies determination to achieve greatness.',
    rulingPlanet: 'Jupiter',
    rulingPlanetSymbol: '♃',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Libra): Goal-oriented diplomat, pursues success through partnership and social grace',
      'Pada 2 (Libra): Ambitious idealist, combines high standards with strategic thinking',
      'Pada 3 (Scorpio): Intense achiever, channels powerful will into transformative accomplishments',
      'Pada 4 (Scorpio): Spiritual warrior, uses determination in service of higher purpose',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is driven by purpose and goal-orientation — you feel most fulfilled when working toward something meaningful.',
      strengths: ['Unwavering determination and focus', 'Ability to pursue multiple goals simultaneously', 'Charismatic leadership and influence', 'Capacity to inspire others toward shared vision'],
      growthAreas: ['Finding contentment in the journey, not just the destination', 'Balancing ambition with emotional presence', 'Accepting that some goals require patience rather than force', 'Developing flexibility when plans encounter obstacles'],
      mentalTendencies: 'Your mind is a strategic powerhouse — you think in terms of goals, milestones, and paths to success.',
    },
    relationships: {
      approach: 'You approach relationships as partnerships in growth and achievement. You are deeply loyal to those who share your vision.',
      compatibility: 'Best compatibility with Anuradha, Punarvasu, and Swati nakshatras. You need a partner who supports your ambitions.',
      emotionalNeeds: 'A partner who believes in your vision and supports your goals, shared purpose and direction, recognition for your achievements, a balance between ambition and intimacy.',
    },
    career: {
      naturalTalents: ['Strategic planning and goal achievement', 'Leadership in competitive environments', 'Multi-tasking and managing complex projects', 'Inspiring and motivating teams'],
      bestCareers: ['Executive leadership & management', 'Law & advocacy', 'Military & defense strategy', 'Event production & project management', 'Politics & public service'],
      lifeLessons: 'To learn that the arch you build is not just for triumph but for passage, and that the greatest achievement is becoming the person your goals were meant to serve.',
      karmicThemes: 'Transforming ambition into purpose; learning that the fire of determination reaches its highest expression when it warms rather than burns.',
    },
    spiritual: {
      mantra: 'Om Indragnibhyam Namaha',
      practices: ['Goal-setting as spiritual practice with intention and surrender', 'Fire ceremony (homa) for transformation of will', 'Service projects that channel ambition into social good', 'Studying sacred texts on dharma and right action'],
      meditationFocus: 'Visualize a triumphal arch before you — you have achieved, you have arrived. Now look beyond the arch to the vast horizon.',
    },
  },
  Anuradha: {
    name: 'Anuradha',
    symbol: '🪷',
    symbolMeaning: 'Lotus or Disc — representing the beauty that emerges from the depths, devotion, and the power of controlled intensity',
    rulingDeity: 'Mitra',
    deityDescription: 'The God of Divine Friendship, Contracts, and Compassion. Mitra represents the sacred bonds that unite people in trust and mutual support.',
    rulingPlanet: 'Saturn',
    rulingPlanetSymbol: '♄',
    element: 'Fire',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Scorpio): Devoted friend, combines deep emotional intensity with unwavering loyalty',
      'Pada 2 (Scorpio): Disciplined explorer, navigates the depths with structured wisdom and patience',
      'Pada 3 (Sagittarius): Philosophical guide, transforms personal depth into universal wisdom',
      'Pada 4 (Sagittarius): Spiritual community builder, creates sacred spaces for collective growth',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are deep, devoted, and often kept hidden beneath a composed exterior — like a lotus rooted in the depths, your beauty emerges from profound inner work.',
      strengths: ['Exceptional loyalty and devotion', 'Ability to find beauty in difficult circumstances', 'Disciplined approach to emotional growth', 'Natural gift for creating harmony in groups'],
      growthAreas: ['Trusting others with your deeper feelings', 'Releasing the need to control emotional outcomes', 'Allowing vulnerability without fear of betrayal', 'Balancing devotion to others with self-nurture'],
      mentalTendencies: 'Your mind is both deep and structured — you can explore the most challenging emotional territory with patience and discipline.',
    },
    relationships: {
      approach: 'You are one of the most devoted partners in the zodiac, offering loyalty that withstands any test.',
      compatibility: 'Best compatibility with Vishakha, Pushya, and Rohini nakshatras. You need a partner who matches your depth of commitment.',
      emotionalNeeds: 'Loyalty and consistency above all, a partner who can navigate emotional depths with you, shared spiritual or philosophical values, recognition for your devotion.',
    },
    career: {
      naturalTalents: ['Diplomatic relations and conflict resolution', 'Organizational development and team building', 'Research and deep investigation', 'Spiritual counseling and guidance'],
      bestCareers: ['Diplomacy & international relations', 'Organizational psychology & HR', 'Spiritual counseling & ministry', 'Research science & investigation', 'Social work & community organizing'],
      lifeLessons: 'To learn that the lotus opens most fully when it trusts the mud from which it grows, and that devotion to others must include devotion to yourself.',
      karmicThemes: 'Transforming the fear of betrayal into the courage of trust; learning that the deepest bonds are forged not through control but through surrender.',
    },
    spiritual: {
      mantra: 'Om Mitraya Namaha',
      practices: ['Loving-kindness (metta) meditation', 'Community service and seva as devotion', 'Lotus visualization meditation', 'Building and maintaining sacred friendships'],
      meditationFocus: 'Visualize a lotus flower growing from the dark mud below the water — feel the journey from depth to light, from hidden to revealed.',
    },
  },
  Jyeshtha: {
    name: 'Jyeshtha',
    symbol: '💫',
    symbolMeaning: 'Earring or Umbrella — representing the mature elder, the wisdom that comes through experience, and the responsibility of protecting others',
    rulingDeity: 'Indra',
    deityDescription: 'The King of the Gods and warrior chieftain of the celestial realms. Indra represents the power of leadership earned through courage and sacrifice.',
    rulingPlanet: 'Mercury',
    rulingPlanetSymbol: '☿',
    element: 'Water',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Scorpio): Fierce protector, combines emotional depth with commanding authority',
      'Pada 2 (Scorpio): Strategic elder, uses hard-won wisdom to guide others through difficulty',
      'Pada 3 (Sagittarius): Philosophical warrior, transforms personal battles into universal teachings',
      'Pada 4 (Sagittarius): Spiritual elder, leads through wisdom, humility, and protective grace',
    ],
    personality: {
      emotionalTendencies: 'Your emotions carry the weight and wisdom of experience — you have often felt like the eldest sibling, the responsible one, the protector.',
      strengths: ['Natural leadership born of genuine experience', 'Protective instinct and courage in adversity', 'Deep wisdom and maturity beyond your years', 'Ability to guide others through their darkest moments'],
      growthAreas: ['Allowing yourself to be vulnerable and receive care', 'Releasing the need to be the strongest in every situation', 'Trusting that others can handle their own challenges', 'Finding joy and lightness alongside responsibility'],
      mentalTendencies: 'Your mind is strategic, experienced, and oriented toward protecting what matters. You think several moves ahead.',
    },
    relationships: {
      approach: 'You approach relationships as a protector and guide, offering strength, wisdom, and unwavering support.',
      compatibility: 'Best compatibility with Ashlesha, Revati, and Anuradha nakshatras. You need a partner who respects your strength while encouraging your vulnerability.',
      emotionalNeeds: 'Respect and recognition for your protective efforts, a partner who creates safe space for your vulnerability, shared responsibility rather than carrying the load alone.',
    },
    career: {
      naturalTalents: ['Crisis leadership and emergency management', 'Mentoring and elder wisdom transmission', 'Strategic planning and risk assessment', 'Protective services and defense'],
      bestCareers: ['Emergency services & crisis management', 'Executive leadership & senior management', 'Military & defense', 'Psychology & elder care', 'Legal advocacy & public defense'],
      lifeLessons: 'To learn that the truest strength includes the courage to be weak, and that the elder who serves does not carry the world alone.',
      karmicThemes: 'Transforming the burden of responsibility into the gift of service; learning that protection reaches its highest form when it empowers rather than controls.',
    },
    spiritual: {
      mantra: 'Om Indraya Namaha',
      practices: ['Mentoring others as spiritual practice', 'Warrior meditation — stillness within action', 'Releasing the burden of excessive responsibility', 'Thunderstorm meditation — finding peace within power'],
      meditationFocus: 'Visualize a great umbrella that has sheltered many through storms — feel the weight of that service, the love that drives it. Then let the umbrella fold, and stand in the rain yourself.',
    },
  },
  Mula: {
    name: 'Mula',
    symbol: '🌳',
    symbolMeaning: 'Root or Tied Bunch — representing the foundation of all things, the courage to reach the root cause, and the power that lies in the depths',
    rulingDeity: 'Nirriti',
    deityDescription: 'The Goddess of Dissolution and the Dark Void, who rules over the destruction of false structures and the revelation of hidden truth.',
    rulingPlanet: 'Ketu',
    rulingPlanetSymbol: '☊',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Sagittarius): Root destroyer, tears down false structures to reveal essential truth',
      'Pada 2 (Sagittarius): Deep philosopher, seeks the root cause of suffering and existence',
      'Pada 3 (Sagittarius): Transformation catalyst, channels destructive insight into healing',
      'Pada 4 (Capricorn): Practical revolutionary, builds new structures from the ruins of the old',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is characterized by a relentless drive to reach the truth — no matter how uncomfortable. You are willing to feel everything fully.',
      strengths: ['Fearless pursuit of truth at any cost', 'Ability to transform destruction into renewal', 'Deep philosophical and spiritual insight', 'Courage to face the root causes of suffering'],
      growthAreas: ['Trusting that not every root needs to be pulled up', 'Developing patience with the pace of natural growth', 'Allowing beauty and pleasure without guilt', 'Building as skillfully as you deconstruct'],
      mentalTendencies: 'Your mind is like a root system — it goes deep, seeking the hidden source of everything. This penetrating intelligence gives you exceptional insight.',
    },
    relationships: {
      approach: 'You approach relationships with the same fearless intensity — you want to reach the root of your connection, strip away pretense, and love from absolute authenticity.',
      compatibility: 'Best compatibility with Ashwini, Magha, and Revati nakshatras. You need a partner who can handle your intensity.',
      emotionalNeeds: 'Absolute honesty and authenticity, a partner who doesn\'t flinch from difficult truths, space for periodic destruction and renewal, depth that matches your own.',
    },
    career: {
      naturalTalents: ['Root cause analysis and investigation', 'Transformative healing and therapy', 'Philosophical inquiry and research', 'Revolution and systemic change'],
      bestCareers: ['Surgery & root canal dentistry', 'Psychology & depth therapy', 'Investigative journalism', 'Herbalism & alternative medicine', 'Social reform & activism'],
      lifeLessons: 'To learn that the root that destroys also nourishes, and that the courage to reach the depths must be balanced with the wisdom to let flowers bloom.',
      karmicThemes: 'Transforming destructive insight into constructive wisdom; learning that the power to uproot must be matched with the patience to plant.',
    },
    spiritual: {
      mantra: 'Om Nirrityai Namaha',
      practices: ['Root chakra grounding meditations', 'Working with herbs and roots as spiritual practice', 'Shadow work and conscious destruction of limiting beliefs', 'Meditation on impermanence and the cycle of death-rebirth'],
      meditationFocus: 'Visualize a great tree being uprooted — feel the destruction, the exposure of what was hidden. Then see how the soil, now turned, becomes fertile ground for new seeds.',
    },
  },
  'Purva Ashadha': {
    name: 'Purva Ashadha',
    symbol: '🐘',
    symbolMeaning: 'Elephant Tusk or Fan — representing the power of invincibility, the pursuit of victory, and the cleansing energy that washes away obstacles',
    rulingDeity: 'Apah',
    deityDescription: 'The Goddess of Cosmic Waters who purifies, sustains, and empowers all of life. Apah represents the cleansing power of water that washes away obstacles.',
    rulingPlanet: 'Venus',
    rulingPlanetSymbol: '♀',
    element: 'Water',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Sagittarius): Unconquerable spirit, pursues truth and victory with passionate determination',
      'Pada 2 (Sagittarius): Philosophical warrior, channels competitive energy into intellectual conquest',
      'Pada 3 (Capricorn): Ambitious builder, transforms vision into structured achievement',
      'Pada 4 (Capricorn): Practical visionary, balances idealistic goals with grounded execution',
    ],
    personality: {
      emotionalTendencies: 'Your emotions flow with the power of a river — persistent, determined, and ultimately unstoppable when directed toward a goal.',
      strengths: ['Invincible will and determination', 'Ability to purify and cleanse difficult situations', 'Competitive spirit that drives excellence', 'Natural charisma and persuasive power'],
      growthAreas: ['Accepting that not every situation requires conquest', 'Developing patience with the process rather than just the outcome', 'Balancing competitive drive with cooperative spirit', 'Learning that vulnerability can be a form of strength'],
      mentalTendencies: 'Your mind is oriented toward victory and purification — you think in terms of overcoming, achieving, and cleansing.',
    },
    relationships: {
      approach: 'You bring passion, determination, and a desire for shared victory to relationships. You want a partnership where both people are growing and achieving.',
      compatibility: 'Best compatibility with Uttara Ashadha, Shravana, and Rohini nakshatras. You need a partner who shares your drive.',
      emotionalNeeds: 'A partner who celebrates your victories and supports your ambitions, shared goals and adventures, intellectual and philosophical connection.',
    },
    career: {
      naturalTalents: ['Competitive excellence and achievement', 'Persuasive communication and advocacy', 'Purification and quality improvement', 'Leadership in challenging environments'],
      bestCareers: ['Law & litigation', 'Athletics & competitive sports', 'Sales & business development', 'Water engineering & environmental science', 'Coaching & motivational speaking'],
      lifeLessons: 'To learn that the deepest victory is not over others but over yourself, and that the water that conquers all obstacles does so through persistence, not force.',
      karmicThemes: 'Transforming the need to win into the desire to excel; learning that true invincibility comes from alignment with purpose.',
    },
    spiritual: {
      mantra: 'Om Apah Devatayai Namaha',
      practices: ['Water purification rituals and ceremonies', 'Competitive spiritual practice (debate, martial arts)', 'River or ocean meditation', 'Charity and cleansing service to others'],
      meditationFocus: 'Visualize a river flowing powerfully through obstacles — around rocks, over falls, ever moving toward the sea. Feel the persistence, the cleansing power, the inevitability.',
    },
  },
  'Uttara Ashadha': {
    name: 'Uttara Ashadha',
    symbol: '🏖️',
    symbolMeaning: 'Elephant Tusk or Plank of a Bed — representing the final victory, the consolidation of achievement, and the wisdom that comes after the battle is won',
    rulingDeity: 'Vishvedevas',
    deityDescription: 'The Universal Gods who represent the collective wisdom of all divine principles. The Vishvedevas embody the integrated understanding that comes when all partial truths are united.',
    rulingPlanet: 'Sun',
    rulingPlanetSymbol: '☉',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Sagittarius): Visionary victor, achieves goals through philosophical depth and moral clarity',
      'Pada 2 (Capricorn): Strategic achiever, builds lasting success through disciplined effort and integrity',
      'Pada 3 (Capricorn): Ethical leader, combines authority with genuine concern for collective welfare',
      'Pada 4 (Capricorn): Wise builder, constructs enduring structures that serve the highest good',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are dignified, principled, and oriented toward the greater good. You feel most fulfilled when your personal achievements contribute to something larger.',
      strengths: ['Unwavering integrity and moral clarity', 'Capacity for sustained effort toward meaningful goals', 'Leadership that serves rather than dominates', 'Ability to integrate diverse perspectives into unified vision'],
      growthAreas: ['Balancing achievement with emotional vulnerability', 'Accepting that rest is not the enemy of accomplishment', 'Allowing imperfection in yourself and others', 'Finding joy in the process, not just the outcome'],
      mentalTendencies: 'Your mind integrates diverse knowledge into comprehensive understanding — you see how all the pieces fit together.',
    },
    relationships: {
      approach: 'You approach relationships with integrity, commitment, and a desire for shared purpose.',
      compatibility: 'Best compatibility with Purva Ashadha, Shravana, and Pushya nakshatras. You need a partner who shares your values.',
      emotionalNeeds: 'A partner who respects your integrity and shares your values, shared purpose and mission, emotional honesty and direct communication, appreciation for your sustained efforts.',
    },
    career: {
      naturalTalents: ['Integrated strategic thinking', 'Ethical leadership and governance', 'Long-term planning and execution', 'Teaching and synthesizing diverse knowledge'],
      bestCareers: ['Government & public service', 'Corporate strategy & executive leadership', 'Education & academic leadership', 'Law & judiciary', 'Architecture & urban planning'],
      lifeLessons: 'To learn that the final victory is not the achievement itself but the person you become through the striving.',
      karmicThemes: 'Transforming personal ambition into universal service; learning that the highest achievement is the one that elevates all beings.',
    },
    spiritual: {
      mantra: 'Om Vishvedebhyo Namaha',
      practices: ['Service to community as spiritual practice', 'Study of universal wisdom traditions', 'Leadership with conscious humility', 'Integrating diverse spiritual practices into unified path'],
      meditationFocus: 'Visualize standing at the summit after a long climb — see the vast vista below, feel the integration of all you\'ve learned. Then turn not inward in pride but outward in gratitude.',
    },
  },
  Shravana: {
    name: 'Shravana',
    symbol: '👂',
    symbolMeaning: 'Ear or Three Footprints — representing the power of listening, learning, and receiving divine guidance through attentive awareness',
    rulingDeity: 'Vishnu',
    deityDescription: 'The Preserver God who sustains the cosmic order through divine attention and compassionate vigilance. Vishnu represents the sacred act of listening to the universe.',
    rulingPlanet: 'Moon',
    rulingPlanetSymbol: '☽',
    element: 'Air',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Capricorn): Attentive builder, listens deeply to create enduring structures of meaning',
      'Pada 2 (Capricorn): Practical sage, channels received wisdom into actionable guidance',
      'Pada 3 (Aquarius): Visionary listener, receives and translates cosmic messages for humanity',
      'Pada 4 (Aquarius): Universal teacher, shares gathered wisdom for the upliftment of all beings',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are receptive, empathetic, and deeply attuned to the feelings of others. You are an exceptional listener who absorbs emotional information like a sponge.',
      strengths: ['Extraordinary listening and learning ability', 'Deep receptivity and empathy', 'Capacity to gather and synthesize knowledge', 'Natural teaching and counseling gift'],
      growthAreas: ['Setting emotional boundaries while maintaining receptivity', 'Trusting your own voice alongside your ability to listen', 'Processing what you absorb rather than simply carrying it', 'Distinguishing between helpful receptivity and emotional enmeshment'],
      mentalTendencies: 'Your mind is a receiver — constantly picking up signals, information, and insights from your environment.',
    },
    relationships: {
      approach: 'You are the listener in relationships — the one who truly hears, remembers, and responds to your partner\'s deepest needs.',
      compatibility: 'Best compatibility with Hasta, Rohini, and Pushya nakshatras. You need a partner who listens as deeply as you do.',
      emotionalNeeds: 'Being truly heard and understood, a partner who remembers what you share, intellectual and spiritual connection, quiet environments for emotional processing.',
    },
    career: {
      naturalTalents: ['Teaching and knowledge transmission', 'Counseling and therapeutic listening', 'Research and information gathering', 'Music and sound healing'],
      bestCareers: ['Education & academic research', 'Counseling & psychotherapy', 'Music & sound engineering', 'Journalism & documentary filmmaking', 'Translation & linguistic services'],
      lifeLessons: 'To learn that the ear that listens must also find its voice, and that receiving wisdom carries the responsibility of sharing it wisely.',
      karmicThemes: 'Transforming passive reception into active wisdom; learning that the deepest listening hears not just words but the silence between them.',
    },
    spiritual: {
      mantra: 'Om Vishnave Namaha',
      practices: ['Sacred listening meditation — hearing the divine in all sounds', 'Study of scripture and sacred texts', 'Music and chanting as devotional practice', 'Silent retreat and contemplative listening'],
      meditationFocus: 'Close your eyes and listen — to the sounds near and far, the rhythm of your breath, the silence beneath all noise. In that silence, hear the voice of your deepest wisdom.',
    },
  },
  Dhanishtha: {
    name: 'Dhanishtha',
    symbol: '🥁',
    symbolMeaning: 'Drum — representing rhythm, abundance, and the cosmic sound that orchestrates the dance of creation',
    rulingDeity: 'Vasus',
    deityDescription: 'The Eight Vasus — divine beings who represent the elements and gifts of nature. Together they embody the rhythm of cosmic abundance and the music of the spheres.',
    rulingPlanet: 'Mars',
    rulingPlanetSymbol: '♂',
    element: 'Fire',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Capricorn): Rhythmic achiever, orchestrates success through timing and discipline',
      'Pada 2 (Capricorn): Material musician, creates abundance through structured creativity',
      'Pada 3 (Aquarius): Community conductor, leads groups through shared rhythm and purpose',
      'Pada 4 (Aquarius): Cosmic dancer, channels universal rhythms into transformative expression',
    ],
    personality: {
      emotionalTendencies: 'Your emotions move in rhythms — periods of intense expression followed by quiet reflection. You are deeply attuned to the timing of emotional exchanges.',
      strengths: ['Natural sense of timing and rhythm', 'Ability to create abundance through structured effort', 'Charismatic leadership through shared purpose', 'Musical and artistic sensitivity'],
      growthAreas: ['Balancing material success with emotional depth', 'Avoiding the tendency to orchestrate others\' lives', 'Developing comfort with silence between beats', 'Sharing the spotlight with those you lead'],
      mentalTendencies: 'Your mind works in patterns and rhythms — you perceive the timing and structure in situations that others miss.',
    },
    relationships: {
      approach: 'You bring rhythm, structure, and a desire for shared prosperity to relationships. You naturally take the conductor role.',
      compatibility: 'Best compatibility with Shravana, Hasta, and Rohini nakshatras. You need a partner who appreciates your leadership while maintaining their own rhythm.',
      emotionalNeeds: 'A partner who respects your timing and rhythm, shared material goals and prosperity, creative collaboration, recognition for your orchestrating efforts.',
    },
    career: {
      naturalTalents: ['Musical and rhythmic arts', 'Wealth creation and financial management', 'Organizational leadership and coordination', 'Event production and performance'],
      bestCareers: ['Music & performing arts', 'Finance & investment management', 'Event production & entertainment', 'Military & orchestral conducting', 'Project management & operations'],
      lifeLessons: 'To learn that the drum that leads the dance must also know when to rest, and that the greatest wealth is the rhythm that brings people together.',
      karmicThemes: 'Transforming the need to control the rhythm into the capacity to flow with it; learning that abundance multiplies when shared like music.',
    },
    spiritual: {
      mantra: 'Om Vasubhyo Namaha',
      practices: ['Drumming and rhythmic meditation', 'Prosperity consciousness practices', 'Group music and chanting circles', 'Charitable giving as spiritual practice'],
      meditationFocus: 'Visualize a great drum at the center of a cosmic dance — feel the rhythm that moves through all things, the pulse of creation itself.',
    },
  },
  Shatabhisha: {
    name: 'Shatabhisha',
    symbol: '⭕',
    symbolMeaning: 'Empty Circle or Hundred Physicians — representing the void that contains everything, the hundred healers, and the power of containing the uncontainable',
    rulingDeity: 'Varuna',
    deityDescription: 'The Cosmic Judge and Lord of the Oceans who sees all truth hidden beneath the surface. Varuna represents the all-seeing eye that perceives the truth behind appearances.',
    rulingPlanet: 'Rahu',
    rulingPlanetSymbol: '☊',
    element: 'Air',
    gana: 'Rakshasa',
    padaDescriptions: [
      'Pada 1 (Aquarius): Visionary healer, sees the truth behind appearances and brings hidden patterns to light',
      'Pada 2 (Aquarius): Unconventional therapist, uses innovative approaches to heal what others cannot reach',
      'Pada 3 (Aquarius): Cosmic observer, perceives the vast patterns that connect all of existence',
      'Pada 4 (Pisces): Mystical healer, channels transcendent wisdom into compassionate service',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are complex, private, and often contained within an invisible circle — you feel deeply but prefer to process internally before sharing.',
      strengths: ['Exceptional healing and therapeutic ability', 'Capacity to see hidden truth and patterns', 'Independence and self-containment', 'Innovative and unconventional thinking'],
      growthAreas: ['Allowing others into your emotional circle', 'Balancing privacy with intimacy', 'Trusting that vulnerability strengthens rather than weakens', 'Avoiding emotional isolation as a default state'],
      mentalTendencies: 'Your mind is like a vast, clear sky — it sees everything, holds everything, but remains detached. This objectivity gives you exceptional healing and diagnostic ability.',
    },
    relationships: {
      approach: 'You approach relationships with caution and selectivity, allowing very few people into your inner circle.',
      compatibility: 'Best compatibility with Swati, Ardra, and Shravana nakshatras. You need a partner who respects your need for space while gently encouraging emotional openness.',
      emotionalNeeds: 'Respect for your privacy and emotional boundaries, a partner who doesn\'t pressure you to open up, intellectual and spiritual depth in connection, freedom to be alone when needed.',
    },
    career: {
      naturalTalents: ['Healing and alternative medicine', 'Scientific research and innovation', 'Technology and digital fields', 'Counseling and psychological insight'],
      bestCareers: ['Alternative medicine & holistic healing', 'Scientific research & laboratory work', 'Technology & cybersecurity', 'Psychology & therapeutic practice', 'Astronomy & space science'],
      lifeLessons: 'To learn that the empty circle is not void but fullness — and that the healer who contains all must also allow themselves to be contained by love.',
      karmicThemes: 'Transforming emotional isolation into chosen intimacy; learning that the circle that protects can also imprison if it never opens.',
    },
    spiritual: {
      mantra: 'Om Varunaya Namaha',
      practices: ['Circle meditation — embracing the void as fullness', 'Water healing and hydrotherapy rituals', 'Stargazing as contemplative practice', 'Confession and truth-speaking as spiritual purification'],
      meditationFocus: 'Visualize a perfect circle of light surrounding you — feel its protective, containing power. Then let the circle expand outward, growing larger until it includes everything.',
    },
  },
  'Purva Bhadrapada': {
    name: 'Purva Bhadrapada',
    symbol: '🗡️',
    symbolMeaning: 'Front Legs of the Funeral Cot or Sword — representing the power of spiritual transformation, the courage to face mortality, and the fire that burns away the inessential',
    rulingDeity: 'Aja Ekapada',
    deityDescription: 'The One-Legged Goat — a fierce, ascetic deity who represents the power of single-pointed focus, spiritual austerity, and the transformative fire that burns on the funeral pyre of the ego.',
    rulingPlanet: 'Jupiter',
    rulingPlanetSymbol: '♃',
    element: 'Fire',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Aquarius): Spiritual warrior, channels intensity into transformative social vision',
      'Pada 2 (Aquarius): Philosophical radical, challenges conventional thinking with piercing insight',
      'Pada 3 (Pisces): Mystical transformer, bridges the gap between spiritual fire and universal compassion',
      'Pada 4 (Pisces): Devoted mystic, surrenders personal will to the transformative power of the divine',
    ],
    personality: {
      emotionalTendencies: 'Your emotional life is intense, transformative, and often experienced as a crucible — you go through emotional fires that burn away what is false.',
      strengths: ['Fearless commitment to truth and transformation', 'Capacity for profound spiritual and psychological depth', 'Willingness to sacrifice comfort for authenticity', 'Ability to inspire transformation in others'],
      growthAreas: ['Finding peace and joy alongside intensity', 'Accepting that not everything needs to be transformed', 'Developing lightness and humor as spiritual tools', 'Allowing rest without guilt between transformative periods'],
      mentalTendencies: 'Your mind is drawn to the ultimate questions — life, death, meaning, transformation. You think in terms of essences and first principles.',
    },
    relationships: {
      approach: 'You seek relationships of transformative depth — connections that challenge you to grow and that honor the spiritual dimension of love.',
      compatibility: 'Best compatibility with Uttara Bhadrapada, Vishakha, and Anuradha nakshatras. You need a partner who can walk through fire with you.',
      emotionalNeeds: 'Authenticity and depth without pretense, a partner who supports your spiritual journey, space for solitude and contemplation, honesty even when it\'s uncomfortable.',
    },
    career: {
      naturalTalents: ['Spiritual teaching and guidance', 'Philosophical inquiry and writing', 'Transformative healing and therapy', 'Advocacy for the marginalized and oppressed'],
      bestCareers: ['Spiritual teaching & ministry', 'Philosophy & theology', 'Hospice care & death doula work', 'Social justice & advocacy', 'Martial arts & disciplined practice'],
      lifeLessons: 'To learn that the funeral fire that burns the inessential also illuminates what remains, and that the warrior\'s greatest victory is the peace that follows the battle.',
      karmicThemes: 'Transforming the compulsion toward intensity into the capacity for equanimity; learning that the fire that purifies can also warm.',
    },
    spiritual: {
      mantra: 'Om Aja Ekapadaya Namaha',
      practices: ['Fire ceremony and candle gazing meditation', 'Contemplation on impermanence and mortality', 'Fasting and conscious austerity', 'Service to the dying and bereaved'],
      meditationFocus: 'Visualize a sacred fire burning on a funeral pyre — watch as everything false is consumed. What remains is pure gold — your essential self, luminous and eternal.',
    },
  },
  'Uttara Bhadrapada': {
    name: 'Uttara Bhadrapada',
    symbol: '🪞',
    symbolMeaning: 'Back Legs of the Funeral Cot or Twins — representing the wisdom that follows transformation, the depth of peaceful acceptance, and the connection between the seen and unseen worlds',
    rulingDeity: 'Ahir Budhnya',
    deityDescription: 'The Serpent of the Deep who dwells in the cosmic ocean\'s depths, connecting the visible world to the hidden realms below. Ahir Budhnya represents the profound peace that comes after transformation.',
    rulingPlanet: 'Saturn',
    rulingPlanetSymbol: '♄',
    element: 'Water',
    gana: 'Manushya',
    padaDescriptions: [
      'Pada 1 (Pisces): Deep mystic, accesses profound spiritual wisdom through patient inner exploration',
      'Pada 2 (Pisces): Compassionate anchor, provides stable support for others navigating turbulent waters',
      'Pada 3 (Pisces): Intuitive healer, channels deep wisdom into practical therapeutic care',
      'Pada 4 (Aries): Grounded pioneer, brings the wisdom of the depths into courageous new action',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are deep, still, and profoundly wise — like the ocean floor, they hold the accumulated wisdom of many transformative experiences.',
      strengths: ['Profound inner peace and wisdom', 'Patience that endures through any trial', 'Deep compassion born of genuine understanding', 'Ability to connect the visible and invisible worlds'],
      growthAreas: ['Avoiding emotional stagnation beneath the surface calm', 'Sharing your depth more freely with trusted others', 'Balancing stillness with necessary movement', 'Allowing yourself lightness without feeling you\'re being superficial'],
      mentalTendencies: 'Your mind is like a deep well — quiet on the surface but containing profound wisdom at its depths.',
    },
    relationships: {
      approach: 'You bring depth, patience, and unwavering loyalty to relationships. You are the anchor that keeps the partnership stable through turbulent times.',
      compatibility: 'Best compatibility with Purva Bhadrapada, Pushya, and Rohini nakshatras. You need a partner who values depth over excitement.',
      emotionalNeeds: 'Deep emotional safety and trust, a partner who values consistency and patience, shared spiritual or contemplative practice, freedom to be quiet without being misunderstood.',
    },
    career: {
      naturalTalents: ['Deep research and scholarly work', 'End-of-life care and counseling', 'Meditation and contemplative teaching', 'Connecting diverse communities and perspectives'],
      bestCareers: ['Research & academic scholarship', 'Hospice & palliative care', 'Spiritual counseling & ministry', 'Oceanography & deep-sea research', 'Conflict resolution & peacebuilding'],
      lifeLessons: 'To learn that the deep stillness you carry is not stagnation but the peace that passeth understanding, and that the wisdom of the depths must occasionally surface to share its light.',
      karmicThemes: 'Transforming isolation into chosen solitude; learning that the depths are not a place to hide but a well from which to draw nourishment for all beings.',
    },
    spiritual: {
      mantra: 'Om Ahir Budhnyaya Namaha',
      practices: ['Deep water meditation and ocean contemplation', 'Extended silent retreat and contemplation', 'Service to those in grief and transition', 'Connecting heaven and earth through prayer and ritual'],
      meditationFocus: 'Visualize the bottom of the ocean — perfectly still, profoundly peaceful, holding the memory of every wave. Feel this deep stillness within yourself, unshakeable and eternal.',
    },
  },
  Revati: {
    name: 'Revati',
    symbol: '🐟',
    symbolMeaning: 'Fish or Pair of Fish — representing the final journey, the completion of all paths, and the transcendence that comes from navigating every ocean of experience',
    rulingDeity: 'Pushan',
    deityDescription: 'The Nourishing God and Divine Shepherd who guides souls along their journey, protects travelers, and ensures safe passage. Pushan represents the loving guidance that accompanies us through all of life\'s transitions.',
    rulingPlanet: 'Mercury',
    rulingPlanetSymbol: '☿',
    element: 'Water',
    gana: 'Deva',
    padaDescriptions: [
      'Pada 1 (Pisces): Compassionate guide, leads others through transitions with gentle wisdom',
      'Pada 2 (Pisces): Intuitive navigator, senses the right path through life\'s oceans with remarkable accuracy',
      'Pada 3 (Pisces): Creative dreamer, channels cosmic imagination into artistic and spiritual expression',
      'Pada 4 (Aries): Pioneering shepherd, guides others into new beginnings with courage and tenderness',
    ],
    personality: {
      emotionalTendencies: 'Your emotions are vast, compassionate, and oceanic — you contain depths of feeling that encompass the entire range of human experience.',
      strengths: ['Boundless compassion and empathy', 'Gift for guiding others through transitions', 'Creative imagination and cosmic vision', 'Ability to complete what has been started'],
      growthAreas: ['Setting boundaries on your compassion to prevent depletion', 'Trusting your own path when others seek your guidance', 'Staying grounded while exploring cosmic consciousness', 'Distinguishing between healthy completion and premature closure'],
      mentalTendencies: 'Your mind is like an ocean — vast, deep, and containing multitudes. You can hold contradictory ideas simultaneously.',
    },
    relationships: {
      approach: 'You bring compassion, guidance, and a deep desire to nurture your partner\'s growth to relationships. You naturally take on the role of shepherd.',
      compatibility: 'Best compatibility with Ashwini, Bharani, and Jyeshtha nakshatras. You need a partner who appreciates your nurturing nature while helping you set healthy boundaries.',
      emotionalNeeds: 'A partner who sees and appreciates your depth, shared spiritual or creative practice, emotional reciprocity, a sense of completion and arrival in love.',
    },
    career: {
      naturalTalents: ['Guiding and mentoring others', 'Creative and artistic expression', 'Transition and change management', 'Navigation and logistics'],
      bestCareers: ['Counseling & spiritual guidance', 'Arts & creative writing', 'Travel & tourism', 'Logistics & supply chain management', 'Midwifery & transition care'],
      lifeLessons: 'To learn that the fish that has swum every ocean must also learn to rest on the shore, and that the guide who helps others arrive must also honor their own journey\'s completion.',
      karmicThemes: 'Completing the cycle of seeking and finding; learning that the journey\'s end and beginning are the same point on the circle of existence.',
    },
    spiritual: {
      mantra: 'Om Pushne Namaha',
      practices: ['Pilgrimage and sacred travel as spiritual practice', 'Compassion meditation (karuna bhavana)', 'Dream work and lucid dreaming', 'Guiding others in meditation and spiritual practice'],
      meditationFocus: 'Visualize a pair of fish swimming through a vast, luminous ocean — they know every current, every depth, every shore. Feel yourself as both the fish and the ocean.',
    },
  },
};

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

const cache = new Map<string, { data: NakshatraDetail; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nakshatra = searchParams.get('nakshatra');

    if (!nakshatra) {
      return NextResponse.json(
        { error: 'Missing required query parameter: nakshatra' },
        { status: 400 }
      );
    }

    // Check cache
    const cached = cache.get(nakshatra);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data });
    }

    // Look up nakshatra data
    const data = NAKSHATRA_DATA[nakshatra];
    if (!data) {
      // Try case-insensitive match
      const keys = Object.keys(NAKSHATRA_DATA);
      const match = keys.find(
        (k) => k.toLowerCase() === nakshatra.toLowerCase()
      );
      if (!match) {
        return NextResponse.json(
          { error: `Nakshatra "${nakshatra}" not found. Available: ${keys.join(', ')}` },
          { status: 404 }
        );
      }
      const matchedData = NAKSHATRA_DATA[match];
      cache.set(match, { data: matchedData, timestamp: Date.now() });
      return NextResponse.json({ data: matchedData });
    }

    // Cache and return
    cache.set(nakshatra, { data, timestamp: Date.now() });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
