'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  {href: '/dashboard', icon: '📊', label: 'Dashboard'},
  {href: '/orders', icon: '📦', label: 'Orders'},
  {href: '/orders/price', icon: '💰', label: 'Set Price'},
  {href: '/products', icon: '🥦', label: 'Products'},
  {href: '/users', icon: '👥', label: 'Users'},
  {href: '/delivery', icon: '🚴', label: 'Delivery'},
  {href: '/zones', icon: '📍', label: 'Zones'},
  {href: '/reports', icon: '📈', label: 'Reports'},
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
      toast.success('Logout successful! 👋');
      router.push('/login');
    } catch {
      toast.error('Logout failed!');
    }
  };

  return (
    <div className="w-56 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center text-xl">
            🥦
          </div>
          <div>
            <div className="text-white font-bold text-sm">Vegetable Boy</div>
            <div className="text-gray-500 text-xs tracking-widest">ADMIN</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(n => {
          const isActive = pathname === n.href || pathname.startsWith(n.href + '/');
          return (
            <Link key={n.href} href={n.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-gray-700 border-l-4 border-green-500 text-white font-bold'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
              }`}>
                <span className="text-lg">{n.icon}</span>
                <span className="text-sm">{n.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Admin Info + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm">
            👑
          </div>
          <div>
            <div className="text-white text-sm font-bold">{adminName}</div>
            <div className="text-gray-500 text-xs">Super Access</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-900/30 text-red-500 rounded-xl text-xs font-bold hover:bg-red-900/50 transition-all"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
