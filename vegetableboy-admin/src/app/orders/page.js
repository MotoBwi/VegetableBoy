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

  if (loading) return <div className="p-6 text-gray-500">Loading orders...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Today's orders — {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {[
            {id: 'consolidated', label: 'Consolidated'},
            {id: 'perPerson', label: 'Per Person'},
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                view === v.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Zone:</span>
          {ZONES.map(z => (
            <button key={z} onClick={() => setZoneFilter(z)}
              className={`px-3 py-1.5 rounded-full font-semibold text-xs transition-all ${
                zoneFilter === z ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {view === 'consolidated' && (
        <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h2 className="font-bold text-gray-200">Total Quantities Needed Today</h2>
            <p className="text-xs text-gray-500 mt-1">Aggregate across all customers — use for market purchase</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                {['Product', 'Orders', '250g', '500g', '1kg', 'Total Weight'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consolidated.map((p, i) => {
                const totalGrams = p.q250 * 250 + p.q500 * 500 + p.q1kg * 1000;
                return (
                  <tr key={i} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-400">{p.name.charAt(0)}</div>
                        )}
                        <span className="font-bold text-gray-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-900/30 text-blue-600 font-bold text-sm px-2 py-1 rounded-lg">{p.orders}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{p.q250 > 0 ? `${p.q250} pcs` : '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-300">{p.q500 > 0 ? `${p.q500} pcs` : '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-300">{p.q1kg > 0 ? `${p.q1kg} pcs` : '—'}</td>
                    <td className="px-5 py-4">
                      <span className="bg-green-900/30 text-green-600 font-bold text-sm px-3 py-1 rounded-lg">
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
            <div key={order.id} className="bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-lg">
                    {order.user.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-100">{order.user}</div>
                    <div className="text-xs text-gray-500">{order.zone} • {order.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-900/30 text-green-600' :
                    order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-600' :
                    'bg-red-900/30 text-red-600'
                  }`}>
                    {order.status === 'delivered' ? 'Delivered' : order.status === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                  <span className="font-black text-blue-600 text-lg">₹{order.total}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {order.items.map((item, i) => (
                  <div key={i} className="bg-gray-700 rounded-xl px-3 py-2 flex items-center gap-2 text-sm">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-400">{item.name.charAt(0)}</div>
                    )}
                    <span className="font-semibold text-gray-200">{item.name}</span>
                    <span className="text-gray-500">{item.variant} ×{item.qty}</span>
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
