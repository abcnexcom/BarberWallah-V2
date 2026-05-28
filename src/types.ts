export type ShopStatus = 'pending' | 'active' | 'suspended';

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  city: string;
  country: string;
  currency: string;
  email?: string;
  status: ShopStatus;
  plan: 'basic' | 'intermediate' | 'advanced';
  paidUntil: string; // ISO string
  setupDate: string; // ISO string
  queueOpen: boolean;
  pin: string;
  password?: string;
  adminNotes?: string;
  softwareDiscount?: number;
  softwarePriceGuessed?: boolean;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  adminPin?: string;
  softwarePrice?: number;
  wantsPartnership?: boolean;
  referralCodeUsed?: string;
  partnershipPercentage?: number;
}

export interface ReferralConfig {
  enabled: boolean;
  validCodes: string[];
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  price: number;
  duration: number; // minutes
  active: boolean;
  sortOrder: number;
}

export type QueueEntryStatus = 'waiting' | 'called' | 'in_service' | 'done' | 'no_show' | 'cancelled';

export interface QueueEntry {
  id: string;
  shopId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  tokenNo: number;
  status: QueueEntryStatus;
  joinedAt: string;
  calledAt?: string;
  completedAt?: string;
  estimatedWait: number;
  isCashOnly: boolean;
  waitingInShop: boolean;
}

export interface CustomerHistory {
  id: string;
  shopId: string;
  customerName: string;
  phone: string;
  totalVisits: number;
  streakCount: number;
  lastVisitDate: string;
  updatedAt: string;
}

export interface ShopConfig {
  shopId: string;
  loyaltyThreshold: number;
  loyaltyDiscountPct: number;
  streakWindowDays: number;
  avgServiceMin: number;
  maxWaitingCapacity: number;
  exotelSid?: string;
  exotelToken?: string;
  exotelCallerId?: string;
  audioUrl?: string;
  enableWhatsApp?: boolean;
  ownerWhatsApp?: string;
  whatsappApiKey?: string;
}

export interface EarningRecord {
  id: string;
  shopId: string;
  date: string; // YYYY-MM-DD
  totalCustomers: number;
  totalRevenue: number;
  discountsGiven: number;
  netRevenue: number;
}
