import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import type { IDrizzleDb } from '../../database/interfaces/i-drizzle-db.js';
import { companies } from '../../database/schema/index.js';
import type { ICompanyMailCredentials } from './interfaces/i-company-mail-credentials.js';

@Injectable()
export class MailRepository {
  constructor(@Inject(DRIZZLE) private readonly db: IDrizzleDb) {}

  async findCompanyCredentials(companyId: string): Promise<ICompanyMailCredentials | undefined> {
    const [row] = await this.db
      .select({
        name: companies.name,
        email: companies.email,
        mailPassword: companies.mailPassword,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    return row;
  }
}
