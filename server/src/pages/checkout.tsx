import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/store/cartStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  // Shipping Details
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
  
  // Payment Method
  paymentMethod: z.enum(['cash_on_delivery', 'card', 'upi']),
  
  // Guest checkout option
  createAccount: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  const totalPrice = getTotalPrice();
  const taxAmount = totalPrice * 0.18; // 18% GST
  const shippingCost = totalPrice > 1000 ? 0 : 100;
  const finalTotal = totalPrice + taxAmount + shippingCost;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          size: item.size,
          quantity: item.quantity
        })),
        shippingAddress: {
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode
        },
        paymentMethod: data.paymentMethod,
        guestInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        createAccount: data.createAccount,
        password: data.password
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        orderData
      );

      if (response.data.success) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation/${response.data.order.orderNumber}`);
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <Layout title="Checkout - Luxe Attire">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-center mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-serif mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      {...register('name')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      {...register('city')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      {...register('state')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input
                      {...register('pincode')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-serif mb-6">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-luxury-gold">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cash_on_delivery"
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-luxury-gold">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="card"
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Secure payment via Stripe</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-luxury-gold">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="upi"
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-gray-500">Pay using UPI apps</p>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Account Creation */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-medium">Create an account for faster checkout next time</span>
                </label>

                {createAccount && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      {...register('password')}
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-luxury-charcoal text-white py-3 rounded-full hover:bg-luxury-gold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                      <span className="text-gray-500 ml-1">({item.size})</span>
                    </span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;