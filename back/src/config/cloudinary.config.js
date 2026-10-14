import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube una imagen desde un buffer en memoria hacia Cloudinary bajo una estructura
 * de carpetas configurable (default 'catalog/products').
 * @param {Buffer} buffer - El archivo binario en RAM.
 * @param {string} sku - El SKU del producto para usar como identificador único.
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadImageStream = (buffer, sku) => {
  return new Promise((resolve, reject) => {
    // Sanitizar SKU para nombre de archivo seguro
    const safeSku = sku ? sku.trim().toUpperCase().replace(/[^A-Z0-9_-]/gi, '_') : `PROD_${Date.now()}`;
    const folder = process.env.CLOUDINARY_FOLDER || 'catalog/products';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: safeSku,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' } // Optimización automática WebP / AVIF
        ]
      },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

/**
 * Elimina una imagen de Cloudinary a través de su public_id o URL.
 * @param {string} publicIdOrUrl - El public_id (ej: 'catalog/products/PROD_001') o URL completa.
 */
export const deleteImage = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return null;

  try {
    let publicId = publicIdOrUrl;

    // Si es una URL completa de Cloudinary, extraer el public_id ignorando el versionado /v12345/
    if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
      const uploadIdx = publicIdOrUrl.lastIndexOf('/upload/');
      if (uploadIdx !== -1) {
        let pathAfterUpload = publicIdOrUrl.substring(uploadIdx + 8); // después de '/upload/'
        // Remover versionado v12345678/ si existe
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
        // Remover extensión (.jpg, .png, etc.)
        const dotIdx = pathAfterUpload.lastIndexOf('.');
        if (dotIdx !== -1) {
          publicId = pathAfterUpload.substring(0, dotIdx);
        } else {
          publicId = pathAfterUpload;
        }
      }
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.warn("⚠️ Aviso al eliminar imagen de Cloudinary:", error.message);
    return null;
  }
};

export default cloudinary;
