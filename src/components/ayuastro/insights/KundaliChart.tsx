'use client';

import { motion } from 'framer-motion';

interface KundaliChartProps {
  planetaryPositions: Record<string, { sign: string; degree: number; house: number; retrograde: boolean }>;
  ascendant: string;
  sunSign: string;
  moonSign: string;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

/**
 * North Indian Kundali Chart Layout
 *
 * The chart is a diamond shape (rotated square) divided into 12 triangular sections.
 * House 1 (Ascendant) is always at the top center triangle.
 * Houses proceed counterclockwise: 2, 3, 4, ... 12.
 *
 * The diamond vertices (in a 300x300 viewBox):
 *   Top:    (150, 10)
 *   Right:  (290, 150)
 *   Bottom: (150, 290)
 *   Left:   (10, 150)
 *
 * Internal grid lines at x=70, x=150, x=230 and y=70, y=150, y=230
 * create the 12 house sections within the diamond.
 */

// Diamond vertices
const TOP = [150, 10];
const RIGHT = [290, 150];
const BOTTOM = [150, 290];
const LEFT = [10, 150];
const CENTER = [150, 150];

// Internal grid points
const GRID_POINTS: Record<string, [number, number]> = {
  // Top edge
  TL: [70, 10],
  TR: [230, 10],
  // Left edge
  LT: [10, 70],
  LB: [10, 230],
  // Right edge
  RT: [290, 70],
  RB: [290, 230],
  // Bottom edge
  BL: [70, 290],
  BR: [230, 290],
  // Inner grid intersections
  I_TL: [70, 70],
  I_TC: [150, 70],
  I_TR: [230, 70],
  I_ML: [70, 150],
  I_MR: [230, 150],
  I_BL: [70, 230],
  I_BC: [150, 230],
  I_BR: [230, 230],
};

/**
 * Each house is defined by its polygon vertices (triangular sections within the diamond).
 * The houses follow the traditional North Indian layout going counterclockwise from house 1.
 */
const HOUSE_POLYGONS: Record<number, [number, number][]> = {
  1:  [[70, 10], [230, 10], [150, 70]],                    // Top center triangle
  2:  [[230, 10], [290, 70], [230, 70], [150, 70]],        // Top right quadrilateral
  3:  [[290, 70], [290, 150], [230, 150], [230, 70]],      // Right top quadrilateral
  4:  [[290, 150], [290, 230], [230, 230], [230, 150]],    // Right bottom quadrilateral
  5:  [[290, 230], [230, 290], [150, 230], [230, 230]],    // Bottom right quadrilateral
  6:  [[230, 290], [70, 290], [150, 230]],                  // Bottom center triangle
  7:  [[70, 290], [10, 230], [70, 230], [150, 230]],       // Bottom left quadrilateral
  8:  [[10, 230], [10, 150], [70, 150], [70, 230]],        // Left bottom quadrilateral
  9:  [[10, 150], [10, 70], [70, 70], [70, 150]],          // Left top quadrilateral
  10: [[10, 70], [70, 10], [150, 70], [70, 70]],           // Top left quadrilateral
  11: [[70, 70], [150, 70], [150, 150], [70, 150]],        // Inner left quadrilateral
  12: [[150, 70], [230, 70], [230, 150], [150, 150]],      // Inner right quadrilateral
};

/** Centroid of a polygon for text placement */
function getCentroid(points: [number, number][]): [number, number] {
  const n = points.length;
  const cx = points.reduce((sum, p) => sum + p[0], 0) / n;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / n;
  return [Math.round(cx), Math.round(cy)];
}

/** Slightly offset centroid for planet text vs house number text */
function getHouseLabelPos(points: [number, number][], offset: [number, number] = [0, 0]): [number, number] {
  const [cx, cy] = getCentroid(points);
  return [cx + offset[0], cy + offset[1]];
}

export default function KundaliChart({ planetaryPositions, ascendant, sunSign, moonSign }: KundaliChartProps) {
  // Group planets by house
  const planetsByHouse: Record<number, { name: string; abbr: string; retrograde: boolean }[]> = {};
  for (const [planetName, pos] of Object.entries(planetaryPositions)) {
    const house = pos.house;
    if (!planetsByHouse[house]) planetsByHouse[house] = [];
    planetsByHouse[house].push({
      name: planetName,
      abbr: PLANET_ABBR[planetName] || planetName.substring(0, 2),
      retrograde: pos.retrograde,
    });
  }

  // Map zodiac signs to houses based on planetary positions
  const signByHouse: Record<number, string> = {};
  for (const pos of Object.values(planetaryPositions)) {
    if (!signByHouse[pos.house]) {
      signByHouse[pos.house] = pos.sign;
    }
  }
  // Fill in remaining houses from ascendant
  const ZODIAC_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIdx = ZODIAC_ORDER.indexOf(ascendant);
  if (ascIdx >= 0) {
    for (let h = 1; h <= 12; h++) {
      if (!signByHouse[h]) {
        const signIdx = (ascIdx + h - 1) % 12;
        signByHouse[h] = ZODIAC_ORDER[signIdx];
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex justify-center"
    >
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] h-auto kundali-chart"
        role="img"
        aria-label="North Indian Kundali Chart"
      >
        <defs>
          {/* Background gradient */}
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF7" className="chart-bg-light" />
            <stop offset="100%" stopColor="#F5F0E6" className="chart-bg-light" />
          </radialGradient>
          {/* Dark mode background gradient */}
          <radialGradient id="chartBgDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2D2320" />
            <stop offset="100%" stopColor="#1A1412" />
          </radialGradient>
          {/* Gold highlight for 1st house */}
          <linearGradient id="ascendantGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.05" />
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id="chartShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#5D4037" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer diamond with shadow - light mode */}
        <polygon
          points={`${TOP[0]},${TOP[1]} ${RIGHT[0]},${RIGHT[1]} ${BOTTOM[0]},${BOTTOM[1]} ${LEFT[0]},${LEFT[1]}`}
          fill="url(#chartBg)"
          stroke="#5D4037"
          strokeWidth="2.5"
          filter="url(#chartShadow)"
          className="chart-diamond-light"
        />

        {/* Internal grid lines */}
        <g stroke="#5D4037" strokeWidth="1.2" opacity="0.7" className="chart-lines">
          {/* Vertical lines within diamond */}
          <line x1={70} y1={10} x2={70} y2={70} />
          <line x1={70} y1={70} x2={70} y2={230} />
          <line x1={70} y1={230} x2={70} y2={290} />
          <line x1={230} y1={10} x2={230} y2={70} />
          <line x1={230} y1={70} x2={230} y2={230} />
          <line x1={230} y1={230} x2={230} y2={290} />
          {/* Horizontal lines within diamond */}
          <line x1={10} y1={70} x2={70} y2={70} />
          <line x1={70} y1={70} x2={230} y2={70} />
          <line x1={230} y1={70} x2={290} y2={70} />
          <line x1={10} y1={230} x2={70} y2={230} />
          <line x1={70} y1={230} x2={230} y2={230} />
          <line x1={230} y1={230} x2={290} y2={230} />
          {/* Center cross */}
          <line x1={70} y1={150} x2={230} y2={150} />
          <line x1={150} y1={70} x2={150} y2={230} />
          {/* Diagonal lines from center to midpoints of diamond edges */}
          <line x1={150} y1={10} x2={150} y2={70} />
          <line x1={150} y1={230} x2={150} y2={290} />
          <line x1={10} y1={150} x2={70} y2={150} />
          <line x1={230} y1={150} x2={290} y2={150} />
        </g>

        {/* 1st house highlight (Ascendant) */}
        <polygon
          points={HOUSE_POLYGONS[1].map(p => p.join(',')).join(' ')}
          fill="url(#ascendantGlow)"
          stroke="none"
        />

        {/* House content: zodiac symbols, house numbers, planets */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          const polygon = HOUSE_POLYGONS[houseNum];
          const [cx, cy] = getCentroid(polygon);
          const sign = signByHouse[houseNum] || '';
          const zodiacSymbol = ZODIAC_SYMBOLS[sign] || '';
          const planets = planetsByHouse[houseNum] || [];
          const isFirstHouse = houseNum === 1;

          // Adjust label position based on house shape
          let houseLabelOffset: [number, number] = [0, 0];
          let zodiacOffset: [number, number] = [0, -12];
          let planetStartY = cy + 6;

          if (houseNum === 1) {
            houseLabelOffset = [0, -2];
            zodiacOffset = [0, -14];
            planetStartY = cy + 4;
          } else if (houseNum === 6) {
            houseLabelOffset = [0, 2];
            zodiacOffset = [0, -10];
            planetStartY = cy + 8;
          }

          return (
            <g key={houseNum}>
              {/* Zodiac symbol */}
              {zodiacSymbol && (
                <text
                  x={cx + zodiacOffset[0]}
                  y={cx === 150 && cy === 150 ? cy - 8 : cy + zodiacOffset[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill={isFirstHouse ? '#D4AF37' : '#8D6E63'}
                  className="chart-zodiac"
                  opacity={0.8}
                >
                  {zodiacSymbol}
                </text>
              )}

              {/* House number */}
              <text
                x={cx + houseLabelOffset[0] - (zodiacSymbol ? 22 : 0)}
                y={cy + houseLabelOffset[1] - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="600"
                fill={isFirstHouse ? '#D4AF37' : '#A1887F'}
                className="chart-house-num"
                opacity={0.7}
              >
                {houseNum}
              </text>

              {/* Planet abbreviations */}
              {planets.map((planet, pi) => {
                const pY = planetStartY + pi * 11;
                const clampedPY = Math.min(Math.max(pY, polygon[0][1] + 8), polygon[polygon.length - 1][1] - 4);
                return (
                  <g key={planet.name}>
                    <text
                      x={cx + 2}
                      y={clampedPY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill={isFirstHouse ? '#8B6914' : '#4E342E'}
                      className="chart-planet"
                    >
                      {planet.abbr}
                    </text>
                    {planet.retrograde && (
                      <text
                        x={cx + 14}
                        y={clampedPY - 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="6"
                        fontWeight="600"
                        fill="#B71C1C"
                      >
                        R
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Ascendant marker */}
        <text
          x={150}
          y={4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontWeight="700"
          fill="#D4AF37"
          letterSpacing="1"
        >
          ASC
        </text>

        {/* Decorative corner dots */}
        {[TOP, RIGHT, BOTTOM, LEFT].map((point, i) => (
          <circle
            key={i}
            cx={point[0]}
            cy={point[1]}
            r="3"
            fill="#5D4037"
            className="chart-dot"
            opacity={0.5}
          />
        ))}

        {/* Center point decoration */}
        <circle cx={150} cy={150} r="2" fill="#D4AF37" opacity={0.4} />
      </svg>
    </motion.div>
  );
}
