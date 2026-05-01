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

  if (loading) return <div className="p-6 text-meta font-mono">Loading zones...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Zones</h1>
          <p className="text-meta text-sm mt-1 font-mono">Delivery zones manage karo</p>
        </div>
        <button onClick={() => { setEditing(null); setNewZone({ name: '', area: '', person: '' }); setShowModal(true); }}
          className="bg-ink text-cream px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mid transition-all font-mono tracking-wide">
          + Add Zone
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Zones', value: zones.length },
          { label: 'Total Users', value: totalUsers },
          { label: 'Avg Users/Zone', value: zones.length ? (totalUsers / zones.length).toFixed(1) : 0 },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
            <div className="text-2xl font-serif text-ink tracking-tight">{s.value}</div>
            <div className="text-sm text-meta font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="bg-surface rounded-2xl p-5 shadow-sm border border-rule">
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-ink tracking-tight text-lg">{zone.name}</div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(zone)} className="text-[10px] bg-cream text-ink px-2 py-1 rounded-lg font-mono border border-rule hover:bg-rule transition-all">Edit</button>
              </div>
            </div>
            <div className="text-[10px] text-meta mb-3 font-mono">{zone.area}</div>
            <div className="space-y-2">
              <div className="text-sm text-mid font-mono">Delivery: <span className="font-bold text-ink">{zone.deliveryPersons?.[0]?.name || '—'}</span></div>
              <div className="text-sm text-mid font-mono">Users: <span className="font-bold text-ink">{zone._count?.users || 0}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink/30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-96 shadow-2xl border border-rule">
            <h2 className="text-lg font-serif text-ink mb-5 tracking-tight">{editing ? 'Edit Zone' : 'Add Zone'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Zone Name</label>
                <input value={newZone.name} onChange={e => setNewZone(z => ({ ...z, name: e.target.value }))} placeholder="e.g. Block D" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Area</label>
                <input value={newZone.area} onChange={e => setNewZone(z => ({ ...z, area: e.target.value }))} placeholder="e.g. Sector 5" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Delivery Person</label>
                <input value={newZone.person} onChange={e => setNewZone(z => ({ ...z, person: e.target.value }))} placeholder="e.g. Mahesh" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
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
