'use client';
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`bg-gray-800 rounded-2xl p-5 shadow-sm border-t-4 ${color}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-gray-700">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-black text-gray-100">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setData)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load dashboard.</div>;

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">📊 Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Delivery at 8:00 AM</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl px-4 py-2">
            <span className="text-yellow-600 font-bold text-sm">⏳ {data.pending} Pending</span>
          </div>
          <div className="bg-orange-900/30 border border-orange-700 rounded-xl px-4 py-2">
            <span className="text-orange-600 font-bold text-sm">⏰ Cutoff: 5:00 AM</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="📦" label="Total Orders Today" value={data.totalOrders} color="border-blue-500" />
        <StatCard icon="✅" label="Delivered" value={data.delivered} color="border-green-500" />
        <StatCard icon="💵" label="Cash Collected" value={`₹${data.totalCash}`} color="border-green-400" sub="Pending submission" />
        <StatCard icon="📱" label="Online Received" value={`₹${data.totalOnline}`} color="border-blue-400" sub="Direct to company" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Zone Status */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">📍 Zone-wise Delivery Status</h2>
          <div className="space-y-3">
            {data.deliveryPersons.map(dp => (
              <div key={dp.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-xl">
                <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-xl">🚴</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-100 text-sm">{dp.name}</div>
                  <div className="text-xs text-gray-500">{dp.zone}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold text-sm">✅ {dp.delivered}</div>
                  <div className="text-yellow-500 text-xs">⏳ {dp.pending}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">⚡ Quick Actions</h2>
          <div className="space-y-2">
            {[
              {label: 'Set Today\'s Prices', icon: '💰', color: 'bg-orange-900/30 hover:bg-orange-900/30 text-orange-600', href: '/orders/price'},
              {label: 'View All Orders', icon: '📦', color: 'bg-blue-900/30 hover:bg-blue-900/30 text-blue-600', href: '/orders'},
              {label: 'Add New User', icon: '👤', color: 'bg-green-900/30 hover:bg-green-900/30 text-green-600', href: '/users'},
              {label: 'Add New Product', icon: '🥦', color: 'bg-purple-900/30 hover:bg-purple-900/30 text-purple-600', href: '/products'},
              {label: 'View Reports', icon: '📈', color: 'bg-gray-700 hover:bg-gray-600 text-gray-300', href: '/reports'},
            ].map((a, i) => (
              <a key={i} href={a.href}>
                <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${a.color}`}>
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-semibold text-sm">{a.label}</span>
                  <span className="ml-auto">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm col-span-2">
          <h2 className="font-bold text-gray-200 mb-4">🕐 Recent Orders</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 rounded-xl">
                {['Order ID', 'Customer', 'Zone', 'Items', 'Total', 'Status', 'Payment'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order, i) => (
                <tr key={order.id} className={`border-t border-gray-700 ${i % 2 === 0 ? '' : 'bg-gray-700/50'}`}>
                  <td className="px-4 py-3 font-bold text-sm text-blue-600">{order.id}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-gray-100">{order.user}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-900/30 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg">📍 {order.zone}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{order.items.length} items</td>
                  <td className="px-4 py-3 font-bold text-sm text-gray-100">₹{order.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-900/30 text-green-600' :
                      order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-600' :
                      'bg-red-900/30 text-red-600'
                    }`}>
                      {order.status === 'delivered' ? '✅ Delivered' : order.status === 'pending' ? '🕐 Pending' : '❌ Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {order.payment === 'cash' ? '💵 Cash' : order.payment === 'online' ? '📱 Online' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
