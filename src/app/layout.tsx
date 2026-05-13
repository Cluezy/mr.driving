import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VELOCITY — Open World Racing',
  description: 'Browser-based 3D open world car driving game built with React Three Fiber and Rapier physics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden bg-black`}>
        {children}
      </body>
    </html>
  )
}
