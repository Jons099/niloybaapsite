import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    selling_price: number;
    images: Array<{ url: string; is_primary: boolean }>;
    category: string;
    inventory?: Array<{ size: string; stock: number }>;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                      product.images?.[0]?.url || 
                      '/images/placeholder.jpg';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.inventory && product.inventory.length > 0) {
      const availableSize = product.inventory.find(s => s.stock > 0);
      if (availableSize) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.selling_price,
          quantity: 1,
          size: availableSize.size,
          image: primaryImage
        });
        toast.success('Added to cart');
      } else {
        toast.error('Out of stock');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Quick add button */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-luxury-gold hover:text-white"
          >
            <ShoppingBagIcon className="h-5 w-5" />
          </button>

          {/* Category tag */}
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider rounded-full">
            {product.category}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-serif text-lg mb-1 group-hover:text-luxury-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-xl font-semibold text-luxury-charcoal">
            ₹{product.selling_price.toLocaleString('en-IN')}
          </p>
          
          {/* Size indicators */}
          {product.inventory && (
            <div className="mt-2 flex gap-1">
              {product.inventory.map((inv) => (
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
      </Link>
    </motion.div>
  );
};

export default ProductCard;