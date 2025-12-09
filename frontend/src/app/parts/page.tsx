'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { partsAPI, buildsAPI } from '@/lib/api';
import { getCurrentBuildId, setCurrentBuildId } from '@/utils/buildClient';
import Header from '@/components/Header';
import type { PartResponse } from '@gokartpartpicker/shared';

// Static category list (should match backend)
const CATEGORIES = [
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
  
  // Build selection
  const [addingToBuild, setAddingToBuild] = useState<string | null>(null);

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
      
      const response = await partsAPI.getAll(params);
      setData(response);
      
      // Update URL
      updateURL({
        ...params,
        page: response.page,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parts');
    } finally {
      setLoading(false);
    }
  }, [q, category, brand, engineModel, chainSize, priceMin, priceMax, page, pageSize, updateURL]);

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

  const handleAddToBuild = async (partId: string) => {
    try {
      // Get current build ID or create a new one
      let buildId = getCurrentBuildId();
      
      if (!buildId) {
        // Create a new build automatically
        const build = await buildsAPI.create({ userName: 'guest' });
        buildId = build.id;
        setCurrentBuildId(buildId);
      }
      
      await addPartToBuild(buildId, partId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create build or add part');
    }
  };

  const addPartToBuild = async (buildId: string, partId: string) => {
    try {
      setAddingToBuild(partId);
      
      // Determine slot category based on part category
      const part = data?.items.find(p => p.id === partId);
      const defaultSlotCategory = part?.category?.toUpperCase() || 'OTHER';
      
      // Use a simple default slot category (can be enhanced later)
      const slotCategoryMap: Record<string, string> = {
        'engine': 'ENGINE',
        'clutch': 'DRIVE',
        'sprocket': 'DRIVE',
        'chain': 'DRIVE',
        'tire': 'WHEEL',
        'wheel': 'WHEEL',
        'brake': 'BRAKE',
        'frame': 'FRAME',
        'seat': 'SEAT',
        'steering': 'STEERING',
      };
      
      const slotCategory = slotCategoryMap[part?.category?.toLowerCase() || ''] || 'OTHER';
      
      await buildsAPI.addPart(buildId, {
        partId,
        slotCategory,
        quantity: 1,
      });
      
      alert('Part added to build!');
      router.push(`/build/${buildId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add part to build');
    } finally {
      setAddingToBuild(null);
    }
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, brand, SKU..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Filter by brand..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Engine Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Model
                  </label>
                  <input
                    type="text"
                    value={engineModel}
                    onChange={(e) => setEngineModel(e.target.value)}
                    placeholder="Filter by engine model..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Chain Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chain Size
                  </label>
                  <select
                    value={chainSize}
                    onChange={(e) => setChainSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Parts List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Parts Catalog</h1>
              {data && (
                <p className="text-gray-600">
                  Showing {data.items.length} of {data.total} parts
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading parts...</p>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No parts found. Try adjusting your filters.</p>
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
                      <div key={part.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Image */}
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          {part.imageUrls && part.imageUrls.length > 0 ? (
                            <img
                              src={part.imageUrls[0]}
                              alt={part.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">No Image</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{part.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Brand:</span> {part.brand}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Category:</span> {part.category}
                          </p>
                          
                          {/* Compatibility snippet */}
                          {engineModels.length > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                              Engine: {engineModels.join(', ')}
                            </p>
                          )}
                          
                          <p className="text-lg font-bold text-primary-600 mb-4">
                            ${part.price.toFixed(2)}
                          </p>
                          
                          <button
                            onClick={() => handleAddToBuild(part.id)}
                            disabled={addingToBuild === part.id}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToBuild === part.id ? 'Adding...' : 'Add to Build'}
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
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!canGoNext}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
