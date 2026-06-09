import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';

const configureCloudinary = (): void => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured', 500);
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export const uploadImageBuffer = async (
  buffer: Buffer,
): Promise<{ imageUrl: string; publicId: string }> => {
  configureCloudinary();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'eventful/event-covers',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (!response) {
          reject(new AppError('Image upload failed', 500));
          return;
        }

        resolve(response);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
};
