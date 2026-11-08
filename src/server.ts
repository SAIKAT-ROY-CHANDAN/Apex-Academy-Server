import 'dotenv/config';
import app from './app';
import { ensureUploadDirs } from './app/utils/ensureUploadDirs';
import { seedDemo } from './db/seedDemo';

ensureUploadDirs();

const PORT = process.env.PORT || 5000;

// Running the server
app.listen(PORT, async () => {
  try {
    await seedDemo();
  } catch (error) {
    console.error('Initial auto-seed check failed:', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
