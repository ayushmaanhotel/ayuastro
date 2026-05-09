// ─── Vedic Content Translation System ──────────────────────────────────────────
// Provides i18n for Vedic astrology terms in English, Hindi, and Hinglish

export type VedicLanguage = 'en' | 'hi' | 'hinglish';

// ─── Zodiac Sign Names (12 signs) ─────────────────────────────────────────────

export const ZODIAC_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Aries: 'Aries',
    Taurus: 'Taurus',
    Gemini: 'Gemini',
    Cancer: 'Cancer',
    Leo: 'Leo',
    Virgo: 'Virgo',
    Libra: 'Libra',
    Scorpio: 'Scorpio',
    Sagittarius: 'Sagittarius',
    Capricorn: 'Capricorn',
    Aquarius: 'Aquarius',
    Pisces: 'Pisces',
  },
  hi: {
    Aries: 'मेष',
    Taurus: 'वृषभ',
    Gemini: 'मिथुन',
    Cancer: 'कर्क',
    Leo: 'सिंह',
    Virgo: 'कन्या',
    Libra: 'तुला',
    Scorpio: 'वृश्चिक',
    Sagittarius: 'धनु',
    Capricorn: 'मकर',
    Aquarius: 'कुम्भ',
    Pisces: 'मीन',
  },
  hinglish: {
    Aries: 'Mesh',
    Taurus: 'Vrishabh',
    Gemini: 'Mithun',
    Cancer: 'Kark',
    Leo: 'Singh',
    Virgo: 'Kanya',
    Libra: 'Tula',
    Scorpio: 'Vrishchik',
    Sagittarius: 'Dhanu',
    Capricorn: 'Makar',
    Aquarius: 'Kumbh',
    Pisces: 'Meen',
  },
};

// ─── Planet Names (9 Navagraha) ────────────────────────────────────────────────

export const PLANET_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
    Rahu: 'Rahu',
    Ketu: 'Ketu',
  },
  hi: {
    Sun: 'सूर्य',
    Moon: 'चंद्र',
    Mars: 'मंगल',
    Mercury: 'बुध',
    Jupiter: 'बृहस्पति',
    Venus: 'शुक्र',
    Saturn: 'शनि',
    Rahu: 'राहु',
    Ketu: 'केतु',
  },
  hinglish: {
    Sun: 'Surya',
    Moon: 'Chandra',
    Mars: 'Mangal',
    Mercury: 'Budh',
    Jupiter: 'Brihaspati',
    Venus: 'Shukra',
    Saturn: 'Shani',
    Rahu: 'Rahu',
    Ketu: 'Ketu',
  },
};

// ─── Nakshatra Names (27 Nakshatras) ──────────────────────────────────────────

