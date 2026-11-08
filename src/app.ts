/* eslint-disable no-console */
import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFoundErrorHandler from './app/middlewares/notFoundErrorHandler';
import { ensureUploadDirs } from './app/utils/ensureUploadDirs';
import { seedDemo } from './db/seedDemo';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use(express.static('public'));

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the STMP API',
  });
});

// Importing routes
app.use('/api/v1', router);

// Error handling middleware
app.use(globalErrorHandler);

// 404 Not Found middleware
app.use(notFoundErrorHandler);

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
