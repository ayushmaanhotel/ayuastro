import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.OWNER_DASHBOARD_TOKEN;
  if (!expected) return false;

  const header = request.headers.get('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim() === expected;
  }

  const token = request.nextUrl.searchParams.get('token');
  return token === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const [
    totalUsers,
    activeUsers,
    messagesSent,
    messagesReceived,
    pdfDownloads,
    generatedKundalis,
    answers,
  ] = await Promise.all([
    db.whatsappUser.count(),
    db.whatsappUser.count({
      where: {
        OR: [
          { lastInboundAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { lastOutboundAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    }),
    db.whatsappMessage.count({ where: { direction: 'outgoing' } }),
    db.whatsappMessage.count({ where: { direction: 'incoming' } }),
    db.whatsappMessage.count({ where: { mediaUrl: { not: null } } }),
    db.whatsappMessage.count({
      where: {
        direction: 'outgoing',
        body: { contains: 'Kundali PDF', mode: 'insensitive' },
      },
    }),
    db.questionnaireAnswer.findMany({
      select: { questionId: true },
    }),
  ]);

  const questionFrequency = answers.reduce<Record<string, number>>((acc, answer) => {
    acc[answer.questionId] = (acc[answer.questionId] || 0) + 1;
    return acc;
  }, {});

  const mostCommonQuestions = Object.entries(questionFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([questionId, count]) => ({ questionId, count }));

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      messagesSent,
      messagesReceived,
      pdfDownloads,
      generatedKundalis,
      mostCommonQuestions,
    },
  });
}

