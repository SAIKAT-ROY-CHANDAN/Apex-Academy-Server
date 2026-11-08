import fs from 'fs';
import path from 'path';

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const ensureUploadDirs = () => {
  const basePublic = path.join(process.cwd(), 'public');

  ensureDir(basePublic);
  ensureDir(path.join(basePublic, 'files'));
  ensureDir(path.join(basePublic, 'images'));
};
