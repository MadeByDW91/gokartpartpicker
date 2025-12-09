'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <nav className="bg-gpp-bg-soft border-b border-gpp-border shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/branding/logo.png"
              alt="GoKartPartPicker logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-gpp-cream/80 hover:text-gpp-cream px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/parts" 
              className="text-gpp-cream/80 hover:text-gpp-cream px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Parts
            </Link>
            <Link
              href="/build"
              className="text-gpp-cream/80 hover:text-gpp-cream px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Your Build
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
