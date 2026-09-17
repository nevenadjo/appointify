const priceFormat = new Intl.NumberFormat("sr-RS");

export function formatPrice(value: number) {
  return `${priceFormat.format(value)} RSD`;
}
