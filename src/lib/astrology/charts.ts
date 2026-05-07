/**
 * AyuAstro - Chart Generation
 * North Indian style chart data structure and house calculations
 * 
 * The North Indian chart is a diamond-shaped grid where:
 * - The ascendant always occupies the top center diamond (house 1)
 * - Houses are arranged in a fixed pattern counterclockwise
 * - Each house contains the zodiac sign and any planets positioned there
 */

import {
  type HouseData,
  type NorthIndianChartData,
  type PlanetPosition,
  type ZodiacSign,
  type AscendantData,
  ZODIAC_SIGNS,
} from './types';

import {
  getSignByIndex,
  getSignIndex,
  getHouseFromAscendant,
  getSignIndexForHouse,
  NUM_SIGNS,
} from './utils';

// ─── North Indian Chart Layout ───────────────────────────────────────────────

/**
 * The North Indian chart has a fixed layout:
 * Cell indices map to house numbers in a specific pattern.
 * 
 * Layout (cell index -> house number):
 *     ┌────┬────┬────┐
 *     │ 12 │  1 │  2 │
 *     ├────┼────┼────┤
 *     │ 11 │    │  3 │
 *     ├────┼────┼────┤
 *     │ 10 │  9 │  4 │
 *     ├────┼────┼────┤
 *     │  9 │  8 │  5 │
 *     └────┴────┴────┘
 *           │ 7  │
 *           │ 6  │
 * 
 * Actually, the standard North Indian layout:
 * The top diamond is always House 1 (Ascendant)
 * Then houses go counterclockwise: 2,3,4...12
 */

/**
 * North Indian chart cell positions (0-indexed grid).
 * Each position maps to a house number.
 * The grid is conceptualized as positions in the diamond pattern.
 */
export const NORTH_INDIAN_LAYOUT: number[] = [
  // These represent the house numbers for each cell position
  // in the diamond grid, going from top-center clockwise
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
];

// ─── House Calculation ───────────────────────────────────────────────────────

/**
 * Calculate all 12 houses with their signs and occupying planets.
 * Uses the whole sign house system (the most traditional Vedic system).
 * In this system, each sign = one house, starting from the ascendant sign.
 */
export function calculateHouses(
  ascendant: AscendantData,
  planetaryPositions: Record<string, PlanetPosition>
): HouseData[] {
  const houses: HouseData[] = [];
  const ascSignIndex = ascendant.signIndex;

  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const signIndex = getSignIndexForHouse(houseNum, ascSignIndex);
    const sign = getSignByIndex(signIndex);

    // Find all planets in this house (same sign = same house in whole sign system)
    const planetsInHouse: string[] = [];
    for (const [planetName, position] of Object.entries(planetaryPositions)) {
      if (position.signIndex === signIndex) {
        planetsInHouse.push(planetName);
      }
    }

    houses.push({
      houseNumber: houseNum,
      sign,
      signIndex,
      planets: planetsInHouse as any[],
    });
  }

  return houses;
}

/**
 * Generate the North Indian chart data structure.
 * Returns a 12-element array where each element represents a house
 * with its sign and planets.
 */
export function generateNorthIndianChart(
  ascendant: AscendantData,
  planetaryPositions: Record<string, PlanetPosition>
): NorthIndianChartData {
  const houses = calculateHouses(ascendant, planetaryPositions);

  return {
    houses,
    ascendantIndex: ascendant.signIndex,
  };
}

// ─── House Significance ──────────────────────────────────────────────────────

export interface HouseSignificance {
  number: number;
  name: string;
  sanskritName: string;
  significations: string[];
  karaka: string; // Natural significator
}

/** Signification of each house in Vedic astrology */
export const HOUSE_SIGNIFICANCES: HouseSignificance[] = [
  {
    number: 1,
    name: 'Self',
    sanskritName: 'Lagna / Tanu',
    significations: ['Body', 'Appearance', 'Personality', 'Health', 'Beginnings'],
    karaka: 'Sun',
  },
  {
    number: 2,
    name: 'Wealth',
    sanskritName: 'Dhana',
    significations: ['Money', 'Family', 'Speech', 'Food', 'Early Education'],
    karaka: 'Jupiter',
  },
  {
    number: 3,
    name: 'Siblings',
    sanskritName: 'Sahaja',
    significations: ['Siblings', 'Courage', 'Communication', 'Short Travels', 'Skills'],
    karaka: 'Mars',
  },
  {
    number: 4,
    name: 'Home',
    sanskritName: 'Sukha',
    significations: ['Mother', 'Home', 'Comforts', 'Education', 'Vehicles'],
    karaka: 'Moon',
  },
  {
    number: 5,
    name: 'Children',
    sanskritName: 'Putra',
    significations: ['Children', 'Intelligence', 'Creativity', 'Romance', 'Past Karma'],
    karaka: 'Jupiter',
  },
  {
    number: 6,
    name: 'Enemies',
    sanskritName: 'Ripu',
    significations: ['Disease', 'Debt', 'Enemies', 'Service', 'Daily Work'],
    karaka: 'Saturn',
  },
  {
    number: 7,
    name: 'Partnership',
    sanskritName: 'Kalatra',
    significations: ['Marriage', 'Spouse', 'Business Partners', 'Travel', 'Foreign'],
    karaka: 'Venus',
  },
  {
    number: 8,
    name: 'Transformation',
    sanskritName: 'Ayur',
    significations: ['Longevity', 'Death', 'Inheritance', 'Hidden Things', 'Occult'],
    karaka: 'Saturn',
  },
  {
    number: 9,
    name: 'Fortune',
    sanskritName: 'Bhagya',
    significations: ['Luck', 'Religion', 'Father', 'Higher Education', 'Dharma'],
    karaka: 'Jupiter',
  },
  {
    number: 10,
    name: 'Career',
    sanskritName: 'Karma',
    significations: ['Career', 'Status', 'Authority', 'Public Image', 'Fame'],
    karaka: 'Sun',
  },
  {
    number: 11,
    name: 'Gains',
    sanskritName: 'Labha',
    significations: ['Income', 'Friends', 'Elder Siblings', 'Fulfillment', 'Social Circle'],
    karaka: 'Jupiter',
  },
  {
    number: 12,
    name: 'Loss',
    sanskritName: 'Vyaya',
    significations: ['Expenses', 'Loss', 'Liberation', 'Foreign Travel', 'Sleep'],
    karaka: 'Saturn',
  },
];

