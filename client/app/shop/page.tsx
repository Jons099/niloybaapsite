'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: string
  selling_price: number
  images: Array<{ url: string; is_primary: boolean }>
  inventory: Array<{ size: string; stock: number }>
  total_stock: number
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')
  const addItem = useCartStore((state) => state.addItem)

  const categories = ['All', 'Traditional', 'Modern', 'Classic', 'Fusion', 'Ethnic Wear', 'Formal', 'Casual']

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, priceRange, sortBy, searchParams])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products')
      const data = await response.json()
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query
    const search = searchParams.get('search')
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => p.selling_price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.selling_price <= parseFloat(priceRange.max))
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.selling_price - b.selling_price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.selling_price - a.selling_price)
        break
      case 'newest':
      default:
        // Assuming newer products have higher IDs or created_at
        filtered.sort((a, b) => b.id.localeCompare(a.id))
        break
    }

    setFilteredProducts(filtered)
  }

  const handleQuickAdd = (product: Product) => {
    const availableSize = product.inventory?.find(s => s.stock > 0)
    if (availableSize) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: 1,
        size: availableSize.size,
        image: product.images?.[0]?.url || '',
        slug: product.slug
      })
      toast.success('Added to cart')
    } else {
      toast.error('Out of stock')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-luxury-gold border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-pearl pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="section-subtitle">Curated Collection</span>
          <h1 className="section-title">Shop All Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of premium women's clothing, 
            each piece crafted with exceptional attention to detail.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-serif text-xl mb-4">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2 text-luxury-gold focus:ring-luxury-gold"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing {filteredProducts.length} products
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                    >
                      <Link href={`/product/${product.slug}`}>
                        <div className="relative aspect-[3/4] bg-gray-100">
                          {product.images?.[0]?.url ? (
                            <img
                              src={`http://localhost:5000${product.images[0].url}`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          
                          {/* Quick Add Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleQuickAdd(product)
                            }}
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full group-hover:translate-y-0 bg-white text-luxury-charcoal px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hover:bg-luxury-gold hover:text-white shadow-lg text-sm"
                          >
                            <ShoppingBagIcon className="h-4 w-4" />
                            Quick Add
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-serif text-lg mb-1 group-hover:text-luxury-gold transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xl font-semibold text-luxury-charcoal">
                            ₹{product.selling_price?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {product.category}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}