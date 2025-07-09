# NestJS PostgreSQL 自動備份指南

## 概述
本指南說明如何使用 NestJS 創建一個自動化的 PostgreSQL 資料庫備份服務，並透過 Docker Compose 部署。

## 完整實作步驟

### 1. 建立 NestJS 專案

```bash
# 安裝 NestJS CLI
npm i -g @nestjs/cli

# 創建新專案
nest new postgres-backup-service

# 進入專案目錄
cd postgres-backup-service

# 安裝必要套件
npm install --save @nestjs/schedule @nestjs/config pg
npm install --save-dev @types/pg
```

### 2. 建立備份模組與服務

```bash
# 生成備份模組
nest generate module backup

# 生成備份服務
nest generate service backup
```

### 3. 實作排程備份邏輯

修改 `src/backup/backup.service.ts`，加入使用 pg_dump 備份的邏輯與排程。主要功能：
- 使用 @nestjs/schedule 的 @Cron 裝飾器設定定時任務
- 執行 pg_dump 命令備份資料庫
- 管理備份文件，刪除過期備份

### 4. 設定環境變數

建立 `.env` 檔案：
```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=yourdbname
BACKUP_DIR=/app/backups
BACKUP_CRON="0 0 * * *"  # 每天午夜執行
BACKUP_RETENTION_DAYS=7  # 保留7天的備份
```

### 5. 建立 Docker 配置檔

創建 `Dockerfile`:
```Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# 安裝 PostgreSQL 客戶端工具 (用於pg_dump)
RUN apk add --no-cache postgresql-client

COPY . .
RUN npm run build

CMD ["node", "dist/main"]
```

創建 `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  backup-service:
    build: .
    volumes:
      - ./backups:/app/backups
    env_file:
      - .env
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 6. 啟動服務

```bash
# 建立備份目錄
mkdir -p backups

# 啟動 Docker Compose 服務
docker-compose up -d

# 查看備份服務日誌
docker-compose logs -f backup-service
```

### 7. 手動觸發備份（測試用）

```bash
# 進入容器
docker-compose exec backup-service sh

# 在容器內執行
node -e "require('./dist/backup/backup.service').BackupService.prototype.backupDatabase.call({logger:{log:console.log,error:console.error}, configService:{get:(key,defaultValue)=>process.env[key]||defaultValue}})"
```

## 備份維護

- 備份檔案將儲存在 `./backups` 目錄
- 可以修改 `.env` 的 `BACKUP_RETENTION_DAYS` 變數來調整備份保留天數
- 建議定期將備份轉移到雲端儲存或其他安全位置
