'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'traditional',
    sellingPrice: '',
    costPrice: '',
    sku: '',
    sizes: [{ size: 'M', quantity: 10 }],
    isFeatured: true
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
    } else {
      fetchProducts()
    }
  }, [isAuthenticated, user])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(response.data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success('Product added successfully!')
      setShowAddModal(false)
      fetchProducts()
      resetForm()
    } catch (error) {
      toast.error('Failed to add product')
      console.error(error)
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
      sizes: [{ size: 'M', quantity: 10 }],
      isFeatured: true
    })
  }

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: 'M', quantity: 10 }]
    })
  }

  const updateSize = (index: number, field: string, value: string | number) => {
    const newSizes = [...formData.sizes]
    newSizes[index] = { ...newSizes[index], [field]: value }
    setFormData({ ...formData, sizes: newSizes })
  }

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index)
    setFormData({ ...formData, sizes: newSizes })
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h1 className="text-2xl font-serif">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif">Products ({products.length})</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-luxury-gold text-white px-6 py-2 rounded-full hover:bg-luxury-charcoal transition-colors"
                  >
                    + Add Product
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-luxury-gold border-r-transparent"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Image</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">SKU</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-16 h-20 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-20 bg-gray-200 rounded"></div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">{product.name}</td>
                            <td className="py-3 px-4 text-gray-600">{product.sku}</td>
                            <td className="py-3 px-4">
                              <span className="capitalize">{product.category}</span>
                            </td>
                            <td className="py-3 px-4">₹{product.selling_price}</td>
                            <td className="py-3 px-4">{product.total_stock}</td>
                            <td className="py-3 px-4">
                              <button className="text-blue-600 hover:underline mr-3">Edit</button>
                              <button className="text-red-600 hover:underline">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12 text-gray-500">
                Orders management coming soon...
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12 text-gray-500">
                Analytics dashboard coming soon...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">Add New Product</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    >
                      <option value="traditional">Traditional</option>
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="fusion">Fusion</option>
                      <option value="ethnic_wear">Ethnic Wear</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sizes & Inventory</label>
                  {formData.sizes.map((sizeObj, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={sizeObj.size}
                        onChange={(e) => updateSize(index, 'size', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={sizeObj.quantity}
                        onChange={(e) => updateSize(index, 'quantity', parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border rounded-lg"
                      />
                      {formData.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSize}
                    className="text-luxury-gold hover:underline text-sm"
                  >
                    + Add Another Size
                  </button>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Feature this product on homepage</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-luxury-gold text-white py-3 rounded-full hover:bg-luxury-charcoal transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border rounded-full hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}