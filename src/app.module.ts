import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './controllers/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BackupModule } from './controllers/backup/backup.module';

@Module({
  imports: [UserModule,PrismaModule, BackupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
