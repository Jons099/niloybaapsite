import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen max-h-[800px] min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-banner.jpg"
          alt="Luxury Fashion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4">
              Timeless Elegance
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover our curated collection of premium women's clothing, 
              where tradition meets contemporary style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="bg-white text-luxury-charcoal px-8 py-3 rounded-full text-center hover:bg-luxury-gold hover:text-white transition-colors duration-300"
              >
                Shop Collection
              </Link>
              <Link
                href="/collections/new-arrivals"
                className="border-2 border-white text-white px-8 py-3 rounded-full text-center hover:bg-white hover:text-luxury-charcoal transition-colors duration-300"
              >
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;