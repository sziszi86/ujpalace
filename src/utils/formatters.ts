export function formatCurrency(amount: number, currency: string = 'HUF'): string {
  // Handle NaN, null, undefined values
  if (isNaN(amount) || amount == null) {
    return '0 Ft';
  }
  
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  if (!time) return '';
  return time.slice(0, 5); // HH:MM format
}

export function formatStakes(stakes: string): string {
  return stakes.replace('/', '/');
}

export function formatChips(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('hu-HU').format(num);
}