'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildsAPI } from '@/lib/api';
import { getCurrentBuildId, setCurrentBuildId } from '@/utils/buildClient';

export default function Header() {
  const router = useRouter();
  const [currentBuildId, setCurrentBuildIdState] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Load current build ID from localStorage
    setCurrentBuildIdState(getCurrentBuildId());
    
    // Listen for storage changes (in case another tab updates it)
    const handleStorageChange = () => {
      setCurrentBuildIdState(getCurrentBuildId());
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleYourBuildClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (currentBuildId) {
      // Navigate to existing build
      router.push(`/build/${currentBuildId}`);
    } else {
      // Create a new build
      try {
        setCreating(true);
        const buildName = prompt('Enter a name for your build (or leave blank for default):') || 'My Go-Kart Build';
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
            <button
              onClick={handleYourBuildClick}
              disabled={creating}
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : currentBuildId ? 'Your Build' : 'Your Build (New)'}
            </button>
            <Link href="/builds" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              All Builds
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

