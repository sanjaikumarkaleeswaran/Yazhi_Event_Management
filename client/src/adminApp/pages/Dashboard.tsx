import { motion } from 'framer-motion';
import { useAuth } from '../../shared/context/AuthContext';
import { Link } from 'react-router-dom';
import {
  DollarSign, Calendar, MessageSquare,
  CheckCircle, Users, Image, Star, ArrowRight, Plus,
  Activity, Zap, Bell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { useDashboard } from '../../shared/hooks/useDashboard';
import { useNotifications } from '../../shared/hooks/useNotifications';

const quickActions = [
  { label: 'Add Inquiry', href: '/admin/inquiries', color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'New Booking', href: '/admin/bookings', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Upload Photos', href: '/admin/gallery', color: 'bg-violet-500 hover:bg-violet-600' },
  { label: 'Add Package', href: '/admin/packages', color: 'bg-amber-500 hover:bg-amber-600' },
];

const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading || !dashboardData) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

  const notificationsList = notificationsData?.data?.notifications || [];
  const criticalWarnings = notificationsList.filter((n: any) => n.priority === 'Critical' && !n.isRead);
  const announcements = notificationsList.filter((n: any) => n.type === 'Announcement');
  const unreadCount = notificationsList.filter((n: any) => !n.isRead).length;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const dynamicStats = [
    { title: 'Total Revenue', value: formatCurrency(dashboardData.stats.totalRevenue), change: 'All Time', positive: true, icon: DollarSign, gradient: 'from-amber-400 to-yellow-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { title: 'Active Bookings', value: dashboardData.stats.activeBookings.toString(), change: 'Pending/Confirmed', positive: true, icon: Calendar, gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'New Inquiries', value: dashboardData.stats.newInquiries.toString(), change: 'Needs follow-up', positive: false, icon: MessageSquare, gradient: 'from-violet-400 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { title: 'Events Done', value: dashboardData.stats.eventsDone.toString(), change: 'Completed', positive: true, icon: CheckCircle, gradient: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Total Clients', value: dashboardData.stats.totalClients.toString(), change: 'Unique', positive: true, icon: Users, gradient: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' },
    { title: 'Gallery Items', value: dashboardData.stats.galleryItems.toString(), change: 'Published', positive: true, icon: Image, gradient: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { title: 'Testimonials', value: dashboardData.stats.testimonials.toString(), change: 'Published', positive: true, icon: Star, gradient: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
    { title: 'Unread Alerts', value: unreadCount.toString(), change: 'Action required', positive: false, icon: Bell, gradient: 'from-red-400 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Welcome Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #18181B 0%, #2d1f0e 100%)' }}>
        <div>
          <p className="text-white/50 text-sm mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/50 text-sm mt-1">Here's what's happening with your events today.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {quickActions.map(a => (
            <Link key={a.label} to={a.href}
              className={`${a.color} text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors hidden sm:block`}>
              {a.label}
            </Link>
          ))}
          <Link to="/admin/inquiries"
            className="sm:hidden flex items-center bg-[#C89B3C] hover:bg-[#b08630] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors gap-2">
            <Plus size={16} /> Quick Add
          </Link>
        </div>
      </motion.div>

      {/* Alert Feed */}
      {(criticalWarnings.length > 0 || announcements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalWarnings.slice(0, 2).map((warning: any) => (
            <motion.div key={warning._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-red-50/80 border border-red-200/50 backdrop-blur-md shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-red-900 truncate">{warning.title}</h4>
                <p className="text-xs text-red-700 mt-0.5">{warning.message}</p>
              </div>
            </motion.div>
          ))}
          {announcements.slice(0, 2).map((ann: any) => (
            <motion.div key={ann._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/50 backdrop-blur-md shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-amber-900 truncate">{ann.title}</h4>
                <p className="text-xs text-amber-700 mt-0.5">{ann.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dynamicStats.map((s, i) => (
          <motion.div key={s.title} custom={i} initial="hidden" animate="show" variants={fadeUp}
            className={`${card} p-5 hover:shadow-md transition-shadow cursor-default`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.text} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-semibold text-gray-400`}>
                {s.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className={`${card} p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-400 mt-0.5">Monthly revenue for 2026</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-gray-50 focus:outline-none">
              <option>2026</option><option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dashboardData.revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C89B3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#C89B3C" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className={`${card} p-6`}>
          <h2 className="font-bold text-gray-900 mb-1">Event Types</h2>
          <p className="text-sm text-gray-400 mb-6">Booking distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={dashboardData.eventTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {dashboardData.eventTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {dashboardData.eventTypes.map(e => (
              <div key={e.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                  <span className="text-gray-600">{e.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{e.value} Events</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Inquiries Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className={`${card} p-6`}>
          <h2 className="font-bold text-gray-900 mb-1">Weekly Inquiries</h2>
          <p className="text-sm text-gray-400 mb-5">Last 7 days</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dashboardData.inquiryData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Bar dataKey="count" fill="#18181B" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Upcoming Events</h2>
            <Link to="/admin/calendar" className="text-xs text-[#C89B3C] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.upcomingEvents.length > 0 ? dashboardData.upcomingEvents.map(ev => (
              <div key={ev._id} className={`pl-4 py-3 border-l-4 ${ev.status === 'Confirmed' ? 'border-l-[#C89B3C]' : 'border-l-blue-400'} bg-gray-50 rounded-r-xl`}>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{ev.clientName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.eventDate).toLocaleDateString()} · {ev.eventType}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {ev.status}
                </span>
              </div>
            )) : <p className="text-sm text-gray-400">No upcoming events.</p>}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Activity size={16} className="text-gray-300" />
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${a.color}`}>
                  <Zap size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug truncate">{a.text}</p>
                  <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{new Date(a.time).toLocaleDateString()}</span>
              </div>
            )) : <p className="text-sm text-gray-400">No recent activity.</p>}
          </div>
        </motion.div>
      </div>

      {/* Workforce & Operations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Availability Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className={`${card} p-6`}>
          <h2 className="font-bold text-gray-900 mb-1">Workforce Status</h2>
          <p className="text-sm text-gray-400 mb-6">Real-time staff availability</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-xl p-3 border border-green-100/50">
              <p className="text-xl font-bold text-green-600">{(dashboardData as any).teamStats?.available || 0}</p>
              <p className="text-[10px] text-green-700 font-semibold mt-1">Available</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100/50">
              <p className="text-xl font-bold text-amber-600">{(dashboardData as any).teamStats?.busy || 0}</p>
              <p className="text-[10px] text-amber-700 font-semibold mt-1">Busy</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-100/50">
              <p className="text-xl font-bold text-red-600">{(dashboardData as any).teamStats?.onLeave || 0}</p>
              <p className="text-[10px] text-red-700 font-semibold mt-1">On Leave</p>
            </div>
          </div>
          {(dashboardData as any).teamStats?.staffOnLeave?.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">On Leave Today</h3>
              <div className="space-y-2">
                {(dashboardData as any).teamStats.staffOnLeave.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-800">{m.firstName} {m.lastName}</span>
                    <span className="text-gray-400">{m.designation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Today's Assignments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className={`${card} p-6 lg:col-span-2`}>
          <h2 className="font-bold text-gray-900 mb-1">Today's Staff Assignments</h2>
          <p className="text-sm text-gray-400 mb-5">Events scheduled for today and staff on site</p>
          <div className="overflow-x-auto">
            {(dashboardData as any).teamStats?.todayAssignments?.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase font-semibold">
                    <th className="pb-3">Staff Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Booking Ref</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Venue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(dashboardData as any).teamStats.todayAssignments.map((a: any, idx: number) => (
                    <tr key={idx} className="text-gray-700">
                      <td className="py-2.5 font-semibold text-gray-900">{a.memberName}</td>
                      <td className="py-2.5 text-gray-500">{a.designation}</td>
                      <td className="py-2.5 font-mono text-gray-500">{a.bookingNumber}</td>
                      <td className="py-2.5">{a.clientName}</td>
                      <td className="py-2.5 truncate max-w-[120px]" title={a.venue}>{a.venue || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No staff assignments scheduled for today.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
