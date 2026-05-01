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

  if (loading) return <div className="p-6 text-meta font-mono">Loading products...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-ink tracking-tight">Set Today's Prices</h1>
        <p className="text-meta text-sm mt-1 font-mono">Market rate daalo — app auto-calculate karega aur users ko notify karega</p>
      </div>

      <div className="bg-amber/10 border border-amber/30 rounded-2xl p-4 mb-6 flex gap-3 items-start">
        <span className="text-2xl text-amber font-mono">!</span>
        <div>
          <div className="font-bold text-ink text-sm font-mono">Price Setting Instructions</div>
          <div className="text-mid text-xs mt-1 font-mono">
            Har product ka price per kg daalo. App automatically 250g, 500g aur 1kg ka price calculate karega.
            Save karne ke baad saare users ko push notification jayega.
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden mb-5 border border-rule">
        <div className="p-5 border-b border-rule flex justify-between items-center">
          <h2 className="text-ink font-serif tracking-tight">Product Price Setting</h2>
          <span className="text-[10px] text-meta font-mono">Price per kg (Rs)</span>
        </div>

        <div className="divide-y divide-rule">
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
                    <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-sm font-bold text-mid border border-rule">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-ink font-mono">{product.name}</div>
                    <div className="text-[10px] text-meta font-mono">{product.category}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-meta mb-1 block font-mono">Price per kg (Rs)</label>
                  <input
                    type="number"
                    value={perKg}
                    onChange={e => handlePrice(product.id, e.target.value)}
                    placeholder="e.g. 80"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-bold text-ink outline-none transition-all font-mono ${
                      perKg ? 'border-amber bg-amber/10' : 'border-rule bg-cream'
                    }`}
                  />
                </div>

                <div className="flex gap-2">
                  {[['250g', p250], ['500g', p500], ['1kg', p1kg]].map(([label, val]) => (
                    <div key={label} className={`flex-1 rounded-xl p-2 text-center border font-mono ${
                      val ? 'bg-cream text-ink border-rule' : 'bg-cream/50 border-rule/50'
                    }`}>
                      <div className="text-[10px] text-meta">{label}</div>
                      <div className={`text-sm font-bold mt-1 ${val ? 'text-ink' : 'text-mid'}`}>
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
        className={`px-8 py-4 rounded-2xl font-bold text-cream text-base transition-all shadow-lg font-mono tracking-wide ${
          saved
            ? 'bg-ink'
            : 'bg-ink hover:bg-mid'
        }`}>
        {saved ? 'Prices Saved & Users Notified!' : 'Save Prices & Notify Users'}
      </button>
    </div>
  );
}
