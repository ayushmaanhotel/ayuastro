'use client';
import { motion } from 'framer-motion';
// ─── Props Interface (unchanged) ─────────────────────────────────────────────
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
// ─── Constants ───────────────────────────────────────────────────────────────
const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
const ZODIAC_ABBR: Record<string, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can', Leo: 'Leo', Virgo: 'Vir',
  Libra: 'Lib', Scorpio: 'Sco', Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};
const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
/** Planet display config — full names, symbols, and distinct colors */
const PLANET_CONFIG: Record<string, { name: string; symbol: string; color: string }> = {
  Sun:     { name: 'Sun',     symbol: '☉', color: '#EAB308' },
  Moon:    { name: 'Moon',    symbol: '☽', color: '#94A3B8' },
  Mars:    { name: 'Mars',    symbol: '♂', color: '#DC2626' },
  Mercury: { name: 'Mercury', symbol: '☿', color: '#22C55E' },
  Jupiter: { name: 'Jupiter', symbol: '♃', color: '#F59E0B' },
  Venus:   { name: 'Venus',   symbol: '♀', color: '#EC4899' },
  Saturn:  { name: 'Saturn',  symbol: '♄', color: '#1E3A5F' },
  Rahu:    { name: 'Rahu',    symbol: '☊', color: '#7C3AED' },
  Ketu:    { name: 'Ketu',    symbol: '☋', color: '#6B7280' },
};
/**
 * House size categories for adaptive text sizing.
 * North Indian layout:
 *   - "narrow": side rectangles (3,4,8,9) — ~86px wide
 *   - "medium": center squares (11,12) — ~114px wide
 *   - "wide": triangles (1,6) and trapezoids (2,5,7,10) — ~170-229px wide
 */
