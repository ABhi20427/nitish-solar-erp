export function formatCurrency(amount: number, currency: string = '₹'): string {
  if (amount >= 10000000) {
    return `${currency}${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${currency}${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `${currency}${amount.toLocaleString()}`;
}

export function formatCapacity(kw: number): string {
  if (kw >= 1000) {
    return `${(kw / 1000).toFixed(1)} MWp`;
  }
  return `${kw} kWp`;
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
