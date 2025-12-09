'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { partsAPI } from '@/lib/api';
import { useBuild } from '@/context/BuildContext';
import Header from '@/components/Header';
import { MOCK_PARTS, type Part as MockPart } from '@/mock/parts';
import type { PartResponse } from '@gokartpartpicker/shared';

// Static category list (should match backend and mock data)
const CATEGORIES = [
  'engine',
  'clutch',
  'torque_converter',
  'sprocket',
  'chain',
  'tire',
  'wheel',
  'brake',
  'frame',
  'seat',
  'steering',
  'accessory',
  'other',
];

// Chain size options
const CHAIN_SIZES = ['', '#35', '#40', '#41', '420', '428'];

interface PartsResponse {
  items: PartResponse[];
  total: number;
  page: number;
  page_size: number;
}

export default function PartsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<PartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters from URL or state
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [engineModel, setEngineModel] = useState(searchParams.get('engine_model') || '');
  const [chainSize, setChainSize] = useState(searchParams.get('chain_size') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize] = useState(20);
  
  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Build context
  const { addItem } = useBuild();
  
  // Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  // Use mock data flag
  const [useMockData, setUseMockData] = useState(false);
  
  // Convert mock parts to PartResponse format
  const mockPartsAsResponse = useMemo((): PartResponse[] => {
    return MOCK_PARTS.map((part: MockPart): PartResponse => ({
      id: part.id,
      name: part.name,
      brand: part.brand,
      category: part.category.toLowerCase(),
      price: part.price,
      sku: part.sku,
      imageUrls: part.imageUrl ? [part.imageUrl] : [],
      compatibilityProfiles: part.compatibility
        ? [
            {
              id: `${part.id}-comp`,
              partId: part.id,
              engineModel: part.compatibility.engineModels?.[0] || null,
              shaftDiameter: part.compatibility.shaftSize || null,
              boltPattern: null,
              chainSize: part.compatibility.chainSize || null,
              frameType: null,
              notes: null,
            },
          ]
        : [],
    }));
  }, []);

  // Update URL with current filters
  const updateURL = useCallback((filters: Record<string, string | number>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString());
      }
    });
    router.push(`/parts?${params.toString()}`, { scroll: false });
  }, [router]);

  // Filter mock parts based on current filters
  const filterMockParts = useCallback((parts: PartResponse[]): PartResponse[] => {
    let filtered = [...parts];
    
    // Search query
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }
    
    // Category
    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    
    // Brand
    if (brand) {
      filtered = filtered.filter((p) =>
        p.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    // Engine model
    if (engineModel) {
      filtered = filtered.filter((p) =>
        p.compatibilityProfiles.some(
          (cp) => cp.engineModel?.toLowerCase().includes(engineModel.toLowerCase())
        )
      );
    }
    
    // Chain size
    if (chainSize) {
      filtered = filtered.filter((p) =>
        p.compatibilityProfiles.some((cp) => cp.chainSize === chainSize)
      );
    }
    
    // Price range
    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) {
        filtered = filtered.filter((p) => p.price >= min);
      }
    }
    
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) {
        filtered = filtered.filter((p) => p.price <= max);
      }
    }
    
    return filtered;
  }, [q, category, brand, engineModel, chainSize, priceMin, priceMax]);
  
  // Load parts with current filters
  const loadParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        page_size: pageSize,
      };
      
      if (q) params.q = q;
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (engineModel) params.engine_model = engineModel;
      if (chainSize) params.chain_size = chainSize;
      if (priceMin) params.price_min = parseFloat(priceMin);
      if (priceMax) params.price_max = parseFloat(priceMax);
      
      try {
        const response = await partsAPI.getAll(params);
        setData(response);
        setUseMockData(false);
        
        // Update URL
        updateURL({
          ...params,
          page: response.page,
        });
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.warn('API request failed, using mock data:', apiError);
        const filtered = filterMockParts(mockPartsAsResponse);
        
        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginated = filtered.slice(startIndex, endIndex);
        
        setData({
          items: paginated,
          total: filtered.length,
          page,
          page_size: pageSize,
        });
        setUseMockData(true);
        
        // Update URL
        updateURL({
          ...params,
          page,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parts');
      // Try mock data as last resort
      const filtered = filterMockParts(mockPartsAsResponse);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginated = filtered.slice(startIndex, endIndex);
      
      setData({
        items: paginated,
        total: filtered.length,
        page,
        page_size: pageSize,
      });
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [q, category, brand, engineModel, chainSize, priceMin, priceMax, page, pageSize, updateURL, filterMockParts, mockPartsAsResponse]);

  // Initial load from URL params
  useEffect(() => {
    loadParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search effect for text inputs
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on filter change
      loadParts();
    }, 450);

    setDebounceTimer(timer);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, brand, engineModel, priceMin, priceMax]);

  // Immediate effect for dropdowns (category, chainSize)
  useEffect(() => {
    setPage(1);
    loadParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, chainSize]);

  // Load parts when page changes
  useEffect(() => {
    loadParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAddToBuild = (part: PartResponse) => {
    // Map part to build item shape
    const buildItem = {
      id: part.id,
      name: part.name,
      brand: part.brand,
      category: part.category,
      price: part.price,
    };
    
    // Add to build context
    addItem(buildItem);
    
    // Show feedback message
    setFeedbackMessage(`Added "${part.name}" to build`);
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3000);
    
    // Log for debugging
    console.log('Added to build:', buildItem);
  };

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setBrand('');
    setEngineModel('');
    setChainSize('');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="rounded-lg bg-gpp-bg-soft border border-gpp-border p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gpp-cream">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gpp-orange hover:text-gpp-orange-dark"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, brand, SKU..."
                    className="w-full px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream placeholder-gpp-text-muted focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Filter by brand..."
                    className="w-full px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream placeholder-gpp-text-muted focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                  />
                </div>

                {/* Engine Model */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Engine Model
                  </label>
                  <input
                    type="text"
                    value={engineModel}
                    onChange={(e) => setEngineModel(e.target.value)}
                    placeholder="Filter by engine model..."
                    className="w-full px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream placeholder-gpp-text-muted focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                  />
                </div>

                {/* Chain Size */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Chain Size
                  </label>
                  <select
                    value={chainSize}
                    onChange={(e) => setChainSize(e.target.value)}
                    className="w-full px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                  >
                    {CHAIN_SIZES.map(size => (
                      <option key={size} value={size}>
                        {size || 'All Chain Sizes'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gpp-cream mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream placeholder-gpp-text-muted focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                    />
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gpp-bg border border-gpp-border rounded-lg text-gpp-cream placeholder-gpp-text-muted focus:ring-2 focus:ring-gpp-orange focus:border-gpp-orange"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Parts List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gpp-cream">Parts Catalog</h1>
                {useMockData && (
                  <p className="text-sm text-gpp-warning mt-1">
                    Using mock data (API unavailable)
                  </p>
                )}
              </div>
              {data && (
                <p className="text-gpp-text-muted">
                  Showing {data.items.length} of {data.total} parts
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-gpp-error/20 border border-gpp-error rounded-lg text-gpp-cream">
                {error}
              </div>
            )}

            {feedbackMessage && (
              <div className="mb-4 p-4 bg-gpp-success/20 border border-gpp-success rounded-lg text-gpp-cream">
                {feedbackMessage}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gpp-text-muted">Loading parts...</p>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gpp-text-muted">No parts found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {data.items.map((part) => {
                    // Get first 1-2 engine models from compatibility profiles
                    const engineModels = part.compatibilityProfiles
                      .map(cp => cp.engineModel)
                      .filter(Boolean)
                      .slice(0, 2);

                    return (
                      <div key={part.id} className="rounded-lg bg-gpp-bg-soft border border-gpp-border overflow-hidden hover:border-gpp-orange transition-colors">
                        {/* Image */}
                        <div className="h-48 bg-gpp-bg flex items-center justify-center">
                          {part.imageUrls && part.imageUrls.length > 0 ? (
                            <img
                              src={part.imageUrls[0]}
                              alt={part.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gpp-text-muted text-sm">No Image</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gpp-cream mb-2">{part.name}</h3>
                          <p className="text-sm text-gpp-text-muted mb-1">
                            <span className="font-medium">Brand:</span> {part.brand}
                          </p>
                          <p className="text-sm text-gpp-text-muted mb-1">
                            <span className="font-medium">Category:</span> {part.category}
                          </p>
                          
                          {/* Compatibility snippet */}
                          {engineModels.length > 0 && (
                            <p className="text-xs text-gpp-text-muted mb-2">
                              Engine: {engineModels.join(', ')}
                            </p>
                          )}
                          
                          <p className="text-lg font-bold text-gpp-orange mb-4">
                            ${part.price.toFixed(2)}
                          </p>
                          
                          <button
                            onClick={() => handleAddToBuild(part)}
                            className="w-full inline-flex items-center justify-center rounded-md bg-gpp-orange px-4 py-2 text-sm font-semibold text-gpp-cream hover:bg-gpp-orange-dark transition-colors"
                          >
                            Add to Build
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!canGoPrevious}
                      className="px-4 py-2 bg-gpp-bg-soft border border-gpp-border rounded-lg text-gpp-cream hover:bg-gpp-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <span className="text-gpp-text-muted">
                      Page {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!canGoNext}
                      className="px-4 py-2 bg-gpp-bg-soft border border-gpp-border rounded-lg text-gpp-cream hover:bg-gpp-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
