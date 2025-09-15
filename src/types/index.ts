export interface Tournament {
  id: number;
  title: string;
  description: string;
  longDescription?: string; // For admin editor
  date: string;
  time: string;
  // API also returns these fields
  tournament_date?: string;
  tournament_time?: string;
  buyIn: number;
  buy_in?: string; // API returns as string
  rebuyPrice?: number;
  rebuyChips?: number;
  addonPrice?: number;
  addonChips?: number;
  guarantee: number;
  structure: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'inactive';
  maxPlayers?: number;
  currentPlayers?: number;
  image?: string;
  images?: string[]; // Multiple images for gallery
  category?: string;
  featured?: boolean;
  venue?: string;
  lateRegistration?: boolean;
  lateRegistrationUntil?: string;
  blindStructure?: string;
  startingChips?: number;
  prize1st?: number;
  totalPlayers?: number;
  registrationDeadline?: string;
  // Live event specific
  contactPhone?: string;
  contactEmail?: string;
  specialNotes?: string;
  // Admin visibility fields
  visibleFrom?: string;
  visibleUntil?: string;
}

export interface CashGame {
  id: number;
  name: string;
  stakes: string;
  game: string;
  minBuyIn: number;
  maxBuyIn: number;
  description: string;
  longDescription?: string;
  schedule: string;
  scheduledDates?: string[]; // For specific scheduled dates
  weeklySchedule?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  active: boolean;
  featured?: boolean;
  venue?: string;
  contactPhone?: string;
  contactEmail?: string;
  rules?: string[];
  image?: string;
  images?: string[];
  type?: 'cash-game'; // For event categorization
  // Admin visibility fields
  visibleFrom?: string;
  visibleUntil?: string;
}

export interface Banner {
  id: number;
  title: string;
  description: string;
  image: string;
  link?: string;
  order: number;
  active: boolean;
  visibleFrom: string;
  visibleUntil: string;
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  images?: string[];
  publishDate: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'published' | 'draft';
  category: string;
  tags: string[];
  featured?: boolean;
  author?: string;
  slug?: string;
  readTime?: number;
  visibleFrom?: string;
  visibleUntil?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  children?: MenuItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  createdAt: string;
}

export interface AboutPage {
  id: number;
  title: string;
  content: string;
  heroImage?: string;
  metaDescription?: string;
  features?: string[];
  lastUpdated: string;
  active: boolean;
}