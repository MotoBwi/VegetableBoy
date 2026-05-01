'use client';
import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newProduct, setNewProduct] = useState({name: '', image: '', category: 'Staple'});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailable = async (id) => {
    try {
      const updated = await productApi.toggle(id);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      toast.success(`${updated.name} ${updated.available ? 'available' : 'hidden'}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = async () => {
    if (!newProduct.name) {
      toast.error('Product name bharo!');
      return;
    }
    try {
      if (editing) {
        const updated = await productApi.update(editing.id, {
          ...newProduct,
          price250: editing.price250 || 0,
          price500: editing.price500 || 0,
          price1kg: editing.price1kg || 0,
          available: editing.available,
        });
        setProducts(prev => prev.map(p => p.id === editing.id ? updated : p));
        toast.success(`${updated.name} updated! ✅`);
        setEditing(null);
      } else {
        const created = await productApi.create({...newProduct, available: true, price250: 0, price500: 0, price1kg: 0});
        setProducts(prev => [...prev, created]);
        toast.success(`${created.name} added! ✅`);
      }
      setNewProduct({name: '', image: '', category: 'Staple'});
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setNewProduct({name: product.name, image: product.image || '', category: product.category});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.remove(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted! ✅');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading products...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setNewProduct({name: '', image: '', category: 'Staple'}); setShowModal(true); }}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
          + Add Product
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              {['Product', 'Category', '250g', '500g', '1kg', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-400">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-gray-100">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded-lg">{p.category}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-300">₹{p.price250}</td>
                <td className="px-5 py-4 text-sm text-gray-300">₹{p.price500}</td>
                <td className="px-5 py-4 text-sm text-gray-300">₹{p.price1kg}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleAvailable(p.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      p.available
                        ? 'bg-green-900/30 text-green-600 border-green-700 hover:bg-green-900/30'
                        : 'bg-red-900/30 text-red-500 border-red-700 hover:bg-red-900/30'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${p.available ? 'bg-green-500' : 'bg-red-500'}`} />
                    {p.available ? 'Available' : 'Hidden'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-900/30 transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-900/30 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900/30 transition-all">
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
            <h2 className="text-lg font-black text-gray-100 mb-5">{editing ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Product Name</label>
                <input
                  value={newProduct.name}
                  onChange={e => setNewProduct(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. Karela"
                  className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-green-400 bg-gray-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Image URL</label>
                <input
                  value={newProduct.image}
                  onChange={e => setNewProduct(p => ({...p, image: e.target.value}))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-green-400 bg-gray-800"
                />
                {newProduct.image && (
                  <img src={newProduct.image} alt="Preview" className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-700" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Category</label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct(p => ({...p, category: e.target.value}))}
                  className="w-full px-4 py-2.5 border-2 border-gray-700 rounded-xl text-sm text-white outline-none focus:border-green-400 bg-gray-800">
                  {['Staple', 'Leafy', 'Spicy', 'Seasonal', 'Root'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditing(null); setNewProduct({name: '', image: '', category: 'Staple'}); }}
                className="flex-1 py-3 border-2 border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                {editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
