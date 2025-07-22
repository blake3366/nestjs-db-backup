# NestJS Database 自動備份指南

## 概述
本指南說明如何使用 NestJS 創建一個自動化的 PostgreSQL (or MySQL)資料庫備份服務，並透過 Docker Compose 部署。
### 為什麼不選用 Laravel 或純 Shell？

- Shell script 雖然體積最小，但缺乏擴充性、難以維護
- Laravel 功能完整，但 Docker image 體積大（>300MB），部署成本高
- NestJS 在架構彈性與容器大小之間取得平衡，搭配 Alpine node 可壓縮至 <100MB，適合用於備份任務這類輕量但需擴展性的服務

## 完整實作步驟

### 1. 建立 NestJS 專案

```bash
# 安裝 NestJS CLI
npm i -g @nestjs/cli 

# 創建新專案
nest new your_project_name

# 進入專案目錄
cd  your_project_name

# 安裝必要套件
pnpm add --save @nestjs/schedule @nestjs/config pg
pnpm add --save-dev @types/pg
```

### 2. 建立備份API

```bash
# 生成備份模組
nest generate resource controllers/your_controller_name
# 這裡是用backup
nest generate resource controllers/backup
```

### 3. 專案資料夾架構

完成上述指令後，你的專案資料夾結構應該如下：

```
your_project_name/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│    controllers/              # 使用 nest generate resource 後自動生成
│       └── backup/
│           ├── dto/
│           ├── entities/
│           ├── backup.service.ts
│           ├── backup.controller.ts
│           └── backup.module.ts
├── test/
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env                     # 需手動建立 
├── Dockerfile               # 需手動建立
├── docker-compose.yml       # 需手動建立
└── storage/                 # 需手動建立 存放備份資料的位置
```
### 3. 安裝 nestjs/chedule
```bash
# 安裝 @nestjs/schedule 套件
pnpm add @nestjs/schedule
```
在`app.module.ts`引入

``` ts
import { ScheduleModule } from '@nestjs/schedule';
...
@Module({
  imports: [
    ...
    ScheduleModule.forRoot()
  ],
  ...
})
```

### 4. 實作排程備份邏輯

修改 `src/backup/backup.service.ts`，加入使用 pg_dump 備份的邏輯與排程。主要功能：
- 使用 @nestjs/schedule 的 @Cron 裝飾器設定定時任務，類似crontab 
- 若需自定義時間，可使用 cron 字串寫法，如 '0 0 * * *' 表示每日午夜
- 執行 pg_dump 命令備份資料庫
- 管理備份文件，刪除過期備份
- 建議將備份邏輯與其他業務邏輯分離，保持模組的獨立性與可維護性。可以將備份功能集中實現在專屬的服務或模組中，避免與其他 API 混雜。

例如 `src/controllers/backup/backup.service.ts`

``` ts
@Cron(CronExpression.EVERY_DAY_AT_8AM ) // every day at 8 AM backup 
// 這邊是要執行的函數
  async handleCron() { 
    logger.info('📅 Running daily database backup...');
    try {
      const filePath = await this.backupDatabase();
      logger.info(`✅ Backup success: ${filePath}`);
    } catch (error) {
      logger.error(`❌ Backup failed: ${error.message}`);
    }
  }
```
### 5. 將備份訊息存入日誌

在備份邏輯中，將備份的成功與失敗訊息記錄到日誌中，便於後續的監控與排查。可以使用內建的 `Logger` 或其他日誌管理工具（如 `winston` 或 `pino`）來實現。

#### 安裝 winston

```bash
pnpm add winston
```

#### 建立日誌工具

製作 `src/utilts/logger.ts`，在此包裝日誌寫入方式：

```ts
import { createLogger, transports, format } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'app.log') }), // 寫入到app.log
  ],
});
```

#### 修改備份邏輯

修改 `src/controllers/backup/backup.service.ts`，在備份邏輯中加入日誌記錄：

