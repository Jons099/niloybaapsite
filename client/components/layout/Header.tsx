'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBagIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  
  const { items, toggleCart } = useCartStore()
  const { user } = useAuthStore()
  
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '/about' },
]

if (user?.role === 'admin') {
  navigation.push({ name: 'Admin', href: '/admin' })
}

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-luxury-charcoal text-white text-xs md:text-sm py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="tracking-wider">
              ✦ Free Shipping on orders over ₹1000 ✦ Easy 7-Day Returns ✦
            </p>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 hover:text-luxury-gold transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-luxury-charcoal"
            >
              LUXE ATTIRE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm uppercase tracking-wider transition-colors ${
                    pathname === item.href 
                      ? 'text-luxury-gold border-b-2 border-luxury-gold' 
                      : 'text-gray-700 hover:text-luxury-gold'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-1 md:space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:text-luxury-gold transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-luxury-gold transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-luxury-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              <Link
                href={user ? '/account' : '/login'}
                className="p-2 text-gray-700 hover:text-luxury-gold transition-colors"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="input-field"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-luxury-gold"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 lg:hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-serif text-luxury-charcoal">LUXE ATTIRE</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:text-luxury-gold"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-lg py-2 border-b border-gray-100 text-gray-700 hover:text-luxury-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CartDrawer />
      
      {/* Spacer for fixed header */}
      <div className="h-[88px]" />
    </>
  )
}