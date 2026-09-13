import { desc } from 'drizzle-orm'
import { reportCache, ReportCache } from '../models/reportModel'
import { DBTransaction } from '../types/transactionType'

export class ReportRepository {
  async create(transaction: DBTransaction, reportJson: unknown): Promise<number> {
    const [inserted] = await transaction.insert(reportCache).values({
      report_json: reportJson as any,
    }).$returningId()

    return inserted.id
  }

  async findLatest(transaction: DBTransaction): Promise<ReportCache | undefined> {
    const [row] = await transaction
      .select()
      .from(reportCache)
      .orderBy(desc(reportCache.created_at))
      .limit(1)

    return row
  }
}
