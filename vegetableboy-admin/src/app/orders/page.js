'use client';
import { useState, useEffect } from 'react';
import { orderApi, deliveryApi } from '@/lib/api';
import toast from 'react-hot-toast';

const ZONES = ['All', 'Block A', 'Block B', 'Block C'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('consolidated');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [dpFilter, setDpFilter] = useState('all');
  const [selectedPending, setSelectedPending] = useState(new Set());
  const [bulkAssignDp, setBulkAssignDp] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, personsData] = await Promise.all([
        orderApi.getAll(),
        deliveryApi.getAll(),
      ]);
      setOrders(ordersData.orders || ordersData || []);
      setDeliveryPersons(personsData.persons || personsData || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDpName = (order) => {
    if (order.deliveryPerson?.name) return order.deliveryPerson.name;
    const id = order.deliveryPersonId;
    if (!id) return '— Unassigned —';
    const dp = deliveryPersons.find(p => p.id === id);
    return dp ? dp.name : '—';
  };

  const handleSelectPending = (orderId, checked) => {
    setSelectedPending(prev => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  };

  const handleSelectAllPending = (pendingOrders, checked) => {
    if (checked) {
      setSelectedPending(new Set(pendingOrders.map(o => o.id)));
    } else {
      setSelectedPending(new Set());
    }
  };

  const handleBulkAssign = async () => {
    if (selectedPending.size === 0) {
      toast.error('Koi order select karo!');
      return;
    }
    if (!bulkAssignDp) {
      toast.error('Delivery person chuno!');
      return;
    }
    try {
      setAssigning(true);
      const ids = Array.from(selectedPending);
      await Promise.all(ids.map(id => orderApi.reassign(id, bulkAssignDp)));
      await loadData();
      setSelectedPending(new Set());
      toast.success(`${ids.length} orders assign ho gaye!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const filtered = zoneFilter === 'All' ? orders : orders.filter(o => o.zone === zoneFilter);

  const productMap = {};
  filtered.forEach(order => {
    order.items.forEach(item => {
      const key = item.name;
      if (!productMap[key]) {
        productMap[key] = { name: item.name, image: item.image, orders: 0, q250: 0, q500: 0, q1kg: 0 };
      }
      productMap[key].orders += 1;
      if (item.variant === '250g') productMap[key].q250 += item.qty;
      if (item.variant === '500g') productMap[key].q500 += item.qty;
      if (item.variant === '1kg') productMap[key].q1kg += item.qty;
    });
  });
  const consolidated = Object.values(productMap);

  const pendingOrders = filtered.filter(o => o.status === 'pending');
  const completedOrders = filtered.filter(o => o.status !== 'pending');

  // Zones jinme active delivery person hai
  const activeZoneNames = new Set();
  deliveryPersons.forEach(dp => {
    if (dp.active !== false) {
      dp.zoneDeliveryPersons?.forEach(zdp => activeZoneNames.add(zdp.zone?.name || zdp.zone));
    }
  });

  // Inactive delivery person IDs jinke pending orders reassign hone chahiye
  const inactiveDpIds = new Set();
  deliveryPersons.forEach(dp => {
    if (dp.active === false) inactiveDpIds.add(dp.id);
  });

  // Dispatch queue: unassigned orders in uncovered zones + orders assigned to inactive persons
  const dispatchQueue = pendingOrders.filter(o => {
    const isInactiveAssigned = o.deliveryPersonId && inactiveDpIds.has(o.deliveryPersonId);
    const isUncoveredUnassigned = !o.deliveryPersonId && !activeZoneNames.has(o.zone);
    return isInactiveAssigned || isUncoveredUnassigned;
  });

  // Unassigned filter: sab pending orders jinme deliveryPersonId nahi hai ya inactive person ko assign hai
  const unassignedOrders = pendingOrders.filter(o => !o.deliveryPersonId || (o.deliveryPersonId && inactiveDpIds.has(o.deliveryPersonId)));

  const dpFilteredPending = dpFilter === 'all'
    ? pendingOrders
    : dpFilter === 'unassigned'
      ? unassignedOrders
      : pendingOrders.filter(o => o.deliveryPersonId === dpFilter);

  const dpFilteredCompleted = dpFilter === 'all'
    ? completedOrders
    : dpFilter === 'unassigned'
      ? completedOrders.filter(o => !o.deliveryPersonId)
      : completedOrders.filter(o => o.deliveryPersonId === dpFilter);

  if (loading) return <div className="p-6 text-meta font-mono">Loading orders...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Orders</h1>
          <p className="text-meta text-sm mt-1 font-mono">Today's orders — {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { id: 'consolidated', label: 'Consolidated' },
            { id: 'perPerson', label: 'Per Person' },
            { id: 'deliveryStatus', label: 'Delivery Status' },
          ].map(v => (
            <button key={v.id} onClick={() => {
              setView(v.id);
              if (v.id === 'deliveryStatus') { setDpFilter('unassigned'); setSelectedPending(new Set()); }
            }}
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
                  <div className="text-right">
                    <span className="font-black text-amber text-lg font-mono">Rs.{order.total}</span>
                    <div className="text-[10px] text-meta font-mono">Items Rs.{order.subtotal || order.total} + Delivery Rs.{order.deliveryCharge || 15}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-mid uppercase tracking-wider font-mono">Delivery:</span>
                <span className="text-sm font-mono text-mid">{getDpName(order)}</span>
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

      {view === 'deliveryStatus' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-meta font-mono">Delivery Person:</span>
            <select
              value={dpFilter}
              onChange={e => { setDpFilter(e.target.value); setSelectedPending(new Set()); }}
              className="border-2 border-rule rounded-xl px-3 py-2 text-sm text-ink bg-cream font-mono outline-none focus:border-amber"
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              {deliveryPersons.filter(dp => dp.active !== false).map(dp => (
                <option key={dp.id} value={dp.id}>{dp.name}</option>
              ))}
            </select>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
            <div className="p-5 border-b border-rule flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-ink font-serif tracking-tight">Pending Deliveries</h2>
                <p className="text-[10px] text-meta mt-1 font-mono">Jo orders abhi kisi delivery person ko assign nahi hain</p>
              </div>
              {selectedPending.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-meta font-mono">{selectedPending.size} selected →</span>
                  <select
                    value={bulkAssignDp}
                    onChange={e => setBulkAssignDp(e.target.value)}
                    className="border-2 border-rule rounded-xl px-3 py-2 text-sm text-ink bg-cream font-mono outline-none focus:border-amber"
                  >
                    <option value="">Assign to...</option>
                    {deliveryPersons.filter(dp => dp.active !== false).map(dp => (
                      <option key={dp.id} value={dp.id}>{dp.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkAssign}
                    disabled={assigning}
                    className="px-4 py-2 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-mid transition-all font-mono tracking-wide disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              )}
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-cream">
                  <th className="px-5 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={dpFilteredPending.length > 0 && dpFilteredPending.every(o => selectedPending.has(o.id))}
                      onChange={e => handleSelectAllPending(dpFilteredPending, e.target.checked)}
                      className="w-4 h-4 accent-ink"
                    />
                  </th>
                  {['User', 'Zone', 'Items', 'Total', 'Current DP'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {dpFilteredPending.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-meta font-mono text-sm">
                      {dpFilter === 'unassigned'
                        ? 'Koi dispatch order nahi hai — sab zones covered hain aur sab active persons assigned hain.'
                        : 'Koi pending delivery nahi hai.'}
                    </td>
                  </tr>
                )}
                {dpFilteredPending.map(order => (
                  <tr key={order.id} className="hover:bg-cream/50">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPending.has(order.id)}
                        onChange={e => handleSelectPending(order.id, e.target.checked)}
                        className="w-4 h-4 accent-ink"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink font-mono">{order.user}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{order.zone}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {order.items.map((item, i) => (
                          <span key={i} className="bg-cream rounded-lg px-2 py-1 text-xs border border-rule font-mono text-ink">
                            {item.name} {item.variant}×{item.qty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-amber text-sm font-mono">Rs.{order.total}</span>
                      <div className="text-[10px] text-meta font-mono">+Rs.{order.deliveryCharge || 15} delivery</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{getDpName(order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Completed Deliveries */}
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
            <div className="p-5 border-b border-rule">
              <h2 className="text-ink font-serif tracking-tight">Completed Deliveries</h2>
              <p className="text-[10px] text-meta mt-1 font-mono">Ye orders already deliver ho chuke hain — edit nahi ho sakta</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-cream">
                  {['User', 'Zone', 'Items', 'Total', 'Status', 'Delivery Person'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {dpFilteredCompleted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-meta font-mono text-sm">Koi completed delivery nahi hai.</td>
                  </tr>
                )}
                {dpFilteredCompleted.map(order => (
                  <tr key={order.id} className="hover:bg-cream/50 opacity-60">
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink font-mono">{order.user}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{order.zone}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {order.items.map((item, i) => (
                          <span key={i} className="bg-cream rounded-lg px-2 py-1 text-xs border border-rule font-mono text-ink">
                            {item.name} {item.variant}×{item.qty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-amber text-sm font-mono">Rs.{order.total}</span>
                      <div className="text-[10px] text-meta font-mono">+Rs.{order.deliveryCharge || 15} delivery</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full font-mono ${
                        order.status === 'delivered' ? 'bg-cream text-ink border border-rule' : 'bg-rule text-mid border border-rule'
                      }`}>
                        {order.status === 'delivered' ? 'Delivered' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-mid font-mono">{getDpName(order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
