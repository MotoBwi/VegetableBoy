'use client';
import { useState, useEffect } from 'react';
import { userApi, zoneApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newUser, setNewUser] = useState({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, zonesData] = await Promise.all([userApi.getAll(), zoneApi.getAll()]);
      setUsers(usersData);
      setZones(zonesData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const updated = await userApi.toggle(id);
      setUsers(prev => prev.map(u => u.id === id ? {...u, active: updated.active} : u));
      toast.success(`${updated.name} ${updated.active ? 'activated' : 'deactivated'}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = async () => {
    if (!newUser.name || !newUser.phone) {
      toast.error('Name aur phone bharo!');
      return;
    }
    try {
      const zone = zones.find(z => z.name === newUser.zone);
      const payload = { ...newUser, zoneId: zone?.id || 1 };
      if (editing) {
        const updated = await userApi.update(editing.id, payload);
        setUsers(prev => prev.map(u => u.id === editing.id ? updated : u));
        toast.success(`${updated.name} updated!`);
        setEditing(null);
      } else {
        const created = await userApi.create(payload);
        setUsers(prev => [...prev, created]);
        toast.success(`${created.name} added!`);
      }
      setNewUser({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''});
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setNewUser({
      name: user.name, phone: user.phone, image: user.image || '', zone: user.zone?.name || user.zone || 'Block A',
      block: user.block || '', building: user.building || '', flat: user.flat || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.remove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-meta font-mono">Loading users...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Users</h1>
          <p className="text-meta text-sm mt-1 font-mono">{users.filter(u => u.active).length} active users</p>
        </div>
        <button
          onClick={() => { setEditing(null); setNewUser({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''}); setShowModal(true); }}
          className="bg-ink text-cream px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mid transition-all font-mono tracking-wide">
          + Add User
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label: 'Total Users', value: users.length},
          {label: 'Active', value: users.filter(u => u.active).length},
          {label: 'Inactive', value: users.filter(u => !u.active).length},
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-4 shadow-sm border border-rule">
            <div className="text-2xl font-serif text-ink tracking-tight">{s.value}</div>
            <div className="text-sm text-meta font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-rule">
        <table className="w-full">
          <thead>
            <tr className="bg-cream">
              {['User', 'Phone', 'Address', 'Zone', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-meta uppercase tracking-wider font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {u.image ? (
                      <img src={u.image} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center text-sm font-bold text-ink font-mono">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-ink font-mono">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-mid font-mono">{u.phone}</td>
                <td className="px-5 py-4">
                  <div className="text-[10px] text-meta font-mono">
                    <div><span className="font-bold text-ink">Block:</span> {u.block}</div>
                    <div><span className="font-bold text-ink">Building:</span> {u.building}</div>
                    <div><span className="font-bold text-ink">Flat:</span> {u.flat}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="bg-cream text-mid text-[10px] font-bold px-2 py-1 rounded-lg font-mono border border-rule">{u.zone?.name || u.zone}</span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleActive(u.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all font-mono ${
                      u.active
                        ? 'bg-cream text-ink border-rule hover:bg-cream'
                        : 'bg-rule/50 text-mid border-rule hover:bg-rule'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-amber' : 'bg-mid'}`} />
                    {u.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u)} className="bg-cream text-ink px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-rule transition-all font-mono border border-rule">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="bg-rule/50 text-mid px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-rule transition-all font-mono border border-rule">
                      Delete
                    </button>
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
            <h2 className="text-lg font-serif text-ink mb-5 tracking-tight">{editing ? 'Edit User' : 'Add New User'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Full Name</label>
                <input value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} placeholder="e.g. Sohan Kumar" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Phone Number</label>
                <input value={newUser.phone} onChange={e => setNewUser(p => ({...p, phone: e.target.value}))} placeholder="e.g. 9876543210" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Image URL</label>
                <input value={newUser.image} onChange={e => setNewUser(p => ({...p, image: e.target.value}))} placeholder="https://..." className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
                {newUser.image && (
                  <img src={newUser.image} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-rule" />
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Delivery Zone</label>
                <select value={newUser.zone} onChange={e => setNewUser(p => ({...p, zone: e.target.value}))} className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono">
                  {zones.map(z => <option key={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Block</label>
                <input value={newUser.block} onChange={e => setNewUser(p => ({...p, block: e.target.value}))} placeholder="e.g. A-1" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Building Name</label>
                <input value={newUser.building} onChange={e => setNewUser(p => ({...p, building: e.target.value}))} placeholder="e.g. Sunrise Tower" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Flat No.</label>
                <input value={newUser.flat} onChange={e => setNewUser(p => ({...p, flat: e.target.value}))} placeholder="e.g. 204" className="w-full px-4 py-2.5 border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber bg-cream font-mono" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); setNewUser({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''}); }} className="flex-1 py-3 border-2 border-rule rounded-xl text-sm font-bold text-mid hover:bg-rule font-mono">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-mid font-mono tracking-wide">{editing ? 'Update User' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
