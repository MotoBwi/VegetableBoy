'use client';
import { useState, useEffect } from 'react';
import { priceApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PricePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      setLoading(true);
      const data = await priceApi.getAll();
      setProducts(data);
      const initialPrices = {};
      data.forEach(p => {
        initialPrices[p.id] = p.price1kg || '';
      });
      setPrices(initialPrices);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrice = (id, val) => {
    setPrices(prev => ({...prev, [id]: Number(val)}));
    setSaved(false);
  };

  const calc = (perKg, grams) => perKg ? Math.round(perKg * grams / 1000) : null;

  const handleSave = async () => {
    try {
      const unfilled = products.filter(p => !prices[p.id]);
      if (unfilled.length > 0) {
        toast.error(`${unfilled.length} products ka price set nahi hai!`);
        return;
      }
      await priceApi.save(prices);
      setSaved(true);
      toast.success('Prices saved! Push notification sent to all users');
      loadPrices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading products...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-100">Set Today's Prices</h1>
        <p className="text-gray-500 text-sm mt-1">Market rate daalo — app auto-calculate karega aur users ko notify karega</p>
      </div>

      <div className="bg-orange-900/30 border border-orange-700 rounded-2xl p-4 mb-6 flex gap-3 items-start">
        <span className="text-2xl"></span>
        <div>
          <div className="font-bold text-orange-600 text-sm">Price Setting Instructions</div>
          <div className="text-orange-500 text-xs mt-1">
            Har product ka price per kg daalo. App automatically 250g, 500g aur 1kg ka price calculate karega.
            Save karne ke baad saare users ko push notification jayega.
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-gray-200">Product Price Setting</h2>
          <span className="text-xs text-gray-500">Price per kg (Rs)</span>
        </div>

        <div className="divide-y divide-gray-700">
          {products.map(product => {
            const perKg = prices[product.id] || '';
            const p250 = calc(perKg, 250);
            const p500 = calc(perKg, 500);
            const p1kg = calc(perKg, 1000);

            return (
              <div key={product.id} className="p-5 grid grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-3">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-400">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-100">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price per kg (Rs)</label>
                  <input
                    type="number"
                    value={perKg}
                    onChange={e => handlePrice(product.id, e.target.value)}
                    placeholder="e.g. 80"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-bold text-gray-100 outline-none transition-all ${
                      perKg ? 'border-orange-400 bg-orange-900/30' : 'border-gray-700 bg-gray-700'
                    }`}
                  />
                </div>

                <div className="flex gap-2">
                  {[['250g', p250], ['500g', p500], ['1kg', p1kg]].map(([label, val]) => (
                    <div key={label} className={`flex-1 rounded-xl p-2 text-center border ${
                      val ? 'bg-green-900/30 border-green-700' : 'bg-gray-700 border-gray-700'
                    }`}>
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className={`text-sm font-bold mt-1 ${val ? 'text-green-600' : 'text-gray-300'}`}>
                        {val ? `Rs${val}` : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`px-8 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-lg ${
          saved
            ? 'bg-green-600 shadow-green-900/20'
            : 'bg-orange-500 hover:bg-orange-600 shadow-orange-900/20'
        }`}>
        {saved ? 'Prices Saved & Users Notified!' : 'Save Prices & Notify Users'}
      </button>
    </div>
  );
}
