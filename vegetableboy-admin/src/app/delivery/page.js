'use client';
import { useState, useEffect } from 'react';
import { deliveryApi, zoneApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeliveryPage() {
  const [persons, setPersons] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', password: '', image: '', zoneIds: [], delivered: 0, pending: 0, failed: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [personsData, zonesData] = await Promise.all([deliveryApi.getAll(), zoneApi.getAll()]);
      setPersons(personsData);
      setZones(zonesData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const updated = await deliveryApi.toggle(id);
      setPersons(prev => prev.map(p => p.id === id ? { ...p, active: updated.active } : p));
      if (!updated.active) {
        toast.success(`${updated.name} off duty — unassigned orders ko Delivery Status mein dekh sakte ho!`);
      } else {
        toast.success(`${updated.name} on duty!`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleZone = (zoneId) => {
    setNewPerson(prev => {
      const ids = prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter(id => id !== zoneId)
        : [...prev.zoneIds, zoneId];
      return { ...prev, zoneIds: ids };
    });
  };

  const handleAdd = async () => {
    if (!newPerson.name || !newPerson.phone) {
      toast.error('Name aur phone bharo!');
      return;
    }
    if (!editing && (!newPerson.password || newPerson.password.length < 4)) {
      toast.error('Password at least 4 characters dalna hai!');
      return;
    }
    if (newPerson.zoneIds.length === 0) {
      toast.error('At least one zone select karo!');
      return;
    }
    try {
      const payload = { name: newPerson.name, phone: newPerson.phone, image: newPerson.image, zoneIds: newPerson.zoneIds };
      if (newPerson.password) payload.password = newPerson.password;
      if (editing) {
        const updated = await deliveryApi.update(editing.id, payload);
        setPersons(prev => prev.map(p => p.id === editing.id ? { ...updated, delivered: editing.delivered, pending: editing.pending, failed: editing.failed } : p));
        toast.success(`${updated.name} updated!`);
        setEditing(null);
      } else {
        const created = await deliveryApi.create(payload);
        setPersons(prev => [...prev, { ...created, delivered: 0, pending: 0, failed: 0 }]);
        toast.success(`${created.name} added!`);
      }
      setNewPerson({ name: '', phone: '', password: '', image: '', zoneIds: [], delivered: 0, pending: 0, failed: 0 });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (person) => {
    setEditing(person);
    const zoneIds = person.zoneDeliveryPersons?.map(zdp => zdp.zone.id) || [];
    setNewPerson({ name: person.name, phone: person.phone, password: '', image: person.image || '', zoneIds, delivered: person.delivered, pending: person.pending, failed: person.failed });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery person?')) return;
    try {
      await deliveryApi.remove(id);
      setPersons(prev => prev.filter(p => p.id !== id));
      toast.success('Delivery person deleted!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalDelivered = persons.reduce((a, p) => a + (p.delivered || 0), 0);
  const totalPending = persons.reduce((a, p) => a + (p.pending || 0), 0);
  const totalFailed = persons.reduce((a, p) => a + (p.failed || 0), 0);
  const activeCount = persons.filter(p => p.active !== false).length;

  if (loading) return <div className="p-6 text-meta font-mono">Loading delivery persons...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Delivery</h1>
          <p className="text-meta text-sm mt-1 font-mono">Delivery boys manage karo</p>
        </div>
        <button onClick={() => { setEditing(null); setNewPerson({ name: '', phone: '', password: '', image: '', zoneIds: [], delivered: 0, pending: 0, failed: 0 }); setShowModal(true); }}
          className="bg-ink text-cream px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mid transition-all font-mono tracking-wide">
          + Add Delivery Boy
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Boys', value: persons.length },
          { label: 'On Duty', value: activeCount },
          { label: 'Delivered', value: totalDelivered },
          { label: 'Pending', value: totalPending },
          { label: 'Failed', value: totalFailed },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
            <div className="text-2xl font-serif text-ink tracking-tight">{s.value}</div>
            <div className="text-sm text-meta font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
        <table className="w-full">
          <thead><tr className="bg-cream">
            {['Person', 'Phone', 'Zones', 'Delivered', 'Pending', 'Failed', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-rule">
            {persons.map(p => (
              <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center text-sm font-bold text-ink font-mono">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-ink font-mono">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-mid font-mono">{p.phone}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.zoneDeliveryPersons?.map(zdp => (
                      <span key={zdp.zone.id} className="text-[10px] bg-cream text-mid px-2 py-1 rounded-lg font-bold font-mono border border-rule">{zdp.zone.name}</span>
                    )) || (
                      <span className="text-[10px] text-meta font-mono">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-sm text-ink font-mono">{p.delivered || 0}</td>
                <td className="px-5 py-4 font-bold text-sm text-amber font-mono">{p.pending || 0}</td>
                <td className="px-5 py-4 font-bold text-sm text-red-500 font-mono">{p.failed || 0}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleStatus(p.id)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border font-mono ${p.active !== false ? 'bg-cream text-ink border-rule' : 'bg-rule/50 text-mid border-rule'}`}>
                    {p.active !== false ? 'On Duty' : 'Off Duty'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-cream text-ink px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono border border-rule hover:bg-rule transition-all">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-rule/50 text-mid px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono border border-rule hover:bg-rule transition-all">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink/30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-[28rem] shadow-2xl border border-rule">
            <h2 className="text-lg font-serif text-ink mb-5 tracking-tight">{editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Full Name</label>
                <input value={newPerson.name} onChange={e => setNewPerson(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Raju" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Phone</label>
                <input value={newPerson.phone} onChange={e => setNewPerson(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 9700001111" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">{editing ? 'New Password (optional)' : 'Password'}</label>
                <input type="password" value={newPerson.password} onChange={e => setNewPerson(p => ({ ...p, password: e.target.value }))} placeholder={editing ? 'Leave blank to keep current' : 'Min 4 characters'} className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Image URL</label>
                <input value={newPerson.image} onChange={e => setNewPerson(p => ({ ...p, image: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
                {newPerson.image && (
                  <img src={newPerson.image} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-rule" />
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Zones</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-rule rounded-xl p-3 bg-cream">
                  {zones.length === 0 && (
                    <p className="text-xs text-meta font-mono">No zones available.</p>
                  )}
                  {zones.map(z => (
                    <label key={z.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPerson.zoneIds.includes(z.id)}
                        onChange={() => toggleZone(z.id)}
                        className="w-4 h-4 accent-amber rounded"
                      />
                      <span className="text-sm font-mono text-ink">{z.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-meta mt-1 font-mono">{newPerson.zoneIds.length} zone{newPerson.zoneIds.length !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 py-3 border-2 border-rule rounded-xl text-sm font-bold text-mid hover:bg-rule font-mono">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-mid font-mono tracking-wide">{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