export const NAKSHATRA_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Ashwini: 'Ashwini',
    Bharani: 'Bharani',
    Krittika: 'Krittika',
    Rohini: 'Rohini',
    Mrigashira: 'Mrigashira',
    Ardra: 'Ardra',
    Punarvasu: 'Punarvasu',
    Pushya: 'Pushya',
    Ashlesha: 'Ashlesha',
    Magha: 'Magha',
    PurvaPhalguni: 'Purva Phalguni',
    UttaraPhalguni: 'Uttara Phalguni',
    Hasta: 'Hasta',
    Chitra: 'Chitra',
    Swati: 'Swati',
    Vishakha: 'Vishakha',
    Anuradha: 'Anuradha',
    Jyeshtha: 'Jyeshtha',
    Mula: 'Mula',
    Purvashadha: 'Purva Ashadha',
    Uttarashadha: 'Uttara Ashadha',
    Shravana: 'Shravana',
    Dhanishta: 'Dhanishta',
    Shatabhisha: 'Shatabhisha',
    PurvaBhadrapada: 'Purva Bhadrapada',
    UttaraBhadrapada: 'Uttara Bhadrapada',
    Revati: 'Revati',
  },
  hi: {
    Ashwini: 'अश्विनी',
    Bharani: 'भरणी',
    Krittika: 'कृत्तिका',
    Rohini: 'रोहिणी',
    Mrigashira: 'मृगशिरा',
    Ardra: 'आर्द्रा',
    Punarvasu: 'पुनर्वसु',
    Pushya: 'पुष्य',
    Ashlesha: 'आश्लेषा',
    Magha: 'मघा',
    PurvaPhalguni: 'पूर्व फाल्गुनी',
    UttaraPhalguni: 'उत्तर फाल्गुनी',
    Hasta: 'हस्त',
    Chitra: 'चित्रा',
    Swati: 'स्वाती',
    Vishakha: 'विशाखा',
    Anuradha: 'अनुराधा',
    Jyeshtha: 'ज्येष्ठा',
    Mula: 'मूल',
    Purvashadha: 'पूर्वाषाढ़ा',
    Uttarashadha: 'उत्तराषाढ़ा',
    Shravana: 'श्रवण',
    Dhanishta: 'धनिष्ठा',
    Shatabhisha: 'शतभिषा',
    PurvaBhadrapada: 'पूर्व भाद्रपद',
    UttaraBhadrapada: 'उत्तर भाद्रपद',
    Revati: 'रेवती',
  },
  hinglish: {
    Ashwini: 'Ashwini',
    Bharani: 'Bharani',
    Krittika: 'Krittika',
    Rohini: 'Rohini',
    Mrigashira: 'Mrigashira',
    Ardra: 'Ardra',
    Punarvasu: 'Punarvasu',
    Pushya: 'Pushya',
    Ashlesha: 'Ashlesha',
    Magha: 'Magha',
    PurvaPhalguni: 'Purva Phalguni',
    UttaraPhalguni: 'Uttara Phalguni',
    Hasta: 'Hasta',
    Chitra: 'Chitra',
    Swati: 'Swati',
    Vishakha: 'Vishakha',
    Anuradha: 'Anuradha',
    Jyeshtha: 'Jyeshtha',
    Mula: 'Mula',
    Purvashadha: 'Purva Ashadha',
    Uttarashadha: 'Uttara Ashadha',
    Shravana: 'Shravana',
    Dhanishta: 'Dhanishta',
    Shatabhisha: 'Shatabhisha',
    PurvaBhadrapada: 'Purva Bhadrapada',
    UttaraBhadrapada: 'Uttara Bhadrapada',
    Revati: 'Revati',
  },
};

// ─── Element Names ─────────────────────────────────────────────────────────────

export const ELEMENT_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Fire: 'Fire',
    Earth: 'Earth',
    Air: 'Air',
    Water: 'Water',
  },
  hi: {
    Fire: 'अग्नि',
    Earth: 'पृथ्वी',
    Air: 'वायु',
    Water: 'जल',
  },
  hinglish: {
    Fire: 'Agni',
    Earth: 'Prithvi',
    Air: 'Vayu',
    Water: 'Jal',
  },
};

// ─── Dosha Names ───────────────────────────────────────────────────────────────

export const DOSHA_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    'Mangal Dosha': 'Mangal Dosha',
    'Kaal Sarp Dosha': 'Kaal Sarp Dosha',
    'Pitra Dosha': 'Pitra Dosha',
    'Nadi Dosha': 'Nadi Dosha',
    'Shani Sade Sati': 'Shani Sade Sati',
    'Grahan Dosha': 'Grahan Dosha',
  },
  hi: {
    'Mangal Dosha': 'मांगलिक दोष',
    'Kaal Sarp Dosha': 'कालसर्प दोष',
    'Pitra Dosha': 'पितृ दोष',
    'Nadi Dosha': 'नाड़ी दोष',
    'Shani Sade Sati': 'शनि साढ़ेसाती',
    'Grahan Dosha': 'ग्रहण दोष',
  },
  hinglish: {
    'Mangal Dosha': 'Mangal Dosh',
    'Kaal Sarp Dosha': 'Kaal Sarp Dosh',
    'Pitra Dosha': 'Pitra Dosh',
    'Nadi Dosha': 'Nadi Dosh',
    'Shani Sade Sati': 'Shani Sade Sati',
    'Grahan Dosha': 'Grahan Dosh',
  },
};

// ─── Yoga Names ────────────────────────────────────────────────────────────────

