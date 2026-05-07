import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * PDF Report Generation API
 *
 * NOTE: In a production environment, this would use a proper PDF generation library
 * like Puppeteer, jsPDF, or a server-side PDF service. Since we're in a restricted
 * environment without those heavy dependencies, we generate a beautifully styled HTML
 * document that serves as the report — browsers can print/save it as PDF natively.
 *
 * The HTML includes print-friendly @media print styles for clean PDF output.
 */

interface ReportRequestBody {
  userId: string;
  includePremium?: boolean;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateTraitBar(score: number, label: string): string {
  const color = score > 70 ? '#4a7c59' : score >= 40 ? '#6b4c3b' : '#c4973b';
  return `
    <div class="trait-row">
      <div class="trait-label">${escapeHtml(label)}</div>
      <div class="trait-bar-bg">
        <div class="trait-bar-fill" style="width: ${score}%; background-color: ${color};"></div>
      </div>
      <div class="trait-score">${score}%</div>
    </div>`;
}

function generateHTMLReport(data: {
  name: string;
  birthDetails: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  };
  astrology: {
    sunSign: string;
    moonSign: string;
    ascendant: string;
    nakshatra: string;
    currentDasha: string;
    yogas: string[];
    doshas: string[];
  } | null;
  numerology: {
    lifePathNumber: number;
    destinyNumber: number;
    soulUrgeNumber: number;
    personalityNumber: number;
    lifePathDesc: string;
    destinyDesc: string;
    soulUrgeDesc: string;
  } | null;
  traits: { name: string; label: string; score: number; description: string }[];
  reportSections: {
    id: string;
    title: string;
    icon: string;
    content: string;
    traits: string[];
    insightLevel: string;
  }[];
  includePremium: boolean;
}): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sunSign = data.astrology?.sunSign || 'Unknown';
  const moonSign = data.astrology?.moonSign || 'Unknown';
  const ascendant = data.astrology?.ascendant || 'Unknown';

  const freeSections = data.reportSections.filter((s) => s.insightLevel === 'free');
  const premiumSections = data.includePremium
    ? data.reportSections.filter((s) => s.insightLevel === 'premium')
    : [];

  const traitBars = data.traits
    .map((t) => generateTraitBar(t.score, t.label || t.name))
    .join('\n');

  const freeSectionHTML = freeSections
    .map(
      (s, i) => `
    <div class="section">
      <h2 class="section-title">${i + 1}. ${escapeHtml(s.title)}</h2>
      <p class="section-content">${escapeHtml(s.content)}</p>
      <div class="trait-tags">
        ${s.traits.map((t) => `<span class="trait-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>`
    )
    .join('\n');

  const premiumSectionHTML = premiumSections.length > 0
    ? premiumSections
        .map(
          (s, i) => `
    <div class="section">
      <h2 class="section-title">${freeSections.length + i + 1}. ${escapeHtml(s.title)} <span class="premium-badge">PREMIUM</span></h2>
      <p class="section-content">${escapeHtml(s.content)}</p>
      <div class="trait-tags">
        ${s.traits.map((t) => `<span class="trait-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>`
        )
        .join('\n')
    : '';

  const numerologyGrid = data.numerology
    ? `
    <div class="num-grid">
      <div class="num-card">
        <div class="num-label">Life Path</div>
        <div class="num-value">${data.numerology.lifePathNumber}</div>
        <div class="num-desc">${escapeHtml(data.numerology.lifePathDesc?.split('.')[0] || '')}</div>
      </div>
      <div class="num-card">
        <div class="num-label">Destiny</div>
        <div class="num-value">${data.numerology.destinyNumber}</div>
        <div class="num-desc">${escapeHtml(data.numerology.destinyDesc?.split('.')[0] || '')}</div>
      </div>
      <div class="num-card">
        <div class="num-label">Soul Urge</div>
        <div class="num-value">${data.numerology.soulUrgeNumber}</div>
        <div class="num-desc">${escapeHtml(data.numerology.soulUrgeDesc?.split('.')[0] || '')}</div>
      </div>
      <div class="num-card">
        <div class="num-label">Personality</div>
        <div class="num-value">${data.numerology.personalityNumber}</div>
        <div class="num-desc">Your outer persona</div>
      </div>
    </div>`
    : '<p class="section-content">Numerology data not available.</p>';

  const yogasHTML = data.astrology?.yogas?.length
    ? data.astrology.yogas.map((y) => `<span class="yoga-tag">${escapeHtml(y)}</span>`).join(' ')
    : '<span class="muted">None detected</span>';

  const doshasHTML = data.astrology?.doshas?.length
    ? data.astrology.doshas.map((d) => `<span class="dosha-tag">${escapeHtml(d)}</span>`).join(' ')
    : '<span class="muted">None detected</span>';

  const tableOfContents = [
    { num: 1, title: 'Your Cosmic Identity' },
    { num: 2, title: 'Emotional Trait Map' },
    { num: 3, title: 'Numerology Blueprint' },
    { num: 4, title: 'Vedic Astrology Summary' },
    ...freeSections.map((s, i) => ({ num: 5 + i, title: s.title })),
    ...premiumSections.map((s, i) => ({ num: 5 + freeSections.length + i, title: `${s.title} ★` })),
  ];

  const tocHTML = tableOfContents
    .map((item) => `<div class="toc-item"><span class="toc-num">${item.num}.</span> <span class="toc-title">${escapeHtml(item.title)}</span></div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AyuAstro Deep Intelligence Report — ${escapeHtml(data.name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

    :root {
      --cream: #FDF6EC;
      --brown-900: #3E2723;
      --brown-700: #5D4037;
      --brown-500: #8D6E63;
      --brown-400: #A1887F;
      --brown-100: #EFEBE9;
      --gold: #C4973B;
      --gold-dark: #8B6914;
      --sage: #4A7C59;
      --sage-light: #E8F0E9;
      --purple: #6B4C8A;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--cream);
      color: var(--brown-900);
      line-height: 1.7;
      font-size: 14px;
    }

    /* Title Page */
    .title-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, var(--cream) 0%, #F5E6D0 50%, var(--cream) 100%);
      padding: 4rem 2rem;
      page-break-after: always;
    }

    .title-page .logo-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--brown-900);
      margin-bottom: 0.5rem;
    }

    .title-page .subtitle {
      font-size: 1.2rem;
      color: var(--brown-500);
      margin-bottom: 3rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .title-page .report-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      color: var(--brown-900);
      margin-bottom: 2rem;
    }

    .title-page .zodiac-symbols {
      font-size: 2.5rem;
      color: var(--gold);
      letter-spacing: 0.5rem;
      margin-bottom: 2rem;
    }

    .title-page .user-info {
      font-size: 1.1rem;
      color: var(--brown-700);
      line-height: 2;
    }

    .title-page .user-info strong {
      color: var(--brown-900);
    }

    .title-page .date {
      margin-top: 3rem;
      font-size: 0.9rem;
      color: var(--brown-400);
    }

    /* Content Area */
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Table of Contents */
    .toc {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      page-break-after: always;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .toc h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem;
      color: var(--brown-900);
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--gold);
    }

    .toc-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px dotted var(--brown-100);
    }

    .toc-num {
      color: var(--gold-dark);
      font-weight: 600;
      min-width: 2rem;
    }

    .toc-title {
      color: var(--brown-700);
    }

    /* Sections */
    .section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      page-break-inside: avoid;
    }

    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.3rem;
      color: var(--brown-900);
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--sage-light);
    }

    .section-content {
      color: var(--brown-700);
      line-height: 1.8;
    }

    /* Cosmic Identity Grid */
    .identity-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }

    .identity-card {
      text-align: center;
      background: var(--cream);
      border-radius: 10px;
      padding: 1.25rem 0.75rem;
    }

    .identity-card .zodiac-symbol {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    .identity-card .label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--brown-400);
    }

    .identity-card .value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--brown-900);
    }

    /* Trait Bars */
    .trait-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }

    .trait-label {
      min-width: 140px;
      font-size: 0.85rem;
      color: var(--brown-700);
      font-weight: 500;
    }

    .trait-bar-bg {
      flex: 1;
      height: 8px;
      background: var(--brown-100);
      border-radius: 4px;
      overflow: hidden;
    }

    .trait-bar-fill {
      height: 100%;
      border-radius: 4px;
    }

    .trait-score {
      min-width: 40px;
      text-align: right;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--brown-500);
    }

    /* Numerology Grid */
    .num-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }

    .num-card {
      text-align: center;
      background: var(--cream);
      border-radius: 10px;
      padding: 1.25rem;
    }

    .num-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--brown-400);
      margin-bottom: 0.25rem;
    }

    .num-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--brown-900);
    }

    .num-desc {
      font-size: 0.75rem;
      color: var(--brown-400);
      margin-top: 0.25rem;
    }

    /* Tags */
    .trait-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 1rem;
    }

    .trait-tag {
      display: inline-block;
      background: var(--brown-100);
      color: var(--brown-700);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
    }

    .yoga-tag {
      display: inline-block;
      background: var(--sage-light);
      color: var(--sage);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      margin: 0.2rem;
    }

    .dosha-tag {
      display: inline-block;
      background: #FFF3E0;
      color: var(--gold-dark);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      margin: 0.2rem;
    }

    .premium-badge {
      display: inline-block;
      background: linear-gradient(135deg, var(--gold), #D4A84B);
      color: white;
      font-size: 0.6rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.1em;
      vertical-align: middle;
      margin-left: 0.5rem;
    }

    .muted { color: var(--brown-400); font-style: italic; }

    /* Vedic Info */
    .vedic-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin: 1rem 0;
    }

    .vedic-item {
      background: var(--cream);
      border-radius: 10px;
      padding: 1rem;
    }

    .vedic-item .label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--brown-400);
    }

    .vedic-item .value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--brown-900);
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--brown-400);
      font-size: 0.8rem;
      border-top: 2px solid var(--brown-100);
      margin-top: 2rem;
    }

    .footer .brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1rem;
      color: var(--brown-700);
      margin-bottom: 0.5rem;
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
        font-size: 11pt;
      }

      .title-page {
        min-height: auto;
        padding: 2in 1in;
      }

      .section {
        box-shadow: none;
        border: 1px solid #eee;
        page-break-inside: avoid;
      }

      .toc {
        box-shadow: none;
        border: 1px solid #eee;
        page-break-after: always;
      }

      .trait-bar-fill {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .identity-card, .num-card, .vedic-item {
        background: #f8f8f8;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Title Page -->
  <div class="title-page">
    <div class="logo-text">AyuAstro</div>
    <div class="subtitle">AI-Powered Emotional Intelligence</div>
    <div class="zodiac-symbols">♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓</div>
    <div class="report-title">Deep Intelligence Report</div>
    <div class="user-info">
      Prepared for <strong>${escapeHtml(data.name)}</strong><br>
      Born ${escapeHtml(data.birthDetails.dateOfBirth)} at ${escapeHtml(data.birthDetails.timeOfBirth)}<br>
      ${escapeHtml(data.birthDetails.placeOfBirth)}<br><br>
      ☉ ${ZODIAC_SYMBOLS[sunSign] || '✦'} ${escapeHtml(sunSign)} &nbsp; ☽ ${ZODIAC_SYMBOLS[moonSign] || '✦'} ${escapeHtml(moonSign)} &nbsp; ↑ ${ZODIAC_SYMBOLS[ascendant] || '✦'} ${escapeHtml(ascendant)}
    </div>
    <div class="date">Generated on ${dateStr}</div>
  </div>

  <!-- Table of Contents -->
  <div class="toc">
    <h2>Table of Contents</h2>
    ${tocHTML}
  </div>

  <!-- Section 1: Cosmic Identity -->
  <div class="content">
    <div class="section">
      <h2 class="section-title">1. Your Cosmic Identity</h2>
      <div class="identity-grid">
        <div class="identity-card">
          <div class="zodiac-symbol">${ZODIAC_SYMBOLS[sunSign] || '✦'}</div>
          <div class="label">Sun Sign</div>
          <div class="value">${escapeHtml(sunSign)}</div>
        </div>
        <div class="identity-card">
          <div class="zodiac-symbol">${ZODIAC_SYMBOLS[moonSign] || '✦'}</div>
          <div class="label">Moon Sign</div>
          <div class="value">${escapeHtml(moonSign)}</div>
        </div>
        <div class="identity-card">
          <div class="zodiac-symbol">${ZODIAC_SYMBOLS[ascendant] || '✦'}</div>
          <div class="label">Ascendant</div>
          <div class="value">${escapeHtml(ascendant)}</div>
        </div>
      </div>
      <p class="section-content">
        Your Sun in ${escapeHtml(sunSign)} represents your core identity and conscious purpose — the light you radiate into the world.
        Your Moon in ${escapeHtml(moonSign)} reveals your emotional nature — how you process feelings and what you need to feel secure.
        Your Ascendant in ${escapeHtml(ascendant)} is the mask you wear and the first impression you give — your social personality and approach to life.
        Together, these three placements form the foundation of your unique cosmic signature.
      </p>
    </div>

    <!-- Section 2: Emotional Trait Map -->
    <div class="section">
      <h2 class="section-title">2. Emotional Trait Map</h2>
      <p class="section-content" style="margin-bottom: 1rem;">
        Your emotional traits are scored on a 0-100 scale, derived from the synthesis of astrological patterns, numerological influences, and behavioral indicators. Scores above 70 are innate strengths; 40-70 are developing areas; below 40 represent growth opportunities.
      </p>
      ${traitBars}
      <div style="margin-top: 1rem; display: flex; gap: 1.5rem; font-size: 0.75rem; color: var(--brown-400);">
        <span>■ High (70+)</span>
        <span>■ Moderate (40-70)</span>
        <span>■ Growth Area (&lt;40)</span>
      </div>
    </div>

    <!-- Section 3: Numerology Blueprint -->
    <div class="section">
      <h2 class="section-title">3. Numerology Blueprint</h2>
      <p class="section-content" style="margin-bottom: 1rem;">
        Your numerology reveals the mathematical blueprint underlying your personality. Each number carries specific energetic patterns that influence your life path, destiny, and inner motivations.
      </p>
      ${numerologyGrid}
    </div>

    <!-- Section 4: Vedic Astrology Summary -->
    <div class="section">
      <h2 class="section-title">4. Vedic Astrology Summary</h2>
      <div class="vedic-info">
        <div class="vedic-item">
          <div class="label">Nakshatra</div>
          <div class="value">${escapeHtml(data.astrology?.nakshatra || 'Not available')}</div>
        </div>
        <div class="vedic-item">
          <div class="label">Current Dasha</div>
          <div class="value">${escapeHtml(data.astrology?.currentDasha || 'Not available')}</div>
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <p style="font-size: 0.85rem; color: var(--brown-400); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em;">Key Yogas</p>
        ${yogasHTML}
      </div>
      <div style="margin-top: 1rem;">
        <p style="font-size: 0.85rem; color: var(--brown-400); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em;">Doshas</p>
        ${doshasHTML}
      </div>
    </div>

    <!-- Section 5+: Free Report Sections -->
    ${freeSectionHTML}

    <!-- Premium Sections (if included) -->
    ${premiumSectionHTML}

    <!-- Footer -->
    <div class="footer">
      <div class="brand">AyuAstro — AI-Powered Emotional Intelligence</div>
      <div>This report was generated on ${dateStr} and is intended for personal reflection only.</div>
      <div style="margin-top: 0.5rem;">AyuAstro combines Vedic astrology, numerology, and behavioral science to map your emotional architecture.</div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequestBody = await request.json();
    const { userId, includePremium = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch user data from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        astrology: true,
        numerology: true,
        traits: true,
        reports: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse astrology data
    let astrology = null;
    if (user.astrology) {
      let yogas: string[] = [];
      let doshas: string[] = [];
      try {
        yogas = JSON.parse(user.astrology.yogas);
      } catch { /* use default */ }
      try {
        doshas = JSON.parse(user.astrology.doshas);
      } catch { /* use default */ }

      let nakshatra = '';
      try {
        const parsed = JSON.parse(user.astrology.nakshatra);
        nakshatra = parsed.name || parsed || user.astrology.nakshatra;
      } catch {
        nakshatra = user.astrology.nakshatra;
      }

      let currentDasha = '';
      try {
        const parsed = JSON.parse(user.astrology.dashaPeriods);
        currentDasha = parsed.currentDasha?.planet || parsed.current || user.astrology.dashaPeriods;
      } catch {
        currentDasha = user.astrology.dashaPeriods;
      }

      astrology = {
        sunSign: user.astrology.sunSign,
        moonSign: user.astrology.moonSign,
        ascendant: user.astrology.ascendant,
        nakshatra,
        currentDasha,
        yogas,
        doshas,
      };
    }

    // Parse numerology data
    let numerology = null;
    if (user.numerology) {
      numerology = {
        lifePathNumber: user.numerology.lifePathNumber,
        destinyNumber: user.numerology.destinyNumber,
        soulUrgeNumber: user.numerology.soulUrgeNumber,
        personalityNumber: user.numerology.personalityNumber,
        lifePathDesc: user.numerology.lifePathDesc || '',
        destinyDesc: user.numerology.destinyDesc || '',
        soulUrgeDesc: user.numerology.soulUrgeDesc || '',
      };
    }

    // Parse trait scores
    const traits = user.traits
      ? [
          { name: 'emotionalIntensity', label: 'Emotional Intensity', score: user.traits.emotionalIntensity, description: '' },
          { name: 'attachmentStyle', label: 'Attachment Style', score: user.traits.attachmentStyle, description: '' },
          { name: 'ambition', label: 'Ambition', score: user.traits.ambition, description: '' },
          { name: 'trust', label: 'Trust Capacity', score: user.traits.trust, description: '' },
          { name: 'communicationOpenness', label: 'Communication Openness', score: user.traits.communicationOpenness, description: '' },
          { name: 'impulsiveness', label: 'Impulsiveness', score: user.traits.impulsiveness, description: '' },
          { name: 'empathy', label: 'Empathy', score: user.traits.empathy, description: '' },
          { name: 'resilience', label: 'Resilience', score: user.traits.resilience, description: '' },
          { name: 'creativity', label: 'Creativity', score: user.traits.creativity, description: '' },
          { name: 'intuition', label: 'Intuition', score: user.traits.intuition, description: '' },
          { name: 'discipline', label: 'Discipline', score: user.traits.discipline, description: '' },
          { name: 'socialEnergy', label: 'Social Energy', score: user.traits.socialEnergy, description: '' },
          { name: 'patience', label: 'Patience', score: user.traits.patience, description: '' },
          { name: 'adaptability', label: 'Adaptability', score: user.traits.adaptability, description: '' },
        ]
      : [];

    // Parse report sections from the most recent report
    let reportSections: { id: string; title: string; icon: string; content: string; traits: string[]; insightLevel: string }[] = [];
    if (user.reports.length > 0) {
      const latestReport = user.reports[user.reports.length - 1];
      try {
        reportSections = JSON.parse(latestReport.sections);
      } catch { /* use empty */ }
    }

    // If no report sections from DB, use fallback defaults
    if (reportSections.length === 0) {
      reportSections = [
        {
          id: 'emotional-personality',
          title: 'Emotional Personality',
          icon: 'heart',
          content: 'Your emotional world is rich and layered. You process feelings with extraordinary depth, often absorbing the emotional climate of any room you enter. This sensitivity is your superpower when channeled through creative or healing work, but requires conscious boundaries to prevent overwhelm.',
          traits: ['Empathy', 'Emotional Awareness', 'Intuition'],
          insightLevel: 'free',
        },
        {
          id: 'relationship-style',
          title: 'Relationship Style',
          icon: 'user',
          content: 'You approach relationships as sacred contracts — seeking depth over breadth. Your attachment pattern leans toward secure-anxious, meaning you crave closeness but may intermittently need space to process.',
          traits: ['Trust Capacity', 'Loyalty', 'Harmony Seeking'],
          insightLevel: 'free',
        },
        {
          id: 'communication-patterns',
          title: 'Communication Patterns',
          icon: 'message',
          content: 'Your communication style is nuanced — you often say less than you feel. You listen more than you speak, but when you do articulate, your words carry unusual weight.',
          traits: ['Communication', 'Patience', 'Intuition'],
          insightLevel: 'free',
        },
        {
          id: 'hidden-strengths',
          title: 'Hidden Strengths',
          icon: 'sparkles',
          content: 'Beneath your conscious awareness lies a reservoir of untapped power. Your hidden strengths often surface during life transitions.',
          traits: ['Creativity', 'Resilience', 'Intuition'],
          insightLevel: 'premium',
        },
        {
          id: 'emotional-blind-spots',
          title: 'Emotional Blind Spots',
          icon: 'eye',
          content: 'Your blind spots center around self-worth and boundary enforcement. While you can see others clearly, you may minimize your own needs.',
          traits: ['Independence', 'Discipline', 'Trust Capacity'],
          insightLevel: 'premium',
        },
        {
          id: 'money-psychology',
          title: 'Money Psychology',
          icon: 'dollar',
          content: 'Your relationship with money is emotionally charged. You tend to view financial security as emotional security.',
          traits: ['Discipline', 'Resilience', 'Leadership'],
          insightLevel: 'premium',
        },
        {
          id: 'recurring-patterns',
          title: 'Recurring Life Patterns',
          icon: 'repeat',
          content: 'Your karmic patterns reveal a recurring theme of entering situations where you are undervalued, only to eventually claim your worth.',
          traits: ['Adaptability', 'Patience', 'Loyalty'],
          insightLevel: 'premium',
        },
      ];
    }

    // Generate the HTML report
    const html = generateHTMLReport({
      name: user.name || 'Seeker',
      birthDetails: {
        dateOfBirth: user.profile?.dateOfBirth || 'Unknown',
        timeOfBirth: user.profile?.timeOfBirth || 'Unknown',
        placeOfBirth: user.profile?.placeOfBirth || 'Unknown',
      },
      astrology,
      numerology,
      traits,
      reportSections,
      includePremium,
    });

    // Return HTML with download headers
    // In production, this would use Puppeteer/jsPDF to generate actual PDF
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="ayuastro-report-${user.name || 'seeker'}.html"`,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
