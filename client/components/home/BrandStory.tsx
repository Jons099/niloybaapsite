'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function BrandStory() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  return (
    <section className="py-20 bg-luxury-charcoal text-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-luxury-gold text-sm uppercase tracking-wider">
              Our Heritage
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mt-2 mb-6">
              Crafting Elegance Since 1985
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                At Luxe Attire, we believe that true elegance lies in the perfect 
                harmony of tradition and innovation. For nearly four decades, we've 
                been dedicated to creating exceptional pieces that celebrate the 
                timeless beauty of women's fashion.
              </p>
              <p>
                Each garment in our collection is meticulously crafted by skilled 
                artisans who bring generations of expertise to every stitch. From 
                selecting the finest fabrics to ensuring impeccable finishing, 
                quality is at the heart of everything we do.
              </p>
              <p>
                Our commitment to sustainable and ethical fashion means we work 
                directly with artisan communities, preserving traditional crafts 
                while providing fair wages and safe working conditions.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-8 py-3 bg-transparent border-2 border-luxury-gold text-luxury-gold rounded-full hover:bg-luxury-gold hover:text-luxury-charcoal transition-colors duration-300"
            >
              Learn More About Us
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-lg overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071')" }}
            />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}