export const YOGA_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    'Gajakesari Yoga': 'Gajakesari Yoga',
    'Raja Yoga': 'Raja Yoga',
    'Dhana Yoga': 'Dhana Yoga',
    'Budhaditya Yoga': 'Budhaditya Yoga',
    'Chandra Mangal Yoga': 'Chandra Mangal Yoga',
    'Shasha Yoga': 'Shasha Yoga',
    'Malavya Yoga': 'Malavya Yoga',
    'Ruchaka Yoga': 'Ruchaka Yoga',
    'Hamsa Yoga': 'Hamsa Yoga',
    'Viparita Raja Yoga': 'Viparita Raja Yoga',
    'Amala Yoga': 'Amala Yoga',
    'Veshi Yoga': 'Veshi Yoga',
    'Voshi Yoga': 'Voshi Yoga',
    'Ubhayachari Yoga': 'Ubhayachari Yoga',
    'Sunapha Yoga': 'Sunapha Yoga',
    'Anapha Yoga': 'Anapha Yoga',
    'Durudhura Yoga': 'Durudhura Yoga',
    'Kemadruma Yoga': 'Kemadruma Yoga',
  },
  hi: {
    'Gajakesari Yoga': 'गजकेसरी योग',
    'Raja Yoga': 'राजयोग',
    'Dhana Yoga': 'धन योग',
    'Budhaditya Yoga': 'बुधादित्य योग',
    'Chandra Mangal Yoga': 'चंद्र मंगल योग',
    'Shasha Yoga': 'शश योग',
    'Malavya Yoga': 'मालव्य योग',
    'Ruchaka Yoga': 'रुचक योग',
    'Hamsa Yoga': 'हंस योग',
    'Viparita Raja Yoga': 'विपरीत राजयोग',
    'Amala Yoga': 'अमल योग',
    'Veshi Yoga': 'वेशी योग',
    'Voshi Yoga': 'वोषी योग',
    'Ubhayachari Yoga': 'उभयचारी योग',
    'Sunapha Yoga': 'सुनफ योग',
    'Anapha Yoga': 'अनफ योग',
    'Durudhura Yoga': 'दुरुधुर योग',
    'Kemadruma Yoga': 'केमद्रुम योग',
  },
  hinglish: {
    'Gajakesari Yoga': 'Gajakesari Yog',
    'Raja Yoga': 'Raja Yog',
    'Dhana Yoga': 'Dhana Yog',
    'Budhaditya Yoga': 'Budhaditya Yog',
    'Chandra Mangal Yoga': 'Chandra Mangal Yog',
    'Shasha Yoga': 'Shasha Yog',
    'Malavya Yoga': 'Malavya Yog',
    'Ruchaka Yoga': 'Ruchaka Yog',
    'Hamsa Yoga': 'Hamsa Yog',
    'Viparita Raja Yoga': 'Viparita Raja Yog',
    'Amala Yoga': 'Amala Yog',
    'Veshi Yoga': 'Veshi Yog',
    'Voshi Yoga': 'Voshi Yog',
    'Ubhayachari Yoga': 'Ubhayachari Yog',
    'Sunapha Yoga': 'Sunapha Yog',
    'Anapha Yoga': 'Anapha Yog',
    'Durudhura Yoga': 'Durudhura Yog',
    'Kemadruma Yoga': 'Kemadruma Yog',
  },
};

// ─── Zodiac Symbol Map ─────────────────────────────────────────────────────────

export const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

// ─── Planet Symbol Map ─────────────────────────────────────────────────────────

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

// ─── House Names ───────────────────────────────────────────────────────────────

