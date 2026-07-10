import { BarChart2, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', revenue: 185000 }, { month: 'Feb', revenue: 220000 }, { month: 'Mar', revenue: 175000 },
  { month: 'Apr', revenue: 310000 }, { month: 'May', revenue: 280000 }, { month: 'Jun', revenue: 395000 }, { month: 'Jul', revenue: 450000 },
];

const customerGrowth = [
  { month: 'Jan', clients: 40 }, { month: 'Feb', clients: 55 }, { month: 'Mar', clients: 48 },
  { month: 'Apr', clients: 72 }, { month: 'May', clients: 68 }, { month: 'Jun', clients: 95 }, { month: 'Jul', clients: 110 },
];

const topPackages = [
  { name: 'Gold', value: 45, color: '#C89B3C' },
  { name: 'Platinum', value: 30, color: '#5A1E1E' },
  { name: 'Silver', value: 25, color: '#6B7280' },
];

const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6';

export default function Analytics() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Business performance insights and trends.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹24.5L', icon: DollarSign, change: '+12.5%', color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Bookings', value: '324', icon: Calendar, change: '+8.2%', color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Clients', value: '1,284', icon: Users, change: '+15.4%', color: 'text-violet-600 bg-violet-50' },
          { label: 'Avg. Event Value', value: '₹75k', icon: TrendingUp, change: '+4.1%', color: 'text-emerald-600 bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className={card}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{s.change} this year</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-bold text-gray-900 mb-5">Monthly Revenue (₹)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="revenue" fill="#C89B3C" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <h2 className="font-bold text-gray-900 mb-5">Customer Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={customerGrowth} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="clients" stroke="#18181B" strokeWidth={2.5} dot={{ fill: '#18181B', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <h2 className="font-bold text-gray-900 mb-5">Top Packages</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={topPackages} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {topPackages.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {topPackages.map(p => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                    <span className="text-sm text-gray-600">{p.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${card} flex items-center justify-center`}>
          <div className="text-center text-gray-400">
            <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">More reports coming soon</p>
            <p className="text-sm mt-1">Booking trends, location-wise analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
