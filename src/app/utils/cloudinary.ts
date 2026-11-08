import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET || 'zzdPIp_hoFoVUi7j_IkfHJkYULQ',
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
