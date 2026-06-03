// ============================================================================
// AyuAstro AI Interpretation Engine - Local RAG Knowledge Base
// ============================================================================
// Stores curated, high-quality, practical interpretations for signs, nakshatras,
// yogas, doshas, and key planet-in-house placements.
// Focusing on real-world impact, results, shadow patterns, and career/finance truths.
// ============================================================================

export interface SignInterpretation {
  coreMotivation: string;
  emotionalClimate: string;
  outerPersona: string;
  resultsFocus: string;
}

export interface NakshatraInterpretation {
  spiritualPurpose: string;
  vocationalGenius: string;
  shadowTrap: string;
}

export interface YogaInterpretation {
  manifestation: string;
  realWorldImpact: string;
}

export interface DoshaInterpretation {
  psychologicalFriction: string;
  remedialPath: string;
}

export interface HousePlacementInterpretation {
  lifeEffect: string;
  behaviorScript: string;
}

// ─── 1. Zodiac Sign Knowledge Base ──────────────────────────────────────────

export const SIGN_INTERPRETATIONS: Record<string, SignInterpretation> = {
  Aries: {
    coreMotivation: "Driven by the impulse to initiate, pioneer, and test boundaries. Aries needs challenges to feel alive and views obstacles as fuel for self-definition.",
    emotionalClimate: "Feels intensely and immediately. Emotions are like summer storms—erupting quickly and clearing out just as fast. Vulnerability is often masked as frustration or impatience.",
    outerPersona: "Appears direct, confident, and action-oriented. Aries projects an aura of 'I can handle this,' sometimes running ahead of others without waiting.",
    resultsFocus: "Thrives in pioneering roles, startups, and competitive arenas. The impact is seen when they build new paths, though they must learn to finish what they start."
  },
  Taurus: {
    coreMotivation: "Driven by the need for stability, physical comfort, and tangible results. Taurus seeks to build resources and cultivate beauty that lasts.",
    emotionalClimate: "Steady, deliberate, and deeply grounded. Taurus processes feelings slowly and physically, holding onto emotions (and grudges) for a long time. Quiet resilience is their anchor.",
    outerPersona: "Projects calm, reliability, and sensible composure. Taurus values simple elegance and is perceived as a stabilizing presence in chaos.",
    resultsFocus: "Succeeds in asset building, design, agriculture, and financial planning. The impact is felt through sustainable systems and unwavering consistency."
  },
  Gemini: {
    coreMotivation: "Motivated by curiosity, learning, and the exchange of ideas. Gemini seeks to bridge gaps, connect concepts, and avoid stagnation at all costs.",
    emotionalClimate: "Intellectualizes feelings. Rather than simply experiencing an emotion, Gemini talks or thinks about it, trying to decode and rationalize their inner state.",
    outerPersona: "Lively, adaptable, and talkative. Projects a youthful, mentally agile vibe, always ready with a witty remark or an interesting piece of trivia.",
    resultsFocus: "Excels in journalism, marketing, sales, and networking. The impact is seen in their ability to translate complex data into engaging stories."
  },
  Cancer: {
    coreMotivation: "Driven by the need to nurture, protect, and create emotional safety. Cancer seeks deep roots, family bonds, and a sanctuary from the harsh outside world.",
    emotionalClimate: "Tidal and deeply intuitive. Cancer absorbs the emotional climate of any room instantly. They feel everything at full volume, hiding their vulnerability under a protective shell.",
    outerPersona: "Appears warm, receptive, and protective. Projects a caring, maternal/paternal aura, but can be highly private and cautious with strangers.",
    resultsFocus: "Thrives in caregiving, hospitality, real estate, and community building. The impact lies in creating spaces where people feel safe to open up."
  },
  Leo: {
    coreMotivation: "Driven by the need to express the self creatively, lead, and be recognized. Leo seeks to live from the heart and inspire others through their warmth and courage.",
    emotionalClimate: "Proud, generous, and expressive. Leo wants their feelings to matter and be seen. Underneath their bold exterior lies a deep sensitivity to rejection or neglect.",
    outerPersona: "Charismatic, warm, and theatrical. Projects confidence and leadership, often commanding attention simply by entering a room.",
    resultsFocus: "Excels in creative arts, leadership, mentoring, and public speaking. The impact is seen when they empower others to shine alongside them."
  },
  Virgo: {
    coreMotivation: "Driven by the desire to improve, analyze, and be of service. Virgo seeks order, clarity, and usefulness, constantly refining systems and self.",
    emotionalClimate: "Quietly anxious and self-critical. Virgo worries about details and tends to show love through practical helpfulness rather than emotional displays.",
    outerPersona: "Projects clean organization, intelligence, and modesty. Appears observant, meticulous, and always prepared with a practical solution.",
    resultsFocus: "Thrives in editorial work, data analysis, healthcare, and quality control. The impact is felt through flawless execution and quiet reliability."
  },
  Libra: {
    coreMotivation: "Driven by the pursuit of harmony, justice, and relational balance. Libra seeks to beautify their environment and cultivate perfect partnerships.",
    emotionalClimate: "Relational and peace-loving. Libra is uncomfortable with raw emotional conflict and will often suppress their own needs to keep the peace.",
    outerPersona: "Charming, diplomatic, and aesthetically refined. Projects an aura of grace and fairness, making others feel instantly listened to.",
    resultsFocus: "Excels in law, mediation, design, and public relations. The impact is seen in their ability to resolve disputes and bring symmetry to chaos."
  },
  Scorpio: {
    coreMotivation: "Driven by the urge to uncover hidden truths, experience psychological depth, and undergo transformation. Scorpio values absolute honesty and rejects superficiality.",
    emotionalClimate: "Volcanic, intensely private, and highly sensitive. Scorpio feels with extreme depth and hyper-vigilance, protecting their soft core with absolute control.",
    outerPersona: "Quietly powerful, magnetic, and guarded. Projects an aura of mystery and intensity, observing everything while revealing very little.",
    resultsFocus: "Thrives in psychology, crisis management, research, and investigative fields. The impact lies in their capacity to walk through fire and rebuild from scratch."
  },
  Sagittarius: {
    coreMotivation: "Driven by the search for meaning, wisdom, and freedom. Sagittarius seeks to expand horizons through travel, philosophy, and testing limits.",
    emotionalClimate: "Optimistic, restless, and idealistic. Sagittarius processes setbacks by looking for the silver lining, sometimes avoiding uncomfortable emotions by running away.",
    outerPersona: "Adventurous, friendly, and philosophically minded. Projects an enthusiastic, truth-telling vibe, occasionally blunt but always sincere.",
    resultsFocus: "Succeeds in teaching, publishing, tourism, and motivational fields. The impact is seen when they inspire others to believe in bigger possibilities."
  },
  Capricorn: {
    coreMotivation: "Driven by the need to build lasting structures, achieve mastery, and fulfill duties. Capricorn seeks self-reliance and respects order, time, and effort.",
    emotionalClimate: "Stoic, controlled, and deeply responsible. Capricorn rarely shows vulnerability, choosing to endure hardships in silence and manage their feelings through work.",
    outerPersona: "Serious, professional, and authoritative. Projects an aura of maturity, resilience, and competence, commanding respect without needing to ask.",
    resultsFocus: "Thrives in corporate leadership, project management, architecture, and governance. The impact is felt in their ability to build empires that outlast generations."
  },
  Aquarius: {
    coreMotivation: "Driven by the desire to innovate, reform society, and maintain intellectual independence. Aquarius values collective progress and personal freedom.",
    emotionalClimate: "Detached and objective. Aquarius observes their emotions from a distance, preferring to understand feelings conceptually rather than drown in them.",
    outerPersona: "Unconventional, friendly, and intellectually independent. Projects an aura of being slightly ahead of their time, valuing ideals over social norms.",
    resultsFocus: "Excels in technology, social activism, community organizing, and engineering. The impact lies in their ability to see the future and build it."
  },
  Pisces: {
    coreMotivation: "Driven by the urge to merge with the universal, express empathy, and dissolve boundaries. Pisces seeks spiritual connection and creative release.",
    emotionalClimate: "Oceanic, hyper-sensitive, and boundaryless. Pisces feels the pain of the world, absorbing other people's energies easily and requiring isolation to reset.",
    outerPersona: "Gentle, dreamy, and highly intuitive. Projects an aura of soft empathy and artistic sensitivity, occasionally appearing hard to pin down.",
    resultsFocus: "Thrives in arts, counseling, spiritual work, and creative writing. The impact is seen in their ability to heal, inspire, and channel deep emotional truths."
  }
};

