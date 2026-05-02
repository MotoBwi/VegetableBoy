'use client';
import { useState, useEffect } from 'react';
import { failedPaymentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FailedPaymentsPage() {
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await failedPaymentsApi.getAll();
      setFailedPayments(data.failedPayments || data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = failedPayments.filter(fp => {
    const term = search.toLowerCase();
    return (
      fp.user?.toLowerCase().includes(term) ||
      fp.phone?.toLowerCase().includes(term) ||
      fp.zone?.toLowerCase().includes(term) ||
      fp.razorpayOrderId?.toLowerCase().includes(term) ||
      fp.failureReason?.toLowerCase().includes(term)
    );
  });

  const getItems = (itemsJson) => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  if (loading) return <div className="p-6 text-meta font-mono">Loading failed payments...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Failed Payments</h1>
          <p className="text-meta text-sm mt-1 font-mono">
            {failedPayments.length} failed payment attempt{failedPayments.length !== 1 ? 's' : ''} — help users understand why their order was not placed
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-ink text-cream rounded-xl font-bold text-sm font-mono hover:bg-ink/90 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by user, phone, zone, Razorpay Order ID, or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-surface border border-rule rounded-xl text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
        <table className="w-full">
          <thead>
            <tr className="bg-cream">
              {['Date', 'User', 'Phone', 'Zone', 'Items', 'Total', 'Razorpay Order ID', 'Failure Reason'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-meta font-mono">
                  <div className="text-3xl mb-3">✅</div>
                  <div className="font-bold text-ink mb-1">No failed payments</div>
                  <div className="text-sm">All payment attempts have been successful.</div>
                </td>
              </tr>
            )}
            {filtered.map((fp) => {
              const items = getItems(fp.itemsJson);
              return (
                <tr key={fp.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-ink font-mono whitespace-nowrap">
                    {new Date(fp.createdAt).toLocaleDateString('en-GB')}
                    <div className="text-[10px] text-meta mt-0.5">
                      {new Date(fp.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-sm text-ink font-mono">
                    {fp.user}
                  </td>
                  <td className="px-5 py-4 text-sm text-mid font-mono">
                    {fp.phone || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-cream text-mid text-[10px] font-bold px-2 py-1 rounded-lg font-mono border border-rule">
                      {fp.zone || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-mid font-mono">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                    <div className="text-[10px] text-meta mt-0.5 max-w-[160px] truncate">
                      {items.map(i => `${i.variant}×${i.qty}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-sm text-ink font-mono whitespace-nowrap">
                    Rs.{(fp.total || 0) + (fp.deliveryCharge || 15)}
                  </td>
                  <td className="px-5 py-4 text-sm text-amber font-mono whitespace-nowrap">
                    {fp.razorpayOrderId || '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-red font-mono max-w-[200px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red flex-shrink-0" />
                      {fp.failureReason || 'Unknown'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
