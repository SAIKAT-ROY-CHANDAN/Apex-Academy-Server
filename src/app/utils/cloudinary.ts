import { v2 as cloudinary } from 'cloudinary';
import configs from '../configs';

cloudinary.config({
  cloud_name: configs.cloudinary.cloudName,
  api_key: configs.cloudinary.apiKey,
  api_secret: configs.cloudinary.apiSecret,
  secure: true,
});

export const uploadToCloudinary = async (
  filePathOrBuffer: string | Buffer,
  folder: string = 'apex-college',
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof filePathOrBuffer === 'string') {
      cloudinary.uploader.upload(
        filePathOrBuffer,
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );
      uploadStream.end(filePathOrBuffer);
    }
  });
};

export default cloudinary;
