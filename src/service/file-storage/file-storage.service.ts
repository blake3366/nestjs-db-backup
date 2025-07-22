import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly storagePath = path.join(__dirname, '../../storage');
  
  onModuleInit() {
    // 確保儲存目錄存在
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }
  
  saveFile(filename: string, data: string) {
    const filePath = path.join(this.storagePath, filename);
    fs.writeFileSync(filePath, data);
    return filePath;
  }
  
  readFile(filename: string): string {
    const filePath = path.join(this.storagePath, filename);
    return fs.readFileSync(filePath, 'utf8');
  }
}