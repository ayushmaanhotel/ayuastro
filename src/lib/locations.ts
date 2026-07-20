export interface ResolvedPlace {
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export const INDIAN_CITIES: Record<string, ResolvedPlace> = {
  mumbai: { placeOfBirth: 'Mumbai', latitude: 19.076, longitude: 72.8777, timezone: 5.5 },
  bombay: { placeOfBirth: 'Mumbai', latitude: 19.076, longitude: 72.8777, timezone: 5.5 },
  'new delhi': { placeOfBirth: 'New Delhi', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
  delhi: { placeOfBirth: 'New Delhi', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
  bengaluru: { placeOfBirth: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, timezone: 5.5 },
  bangalore: { placeOfBirth: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, timezone: 5.5 },
  hyderabad: { placeOfBirth: 'Hyderabad', latitude: 17.385, longitude: 78.4867, timezone: 5.5 },
  chennai: { placeOfBirth: 'Chennai', latitude: 13.0827, longitude: 80.2707, timezone: 5.5 },
  kolkata: { placeOfBirth: 'Kolkata', latitude: 22.5726, longitude: 88.3639, timezone: 5.5 },
  calcutta: { placeOfBirth: 'Kolkata', latitude: 22.5726, longitude: 88.3639, timezone: 5.5 },
  pune: { placeOfBirth: 'Pune', latitude: 18.5204, longitude: 73.8567, timezone: 5.5 },
  ahmedabad: { placeOfBirth: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, timezone: 5.5 },
  jaipur: { placeOfBirth: 'Jaipur', latitude: 26.9124, longitude: 75.7873, timezone: 5.5 },
  lucknow: { placeOfBirth: 'Lucknow', latitude: 26.8467, longitude: 80.9462, timezone: 5.5 },
  kanpur: { placeOfBirth: 'Kanpur', latitude: 26.4499, longitude: 80.3319, timezone: 5.5 },
  varanasi: { placeOfBirth: 'Varanasi', latitude: 25.3176, longitude: 82.9739, timezone: 5.5 },
  surat: { placeOfBirth: 'Surat', latitude: 21.1702, longitude: 72.8311, timezone: 5.5 },
  patna: { placeOfBirth: 'Patna', latitude: 25.5941, longitude: 85.1376, timezone: 5.5 },
  bhopal: { placeOfBirth: 'Bhopal', latitude: 23.2599, longitude: 77.4126, timezone: 5.5 },
  indore: { placeOfBirth: 'Indore', latitude: 22.7196, longitude: 75.8577, timezone: 5.5 },
  nagpur: { placeOfBirth: 'Nagpur', latitude: 21.1458, longitude: 79.0882, timezone: 5.5 },
  chandigarh: { placeOfBirth: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, timezone: 5.5 },
  gurugram: { placeOfBirth: 'Gurugram', latitude: 28.4595, longitude: 77.0266, timezone: 5.5 },
  gurgaon: { placeOfBirth: 'Gurugram', latitude: 28.4595, longitude: 77.0266, timezone: 5.5 },
  noida: { placeOfBirth: 'Noida', latitude: 28.5355, longitude: 77.391, timezone: 5.5 },
  ghaziabad: { placeOfBirth: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538, timezone: 5.5 },
};

export function resolveIndianCity(input: string): ResolvedPlace | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return null;
  if (INDIAN_CITIES[normalized]) return INDIAN_CITIES[normalized];

  const matchedKey = Object.keys(INDIAN_CITIES).find((city) => normalized.includes(city));
  return matchedKey ? INDIAN_CITIES[matchedKey] : null;
}

