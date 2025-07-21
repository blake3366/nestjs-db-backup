import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FileStorageService } from '../../service/file-storage/file-storage.service';
import * as path from 'path';
import { logger } from '../../utils/logger'; // 注意相對路徑

const execAsync = promisify(exec);
const pgDumpPath = '/opt/homebrew/opt/postgresql@16/bin/pg_dump'; // PostgreSQL
// const pgDumpPath = 'pg_dump'; // PostgreSQL (if in PATH)
// const mysqldumpPath = 'mysqldump'; // MySQL

@Injectable()
export class BackupService {
  constructor(private readonly fileStorage: FileStorageService) {}
  private readonly logger = new Logger(BackupService.name);

  async backupDatabase(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${process.env.DB_NAME}-${timestamp}.sql`;
    const backupDir = path.resolve(process.env.BACKUP_DIR || 'storage');
    const filePath = path.join(backupDir, filename);

    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbPassword = process.env.DB_PASSWORD;

    const dumpCommand = `PGPASSWORD="${dbPassword}" ${pgDumpPath} -h ${dbHost} -p ${dbPort} -U ${dbUser} -F p ${dbName} > "${filePath}"`;
    // const dumpCommand = `${mysqldumpPath} -u ${dbUser} -p${dbPassword} -h ${dbHost} --port=${dbPort} ${dbName} > "${filePath}"`;

    await execAsync(dumpCommand);
    return filePath;
  }
  @Cron('*/1 * * * *')
  async handleCron() {
    logger.info('📅 Running daily database backup...');
    try {
      const filePath = await this.backupDatabase();
      logger.info(`✅ Backup success: ${filePath}`);
    } catch (error) {
      logger.error(`❌ Backup failed: ${error.message}`);
    }
  }
}
