import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const categories = [
  {
    id: 1,
    name: 'Traditional',
    image: '/images/categories/traditional.jpg',
    description: 'Timeless classics with intricate craftsmanship',
    href: '/shop?category=traditional'
  },
  {
    id: 2,
    name: 'Modern',
    image: '/images/categories/modern.jpg',
    description: 'Contemporary designs for the modern woman',
    href: '/shop?category=modern'
  },
  {
    id: 3,
    name: 'Classic',
    image: '/images/categories/classic.jpg',
    description: 'Elegant pieces that never go out of style',
    href: '/shop?category=classic'
  }
];

const FeaturedCategories: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-20 bg-luxury-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated collections, each piece selected for its 
            exceptional quality and timeless appeal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link href={category.href} className="group block">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-3xl font-serif mb-2">{category.name}</h3>
                    <p className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;