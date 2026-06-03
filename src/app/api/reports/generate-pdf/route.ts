export const maxDuration = 300;
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { db } from '@/lib/db';
import { generateDeepIntelligenceReport, generateReport } from '@/lib/ai';

interface ReportRequestBody {
  userId: string;
  includePremium?: boolean;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function drawPDFReport(data: {
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
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const sunSign = data.astrology?.sunSign || 'Unknown';
      const moonSign = data.astrology?.moonSign || 'Unknown';
      const ascendant = data.astrology?.ascendant || 'Unknown';

      const freeSections = data.reportSections.filter((s) => s.insightLevel === 'free');
      const premiumSections = data.includePremium
        ? data.reportSections.filter((s) => s.insightLevel === 'premium')
        : [];
      
      const activeSections = [...freeSections, ...premiumSections];

      // Page background colors
      const drawBackground = () => {
        doc.save();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F4EFE6'); // Warm beige
        doc.restore();
      };

      const drawHeaderLine = () => {
        doc.save();
        doc.strokeColor('#EFEBE9').lineWidth(0.5).moveTo(50, 32).lineTo(doc.page.width - 50, 32).stroke();
        doc.restore();
      };

      const drawFooter = (pageNum: number) => {
        doc.save();
        doc.strokeColor('#EFEBE9').lineWidth(0.5).moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).stroke();
        doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text(`Page ${pageNum}`, 50, doc.page.height - 35, { align: 'right' });
        doc.restore();
      };

      const checkPageOverflow = (neededSpace: number) => {
        if (doc.y + neededSpace > doc.page.height - 70) {
          doc.addPage();
          drawBackground();
          drawHeaderLine();
          return true;
        }
        return false;
      };

      // ─── 1. COVER PAGE ───
      drawBackground();
      
      // Gold decorative borders
      doc.lineWidth(2).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#C4973B');
      doc.lineWidth(0.5).rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke('#C4973B');

      doc.y = 120;
      doc.fillColor('#3E2723').fontSize(42).font('Times-Bold').text('AyuAstro', { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#8D6E63').text('AI-POWERED EMOTIONAL INTELLIGENCE', { align: 'center', characterSpacing: 1.5 });
      
      doc.moveDown(2.5);
      // Gold line separator
      doc.strokeColor('#C4973B').lineWidth(1.2).moveTo(160, doc.y).lineTo(doc.page.width - 160, doc.y).stroke();
      
      doc.moveDown(3);
      doc.fontSize(20).font('Times-Bold').fillColor('#3E2723').text('Premium Deep Intelligence Report', { align: 'center' });
      doc.moveDown(2);

      // User details container
      const userBoxY = doc.y;
      doc.rect(100, userBoxY, doc.page.width - 200, 155).fillAndStroke('#FFFFFF', '#EFEBE9');
      
      doc.fillColor('#A1887F').fontSize(9).font('Helvetica-Bold').text('PREPARED FOR', 120, userBoxY + 18);
      doc.fillColor('#3E2723').fontSize(18).font('Times-Bold').text(data.name, 120, userBoxY + 32);
      
      doc.fillColor('#5D4037').fontSize(10).font('Helvetica').text(`Born: ${data.birthDetails.dateOfBirth} at ${data.birthDetails.timeOfBirth}`, 120, userBoxY + 68);
      doc.text(`Place: ${data.birthDetails.placeOfBirth}`, 120, userBoxY + 83);
      
      const sunSymbol = ZODIAC_SYMBOLS[sunSign] || '✦';
      const moonSymbol = ZODIAC_SYMBOLS[moonSign] || '✦';
      const ascSymbol = ZODIAC_SYMBOLS[ascendant] || '✦';
      
      doc.fillColor('#C4973B').fontSize(11).font('Helvetica-Bold').text(
        `☉ ${sunSymbol} ${sunSign}    ☽ ${moonSymbol} ${moonSign}    ↑ ${ascSymbol} ${ascendant}`,
        120, userBoxY + 115
      );

      // Date at the bottom
      const todayStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.fillColor('#A1887F').fontSize(9).font('Helvetica').text(`Generated on ${todayStr}`, 50, doc.page.height - 80, { align: 'center' });

      // ─── 2. TRUTH DISCLOSURE (NOTHING TO HIDE) ───
      doc.addPage();
      drawBackground();
      drawHeaderLine();
      doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);

      doc.y = 70;
      doc.fillColor('#3E2723').fontSize(22).font('Times-Bold').text('Truth Disclosure (Nothing To Hide)', 50, doc.y);
      doc.moveDown(1.5);
      
      doc.fillColor('#5D4037').fontSize(11).font('Helvetica').text(
        'At AyuAstro, we believe in radical transparency. Other platforms often hide calculations, exaggerate negative transits to sell expensive remedies, and use outdated systems. Here is the unvarnished truth about your chart:',
        { lineGap: 5 }
      );
      doc.moveDown(1.5);
      
      doc.fillColor('#3E2723').fontSize(14).font('Times-Bold').text('Your Signs Have Shifted by 24°');
      doc.moveDown(0.5);
      doc.fillColor('#5D4037').fontSize(11).font('Helvetica').text(
        'Western astrology uses an outdated seasonal grid (Tropical). Vedic uses the actual physical sky (Sidereal). This precession shift (Lahiri Ayanamsa) means your Sun/Moon signs are roughly 24 degrees back from what you read online. If you think you are a Leo, you are physically a Cancer.',
        { lineGap: 4 }
      );
      doc.moveDown(1.5);

      doc.fillColor('#3E2723').fontSize(14).font('Times-Bold').text('Astrology is a Map, Not a Sentence');
      doc.moveDown(0.5);
      doc.fillColor('#5D4037').fontSize(11).font('Helvetica').text(
        'No placement is "cursed." No dasha period guarantees ruin. Your chart shows probabilities and psychological tendencies, not fixed outcomes. Your free will always overrides planetary influence.',
        { lineGap: 4 }
      );
      doc.moveDown(1.5);

      doc.fillColor('#3E2723').fontSize(14).font('Times-Bold').text('Beware of Fear-Based Marketing');
      doc.moveDown(0.5);
      doc.fillColor('#5D4037').fontSize(11).font('Helvetica').text(
        'Many astrologers use fear to sell expensive gemstones or pujas (rituals). We will never tell you that you must buy a product to fix your life. Real remedies are psychological integration and conscious action.',
        { lineGap: 4 }
      );
      
      drawFooter(2);

      // ─── 3. TABLE OF CONTENTS ───
      doc.addPage();
      drawBackground();
      drawHeaderLine();
      
      doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);
      
      doc.y = 70;
      doc.fillColor('#3E2723').fontSize(22).font('Times-Bold').text('Table of Contents', 50, doc.y);
      doc.moveDown(1.5);

      const tableOfContents = [
        { num: 1, title: 'Your Cosmic Identity' },
        { num: 2, title: 'Emotional Trait Map & Radar' },
        { num: 3, title: 'Numerology Blueprint' },
        { num: 4, title: 'Vedic Astrology Summary' },
        ...activeSections.map((s, idx) => ({ num: 5 + idx, title: s.title + (s.insightLevel === 'premium' ? ' (Premium)' : '') }))
      ];

      tableOfContents.forEach((item, index) => {
        const itemY = doc.y;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#C4973B').text(`${item.num}.`, 50, itemY);
        doc.font('Helvetica').fillColor('#5D4037').text(item.title, 80, itemY);
        
        // Dot leaders
        const endDotX = doc.page.width - 80;
        doc.strokeColor('#A1887F').lineWidth(0.5).dash(2, { space: 2 }).moveTo(350, itemY + 8).lineTo(endDotX, itemY + 8).stroke().undash();
        
        doc.font('Helvetica-Bold').fillColor('#3E2723').text(`${index + 4}`, doc.page.width - 70, itemY, { align: 'right' });
        doc.moveDown(0.9);
      });

      drawFooter(3);

      // ─── 4. COSMIC IDENTITY DETAILS ───
      doc.addPage();
      drawBackground();
      drawHeaderLine();
      doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);