```ts
import { logger } from '../../utils/logger'; 

@Injectable()
export class BackupService {
  ... 

  async handleCron() {
    logger.info('📅 Running daily database backup...'); // 這邊會紀錄在log/app.log里
    try {
      const filePath = await this.backupDatabase();
      logger.info(`✅ Backup success: ${filePath}`);
    } catch (error) {
      logger.error(`❌ Backup failed: ${error.message}`);
    }
  }
  ...
}
```
#### 日誌與備份檔案存放位置

- **日誌存放位置**:
  - 預設情況下，NestJS 的日誌會輸出到 terminal。
  - 如果需要將日誌存入檔案，可以使用日誌管理工具（如 `winston`）並設定輸出目錄，例如 `./logs`。
  - 建議在 `docker-compose.yml` 中掛載日誌目錄，確保日誌文件持久化。

- **備份檔案存放位置**:
  - 備份的資料庫檔案預設存放於 `./storage` 目錄。
  - 可以透過 `.env` 檔案中的 `BACKUP_DIR` 變數自訂備份檔案的存放位置。
  - 同樣建議在 `docker-compose.yml` 中掛載備份目錄，確保備份文件持久化。

```yaml
volumes:
  - ./logs:/app/logs # 日誌目錄
  - ./storage:/app/storage # 備份檔案目錄
```

這樣可以方便地檢視備份執行的詳細記錄，並快速定位問題。
### 5. 設定環境變數
### 範例環境變數設定

在 `.env` 檔案中設定單一資料庫的備份資訊，範例如下：

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=examplepassword
DATABASE_NAME=exampledb
BACKUP_DIR=./storage
```

這樣的設定適合單一資料庫備份的需求，後續可以根據需求擴展為多資料庫備份。
如果需要備份多個資料庫，可以考慮建立一個資料庫來存放需要備份的資料庫資訊。

### 建立資料庫表格存放備份資訊

可以使用 Prisma 建立一個表格來存放需要備份的資料庫資訊。以下是 Prisma 的模型定義：

```prisma
model BackupTarget {
  id          Int      @id @default(autoincrement())
  dbHost      String   @map("db_host")
  dbPort      Int      @default(5432) @map("db_port")
  dbUser      String   @map("db_user")
  dbPassword  String   @map("db_password")
  dbName      String   @map("db_name")
  backupDir   String   @default("./storage") @map("backup_dir")
  createdAt   DateTime @default(now()) @map("created_at")
}
```

### 使用步驟

1. **更新 Prisma Schema**  
   將上述模型添加到 `prisma/schema.prisma` 文件中。

2. **執行資料庫遷移**  
   使用以下命令生成並執行遷移：

   ```bash
   npx prisma migrate dev --name add_backup_targets
   ```

這樣的設計可以更好地應對多資料庫備份的需求。

### 6. 建立 Docker 配置檔

創建 `Dockerfile`跟`docker-compose.yml`
可參考本專案的 [`Dockerfile`](./Dockerfile) 與 [`docker-compose.yml`](./docker-compose.yml)


### 7. 啟動服務

```bash
# 建立備份目錄以及log日誌存放
mkdir -p storage logs

# 啟動 Docker Compose 服務
docker-compose up -d

# 若要查看備份服務的日誌，可以使用以下指令：

docker-compose logs -f

# 或者直接查看日誌檔案
cat logs/app.log
```

請確保 `logs` 目錄已正確掛載到容器中，並且日誌檔案已生成。

## 備份維護

- 備份資料庫的sql將儲存在 `./storage` 目錄
- 可以修改 `.env` 的 `BACKUP_DIR` 備份檔案位置
- 建議定期將備份檔案同步至雲端存儲或其他安全位置，並可考慮新增通知功能，例如透過電子郵件或 Line 提醒備份狀態。

## 未來規劃

- 增加通知功能：透過電子郵件或即時通訊工具（如 Line、Slack）提醒備份狀態。
- 支援多資料庫備份：擴展邏輯，同時備份多個資料庫。
- 增強安全性：新增備份加密功能，確保檔案安全。
- 提供還原功能：實現一鍵還原資料庫的能力。
- 優化排程管理：支援自定義備份時間與頻率。
- 整合雲存儲：同步備份檔案至 AWS S3 或其他雲存儲服務。
