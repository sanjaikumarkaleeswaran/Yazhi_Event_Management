import { motion } from 'framer-motion';
import { useAuth } from '../../shared/context/AuthContext';
import { Link } from 'react-router-dom';
import {
  DollarSign, Calendar, MessageSquare,
  CheckCircle, Users, Image, Star, Clock, ArrowRight, Plus,
  Activity, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { useDashboard } from '../../shared/hooks/useDashboard';

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
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading || !dashboardData) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

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
    { title: 'Pending Tasks', value: dashboardData.stats.pendingTasks.toString(), change: 'To do', positive: true, icon: Clock, gradient: 'from-red-400 to-red-500', bg: 'bg-red-50', text: 'text-red-600' },
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
    </div>
  );
}
