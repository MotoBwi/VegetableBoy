'use client';
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub }) => (
  <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
    <div className="text-3xl font-serif text-ink tracking-tight">{value}</div>
    <div className="text-sm text-mid mt-1 font-mono">{label}</div>
    {sub && <div className="text-xs text-meta mt-1 font-mono">{sub}</div>}
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

  if (loading) return <div className="p-6 text-meta font-mono">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-amber font-mono">Failed to load dashboard.</div>;

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Dashboard</h1>
          <p className="text-meta text-sm mt-1 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Delivery at 8:00 AM</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface border border-rule rounded-xl px-4 py-2">
            <span className="text-amber font-bold text-sm font-mono">{data.pending} Pending</span>
          </div>
          <div className="bg-surface border border-rule rounded-xl px-4 py-2">
            <span className="text-ink font-bold text-sm font-mono">Cutoff: 5:00 AM</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Orders Today" value={data.totalOrders} />
        <StatCard label="Delivered" value={data.delivered} />
        <StatCard label="Cash Collected" value={`Rs.${data.totalCash}`} sub="Pending submission" />
        <StatCard label="Online Received" value={`Rs.${data.totalOnline}`} sub="Direct to company" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Zone Status */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Zone-wise Delivery Status</h2>
          <div className="space-y-3">
            {data.deliveryPersons.map(dp => (
              <div key={dp.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-rule">
                <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center text-sm font-bold text-ink font-mono">{dp.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-bold text-ink text-sm font-mono">{dp.name}</div>
                  <div className="text-xs text-meta font-mono">{dp.zone}</div>
                </div>
                <div className="text-right">
                  <div className="text-ink font-bold text-sm font-mono">{dp.delivered}</div>
                  <div className="text-meta text-xs font-mono">{dp.pending} pending</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Quick Actions</h2>
          <div className="space-y-2">
            {[
              {label: "Set Today's Prices", href: '/orders/price'},
              {label: 'View All Orders', href: '/orders'},
              {label: 'Add New User', href: '/users'},
              {label: 'Add New Product', href: '/products'},
              {label: 'View Reports', href: '/reports'},
            ].map((a, i) => (
              <a key={i} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-cream border border-transparent hover:border-rule">
                  <span className="text-sm font-bold text-mid font-mono">{i + 1}.</span>
                  <span className="font-semibold text-sm text-ink font-mono">{a.label}</span>
                  <span className="ml-auto text-meta">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-rule col-span-2">
          <h2 className="text-ink mb-4 font-serif tracking-tight">Recent Orders</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-cream rounded-xl">
                {['Order ID', 'Customer', 'Zone', 'Items', 'Total', 'Status', 'Payment'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order, i) => (
                <tr key={order.id} className={`border-t border-rule ${i % 2 === 0 ? '' : 'bg-cream/50'}`}>
                  <td className="px-4 py-3 font-bold text-sm text-amber font-mono">{order.id}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-ink font-mono">{order.user}</td>
                  <td className="px-4 py-3">
                    <span className="bg-cream text-mid text-[10px] font-bold px-2 py-1 rounded-lg font-mono border border-rule">{order.zone}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-mid font-mono">{order.items.length} items</td>
                  <td className="px-4 py-3 font-bold text-sm text-ink font-mono">Rs.{order.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full font-mono ${
                      order.status === 'delivered' ? 'bg-cream text-ink border border-rule' :
                      order.status === 'pending' ? 'bg-amber/20 text-amber border border-amber/30' :
                      'bg-rule text-mid border border-rule'
                    }`}>
                      {order.status === 'delivered' ? 'Delivered' : order.status === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-mid font-mono">
                    {order.payment === 'cash' ? 'Cash' : order.payment === 'online' ? 'Online' : '—'}
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
