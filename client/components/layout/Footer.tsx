import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-luxury-charcoal text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-4">LUXE ATTIRE</h3>
            <p className="text-gray-400 text-sm">
              Premium women's clothing where tradition meets contemporary style.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/shop" className="hover:text-luxury-gold transition-colors">Shop</Link></li>
              <li><Link href="/collections" className="hover:text-luxury-gold transition-colors">Collections</Link></li>
              <li><Link href="/about" className="hover:text-luxury-gold transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/contact" className="hover:text-luxury-gold transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-luxury-gold transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-luxury-gold transition-colors">Returns Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-luxury-gold transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-luxury-gold transition-colors">Facebook</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Shanto | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}