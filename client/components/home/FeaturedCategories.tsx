'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const categories = [
  {
    name: 'Traditional',
    description: 'Timeless classics with intricate craftsmanship',
    href: '/shop?category=traditional',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1887',
    color: 'from-amber-900'
  },
  {
    name: 'Modern',
    description: 'Contemporary designs for the modern woman',
    href: '/shop?category=modern',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1887',
    color: 'from-rose-900'
  },
  {
    name: 'Classic',
    description: 'Elegant pieces that never go out of style',
    href: '/shop?category=classic',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983',
    color: 'from-indigo-900'
  }
]

export default function FeaturedCategories() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="py-20 bg-luxury-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-luxury-gold text-sm uppercase tracking-wider">
            Explore Our
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mt-2 mb-4">
            Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each piece in our collection is carefully selected for its exceptional 
            quality and timeless appeal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link href={category.href} className="group block">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url('${category.image}')` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color}/60 to-transparent`} />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-3xl font-serif mb-2">{category.name}</h3>
                    <p className="text-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {category.description}
                    </p>
                    <span className="mt-4 inline-block border-b-2 border-transparent group-hover:border-luxury-gold transition-colors">
                      Explore Collection →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}