// ─── 2. Nakshatra Knowledge Base ─────────────────────────────────────────────

export const NAKSHATRA_INTERPRETATIONS: Record<string, NakshatraInterpretation> = {
  Ashwini: {
    spiritualPurpose: "To master the healing power of speed and initiation. The soul is here to break cycles of stagnation and bring fresh energy into stagnant environments.",
    vocationalGenius: "Thrives in emergency medicine, athletics, startups, and any field requiring rapid reflexes, courage, and pioneering action.",
    shadowTrap: "Impulsiveness. Starting a hundred projects but finishing none, or rushing into relationships/business before checking the ground."
  },
  Bharani: {
    spiritualPurpose: "To experience the cycle of birth, death, and transformation. The soul is here to learn self-control and navigate intense, creative pressures.",
    vocationalGenius: "Thrives in creative arts, obstetrics, crisis management, research, and restructuring failing projects.",
    shadowTrap: "Extremes. Moving from absolute indulgence to absolute restriction, or getting stuck in struggles of control and jealousy."
  },
  Krittika: {
    spiritualPurpose: "To purify the self and others through the fire of truth. The soul is here to cut away illusions, bad habits, and toxic patterns.",
    vocationalGenius: "Thrives in surgery, military, culinary arts, education, and critical analysis where sharp discernment is required.",
    shadowTrap: "Sharp tongue and sudden anger. Burning bridges when a simple boundary would have sufficed."
  },
  Rohini: {
    spiritualPurpose: "To cultivate beauty, abundance, and emotional security. The soul is here to learn that true wealth is inner contentment, not just external luxury.",
    vocationalGenius: "Thrives in cosmetics, fashion, agriculture, design, real estate, and performing arts.",
    shadowTrap: "Possessiveness. Clinging to material things, partners, or status out of fear of scarcity."
  },
  Mrigashirsha: {
    spiritualPurpose: "To search for truth and wisdom. The soul is here to channel mental restlessness into deep research rather than superficial scanning.",
    vocationalGenius: "Thrives in journalism, research science, writing, travel, and investigative work.",
    shadowTrap: "Chronic doubt and indecision. Searching forever for the 'perfect' option and missing the opportunities right in front of them."
  },
  Ardra: {
    spiritualPurpose: "To transform pain into wisdom through emotional storms. The soul is here to learn that destruction of old structures is necessary for rebirth.",
    vocationalGenius: "Thrives in psychotherapy, waste management, innovation, technology, and crisis intervention.",
    shadowTrap: "Victim mentality. Getting addicted to the drama of your own struggles and pushing away peace."
  },
  Punarvasu: {
    spiritualPurpose: "To return to the light and experience renewal. The soul is here to build resilience and realize that setbacks are always temporary setups for a comeback.",
    vocationalGenius: "Thrives in teaching, mentoring, recycling, publishing, and consulting.",
    shadowTrap: "Over-optimism. Overlooking real warning signs in relationships or business because you want to believe the best."
  },
  Pushya: {
    spiritualPurpose: "To nourish, support, and elevate others. This is the star of nourishment; the soul is here to build structures of care and wisdom.",
    vocationalGenius: "Thrives in counseling, child care, priesthood, corporate mentoring, and healthcare management.",
    shadowTrap: "Martyr complex. Sacrificing your own health, sanity, and boundaries to take care of people who refuse to help themselves."
  },
  Ashlesha: {
    spiritualPurpose: "To master Kundalini energy, intuition, and boundaries. The soul is here to learn that vulnerability is strength and to shed old skins.",
    vocationalGenius: "Thrives in strategy, intelligence, counseling, yoga, and chemical/pharmaceutical research.",
    shadowTrap: "Secretiveness and manipulation. Using your deep psychological insights to manage or control others instead of connecting honestly."
  },
  Magha: {
    spiritualPurpose: "To honor lineage, history, and legacy. The soul is here to connect ancestral roots with modern leadership, learning humility alongside authority.",
    vocationalGenius: "Thrives in political science, heritage preservation, corporate leadership, and executive coaching.",
    shadowTrap: "Arrogance and obsession with respect. Taking constructive criticism as a personal assault on your dignity."
  },
  "Purva Phalguni": {
    spiritualPurpose: "To celebrate creativity, relationships, and the joy of life. The soul is here to learn that rest is sacred, but must avoid the trap of laziness.",
    vocationalGenius: "Thrives in entertainment, event planning, relationship coaching, and luxury commerce.",
    shadowTrap: "Superficiality. Choosing comfort over truth, or staying in mediocre situations because change requires effort."
  },
  "Uttara Phalguni": {
    spiritualPurpose: "To serve society through friendship, alliance, and contract. The soul is here to learn the art of balanced partnership and community duty.",
    vocationalGenius: "Thrives in diplomacy, charity administration, law, social work, and long-term business partnerships.",
    shadowTrap: "Over-dependence on others' opinions. Sacrificing your authentic path to maintain social approval."
  },
  Hasta: {
    spiritualPurpose: "To manifest ideas into physical reality through skill and focus. The soul is here to master the connection between the hand and the mind.",
    vocationalGenius: "Thrives in crafts, surgery, writing, manual therapies, commerce, and coding.",
    shadowTrap: "Need to control outcomes. Getting anxious when things don't go exactly according to your detailed plan."
  },
  Chitra: {
    spiritualPurpose: "To construct beauty and refine form. The soul is here to move from outer, superficial aesthetics to inner, spiritual symmetry.",
    vocationalGenius: "Thrives in architecture, interior design, fashion, sculpture, and systems engineering.",
    shadowTrap: "Critique and vanity. Rejecting perfectly good things (and people) because they have minor, human flaws."
  },
  Swati: {
    spiritualPurpose: "To cultivate independence and balance. The soul is here to learn that like the wind, they must remain free, but still respect their roots.",
    vocationalGenius: "Thrives in independent business, aviation, communication, financial trading, and public relations.",
    shadowTrap: "Fear of commitment. Keeping your bags packed in relationships and careers so you can bolt the moment things feel heavy."
  },
  Vishakha: {
    spiritualPurpose: "To target a goal and achieve it without losing integrity. The soul is here to learn that the journey matters just as much as the destination.",
    vocationalGenius: "Thrives in politics, sales, activism, target-driven corporate roles, and competitive sports.",
    shadowTrap: "Ruthless focus. Viewing people as chess pieces in your climb, or experiencing intense jealousy of others' milestones."
  },
  Anuradha: {
    spiritualPurpose: "To build bridges of friendship and devotion across boundaries. The soul is here to prove that love and connection can transcend any barrier.",
    vocationalGenius: "Thrives in international relations, music, community organizing, counseling, and travel operations.",
    shadowTrap: "Secret loneliness. Feeling surrounded by people but believing no one actually understands your inner depth."
  },
  Jyeshtha: {
    spiritualPurpose: "To step into your elder wisdom and protect the vulnerable. The soul is here to master internal strength rather than chasing external power.",
    vocationalGenius: "Thrives in crisis counseling, protective services, executive leadership, and deep historical research.",
    shadowTrap: "Power struggles. Clinging to status, age, or authority to mask an underlying fear of being irrelevant."
  },
  Mula: {
    spiritualPurpose: "To get to the root of existence by dismantling illusions. The soul is here to learn that true security lies in what cannot be destroyed.",
    vocationalGenius: "Thrives in research, philosophy, investigative journalism, botany, and spiritual teaching.",
    shadowTrap: "Sabotaging your own creations. Destroying good situations because you're uncomfortable with stability."
  },
  "Purva Ashadha": {
    spiritualPurpose: "To experience purification and victory. The soul is here to learn that true victory is won through patience and cleansing, not force.",
    vocationalGenius: "Thrives in writing, water-related industries, strategy planning, and public campaigns.",
    shadowTrap: "Over-confidence. Refusing to acknowledge your errors because you believe you are naturally destined to win."
  },
  "Uttara Ashadha": {
    spiritualPurpose: "To commit to a higher duty and work for the collective good. The soul is here to learn discipline, integrity, and alignment with natural laws.",
    vocationalGenius: "Thrives in civil service, corporate governance, legal institutions, and long-term philanthropy.",
    shadowTrap: "Rigidity. Becoming a martyr to rules and duties, and forgetting how to be soft and human."
  },
  Shravana: {
    spiritualPurpose: "To listen deeply and preserve oral wisdom. The soul is here to move from listening to gossip/noise to hearing the silent truths of the universe.",
    vocationalGenius: "Thrives in linguistics, audio production, education, counseling, and historical archiving.",
    shadowTrap: "Hypersensitivity to criticism. Letting others' words throw you off your center for days."
  },
  Dhanishta: {
    spiritualPurpose: "To harmonize wealth with spiritual rhythm. The soul is here to learn that material resources are meant to be circulated, not hoarded.",
    vocationalGenius: "Thrives in music, property development, charity foundations, banking, and public performance.",
    shadowTrap: "Greed and pride. Defining your worth by your bank account or the luxury objects you possess."
  },
  Shatabhisha: {
    spiritualPurpose: "To heal the self and others through isolation and silence. The soul is here to realize that the 'hundred healers' reside within their own quiet mind.",
    vocationalGenius: "Thrives in medicine, alternative healing, network engineering, astronomy, and research science.",
    shadowTrap: "Extreme isolation. Shutting yourself in a fortress and refusing to let anyone help you heal."
  },
  "Purva Bhadrapada": {
    spiritualPurpose: "To burn away selfish desires and transform through passion. The soul is here to channel intense, chaotic energies into spiritual devotion.",
    vocationalGenius: "Thrives in reform movements, deep chemistry, occult research, and creative writing about dark themes.",
    shadowTrap: "Two-faced nature or fanaticism. Living a double life or getting consumed by extreme, black-and-white beliefs."
  },
  "Uttara Bhadrapada": {
    spiritualPurpose: "To anchor spiritual wisdom in daily physical life. The soul is here to cultivate steady, quiet patience and offer selfless service.",
    vocationalGenius: "Thrives in meditation guidance, hospice care, philanthropy, marine biology, and archiving.",
    shadowTrap: "Passivity. Floating through life waiting for things to happen instead of taking active ownership."
  },
  Revati: {
    spiritualPurpose: "To guide lost souls home and complete the cycle of life. The soul is here to master unconditional love and graceful endings.",
    vocationalGenius: "Thrives in travel guidance, foster care, animal rescue, arts, and spiritual counseling.",
    shadowTrap: "Spiritual escapism. Daydreaming about other realms because the real world feels too loud and painful."
  }
};

