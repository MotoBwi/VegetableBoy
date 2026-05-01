'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { reportApi } from '@/lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#2E7D32', '#FF6F00', '#1565C0', '#C62828', '#6A1B9A', '#F9A825'];

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getAll()
      .then(setData)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading reports...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load reports.</div>;

  const { totalRevenue, totalCash, totalOnline, pendingRevenue, salesTrend, paymentData, zoneRevenue, deliveryPerf, topProducts } = data;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Sales analytics aur performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `Rs.${totalRevenue}`, sub: `${data.deliveredOrders || 0} delivered` },
          { label: 'Cash', value: `Rs.${totalCash}`, sub: 'Pending' },
          { label: 'Online', value: `Rs.${totalOnline}`, sub: 'Direct' },
          { label: 'Pending Rev', value: `Rs.${pendingRevenue}`, sub: 'Yet to deliver' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-2xl p-5 shadow-sm border-t-4 border-green-500">
            <div className="text-2xl font-black text-gray-100">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-500 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2E7D32" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">Payment Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#2E7D32' : '#1565C0'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rs.${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">Zone Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zoneRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `Rs.${value}`} />
              <Bar dataKey="revenue" fill="#1565C0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-200 mb-4">Delivery Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deliveryPerf} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="delivered" stackId="a" fill="#2E7D32" />
              <Bar dataKey="pending" stackId="a" fill="#F9A825" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-bold text-gray-200">Top Products</h2>
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-700">
            {['Rank', 'Product', 'Orders', 'Qty'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-700">
            {topProducts.map((p, i) => (
              <tr key={p.name} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-5 py-4 font-black text-gray-500">#{i + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-400">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-gray-100">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-sm text-blue-600">{p.orders}</td>
                <td className="px-5 py-4 text-sm text-gray-300">{p.qty} pcs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
