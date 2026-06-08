import { db } from '@/lib/db';

export async function hasPremiumEntitlement(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { hasPaid: true },
  });

  if (user?.hasPaid) return true;

  const completedTransaction = await db.transaction.findFirst({
    where: {
      userId,
      status: 'completed',
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  return Boolean(completedTransaction);
}
