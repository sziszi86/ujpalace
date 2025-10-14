export interface Tournament {
  id: number;
  title: string;
  description: string;
  longDescription?: string; // For admin editor
  long_description?: string; // API field compatibility
  date: string;
  time: string;
  // API also returns these fields
  tournament_date?: string;
  tournament_time?: string;
  buyIn: number;
  buy_in?: string; // API returns as string
  rebuyPrice?: number;
  rebuyChips?: number;
  rebuyCount?: number;
  addonPrice?: number;
  addonChips?: number;
  addonCount?: number;
  guarantee: number;
  guarantee_amount?: number; // API field compatibility
  structure: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'inactive';
  maxPlayers?: number;
  max_players?: number; // API field compatibility
  currentPlayers?: number;
  current_players?: number; // API field compatibility
  image?: string;
  image_url?: string; // API field for compatibility
  images?: string[]; // Multiple images for gallery
  category?: string;
  featured?: boolean;
  venue?: string;
  lateRegistration?: boolean;
  late_registration?: boolean; // API field compatibility
  lateRegistrationUntil?: string;
  late_registration_until?: string; // API field compatibility
  blindStructure?: string;
  blind_structure?: string; // API field compatibility
  startingChips?: number;
  starting_chips?: number; // API field compatibility
  prize1st?: number;
  totalPlayers?: number;
  registrationDeadline?: string;
  // Live event specific
  contactPhone?: string;
  contact_phone?: string; // API field compatibility
  contactEmail?: string;
  contact_email?: string; // API field compatibility
  specialNotes?: string;
  special_notes?: string; // API field compatibility
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