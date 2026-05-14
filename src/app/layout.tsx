import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mr Driving - Open World Car Driving Game',
  description: 'Browser-based 3D open world car driving game built with React Three Fiber and Rapier physics',
  openGraph: {
    url: "https://mr-driving.vercel.app/",
    siteName: "Mr Driving - Open World Car Driving Game",
    title: 'Mr Driving - Open World Car Driving Game',
    description: 'Browser-based 3D open world car driving game built with React Three Fiber and Rapier physics',
  },
  twitter: {
    title: 'Mr Driving - Open World Car Driving Game',
    description: 'Browser-based 3D open world car driving game built with React Three Fiber and Rapier physics',
    card: 'summary_large_image',
    creator: '@v1vekupasani'
  },
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