      doc.y = 70;
      doc.fillColor('#3E2723').fontSize(20).font('Times-Bold').text('1. Your Cosmic Identity', 50, doc.y);
      doc.moveDown(1.2);

      // Placements side-by-side cards
      const cardWidth = (doc.page.width - 120) / 3;
      const cardHeight = 90;
      const cardsData = [
        { label: 'SUN SIGN', value: sunSign, symbol: sunSymbol },
        { label: 'MOON SIGN', value: moonSign, symbol: moonSymbol },
        { label: 'ASCENDANT', value: ascendant, symbol: ascSymbol }
      ];

      const placementsY = doc.y;
      cardsData.forEach((c, idx) => {
        const cardX = 50 + idx * (cardWidth + 10);
        doc.rect(cardX, placementsY, cardWidth, cardHeight).fillAndStroke('#FFFFFF', '#EFEBE9');
        
        // Draw symbol
        doc.fillColor('#C4973B').fontSize(26).font('Times-Roman').text(c.symbol, cardX, placementsY + 12, { width: cardWidth, align: 'center' });
        doc.fillColor('#A1887F').fontSize(8).font('Helvetica-Bold').text(c.label, cardX, placementsY + 45, { width: cardWidth, align: 'center' });
        doc.fillColor('#3E2723').fontSize(13).font('Times-Bold').text(c.value, cardX, placementsY + 58, { width: cardWidth, align: 'center' });
      });

