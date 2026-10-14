/**
 * Genera la URL pública del catálogo storefront para una tienda
 */
export const getStorefrontUrl = (slug) => {
  if (!slug) return '';
  const customStoreUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STOREFRONT_URL) ||
    'http://localhost:3002';

  const baseUrl = customStoreUrl.replace(/\/$/, '');
  return `${baseUrl}/${slug}`;
};

export default getStorefrontUrl;
