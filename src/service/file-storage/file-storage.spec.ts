// file-storage.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageService } from './file-storage.service';
import * as fs from 'fs';
import * as path from 'path';

describe('FileStorageService', () => {
  let service: FileStorageService;
  const storageDir = path.join(__dirname, '../../storage');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStorageService],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    
    // 確保儲存目錄存在
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  });

  afterEach(() => {
    // 測試後清理檔案
    const testFile = path.join(storageDir, 'test.txt');
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save and read file correctly', () => {
    const filename = 'test.txt';
    const data = 'Hello Test!';
    const path = service.saveFile(filename, data);
    const readContent = service.readFile(filename);

    expect(fs.existsSync(path)).toBe(true);
    expect(readContent).toBe(data);
  });
});
