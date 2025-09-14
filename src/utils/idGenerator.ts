export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateUniqueIdForArray<T extends { id?: string | number }>(
  array: T[], 
  prefix: string = ''
): string {
  let newId: string;
  let attempts = 0;
  const maxAttempts = 1000;
  
  do {
    newId = prefix + generateUniqueId();
    attempts++;
    
    if (attempts > maxAttempts) {
      // Fallback to timestamp-based ID if we can't find unique ID
      newId = prefix + Date.now().toString() + Math.floor(Math.random() * 10000);
      break;
    }
  } while (array.some(item => item.id?.toString() === newId));
  
  return newId;
}

export function generateNumericId(array: { id: number }[]): number {
  if (array.length === 0) return 1;
  
  const maxId = Math.max(...array.map(item => item.id || 0));
  return maxId + 1;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}