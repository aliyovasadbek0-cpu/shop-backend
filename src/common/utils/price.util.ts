import { Product } from '../../entities/product.entity';

/** Figma: asosiy narx, discount_price yoki discount_percentage */
export function getEffectiveUnitPrice(product: Product): number {
  const base = Number(product.price);
  if (product.discountPrice != null && product.discountPrice !== '') {
    return Number(product.discountPrice);
  }
  if (
    product.discountPercentage != null &&
    product.discountPercentage > 0
  ) {
    const v = base * (1 - product.discountPercentage / 100);
    return Math.round(v * 100) / 100;
  }
  return base;
}

export function parseMoney(value: string | number): number {
  return Math.round(Number(value) * 100) / 100;
}

export function formatMoney(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}
