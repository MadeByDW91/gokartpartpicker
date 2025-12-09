'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildsAPI } from '@/lib/api';
import type { BuildResponse } from '@gokartpartpicker/shared';

export default function BuildsPage() {
  const [builds, setBuilds] = useState<BuildResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buildsAPI.getAll();
      setBuilds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load builds');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    try {
      await buildsAPI.delete(id);
      loadBuilds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete build');
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Builds</h1>
          <Link
            href="/builds/new"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + New Build
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading builds...</p>
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No builds yet. Create your first build!</p>
            <Link
              href="/builds/new"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Build
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <div key={build.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{build.name}</h3>
                {build.description && (
                  <p className="text-sm text-gray-600 mb-4">{build.description}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  {build.items.length} part(s) in build
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/builds/${build.id}`}
                    className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(build.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

