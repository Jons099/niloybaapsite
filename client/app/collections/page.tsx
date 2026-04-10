'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const collections = [
  {
    id: 1,
    name: 'Traditional Elegance',
    description: 'Timeless pieces that celebrate heritage craftsmanship',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1887',
    category: 'traditional',
    featured: true
  },
  {
    id: 2,
    name: 'Modern Muse',
    description: 'Contemporary designs for the confident woman',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1887',
    category: 'modern',
    featured: true
  },
  {
    id: 3,
    name: 'Classic Icons',
    description: 'Elegant essentials that transcend trends',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983',
    category: 'classic',
    featured: true
  },
  {
    id: 4,
    name: 'Fusion Favorites',
    description: 'Where East meets West in perfect harmony',
    image: 'https://images.unsplash.com/photo-1610030469668-8e0d5e9e4c9b?q=80&w=1974',
    category: 'fusion',
    featured: false
  },
  {
    id: 5,
    name: 'Ethnic Wear',
    description: 'Celebrating the rich tapestry of Indian textiles',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1887',
    category: 'ethnic_wear',
    featured: false
  },
  {
    id: 6,
    name: 'Formal Finery',
    description: 'Sophisticated pieces for special occasions',
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1887',
    category: 'formal',
    featured: false
  }
]

export default function CollectionsPage() {
  const featuredCollections = collections.filter(c => c.featured)
  const otherCollections = collections.filter(c => !c.featured)

  return (
    <main className="min-h-screen bg-luxury-pearl pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="section-subtitle">Explore Our</span>
          <h1 className="section-title">Collections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each collection tells a unique story, crafted with passion and attention to detail.
            Discover the perfect pieces to express your individual style.
          </p>
        </motion.div>

        {/* Featured Collections */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif text-center mb-8">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/shop?category=${collection.category}`}>
                  <div className="group relative h-[500px] overflow-hidden rounded-lg">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url('${collection.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl font-serif mb-2">{collection.name}</h3>
                      <p className="text-white/80 mb-4">{collection.description}</p>
                      <span className="inline-block border-b-2 border-luxury-gold pb-1">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Collections */}
        <section>
          <h2 className="text-3xl font-serif text-center mb-8">All Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/shop?category=${collection.category}`}>
                  <div className="group relative h-80 overflow-hidden rounded-lg">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url('${collection.image}')` }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                      <h3 className="text-2xl font-serif mb-2">{collection.name}</h3>
                      <p className="text-white/80 text-sm">{collection.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}