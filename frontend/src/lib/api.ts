import type {
  PartResponse,
  CreatePartRequest,
  BuildResponse,
  CreateBuildRequest,
  BuildItemResponse,
  CreateBuildItemRequest,
  CompatibilityProfileResponse,
  CreateCompatibilityProfileRequest,
} from '@gokartpartpicker/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Parts API
export const partsAPI = {
  getAll: (params?: {
    q?: string;
    category?: string;
    brand?: string;
    engine_model?: string;
    chain_size?: string;
    price_min?: number;
    price_max?: number;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.brand) query.append('brand', params.brand);
    if (params?.engine_model) query.append('engine_model', params.engine_model);
    if (params?.chain_size) query.append('chain_size', params.chain_size);
    if (params?.price_min !== undefined) query.append('price_min', params.price_min.toString());
    if (params?.price_max !== undefined) query.append('price_max', params.price_max.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    return fetchAPI<{
      items: PartResponse[];
      total: number;
      page: number;
      page_size: number;
    }>(`/parts?${query.toString()}`);
  },
  getById: (id: string) => fetchAPI<PartResponse>(`/parts/${id}`),
  create: (data: CreatePartRequest) =>
    fetchAPI<PartResponse>('/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Builds API
export const buildsAPI = {
  getAll: () => fetchAPI<any[]>(`/api/builds`),
  getById: (id: string) => fetchAPI<any>(`/builds/${id}`),
  create: (data: CreateBuildRequest) =>
    fetchAPI<any>('/builds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addPart: (buildId: string, data: { partId: string; slotCategory: string; quantity?: number }) =>
    fetchAPI<any>(`/builds/${buildId}/add`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeItem: (buildItemId: string) =>
    fetchAPI<void>(`/api/build-items/${buildItemId}`, {
      method: 'DELETE',
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/api/builds/${id}`, {
      method: 'DELETE',
    }),
  getBuildItems: (buildId: string) =>
    fetchAPI<any[]>(`/api/build-items?buildId=${buildId}`),
};

// Build Items API
export const buildItemsAPI = {
  getAll: (params?: { buildId?: string; partId?: string; slotCategory?: string }) => {
    const query = new URLSearchParams();
    if (params?.buildId) query.append('buildId', params.buildId);
    if (params?.partId) query.append('partId', params.partId);
    if (params?.slotCategory) query.append('slotCategory', params.slotCategory);
    return fetchAPI<BuildItemResponse[]>(`/api/build-items?${query.toString()}`);
  },
  getById: (id: string) => fetchAPI<BuildItemResponse>(`/api/build-items/${id}`),
  create: (data: CreateBuildItemRequest) =>
    fetchAPI<BuildItemResponse>('/api/build-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateBuildItemRequest>) =>
    fetchAPI<BuildItemResponse>(`/api/build-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/api/build-items/${id}`, {
      method: 'DELETE',
    }),
};

// Compatibility Profiles API
export const compatibilityProfilesAPI = {
  getAll: (params?: { partId?: string }) => {
    const query = new URLSearchParams();
    if (params?.partId) query.append('partId', params.partId);
    return fetchAPI<CompatibilityProfileResponse[]>(`/api/compatibility-profiles?${query.toString()}`);
  },
  getById: (id: string) => fetchAPI<CompatibilityProfileResponse>(`/api/compatibility-profiles/${id}`),
  create: (data: CreateCompatibilityProfileRequest) =>
    fetchAPI<CompatibilityProfileResponse>('/api/compatibility-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateCompatibilityProfileRequest>) =>
    fetchAPI<CompatibilityProfileResponse>(`/api/compatibility-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/api/compatibility-profiles/${id}`, {
      method: 'DELETE',
    }),
};

