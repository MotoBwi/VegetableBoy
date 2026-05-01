'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  {href: '/dashboard', icon: 'Db', label: 'Dashboard'},
  {href: '/orders', icon: 'Or', label: 'Orders'},
  {href: '/orders/price', icon: 'Pr', label: 'Set Price'},
  {href: '/products', icon: 'Pd', label: 'Products'},
  {href: '/users', icon: 'Us', label: 'Users'},
  {href: '/delivery', icon: 'Dl', label: 'Delivery'},
  {href: '/delivery-payments', icon: 'Py', label: 'Payments'},
  {href: '/zones', icon: 'Zn', label: 'Zones'},
  {href: '/reports', icon: 'Rp', label: 'Reports'},
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    authApi.me()
      .then(data => { if (data?.admin) setAdminName(data.admin.username); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success('Logout successful!');
      router.push('/login');
    } catch {
      toast.error('Logout failed!');
    }
  };

  return (
    <div className="w-56 bg-cream min-h-screen flex flex-col border-r border-rule">
      {/* Logo */}
      <div className="p-5 border-b border-rule">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center text-xs font-bold text-ink tracking-wider">
            VB
          </div>
          <div>
            <div className="text-ink text-sm font-serif tracking-wide leading-tight">Vegetable Boy</div>
            <div className="text-meta text-[10px] tracking-[0.2em] uppercase font-mono">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(n => {
          const isActive = pathname === n.href;
          return (
            <Link key={n.href} href={n.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'bg-ink text-cream font-bold'
                  : 'text-mid hover:bg-rule hover:text-ink border-l-2 border-transparent'
              }`}>
                <span className="text-[10px] font-mono tracking-wider w-5 text-center opacity-60">{n.icon}</span>
                <span className="text-sm font-mono">{n.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Admin Info + Logout */}
      <div className="p-4 border-t border-rule">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center text-xs font-bold text-ink">
            A
          </div>
          <div>
            <div className="text-ink text-sm font-bold font-mono">{adminName}</div>
            <div className="text-meta text-[10px] font-mono">Super Access</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-rule/50 text-ink rounded-lg text-xs font-bold hover:bg-rule transition-all font-mono tracking-wide"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
