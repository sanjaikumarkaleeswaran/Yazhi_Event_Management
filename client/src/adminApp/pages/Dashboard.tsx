import { useAuth } from '../../shared/context/AuthContext';
import { SEO } from '../../shared/components/SEO';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const revenueData = [
  { name: 'Jan', current: 4000, previous: 2400 },
  { name: 'Feb', current: 3000, previous: 1398 },
  { name: 'Mar', current: 2000, previous: 9800 },
  { name: 'Apr', current: 2780, previous: 3908 },
  { name: 'May', current: 1890, previous: 4800 },
  { name: 'Jun', current: 2390, previous: 3800 },
  { name: 'Jul', current: 3490, previous: 4300 },
];

const inquiriesData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 28 },
  { name: 'Sat', value: 35 },
  { name: 'Sun', value: 42 },
];

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: "Total Revenue", value: "₹24,50,000", change: "+12.5%", isPositive: true, icon: DollarSign, color: "bg-green-100 text-green-600" },
    { title: "Active Bookings", value: "32", change: "+4.2%", isPositive: true, icon: Calendar, color: "bg-blue-100 text-blue-600" },
    { title: "New Inquiries", value: "148", change: "-2.1%", isPositive: false, icon: MessageSquare, color: "bg-yellow-100 text-yellow-600" },
    { title: "Completed Events", value: "124", change: "+18.4%", isPositive: true, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SEO title="Dashboard" description="Admin Dashboard" canonicalUrl="/admin" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="flex items-center px-4 py-2 bg-[#C89B3C] text-white rounded-md text-sm font-medium hover:bg-[#b08630] transition-colors shadow-sm">
            <Calendar size={16} className="mr-2" />
            View Calendar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="admin-card !p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 rotate-180" />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 admin-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Compare current and previous year</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C89B3C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                />
                <Area type="monotone" dataKey="previous" stroke="#9CA3AF" fillOpacity={1} fill="url(#colorPrev)" strokeWidth={2} />
                <Area type="monotone" dataKey="current" stroke="#C89B3C" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart / Activity */}
        <div className="admin-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">Inquiries (Last 7 Days)</h3>
          </div>
          <div className="h-[200px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inquiriesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="#1C1C1C" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-4 border-t border-gray-100 pt-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3 shrink-0 mt-0.5">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New inquiry from Priya Raj</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center"><Clock size={12} className="mr-1" /> 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
