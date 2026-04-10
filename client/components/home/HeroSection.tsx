'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative h-screen max-h-[900px] min-h-[700px] -mt-[88px]">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-charcoal via-luxury-burgundy to-luxury-charcoal">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-luxury-gold text-sm md:text-base uppercase tracking-[.3em] mb-4 block"
            >
              New Collection 2024
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight"
            >
              Timeless <br />
              <span className="text-luxury-gold">Elegance</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-xl"
            >
              Discover our curated collection of premium women's clothing, 
              where tradition meets contemporary style.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/shop"
                className="px-8 py-4 bg-luxury-gold text-white rounded-full text-center hover:bg-white hover:text-luxury-charcoal transition-all duration-300"
              >
                Shop Collection
              </Link>
              
              <Link
                href="/products"
                className="px-8 py-4 border-2 border-white text-white rounded-full text-center hover:bg-white hover:text-luxury-charcoal transition-all duration-300"
              >
                View Products
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  )
}