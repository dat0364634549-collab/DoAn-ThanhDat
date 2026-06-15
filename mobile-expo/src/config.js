export const API_ORIGIN = 'https://thanhdatshop-api.onrender.com';
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const STATIC_SITE_ORIGIN = 'https://thanhdatshop.netlify.app';

export function resolveImageUrl(image) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/^\/+/, '');
  if (normalized.startsWith('uploads/')) {
    return `${API_ORIGIN}/${normalized}`;
  }

  return `${STATIC_SITE_ORIGIN}/${normalized}`;
}
