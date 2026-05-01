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
        toast.success(`${updated.name} updated! ✅`);
        setEditing(null);
      } else {
        const created = await userApi.create(payload);
        setUsers(prev => [...prev, created]);
        toast.success(`${created.name} added! ✅`);
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
      toast.success('User deleted! ✅');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading users...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.filter(u => u.active).length} active users</p>
        </div>
        <button
          onClick={() => { setEditing(null); setNewUser({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''}); setShowModal(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
          + Add User
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label: 'Total Users', value: users.length, color: 'border-blue-500'},
          {label: 'Active', value: users.filter(u => u.active).length, color: 'border-green-500'},
          {label: 'Inactive', value: users.filter(u => !u.active).length, color: 'border-red-400'},
        ].map(s => (
          <div key={s.label} className={`bg-gray-800 rounded-2xl p-4 shadow-sm border-t-4 ${s.color}`}>
            <div className="text-2xl font-black text-gray-100">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              {['User', 'Phone', 'Address', 'Zone', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {u.image ? (
                      <img src={u.image} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-gray-100">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-300">{u.phone}</td>
                <td className="px-5 py-4">
                  <div className="text-xs text-gray-500">
                    <div><span className="font-bold text-gray-200">Block:</span> {u.block}</div>
                    <div><span className="font-bold text-gray-200">Building:</span> {u.building}</div>
                    <div><span className="font-bold text-gray-200">Flat:</span> {u.flat}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="bg-blue-900/30 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg">{u.zone?.name || u.zone}</span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleActive(u.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      u.active
                        ? 'bg-green-900/30 text-green-600 border-green-700 hover:bg-green-900/30'
                        : 'bg-red-900/30 text-red-500 border-red-700 hover:bg-red-900/30'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-500'}`} />
                    {u.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u)} className="bg-orange-900/30 text-orange-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-900/30 transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="bg-red-900/30 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900/30 transition-all">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-[28rem] shadow-2xl">
            <h2 className="text-lg font-black text-gray-100 mb-5">{editing ? 'Edit User' : 'Add New User'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label>
                <input value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} placeholder="e.g. Sohan Kumar" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Phone Number</label>
                <input value={newUser.phone} onChange={e => setNewUser(p => ({...p, phone: e.target.value}))} placeholder="e.g. 9876543210" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Image URL</label>
                <input value={newUser.image} onChange={e => setNewUser(p => ({...p, image: e.target.value}))} placeholder="https://..." className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
                {newUser.image && (
                  <img src={newUser.image} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-gray-700" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Delivery Zone</label>
                <select value={newUser.zone} onChange={e => setNewUser(p => ({...p, zone: e.target.value}))} className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800">
                  {zones.map(z => <option key={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Block</label>
                <input value={newUser.block} onChange={e => setNewUser(p => ({...p, block: e.target.value}))} placeholder="e.g. A-1" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Building Name</label>
                <input value={newUser.building} onChange={e => setNewUser(p => ({...p, building: e.target.value}))} placeholder="e.g. Sunrise Tower" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Flat No.</label>
                <input value={newUser.flat} onChange={e => setNewUser(p => ({...p, flat: e.target.value}))} placeholder="e.g. 204" className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-blue-400 bg-gray-800" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); setNewUser({name: '', phone: '', image: '', zone: 'Block A', block: '', building: '', flat: ''}); }} className="flex-1 py-3 border-2 border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-700">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">{editing ? 'Update User' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
