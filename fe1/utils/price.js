// Tiện ích tính giá & format VND dùng chung cho fe1.
// Quy ước dữ liệu backend (bảng products):
//   - price:    giá gốc (VND)
//   - discount: phần trăm giảm (0-100), có thể null
// Giá bán cuối cùng = price * (1 - discount/100)

export function getOriginalPrice(product) {
  if (!product) return 0;
  return parseFloat(product.price) || 0;
}

export function getDiscountPercent(product) {
  if (!product) return 0;
  const d = parseFloat(product.discount);
  if (!Number.isFinite(d) || d <= 0) return 0;
  return Math.min(100, Math.max(0, d));
}

export function getFinalPrice(product) {
  const base = getOriginalPrice(product);
  const discount = getDiscountPercent(product);
  if (!discount) return base;
  return Math.round(base * (1 - discount / 100));
}

export function hasDiscount(product) {
  return getDiscountPercent(product) > 0;
}

export function formatVND(value) {
  const n = Math.round(Number(value) || 0);
  return `${n.toLocaleString('vi-VN')}₫`;
}
