'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { partsAPI } from '@/lib/api';
import type { PartResponse } from '@gokartpartpicker/shared';

export default function PartDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [part, setPart] = useState<PartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPart();
    }
  }, [id]);

  const loadPart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partsAPI.getById(id);
      setPart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load part');
    } finally {
      setLoading(false);
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
              <Link href="/parts" className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Parts
              </Link>
              <Link href="/builds" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Builds
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/parts" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Parts
        </Link>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading part details...</p>
          </div>
        ) : part ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{part.name}</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="text-lg font-semibold">{part.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Part Number</p>
                <p className="text-lg font-semibold">{part.partNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold">{part.category}</p>
              </div>
              {part.price && (
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-bold text-primary-600">${part.price.toFixed(2)}</p>
                </div>
              )}
            </div>

            {part.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900">{part.description}</p>
              </div>
            )}

            {part.compatibilityProfiles.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Compatibility Profiles</h2>
                <div className="space-y-4">
                  {part.compatibilityProfiles.map((profile) => (
                    <div key={profile.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Profile #{profile.id.slice(0, 8)}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(profile.attributes).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-sm text-gray-600">{key}:</span>{' '}
                            <span className="text-sm font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

