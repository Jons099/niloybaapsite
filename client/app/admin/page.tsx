'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== 'admin' && user?.role !== 'manager') {
      router.push('/')
    } else {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch products
      const productsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      
      // Fetch analytics if admin
      let analyticsData = null
      if (user?.role === 'admin') {
        try {
          const analyticsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          analyticsData = analyticsRes.data.analytics
        } catch (error) {
          console.error('Analytics fetch failed:', error)
        }
      }
      
      setProducts(productsRes.data.products || [])
      
      setStats({
        totalProducts: productsRes.data.products?.length || 0,
        totalOrders: analyticsData?.summary?.total_orders || 0,
        totalRevenue: analyticsData?.summary?.total_revenue || 0,
        pendingOrders: analyticsData?.summary?.pending_orders || 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-semibold text-gray-800">{stats.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-semibold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-semibold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Pending Orders</p>
              <p className="text-3xl font-semibold text-gray-800">{stats.pendingOrders}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-6">
              {['dashboard', 'products', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-luxury-gold text-luxury-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="text-center py-12">
                <p className="text-gray-600">Welcome to your admin dashboard!</p>
                <p className="text-sm text-gray-500 mt-2">Use the tabs above to manage products and view orders.</p>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif">Products ({products.length})</h2>
                  <button className="bg-luxury-gold text-white px-6 py-2 rounded-full hover:bg-luxury-charcoal transition-colors">
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
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{product.name}</td>
                            <td className="py-3 px-4">
                              <span className="capitalize">{product.category}</span>
                            </td>
                            <td className="py-3 px-4">₹{product.selling_price}</td>
                            <td className="py-3 px-4 text-gray-600">{product.sku}</td>
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
                No orders yet. Orders will appear here when customers make purchases.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}