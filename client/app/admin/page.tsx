'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: string
  selling_price: number
  cost_price: number
  sku: string
  total_stock: number
  images: Array<{ image_url: string; is_primary: boolean }>
  inventory: Array<{ size: string; stock: number }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, token, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [imageType, setImageType] = useState<'url' | 'upload'>('url')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'traditional',
    sellingPrice: '',
    costPrice: '',
    sku: '',
    imageUrl: '',
    sizes: [{ size: 'M', stock: 10 }],
    isFeatured: true
  })

  const apiUrl = 'https://niloybaapsite.onrender.com/api'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== 'admin' && user?.role !== 'manager') {
      router.push('/')
    } else {
      fetchProducts()
    }
  }, [isAuthenticated, user])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${apiUrl}/products`)
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSKU = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    setFormData({ ...formData, sku: `${prefix}-${random}` })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice),
        sku: formData.sku,
        sizes: formData.sizes,
        isFeatured: formData.isFeatured,
        imageUrl: formData.imageUrl || null
      }
      
      console.log('Sending product data:', productData)
      
      const response = await axios.post(
        `${apiUrl}/products`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        toast.success('Product added successfully!')
        setShowAddModal(false)
        fetchProducts()
        resetForm()
      }
    } catch (error: any) {
      console.error('Failed to add product:', error)
      const errorMsg = error.response?.data?.message || 'Failed to add product'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'traditional',
      sellingPrice: '',
      costPrice: '',
      sku: '',
      imageUrl: '',
      sizes: [{ size: 'M', stock: 10 }],
      isFeatured: true
    })
    setImageType('url')
  }

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: 'M', stock: 10 }]
    })
  }

  const updateSize = (index: number, field: string, value: string | number) => {
    const newSizes = [...formData.sizes]
    newSizes[index] = { ...newSizes[index], [field]: field === 'stock' ? parseInt(value as string) || 0 : value }
    setFormData({ ...formData, sizes: newSizes })
  }

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index)
    setFormData({ ...formData, sizes: newSizes })
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const categories = [
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'fusion', label: 'Fusion' },
    { value: 'ethnic_wear', label: 'Ethnic Wear' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' }
  ]

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name} ({user?.role})</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="border-b px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === 'products' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-500'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === 'orders' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-500'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif">Products ({products.length})</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-luxury-gold text-white px-6 py-2 rounded-full hover:bg-luxury-charcoal transition-colors"
                  >
                    + Add New Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {product.images?.[0]?.image_url ? (
                          <img 
                            src={product.images[0].image_url.startsWith('http') ? product.images[0].image_url : `${apiUrl.replace('/api', '')}${product.images[0].image_url}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-semibold">₹{product.selling_price}</span>
                        <span className="text-sm text-gray-500">Stock: {product.total_stock || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">Add New Product</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input type="text" required value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold" />
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="flex gap-4 mb-3">
                    <button type="button" onClick={() => setImageType('url')}
                      className={`px-4 py-2 rounded-lg ${imageType === 'url' ? 'bg-luxury-gold text-white' : 'bg-gray-100'}`}>
                      Image URL
                    </button>
                    <button type="button" onClick={() => setImageType('upload')}
                      className={`px-4 py-2 rounded-lg ${imageType === 'upload' ? 'bg-luxury-gold text-white' : 'bg-gray-100'}`}>
                      Upload (Coming Soon)
                    </button>
                  </div>
                  {imageType === 'url' && (
                    <div>
                      <input type="text" placeholder="Paste image URL (Unsplash, etc.)"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold" />
                      <p className="text-xs text-gray-500 mt-1">Use Unsplash: https://images.unsplash.com/...</p>
                    </div>
                  )}
                  {imageType === 'upload' && (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500">
                      File upload coming soon
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea rows={3} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold" />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select required value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold">
                      {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU (Product Code) *</label>
                    <div className="flex gap-2">
                      <input type="text" required value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                        placeholder="e.g., SAR-001" />
                      <button type="button" onClick={generateSKU}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Generate</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Stock Keeping Unit - Unique product code</p>
                  </div>
                </div>

                {/* Selling Price & Cost Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Selling Price (BDT ৳) *</label>
                    <input type="number" required step="0.01" min="0" value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold" />
                    <p className="text-xs text-gray-500 mt-1">Price customers will pay</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost Price (BDT ৳) *</label>
                    <input type="number" required step="0.01" min="0" value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold" />
                    <p className="text-xs text-gray-500 mt-1">Your purchase/production cost</p>
                  </div>
                </div>

                {/* Sizes & Stock */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sizes & Stock *</label>
                  {formData.sizes.map((sizeObj, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select value={sizeObj.size}
                        onChange={(e) => updateSize(index, 'size', e.target.value)}
                        className="w-24 px-3 py-2 border rounded-lg">
                        {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="number" placeholder="Stock Qty" min="0"
                        value={sizeObj.stock}
                        onChange={(e) => updateSize(index, 'stock', e.target.value)}
                        className="w-32 px-4 py-2 border rounded-lg" />
                      {formData.sizes.length > 1 && (
                        <button type="button" onClick={() => removeSize(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addSize}
                    className="text-luxury-gold hover:underline text-sm">+ Add Another Size</button>
                </div>

                {/* Featured Checkbox */}
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mr-2 w-4 h-4 text-luxury-gold" />
                    <span>Feature this product on homepage</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-luxury-gold text-white py-3 rounded-full hover:bg-luxury-charcoal transition-colors disabled:opacity-50">
                    {loading ? 'Adding Product...' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border rounded-full hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}