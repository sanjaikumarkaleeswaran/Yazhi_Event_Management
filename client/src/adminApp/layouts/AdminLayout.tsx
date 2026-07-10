import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Calendar, Image as ImageIcon,
  Package, Star, Users, CreditCard, Settings, LogOut, Search,
  Bell, Menu, X, ChevronDown, FileText, BarChart2, Activity,
  UserCircle, ShoppingBag, Truck, Users2, BookOpen, Plus,
  ChevronRight, Zap
} from 'lucide-react';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare, badge: 3 },
      { name: 'Bookings', href: '/admin/bookings', icon: ShoppingBag },
      { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
    ]
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
      { name: 'Packages', href: '/admin/packages', icon: Package },
      { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    ]
  },
  {
    label: 'People',
    items: [
      { name: 'Clients', href: '/admin/clients', icon: Users2 },
      { name: 'Vendors', href: '/admin/vendors', icon: Truck },
      { name: 'Team', href: '/admin/team', icon: Users },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Reports', href: '/admin/reports', icon: FileText },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    ]
  },
  {
    label: 'Content',
    items: [
      { name: 'Blog CMS', href: '/admin/blog', icon: BookOpen },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Activity Logs', href: '/admin/activity', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  },
];

const notifications = [
  { id: 1, text: 'New inquiry from Arun Kumar', time: '2 min ago', unread: true, color: 'bg-blue-500' },
  { id: 2, text: 'Booking confirmed: Priya & Karthik Wedding', time: '1 hour ago', unread: true, color: 'bg-green-500' },
  { id: 3, text: 'Payment received: ₹45,000', time: '3 hours ago', unread: false, color: 'bg-yellow-500' },
];

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const breadcrumbName = navGroups
    .flatMap(g => g.items)
    .find(n => location.pathname === n.href || location.pathname.startsWith(n.href + '/'))?.name || 'Dashboard';

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 transition-transform duration-300 ease-in-out lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )} style={{ background: '#18181B' }}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-[#18181B]"
              style={{ background: 'linear-gradient(135deg, #C89B3C, #e8b84b)' }}>Y</div>
            <span className="text-white font-bold text-base tracking-tight">Yazhi Admin</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-white/40 hover:text-white/70 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6" style={{ scrollbarWidth: 'none' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                  return (
                    <Link key={item.name} to={item.href}
                      className={clsx(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                        isActive
                          ? 'text-[#C89B3C] bg-[#C89B3C]/10'
                          : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                      )}>
                      <div className="flex items-center space-x-3">
                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'text-[#C89B3C]' : ''} />
                        <span>{item.name}</span>
                      </div>
                      {'badge' in item && (item as any).badge > 0 && (
                        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-1">
          <Link to="/admin/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/[0.05] text-sm font-medium transition-all">
            <UserCircle size={16} strokeWidth={1.8} />
            <span>Profile</span>
          </Link>
          <button onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
            <LogOut size={16} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-700 p-1">
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center text-sm text-gray-400 space-x-1.5">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-medium">{breadcrumbName}</span>
            </nav>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search anything..." className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C]/50 w-56 transition-all" />
            </div>

            {/* Quick Add */}
            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all" title="Quick Add">
              <Plus size={18} />
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                      <span className="text-xs text-[#C89B3C] font-medium cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {notifications.map(n => (
                        <div key={n.id} className={clsx('p-4 flex items-start space-x-3 hover:bg-gray-50 cursor-pointer', n.unread && 'bg-blue-50/30')}>
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.color}`} />
                          <div>
                            <p className="text-sm text-gray-800 font-medium leading-snug">{n.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-100">
                      <span className="text-xs text-[#C89B3C] font-medium cursor-pointer hover:underline">View all notifications</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C89B3C, #5A1E1E)' }}>
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 leading-tight capitalize">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-400 capitalize">{user?.role || 'Administrator'}</p>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { navigate('/admin/profile'); setShowProfile(false); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                        <UserCircle size={15} className="text-gray-400" /><span>My Profile</span>
                      </button>
                      <button onClick={() => { navigate('/admin/settings'); setShowProfile(false); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                        <Settings size={15} className="text-gray-400" /><span>Settings</span>
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-gray-100">
                      <button onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all">
                        <LogOut size={15} /><span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
