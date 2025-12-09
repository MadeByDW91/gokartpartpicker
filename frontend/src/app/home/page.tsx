'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildsAPI } from '@/lib/api';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleStartNewBuild = async () => {
    const userName = prompt('Enter your name for this build:');
    if (!userName) return;

    try {
      setCreating(true);
      const build = await buildsAPI.create({ userName });
      router.push(`/build/${build.id}`);
    } catch (error) {
      alert('Failed to create build. Please try again.');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">GoKart Part Picker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/parts" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Parts
              </Link>
              <Link href="/builds" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Builds
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Build Your Perfect Go-Kart
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Find compatible parts and plan your build with confidence
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleStartNewBuild}
            disabled={creating}
            className="px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {creating ? 'Creating Build...' : 'Start New Build'}
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/parts" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Parts</h3>
            <p className="text-gray-600">
              Explore our catalog of go-kart parts with detailed compatibility information
            </p>
          </Link>

          <Link href="/builds" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Builds</h3>
            <p className="text-gray-600">
              View and manage your go-kart builds
            </p>
          </Link>

          <div className="block p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Compatibility Check</h3>
            <p className="text-gray-600">
              Ensure all parts work together with our compatibility system
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

