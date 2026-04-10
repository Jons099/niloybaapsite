'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-luxury-pearl pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-serif text-xl mb-4">Profile Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-serif text-xl mb-4">Order History</h2>
            <p className="text-gray-500">No orders yet</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-serif text-xl mb-4">Settings</h2>
            <button className="text-luxury-gold hover:underline">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}