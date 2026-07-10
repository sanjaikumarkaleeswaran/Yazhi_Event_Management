import { motion } from 'framer-motion';
import { useAuth } from '../../shared/context/AuthContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, MessageSquare,
  CheckCircle, Users, Image, Star, Clock, ArrowRight, Plus,
  Activity, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 185000, bookings: 8 },
  { month: 'Feb', revenue: 220000, bookings: 10 },
  { month: 'Mar', revenue: 175000, bookings: 7 },
  { month: 'Apr', revenue: 310000, bookings: 14 },
  { month: 'May', revenue: 280000, bookings: 12 },
  { month: 'Jun', revenue: 395000, bookings: 18 },
  { month: 'Jul', revenue: 450000, bookings: 21 },
];

const inquiryData = [
  { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 15 },
  { day: 'Thu', count: 25 }, { day: 'Fri', count: 31 }, { day: 'Sat', count: 42 }, { day: 'Sun', count: 38 },
];

const eventTypes = [
  { name: 'Weddings', value: 45, color: '#C89B3C' },
  { name: 'Birthday', value: 20, color: '#5A1E1E' },
  { name: 'Corporate', value: 18, color: '#3B82F6' },
  { name: 'Others', value: 17, color: '#6B7280' },
];

const recentActivity = [
  { id: 1, type: 'inquiry', text: 'New inquiry from Arun Kumar', sub: 'Wedding · Tiruppur', time: '5 min ago', color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'booking', text: 'Booking confirmed: Priya & Karthik', sub: 'Wedding · Oct 15, 2026', time: '1 hour ago', color: 'bg-green-100 text-green-600' },
  { id: 3, type: 'payment', text: 'Payment received ₹45,000', sub: 'From: Ramesh V.', time: '3 hours ago', color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, type: 'review', text: 'New 5★ testimonial added', sub: 'Divya & Suresh Wedding', time: '5 hours ago', color: 'bg-purple-100 text-purple-600' },
  { id: 5, type: 'gallery', text: '12 photos uploaded', sub: 'Kannan Birthday Event', time: 'Yesterday', color: 'bg-pink-100 text-pink-600' },
];

const upcomingEvents = [
  { id: 1, title: 'Arun & Priya Wedding', date: 'Jul 20, 2026', type: 'Wedding', status: 'Confirmed', color: 'border-l-[#C89B3C]' },
  { id: 2, title: 'Karthik Birthday', date: 'Jul 25, 2026', type: 'Birthday', status: 'Pending', color: 'border-l-blue-400' },
  { id: 3, title: 'TechCorp Annual Meet', date: 'Aug 02, 2026', type: 'Corporate', status: 'Confirmed', color: 'border-l-green-400' },
];

const stats = [
  { title: 'Total Revenue', value: '₹24.5L', change: '+12.5%', positive: true, icon: DollarSign, gradient: 'from-amber-400 to-yellow-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { title: 'Active Bookings', value: '32', change: '+4.2%', positive: true, icon: Calendar, gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { title: 'New Inquiries', value: '148', change: '-2.1%', positive: false, icon: MessageSquare, gradient: 'from-violet-400 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { title: 'Events Done', value: '524', change: '+18.4%', positive: true, icon: CheckCircle, gradient: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { title: 'Total Clients', value: '1,284', change: '+8.7%', positive: true, icon: Users, gradient: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' },
  { title: 'Gallery Items', value: '3,612', change: '+22.3%', positive: true, icon: Image, gradient: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { title: 'Testimonials', value: '294', change: '+5.1%', positive: true, icon: Star, gradient: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
  { title: 'Pending Tasks', value: '17', change: '-3 today', positive: true, icon: Clock, gradient: 'from-red-400 to-red-500', bg: 'bg-red-50', text: 'text-red-600' },
];

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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
        {stats.map((s, i) => (
          <motion.div key={s.title} custom={i} initial="hidden" animate="show" variants={fadeUp}
            className={`${card} p-5 hover:shadow-md transition-shadow cursor-default`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.text} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              <Pie data={eventTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {eventTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {eventTypes.map(e => (
              <div key={e.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                  <span className="text-gray-600">{e.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{e.value}%</span>
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
            <BarChart data={inquiryData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
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
            {upcomingEvents.map(ev => (
              <div key={ev.id} className={`pl-4 py-3 border-l-4 ${ev.color} bg-gray-50 rounded-r-xl`}>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{ev.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ev.date} · {ev.type}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <Activity size={16} className="text-gray-300" />
          </div>
          <div className="space-y-4">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${a.color}`}>
                  <Zap size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug truncate">{a.text}</p>
                  <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
