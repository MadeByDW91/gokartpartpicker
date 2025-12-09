// API Request/Response Types
export interface CreatePartRequest {
  name: string;
  sku: string;
  brand: string;
  category: string;
  description?: string;
  price: number;
  imageUrls?: string[];
}

export interface PartResponse {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  description: string | null;
  price: number;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  compatibilityProfiles: CompatibilityProfileResponse[];
}

export interface CreateCompatibilityProfileRequest {
  partId: string;
  engineModel?: string;
  shaftDiameter?: string;
  boltPattern?: string;
  chainSize?: string;
  frameType?: string;
  notes?: string;
}

export interface CompatibilityProfileResponse {
  id: string;
  partId: string;
  engineModel: string | null;
  shaftDiameter: string | null;
  boltPattern: string | null;
  chainSize: string | null;
  frameType: string | null;
  notes: string | null;
}

export interface CreateBuildRequest {
  userName: string;
}

export interface BuildResponse {
  id: string;
  userName: string;
  createdAt: Date;
  items: BuildItemResponse[];
}

export interface CreateBuildItemRequest {
  buildId: string;
  partId: string;
  slotCategory: string;
  quantity?: number;
}

export interface BuildItemResponse {
  id: string;
  buildId: string;
  partId: string;
  slotCategory: string;
  quantity: number;
  part: PartResponse;
}

// Slot Categories
export type SlotCategory = 
  | 'engine'
  | 'clutch'
  | 'sprocket'
  | 'chain'
  | 'tire'
  | 'wheel'
  | 'brake'
  | 'frame'
  | 'seat'
  | 'steering'
  | 'other';

export const SLOT_CATEGORIES: readonly SlotCategory[] = [
  'engine',
  'clutch',
  'sprocket',
  'chain',
  'tire',
  'wheel',
  'brake',
  'frame',
  'seat',
  'steering',
  'other'
] as const;

