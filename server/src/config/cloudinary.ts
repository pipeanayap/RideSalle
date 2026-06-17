import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

let configured = false;

/** Configura Cloudinary de forma perezosa la primera vez que se usa. */
export function getCloudinary(): typeof cloudinary {
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** Indica si Cloudinary tiene credenciales configuradas. */
export function isCloudinaryEnabled(): boolean {
  return Boolean(env.CLOUDINARY_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}