export const HOUSE_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    '1': '1st House (Self)',
    '2': '2nd House (Wealth)',
    '3': '3rd House (Courage)',
    '4': '4th House (Home)',
    '5': '5th House (Creativity)',
    '6': '6th House (Health)',
    '7': '7th House (Partnership)',
    '8': '8th House (Transformation)',
    '9': '9th House (Fortune)',
    '10': '10th House (Career)',
    '11': '11th House (Gains)',
    '12': '12th House (Liberation)',
  },
  hi: {
    '1': '1st भाव (स्वयं)',
    '2': '2nd भाव (धन)',
    '3': '3rd भाव (साहस)',
    '4': '4th भाव (घर)',
    '5': '5th भाव (रचनात्मकता)',
    '6': '6th भाव (स्वास्थ्य)',
    '7': '7th भाव (साझेदारी)',
    '8': '8th भाव (परिवर्तन)',
    '9': '9th भाव (भाग्य)',
    '10': '10th भाव (करियर)',
    '11': '11th भाव (लाभ)',
    '12': '12th भाव (मोक्ष)',
  },
  hinglish: {
    '1': '1st Bhav (Self)',
    '2': '2nd Bhav (Dhan)',
    '3': '3rd Bhav (Sahas)',
    '4': '4th Bhav (Ghar)',
    '5': '5th Bhav (Creativity)',
    '6': '6th Bhav (Sehat)',
    '7': '7th Bhav (Saajhedari)',
    '8': '8th Bhav (Parivartan)',
    '9': '9th Bhav (Bhagya)',
    '10': '10th Bhav (Career)',
    '11': '11th Bhav (Laabh)',
    '12': '12th Bhav (Moksh)',
  },
};

// ─── Modality Names ────────────────────────────────────────────────────────────

export const MODALITY_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Cardinal: 'Cardinal',
    Fixed: 'Fixed',
    Mutable: 'Mutable',
  },
  hi: {
    Cardinal: 'चर',
    Fixed: 'स्थिर',
    Mutable: 'द्वैध',
  },
  hinglish: {
    Cardinal: 'Char',
    Fixed: 'Sthir',
    Mutable: 'Dwidh',
  },
};

// ─── Dasha Planet Names ────────────────────────────────────────────────────────

export const DASHA_PERIOD_NAMES: Record<VedicLanguage, Record<string, string>> = {
  en: {
    Ketu: 'Ketu Dasha',
    Venus: 'Venus Dasha',
    Sun: 'Sun Dasha',
    Moon: 'Moon Dasha',
    Mars: 'Mars Dasha',
    Rahu: 'Rahu Dasha',
    Jupiter: 'Jupiter Dasha',
    Saturn: 'Saturn Dasha',
    Mercury: 'Mercury Dasha',
  },
  hi: {
    Ketu: 'केतु दशा',
    Venus: 'शुक्र दशा',
    Sun: 'सूर्य दशा',
    Moon: 'चंद्र दशा',
    Mars: 'मंगल दशा',
    Rahu: 'राहु दशा',
    Jupiter: 'बृहस्पति दशा',
    Saturn: 'शनि दशा',
    Mercury: 'बुध दशा',
  },
  hinglish: {
    Ketu: 'Ketu Mahadasha',
    Venus: 'Shukra Mahadasha',
    Sun: 'Surya Mahadasha',
    Moon: 'Chandra Mahadasha',
    Mars: 'Mangal Mahadasha',
    Rahu: 'Rahu Mahadasha',
    Jupiter: 'Brihaspati Mahadasha',
    Saturn: 'Shani Mahadasha',
    Mercury: 'Budh Mahadasha',
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get the translated zodiac sign name for a given language.
 * Falls back to the English name if the sign is not found.
 */
export function getZodiacName(sign: string, lang: VedicLanguage): string {
  return ZODIAC_NAMES[lang][sign] ?? ZODIAC_NAMES.en[sign] ?? sign;
}

/**
 * Get the translated planet name for a given language.
 * Falls back to the English name if the planet is not found.
 */
export function getPlanetName(planet: string, lang: VedicLanguage): string {
  return PLANET_NAMES[lang][planet] ?? PLANET_NAMES.en[planet] ?? planet;
}

/**
 * Get the translated nakshatra name for a given language.
 * Falls back to the English name if the nakshatra is not found.
 */
export function getNakshatraName(nakshatra: string, lang: VedicLanguage): string {
  return NAKSHATRA_NAMES[lang][nakshatra] ?? NAKSHATRA_NAMES.en[nakshatra] ?? nakshatra;
}

/**
 * Get the translated element name for a given language.
 * Falls back to the English name if the element is not found.
 */
export function getElementName(element: string, lang: VedicLanguage): string {
  return ELEMENT_NAMES[lang][element] ?? ELEMENT_NAMES.en[element] ?? element;
}

/**
 * Get the translated dosha name for a given language.
 * Falls back to the English name if the dosha is not found.
 */
export function getDoshaName(dosha: string, lang: VedicLanguage): string {
  return DOSHA_NAMES[lang][dosha] ?? DOSHA_NAMES.en[dosha] ?? dosha;
}

/**
 * Get the translated yoga name for a given language.
 * Falls back to the English name if the yoga is not found.
 */
export function getYogaName(yoga: string, lang: VedicLanguage): string {
  return YOGA_NAMES[lang][yoga] ?? YOGA_NAMES.en[yoga] ?? yoga;
}

/**
 * Get the translated house name for a given language.
 * Falls back to the English name if the house is not found.
 */
export function getHouseName(house: string | number, lang: VedicLanguage): string {
  const key = String(house);
  return HOUSE_NAMES[lang][key] ?? HOUSE_NAMES.en[key] ?? key;
}

/**
 * Get the translated modality name for a given language.
 * Falls back to the English name if the modality is not found.
 */
export function getModalityName(modality: string, lang: VedicLanguage): string {
  return MODALITY_NAMES[lang][modality] ?? MODALITY_NAMES.en[modality] ?? modality;
}

/**
 * Get the translated dasha period name for a given language.
 * Falls back to the English name if the planet is not found.
 */
export function getDashaName(planet: string, lang: VedicLanguage): string {
  return DASHA_PERIOD_NAMES[lang][planet] ?? DASHA_PERIOD_NAMES.en[planet] ?? planet;
}

/**
 * Get the zodiac symbol for a given sign.
 */
export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign] ?? '✦';
}

