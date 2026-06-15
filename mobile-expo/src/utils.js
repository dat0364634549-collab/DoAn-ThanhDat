export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

export function discountedPrice(product) {
  const discount = Number(product?.discount || 0);
  const price = Number(product?.price || 0);
  return discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
}

export function parseOrderProducts(value) {
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}
