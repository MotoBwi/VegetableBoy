'use client';
import { useState, useEffect } from 'react';
import { paymentApi, settlementApi, deliveryApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeliveryPaymentsPage() {
  const [report, setReport] = useState([]);
  const [persons, setPersons] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSettlement, setNewSettlement] = useState({ deliveryPersonId: '', date: '', cashAmount: '', onlineAmount: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, personsData, settlementsData] = await Promise.all([
        paymentApi.getReport(),
        deliveryApi.getAll(),
        settlementApi.getAll(),
      ]);
      setReport(reportData.report || []);
      setPersons(personsData || []);
      setSettlements(settlementsData.settlements || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSettlement = async () => {
    if (!newSettlement.deliveryPersonId || !newSettlement.date) {
      toast.error('Delivery person aur date bharo!');
      return;
    }
    try {
      await settlementApi.create({
        deliveryPersonId: Number(newSettlement.deliveryPersonId),
        date: newSettlement.date,
        cashAmount: Number(newSettlement.cashAmount) || 0,
        onlineAmount: Number(newSettlement.onlineAmount) || 0,
        notes: newSettlement.notes,
      });
      toast.success('Settlement recorded!');
      setNewSettlement({ deliveryPersonId: '', date: '', cashAmount: '', onlineAmount: '', notes: '' });
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const totalCashCollected = report.reduce((a, r) => a + r.cashCollected, 0);
  const totalOnlineCollected = report.reduce((a, r) => a + r.onlineCollected, 0);
  const totalCashDeposited = report.reduce((a, r) => a + r.cashDeposited, 0);
  const totalOnlineDeposited = report.reduce((a, r) => a + r.onlineDeposited, 0);
  const totalCashPending = report.reduce((a, r) => a + r.cashPending, 0);
  const totalOnlinePending = report.reduce((a, r) => a + r.onlinePending, 0);

  if (loading) return <div className="p-6 text-meta font-mono">Loading payments...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Delivery Payments</h1>
          <p className="text-meta text-sm mt-1 font-mono">Track collections vs deposits per delivery person</p>
        </div>
        <button
          onClick={() => { setNewSettlement({ deliveryPersonId: '', date: today, cashAmount: '', onlineAmount: '', notes: '' }); setShowModal(true); }}
          className="bg-ink text-cream px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mid transition-all font-mono tracking-wide"
        >
          + Record Deposit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
          <div className="text-2xl font-serif text-ink tracking-tight">Rs.{totalCashCollected + totalOnlineCollected}</div>
          <div className="text-sm text-meta font-mono">Total Collected</div>
          <div className="text-[10px] text-mid mt-1 font-mono">Cash: Rs.{totalCashCollected} · Online: Rs.{totalOnlineCollected}</div>
        </div>
        <div className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
          <div className="text-2xl font-serif text-ink tracking-tight">Rs.{totalCashDeposited + totalOnlineDeposited}</div>
          <div className="text-sm text-meta font-mono">Total Deposited</div>
          <div className="text-[10px] text-mid mt-1 font-mono">Cash: Rs.{totalCashDeposited} · Online: Rs.{totalOnlineDeposited}</div>
        </div>
        <div className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
          <div className="text-2xl font-serif text-amber tracking-tight">Rs.{totalCashPending + totalOnlinePending}</div>
          <div className="text-sm text-meta font-mono">Total Pending</div>
          <div className="text-[10px] text-mid mt-1 font-mono">Cash: Rs.{totalCashPending} · Online: Rs.{totalOnlinePending}</div>
        </div>
      </div>

      {/* Per-Person Table */}
      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule mb-6">
        <div className="p-5 border-b border-rule">
          <h2 className="text-ink font-serif tracking-tight">Delivery Person Wise Report</h2>
        </div>
        <table className="w-full">
          <thead><tr className="bg-cream">
            {['Person', 'Zones', 'Cash Collected', 'Online Collected', 'Cash Deposited', 'Online Deposited', 'Cash Pending', 'Online Pending', 'Total Pending'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-rule">
            {report.map(r => (
              <tr key={r.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-amber/20 rounded-full flex items-center justify-center text-xs font-bold text-ink font-mono">{r.name.charAt(0)}</div>
                    )}
                    <div>
                      <div className="font-bold text-ink font-mono text-sm">{r.name}</div>
                      <div className="text-[10px] text-meta font-mono">{r.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.zones.map((z, i) => (
                      <span key={i} className="text-[10px] bg-cream text-mid px-2 py-1 rounded-lg font-mono border border-rule">{z}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{r.cashCollected}</td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{r.onlineCollected}</td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{r.cashDeposited}</td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{r.onlineDeposited}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${r.cashPending > 0 ? 'text-amber font-bold' : 'text-meta'}`}>Rs.{r.cashPending}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${r.onlinePending > 0 ? 'text-amber font-bold' : 'text-meta'}`}>Rs.{r.onlinePending}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${r.totalPending > 0 ? 'text-amber font-bold' : 'text-meta'}`}>Rs.{r.totalPending}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Settlements */}
      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
        <div className="p-5 border-b border-rule">
          <h2 className="text-ink font-serif tracking-tight">Recent Deposits</h2>
        </div>
        <table className="w-full">
          <thead><tr className="bg-cream">
            {['Date', 'Person', 'Cash', 'Online', 'Total', 'Notes'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-rule">
            {settlements.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-meta font-mono">No deposits recorded yet.</td></tr>
            )}
            {settlements.map(s => (
              <tr key={s.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-4 py-3 text-sm text-ink font-mono">{s.date}</td>
                <td className="px-4 py-3 font-bold text-sm text-ink font-mono">{s.deliveryPerson?.name}</td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{s.cashAmount}</td>
                <td className="px-4 py-3 text-sm text-ink font-mono">Rs.{s.onlineAmount}</td>
                <td className="px-4 py-3 font-bold text-sm text-amber font-mono">Rs.{s.cashAmount + s.onlineAmount}</td>
                <td className="px-4 py-3 text-sm text-mid font-mono">{s.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-[28rem] shadow-2xl border border-rule">
            <h2 className="text-lg font-serif text-ink mb-5 tracking-tight">Record Deposit</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Delivery Person</label>
                <select
                  value={newSettlement.deliveryPersonId}
                  onChange={e => setNewSettlement(p => ({ ...p, deliveryPersonId: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono"
                >
                  <option value="">Select person...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Date</label>
                <input
                  type="date"
                  value={newSettlement.date}
                  onChange={e => setNewSettlement(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Cash Deposit (Rs)</label>
                  <input
                    type="number"
                    value={newSettlement.cashAmount}
                    onChange={e => setNewSettlement(p => ({ ...p, cashAmount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Online Deposit (Rs)</label>
                  <input
                    type="number"
                    value={newSettlement.onlineAmount}
                    onChange={e => setNewSettlement(p => ({ ...p, onlineAmount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Notes</label>
                <input
                  value={newSettlement.notes}
                  onChange={e => setNewSettlement(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Partial deposit"
                  className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border-2 border-rule rounded-xl text-sm font-bold text-mid hover:bg-rule font-mono">Cancel</button>
              <button onClick={handleAddSettlement} className="flex-1 py-3 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-mid font-mono tracking-wide">Save Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
