import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, X, UserCircle, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

export const ClientLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'My Bookings', href: '/client/bookings', icon: ShoppingBag },
    { name: 'Profile', href: '/client/profile', icon: UserCircle },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
      
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-[#C89B3C] font-bold text-lg">Yazhi Client</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/client' && location.pathname.startsWith(item.href));
            return (
              <Link key={item.name} to={item.href} className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-[#C89B3C]/10 text-[#C89B3C]' : 'text-gray-600 hover:bg-gray-50'
              )}>
                <item.icon size={18} className={isActive ? 'text-[#C89B3C]' : 'text-gray-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center space-x-3 text-red-600 px-3 py-2 hover:bg-red-50 rounded-lg w-full text-sm font-medium">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 justify-between">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-gray-500">
            <Menu size={24} />
          </button>
          <div className="ml-auto flex items-center space-x-3">
             <span className="text-sm font-medium text-gray-700">Welcome, {user?.name || 'Client'}</span>
             <div className="w-8 h-8 rounded-full bg-[#C89B3C] text-white flex items-center justify-center font-bold text-sm">
               {user?.name?.charAt(0) || 'C'}
             </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
