import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { FileStorageModule } from 'src/service/file-storage/file-storage.module';

@Module({
  imports: [FileStorageModule],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
