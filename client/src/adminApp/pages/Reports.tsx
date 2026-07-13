import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Calendar, TrendingUp, Users, DollarSign, Store, Activity, 
  BarChart3, Target, CalendarDays, Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, Line, Legend 
} from 'recharts';
import { 
  useAnalyticsOverview, 
  useBookingAnalytics, 
  useInquiryAnalytics, 
  useClientAnalytics, 
  useVendorAnalytics 
} from '../../shared/hooks/useAnalytics';

const COLORS = ['#C89B3C', '#18181B', '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState('This Year');

  // Simple date logic for filters
  const getFilterDates = () => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case 'Today': start.setHours(0, 0, 0, 0); break;
      case 'Last 7 Days': start.setDate(start.getDate() - 7); break;
      case 'Last 30 Days': start.setDate(start.getDate() - 30); break;
      case 'This Month': start.setDate(1); break;
      case 'This Year': start.setMonth(0, 1); break;
      case 'All Time': return undefined;
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const filters = getFilterDates();

  const { data: overviewResp, isLoading: loadOverview } = useAnalyticsOverview(filters);
  const { data: bookingResp, isLoading: loadBookings } = useBookingAnalytics(filters);
  const { data: inquiryResp, isLoading: loadInquiries } = useInquiryAnalytics(filters);
  const { data: clientResp, isLoading: loadClients } = useClientAnalytics(filters);
  const { data: vendorResp, isLoading: loadVendors } = useVendorAnalytics(filters);

  const overview = overviewResp?.data;
  const bookingsData = bookingResp?.data;
  const inquiriesData = inquiryResp?.data;
  const clientsData = clientResp?.data;
  const vendorsData = vendorResp?.data;

  const exportCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return alert('No data to export');
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass = 'text-[#C89B3C]' }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-gray-50 ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
  );

  const formatCurrency = (val: number) => `₹${val?.toLocaleString('en-IN')}`;

  const renderOverview = () => {
    if (loadOverview || loadBookings) return <div className="py-20 text-center text-gray-400"><Activity className="animate-pulse mx-auto mb-2" /> Loading Overview...</div>;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(overview?.totalRevenue)} icon={DollarSign} colorClass="text-emerald-500" />
          <StatCard title="Confirmed Bookings" value={overview?.totalBookings} subtext="Active & Completed" icon={Calendar} colorClass="text-[#C89B3C]" />
          <StatCard title="Active Inquiries" value={overview?.openInquiries} subtext={`${overview?.conversionRate}% Conv. Rate`} icon={Target} colorClass="text-blue-500" />
          <StatCard title="Client Base" value={overview?.activeClients} icon={Users} colorClass="text-violet-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Revenue & Bookings Trend</h3>
              <button onClick={() => exportCSV(bookingsData?.byMonth || [], 'Revenue_Trend')} className="text-gray-400 hover:text-[#C89B3C]"><Download size={16} /></button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingsData?.byMonth || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C89B3C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#C89B3C" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#18181B" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Event Type Distribution</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingsData?.byType || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(bookingsData?.byType || []).map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBookings = () => {
    if (loadBookings) return <div className="py-20 text-center text-gray-400">Loading...</div>;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Revenue by Event Type</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsData?.byType || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={val => `₹${val/1000}k`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#C89B3C" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Booking Status Overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingsData?.byStatus || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" label>
                    {(bookingsData?.byStatus || []).map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderInquiries = () => {
    if (loadInquiries) return <div className="py-20 text-center text-gray-400">Loading...</div>;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Inquiry Conversion Funnel</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inquiriesData?.funnel || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Lead Source Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inquiriesData?.bySource || []} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                    {(inquiriesData?.bySource || []).map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderClientsVendors = (data: any, title: string, load: boolean) => {
    if (load) return <div className="py-20 text-center text-gray-400">Loading...</div>;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">{title === 'Clients' ? 'Client Growth' : 'Category Distribution'}</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {title === 'Clients' ? (
                  <AreaChart data={data?.growth || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="clients" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                ) : (
                  <BarChart data={data?.byCategory || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F43F5E" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">{title === 'Clients' ? 'Status Distribution' : 'Top Assigned Vendors'}</h3>
            <div className="h-72">
              {title === 'Vendors' ? (
                <div className="space-y-4">
                  {data?.topVendors?.map((v: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#C89B3C]">{v.assignments}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Assignments</p>
                      </div>
                    </div>
                  ))}
                  {!data?.topVendors?.length && <p className="text-sm text-gray-400 text-center py-10">No vendor assignments found.</p>}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.byStatus || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                      {(data?.byStatus || []).map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time business intelligence and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 cursor-pointer shadow-sm"
            >
              {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year', 'All Time'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2d2d] transition-colors shadow-sm">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-gray-100 pb-1 no-scrollbar">
        {['Overview', 'Bookings', 'Inquiries', 'Clients', 'Vendors'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab ? 'bg-white text-[#C89B3C] shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab === 'Overview' && <BarChart3 size={15} />}
            {tab === 'Bookings' && <CalendarDays size={15} />}
            {tab === 'Inquiries' && <TrendingUp size={15} />}
            {tab === 'Clients' && <Users size={15} />}
            {tab === 'Vendors' && <Store size={15} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Bookings' && renderBookings()}
            {activeTab === 'Inquiries' && renderInquiries()}
            {activeTab === 'Clients' && renderClientsVendors(clientsData, 'Clients', loadClients)}
            {activeTab === 'Vendors' && renderClientsVendors(vendorsData, 'Vendors', loadVendors)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
