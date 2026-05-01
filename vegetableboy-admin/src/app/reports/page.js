'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { reportApi } from '@/lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#F09A1A', '#1A1A1A', '#6B6B6B', '#D4CFC7', '#A8A29E', '#F0EDE8'];

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getAll()
      .then(setData)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-meta font-mono">Loading reports...</div>;
  if (!data) return <div className="p-6 text-amber font-mono">Failed to load reports.</div>;

  const { totalRevenue, totalCash, totalOnline, pendingRevenue, salesTrend, paymentData, zoneRevenue, deliveryPerf, topProducts } = data;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Reports</h1>
          <p className="text-meta text-sm mt-1 font-mono">Sales analytics aur performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `Rs.${totalRevenue}`, sub: `${data.deliveredOrders || 0} delivered` },
          { label: 'Cash', value: `Rs.${totalCash}`, sub: 'Pending' },
          { label: 'Online', value: `Rs.${totalOnline}`, sub: 'Direct' },
          { label: 'Pending Rev', value: `Rs.${pendingRevenue}`, sub: 'Yet to deliver' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
            <div className="text-2xl font-serif text-ink tracking-tight">{s.value}</div>
            <div className="text-sm text-meta mt-1 font-mono">{s.label}</div>
            {s.sub && <div className="text-[10px] text-meta mt-1 font-mono">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '12px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="sales" stroke="#F09A1A" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Payment Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#F09A1A' : '#1A1A1A'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rs.${value}`} contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '12px', fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Zone Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zoneRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <Tooltip formatter={(value) => `Rs.${value}`} contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '12px', fontFamily: 'monospace' }} />
              <Bar dataKey="revenue" fill="#F09A1A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Delivery Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deliveryPerf} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6B6B6B' }} width={80} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '12px', fontFamily: 'monospace' }} />
              <Bar dataKey="delivered" stackId="a" fill="#1A1A1A" />
              <Bar dataKey="pending" stackId="a" fill="#F09A1A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden mb-6 border border-rule">
        <div className="p-5 border-b border-rule">
          <h2 className="text-ink font-serif tracking-tight">Top Products</h2>
        </div>
        <table className="w-full">
          <thead><tr className="bg-cream">
            {['Rank', 'Product', 'Orders', 'Qty'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-rule">
            {topProducts.map((p, i) => (
              <tr key={p.name} className="hover:bg-cream/50 transition-colors">
                <td className="px-5 py-4 font-bold text-meta font-mono">#{i + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-xs font-bold text-mid border border-rule">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-ink font-mono">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-sm text-amber font-mono">{p.orders}</td>
                <td className="px-5 py-4 text-sm text-mid font-mono">{p.qty} pcs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