      doc.y = placementsY + cardHeight + 25;
      doc.fillColor('#5D4037').fontSize(10.5).font('Helvetica').text(
        `Your Sun in ${sunSign} represents your core identity and conscious purpose — the light you radiate into the world. It governs your willpower, creative essence, and the central ego strength driving your goals.\n\n` +
        `Your Moon in ${moonSign} reveals your emotional nature — how you process feelings, respond to challenges, and what you require to feel emotionally secure and nurtured in relationships.\n\n` +
        `Your Ascendant in ${ascendant} represents the mask you wear, your social personality, and the first impression you give to others. It dictates your outward behavior and approach to physical reality.\n\n` +
        `Together, this "Cosmic Trinity" provides the foundational architecture of your psychological profile, bridging conscious expression, subconscious needs, and external interaction.`,
        { lineGap: 5 }
      );

      drawFooter(4);

      // ─── 5. EMOTIONAL TRAIT MAP & RADAR ───
      doc.addPage();
      drawBackground();
      drawHeaderLine();
      doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);

      doc.y = 70;
      doc.fillColor('#3E2723').fontSize(20).font('Times-Bold').text('2. Emotional Trait Map & Radar', 50, doc.y);
      doc.moveDown(0.6);
      doc.fontSize(10).font('Helvetica').fillColor('#5D4037').text(
        'Your emotional traits are scored on a 0-100 scale. Scores above 70 indicate innate strengths; 40-70 represent moderate capacities; below 40 are growth zones. The radar chart below visualizes your complete psychometric profile.',
        { lineGap: 3.5 }
      );
      
      doc.moveDown(1.5);
      
      // Draw Radar Chart
      const cx = doc.page.width / 2;
      const cy = doc.y + 120;
      const r = 100;
      
      // Draw concentric circles
      [0.2, 0.4, 0.6, 0.8, 1].forEach(scale => {
        doc.circle(cx, cy, r * scale).lineWidth(0.5).stroke('#EFEBE9');
      });
      
      // Draw axes and plot points
      const numTraits = Math.min(data.traits.length, 14); // Avoid overcrowding
      const plotPoints: {x: number, y: number}[] = [];
      
      for(let i=0; i<numTraits; i++) {
        const trait = data.traits[i];
        const angle = (Math.PI * 2 * i) / numTraits - Math.PI / 2;
        
        // Draw axis line
        doc.moveTo(cx, cy).lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle)).lineWidth(0.5).stroke('#EFEBE9');
        
        // Label position
        const labelR = r + 15;
        const labelX = cx + labelR * Math.cos(angle);
        const labelY = cy + labelR * Math.sin(angle);
        
        doc.fillColor('#A1887F').fontSize(6).font('Helvetica-Bold');
        doc.text(trait.label || trait.name, labelX - 30, labelY, { width: 60, align: 'center' });
        
        // Plot point
        const scoreNorm = trait.score / 100;
        plotPoints.push({
          x: cx + r * scoreNorm * Math.cos(angle),
          y: cy + r * scoreNorm * Math.sin(angle)
        });
      }
      
      // Draw polygon
      if (plotPoints.length > 0) {
        doc.moveTo(plotPoints[0].x, plotPoints[0].y);
        for(let i=1; i<plotPoints.length; i++) {
          doc.lineTo(plotPoints[i].x, plotPoints[i].y);
        }
        doc.closePath();
        
        doc.lineWidth(1.5).strokeColor('#C4973B').fillColor('#C4973B');
        doc.fillOpacity(0.2);
        doc.fillAndStroke();
        doc.fillOpacity(1.0); // Reset opacity
      }
      
      doc.y = cy + r + 30;
      
      // Score Summary Table
      doc.moveDown(1);
      doc.fillColor('#3E2723').fontSize(14).font('Times-Bold').text('Score Summary');
      doc.moveDown(1);
      
      const colWidth1 = 200;
      const colWidth2 = 80;
      const colWidth3 = 120;
      let tableY = doc.y;
      
      // Table Header
      doc.fillColor('#A1887F').fontSize(9).font('Helvetica-Bold');
      doc.text('TRAIT', 50, tableY);
      doc.text('SCORE', 50 + colWidth1, tableY);
      doc.text('CATEGORY', 50 + colWidth1 + colWidth2, tableY);
      doc.moveTo(50, tableY + 12).lineTo(doc.page.width - 50, tableY + 12).lineWidth(1).stroke('#EFEBE9');
      
      tableY += 20;
      
      data.traits.forEach((t, i) => {
        checkPageOverflow(25);
        if (doc.y > tableY) tableY = doc.y; // Update tableY if new page

        // Alternating row background
        if (i % 2 === 0) {
          doc.rect(50, tableY - 5, doc.page.width - 100, 20).fill('#FFFFFF');
        }
        
        const category = t.score >= 70 ? 'Strength' : t.score >= 40 ? 'Moderate' : 'Growth Area';
        const color = t.score >= 70 ? '#4A7C59' : t.score >= 40 ? '#6B4C3B' : '#C4973B';
        
        doc.fillColor('#3E2723').fontSize(9).font('Helvetica');
        doc.text(t.label || t.name, 55, tableY);
        doc.fillColor('#5D4037').text(`${t.score}%`, 50 + colWidth1, tableY);
        doc.fillColor(color).font('Helvetica-Bold').text(category, 50 + colWidth1 + colWidth2, tableY);
        
        tableY += 20;
        doc.y = tableY;
      });

      drawFooter(5);

      // ─── 6. NUMEROLOGY BLUEPRINT & VEDIC SUMMARY ───
      doc.addPage();
      drawBackground();
      drawHeaderLine();
      doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);

      doc.y = 70;
      doc.fillColor('#3E2723').fontSize(20).font('Times-Bold').text('3. Numerology Blueprint', 50, doc.y);
      doc.moveDown(0.6);
      doc.fontSize(10).font('Helvetica').fillColor('#5D4037').text(
        'Numerology reveals the mathematical frequencies underlying your personality and destiny. Your core numbers represent coordinates of your life path, outer personality, and inner motivations.',
        { lineGap: 3.5 }
      );
      
      doc.moveDown(1.2);

      if (data.numerology) {
        let nTableY = doc.y;
        
        // Numerology Table
        const nCols = [{w: 120, x: 50}, {w: 60, x: 170}, {w: doc.page.width - 280, x: 230}];
        
        doc.rect(50, nTableY, doc.page.width - 100, 20).fill('#EFEBE9');
        doc.fillColor('#3E2723').fontSize(9).font('Helvetica-Bold');
        doc.text('CORE NUMBER', nCols[0].x + 5, nTableY + 5);
        doc.text('VALUE', nCols[1].x + 5, nTableY + 5);
        doc.text('SIGNIFICANCE', nCols[2].x + 5, nTableY + 5);
        
        nTableY += 20;
        
        const numList = [
          { label: 'Life Path Number', val: data.numerology.lifePathNumber, desc: data.numerology.lifePathDesc || 'Path of evolution' },
          { label: 'Destiny Number', val: data.numerology.destinyNumber, desc: data.numerology.destinyDesc || 'External expression' },
          { label: 'Soul Urge Number', val: data.numerology.soulUrgeNumber, desc: data.numerology.soulUrgeDesc || 'Deepest motivation' },
          { label: 'Personality Number', val: data.numerology.personalityNumber, desc: 'Your outer persona and first impression' }
        ];

        numList.forEach((n, i) => {
          doc.rect(50, nTableY, doc.page.width - 100, 35).fill(i % 2 === 0 ? '#FFFFFF' : 'transparent');
          doc.fillColor('#5D4037').fontSize(9).font('Helvetica-Bold').text(n.label, nCols[0].x + 5, nTableY + 10);
          doc.fillColor('#C4973B').fontSize(14).font('Times-Bold').text(`${n.val}`, nCols[1].x + 5, nTableY + 8);
          doc.fillColor('#5D4037').fontSize(8.5).font('Helvetica').text(n.desc.substring(0, 100) + '...', nCols[2].x + 5, nTableY + 6, { width: nCols[2].w - 10, lineGap: 1.5 });
          
          nTableY += 35;
        });
        
        doc.moveTo(50, nTableY).lineTo(doc.page.width - 50, nTableY).lineWidth(0.5).stroke('#EFEBE9');
        doc.y = nTableY + 30;
      } else {
        doc.fillColor('#A1887F').fontSize(10).text('Numerology profile unavailable.', 50, doc.y);
        doc.moveDown(1.5);
      }

      checkPageOverflow(150);

      // ─── VEDIC ASTROLOGY SUMMARY ───
      doc.fillColor('#3E2723').fontSize(20).font('Times-Bold').text('4. Vedic Astrology Summary', 50, doc.y);
      doc.moveDown(1);

      const infoBoxY = doc.y;
      doc.rect(50, infoBoxY, (doc.page.width - 110) / 2, 50).fillAndStroke('#FFFFFF', '#EFEBE9');
      doc.fillColor('#A1887F').fontSize(7.5).font('Helvetica-Bold').text('NAKSHATRA', 65, infoBoxY + 12);
      doc.fillColor('#3E2723').fontSize(12).font('Times-Bold').text(data.astrology?.nakshatra || 'Unknown', 65, infoBoxY + 24);

      doc.rect(50 + (doc.page.width - 110) / 2 + 10, infoBoxY, (doc.page.width - 110) / 2, 50).fillAndStroke('#FFFFFF', '#EFEBE9');
      doc.fillColor('#A1887F').fontSize(7.5).font('Helvetica-Bold').text('CURRENT DASHA PERIOD', 50 + (doc.page.width - 110) / 2 + 20, infoBoxY + 12);
      doc.fillColor('#3E2723').fontSize(12).font('Times-Bold').text(data.astrology?.currentDasha || 'Unknown', 50 + (doc.page.width - 110) / 2 + 20, infoBoxY + 24);

      doc.y = infoBoxY + 65;
      
      const columnW = (doc.page.width - 110) / 2;
      const textY = doc.y;
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#A1887F').text('Key Astrological Yogas', 50, textY);
      const yogasStr = data.astrology?.yogas?.join(', ') || 'None active in current chart';
      doc.fontSize(9.5).font('Helvetica').fillColor('#5D4037').text(yogasStr, 50, textY + 15, { width: columnW, lineGap: 3 });

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#A1887F').text('Doshas Detected', 50 + columnW + 10, textY);
      const doshasStr = data.astrology?.doshas?.join(', ') || 'None detected in current chart';
      doc.fontSize(9.5).font('Helvetica').fillColor('#5D4037').text(doshasStr, 50 + columnW + 10, textY + 15, { width: columnW, lineGap: 3 });

      drawFooter(6);

      // ─── 7+. DETAILED REPORT SECTIONS ───
      let pageNumber = 7;
      activeSections.forEach((s) => {
        doc.addPage();
        drawBackground();
        drawHeaderLine();
        doc.fillColor('#A1887F').fontSize(8).font('Helvetica').text('AyuAstro Deep Intelligence Report', 50, 20);

        doc.y = 70;
        doc.fillColor('#3E2723').fontSize(20).font('Times-Bold').text(s.title, 50, doc.y);
        
        if (s.insightLevel === 'premium') {
          doc.fillColor('#C4973B').fontSize(7.5).font('Helvetica-Bold').text('👑 PREMIUM INSIGHT SEGMENT', 50, 56, { characterSpacing: 1 });
        } else {
          doc.fillColor('#A1887F').fontSize(7.5).font('Helvetica-Bold').text('🧠 AI INSIGHT SEGMENT', 50, 56, { characterSpacing: 1 });
        }
        
        doc.moveDown(1.5);
        doc.fillColor('#5D4037').fontSize(11).font('Helvetica').text(s.content, 50, doc.y, { lineGap: 5.5 });
        
        doc.moveDown(2);
        checkPageOverflow(100);
        doc.fillColor('#A1887F').fontSize(10).font('Helvetica-Bold').text('Traits Addressed:', 50, doc.y);
        doc.moveDown(0.6);

        s.traits.forEach((t) => {
          doc.fillColor('#4A7C59').fontSize(10).font('Helvetica-Bold').text(`• ${t}`, 65, doc.y);
          doc.moveDown(0.25);
        });

        drawFooter(pageNumber);
        pageNumber++;
      });

      // ─── BACK COVER ───
      doc.addPage();
      drawBackground();
      
      // Decorative border
      doc.lineWidth(1).rect(50, 50, doc.page.width - 100, doc.page.height - 100).stroke('#C4973B');
      
      doc.y = doc.page.height / 2 - 100;
      doc.fillColor('#3E2723').fontSize(32).font('Times-Bold').text('AyuAstro', { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica').fillColor('#8D6E63').text('Vedic Wisdom for Modern Self-Reflection', { align: 'center' });
      
      doc.moveDown(4);
      doc.fontSize(9).font('Helvetica').fillColor('#A1887F').text(
        'This intelligence profile is a synthesis of celestial positions at birth mapped against modern psychometric models. It is designed for personal development, meditation guidance, and self-understanding. It does not constitute medical, psychological, or financial advice.',
        100, doc.y, { width: doc.page.width - 200, align: 'center', lineGap: 4 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
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
    let needGeneration = false;

    if (user.reports.length > 0) {
      const latestReport = user.reports[user.reports.length - 1];
      // If we requested premium but the latest report is not premium or is not deep_intelligence
      if (includePremium && (!latestReport.isPremium || latestReport.type !== 'deep_intelligence')) {
        needGeneration = true;
      } else {
        try {
          reportSections = JSON.parse(latestReport.sections);
          if (reportSections.length === 0) {
            needGeneration = true;
          }
        } catch {
          needGeneration = true;
        }
      }
    } else {
      needGeneration = true;
    }

    if (needGeneration && user.astrology && user.numerology && user.traits) {
      try {
        console.info(`[PDF Route] Dynamic DeepSeek PDF generation triggered for user: ${userId} (premium: ${includePremium})`);
        
        let parsedPlacements = undefined;
        if (user.astrology.planetaryPositions) {
          try {
            parsedPlacements = JSON.parse(user.astrology.planetaryPositions);
          } catch (e) {
            console.error('[PDF Route] Error parsing planetary positions:', e);
          }
        }

        const aiInput = {
          sunSign: user.astrology.sunSign,
          moonSign: user.astrology.moonSign,
          ascendant: user.astrology.ascendant,
          nakshatra: astrology?.nakshatra ?? '',
          currentDasha: astrology?.currentDasha ?? '',
          yogas: astrology?.yogas ?? [],
          doshas: astrology?.doshas ?? [],
          planetaryPositions: parsedPlacements,
          lifePathNumber: user.numerology.lifePathNumber,
          destinyNumber: user.numerology.destinyNumber,
          soulUrgeNumber: user.numerology.soulUrgeNumber,
          traits: {
            emotionalIntensity: user.traits.emotionalIntensity,
            attachmentStyle: user.traits.attachmentStyle,
            ambition: user.traits.ambition,
            trust: user.traits.trust,
            communicationOpenness: user.traits.communicationOpenness,
            impulsiveness: user.traits.impulsiveness,
            empathy: user.traits.empathy,
            resilience: user.traits.resilience,
            creativity: user.traits.creativity,
            intuition: user.traits.intuition,
            discipline: user.traits.discipline,
            socialEnergy: user.traits.socialEnergy,
            patience: user.traits.patience,
            adaptability: user.traits.adaptability,
          }
        };

        const generatedReport = includePremium
          ? await generateDeepIntelligenceReport(aiInput)
          : await generateReport(aiInput, { freeOnly: true });

        // Save generated report to database
        await db.report.create({
          data: {
            userId: user.id,
            type: includePremium ? 'deep_intelligence' : 'personality',
            title: generatedReport.title,
            summary: generatedReport.summary,
            sections: JSON.stringify(generatedReport.sections),
            isPremium: includePremium,
          },
        });

        reportSections = generatedReport.sections;
      } catch (genError) {
        console.error('[PDF Route] Dynamic DeepSeek report generation failed:', genError);
      }
    }

    // If no report sections from DB and generation failed, use fallback defaults
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

    // Generate binary PDF
    const pdfBuffer = await drawPDFReport({
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

    const slug = (user.name || 'seeker').toLowerCase().replace(/[^a-z0-9]/g, '_');
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ayuastro-report-${slug}.pdf"`,
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
