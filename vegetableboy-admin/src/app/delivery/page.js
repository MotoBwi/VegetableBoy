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
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', image: '', zone: 'Block A', delivered: 0, pending: 0 });

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
      toast.success(`${updated.name} ${updated.active ? 'on duty' : 'off duty'}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = async () => {
    if (!newPerson.name || !newPerson.phone) {
      toast.error('Name aur phone bharo!');
      return;
    }
    try {
      const zone = zones.find(z => z.name === newPerson.zone);
      const payload = { name: newPerson.name, phone: newPerson.phone, image: newPerson.image, zoneId: zone?.id || 1 };
      if (editing) {
        const updated = await deliveryApi.update(editing.id, payload);
        setPersons(prev => prev.map(p => p.id === editing.id ? { ...updated, delivered: editing.delivered, pending: editing.pending } : p));
        toast.success(`${updated.name} updated!`);
        setEditing(null);
      } else {
        const created = await deliveryApi.create(payload);
        setPersons(prev => [...prev, { ...created, delivered: 0, pending: 0 }]);
        toast.success(`${created.name} added!`);
      }
      setNewPerson({ name: '', phone: '', image: '', zone: 'Block A', delivered: 0, pending: 0 });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (person) => {
    setEditing(person);
    setNewPerson({ name: person.name, phone: person.phone, image: person.image || '', zone: person.zone?.name || person.zone || 'Block A', delivered: person.delivered, pending: person.pending });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery person?')) return;
    try {
      await deliveryApi.remove(id);
      setPersons(prev => prev.filter(p => p.id !== id));
      toast.success('Delivery person deleted! ✅');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalDelivered = persons.reduce((a, p) => a + (p.delivered || 0), 0);
  const totalPending = persons.reduce((a, p) => a + (p.pending || 0), 0);
  const activeCount = persons.filter(p => p.active !== false).length;

  if (loading) return <div className="p-6 text-gray-500">Loading delivery persons...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Delivery</h1>
          <p className="text-gray-500 text-sm mt-1">Delivery boys manage karo</p>
        </div>
        <button onClick={() => { setEditing(null); setNewPerson({ name: '', phone: '', image: '', zone: 'Block A', delivered: 0, pending: 0 }); setShowModal(true); }}
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all">
          + Add Delivery Boy
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Boys', value: persons.length, color: 'border-blue-500' },
          { label: 'On Duty', value: activeCount, color: 'border-green-500' },
          { label: 'Delivered', value: totalDelivered, color: 'border-green-400' },
          { label: 'Pending', value: totalPending, color: 'border-yellow-400' },
        ].map(s => (
          <div key={s.label} className={`bg-gray-800 rounded-2xl p-4 shadow-sm border-t-4 ${s.color}`}>
            <div className="text-2xl font-black text-gray-100">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-700">
            {['Person', 'Phone', 'Zone', 'Delivered', 'Pending', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-700">
            {persons.map(p => (
              <tr key={p.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-orange-900/30 rounded-full flex items-center justify-center text-sm font-bold text-orange-400">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-gray-100">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-300">{p.phone}</td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg font-bold">{p.zone?.name || p.zone}</span>
                </td>
                <td className="px-5 py-4 font-bold text-sm text-green-600">{p.delivered || 0}</td>
                <td className="px-5 py-4 font-bold text-sm text-yellow-600">{p.pending || 0}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleStatus(p.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${p.active !== false ? 'bg-green-900/30 text-green-600 border-green-700' : 'bg-red-900/30 text-red-500 border-red-700'}`}>
                    {p.active !== false ? 'On Duty' : 'Off Duty'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-900/30 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-[28rem] shadow-2xl">
            <h2 className="text-lg font-black text-gray-100 mb-5">{editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label>
                <input value={newPerson.name} onChange={e => setNewPerson(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Raju" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-orange-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Phone</label>
                <input value={newPerson.phone} onChange={e => setNewPerson(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 9700001111" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-orange-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Image URL</label>
                <input value={newPerson.image} onChange={e => setNewPerson(p => ({ ...p, image: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-orange-400 bg-gray-800" />
                {newPerson.image && (
                  <img src={newPerson.image} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-gray-700" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Zone</label>
                <select value={newPerson.zone} onChange={e => setNewPerson(p => ({ ...p, zone: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-orange-400 bg-gray-800">
                  {zones.map(z => <option key={z.id}>{z.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 py-3 border-2 border-gray-700 rounded-xl text-sm font-bold text-gray-300">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold">{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