// ─── 3. Yogas Knowledge Base ─────────────────────────────────────────────────

export const YOGA_INTERPRETATIONS: Record<string, YogaInterpretation> = {
  "Raj Yoga": {
    manifestation: "Formed by Kendra (action) and Trikona (grace) lords aligning. It manifests as a natural path of authority, administrative talent, and societal recognition.",
    realWorldImpact: "You possess the capacity to lead and make decisions that affect others. Your career will experience sudden elevations, but you must lead with service, not ego."
  },
  "Gaj Kesari Yoga": {
    manifestation: "Jupiter (wisdom) in a Kendra from Moon (mind). It manifests as an intellectually rich, noble mindset and financial resilience.",
    realWorldImpact: "You have a natural safety net in life. No matter how deep the financial or emotional crisis, your wisdom and respect will always pull you out and restore you."
  },
  "Neech Bhang Raj Yoga": {
    manifestation: "Debilitated planet getting cancelled. It manifests as a story of 'rising from the ashes' after early struggles.",
    realWorldImpact: "Your greatest achievements will come from your deepest early failures. You will face severe setbacks, but the cancellation ensures these setbacks become your launchpads."
  },
  "Chandra Mangal Yoga": {
    manifestation: "Conjunction/aspect of Moon and Mars. It manifests as high emotional drive, financial ambition, and intense passion.",
    realWorldImpact: "You are a self-made earner. You don't wait for luck; you actively chase resources. However, watch for a hot temper and a tendency to push others too hard."
  },
  "Budh Aditya Yoga": {
    manifestation: "Sun and Mercury in conjunction. It manifests as a sharp, logical intellect and excellent communication skills.",
    realWorldImpact: "You are highly skilled in translation, sales, or teaching. Your mind is analytical, but you must ensure you don't overthink yourself into mental paralysis."
  },
  "Hansa Yoga": {
    manifestation: "Jupiter in own/exalted sign in a Kendra. It manifests as an innate nobility, ethical stance, and academic or spiritual mastery.",
    realWorldImpact: "People naturally trust your guidance. You have a grand, optimistic vision of life. Your impact is felt when you teach, mentor, or build community foundations."
  },
  "Malavya Yoga": {
    manifestation: "Venus in own/exalted sign in Kendra. It manifests as refined taste, artistic capacity, and magnetic charm.",
    realWorldImpact: "You thrive in design, luxury, media, or partnerships. You have a keen eye for symmetry, but must avoid the trap of superficiality in relationships."
  },
  "Shasha Yoga": {
    manifestation: "Saturn in own/exalted sign in Kendra. It manifests as deep discipline, endurance, and long-term organizational leadership.",
    realWorldImpact: "You build empires slowly. You are the one who works when others quit. Success comes later in life, but once built, it is permanent and highly respected."
  },
  "Ruchaka Yoga": {
    manifestation: "Mars in own/exalted sign in Kendra. It manifests as physical courage, athletic power, and protective leadership.",
    realWorldImpact: "You run toward danger, not away. Excellent for defense, engineering, or crisis management. You must learn to channel this fire without becoming aggressive."
  },
  "Bhadra Yoga": {
    manifestation: "Mercury in own/exalted sign in Kendra. It manifests as a brilliant commercial mind, swift humor, and mathematical excellence.",
    realWorldImpact: "You can sell ideas easily. You have a highly logical approach to business, making you a formidable strategist. Ensure you speak with empathy, not just intellect."
  },
  "Amala Yoga": {
    manifestation: "Venus and Jupiter in Kendras from Moon. It manifests as a spotless reputation, philanthropy, and clean wealth.",
    realWorldImpact: "Your legacy is built on integrity. Even in competitive business, you will succeed by doing the right thing, earning clean wealth and lasting public respect."
  },
  "Veshi Yoga": {
    manifestation: "Planets in 2nd from Sun. It manifests as an expressive voice and influential family connections.",
    realWorldImpact: "Your voice carries weight. You can speak your desires into reality. You find support through networks and build your security through persuasive speech."
  },
  "Voshi Yoga": {
    manifestation: "Planets in 12th from Sun. It manifests as spiritual contentment and comfortable lifestyle assets.",
    realWorldImpact: "You have a rich inner life and enjoy quiet luxury. You work well behind the scenes and require solitude to recharge your creative batteries."
  },
  "Ubhayachari Yoga": {
    manifestation: "Planets in both 2nd and 12th from Sun. It manifests as a highly balanced, charismatic life flanking the self with support.",
    realWorldImpact: "You adapt beautifully to high-status circles and challenging crises. Your personality is magnetic, balancing action (2nd house) with reflection (12th house)."
  },
  "Dhana Yoga": {
    manifestation: "Lords of 2nd (assets) and 11th (gains) connecting. It manifests as high financial potential and multiple income streams.",
    realWorldImpact: "You have a natural capacity to monetize your ideas. Wealth will flow to you from various channels, but you must build saving discipline to preserve it."
  },
  "Vipreet Raj Yoga": {
    manifestation: "Lords of 6th, 8th, 12th in other dusthana houses. It manifests as victory over competitors and rise through others' losses or crises.",
    realWorldImpact: "You are the ultimate survivor. When others panic in a crisis, you step in and thrive. You turn absolute chaos, lawsuits, or corporate battles into personal victories."
  }
};