/**
 * Get the planet symbol for a given planet.
 */
export function getPlanetSymbol(planet: string): string {
  return PLANET_SYMBOLS[planet] ?? '●';
}

/**
 * Translate a planet-in-sign description.
 * Example Hinglish output: "Your Surya is in Mesh rashi"
 */
export function getPlanetInSignPhrase(
  planet: string,
  sign: string,
  lang: VedicLanguage
): string {
  const pName = getPlanetName(planet, lang);
  const sName = getZodiacName(sign, lang);

  switch (lang) {
    case 'hi':
      return `आपकी ${pName} ${sName} राशि में है`;
    case 'hinglish':
      return `Your ${pName} is in ${sName} rashi`;
    default:
      return `Your ${pName} is in ${sName}`;
  }
}

/**
 * Translate a planet-in-house description.
 */
export function getPlanetInHousePhrase(
  planet: string,
  house: number | string,
  lang: VedicLanguage
): string {
  const pName = getPlanetName(planet, lang);
  const hName = getHouseName(house, lang);

  switch (lang) {
    case 'hi':
      return `${pName} ${hName} में स्थित है`;
    case 'hinglish':
      return `${pName} is in ${hName}`;
    default:
      return `${pName} is in the ${hName}`;
  }
}

/**
 * Get element quality description.
 */
export function getElementQuality(element: string, lang: VedicLanguage): string {
  const qualities: Record<VedicLanguage, Record<string, string>> = {
    en: {
      Fire: 'Passion, initiative, courage',
      Earth: 'Stability, patience, practicality',
      Air: 'Communication, adaptability, intellect',
      Water: 'Emotion, intuition, depth',
    },
    hi: {
      Fire: 'जोश, पहल, साहस',
      Earth: 'स्थिरता, धैर्य, व्यावहारिकता',
      Air: 'संचार, अनुकूलन, बुद्धि',
      Water: 'भावना, अंतर्ज्ञान, गहराई',
    },
    hinglish: {
      Fire: 'Josh, pahal, sahas',
      Earth: 'Sthirta, dhairya, vyavharikta',
      Air: 'Sanchar, anukulan, buddhi',
      Water: 'Bhavna, antargyan, gahrai',
    },
  };
  return qualities[lang][element] ?? qualities.en[element] ?? '';
}
