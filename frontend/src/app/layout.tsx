import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { BuildProvider } from '@/context/BuildContext'
import { BuildConfigProvider } from '@/context/BuildConfigContext'

export const metadata: Metadata = {
  title: 'GoKart Part Picker',
  description: 'Parts compatibility and build planning software for go-kart builders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <BuildConfigProvider>
          <BuildProvider>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </BuildProvider>
        </BuildConfigProvider>
      </body>
    </html>
  )
}
