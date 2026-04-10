'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  selling_price: number
  category: string
  images: Array<{ url: string; is_primary: boolean }>
  inventory: Array<{ size: string; stock: number }>
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products?limit=4')
      if (response.data.products) {
        setProducts(response.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Set empty array if API fails
      setProducts([])
    } finally {
      setLoading(false)
    }
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-luxury-gold border-r-transparent"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-luxury-gold text-sm uppercase tracking-wider">
            Curated Selection
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mt-2 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most sought-after pieces, each selected for its exceptional 
            quality and timeless appeal.
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">Make sure the backend server is running on port 5000</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  {product.images?.[0]?.url ? (
                    <img
                      src={`http://localhost:5000${product.images[0].url}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Quick Add Button */}
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full group-hover:translate-y-0 bg-white text-luxury-charcoal px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hover:bg-luxury-gold hover:text-white shadow-lg"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    Quick Add
                  </button>
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <div className="mt-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-serif text-lg mb-1 hover:text-luxury-gold transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xl font-semibold text-luxury-charcoal">
                    ₹{product.selling_price?.toLocaleString('en-IN')}
                  </p>
                  
                  {/* Size Indicators */}
                  {product.inventory && (
                    <div className="mt-2 flex gap-1">
                      {product.inventory.slice(0, 4).map((inv) => (
                        <span
                          key={inv.size}
                          className={`text-xs px-2 py-1 rounded ${
                            inv.stock > 0 
                              ? 'bg-gray-100 text-gray-700' 
                              : 'bg-gray-50 text-gray-300 line-through'
                          }`}
                        >
                          {inv.size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/shop"
            className="inline-block px-8 py-3 border-2 border-luxury-charcoal text-luxury-charcoal rounded-full hover:bg-luxury-charcoal hover:text-white transition-colors duration-300"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}