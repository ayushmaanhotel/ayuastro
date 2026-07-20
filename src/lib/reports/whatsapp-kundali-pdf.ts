import PDFDocument from 'pdfkit';

export interface WhatsappKundaliPdfData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  currentDasha?: string;
  yogas?: string[];
  doshas?: string[];
  summary?: string;
}

function textOrUnknown(value: string | undefined | null): string {
  return value && value.trim() ? value : 'Unknown';
}

function joinList(values: string[] | undefined): string {
  if (!values || values.length === 0) return 'None detected in the basic free scan';
  return values.slice(0, 8).join(', ');
}

export function createWhatsappKundaliPdf(data: WhatsappKundaliPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const brown = '#3E2723';
      const tan = '#8D6E63';
      const gold = '#C4973B';
      const cream = '#F7F0E6';
      const white = '#FFFFFF';

      const drawShell = () => {
        doc.rect(0, 0, pageWidth, pageHeight).fill(cream);
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(1.2).stroke(gold);
        doc.rect(36, 36, pageWidth - 72, pageHeight - 72).lineWidth(0.4).stroke('#E2D5C5');
      };

      const sectionTitle = (title: string) => {
        doc.moveDown(1.1);
        doc.fillColor(brown).font('Times-Bold').fontSize(17).text(title);
        doc.moveDown(0.35);
        doc.strokeColor(gold).lineWidth(0.7).moveTo(48, doc.y).lineTo(pageWidth - 48, doc.y).stroke();
        doc.moveDown(0.7);
      };

      const labelValue = (label: string, value: string, x: number, y: number, width: number) => {
        doc.fillColor(tan).font('Helvetica-Bold').fontSize(8).text(label.toUpperCase(), x, y, { width });
        doc.fillColor(brown).font('Times-Bold').fontSize(13).text(value, x, y + 13, { width });
      };

      drawShell();
      doc.y = 92;
      doc.fillColor(brown).font('Times-Bold').fontSize(38).text('AyuAstro', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor(tan).font('Helvetica-Bold').fontSize(9).text('FREE KUNDALI REPORT', { align: 'center', characterSpacing: 1.5 });
      doc.moveDown(1.4);
      doc.fillColor(tan).font('Helvetica').fontSize(10).text('Vedic chart summary for self-reflection and personal clarity', { align: 'center' });

      doc.moveDown(2.2);
      const boxY = doc.y;
      doc.roundedRect(78, boxY, pageWidth - 156, 142, 6).fillAndStroke(white, '#E8DDD1');
      labelValue('Prepared for', textOrUnknown(data.name), 104, boxY + 22, 220);
      labelValue('Birth date', textOrUnknown(data.dateOfBirth), 104, boxY + 68, 140);
      labelValue('Birth time', textOrUnknown(data.timeOfBirth), 250, boxY + 68, 120);
      labelValue('Birth place', textOrUnknown(data.placeOfBirth), 370, boxY + 68, 150);

      doc.fillColor(tan).font('Helvetica').fontSize(8.5).text(
        'This report shows tendencies and patterns, not fixed fate. Your choices, effort, and environment matter.',
        104,
        boxY + 112,
        { width: pageWidth - 208, align: 'center' }
      );

      doc.addPage();
      drawShell();
      doc.y = 62;
      sectionTitle('Core Chart');

      const cardsY = doc.y;
      const cardWidth = (pageWidth - 116) / 3;
      const cards = [
        ['Sun Sign', textOrUnknown(data.sunSign)],
        ['Moon Sign', textOrUnknown(data.moonSign)],
        ['Ascendant', textOrUnknown(data.ascendant)],
      ];
      cards.forEach(([label, value], index) => {
        const x = 48 + index * (cardWidth + 10);
        doc.roundedRect(x, cardsY, cardWidth, 82, 6).fillAndStroke(white, '#E8DDD1');
        labelValue(label, value, x + 14, cardsY + 21, cardWidth - 28);
      });

      doc.y = cardsY + 105;
      sectionTitle('Birth Star and Timing');
      labelValue('Nakshatra', textOrUnknown(data.nakshatra), 48, doc.y, 230);
      labelValue('Current dasha', textOrUnknown(data.currentDasha), 300, doc.y, 230);

      doc.y += 62;
      sectionTitle('Key Patterns');
      doc.fillColor(brown).font('Helvetica-Bold').fontSize(10).text('Yogas', 48, doc.y);
      doc.fillColor(tan).font('Helvetica').fontSize(10).text(joinList(data.yogas), 48, doc.y + 16, { width: pageWidth - 96, lineGap: 3 });
      doc.y += 58;
      doc.fillColor(brown).font('Helvetica-Bold').fontSize(10).text('Doshas', 48, doc.y);
      doc.fillColor(tan).font('Helvetica').fontSize(10).text(joinList(data.doshas), 48, doc.y + 16, { width: pageWidth - 96, lineGap: 3 });

      sectionTitle('Basic Insight');
      doc.fillColor(tan).font('Helvetica').fontSize(11).text(
        data.summary ||
          `Your chart begins with ${textOrUnknown(data.moonSign)} Moon and ${textOrUnknown(data.ascendant)} Ascendant. Use this as a starting point for honest self-observation, not as a final verdict about your life.`,
        { width: pageWidth - 96, lineGap: 5 }
      );

      doc.moveDown(1.4);
      doc.fillColor(brown).font('Times-Bold').fontSize(13).text('AyuAstro promise');
      doc.moveDown(0.35);
      doc.fillColor(tan).font('Helvetica').fontSize(10).text(
        'We do not use fear to sell remedies. This reading is for clarity, reflection, and better choices. For medical, legal, financial, or mental-health concerns, speak with a qualified professional.',
        { width: pageWidth - 96, lineGap: 4 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

