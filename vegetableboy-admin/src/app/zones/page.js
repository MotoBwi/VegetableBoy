'use client';
import { useState, useEffect } from 'react';
import { zoneApi, deliveryApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newZone, setNewZone] = useState({ name: '', area: '', deliveryPersonIds: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesData, personsData] = await Promise.all([
        zoneApi.getAll(),
        deliveryApi.getAll(),
      ]);
      setZones(zonesData.zones || zonesData || []);
      setDeliveryPersons(personsData.persons || personsData || []);
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
        const updated = await zoneApi.update(editing.id, {
          name: newZone.name,
          area: newZone.area,
          deliveryPersonIds: newZone.deliveryPersonIds,
        });
        setZones(prev => prev.map(z => z.id === editing.id ? updated : z));
        toast.success(`${updated.name} updated!`);
        setEditing(null);
      } else {
        const created = await zoneApi.create({
          name: newZone.name,
          area: newZone.area,
          deliveryPersonIds: newZone.deliveryPersonIds,
        });
        setZones(prev => [...prev, { ...created, _count: { users: 0 }, zoneDeliveryPersons: [] }]);
        toast.success(`${created.name} added!`);
      }
      setNewZone({ name: '', area: '', deliveryPersonIds: [] });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (zone) => {
    setEditing(zone);
    const selectedIds = zone.zoneDeliveryPersons?.map(zdp => zdp.deliveryPersonId) || [];
    setNewZone({ name: zone.name, area: zone.area, deliveryPersonIds: selectedIds });
    setShowModal(true);
  };

  const toggleDeliveryPerson = (dpId) => {
    setNewZone(prev => {
      const current = prev.deliveryPersonIds || [];
      if (current.includes(dpId)) {
        return { ...prev, deliveryPersonIds: current.filter(id => id !== dpId) };
      }
      return { ...prev, deliveryPersonIds: [...current, dpId] };
    });
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
        <button onClick={() => { setEditing(null); setNewZone({ name: '', area: '', deliveryPersonIds: [] }); setShowModal(true); }}
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
              <div className="text-sm text-mid font-mono">
                Delivery:
                <span className="font-bold text-ink">
                  {zone.zoneDeliveryPersons?.length > 0
                    ? zone.zoneDeliveryPersons.map(zdp => zdp.deliveryPerson?.name).join(', ')
                    : '—'}
                </span>
              </div>
              <div className="text-sm text-mid font-mono">Users: <span className="font-bold text-ink">{zone._count?.users || 0}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink/30 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-[28rem] shadow-2xl border border-rule">
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
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Delivery Persons</label>
                <div className="border-2 border-rule rounded-xl p-3 bg-cream max-h-40 overflow-y-auto">
                  {deliveryPersons.length === 0 ? (
                    <div className="text-sm text-meta font-mono">No delivery persons available.</div>
                  ) : (
                    deliveryPersons.map(dp => (
                      <label key={dp.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-cream/50">
                        <input
                          type="checkbox"
                          checked={newZone.deliveryPersonIds?.includes(dp.id)}
                          onChange={() => toggleDeliveryPerson(dp.id)}
                          className="w-4 h-4 accent-ink"
                        />
                        <span className="text-sm text-ink font-mono">{dp.name}</span>
                      </label>
                    ))
                  )}
                </div>
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