// ─── House Lords ─────────────────────────────────────────────────────────────

/**
 * Get the lord of each house based on the sign occupying it.
 */
export function getHouseLords(houses: HouseData[]): Record<number, string> {
  const lords: Record<number, string> = {};
  for (const house of houses) {
    const signIndex = house.signIndex;
    // Sign lord mapping
    const signLords: Record<number, string> = {
      0: 'Mars',     // Aries
      1: 'Venus',    // Taurus
      2: 'Mercury',  // Gemini
      3: 'Moon',     // Cancer
      4: 'Sun',      // Leo
      5: 'Mercury',  // Virgo
      6: 'Venus',    // Libra
      7: 'Mars',     // Scorpio
      8: 'Jupiter',  // Sagittarius
      9: 'Saturn',   // Capricorn
      10: 'Saturn',  // Aquarius
      11: 'Jupiter', // Pisces
    };
    lords[house.houseNumber] = signLords[signIndex];
  }
  return lords;
}

// ─── Chart Rendering Helpers ─────────────────────────────────────────────────

/**
 * Get the grid position for a house number in the North Indian chart layout.
 * Returns [row, col] for a 4x4 grid representation.
 * 
 * North Indian chart diamond layout:
 * Row 0: [_, 12, 1, 2]
 * Row 1: [11, _, _, 3]
 * Row 2: [10, _, _, 4]
 * Row 3: [9, 8, 7, _, _, 5, 6]
 * 
 * Simplified to a standard grid for rendering:
 */
export function getNorthIndianGridPosition(houseNumber: number): { row: number; col: number } {
  // North Indian chart: fixed position for each house
  // Using a simplified grid representation
  const positions: Record<number, { row: number; col: number }> = {
    1:  { row: 0, col: 1 },  // Top center
    2:  { row: 0, col: 2 },  // Top right
    3:  { row: 1, col: 3 },  // Right top
    4:  { row: 2, col: 3 },  // Right bottom
    5:  { row: 3, col: 2 },  // Bottom right
    6:  { row: 3, col: 1 },  // Bottom center
    7:  { row: 3, col: 0 },  // Bottom left
    8:  { row: 2, col: 0 },  // Left bottom
    9:  { row: 1, col: 0 },  // Left top
    10: { row: 0, col: 0 },  // Left of top center
    11: { row: 0, col: 0 },  // Same cell as 10 (different quadrant)
    12: { row: 0, col: 1 },  // Above ascendant
  };

  // More accurate: the North Indian diamond chart has specific cell positions
  // Let's use the actual traditional layout
  const actualPositions: Record<number, { row: number; col: number }> = {
    1:  { row: 0, col: 2 },  // Top center diamond
    2:  { row: 1, col: 3 },  // Right of top
    3:  { row: 2, col: 3 },  // Right
    4:  { row: 3, col: 2 },  // Bottom right
    5:  { row: 3, col: 1 },  // Bottom center right
    6:  { row: 3, col: 0 },  // Bottom center left
    7:  { row: 2, col: 0 },  // Left bottom
    8:  { row: 1, col: 0 },  // Left middle
    9:  { row: 0, col: 0 },  // Left top
    10: { row: 0, col: 1 },  // Top left
    11: { row: 1, col: 1 },  // Inner left
    12: { row: 1, col: 2 },  // Inner right
  };

  return actualPositions[houseNumber] || { row: 0, col: 0 };
}

/**
 * For rendering: get which house a sign falls into based on ascendant.
 */
export function getSignToHouseMap(ascendantSignIndex: number): Record<string, number> {
  const map: Record<string, number> = {};
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const signIndex = getSignIndexForHouse(houseNum, ascendantSignIndex);
    map[ZODIAC_SIGNS[signIndex]] = houseNum;
  }
  return map;
}
