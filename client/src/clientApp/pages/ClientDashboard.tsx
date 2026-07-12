import { SEO } from '../../shared/components/SEO';
import { useAuth } from '../../shared/context/AuthContext';
import { ShoppingBag, Calendar, CreditCard } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ClientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <SEO title="Client Dashboard" description="Manage your Yazhi events" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Client'}. Here's an overview of your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Bookings" value="0" icon={ShoppingBag} color="blue" />
        <StatCard title="Upcoming Events" value="0" icon={Calendar} color="green" />
        <StatCard title="Pending Payments" value="₹0" icon={CreditCard} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <div className="text-center py-10 text-gray-500">
          <p>No bookings found.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