type HouseSize = 'narrow' | 'medium' | 'wide';
const HOUSE_SIZE: Record<number, HouseSize> = {
  1: 'wide', 2: 'wide', 3: 'narrow', 4: 'narrow',
  5: 'wide', 6: 'wide', 7: 'wide', 8: 'narrow',
  9: 'narrow', 10: 'wide', 11: 'medium', 12: 'medium',
};
/** Text layout presets per house size */
interface LayoutPreset {
  planetFont: number;
  degreeFont: number;
  dotR: number;
  dotOffsetX: number;
  nameOffsetX: number;
  degOffsetX: number;
  retroOffsetX: number;
  lineGap: number;
  zodiacFont: number;
  houseNumFont: number;
  badgeR: number;
}
const PRESETS: Record<HouseSize, LayoutPreset> & { compact: LayoutPreset } = {
  wide: {
    planetFont: 11, degreeFont: 9, dotR: 3.5,
    dotOffsetX: -48, nameOffsetX: -40, degOffsetX: 14, retroOffsetX: 46,
    lineGap: 17, zodiacFont: 13, houseNumFont: 8.5, badgeR: 8,
  },
  medium: {
    planetFont: 10.5, degreeFont: 8.5, dotR: 3,
    dotOffsetX: -40, nameOffsetX: -32, degOffsetX: 12, retroOffsetX: 40,
    lineGap: 16, zodiacFont: 12, houseNumFont: 8, badgeR: 7,
  },
  narrow: {
    planetFont: 9.5, degreeFont: 7.5, dotR: 2.5,
    dotOffsetX: -30, nameOffsetX: -24, degOffsetX: 8, retroOffsetX: 32,
    lineGap: 15, zodiacFont: 11, houseNumFont: 7.5, badgeR: 6.5,
  },
  compact: {
    planetFont: 8.5, degreeFont: 7, dotR: 2,
    dotOffsetX: -24, nameOffsetX: -18, degOffsetX: 6, retroOffsetX: 26,
    lineGap: 12, zodiacFont: 10, houseNumFont: 7, badgeR: 5.5,
  },
};
// ─── Layout Constants ────────────────────────────────────────────────────────
// Full-mode diamond grid (scaled from original 280→400, scale≈1.429)
const F_OX = 25;
const F_OY = 170;
const F_SCALE = 400 / 280;
function fGrid(x: number, y: number): [number, number] {
  return [Math.round(x * F_SCALE) + F_OX, Math.round(y * F_SCALE) + F_OY];
}
const F_TOP    = fGrid(150, 10);
const F_RIGHT  = fGrid(290, 150);
const F_BOTTOM = fGrid(150, 290);
const F_LEFT   = fGrid(10, 150);
const F_CENTER = fGrid(150, 150);
const F_HOUSE_POLYGONS: Record<number, [number, number][]> = {
  1:  [fGrid(70, 10),  fGrid(230, 10), fGrid(150, 70)],
  2:  [fGrid(230, 10), fGrid(290, 70), fGrid(230, 70), fGrid(150, 70)],
  3:  [fGrid(290, 70), fGrid(290, 150), fGrid(230, 150), fGrid(230, 70)],
  4:  [fGrid(290, 150), fGrid(290, 230), fGrid(230, 230), fGrid(230, 150)],
  5:  [fGrid(290, 230), fGrid(230, 290), fGrid(150, 230), fGrid(230, 230)],
  6:  [fGrid(230, 290), fGrid(70, 290), fGrid(150, 230)],
  7:  [fGrid(70, 290), fGrid(10, 230), fGrid(70, 230), fGrid(150, 230)],
  8:  [fGrid(10, 230), fGrid(10, 150), fGrid(70, 150), fGrid(70, 230)],
  9:  [fGrid(10, 150), fGrid(10, 70), fGrid(70, 70), fGrid(70, 150)],
  10: [fGrid(10, 70),  fGrid(70, 10),  fGrid(150, 70), fGrid(70, 70)],
  11: [fGrid(70, 70),  fGrid(150, 70), fGrid(150, 150), fGrid(70, 150)],
  12: [fGrid(150, 70), fGrid(230, 70), fGrid(230, 150), fGrid(150, 150)],
};
// Compact-mode diamond grid (scaled 280→340, scale≈1.214)
const C_SCALE = 340 / 280;
const C_OX = 40;
const C_OY = 30;
function cGrid(x: number, y: number): [number, number] {
  return [Math.round(x * C_SCALE) + C_OX, Math.round(y * C_SCALE) + C_OY];
}
const C_HOUSE_POLYGONS: Record<number, [number, number][]> = {
  1:  [cGrid(70, 10),  cGrid(230, 10), cGrid(150, 70)],
  2:  [cGrid(230, 10), cGrid(290, 70), cGrid(230, 70), cGrid(150, 70)],
  3:  [cGrid(290, 70), cGrid(290, 150), cGrid(230, 150), cGrid(230, 70)],
  4:  [cGrid(290, 150), cGrid(290, 230), cGrid(230, 230), cGrid(230, 150)],
  5:  [cGrid(290, 230), cGrid(230, 290), cGrid(150, 230), cGrid(230, 230)],
  6:  [cGrid(230, 290), cGrid(70, 290), cGrid(150, 230)],
  7:  [cGrid(70, 290), cGrid(10, 230), cGrid(70, 230), cGrid(150, 230)],
  8:  [cGrid(10, 230), cGrid(10, 150), cGrid(70, 150), cGrid(70, 230)],
  9:  [cGrid(10, 150), cGrid(10, 70), cGrid(70, 70), cGrid(70, 150)],
  10: [cGrid(10, 70),  cGrid(70, 10),  cGrid(150, 70), cGrid(70, 70)],
  11: [cGrid(70, 70),  cGrid(150, 70), cGrid(150, 150), cGrid(70, 150)],
  12: [cGrid(150, 70), cGrid(230, 70), cGrid(230, 150), cGrid(150, 150)],
};
// ─── Utility Functions ───────────────────────────────────────────────────────
function getCentroid(points: [number, number][]): [number, number] {
  const n = points.length;
  const cx = points.reduce((sum, p) => sum + p[0], 0) / n;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / n;
  return [Math.round(cx), Math.round(cy)];
}
function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}
function formatBirthDate(dob?: string): string {
  if (!dob) return '';
  try {
    const d = new Date(dob);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dob;
  }
}
// ─── Sub-Components ──────────────────────────────────────────────────────────
function HousePlanets({
  planets,
  cx,
  startY,
  isAsc,
  preset,
}: {
  planets: { name: string; degree: number; retrograde: boolean }[];
  cx: number;
  startY: number;
  isAsc: boolean;
  preset: LayoutPreset;
}) {
  return (
    <>
      {planets.map((planet) => {
        const py = startY + planets.indexOf(planet) * preset.lineGap;
        const config = PLANET_CONFIG[planet.name];
        const dotColor = config?.color || '#8D6E63';
        const displayName = config?.name || planet.name;
        return (
          <g key={planet.name} className="chart-planet-group">
            {/* Colored planet dot */}
            <circle
              cx={cx + preset.dotOffsetX}
              cy={py}
              r={preset.dotR}
              fill={dotColor}
              className="chart-planet-dot"
            />
            {/* Planet name */}
            <text
              x={cx + preset.nameOffsetX}
              y={py}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={preset.planetFont}
              fontWeight="600"
              fill={isAsc ? '#8B6914' : '#4E342E'}
              className="chart-planet"
              style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}
            >
              {displayName}
            </text>
            {/* Degree */}
            <text
              x={cx + preset.degOffsetX}
              y={py}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={preset.degreeFont}
              fill={isAsc ? '#B8960C' : '#8D6E63'}
              className="chart-degree"
              style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}
            >
              {formatDegree(planet.degree)}
            </text>
            {/* Retrograde indicator */}
            {planet.retrograde && (
              <text
                x={cx + preset.retroOffsetX}
                y={py}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={preset.degreeFont}
                fontWeight="700"
                fill="#DC2626"
                className="chart-retrograde"
              >
                ℞
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
function HouseSection({
  houseNum,
  polygon,
  sign,
  planets,
  isFull,
}: {
  houseNum: number;
  polygon: [number, number][];
  sign: string;
  planets: { name: string; degree: number; retrograde: boolean }[];
  isFull: boolean;
}) {
  const [cx, cy] = getCentroid(polygon);
  const isAsc = houseNum === 1;
  const zodiacSymbol = ZODIAC_SYMBOLS[sign] || '';
  const zodiacAbbr = ZODIAC_ABBR[sign] || '';
  // Choose preset based on house size and mode
  const sizeKey = isFull ? HOUSE_SIZE[houseNum] : 'compact';
  const preset = PRESETS[sizeKey];
  // Triangular houses (1, 6) are shorter — reduce top offset
  const isTriangle = polygon.length === 3;
  const yTopOffset = isTriangle ? -6 : -14;
  const badgeYShift = isFull ? 15 : 11;
  // Planet text starts below zodiac + house number
  const planetStartY = cy + 2;
  return (
    <g key={houseNum}>
      {/* Zodiac symbol + abbreviated name */}
      {zodiacSymbol && (
        <text
          x={cx}
          y={cy + yTopOffset}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={preset.zodiacFont}
          fill={isAsc ? '#D4AF37' : '#8D6E63'}
          className="chart-zodiac"
          opacity={0.85}
        >
          {zodiacSymbol} {zodiacAbbr}
        </text>
      )}
      {/* House number in small circled badge */}
      <circle
        cx={cx + preset.dotOffsetX}
        cy={cy + yTopOffset + badgeYShift}
        r={preset.badgeR}
        fill={isAsc ? 'rgba(212,175,55,0.2)' : 'rgba(93,64,55,0.08)'}
        className="chart-house-badge-bg"
      />
      <text
        x={cx + preset.dotOffsetX}
        y={cy + yTopOffset + badgeYShift}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={preset.houseNumFont}
        fontWeight="700"
        fill={isAsc ? '#D4AF37' : '#A1887F'}
        className="chart-house-num"
        opacity={0.75}
      >
        {houseNum}
      </text>
      {/* Planets */}
      {planets.length > 0 && (
        <HousePlanets
          planets={planets}
          cx={cx}
          startY={planetStartY}
          isAsc={isAsc}
          preset={preset}
        />
      )}
    </g>
  );
}
// ─── Grid Lines Helper ───────────────────────────────────────────────────────
function GridLines({ gridFn, opacity = 0.45 }: { gridFn: (x: number, y: number) => [number, number]; opacity?: number }) {
  return (
    <g stroke="#5D4037" strokeWidth="1.2" opacity={opacity} className="chart-lines">
      {/* Top side */}
      <line x1={gridFn(70, 10)[0]} y1={gridFn(70, 10)[1]} x2={gridFn(70, 70)[0]} y2={gridFn(70, 70)[1]} />
      <line x1={gridFn(150, 10)[0]} y1={gridFn(150, 10)[1]} x2={gridFn(150, 70)[0]} y2={gridFn(150, 70)[1]} />
      <line x1={gridFn(230, 10)[0]} y1={gridFn(230, 10)[1]} x2={gridFn(230, 70)[0]} y2={gridFn(230, 70)[1]} />
      {/* Right side */}
      <line x1={gridFn(290, 70)[0]} y1={gridFn(290, 70)[1]} x2={gridFn(230, 70)[0]} y2={gridFn(230, 70)[1]} />
      <line x1={gridFn(290, 150)[0]} y1={gridFn(290, 150)[1]} x2={gridFn(230, 150)[0]} y2={gridFn(230, 150)[1]} />
      <line x1={gridFn(290, 230)[0]} y1={gridFn(290, 230)[1]} x2={gridFn(230, 230)[0]} y2={gridFn(230, 230)[1]} />
      {/* Bottom side */}
      <line x1={gridFn(70, 230)[0]} y1={gridFn(70, 230)[1]} x2={gridFn(70, 290)[0]} y2={gridFn(70, 290)[1]} />
      <line x1={gridFn(150, 230)[0]} y1={gridFn(150, 230)[1]} x2={gridFn(150, 290)[0]} y2={gridFn(150, 290)[1]} />
      <line x1={gridFn(230, 230)[0]} y1={gridFn(230, 230)[1]} x2={gridFn(230, 290)[0]} y2={gridFn(230, 290)[1]} />
      {/* Left side */}
      <line x1={gridFn(10, 70)[0]} y1={gridFn(10, 70)[1]} x2={gridFn(70, 70)[0]} y2={gridFn(70, 70)[1]} />
      <line x1={gridFn(10, 150)[0]} y1={gridFn(10, 150)[1]} x2={gridFn(70, 150)[0]} y2={gridFn(70, 150)[1]} />
      <line x1={gridFn(10, 230)[0]} y1={gridFn(10, 230)[1]} x2={gridFn(70, 230)[0]} y2={gridFn(70, 230)[1]} />
      {/* Center cross */}
      <line x1={gridFn(70, 150)[0]} y1={gridFn(70, 150)[1]} x2={gridFn(230, 150)[0]} y2={gridFn(230, 150)[1]} />
      <line x1={gridFn(150, 70)[0]} y1={gridFn(150, 70)[1]} x2={gridFn(150, 230)[0]} y2={gridFn(150, 230)[1]} />
    </g>
  );
}
// ─── Main Component ──────────────────────────────────────────────────────────
export default function KundaliChart({
  planetaryPositions,
  ascendant,
  ascendantDegree,
  sunSign,
  moonSign,
  birthDetails,
  nakshatra,
  compact,
}: KundaliChartProps) {
  // Group planets by house
  const planetsByHouse: Record<number, { name: string; degree: number; retrograde: boolean }[]> = {};
  for (const [planetName, pos] of Object.entries(planetaryPositions)) {
    const house = pos.house;
    if (!planetsByHouse[house]) planetsByHouse[house] = [];
    planetsByHouse[house].push({
      name: planetName,
      degree: pos.degree,
      retrograde: pos.retrograde,
    });
  }
  // Map zodiac signs to houses
  const signByHouse: Record<number, string> = {};
  for (const pos of Object.values(planetaryPositions)) {
    if (!signByHouse[pos.house]) {
      signByHouse[pos.house] = pos.sign;
    }
  }
  const ascIdx = ZODIAC_ORDER.indexOf(ascendant);
  if (ascIdx >= 0) {
    for (let h = 1; h <= 12; h++) {
      if (!signByHouse[h]) {
        signByHouse[h] = ZODIAC_ORDER[(ascIdx + h - 1) % 12];
      }
    }
  }
  const isCompact = compact ?? false;
  // ══════════════════════════════════════════════════════════════════════════
  //  COMPACT MODE — diamond only
  // ══════════════════════════════════════════════════════════════════════════
  if (isCompact) {
    const C_TOP    = cGrid(150, 10);
    const C_RIGHT  = cGrid(290, 150);
    const C_BOTTOM = cGrid(150, 290);
    const C_LEFT   = cGrid(10, 150);
    const C_CENTER = cGrid(150, 150);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-center"
      >
        <svg
          viewBox="0 0 420 420"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[400px] h-auto kundali-chart"
          role="img"
          aria-label="Birth Chart (Kundali)"
        >
          <defs>
            <radialGradient id="cChartBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF7" className="chart-bg-light" />
              <stop offset="100%" stopColor="#F5F0E6" className="chart-bg-light" />
            </radialGradient>
            <radialGradient id="chartBgDark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2D2320" />
              <stop offset="100%" stopColor="#1A1412" />
            </radialGradient>
            <linearGradient id="cAscGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.04" />
            </linearGradient>
            <filter id="cShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#5D4037" floodOpacity="0.12" />
            </filter>
          </defs>
          {/* Diamond background */}
          <polygon
            points={`${C_TOP[0]},${C_TOP[1]} ${C_RIGHT[0]},${C_RIGHT[1]} ${C_BOTTOM[0]},${C_BOTTOM[1]} ${C_LEFT[0]},${C_LEFT[1]}`}
            fill="url(#cChartBg)" stroke="#5D4037" strokeWidth="2.5" filter="url(#cShadow)"
            className="chart-diamond-light"
          />
          {/* Grid lines */}
          <GridLines gridFn={cGrid} />
          {/* 1st house gold highlight */}
          <polygon
            points={C_HOUSE_POLYGONS[1].map(p => p.join(',')).join(' ')}
            fill="url(#cAscGlow)"
            stroke="none"
          />
          {/* House content */}
          {Array.from({ length: 12 }, (_, i) => {
            const houseNum = i + 1;
            return (
              <HouseSection
                key={houseNum}
                houseNum={houseNum}
                polygon={C_HOUSE_POLYGONS[houseNum]}
                sign={signByHouse[houseNum] || ''}
                planets={planetsByHouse[houseNum] || []}
                isFull={false}
              />
            );
          })}
          {/* Ascendant label */}
          <text
            x={C_TOP[0]}
            y={C_TOP[1] - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="700"
            fill="#D4AF37"
            letterSpacing="1.5"
            className="chart-asc-label"
          >
            ASC
          </text>
          {/* Corner dots */}
          {[C_TOP, C_RIGHT, C_BOTTOM, C_LEFT].map((pt, i) => (
            <circle key={i} cx={pt[0]} cy={pt[1]} r="3" fill="#5D4037" className="chart-dot" opacity={0.4} />
          ))}
          <circle cx={C_CENTER[0]} cy={C_CENTER[1]} r="2" fill="#D4AF37" opacity={0.3} />
        </svg>
      </motion.div>
    );
  }
  // ══════════════════════════════════════════════════════════════════════════
  //  FULL MODE — header + diamond + legend
  // ══════════════════════════════════════════════════════════════════════════
  const VIEW_W = 460;
  const VIEW_H = 710;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex justify-center"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[440px] h-auto kundali-chart"
        role="img"
        aria-label="Birth Chart (Kundali) — North Indian Style"
      >
        <defs>
          <radialGradient id="fChartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF7" className="chart-bg-light" />
            <stop offset="100%" stopColor="#F5F0E6" className="chart-bg-light" />
          </radialGradient>
          <radialGradient id="chartBgDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2D2320" />
            <stop offset="100%" stopColor="#1A1412" />
          </radialGradient>
          <linearGradient id="fAscGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="fHeaderBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8D6E63" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="fLegendBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#8D6E63" stopOpacity="0.02" />
          </linearGradient>
          <filter id="fShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#5D4037" floodOpacity="0.12" />
          </filter>
        </defs>
        {/* ── BIRTH DETAILS HEADER ─────────────────────────────────────────── */}
        <rect
          x="10" y="8" width="440" height="150" rx="14"
          fill="url(#fHeaderBg)" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.3"
        />
        {/* Gold accent bar */}
        <rect x="10" y="8" width="440" height="3" rx="1.5" fill="#D4AF37" opacity="0.4" />
        {/* Title */}
        <text
          x="230" y="34" textAnchor="middle" dominantBaseline="middle"
          fontSize="16" fontWeight="700" fill="#5D4037"
          className="chart-title"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Birth Chart (Kundali)
        </text>
        {/* Name */}
        {birthDetails?.name && (
          <text x="30" y="58" textAnchor="start" dominantBaseline="middle" fontSize="11.5" fill="#4E342E" className="chart-detail-text" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
            <tspan fontWeight="600" fill="#8D6E63">Name </tspan>
            <tspan fill="#4E342E">{birthDetails.name}</tspan>
          </text>
        )}
        {/* DOB | TOB */}
        {(birthDetails?.dateOfBirth || birthDetails?.timeOfBirth) && (
          <text x="30" y="76" textAnchor="start" dominantBaseline="middle" fontSize="10.5" fill="#4E342E" className="chart-detail-text" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
            {birthDetails.dateOfBirth && (
              <>
                <tspan fontWeight="600" fill="#8D6E63">DOB </tspan>
                <tspan fill="#4E342E">{formatBirthDate(birthDetails.dateOfBirth)}</tspan>
              </>
            )}
            {birthDetails.dateOfBirth && birthDetails.timeOfBirth && (
              <tspan fill="#BCAAA4">  ·  </tspan>
            )}
            {birthDetails.timeOfBirth && (
              <>
                <tspan fontWeight="600" fill="#8D6E63">TOB </tspan>
                <tspan fill="#4E342E">{birthDetails.timeOfBirth}</tspan>
              </>
            )}
          </text>
        )}
        {/* Place */}
        {birthDetails?.placeOfBirth && (
          <text x="30" y="93" textAnchor="start" dominantBaseline="middle" fontSize="10.5" fill="#4E342E" className="chart-detail-text" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
            <tspan fontWeight="600" fill="#8D6E63">Place </tspan>
            <tspan fill="#4E342E">{birthDetails.placeOfBirth}</tspan>
          </text>
        )}
        {/* Ascendant + Nakshatra */}
        <text x="30" y="116" textAnchor="start" dominantBaseline="middle" fontSize="11" fill="#4E342E" className="chart-detail-text" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
          <tspan fontWeight="700" fill="#D4AF37">Asc </tspan>
          <tspan fill="#4E342E">{ZODIAC_SYMBOLS[ascendant]} {ascendant}</tspan>
          {ascendantDegree !== undefined && (
            <tspan fill="#8D6E63"> {formatDegree(ascendantDegree)}</tspan>
          )}
          {nakshatra && (
            <>
              <tspan fill="#BCAAA4">  ·  </tspan>
              <tspan fontWeight="600" fill="#8D6E63">Nak </tspan>
              <tspan fill="#4E342E">{nakshatra}</tspan>
            </>
          )}
        </text>
        {/* Sun / Moon sign badges */}
        <g transform="translate(30, 132)">
          <rect x="0" y="0" width="90" height="20" rx="10" fill="rgba(234,179,8,0.1)" stroke="#EAB308" strokeWidth="0.6" strokeOpacity="0.5" />
          <text x="45" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fontWeight="600" fill="#B8960C" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
            ☉ {sunSign}
          </text>
          <rect x="100" y="0" width="90" height="20" rx="10" fill="rgba(148,163,184,0.1)" stroke="#94A3B8" strokeWidth="0.6" strokeOpacity="0.5" />
          <text x="145" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fontWeight="600" fill="#64748B" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
            ☽ {moonSign}
          </text>
        </g>
        {/* ── DIAMOND CHART ────────────────────────────────────────────────── */}
        {/* Outer diamond */}
        <polygon
          points={`${F_TOP[0]},${F_TOP[1]} ${F_RIGHT[0]},${F_RIGHT[1]} ${F_BOTTOM[0]},${F_BOTTOM[1]} ${F_LEFT[0]},${F_LEFT[1]}`}
          fill="url(#fChartBg)" stroke="#5D4037" strokeWidth="2.5" filter="url(#fShadow)"
          className="chart-diamond-light"
        />
        {/* Grid lines */}
        <GridLines gridFn={fGrid} />
        {/* 1st house highlight */}
        <polygon
          points={F_HOUSE_POLYGONS[1].map(p => p.join(',')).join(' ')}
          fill="url(#fAscGlow)"
          stroke="none"
        />
        {/* House sections */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          return (
            <HouseSection
              key={houseNum}
              houseNum={houseNum}
              polygon={F_HOUSE_POLYGONS[houseNum]}
              sign={signByHouse[houseNum] || ''}
              planets={planetsByHouse[houseNum] || []}
              isFull={true}
            />
          );
        })}
        {/* Ascendant label */}
        <text
          x={F_TOP[0]}
          y={F_TOP[1] - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontWeight="700"
          fill="#D4AF37"
          letterSpacing="1.5"
          className="chart-asc-label"
        >
          ASCENDANT
        </text>
        {/* Corner & center dots */}
        {[F_TOP, F_RIGHT, F_BOTTOM, F_LEFT].map((pt, i) => (
          <circle key={i} cx={pt[0]} cy={pt[1]} r="3.5" fill="#5D4037" className="chart-dot" opacity={0.4} />
        ))}
        <circle cx={F_CENTER[0]} cy={F_CENTER[1]} r="2" fill="#D4AF37" opacity={0.35} />
        {/* ── LEGEND ───────────────────────────────────────────────────────── */}
        <rect
          x="10" y="600" width="440" height="100" rx="12"
          fill="url(#fLegendBg)" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2"
        />
        <text
          x="30" y="618"
          textAnchor="start" dominantBaseline="middle"
          fontSize="9" fontWeight="700" fill="#8D6E63" letterSpacing="1"
          style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}
        >
          LEGEND
        </text>
        {/* Row 1: House number, zodiac, retrograde, ascendant */}
        <g style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
          <circle cx="40" cy="638" r="5" fill="rgba(93,64,55,0.08)" />
          <text x="40" y="638" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="700" fill="#A1887F">1</text>
          <text x="52" y="638" textAnchor="start" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63">House number</text>
          <text x="148" y="638" textAnchor="start" dominantBaseline="middle" fontSize="11" fill="#8D6E63">♈</text>
          <text x="162" y="638" textAnchor="start" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63">Zodiac sign</text>
          <text x="252" y="638" textAnchor="start" dominantBaseline="middle" fontSize="9.5" fontWeight="700" fill="#DC2626">℞</text>
          <text x="264" y="638" textAnchor="start" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63">Retrograde</text>
          <rect x="350" y="631" width="12" height="12" rx="2" fill="rgba(212,175,55,0.18)" stroke="#D4AF37" strokeWidth="0.5" />
          <text x="368" y="638" textAnchor="start" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63">1st house (Asc)</text>
        </g>
        {/* Row 2: Planet color dots */}
        <g style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
          {[
            { name: 'Sun', color: '#EAB308', x: 30 },
            { name: 'Moon', color: '#94A3B8', x: 82 },
            { name: 'Mars', color: '#DC2626', x: 138 },
            { name: 'Mercury', color: '#22C55E', x: 186 },
            { name: 'Jupiter', color: '#F59E0B', x: 252 },
            { name: 'Venus', color: '#EC4899', x: 314 },
            { name: 'Saturn', color: '#1E3A5F', x: 370 },
          ].map((p) => (
            <g key={p.name}>
              <circle cx={p.x} cy="660" r="4" fill={p.color} />
              <text x={p.x + 8} y="660" textAnchor="start" dominantBaseline="middle" fontSize="8" fill="#8D6E63">{p.name}</text>
            </g>
          ))}
        </g>
        {/* Row 3: Shadow planets + degree format */}
        <g style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
          {[
            { name: 'Rahu', color: '#7C3AED', x: 30 },
            { name: 'Ketu', color: '#6B7280', x: 90 },
          ].map((p) => (
            <g key={p.name}>
              <circle cx={p.x} cy="680" r="4" fill={p.color} />
              <text x={p.x + 8} y="680" textAnchor="start" dominantBaseline="middle" fontSize="8" fill="#8D6E63">{p.name}</text>
            </g>
          ))}
          <text x="160" y="680" textAnchor="start" dominantBaseline="middle" fontSize="8.5" fill="#8D6E63">
            Degree format: <tspan fontWeight="600">15°23'</tspan> = 15° 23 min
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