// ─── 4. Doshas Knowledge Base ────────────────────────────────────────────────

export const DOSHA_INTERPRETATIONS: Record<string, DoshaInterpretation> = {
  "Mangal Dosha": {
    psychologicalFriction: "Creates intense fire in relationship houses. Psychologically, it manifests as a tendency to pick fights to feel passion, or testing the partner's boundaries out of a fear of vulnerability.",
    remedialPath: "The remedy is learning emotional regulation and conscious communication. Channelling anger into intense physical work, sports, or creative output rather than dumping it on relationships."
  },
  "Kaal Sarp Dosha": {
    psychologicalFriction: "Creates a feeling of being 'fated' or blocked, where early life feels like a constant uphill climb against unseen obstacles. Psychologically, it breeds a persistent feeling of being fundamentally different or flawed.",
    remedialPath: "The remedy is radical self-acceptance and patience. Understanding that your life is back-loaded—success, ease, and peace will come later in life once you integrate your shadow self."
  },
  "Pitra Dosha": {
    psychologicalFriction: "Indicates ancestral patterns and scripts running on autopilot (e.g. repeating your parents' relationship mistakes, or carrying inherited money anxiety).",
    remedialPath: "The remedy is lineage clearing through conscious actions. Identify the repeating scripts in your family tree, name them, and explicitly write a different script for yourself."
  },
  "Nadi Dosha": {
    psychologicalFriction: "Indicates a temperamental incompatibility or health vulnerability in partnerships.",
    remedialPath: "The remedy is maintaining personal space and avoiding codependency. Ensure both partners have independent hobbies, friends, and routines to prevent energetic friction."
  },
  "Shani Sade Sati": {
    psychologicalFriction: "A 7.5-year cycle of Saturn passing over the Moon. It brings mental pressure, feeling lonely, and being forced to face reality without shortcuts. It strips away illusions.",
    remedialPath: "The remedy is surrender to discipline and truth. Avoid starting speculative ventures, embrace hard work, practice daily meditation, and view this period as a masterclass in resilience."
  },
  "Grahan Dosha": {
    psychologicalFriction: "Formed by Sun/Moon conjunct Rahu/Ketu. It manifests as emotional eclipse, sudden self-doubt, and blurred intuition.",
    remedialPath: "The remedy is grounding routines. Avoid making major life decisions during eclipses or emotional lows. Lean on objective logic and trusted mentors when your inner compass feels cloudy."
  }
};

