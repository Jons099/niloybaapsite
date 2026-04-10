'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Thank you for subscribing!')
    setEmail('')
  }

  return (
    <section className="py-20 bg-luxury-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-luxury-gold text-sm uppercase tracking-wider">
            Stay Connected
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mt-2 mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8">
            Subscribe to receive updates on new collections, exclusive offers, 
            and styling inspiration.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-luxury-gold"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-luxury-charcoal text-white rounded-full hover:bg-luxury-gold transition-colors duration-300"
            >
              Subscribe
            </motion.button>
          </form>
          
          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>
        </motion.div>
      </div>
    </section>
  )
}