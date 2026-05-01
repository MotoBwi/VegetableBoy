'use client';
import { useState, useEffect } from 'react';
import { orderApi } from '@/lib/api';
import toast from 'react-hot-toast';

const ZONES = ['All', 'Block A', 'Block B', 'Block C'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('consolidated');
  const [zoneFilter, setZoneFilter] = useState('All');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = zoneFilter === 'All' ? orders : orders.filter(o => o.zone === zoneFilter);

  const productMap = {};
  filtered.forEach(order => {
    order.items.forEach(item => {
      const key = item.name;
      if (!productMap[key]) {
        productMap[key] = {name: item.name, image: item.image, orders: 0, q250: 0, q500: 0, q1kg: 0};
      }
      productMap[key].orders += 1;
      if (item.variant === '250g') productMap[key].q250 += item.qty;
      if (item.variant === '500g') productMap[key].q500 += item.qty;
      if (item.variant === '1kg') productMap[key].q1kg += item.qty;
    });
  });
  const consolidated = Object.values(productMap);

  if (loading) return <div className="p-6 text-meta font-mono">Loading orders...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Orders</h1>
          <p className="text-meta text-sm mt-1 font-mono">Today's orders — {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {[
            {id: 'consolidated', label: 'Consolidated'},
            {id: 'perPerson', label: 'Per Person'},
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all font-mono ${
                view === v.id ? 'bg-ink text-cream' : 'bg-surface text-mid border border-rule hover:bg-cream'
              }`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-meta font-mono">Zone:</span>
          {ZONES.map(z => (
            <button key={z} onClick={() => setZoneFilter(z)}
              className={`px-3 py-1.5 rounded-full font-semibold text-[10px] transition-all font-mono ${
                zoneFilter === z ? 'bg-ink text-cream' : 'bg-surface text-mid border border-rule hover:bg-cream'
              }`}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {view === 'consolidated' && (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
          <div className="p-5 border-b border-rule">
            <h2 className="text-ink font-serif tracking-tight">Total Quantities Needed Today</h2>
            <p className="text-[10px] text-meta mt-1 font-mono">Aggregate across all customers — use for market purchase</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-cream">
                {['Product', 'Orders', '250g', '500g', '1kg', 'Total Weight'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {consolidated.map((p, i) => {
                const totalGrams = p.q250 * 250 + p.q500 * 500 + p.q1kg * 1000;
                return (
                  <tr key={i} className="hover:bg-cream/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-xs font-bold text-mid border border-rule">{p.name.charAt(0)}</div>
                        )}
                        <span className="font-bold text-ink font-mono">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-cream text-ink font-bold text-sm px-2 py-1 rounded-lg font-mono border border-rule">{p.orders}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{p.q250 > 0 ? `${p.q250} pcs` : '—'}</td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{p.q500 > 0 ? `${p.q500} pcs` : '—'}</td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{p.q1kg > 0 ? `${p.q1kg} pcs` : '—'}</td>
                    <td className="px-5 py-4">
                      <span className="bg-cream text-ink font-bold text-sm px-3 py-1 rounded-lg font-mono border border-rule">
                        {(totalGrams / 1000).toFixed(2)} kg
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'perPerson' && (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center text-lg font-bold text-ink font-mono">
                    {order.user.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-ink font-mono">{order.user}</div>
                    <div className="text-xs text-meta font-mono">{order.zone} · {order.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full font-mono ${
                    order.status === 'delivered' ? 'bg-cream text-ink border border-rule' :
                    order.status === 'pending' ? 'bg-amber/20 text-amber border border-amber/30' :
                    'bg-rule text-mid border border-rule'
                  }`}>
                    {order.status === 'delivered' ? 'Delivered' : order.status === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                  <span className="font-black text-amber text-lg font-mono">Rs.{order.total}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {order.items.map((item, i) => (
                  <div key={i} className="bg-cream rounded-xl px-3 py-2 flex items-center gap-2 text-sm border border-rule">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-rule flex items-center justify-center text-xs font-bold text-mid">{item.name.charAt(0)}</div>
                    )}
                    <span className="font-semibold text-ink font-mono">{item.name}</span>
                    <span className="text-meta font-mono">{item.variant} ×{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