// ─── 5. Key Planet-in-House Placements Knowledge Base ───────────────────────

export const HOUSE_PLACEMENTS: Record<string, HousePlacementInterpretation> = {
  "Sun_1": {
    lifeEffect: "Puts the focus on personal sovereignty, leadership, and self-expression. You need to be seen and respected as an authority in your field.",
    behaviorScript: "You project strong confidence, but can struggle with receiving criticism, taking it as a direct threat to your ego."
  },
  "Sun_10": {
    lifeEffect: "Puts the focus on career, public standing, and achievement. You are driven to climb the professional ladder and leave a visible mark.",
    behaviorScript: "You prioritize work over personal life, defining your self-worth almost entirely by your job title and public accolades."
  },
  "Moon_4": {
    lifeEffect: "Puts the focus on home, emotional roots, and inner peace. You require a safe, quiet domestic sanctuary to recharge.",
    behaviorScript: "You are highly sensitive to family dynamics and can get emotionally overwhelmed by changes in your living environment."
  },
  "Moon_12": {
    lifeEffect: "Puts the focus on the subconscious, dreams, and spiritual isolation. You possess deep intuition but can feel lonely in crowds.",
    behaviorScript: "You suppress your emotional needs, slipping into escape behaviors (like daydreaming or excessive sleep) when stressed."
  },
  "Mars_8": {
    lifeEffect: "Puts the focus on shared assets, secrets, and psychological transformations. You have a highly magnetic, intense energy.",
    behaviorScript: "You struggle with trust, keeping secrets, and may experience intense power struggles in intimate relationships."
  },
  "Mars_12": {
    lifeEffect: "Puts the focus on hidden motivations and passive expression of energy. You may suppress your anger until it erupts.",
    behaviorScript: "You find it hard to assert yourself directly, often resorting to passive-aggressive communication to express discontent."
  },
  "Saturn_4": {
    lifeEffect: "Puts the focus on emotional security and early family structures. Your childhood may have felt restrictive or duty-heavy.",
    behaviorScript: "You carry a low-grade feeling of responsibility for your parents, making it hard for you to relax and feel safe."
  },
  "Saturn_10": {
    lifeEffect: "Puts the focus on professional duty, delays, and slow build. Success comes through hard labor and integrity.",
    behaviorScript: "You face early career blocks, but build a solid reputation by doing the hard work that others avoid."
  },
  "Rahu_1": {
    lifeEffect: "Puts the focus on self-invention, ambition, and unique persona. You have an unconventional approach to identity.",
    behaviorScript: "You chase external validation and can struggle with identity crises, shifting your persona to fit different crowds."
  },
  "Rahu_7": {
    lifeEffect: "Puts the focus on relationships, partnerships, and mirroring. You attract unusual or intense partners.",
    behaviorScript: "You project your unfulfilled desires onto your partner, experiencing intense, obsessive relationship cycles."
  },
  "Ketu_7": {
    lifeEffect: "Puts the focus on detachment in relationships. You seek spiritual connection but can feel disconnected from partners.",
    behaviorScript: "You withdraw from relationships when they feel too demanding, preferring solitude to emotional negotiation."
  },
  "Ketu_12": {
    lifeEffect: "Puts the focus on spiritual liberation, dreams, and letting go. You have a natural detachment from material worries.",
    behaviorScript: "You easily release things that others cling to, finding peace in solitude and meditation."
  }
};

