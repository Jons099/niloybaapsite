'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function AboutPage() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.2 })
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.2 })
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.2 })

  const values = [
    {
      title: 'Quality Craftsmanship',
      description: 'Every piece is meticulously crafted by skilled artisans using time-honored techniques.'
    },
    {
      title: 'Sustainable Fashion',
      description: 'We are committed to ethical practices and sustainable materials that respect our planet.'
    },
    {
      title: 'Timeless Design',
      description: 'Our designs transcend seasonal trends, creating pieces that become cherished wardrobe staples.'
    },
    {
      title: 'Customer First',
      description: 'Your satisfaction is our priority, with personalized service and attention to every detail.'
    }
  ]

  return (
    <main className="min-h-screen bg-luxury-pearl">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative container mx-auto px-4 text-center text-white">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-subtitle text-luxury-gold"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif mb-4"
          >
            About Luxe Attire
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Crafting timeless elegance since 1985
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white" ref={ref1}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <span className="section-subtitle">Our Heritage</span>
              <h2 className="text-4xl font-serif mt-2 mb-6">A Legacy of Excellence</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 1985, Luxe Attire began as a small boutique with a big dream: 
                  to bring exceptional quality and timeless design to women who appreciate 
                  the finer things in life.
                </p>
                <p>
                  Over the decades, we've grown into a beloved brand known for our 
                  commitment to craftsmanship, attention to detail, and unwavering 
                  dedication to our customers.
                </p>
                <p>
                  Today, we continue to honor our heritage while embracing innovation, 
                  creating pieces that honor tradition while looking toward the future.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] rounded-lg overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071')" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-luxury-cream" ref={ref2}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <span className="section-subtitle">What We Stand For</span>
            <h2 className="text-4xl font-serif mt-2 mb-4">Our Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm text-center"
              >
                <h3 className="text-xl font-serif mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-20 bg-white" ref={ref3}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView3 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] rounded-lg overflow-hidden order-2 lg:order-1"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532453288672-3a27e9be6ef5?q=80&w=1964')" }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView3 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <span className="section-subtitle">Artisanal Excellence</span>
              <h2 className="text-4xl font-serif mt-2 mb-6">The Art of Craftsmanship</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Every Luxe Attire piece is a testament to the skill and dedication 
                  of our master artisans. From the initial sketch to the final stitch, 
                  each garment undergoes rigorous quality checks.
                </p>
                <p>
                  We source the finest fabrics from around the world and work with 
                  skilled craftspeople who bring generations of expertise to their work.
                </p>
                <p>
                  This commitment to quality ensures that every piece you purchase 
                  will be treasured for years to come.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}