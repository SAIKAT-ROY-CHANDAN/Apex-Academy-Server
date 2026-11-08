import fs from 'fs';
import path from 'path';

const ensureDir = (dirPath: string) => {
  try {
    if (typeof fs.existsSync === 'function' && !fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {
    // Filesystem may be read-only or absent in edge/serverless environments
  }
};

export const ensureUploadDirs = () => {
  try {
    const basePublic = path.join(process.cwd(), 'public');

    ensureDir(basePublic);
    ensureDir(path.join(basePublic, 'files'));
    ensureDir(path.join(basePublic, 'images'));
  } catch {
    // Safe fallback for environments without disk write permissions
  }
};
