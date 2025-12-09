'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentBuildId, setCurrentBuildId } from '@/utils/buildClient';
import { buildsAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [currentBuildId, setCurrentBuildIdState] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setCurrentBuildIdState(getCurrentBuildId());
  }, []);

  const handleViewBuild = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (currentBuildId) {
      router.push(`/build/${currentBuildId}`);
    } else {
      // Create a new build if none exists
      try {
        setCreating(true);
        const build = await buildsAPI.create({ userName: 'guest' });
        setCurrentBuildId(build.id);
        setCurrentBuildIdState(build.id);
        router.push(`/build/${build.id}`);
      } catch (error) {
        alert('Failed to create build. Please try again.');
        console.error(error);
      } finally {
        setCreating(false);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gpp-cream mb-6">
          Plan your go-kart build with confidence
        </h1>
        <p className="text-xl text-gpp-text-muted max-w-3xl mx-auto mb-8">
          Browse engines, torque converters, chains, sprockets, and more. Build a parts list that actually fits together.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/parts"
            className="inline-flex items-center justify-center rounded-md bg-gpp-orange px-4 py-2 text-sm font-semibold text-gpp-cream hover:bg-gpp-orange-dark transition-colors shadow-lg hover:shadow-xl"
          >
            Browse Parts
          </Link>
          <button
            onClick={handleViewBuild}
            disabled={creating}
            className="inline-flex items-center justify-center rounded-md bg-gpp-bg-soft border border-gpp-border px-4 py-2 text-sm font-semibold text-gpp-cream hover:bg-gpp-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating Build...' : 'View Your Build'}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-gpp-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gpp-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gpp-cream mb-2">Find compatible parts</h3>
            <p className="text-gpp-text-muted">
              Search our catalog with advanced filters to find parts that work together perfectly.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gpp-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gpp-cream mb-2">Compare options</h3>
            <p className="text-gpp-text-muted">
              View detailed specifications and compatibility profiles to make informed decisions.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gpp-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gpp-cream mb-2">Save your build</h3>
            <p className="text-gpp-text-muted">
              Keep track of your selected parts and build a complete go-kart configuration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
