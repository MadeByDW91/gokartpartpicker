'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { buildsAPI, buildItemsAPI, partsAPI } from '@/lib/api';
import type { BuildResponse, PartResponse, CreateBuildItemRequest } from '@gokartpartpicker/shared';
import { SLOT_CATEGORIES } from '@gokartpartpicker/shared';

export default function BuildDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [build, setBuild] = useState<BuildResponse | null>(null);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPart, setShowAddPart] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedSlotCategory, setSelectedSlotCategory] = useState<string>('engine');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadBuild();
      loadParts();
    }
  }, [id]);

  const loadBuild = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buildsAPI.getById(id);
      setBuild(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load build');
    } finally {
      setLoading(false);
    }
  };

  const loadParts = async () => {
    try {
      const data = await partsAPI.getAll();
      setParts(data);
    } catch (err) {
      console.error('Failed to load parts:', err);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !build) return;

    try {
      const data: CreateBuildItemRequest = {
        buildId: build.id,
        partId: selectedPartId,
        slotCategory: selectedSlotCategory as any,
        quantity,
      };
      await buildItemsAPI.create(data);
      setShowAddPart(false);
      setSelectedPartId('');
      setQuantity(1);
      loadBuild();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add part');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this part from the build?')) return;

    try {
      await buildItemsAPI.delete(itemId);
      loadBuild();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove part');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                GoKart Part Picker
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/parts" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Parts
              </Link>
              <Link href="/builds" className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Builds
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/builds" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Builds
        </Link>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading build...</p>
          </div>
        ) : build ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{build.name}</h1>
              {build.description && (
                <p className="text-gray-600 mb-4">{build.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {build.items.length} part(s) • Created {new Date(build.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Parts</h2>
                <button
                  onClick={() => setShowAddPart(!showAddPart)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {showAddPart ? 'Cancel' : '+ Add Part'}
                </button>
              </div>

              {showAddPart && (
                <form onSubmit={handleAddPart} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part
                      </label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select a part</option>
                        {parts.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.name} - {part.manufacturer}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slot Category
                      </label>
                      <select
                        value={selectedSlotCategory}
                        onChange={(e) => setSelectedSlotCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        {SLOT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add to Build
                  </button>
                </form>
              )}

              {build.items.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No parts in this build yet.</p>
              ) : (
                <div className="space-y-4">
                  {build.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.part.name}</h3>
                        <p className="text-sm text-gray-600">{item.part.manufacturer} - {item.part.partNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Slot: <span className="font-medium">{item.slotCategory}</span> • 
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                        {item.part.price && (
                          <p className="text-sm text-primary-600 font-medium mt-1">
                            ${(item.part.price * item.quantity).toFixed(2)} total
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

