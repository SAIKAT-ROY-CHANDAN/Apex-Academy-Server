import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export default {
  port: process.env.PORT,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME,
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  email: process.env.EMAIL,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailSecure: process.env.EMAIL_SECURE === 'true',

  bulkSms: {
    apiKey: process.env.API_KEY ?? process.env.API_KEY,
    senderId: process.env.SENDER_ID ?? process.env.SENDER_ID,
    baseUrl:
      process.env.BULKSMSBD_BASE_URL ?? 'http://bulksmsbd.net/api/smsapi',
  },

  bkash: {
    baseUrl: process.env.BKASH_BASE_URL,
    merchantNumber: process.env.BKASH_MERCHANT_NUMBER,
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    callbackUrl: process.env.BKASH_CALLBACK_URL,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret:
      process.env.CLOUDINARY_API_SECRET || 'zzdPIp_hoFoVUi7j_IkfHJkYULQ',
  },
};
