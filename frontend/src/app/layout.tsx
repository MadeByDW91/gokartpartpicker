import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

