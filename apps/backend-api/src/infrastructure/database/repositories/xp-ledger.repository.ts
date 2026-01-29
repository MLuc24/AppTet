import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type XpLedgerRecord = {
  xpLedgerId: string;
  xpAmount: number;
  createdAt: Date;
};

@Injectable()
export class XpLedgerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<XpLedgerRecord[]> {
    const rows = await this.prisma.xp_ledger.findMany({
      where: {
        user_id: userId,
        created_at: { gte: start, lt: end },
      },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((row) => ({
      xpLedgerId: row.xp_ledger_id,
      xpAmount: row.xp_amount,
      createdAt: row.created_at ?? new Date(),
    }));
  }

  async sumByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.prisma.xp_ledger.aggregate({
      where: {
        user_id: userId,
        created_at: { gte: start, lt: end },
      },
      _sum: { xp_amount: true },
    });
    return result._sum.xp_amount ?? 0;
  }
}
