'use client';
import { useState, useEffect } from 'react';
import { zoneApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newZone, setNewZone] = useState({ name: '', area: '', person: '' });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await zoneApi.getAll();
      setZones(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newZone.name || !newZone.area) {
      toast.error('Zone name aur area bharo!');
      return;
    }
    try {
      if (editing) {
        const updated = await zoneApi.update(editing.id, newZone);
        setZones(prev => prev.map(z => z.id === editing.id ? { ...updated, _count: editing._count, deliveryPersons: editing.deliveryPersons } : z));
        toast.success(`${updated.name} updated!`);
        setEditing(null);
      } else {
        const created = await zoneApi.create(newZone);
        setZones(prev => [...prev, { ...created, _count: { users: 0 }, deliveryPersons: [] }]);
        toast.success(`${created.name} added!`);
      }
      setNewZone({ name: '', area: '', person: '' });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (zone) => {
    setEditing(zone);
    setNewZone({ name: zone.name, area: zone.area, person: zone.person || '' });
    setShowModal(true);
  };

  const totalUsers = zones.reduce((a, z) => a + (z._count?.users || 0), 0);

  if (loading) return <div className="p-6 text-gray-500">Loading zones...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Zones</h1>
          <p className="text-gray-500 text-sm mt-1">Delivery zones manage karo</p>
        </div>
        <button onClick={() => { setEditing(null); setNewZone({ name: '', area: '', person: '' }); setShowModal(true); }}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all">
          + Add Zone
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Zones', value: zones.length, color: 'border-purple-500' },
          { label: 'Total Users', value: totalUsers, color: 'border-blue-500' },
          { label: 'Avg Users/Zone', value: zones.length ? (totalUsers / zones.length).toFixed(1) : 0, color: 'border-green-500' },
        ].map(s => (
          <div key={s.label} className={`bg-gray-800 rounded-2xl p-4 shadow-sm border-t-4 ${s.color}`}>
            <div className="text-2xl font-black text-gray-100">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-gray-100">{zone.name}</div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(zone)} className="text-xs bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg">Edit</button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-3">{zone.area}</div>
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Delivery: <span className="font-bold">{zone.deliveryPersons?.[0]?.name || '—'}</span></div>
              <div className="text-sm text-gray-300">Users: <span className="font-bold">{zone._count?.users || 0}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-lg font-black text-gray-100 mb-5">{editing ? 'Edit Zone' : 'Add Zone'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Zone Name</label>
                <input value={newZone.name} onChange={e => setNewZone(z => ({ ...z, name: e.target.value }))} placeholder="e.g. Block D" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-purple-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Area</label>
                <input value={newZone.area} onChange={e => setNewZone(z => ({ ...z, area: e.target.value }))} placeholder="e.g. Sector 5" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-purple-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Delivery Person</label>
                <input value={newZone.person} onChange={e => setNewZone(z => ({ ...z, person: e.target.value }))} placeholder="e.g. Mahesh" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-purple-400 bg-gray-800" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 py-3 border-2 border-gray-700 rounded-xl text-sm font-bold text-gray-300">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold">{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
