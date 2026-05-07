'use client';

import { motion } from 'framer-motion';

interface BirthDetailsInfo {
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
}

interface KundaliChartProps {
  planetaryPositions: Record<string, { sign: string; degree: number; house: number; retrograde: boolean }>;
  ascendant: string;
  ascendantDegree?: number;
  sunSign: string;
  moonSign: string;
  birthDetails?: BirthDetailsInfo;
  nakshatra?: string;
  compact?: boolean;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

/**
 * North Indian Kundali Chart Layout
 *
 * The chart is a diamond shape (rotated square) divided into 12 triangular sections.
 * House 1 (Ascendant) is always at the top center triangle.
 * Houses proceed counterclockwise: 2, 3, 4, ... 12.
 *
 * Extended view (400x440) includes birth details header above the diamond.
 * Diamond view (300x300) stays at y offset 140.
 */

// Diamond vertices (offset by 50, 140 for the extended view)
const OX = 50; // x offset for centering in 400-wide viewbox
const OY = 140; // y offset for birth details header

const TOP = [150 + OX, 10 + OY];
const RIGHT = [290 + OX, 150 + OY];
const BOTTOM = [150 + OX, 290 + OY];
const LEFT = [10 + OX, 150 + OY];
const CENTER = [150 + OX, 150 + OY];

// Internal grid points (offset)
function gp(x: number, y: number): [number, number] {
  return [x + OX, y + OY];
}

const GRID_POINTS: Record<string, [number, number]> = {
  TL: gp(70, 10), TR: gp(230, 10),
  LT: gp(10, 70), LB: gp(10, 230),
  RT: gp(290, 70), RB: gp(290, 230),
  BL: gp(70, 290), BR: gp(230, 290),
  I_TL: gp(70, 70), I_TC: gp(150, 70), I_TR: gp(230, 70),
  I_ML: gp(70, 150), I_MR: gp(230, 150),
  I_BL: gp(70, 230), I_BC: gp(150, 230), I_BR: gp(230, 230),
};

/**
 * Each house is defined by its polygon vertices.
 * Houses follow the traditional North Indian layout going counterclockwise from house 1.
 */
const HOUSE_POLYGONS: Record<number, [number, number][]> = {
  1:  [gp(70, 10), gp(230, 10), gp(150, 70)],
  2:  [gp(230, 10), gp(290, 70), gp(230, 70), gp(150, 70)],
  3:  [gp(290, 70), gp(290, 150), gp(230, 150), gp(230, 70)],
  4:  [gp(290, 150), gp(290, 230), gp(230, 230), gp(230, 150)],
  5:  [gp(290, 230), gp(230, 290), gp(150, 230), gp(230, 230)],
  6:  [gp(230, 290), gp(70, 290), gp(150, 230)],
  7:  [gp(70, 290), gp(10, 230), gp(70, 230), gp(150, 230)],
  8:  [gp(10, 230), gp(10, 150), gp(70, 150), gp(70, 230)],
  9:  [gp(10, 150), gp(10, 70), gp(70, 70), gp(70, 150)],
  10: [gp(10, 70), gp(70, 10), gp(150, 70), gp(70, 70)],
  11: [gp(70, 70), gp(150, 70), gp(150, 150), gp(70, 150)],
  12: [gp(150, 70), gp(230, 70), gp(230, 150), gp(150, 150)],
};

/** Centroid of a polygon for text placement */
function getCentroid(points: [number, number][]): [number, number] {
  const n = points.length;
  const cx = points.reduce((sum, p) => sum + p[0], 0) / n;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / n;
  return [Math.round(cx), Math.round(cy)];
}

/** Format degree as D°M' */
function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

export default function KundaliChart({ planetaryPositions, ascendant, ascendantDegree, sunSign, moonSign, birthDetails, nakshatra, compact }: KundaliChartProps) {
  // Group planets by house with degree info
  const planetsByHouse: Record<number, { name: string; abbr: string; symbol: string; degree: number; retrograde: boolean }[]> = {};
  for (const [planetName, pos] of Object.entries(planetaryPositions)) {
    const house = pos.house;
    if (!planetsByHouse[house]) planetsByHouse[house] = [];
    planetsByHouse[house].push({
      name: planetName,
      abbr: PLANET_ABBR[planetName] || planetName.substring(0, 2),
      symbol: PLANET_SYMBOLS[planetName] || '●',
      degree: pos.degree,
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

  // Format birth date nicely
  const formatBirthDate = (dob?: string) => {
    if (!dob) return '';
    try {
      const d = new Date(dob);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dob;
    }
  };

  const isCompact = compact ?? false;
  const viewHeight = isCompact ? 300 : 440;
  const diamondOffset = isCompact ? 0 : 0; // We'll use conditional rendering

  if (isCompact) {
    // Compact mode: just the diamond chart without birth details header
    // Use original 300x300 coordinates
    const C_TOP = [150, 10];
    const C_RIGHT = [290, 150];
    const C_BOTTOM = [150, 290];
    const C_LEFT = [10, 150];

    const COMPACT_HOUSE_POLYGONS: Record<number, [number, number][]> = {
      1:  [[70, 10], [230, 10], [150, 70]],
      2:  [[230, 10], [290, 70], [230, 70], [150, 70]],
      3:  [[290, 70], [290, 150], [230, 150], [230, 70]],
      4:  [[290, 150], [290, 230], [230, 230], [230, 150]],
      5:  [[290, 230], [230, 290], [150, 230], [230, 230]],
      6:  [[230, 290], [70, 290], [150, 230]],
      7:  [[70, 290], [10, 230], [70, 230], [150, 230]],
      8:  [[10, 230], [10, 150], [70, 150], [70, 230]],
      9:  [[10, 150], [10, 70], [70, 70], [70, 150]],
      10: [[10, 70], [70, 10], [150, 70], [70, 70]],
      11: [[70, 70], [150, 70], [150, 150], [70, 150]],
      12: [[150, 70], [230, 70], [230, 150], [150, 150]],
    };

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
          className="w-full max-w-[280px] h-auto kundali-chart"
          role="img"
          aria-label="North Indian Kundali Chart"
        >
          <defs>
            <radialGradient id="cChartBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF7" className="chart-bg-light" />
              <stop offset="100%" stopColor="#F5F0E6" className="chart-bg-light" />
            </radialGradient>
            <linearGradient id="cAscGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.05" />
            </linearGradient>
            <filter id="cShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#5D4037" floodOpacity="0.15" />
            </filter>
          </defs>

          <polygon
            points={`${C_TOP[0]},${C_TOP[1]} ${C_RIGHT[0]},${C_RIGHT[1]} ${C_BOTTOM[0]},${C_BOTTOM[1]} ${C_LEFT[0]},${C_LEFT[1]}`}
            fill="url(#cChartBg)" stroke="#5D4037" strokeWidth="2" filter="url(#cShadow)" className="chart-diamond-light"
          />

          <g stroke="#5D4037" strokeWidth="1" opacity="0.6" className="chart-lines">
            <line x1={70} y1={10} x2={70} y2={70} /><line x1={70} y1={70} x2={70} y2={230} /><line x1={70} y1={230} x2={70} y2={290} />
            <line x1={230} y1={10} x2={230} y2={70} /><line x1={230} y1={70} x2={230} y2={230} /><line x1={230} y1={230} x2={230} y2={290} />
            <line x1={10} y1={70} x2={70} y2={70} /><line x1={70} y1={70} x2={230} y2={70} /><line x1={230} y1={70} x2={290} y2={70} />
            <line x1={10} y1={230} x2={70} y2={230} /><line x1={70} y1={230} x2={230} y2={230} /><line x1={230} y1={230} x2={290} y2={230} />
            <line x1={70} y1={150} x2={230} y2={150} /><line x1={150} y1={70} x2={150} y2={230} />
            <line x1={150} y1={10} x2={150} y2={70} /><line x1={150} y1={230} x2={150} y2={290} />
            <line x1={10} y1={150} x2={70} y2={150} /><line x1={230} y1={150} x2={290} y2={150} />
          </g>

          <polygon points={COMPACT_HOUSE_POLYGONS[1].map(p => p.join(',')).join(' ')} fill="url(#cAscGlow)" stroke="none" />

          {Array.from({ length: 12 }, (_, i) => {
            const houseNum = i + 1;
            const polygon = COMPACT_HOUSE_POLYGONS[houseNum];
            const [cx, cy] = getCentroid(polygon);
            const sign = signByHouse[houseNum] || '';
            const zodiacSymbol = ZODIAC_SYMBOLS[sign] || '';
            const planets = planetsByHouse[houseNum] || [];
            const isFirstHouse = houseNum === 1;

            return (
              <g key={houseNum}>
                {zodiacSymbol && (
                  <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={isFirstHouse ? '#D4AF37' : '#8D6E63'} className="chart-zodiac" opacity={0.7}>
                    {zodiacSymbol}
                  </text>
                )}
                <text x={cx - 18} y={cy - 6} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="600" fill={isFirstHouse ? '#D4AF37' : '#A1887F'} className="chart-house-num" opacity={0.6}>
                  {houseNum}
                </text>
                {planets.map((planet, pi) => {
                  const pY = cy + 2 + pi * 10;
                  return (
                    <g key={planet.name}>
                      <text x={cx} y={pY} textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fontWeight="700" fill={isFirstHouse ? '#8B6914' : '#4E342E'} className="chart-planet">
                        {planet.abbr} {Math.floor(planet.degree)}°{planet.retrograde ? ' R' : ''}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          <text x={150} y={5} textAnchor="middle" dominantBaseline="middle" fontSize="6" fontWeight="700" fill="#D4AF37" letterSpacing="1">ASC</text>
          {[C_TOP, C_RIGHT, C_BOTTOM, C_LEFT].map((point, i) => (
            <circle key={i} cx={point[0]} cy={point[1]} r="2.5" fill="#5D4037" className="chart-dot" opacity={0.4} />
          ))}
          <circle cx={150} cy={150} r="1.5" fill="#D4AF37" opacity={0.3} />
        </svg>
      </motion.div>
    );
  }

  // Full mode with birth details header
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex justify-center"
    >
      <svg
        viewBox={`0 0 400 ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[380px] h-auto kundali-chart"
        role="img"
        aria-label="North Indian Kundali Chart"
      >
        <defs>
          <radialGradient id="fChartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF7" className="chart-bg-light" />
            <stop offset="100%" stopColor="#F5F0E6" className="chart-bg-light" />
          </radialGradient>
          <radialGradient id="fChartBgDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2D2320" />
            <stop offset="100%" stopColor="#1A1412" />
          </radialGradient>
          <linearGradient id="fAscGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="fHeaderBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8D6E63" stopOpacity="0.05" />
          </linearGradient>
          <filter id="fShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#5D4037" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Birth Details Header */}
        <rect x="10" y="8" width="380" height="120" rx="12" fill="url(#fHeaderBg)" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.3" />

        {/* Decorative gold line at top of header */}
        <line x1="30" y1="8" x2="370" y2="8" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.5" />

        {/* Title */}
        <text x="200" y="32" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#5D4037" className="chart-planet" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          जन्म कुंडली — Birth Chart
        </text>

        {/* Birth details rows */}
        {birthDetails?.name && (
          <text x="30" y="52" textAnchor="start" dominantBaseline="middle" fontSize="10" fill="#4E342E" className="chart-house-num">
            <tspan fontWeight="600" fill="#8D6E63">Name: </tspan>
            <tspan fill="#4E342E">{birthDetails.name}</tspan>
          </text>
        )}

        {birthDetails?.dateOfBirth && (
          <text x="30" y="68" textAnchor="start" dominantBaseline="middle" fontSize="9.5" fill="#4E342E" className="chart-house-num">
            <tspan fontWeight="600" fill="#8D6E63">DOB: </tspan>
            <tspan fill="#4E342E">{formatBirthDate(birthDetails.dateOfBirth)}</tspan>
            {birthDetails.timeOfBirth && (
              <tspan fill="#8D6E63"> | </tspan>
            )}
            {birthDetails.timeOfBirth && (
              <>
                <tspan fontWeight="600" fill="#8D6E63">TOB: </tspan>
                <tspan fill="#4E342E">{birthDetails.timeOfBirth}</tspan>
              </>
            )}
          </text>
        )}

        {birthDetails?.placeOfBirth && (
          <text x="30" y="84" textAnchor="start" dominantBaseline="middle" fontSize="9.5" fill="#4E342E" className="chart-house-num">
            <tspan fontWeight="600" fill="#8D6E63">Place: </tspan>
            <tspan fill="#4E342E">{birthDetails.placeOfBirth}</tspan>
          </text>
        )}

        {/* Ascendant info line */}
        <text x="30" y="104" textAnchor="start" dominantBaseline="middle" fontSize="9.5" fill="#4E342E" className="chart-house-num">
          <tspan fontWeight="600" fill="#D4AF37">Asc: </tspan>
          <tspan fill="#4E342E">{ZODIAC_SYMBOLS[ascendant] || ''} {ascendant}</tspan>
          {ascendantDegree !== undefined && (
            <tspan fill="#8D6E63"> {formatDegree(ascendantDegree)}</tspan>
          )}
          {nakshatra && (
            <>
              <tspan fill="#8D6E63"> | </tspan>
              <tspan fontWeight="600" fill="#8D6E63">Nak: </tspan>
              <tspan fill="#4E342E">{nakshatra}</tspan>
            </>
          )}
        </text>

        {/* Sun/Moon quick info */}
        <text x="200" y="120" textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63" className="chart-house-num">
          <tspan>☉ {sunSign}</tspan>
          <tspan dx="8">☽ {moonSign}</tspan>
        </text>

        {/* Outer diamond with shadow */}
        <polygon
          points={`${TOP[0]},${TOP[1]} ${RIGHT[0]},${RIGHT[1]} ${BOTTOM[0]},${BOTTOM[1]} ${LEFT[0]},${LEFT[1]}`}
          fill="url(#fChartBg)" stroke="#5D4037" strokeWidth="2.5" filter="url(#fShadow)" className="chart-diamond-light"
        />

        {/* Internal grid lines */}
        <g stroke="#5D4037" strokeWidth="1.2" opacity="0.7" className="chart-lines">
          {/* Vertical lines within diamond */}
          <line x1={70 + OX} y1={10 + OY} x2={70 + OX} y2={70 + OY} />
          <line x1={70 + OX} y1={70 + OY} x2={70 + OX} y2={230 + OY} />
          <line x1={70 + OX} y1={230 + OY} x2={70 + OX} y2={290 + OY} />
          <line x1={230 + OX} y1={10 + OY} x2={230 + OX} y2={70 + OY} />
          <line x1={230 + OX} y1={70 + OY} x2={230 + OX} y2={230 + OY} />
          <line x1={230 + OX} y1={230 + OY} x2={230 + OX} y2={290 + OY} />
          {/* Horizontal lines within diamond */}
          <line x1={10 + OX} y1={70 + OY} x2={70 + OX} y2={70 + OY} />
          <line x1={70 + OX} y1={70 + OY} x2={230 + OX} y2={70 + OY} />
          <line x1={230 + OX} y1={70 + OY} x2={290 + OX} y2={70 + OY} />
          <line x1={10 + OX} y1={230 + OY} x2={70 + OX} y2={230 + OY} />
          <line x1={70 + OX} y1={230 + OY} x2={230 + OX} y2={230 + OY} />
          <line x1={230 + OX} y1={230 + OY} x2={290 + OX} y2={230 + OY} />
          {/* Center cross */}
          <line x1={70 + OX} y1={150 + OY} x2={230 + OX} y2={150 + OY} />
          <line x1={150 + OX} y1={70 + OY} x2={150 + OX} y2={230 + OY} />
          {/* Diagonal lines */}
          <line x1={150 + OX} y1={10 + OY} x2={150 + OX} y2={70 + OY} />
          <line x1={150 + OX} y1={230 + OY} x2={150 + OX} y2={290 + OY} />
          <line x1={10 + OX} y1={150 + OY} x2={70 + OX} y2={150 + OY} />
          <line x1={230 + OX} y1={150 + OY} x2={290 + OX} y2={150 + OY} />
        </g>

        {/* 1st house highlight (Ascendant) */}
        <polygon
          points={HOUSE_POLYGONS[1].map(p => p.join(',')).join(' ')}
          fill="url(#fAscGlow)" stroke="none"
        />

        {/* House content */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          const polygon = HOUSE_POLYGONS[houseNum];
          const [cx, cy] = getCentroid(polygon);
          const sign = signByHouse[houseNum] || '';
          const zodiacSymbol = ZODIAC_SYMBOLS[sign] || '';
          const planets = planetsByHouse[houseNum] || [];
          const isFirstHouse = houseNum === 1;

          return (
            <g key={houseNum}>
              {/* Zodiac symbol */}
              {zodiacSymbol && (
                <text
                  x={cx}
                  y={cy - 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fill={isFirstHouse ? '#D4AF37' : '#8D6E63'}
                  className="chart-zodiac"
                  opacity={0.8}
                >
                  {zodiacSymbol}
                </text>
              )}

              {/* House number */}
              <text
                x={cx - 22}
                y={cy - 8}
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

              {/* Planet abbreviations with degree */}
              {planets.map((planet, pi) => {
                const pY = cy + 3 + pi * 12;
                return (
                  <g key={planet.name}>
                    <text
                      x={cx + 2}
                      y={pY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill={isFirstHouse ? '#8B6914' : '#4E342E'}
                      className="chart-planet"
                    >
                      {planet.abbr} {Math.floor(planet.degree)}°
                    </text>
                    {planet.retrograde && (
                      <text
                        x={cx + 18}
                        y={pY - 1}
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
          x={150 + OX}
          y={4 + OY}
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
          <circle key={i} cx={point[0]} cy={point[1]} r="3" fill="#5D4037" className="chart-dot" opacity={0.5} />
        ))}

        {/* Center point decoration */}
        <circle cx={150 + OX} cy={150 + OY} r="2" fill="#D4AF37" opacity={0.4} />
      </svg>
    </motion.div>
  );
}
