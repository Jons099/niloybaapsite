import React, { useEffect, useState } from 'react';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  TrendingUpIcon 
} from '@heroicons/react/24/outline';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: `₹${analytics?.summary?.total_revenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      name: 'Total Orders',
      value: analytics?.summary?.total_orders || 0,
      icon: ShoppingBagIcon,
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      name: 'Total Profit',
      value: `₹${analytics?.summary?.total_profit?.toLocaleString() || 0}`,
      icon: TrendingUpIcon,
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      name: 'Active Employees',
      value: analytics?.employeePerformance?.length || 0,
      icon: UsersIcon,
      change: '0',
      changeType: 'neutral'
    }
  ];

  const COLORS = ['#C6A052', '#2C2C2C', '#722F37', '#F5F0E6'];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-luxury-charcoal mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-luxury-cream rounded-lg">
                <stat.icon className="h-6 w-6 text-luxury-gold" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-luxury-charcoal mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-serif mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#C6A052" 
                name="Revenue" 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#2C2C2C" 
                name="Profit" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-serif mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.categories || []}
                dataKey="total_revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics?.categories?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-serif mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Orders</th>
                <th className="text-left py-3 px-4">Quantity Sold</th>
                <th className="text-left py-3 px-4">Revenue</th>
                <th className="text-left py-3 px-4">Profit</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topProducts?.map((product: any) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.order_count}</td>
                  <td className="py-3 px-4">{product.total_quantity}</td>
                  <td className="py-3 px-4">₹{product.total_revenue.toLocaleString()}</td>
                  <td className="py-3 px-4">₹{product.total_profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {analytics?.lowStockAlerts?.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-serif text-red-800 mb-4">Low Stock Alerts</h3>
          <div className="space-y-2">
            {analytics.lowStockAlerts.map((alert: any) => (
              <div key={`${alert.id}-${alert.size}`} className="flex items-center justify-between">
                <span className="text-red-700">
                  {alert.name} - Size {alert.size}
                </span>
                <span className="text-red-600 font-semibold">
                  Only {alert.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;