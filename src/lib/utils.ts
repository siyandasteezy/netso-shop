export function formatPrice(price: number): string {
  return `R${price.toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "NST-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Calculate VAT amount from a subtotal (exclusive of VAT). */
export function calcVat(subtotal: number, vatRate: number): number {
  return Math.round(subtotal * (vatRate / 100) * 100) / 100;
}

/** Calculate subtotal (excl. VAT) from a VAT-inclusive price. */
export function extractVatFromInclusive(
  total: number,
  vatRate: number
): { subtotal: number; vat: number } {
  const subtotal = Math.round((total / (1 + vatRate / 100)) * 100) / 100;
  const vat = Math.round((total - subtotal) * 100) / 100;
  return { subtotal, vat };
}

/** Returns itemised price breakdown ready for display. */
export function buildOrderTotals(
  subtotal: number,
  vatRate: number,
  deliveryFee: number,
  vatInclusive = false
): {
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  total: number;
  vatRate: number;
} {
  if (vatInclusive) {
    const { subtotal: excl, vat } = extractVatFromInclusive(subtotal, vatRate);
    return {
      subtotal: excl,
      vatAmount: vat,
      deliveryFee,
      total: subtotal + deliveryFee,
      vatRate,
    };
  }

  const vatAmount = calcVat(subtotal, vatRate);
  return {
    subtotal,
    vatAmount,
    deliveryFee,
    total: subtotal + vatAmount + deliveryFee,
    vatRate,
  };
}
