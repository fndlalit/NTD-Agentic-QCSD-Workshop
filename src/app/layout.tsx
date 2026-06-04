import type { Metadata } from 'next'
import { CartProvider } from '@/src/context/CartContext'
import { Header } from '@/src/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Commerce Checkout Demo',
  description: 'A modern e-commerce checkout experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500 mt-12">
            <p>&copy; 2026 E-Commerce Demo. All rights reserved.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
