'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData)
      
      if (response.data.success) {
        const { token, user } = response.data
        login(user, token)
        toast.success('Login successful!')
        
        // Redirect based on role
        if (user.role === 'admin' || user.role === 'manager') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-luxury-pearl flex items-center justify-center py-12 pt-24">
      <div className="container max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-serif text-center mb-6">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your account</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-charcoal text-white py-3 rounded-full hover:bg-luxury-gold transition-all duration-300 font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-luxury-gold hover:underline">
                Create account
              </Link>
            </p>
          </div>
          
          <div className="mt-8 p-4 bg-luxury-cream rounded-lg">
            <p className="text-sm font-medium mb-3 text-center">Test Credentials</p>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex justify-between">
                <span>Admin:</span>
                <span className="font-mono">admin@luxeattire.com / Admin@123</span>
              </p>
              <p className="flex justify-between">
                <span>Manager:</span>
                <span className="font-mono">manager@luxeattire.com / Manager@123</span>
              </p>
              <p className="flex justify-between">
                <span>Employee:</span>
                <span className="font-mono">employee@luxeattire.com / Employee@123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}