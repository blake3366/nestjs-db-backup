FROM node:20-alpine

# 設置工作目錄
WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 添加 PostgreSQL 客戶端工具 (使用 apk 而非 apt-get)
RUN apk add --no-cache postgresql-client

# 複製依賴文件並安裝
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# 複製源代碼（確保包含.env檔案）
COPY . .

# 生成 Prisma 客戶端
RUN npx prisma generate
# RUN npx prisma migrate dev
# RUN npx prisma db push

# 編譯應用
RUN pnpm build

# 檢查編譯後的文件位置並驗證主要文件存在
RUN find dist -type f -name "*.js" | sort && \
    if [ ! -f dist/src/main.js ]; then echo "Error: main.js not found at expected path" && exit 1; fi

# 確保所需的目錄存在
RUN mkdir -p storage logs

# 暴露端口並設置啟動命令
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