// ─── 6. RAG Retrieval Engine ─────────────────────────────────────────────────

/**
 * Retrieves personalized Vedic astrology interpretations based on the user's birth data
 * and formats them into a structured text context block for the LLM.
 */
export function retrieveAstrologyContext(input: {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  yogas: string[];
  doshas: string[];
  planetaryPositions?: Record<string, { sign: string; house: number; retrograde: boolean; isCombust?: boolean | string }>;
}): string {
  const contextSections: string[] = [];

  contextSections.push("=== RETRIEVED VEDIC ASTROLOGICAL REFERENCE CONTEXT ===");

  // 1. Signs Retrieval
  contextSections.push("## ZODIAC PLACEMENTS");
  const sunSignData = SIGN_INTERPRETATIONS[input.sunSign];
  if (sunSignData) {
    contextSections.push(`### Sun Sign: ${input.sunSign}\n- Core Motivation: ${sunSignData.coreMotivation}\n- Results Focus: ${sunSignData.resultsFocus}`);
  }
  const moonSignData = SIGN_INTERPRETATIONS[input.moonSign];
  if (moonSignData) {
    contextSections.push(`### Moon Sign: ${input.moonSign}\n- Emotional Climate: ${moonSignData.emotionalClimate}\n- Inner Need: ${moonSignData.coreMotivation}`);
  }
  const ascData = SIGN_INTERPRETATIONS[input.ascendant];
  if (ascData) {
    contextSections.push(`### Ascendant (Rising): ${input.ascendant}\n- Outer Persona: ${ascData.outerPersona}\n- Self-Expression: ${ascData.coreMotivation}`);
  }

  // 2. Nakshatra Retrieval
  contextSections.push("\n## NAKSHATRA SOUL MISSION");
  let cleanNakshatra = input.nakshatra;
  try {
    const parsed = JSON.parse(input.nakshatra);
    cleanNakshatra = parsed.name || parsed;
  } catch { /* not JSON */ }
  
  const nakshatraData = NAKSHATRA_INTERPRETATIONS[cleanNakshatra];
  if (nakshatraData) {
    contextSections.push(`### Nakshatra: ${cleanNakshatra}\n- Spiritual Purpose: ${nakshatraData.spiritualPurpose}\n- Genius Work: ${nakshatraData.vocationalGenius}\n- Shadow Trap: ${nakshatraData.shadowTrap}`);
  }

  // 3. Yogas Retrieval
  if (input.yogas && input.yogas.length > 0) {
    contextSections.push("\n## YOGAS (AMPLIFIED POTENTIALS)");
    input.yogas.forEach(y => {
      const yogaData = YOGA_INTERPRETATIONS[y];
      if (yogaData) {
        contextSections.push(`### Yoga: ${y}\n- Dynamic Manifestation: ${yogaData.manifestation}\n- Real-World Impact: ${yogaData.realWorldImpact}`);
      }
    });
  }

  // 4. Doshas Retrieval
  if (input.doshas && input.doshas.length > 0) {
    contextSections.push("\n## DOSHAS (PSYCHOLOGICAL FRICTION & LESSONS)");
    input.doshas.forEach(d => {
      const doshaData = DOSHA_INTERPRETATIONS[d];
      if (doshaData) {
        contextSections.push(`### Dosha: ${d}\n- Psychological Friction: ${doshaData.psychologicalFriction}\n- Practical Remedy: ${doshaData.remedialPath}`);
      }
    });
  }

  // 5. Planetary Placements Retrieval
  if (input.planetaryPositions) {
    contextSections.push("\n## PLANETARY HOUSE PLACEMENTS");
    Object.entries(input.planetaryPositions).forEach(([planet, pos]) => {
      const key = `${planet}_${pos.house}`;
      const houseData = HOUSE_PLACEMENTS[key];
      if (houseData) {
        contextSections.push(`### ${planet} in the ${pos.house} House:\n- Real-Life Effect: ${houseData.lifeEffect}\n- Behavior Script: ${houseData.behaviorScript}`);
      }
    });
  }

  contextSections.push("=== END OF RETRIEVED CONTEXT ===");
  return contextSections.join("\n");
}
