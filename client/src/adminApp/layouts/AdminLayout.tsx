import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Image as ImageIcon, 
  Package, 
  Star, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Menu,
  Moon,
  X
} from 'lucide-react';
import clsx from 'clsx';

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Packages', href: '/admin/packages', icon: Package },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    { name: 'Team Members', href: '/admin/team', icon: Users },
    { name: 'Blog', href: '/admin/blog', icon: MessageSquare },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const breadcrumbName = navigation.find(n => n.href === location.pathname)?.name || 'Dashboard';

  return (
    <div className="admin-root flex min-h-screen bg-[#F7F8FA] overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={clsx(
        "admin-sidebar flex flex-col fixed inset-y-0 z-50 transform transition-transform duration-300 lg:translate-x-0 w-[260px] bg-[#1C1C1C]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-bold text-[#C89B3C]">Yazhi Admin</span>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 px-2">Menu</div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "admin-nav-item",
                    isActive && "active"
                  )}
                  title={item.name}
                >
                  <item.icon className="mr-3 shrink-0" size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="mr-3" size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="lg:hidden text-gray-500 hover:text-gray-900 mr-4"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex text-sm font-medium text-gray-500">
              Admin <span className="mx-2">/</span> <span className="text-gray-900">{breadcrumbName}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 w-64"
              />
            </div>
            
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Moon size={20} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center pl-4 border-l border-gray-200 space-x-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-gray-500 text-xs leading-tight">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F7F8FA] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
