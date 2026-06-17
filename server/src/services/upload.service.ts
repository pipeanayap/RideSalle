import { getCloudinary, isCloudinaryEnabled } from '../config/cloudinary.js';
import { badRequest } from '../utils/AppError.js';

export interface UploadResult {
  url: string;
  publicId: string;
}

const DATA_URL_PATTERN = /^data:image\/(png|jpe?g|webp);base64,/;

/**
 * Sube una imagen (data URL base64) a Cloudinary y devuelve url + publicId.
 * Valida formato y tamaño antes de enviar.
 */
export const uploadService = {
  async uploadImage(dataUrl: string, folder: string): Promise<UploadResult> {
    if (!isCloudinaryEnabled()) {
      throw badRequest('La subida de imágenes no está configurada (Cloudinary)');
    }
    if (!DATA_URL_PATTERN.test(dataUrl)) {
      throw badRequest('Formato de imagen inválido (se espera PNG, JPG o WEBP en base64)');
    }
    // Límite aproximado de 5 MB sobre el payload base64.
    if (dataUrl.length > 7_000_000) {
      throw badRequest('La imagen supera el tamaño máximo permitido (5 MB)');
    }

    const result = await getCloudinary().uploader.upload(dataUrl, {
      folder: `ridesalle/${folder}`,
      resource_type: 'image',
      transformation: [{ width: 600, height: 600, crop: 'limit' }, { quality: 'auto' }],
    });

    return { url: result.secure_url, publicId: result.public_id };
  },

  async deleteImage(publicId: string): Promise<void> {
    if (!isCloudinaryEnabled()) return;
    await getCloudinary().uploader.destroy(publicId);
  },
};
