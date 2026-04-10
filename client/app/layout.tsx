import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'Luxe Attire - Premium Women\'s Fashion',
  description: 'Discover timeless elegance with our curated collection of premium women\'s clothing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} ${montserrat.variable}`}>
        <Header />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}